import { defineEventHandler } from "h3"
import { getConnection } from "../../../utils/db"
import { RowDataPacket } from "mysql2/promise"

interface TabelloneRow extends RowDataPacket {
	stato: string
	prove_non_completate: number
}

export default defineEventHandler(async (event) => {
	if (event.method !== "POST") {
		return { statusCode: 405, body: "Method Not Allowed" }
	}

	const params = event.context.params || {}
	const id = params.id

	if (!id) {
		throw new Error("ID tabellone non fornito")
	}

	let connection

	try {
		connection = await getConnection()

		// Verifica che il tabellone sia attivo e che tutte le prove siano completate
		const [rows] = await connection.execute<TabelloneRow[]>(
			`SELECT t.stato,
             (SELECT COUNT(*) FROM prove p 
              WHERE p.id_tabellone = t.id_tabellone 
              AND p.stato != 'COMPLETATA') as prove_non_completate
             FROM tabelloni t
             WHERE t.id_tabellone = ?`,
			[id]
		)

		if (!rows.length) {
			throw new Error("Tabellone non trovato")
		}

		if (rows[0].stato !== "ATTIVO") {
			throw new Error(
				"Il tabellone può essere completato solo se è attivo"
			)
		}

		if (rows[0].prove_non_completate > 0) {
			throw new Error(
				"Tutte le prove devono essere completate prima di completare il tabellone"
			)
		}

		// Completa il tabellone
		await connection.execute(
			`UPDATE tabelloni 
            SET stato = 'COMPLETATO',
                ora_fine_effettiva = CURRENT_TIMESTAMP 
            WHERE id_tabellone = ?`,
			[id]
		)

		return { success: true }
	} catch (error) {
		console.error("Errore nel completamento del tabellone:", error)
		return { success: false, error: (error as Error).message }
	} finally {
		if (connection) connection.release()
	}
})
