import mysql from "mysql2/promise"
import dotenv from "dotenv"
import {
	defineEventHandler,
	getQuery,
	readBody,
	assertMethod,
	createError,
} from "h3"
import {
	findTabelloniByIscrizione,
	ricalcolaConfigurazione,
} from "../../utils/tabelloniUtils.ts"

dotenv.config()

const dbConfig = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	connectTimeout: 10000,
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

		connection = await mysql.createConnection(dbConfig)

		if (method === "GET") {
			const { id } = query
			if (id) {
				const [rows] = await connection.execute(
					"SELECT * FROM vista_atleti WHERE id_atleta = ?",
					[id]
				)
				return rows[0]
			} else {
				const [rows] = await connection.execute(
					"SELECT * FROM vista_atleti"
				)
				return rows
			}
		} else if (method === "POST") {
			const {
				cognome,
				nome,
				sesso,
				anno_nascita,
				cintura_id,
				dan,
				peso_kg,
				id_societa,
			} = body

			const [result] = await connection.execute(
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

			if (result.affectedRows === 0) {
				throw new Error("Inserimento atleta fallito")
			}

			return { id_atleta: result.insertId, ...body }
		} else if (method === "PUT") {
			const { id } = query
			const {
				cognome,
				nome,
				sesso,
				anno_nascita,
				cintura_id,
				dan,
				peso_kg,
				id_societa,
			} = body

			// Ottieni le categorie originali dell'atleta prima della modifica
			const [categorieOriginali] = await connection.execute(
				"SELECT DISTINCT id_categoria FROM iscrizioni WHERE id_atleta = ?",
				[id]
			)

			await connection.execute(
				"UPDATE atleti SET cognome = ?, nome = ?, sesso = ?, anno_nascita = ?, cintura_id = ?, dan = ?, peso_kg = ?, id_societa = ? WHERE id_atleta = ?",
				[
					cognome || null,
					nome || null,
					sesso || null,
					anno_nascita || null,
					cintura_id || null,
					dan || null,
					peso_kg || null,
					id_societa || null, // Aggiunto questo parametro che mancava
					id, // Questo è il WHERE id_atleta = ?
				]
			)

			// Ottieni tutte le iscrizioni dell'atleta
			const [iscrizioni] = await connection.execute(
				"SELECT * FROM iscrizioni WHERE id_atleta = ?",
				[id]
			)

			// Per ogni iscrizione, trova la categoria appropriata e imposta manuale = true
			for (const iscrizione of iscrizioni) {
				const [categoriaAppropriata] = await connection.execute(
					`SELECT c.id_categoria
					 FROM categorie c
					 JOIN categorie_cinture cc ON c.id_categoria = cc.id_categoria
					 JOIN categorie_fasce cf ON c.id_categoria = cf.id_categoria
					 JOIN fasce_eta fe ON cf.id_fascia = fe.id_fascia
					 WHERE c.id_disciplina = ?
					 AND (c.sesso = ? OR c.sesso = 'MIXED')
					 AND cc.id_cintura = ?
					 AND ? BETWEEN fe.anno_nascita_min AND fe.anno_nascita_max
					 AND (c.peso_min IS NULL OR ? >= c.peso_min)
					 AND (c.peso_max IS NULL OR ? <= c.peso_max)
					 LIMIT 1`,
					[
						iscrizione.id_disciplina,
						sesso,
						cintura_id,
						anno_nascita,
						peso_kg || 0,
						peso_kg || 999,
					]
				)

				// Se la categoria è cambiata
				if (
					categoriaAppropriata.length > 0 &&
					categoriaAppropriata[0].id_categoria !==
						iscrizione.id_categoria
				) {
					// Controlla se ci sono pool nella nuova categoria
					const [poolInfo] = await connection.execute(
						`SELECT pool, COUNT(*) as count
						 FROM iscrizioni 
						 WHERE id_categoria = ? AND pool IS NOT NULL
						 GROUP BY pool
						 ORDER BY count, pool`,
						[categoriaAppropriata[0].id_categoria]
					)

					let poolToAssign = null
					if (poolInfo && poolInfo.length > 0) {
						// Usa la pool con meno iscritti
						poolToAssign = poolInfo[0].pool
					}

					// Aggiorna l'iscrizione con la nuova categoria, pool e imposta manuale = true
					await connection.execute(
						"UPDATE iscrizioni SET id_categoria = ?, confermata = true, pool = ?, manuale = true WHERE id_iscrizione = ?",
						[
							categoriaAppropriata[0].id_categoria,
							poolToAssign,
							iscrizione.id_iscrizione,
						]
					)
				} else {
					// Anche se la categoria non cambia, imposta comunque manuale = true
					await connection.execute(
						"UPDATE iscrizioni SET manuale = true WHERE id_iscrizione = ?",
						[iscrizione.id_iscrizione]
					)
				}
			}

			// Raccogli tutte le categorie coinvolte (originali e nuove)
			const categorieInteressate = new Set()
			categorieOriginali.forEach((c) =>
				categorieInteressate.add(c.id_categoria)
			)

			// Dopo aver aggiornato le iscrizioni, ottieni le nuove categorie
			const [nuoveCategorie] = await connection.execute(
				"SELECT DISTINCT id_categoria FROM iscrizioni WHERE id_atleta = ?",
				[id]
			)
			nuoveCategorie.forEach((c) =>
				categorieInteressate.add(c.id_categoria)
			)

			// Dopo aver trovato i tabelloni da aggiornare, imposta stampato = false
			for (const idCategoria of categorieInteressate) {
				const tabelloni = await findTabelloniByIscrizione(
					connection,
					idCategoria
				)

				for (const idTabellone of tabelloni) {
					await connection.execute(
						"UPDATE tabelloni SET stampato = false WHERE id_tabellone = ?",
						[idTabellone]
					)
					await ricalcolaConfigurazione(connection, idTabellone)
				}
			}

			// Ottieni i dati aggiornati dell'atleta dalla vista
			const [rows] = await connection.execute(
				"SELECT * FROM vista_atleti WHERE id_atleta = ?",
				[id]
			)

			return rows[0]
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
		throw createError({ statusCode: 500, message: error.message })
	} finally {
		if (connection) {
			await connection.end()
		}
	}
})
