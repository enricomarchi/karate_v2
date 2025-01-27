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

	let connection

	try {
		assertMethod(event, ["GET"])

		connection = await mysql.createConnection(dbConfig)

		if (method === "GET") {
			const { id_categoria } = query
			if (id_categoria) {
				const [rows] = await connection.execute(
					"SELECT * FROM vista_categorie_fasce WHERE id_categoria = ?",
					[id_categoria]
				)
				return rows
			} else {
				const [rows] = await connection.execute(
					"SELECT * FROM vista_categorie_fasce"
				)
				return rows
			}
		}
	} catch (error) {
		console.error("Errore nella gestione di vista_categorie_fasce:", error)
		return { success: false, error: error.message }
	} finally {
		if (connection) {
			await connection.end()
		}
	}
})
