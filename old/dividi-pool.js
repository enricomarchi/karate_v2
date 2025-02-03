import mysql from "mysql2/promise"
import { defineEventHandler, readBody, createError } from "h3"
import dotenv from "dotenv"

dotenv.config()

const dbConfig = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
}

export default defineEventHandler(async (event) => {
	const body = await readBody(event)

	if (!body || !body.id_categoria) {
		throw createError({
			statusCode: 400,
			message: "Missing required parameters",
		})
	}

	let connection

	try {
		connection = await mysql.createConnection(dbConfig)
		await connection.beginTransaction()

		// Se num_pools è 0, rimuovi le pool e i tabelloni associati
		if (body.num_pools === 0) {
			// Prima elimina i tabelloni associati
			await connection.execute(
				`DELETE t FROM tabelloni t
				 JOIN tabelloni_categorie tc ON t.id_tabellone = tc.id_tabellone
				 WHERE tc.id_categoria = ? AND t.pool IS NOT NULL`,
				[body.id_categoria]
			)

			// Poi rimuovi le pool
			await connection.execute(
				"UPDATE iscrizioni SET pool = NULL WHERE id_categoria = ?",
				[body.id_categoria]
			)
		} else {
			// 1. Reset existing pool assignments for this category
			await connection.execute(
				"UPDATE iscrizioni SET pool = NULL WHERE id_categoria = ?",
				[body.id_categoria]
			)

			// 2. Get iscrizioni ordered by società with most entries first
			const [iscrizioni] = await connection.execute(
				`
            SELECT i.id_iscrizione, i.id_atleta, a.id_societa
            FROM iscrizioni i
            JOIN atleti a ON i.id_atleta = a.id_atleta
            WHERE i.id_categoria = ?
            ORDER BY (
                SELECT COUNT(*)
                FROM iscrizioni i2
                JOIN atleti a2 ON i2.id_atleta = a2.id_atleta
                WHERE a2.id_societa = a.id_societa
                AND i2.id_categoria = ?
            ) DESC,
            a.id_societa
        `,
				[body.id_categoria, body.id_categoria]
			)

			// 3. Assign pools in round-robin fashion
			let currentPool = 1
			for (const iscrizione of iscrizioni) {
				await connection.execute(
					"UPDATE iscrizioni SET pool = ? WHERE id_iscrizione = ?",
					[currentPool, iscrizione.id_iscrizione]
				)
				currentPool = (currentPool % body.num_pools) + 1
			}
		}

		// Prima di eseguire il commit, trova e aggiorna i tabelloni associati
		const [tabelloni] = await connection.execute(
			`SELECT DISTINCT t.id_tabellone 
			 FROM tabelloni t
			 JOIN tabelloni_categorie tc ON t.id_tabellone = tc.id_tabellone
			 WHERE tc.id_categoria = ?`,
			[body.id_categoria]
		)

		// Aggiorna stampato = false per tutti i tabelloni trovati
		for (const tabellone of tabelloni) {
			await connection.execute(
				"UPDATE tabelloni SET stampato = false WHERE id_tabellone = ?",
				[tabellone.id_tabellone]
			)
		}

		await connection.commit()
		return { success: true }
	} catch (error) {
		if (connection) await connection.rollback()
		console.error("Error:", error)
		throw error
	} finally {
		if (connection) await connection.end()
	}
})
