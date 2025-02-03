import mysql from "mysql2/promise"
import { defineEventHandler, readBody, createError } from "h3"
import dotenv from "dotenv"
import { ricalcolaConfigurazione } from "../utils/tabelloniUtils"

dotenv.config()

const dbConfig = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
}

const accorpamentoColors = [
	"bg-blue-100",
	"bg-red-100", // Cambiato da bg-red-200 a bg-red-100
	"bg-green-100",
	"bg-yellow-100",
	"bg-purple-100",
	"bg-pink-100",
	"bg-orange-100",
	"bg-teal-100",
	"bg-indigo-100",
	"bg-lime-100",
]

export default defineEventHandler(async (event) => {
	const body = await readBody(event)

	if (!body || !body.categorie || !Array.isArray(body.categorie)) {
		throw createError({
			statusCode: 400,
			message: "Invalid request: categories must be an array",
		})
	}

	if (body.categorie.length === 0) {
		throw createError({
			statusCode: 400,
			message: "No categories selected for grouping",
		})
	}

	if (!body.nome) {
		throw createError({
			statusCode: 400,
			message: "Nome is required",
		})
	}

	const { categorie, nome } = body
	let connection

	try {
		connection = await mysql.createConnection(dbConfig)
		await connection.beginTransaction()

		// Get the maximum n_ordine from the categorie table
		const [maxOrderResult] = await connection.execute(
			"SELECT COALESCE(MAX(n_ordine), 0) + 1 AS new_order FROM categorie"
		)
		const newOrder = maxOrderResult[0].new_order

		// Get the next n_accorpamento value, checking if table is empty
		const [accorpamentiCount] = await connection.execute(
			"SELECT COUNT(*) as count FROM accorpamenti"
		)
		const [maxAccorpamentoResult] = await connection.execute(
			"SELECT COALESCE(MAX(n_accorpamento), 0) AS max_accorpamento FROM accorpamenti"
		)
		const newAccorpamento =
			accorpamentiCount[0].count === 0
				? 1
				: maxAccorpamentoResult[0].max_accorpamento + 1

		// Get all existing colors
		const [existingColors] = await connection.execute(
			"SELECT colore FROM accorpamenti"
		)
		const usedColors = existingColors.map((row) => row.colore)

		// Find first available color
		const availableColor = accorpamentoColors.find(
			(color) => !usedColors.includes(color)
		)
		if (!availableColor) {
			throw createError({
				statusCode: 400,
				message: "No more colors available for new groupings",
			})
		}

		// Modifica la creazione dell'accorpamento per usare il nome fornito
		const [result] = await connection.execute(
			"INSERT INTO accorpamenti (nome_accorpamento, n_ordine, colore) VALUES (?, ?, ?)",
			[nome, newOrder, availableColor]
		)
		const n_accorpamento = result.insertId

		// Modifica la query per trovare TUTTI i tabelloni, con o senza configurazione
		const [existingTabelloni] = await connection.execute(`
            SELECT DISTINCT t.*, tc.id_categoria,
                   (SELECT COUNT(DISTINCT tc2.id_categoria) 
                    FROM tabelloni_categorie tc2 
                    WHERE tc2.id_tabellone = t.id_tabellone) as num_categorie
            FROM tabelloni t 
            JOIN tabelloni_categorie tc ON t.id_tabellone = tc.id_tabellone 
            WHERE tc.id_categoria IN (${categorie.join(",")})
            ORDER BY num_categorie DESC, configurazione_id DESC`)

		// Scegli il tabellone con più categorie e la sua configurazione
		// ma solo tra quelli che hanno una configurazione
		let configurazione_id = null
		let configurazioneTabellone = null
		const tabelloniConConfig = existingTabelloni.filter(
			(t) => t.configurazione_id
		)
		if (tabelloniConConfig.length > 0) {
			configurazioneTabellone = tabelloniConConfig.reduce((acc, curr) => {
				return (acc?.num_categorie || 0) > (curr.num_categorie || 0)
					? acc
					: curr
			})
			configurazione_id = configurazioneTabellone?.configurazione_id
		}

		// Elimina TUTTI i vecchi tabelloni trovati
		if (existingTabelloni.length > 0) {
			const tabelloniIds = existingTabelloni.map((t) => t.id_tabellone)
			await connection.execute(
				`DELETE FROM tabelloni WHERE id_tabellone IN (${tabelloniIds.join(
					","
				)})`
			)
		}

		// Aggiorna le categorie con il nuovo accorpamento
		const placeholders = categorie.map(() => "?").join(",")
		await connection.execute(
			`UPDATE categorie SET n_accorpamento = ? WHERE id_categoria IN (${placeholders})`,
			[n_accorpamento, ...categorie]
		)

		// Prima di creare il nuovo tabellone, recupera i codici delle categorie da accorpare
		const [categorieInfo] = await connection.execute(
			`SELECT n_ordine FROM categorie WHERE id_categoria IN (${categorie.join(
				","
			)})`
		)
		const codiceTabellone = categorieInfo
			.map((cat) => cat.n_ordine)
			.sort((a, b) => a - b)
			.join("-")

		// Crea il nuovo tabellone con il codice corretto e stampato = false
		const [newTabelloneResult] = await connection.execute(
			`INSERT INTO tabelloni (nome_tabellone, configurazione_id, codice_tabellone, stato, stampato) 
             VALUES (?, ?, ?, ?, false)`,
			[
				nome,
				configurazione_id,
				codiceTabellone,
				configurazioneTabellone?.stato || "BOZZA",
			]
		)
		const newTabelloneId = newTabelloneResult.insertId

		// Associa le categorie al nuovo tabellone
		const categorieValues = categorie.map((categoriaId) => [
			newTabelloneId,
			categoriaId,
		])
		const placeholdersCategorie = categorieValues
			.map(() => "(?, ?)")
			.join(", ")
		await connection.execute(
			`INSERT INTO tabelloni_categorie (id_tabellone, id_categoria) VALUES ${placeholdersCategorie}`,
			categorieValues.flat()
		)

		// Se c'è una configurazione, applicala usando la funzione dedicata
		if (configurazione_id) {
			await ricalcolaConfigurazione(connection, newTabelloneId)
		}

		await connection.commit()
		return { success: true, n_accorpamento }
	} catch (error) {
		if (connection) await connection.rollback()
		console.error("Error:", error)
		throw error
	} finally {
		if (connection) await connection.end()
	}
})
