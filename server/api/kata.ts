import { defineEventHandler } from "h3"
import { getConnection } from "../utils/db"
import type { KataRow } from "~/types/global"

export default defineEventHandler(async (event) => {
	const connection = await getConnection()

	try {
		const [rows] = await connection.execute<KataRow[]>(
			"SELECT * FROM kata_shotokan ORDER BY livello, nome"
		)
		return rows
	} catch (error) {
		console.error("Errore nel recupero dei kata:", error)
		throw error
	} finally {
		connection.release()
	}
})
