import mysql from "mysql2/promise"
import dotenv from "dotenv"
import { defineEventHandler, createError } from "h3"

dotenv.config()

const dbConfig = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	connectTimeout: 10000,
}

export default defineEventHandler(async (event) => {
	let connection

	try {
		connection = await mysql.createConnection(dbConfig)
		const [rows] = await connection.execute(
			"SELECT * FROM iscrizioni_da_confermare"
		)
		return rows
	} catch (error) {
		console.error(
			"Errore nel recupero delle iscrizioni da confermare:",
			error
		)
		throw createError({ statusCode: 500, message: error.message })
	} finally {
		if (connection) {
			await connection.end()
		}
	}
})
