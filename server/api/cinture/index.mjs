import mysql from "mysql2/promise"
import dotenv from "dotenv"
import { defineEventHandler, getQuery, readBody, assertMethod } from "h3"

dotenv.config()

const dbConfig = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	connectTimeout: 10000, // 10 secondi di timeout per la connessione
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
		assertMethod(event, ["GET", "POST", "PUT", "DELETE"])

		connection = await mysql.createConnection(dbConfig)

		if (method === "GET") {
			const [rows] = await connection.execute("SELECT * FROM cinture")
			return rows
		} else if (method === "POST") {
			const { colore, kyu, dan } = body
			if (!colore || kyu === undefined || dan === undefined) {
				throw new Error("Parametri mancanti")
			}

			const [result] = await connection.execute(
				"INSERT INTO cinture (colore, kyu, dan) VALUES (?, ?, ?)",
				[colore, kyu, dan]
			)
			return {
				id_cintura: result.insertId,
				colore,
				kyu,
				dan,
			}
		} else if (method === "PUT") {
			const { id } = query
			const { colore, kyu, dan } = body
			if (id && colore && kyu !== undefined && dan !== undefined) {
				await connection.execute(
					"UPDATE cinture SET colore = ?, kyu = ?, dan = ? WHERE id_cintura = ?",
					[colore, kyu, dan, id]
				)
				return {
					id,
					colore,
					kyu,
					dan,
				}
			} else {
				throw new Error(
					"Parametri mancanti per l'aggiornamento della cintura"
				)
			}
		} else if (method === "DELETE") {
			const { id } = query
			if (id) {
				await connection.execute(
					"DELETE FROM cinture WHERE id_cintura = ?",
					[id]
				)
				return { id }
			} else {
				throw new Error(
					"ID mancante per la cancellazione della cintura"
				)
			}
		}
	} catch (error) {
		console.error("Errore nella gestione delle cinture:", error)
		return { success: false, error: error.message }
	} finally {
		if (connection) {
			await connection.end()
		}
	}
})
