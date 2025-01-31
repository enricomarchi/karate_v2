import {
	defineEventHandler,
	getQuery,
	readBody,
	assertMethod,
	createError,
} from "h3"
import { getConnection, sanitizeForDatabase } from "../utils/db"
import type {
	AtletaRow,
	MySQLError,
	Atleta,
	IscrizioneRow,
} from "~/types/global"
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise"
import {
	findTabelloniByIscrizione,
	ricalcolaConfigurazione,
} from "../utils/tabelloniUtils"

// Definisci l'interfaccia per le iscrizioni
// Rimuovi la definizione locale di IscrizioneRow poiché ora è importata dai tipi globali

interface IscrizioneQuery extends RowDataPacket {
	id_iscrizione: number
	id_categoria: number
	id_disciplina: string
}

export default defineEventHandler(async (event) => {
	const method = event.node.req.method
	const query = getQuery(event)
	let body = {}

	if (method !== "GET") {
		body = await readBody(event)
	}

	let connection

	try {
		assertMethod(event, ["GET", "POST", "PUT", "DELETE"])

		connection = await getConnection()

		if (method === "GET") {
			const { id } = query
			if (id) {
				const [rows] = await connection.execute<AtletaRow[]>(
					"SELECT * FROM dettaglio_atleti WHERE id_atleta = ?",
					[id]
				)
				return rows[0]
			} else {
				const [rows] = await connection.execute<AtletaRow[]>(
					"SELECT * FROM dettaglio_atleti"
				)
				return rows
			}
		} else if (method === "POST") {
			const athleteData = body as Atleta
			const {
				cognome,
				nome,
				sesso,
				anno_nascita,
				cintura_id,
				dan,
				peso_kg,
				id_societa,
			} = athleteData

			const [result] = await connection.execute<ResultSetHeader>(
				"INSERT INTO atleti (cognome, nome, sesso, anno_nascita, cintura_id, dan, peso_kg, id_societa) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
				[
					cognome || null,
					nome || null,
					sesso || null,
					anno_nascita || null,
					cintura_id || null,
					dan || null,
					peso_kg || null,
					id_societa || null,
				]
			)

			if (!result.affectedRows) {
				throw new Error("Inserimento atleta fallito")
			}

			return { id_atleta: result.insertId, ...athleteData }
		} else if (method === "PUT") {
			const { id } = query
			const athleteData = sanitizeForDatabase(body) as Atleta

			// Estrarre e sanitizzare tutti i valori
			const updateData = {
				cognome: athleteData.cognome,
				nome: athleteData.nome,
				sesso: athleteData.sesso,
				anno_nascita: athleteData.anno_nascita,
				cintura_id: athleteData.cintura_id,
				dan: athleteData.dan,
				peso_kg: athleteData.peso_kg,
				id_societa: athleteData.id_societa,
			}

			// Sanitizza ogni valore individualmente
			const sanitizedValues = Object.values(updateData).map((v) =>
				sanitizeForDatabase(v)
			)

			// Aggiorna l'atleta con i valori sanitizzati
			await connection.execute(
				`UPDATE atleti 
				SET cognome = ?, nome = ?, sesso = ?, anno_nascita = ?, 
					cintura_id = ?, dan = ?, peso_kg = ?, id_societa = ? 
				WHERE id_atleta = ?`,
				[...sanitizedValues, id]
			)

			// Ottieni le categorie appropriate per l'atleta utilizzando la vista
			const [categorieAppropriate] = await connection.execute<
				AtletaRow[]
			>("SELECT * FROM categoria_per_atleta WHERE id_atleta = ?", [id])

			// Ottieni le iscrizioni attuali con il tipo corretto
			const [iscrizioniAttuali] = await connection.execute<
				IscrizioneRow[]
			>(
				"SELECT id_iscrizione, id_categoria, id_disciplina FROM iscrizioni WHERE id_atleta = ?",
				[id]
			)

			// Per ogni iscrizione esistente, verifica se la categoria è ancora appropriata
			for (const iscrizione of iscrizioniAttuali) {
				const categoriaAppropriata = categorieAppropriate.find(
					(cat) => cat.id_disciplina === iscrizione.id_disciplina
				)

				if (
					categoriaAppropriata?.id_categoria && // Verifica che esista id_categoria
					iscrizione.id_categoria && // Verifica che esista id_categoria nell'iscrizione
					categoriaAppropriata.id_categoria !==
						iscrizione.id_categoria
				) {
					// Aggiorna l'iscrizione con la nuova categoria e imposta manuale = true
					await connection.execute(
						`UPDATE iscrizioni 
                        SET id_categoria = ?, manuale = true, confermata = true 
                        WHERE id_iscrizione = ?`,
						[
							categoriaAppropriata.id_categoria,
							iscrizione.id_iscrizione,
						]
					)

					// Ricalcola i tabelloni interessati
					const tabelloni = await findTabelloniByIscrizione(
						connection,
						iscrizione.id_categoria
					)
					for (const idTabellone of tabelloni) {
						await connection.execute(
							"UPDATE tabelloni SET stampato = false WHERE id_tabellone = ?",
							[idTabellone]
						)
						await ricalcolaConfigurazione(connection, idTabellone)
					}
				}
			}

			// Restituisci l'atleta aggiornato
			const [updatedAthlete] = await connection.execute<AtletaRow[]>(
				"SELECT * FROM dettaglio_atleti WHERE id_atleta = ?",
				[id]
			)
			return updatedAthlete[0]
		} else if (method === "DELETE") {
			const { id } = query
			if (!id) {
				throw new Error("ID mancante")
			}

			// Prima elimina le iscrizioni associate
			await connection.execute(
				"DELETE FROM iscrizioni WHERE id_atleta = ?",
				[id]
			)

			// Poi elimina l'atleta
			await connection.execute("DELETE FROM atleti WHERE id_atleta = ?", [
				id,
			])

			return { id }
		}
	} catch (error) {
		console.error("Errore nella gestione degli atleti:", error)
		const mysqlError = error as MySQLError
		throw createError({
			statusCode: mysqlError.statusCode || 500,
			message: mysqlError.message,
		})
	} finally {
		if (connection) {
			await connection.release()
		}
	}
})
