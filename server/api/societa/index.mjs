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
		assertMethod(event, ["GET", "POST", "PUT", "DELETE"])

		connection = await mysql.createConnection(dbConfig)

		if (method === "GET") {
			const { id } = query
			if (id) {
				const [rows] = await connection.execute(
					"SELECT * FROM vista_societa WHERE id_societa = ?",
					[id]
				)
				return rows[0]
			} else {
				const [rows] = await connection.execute(
					"SELECT * FROM vista_societa"
				)
				return rows
			}
		} else if (method === "POST") {
			const { nome_societa, pagato, resto_consegnato } = body

			const [result] = await connection.execute(
				"INSERT INTO societa (nome_societa, pagato, resto_consegnato) VALUES (?, ?, ?)",
				[nome_societa || null, pagato || 0, resto_consegnato || 0]
			)

			return { id_societa: result.insertId, ...body }
		} else if (method === "PUT") {
			const { id } = query
			const { nome_societa, pagato, resto_consegnato } = body

			await connection.execute(
				"UPDATE societa SET nome_societa = ?, pagato = ?, resto_consegnato = ? WHERE id_societa = ?",
				[nome_societa || null, pagato || 0, resto_consegnato || 0, id]
			)

			return { id, ...body }
		} else if (method === "DELETE") {
			const { id } = query
			if (!id) {
				throw new Error("ID mancante")
			}

			// Elimina gli atleti associati alla società
			await connection.execute(
				"DELETE FROM discipline_atleti WHERE id_atleta IN (SELECT id_atleta FROM atleti WHERE id_societa = ?)",
				[id]
			)
			await connection.execute(
				"DELETE FROM iscrizioni WHERE id_atleta IN (SELECT id_atleta FROM atleti WHERE id_societa = ?)",
				[id]
			)
			await connection.execute(
				"DELETE FROM atleti WHERE id_societa = ?",
				[id]
			)

			// Elimina la società
			await connection.execute(
				"DELETE FROM societa WHERE id_societa = ?",
				[id]
			)

			return { id }
		}
	} catch (error) {
		console.error("Errore nella gestione delle società:", error)
		throw createError({ statusCode: 500, message: error.message })
	} finally {
		if (connection) {
			await connection.end()
		}
	}
})
