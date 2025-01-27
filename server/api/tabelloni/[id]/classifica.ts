import { defineEventHandler, readBody, createError } from "h3"
import { getConnection } from "../../../utils/db"
import { RowDataPacket } from "mysql2"

interface ClassificaItem {
	id_atleta: number
	posizione: number
}

interface Tabellone extends RowDataPacket {
	id_tabellone: number
	stato: string
}

export default defineEventHandler(async (event) => {
	if (event.method !== "POST") {
		throw createError({
			statusCode: 405,
			message: "Method not allowed",
		})
	}

	const id = event.context.params?.id
	const body = await readBody(event)
	const classifica: ClassificaItem[] = body.classifica

	if (!Array.isArray(classifica) || classifica.length === 0) {
		throw createError({
			statusCode: 400,
			message: "Formato classifica non valido o vuoto",
		})
	}

	let connection

	try {
		connection = await getConnection()
		await connection.beginTransaction()

		// Verifica che il tabellone sia nello stato corretto
		const [tabellone] = await connection.execute<Tabellone[]>(
			"SELECT stato FROM tabelloni WHERE id_tabellone = ?",
			[id]
		)

		if (!tabellone.length || tabellone[0].stato !== "ATTIVO") {
			throw new Error(
				"La classifica può essere definita solo per tabelloni ATTIVI"
			)
		}

		// Elimina eventuali classifiche precedenti
		await connection.execute(
			"DELETE FROM classifiche_finali WHERE id_tabellone = ?",
			[id]
		)

		// Inserisci la nuova classifica
		for (const item of classifica) {
			await connection.execute(
				`INSERT INTO classifiche_finali 
                (id_tabellone, id_atleta, posizione) 
                VALUES (?, ?, ?)`,
				[id, item.id_atleta, item.posizione]
			)
		}

		// Trova e completa la prova finale
		const [prove] = await connection.execute(
			"UPDATE prove SET stato = 'COMPLETATA', ora_fine_effettiva = CURRENT_TIMESTAMP WHERE id_tabellone = ? AND is_finale = 1",
			[id]
		)

		// Completa il tabellone
		await connection.execute(
			"UPDATE tabelloni SET stato = 'COMPLETATO', ora_fine_effettiva = CURRENT_TIMESTAMP WHERE id_tabellone = ?",
			[id]
		)

		await connection.commit()
		return { success: true }
	} catch (error) {
		if (connection) await connection.rollback()
		throw createError({
			statusCode: 500,
			message:
				error instanceof Error ? error.message : "Errore sconosciuto",
		})
	} finally {
		if (connection) connection.release()
	}
})
