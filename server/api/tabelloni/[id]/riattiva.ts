import { defineEventHandler } from "h3"
import { getConnection } from "../../../utils/db"
import { RowDataPacket } from "mysql2"

interface Tabellone extends RowDataPacket {
	stato: string
}

export default defineEventHandler(async (event) => {
	if (event.method !== "POST") {
		return { statusCode: 405, body: "Method Not Allowed" }
	}

	const id = event.context.params?.id
	let connection

	try {
		connection = await getConnection()
		await connection.beginTransaction()

		// Verifica che il tabellone sia completato
		const [rows] = await connection.execute<Tabellone[]>(
			"SELECT stato FROM tabelloni WHERE id_tabellone = ?",
			[id]
		)

		if (!rows.length) {
			throw new Error("Tabellone non trovato")
		}

		if (rows[0].stato !== "COMPLETATO") {
			throw new Error(
				"Solo i tabelloni completati possono essere riattivati"
			)
		}

		// Prima trova il numero della prova finale
		const [proveRows] = await connection.execute<RowDataPacket[]>(
			"SELECT MAX(numero_prova) as ultima_prova FROM prove WHERE id_tabellone = ?",
			[id]
		)

		if (!proveRows.length) {
			throw new Error("Nessuna prova trovata per questo tabellone")
		}

		const ultimaProva = proveRows[0].ultima_prova

		// Riattiva il tabellone
		await connection.execute(
			"UPDATE tabelloni SET stato = 'ATTIVO', ora_fine_effettiva = NULL WHERE id_tabellone = ?",
			[id]
		)

		// Riattiva l'ultima prova
		await connection.execute(
			"UPDATE prove SET stato = 'IN_CORSO' WHERE id_tabellone = ? AND numero_prova = ?",
			[id, ultimaProva]
		)

		await connection.commit()
		return { success: true }
	} catch (error) {
		if (connection) await connection.rollback()
		console.error("Errore nella riattivazione del tabellone:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		}
	} finally {
		if (connection) connection.release()
	}
})
