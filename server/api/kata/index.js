import mysql from "mysql2/promise"
import dotenv from "dotenv"
import { defineEventHandler } from "h3"

dotenv.config()

const dbConfig = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
}

export default defineEventHandler(async (event) => {
	let connection

	try {
		connection = await mysql.createConnection(dbConfig)
		const [rows] = await connection.execute(
			"SELECT * FROM kata_shotokan ORDER BY livello, nome"
		)
		return rows
	} catch (error) {
		console.error("Errore nel recupero dei kata:", error)
		throw error
	} finally {
		if (connection) await connection.end()
	}
})
