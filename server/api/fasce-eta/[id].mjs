import mysql from "mysql2/promise"
import dotenv from "dotenv"
import { defineEventHandler, getQuery, readBody } from "h3"

dotenv.config()

const dbConfig = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
}

export default defineEventHandler(async (event) => {
	const method = event.req.method
	const { id } = getQuery(event)
	const body = await readBody(event)

	const connection = await mysql.createConnection(dbConfig)

	try {
		if (method === "GET") {
			const [rows] = await connection.execute(
				"SELECT * FROM fasce_eta WHERE id_fascia = ?",
				[id]
			)
			return rows[0]
		} else if (method === "PUT") {
			const { descrizione, anno_nascita_min, anno_nascita_max } = body
			await connection.execute(
				"UPDATE fasce_eta SET descrizione = ?, anno_nascita_min = ?, anno_nascita_max = ? WHERE id_fascia = ?",
				[descrizione, anno_nascita_min, anno_nascita_max, id]
			)
			return { id, descrizione, anno_nascita_min, anno_nascita_max }
		} else if (method === "DELETE") {
			await connection.execute(
				"DELETE FROM fasce_eta WHERE id_fascia = ?",
				[id]
			)
			return { id }
		}
	} catch (error) {
		console.error("Errore nella gestione delle fasce d'età:", error)
		return { success: false, error: error.message }
	} finally {
		await connection.end()
	}
})
