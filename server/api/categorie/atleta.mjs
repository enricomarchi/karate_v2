import mysql from "mysql2/promise"
import dotenv from "dotenv"
import { defineEventHandler, getQuery } from "h3"

dotenv.config()

const dbConfig = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
}

export default defineEventHandler(async (event) => {
	const query = getQuery(event)
	const { id_atleta, id_disciplina } = query

	if (!id_atleta || !id_disciplina) {
		throw new Error("id_atleta e id_disciplina sono richiesti")
	}

	const connection = await mysql.createConnection(dbConfig)
	try {
		const [rows] = await connection.execute(
			"SELECT id_categoria FROM atleti_categorie WHERE id_atleta = ? AND id_disciplina = ?",
			[id_atleta, id_disciplina]
		)
		return rows[0]?.id_categoria || null
	} catch (error) {
		console.error("Errore nel recupero della categoria:", error)
		throw error
	} finally {
		await connection.end()
	}
})
