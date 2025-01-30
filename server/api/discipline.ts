import { getConnection } from "../utils/db"
import { defineEventHandler } from "h3"

export default defineEventHandler(async (event) => {
	const conn = await getConnection()
	try {
		const [rows] = await conn.query("SELECT * FROM discipline")
		return rows
	} catch (error) {
		console.error("Errore nel recupero delle discipline:", error)
		throw error
	} finally {
		conn.release()
	}
})
