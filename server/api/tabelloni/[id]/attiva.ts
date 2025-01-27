import { defineEventHandler } from "h3"
import { getConnection } from "../../../utils/db"
import { RowDataPacket } from "mysql2/promise"

interface TabelloneRow extends RowDataPacket {
	stato: string
	// ... altri campi necessari
}

export default defineEventHandler(async (event) => {
	const id = event.context.params?.id
	let connection

	try {
		connection = await getConnection()
		await connection.beginTransaction()

		// Verifica stato attuale
		const [rows] = await connection.execute<TabelloneRow[]>(
			"SELECT stato FROM tabelloni WHERE id_tabellone = ?",
			[id]
		)

		if (!rows.length) {
			throw new Error("Tabellone non trovato")
		}

		if (rows[0].stato !== "BOZZA") {
			throw new Error("Solo i tabelloni in BOZZA possono essere attivati")
		}

		// Aggiorna SOLO lo stato a ATTIVO, senza toccare l'ora_inizio_effettiva
		await connection.execute(
			"UPDATE tabelloni SET stato = 'ATTIVO' WHERE id_tabellone = ?",
			[id]
		)

		await connection.commit()
		return { success: true }
	} catch (error) {
		if (connection) await connection.rollback()
		console.error("Errore nell'attivazione del tabellone:", error)
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Errore sconosciuto",
		}
	} finally {
		if (connection) connection.release()
	}
})
