import mysql from "mysql2/promise"
import dotenv from "dotenv"
import { defineEventHandler, getQuery, readBody, assertMethod } from "h3"

dotenv.config()

const dbConfig = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	connectTimeout: 10000,
}

export default defineEventHandler(async (event) => {
	const method = event.node.req.method
	const query = getQuery(event)
	let body = {}

	if (method !== "GET") {
		body = await readBody(event)
	}

	let connection

	try {
		assertMethod(event, ["GET", "POST", "DELETE"])

		connection = await mysql.createConnection(dbConfig)

		if (method === "POST") {
			const { id_categoria, id_fascia } = body

			const [result] = await connection.execute(
				"INSERT INTO categorie_fasce (id_categoria, id_fascia) VALUES (?, ?)",
				[id_categoria, id_fascia]
			)

			return { id_categoria, id_fascia, ...result }
		} else if (method === "DELETE") {
			const { id_categoria, id_fascia } = query

			if (!id_categoria || !id_fascia) {
				throw new Error("ID categoria o ID fascia mancante")
			}

			await connection.execute(
				"DELETE FROM categorie_fasce WHERE id_categoria = ? AND id_fascia = ?",
				[id_categoria, id_fascia]
			)

			return { id_categoria, id_fascia }
		}
	} catch (error) {
		console.error("Errore nella gestione delle categorie_fasce:", error)
		return { success: false, error: error.message }
	} finally {
		if (connection) {
			await connection.end()
		}
	}
})
