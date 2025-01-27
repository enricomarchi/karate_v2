import mysql from "mysql2/promise"
import dotenv from "dotenv"
import {
	defineEventHandler,
	getQuery,
	readBody,
	assertMethod,
	createError,
} from "h3"

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
			const [rows] = await connection.execute("SELECT * FROM fasce_eta")
			return rows.map((row) => ({
				id_fascia: row.id_fascia,
				descrizione: row.descrizione,
				anno_nascita_min: row.anno_nascita_min,
				anno_nascita_max: row.anno_nascita_max,
			}))
		} else if (method === "POST") {
			const { descrizione, anno_nascita_min, anno_nascita_max } = body
			if (!descrizione) {
				throw new Error("Descrizione mancante")
			}
			if (anno_nascita_min === undefined || anno_nascita_min === null) {
				throw new Error("Anno nascita minimo mancante")
			}
			if (anno_nascita_max === undefined || anno_nascita_max === null) {
				throw new Error("Anno nascita massimo mancante")
			}

			const [result] = await connection.execute(
				"INSERT INTO fasce_eta (descrizione, anno_nascita_min, anno_nascita_max) VALUES (?, ?, ?)",
				[descrizione, anno_nascita_min, anno_nascita_max]
			)
			return {
				id_fascia: result.insertId,
				descrizione,
				anno_nascita_min,
				anno_nascita_max,
			}
		} else if (method === "PUT") {
			const { id } = query
			const { descrizione, anno_nascita_min, anno_nascita_max } = body
			if (
				id &&
				descrizione &&
				anno_nascita_min !== undefined &&
				anno_nascita_max !== undefined
			) {
				await connection.execute(
					"UPDATE fasce_eta SET descrizione = ?, anno_nascita_min = ?, anno_nascita_max = ? WHERE id_fascia = ?",
					[descrizione, anno_nascita_min, anno_nascita_max, id]
				)
				return { id, descrizione, anno_nascita_min, anno_nascita_max }
			} else {
				throw new Error(
					"Parametri mancanti per l'aggiornamento della fascia d'età"
				)
			}
		} else if (method === "DELETE") {
			const { id } = query
			if (id) {
				await connection.execute(
					"DELETE FROM fasce_eta WHERE id_fascia = ?",
					[id]
				)
				return { id }
			} else {
				throw new Error(
					"ID mancante per la cancellazione della fascia d'età"
				)
			}
		}
	} catch (error) {
		console.error("Errore nella gestione delle fasce d'età:", error)
		throw createError({ statusCode: 500, message: error.message })
	} finally {
		if (connection) {
			await connection.end()
		}
	}
})
