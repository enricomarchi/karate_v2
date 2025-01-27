import { defineEventHandler } from "h3"
import { getConnection } from "../../../utils/db"

export default defineEventHandler(async (event) => {
	if (event.method !== "POST") throw new Error("Method Not Allowed")

	const id_tabellone = event.context.params?.id
	let connection

	try {
		connection = await getConnection()
		await connection.beginTransaction()

		// Elimina tutte le prove esistenti
		await connection.execute("DELETE FROM prove WHERE id_tabellone = ?", [
			id_tabellone,
		])

		// Rimuovi il riferimento alla configurazione
		await connection.execute(
			"UPDATE tabelloni SET configurazione_id = NULL WHERE id_tabellone = ?",
			[id_tabellone]
		)

		await connection.commit()
		return { success: true }
	} catch (error) {
		if (connection) await connection.rollback()
		console.error("Errore nella rimozione della configurazione:", error)
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Errore sconosciuto",
		}
	} finally {
		if (connection) connection.release()
	}
})
