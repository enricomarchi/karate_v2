import { defineEventHandler } from "h3"
import { getConnection } from "../../../utils/db"
import { RowDataPacket } from "mysql2"

interface Tabellone extends RowDataPacket {
	id_tabellone: number
	stato: string
}

export default defineEventHandler(async (event) => {
	const method = event.method
	const id = event.context.params?.id
	let connection

	try {
		connection = await getConnection()

		if (method === "GET") {
			if (!id) {
				throw new Error("ID tabellone non specificato")
			}

			const [rows] = await connection.execute<Tabellone[]>(
				"SELECT * FROM vista_tabelloni WHERE id_tabellone = ?",
				[id]
			)
			if (rows.length === 0) {
				throw new Error("Tabellone non trovato")
			}

			// Aggiungi la classifica al risultato
			const [classifica] = await connection.execute(
				`SELECT cf.id_atleta, cf.posizione, 
                 a.cognome, a.nome, s.nome_societa
                 FROM classifiche_finali cf
                 JOIN atleti a ON cf.id_atleta = a.id_atleta
                 JOIN societa s ON a.id_societa = s.id_societa
                 WHERE cf.id_tabellone = ?
                 ORDER BY cf.posizione, a.cognome, a.nome`,
				[id]
			)

			return {
				...rows[0],
				classifica: classifica,
			}
		}

		if (method === "DELETE") {
			await connection.beginTransaction()

			try {
				const [tabellone] = await connection.execute<Tabellone[]>(
					"SELECT stato FROM tabelloni WHERE id_tabellone = ?",
					[id]
				)

				if (!tabellone.length) {
					throw new Error("Tabellone non trovato")
				}

				if (tabellone[0].stato !== "BOZZA") {
					throw new Error(
						"Solo i tabelloni in BOZZA possono essere eliminati"
					)
				}

				await connection.execute(
					"DELETE FROM tabelloni WHERE id_tabellone = ?",
					[id]
				)

				await connection.commit()
				return { success: true }
			} catch (error) {
				await connection.rollback()
				throw error
			}
		}

		throw new Error(`Metodo ${method} non supportato`)
	} catch (error: unknown) {
		console.error("Errore nella gestione del tabellone:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		}
	} finally {
		if (connection) connection.release()
	}
})
