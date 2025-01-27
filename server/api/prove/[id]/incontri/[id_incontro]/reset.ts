import { defineEventHandler } from "h3"
import { getConnection } from "../../../../../utils/db"
import { RowDataPacket } from "mysql2/promise"

interface IncontroRow extends RowDataPacket {
	id_incontro: number
}

export default defineEventHandler(async (event) => {
	if (event.method !== "POST") {
		return { statusCode: 405, body: "Method Not Allowed" }
	}

	const params = event.context.params || {}
	const id_incontro = params.id_incontro

	if (!id_incontro) {
		throw new Error("ID incontro non fornito")
	}

	let connection

	try {
		connection = await getConnection()

		const [rows] = await connection.execute<IncontroRow[]>(
			"SELECT id_incontro FROM incontri_prova WHERE id_incontro = ?",
			[id_incontro]
		)

		if (!rows.length) {
			throw new Error("Incontro non trovato")
		}

		await connection.execute(
			"DELETE FROM voti_incontro WHERE id_incontro = ?",
			[id_incontro]
		)

		return { success: true }
	} catch (error) {
		console.error("Errore nel reset dell'incontro:", error)
		return { success: false, error: (error as Error).message }
	} finally {
		if (connection) connection.release()
	}
})
