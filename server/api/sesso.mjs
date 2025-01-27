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
	const connection = await mysql.createConnection(dbConfig)
	try {
		const [rows] = await connection.execute("SELECT * FROM sesso")
		return rows
	} catch (error) {
		console.error("Errore nel recupero dei sessi:", error)
		throw error
	} finally {
		await connection.end()
	}
})
