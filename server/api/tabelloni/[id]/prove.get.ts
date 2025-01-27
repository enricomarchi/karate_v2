import { defineEventHandler } from "h3"
import { getConnection } from "../../../utils/db"

export default defineEventHandler(async (event) => {
	const id = event.context.params?.id ?? ""
	let connection

	try {
		connection = await getConnection()
		const [rows] = await connection.execute(
			"SELECT * FROM vista_prove WHERE id_tabellone = ? ORDER BY numero_prova",
			[id]
		)
		return rows
	} catch (error) {
		console.error("Errore nel recupero delle prove:", error)
		return { success: false, error: (error as Error).message }
	} finally {
		if (connection) connection.release() // Cambiato da end() a release()
	}
})
