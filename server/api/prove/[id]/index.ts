import { defineEventHandler } from "h3"
import { getConnection } from "../../../utils/db"
import { RowDataPacket } from "mysql2/promise"

interface Prova extends RowDataPacket {
	id_prova: number
	nome_prova: string
	stato: string
}

export default defineEventHandler(async (event) => {
	const id = event.context.params?.id
	let connection

	try {
		connection = await getConnection()
		const [rows] = await connection.execute<Prova[]>(
			"SELECT * FROM vista_prove WHERE id_prova = ?",
			[id]
		)

		if (!rows || rows.length === 0) {
			throw new Error("Prova non trovata")
		}

		return rows[0]
	} catch (error) {
		console.error("Errore nel recupero della prova:", error)
		return { success: false, error: (error as Error).message }
	} finally {
		if (connection) connection.release()
	}
})
