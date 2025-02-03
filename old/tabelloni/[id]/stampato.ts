import { defineEventHandler, readBody } from "h3"
import { getConnection } from "../../../utils/db"

export default defineEventHandler(async (event) => {
	const connection = await getConnection()

	try {
		const id = event.context.params?.id
		const { stampato } = await readBody(event)

		await connection.execute(
			"UPDATE tabelloni SET stampato = ? WHERE id_tabellone = ?",
			[stampato, id]
		)

		return { success: true }
	} catch (error) {
		console.error("Errore nell'aggiornamento dello stato di stampa:", error)
		throw error
	} finally {
		connection.release()
	}
})
