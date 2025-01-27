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
			const { id_categoria, id_cintura } = body

			const [result] = await connection.execute(
				"INSERT INTO categorie_cinture (id_categoria, id_cintura) VALUES (?, ?)",
				[id_categoria, id_cintura]
			)

			return { id_categoria, id_cintura, ...result }
		} else if (method === "DELETE") {
			const { id_categoria, id_cintura } = query

			if (!id_categoria || !id_cintura) {
				throw new Error("ID categoria o ID cintura mancante")
			}

			await connection.execute(
				"DELETE FROM categorie_cinture WHERE id_categoria = ? AND id_cintura = ?",
				[id_categoria, id_cintura]
			)

			return { id_categoria, id_cintura }
		}
	} catch (error) {
		console.error("Errore nella gestione delle categorie_cinture:", error)
		return { success: false, error: error.message }
	} finally {
		if (connection) {
			await connection.end()
		}
	}
})
