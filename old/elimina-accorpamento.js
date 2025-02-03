import { defineEventHandler, readBody, createError } from "h3"
import dotenv from "dotenv"
import { getConnection } from "../utils/db"
import { ricalcolaConfigurazione } from "../utils/tabelloniUtils"

dotenv.config()

export default defineEventHandler(async (event) => {
	const body = await readBody(event)

	if (!body || !body.n_accorpamento) {
		throw createError({
			statusCode: 400,
			message: "n_accorpamento is required",
		})
	}

	let connection

	try {
		connection = await getConnection() // Usa getConnection invece di mysql.createConnection
		await connection.beginTransaction()

		// Prima trova i tabelloni associati all'accorpamento e le loro categorie
		const [tabelloniInfo] = await connection.execute(
			`
            SELECT DISTINCT t.*, c.id_categoria, c.nome as categoria_nome, c.n_ordine
            FROM tabelloni t
            JOIN tabelloni_categorie tc ON t.id_tabellone = tc.id_tabellone
            JOIN categorie c ON tc.id_categoria = c.id_categoria
            WHERE c.n_accorpamento = ?`,
			[body.n_accorpamento]
		)

		// Raggruppa le informazioni per tabellone
		const tabelloniMap = tabelloniInfo.reduce((acc, row) => {
			if (!acc[row.id_tabellone]) {
				acc[row.id_tabellone] = {
					configurazione_id: row.configurazione_id,
					stato: row.stato,
					categorie: [],
				}
			}
			acc[row.id_tabellone].categorie.push({
				id: row.id_categoria,
				nome: row.categoria_nome,
				n_ordine: row.n_ordine,
			})
			return acc
		}, {})

		// Elimina i vecchi tabelloni
		const tabelloniIds = Object.keys(tabelloniMap)
		if (tabelloniIds.length > 0) {
			await connection.execute(
				`DELETE FROM tabelloni WHERE id_tabellone IN (${tabelloniIds.join(
					","
				)})`
			)
		}

		// Rimuovi il riferimento all'accorpamento dalle categorie
		await connection.execute(
			"UPDATE categorie SET n_accorpamento = NULL WHERE n_accorpamento = ?",
			[body.n_accorpamento]
		)

		// Crea nuovi tabelloni individuali per ogni categoria con la stessa configurazione
		for (const tabelloneInfo of Object.values(tabelloniMap)) {
			const configurazione_id = tabelloneInfo.configurazione_id

			for (const categoria of tabelloneInfo.categorie) {
				// Crea un nuovo tabellone per la categoria con stampato = false
				const [newTabelloneResult] = await connection.execute(
					`INSERT INTO tabelloni (nome_tabellone, configurazione_id, codice_tabellone, stato, stampato) 
                     VALUES (?, ?, ?, ?, false)`,
					[
						categoria.nome,
						configurazione_id,
						categoria.n_ordine,
						tabelloneInfo.stato,
					]
				)

				const newTabelloneId = newTabelloneResult.insertId

				// Associa la categoria al nuovo tabellone
				await connection.execute(
					`INSERT INTO tabelloni_categorie (id_tabellone, id_categoria) 
                     VALUES (?, ?)`,
					[newTabelloneId, categoria.id]
				)

				// Se c'è una configurazione, applicala al nuovo tabellone
				if (configurazione_id) {
					await ricalcolaConfigurazione(connection, newTabelloneId)
				}
			}
		}

		// Elimina l'accorpamento
		await connection.execute(
			"DELETE FROM accorpamenti WHERE n_accorpamento = ?",
			[body.n_accorpamento]
		)

		await connection.commit()
		return { success: true }
	} catch (error) {
		if (connection) await connection.rollback()
		console.error("Error:", error)
		throw error
	} finally {
		if (connection) connection.release() // Usa release invece di end
	}
})
