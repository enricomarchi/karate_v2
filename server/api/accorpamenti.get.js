import mysql from "mysql2/promise"
import { defineEventHandler, createError } from "h3"
import dotenv from "dotenv"

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

		const [rows] = await connection.execute(`
            SELECT a.*, GROUP_CONCAT(c.nome ORDER BY c.n_ordine ASC SEPARATOR ', ') as categorie_incluse
            FROM accorpamenti a
            LEFT JOIN categorie c ON a.n_accorpamento = c.n_accorpamento
            GROUP BY a.n_accorpamento
            ORDER BY a.n_ordine ASC
        `)

		return rows
	} catch (error) {
		console.error("Errore nel recupero degli accorpamenti:", error)
		throw createError({ statusCode: 500, message: error.message })
	} finally {
		if (connection) await connection.end()
	}
})
