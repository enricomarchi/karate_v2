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
				// Recupera i dati base della categoria
				const [categoriaRows] = await connection.execute(
					"SELECT * FROM categorie WHERE id_categoria = ?",
					[id]
				)

				// Recupera gli ID delle fasce associate
				const [fasceRows] = await connection.execute(
					"SELECT id_fascia FROM categorie_fasce WHERE id_categoria = ?",
					[id]
				)

				// Recupera gli ID delle cinture associate
				const [cintureRows] = await connection.execute(
					"SELECT id_cintura FROM categorie_cinture WHERE id_categoria = ?",
					[id]
				)

				return {
					...categoriaRows[0],
					fasce: fasceRows.map((row) => row.id_fascia),
					cinture: cintureRows.map((row) => row.id_cintura),
				}
			} else {
				const [rows] = await connection.execute(
					"SELECT * FROM categorie"
				)
				return rows
			}
		} else if (method === "POST") {
			const {
				nome,
				id_disciplina,
				sesso,
				peso_min,
				peso_max,
				n_ordine,
				fasce,
				cinture,
			} = body

			// Start transaction
			await connection.beginTransaction()

			try {
				// Insert main category data
				const [result] = await connection.execute(
					"INSERT INTO categorie (nome, id_disciplina, sesso, peso_min, peso_max, n_ordine) VALUES (?, ?, ?, ?, ?, ?)",
					[
						nome || null,
						id_disciplina || null,
						sesso || null,
						peso_min || null,
						peso_max || null,
						n_ordine || null,
					]
				)

				const id_categoria = result.insertId

				// Insert fasce relationships if provided
				if (Array.isArray(fasce) && fasce.length > 0) {
					const fasceValues = fasce.map((id_fascia) => [
						id_categoria,
						id_fascia,
					])
					await connection.query(
						"INSERT INTO categorie_fasce (id_categoria, id_fascia) VALUES ?",
						[fasceValues]
					)
				}

				// Insert cinture relationships if provided
				if (Array.isArray(cinture) && cinture.length > 0) {
					const cintureValues = cinture.map((id_cintura) => [
						id_categoria,
						id_cintura,
					])
					await connection.query(
						"INSERT INTO categorie_cinture (id_categoria, id_cintura) VALUES ?",
						[cintureValues]
					)
				}

				// Commit transaction
				await connection.commit()

				return {
					id_categoria,
					nome,
					id_disciplina,
					sesso,
					peso_min,
					peso_max,
					n_ordine,
					fasce,
					cinture,
				}
			} catch (error) {
				// Rollback in case of error
				await connection.rollback()
				throw error
			}
		} else if (method === "PUT") {
			const { id } = getQuery(event)
			if (!id) {
				throw createError({
					statusCode: 400,
					statusMessage: "ID mancante",
				})
			}

			const updateData = await readBody(event)
			const { fasce, cinture, ...categoriaData } = updateData

			// Start transaction
			await connection.beginTransaction()

			try {
				// Update main category data if there are fields to update
				if (Object.keys(categoriaData).length > 0) {
					const updateFields = []
					const updateValues = []

					Object.entries(categoriaData).forEach(([key, value]) => {
						updateFields.push(`${key} = ?`)
						updateValues.push(value)
					})
					updateValues.push(id)

					await connection.execute(
						`UPDATE categorie SET ${updateFields.join(
							", "
						)} WHERE id_categoria = ?`,
						updateValues
					)
				}

				// Update fasce relationships if provided
				if (Array.isArray(fasce)) {
					await connection.execute(
						"DELETE FROM categorie_fasce WHERE id_categoria = ?",
						[id]
					)

					if (fasce.length > 0) {
						const fasceValues = fasce.map((id_fascia) => [
							id,
							id_fascia,
						])
						await connection.query(
							"INSERT INTO categorie_fasce (id_categoria, id_fascia) VALUES ?",
							[fasceValues]
						)
					}
				}

				// Update cinture relationships if provided
				if (Array.isArray(cinture)) {
					await connection.execute(
						"DELETE FROM categorie_cinture WHERE id_categoria = ?",
						[id]
					)

					if (cinture.length > 0) {
						const cintureValues = cinture.map((id_cintura) => [
							id,
							id_cintura,
						])
						await connection.query(
							"INSERT INTO categorie_cinture (id_categoria, id_cintura) VALUES ?",
							[cintureValues]
						)
					}
				}

				// Commit transaction
				await connection.commit()

				// Return updated category with relationships
				const [categoriaRows] = await connection.execute(
					"SELECT * FROM categorie WHERE id_categoria = ?",
					[id]
				)
				const [fasceRows] = await connection.execute(
					"SELECT id_fascia FROM categorie_fasce WHERE id_categoria = ?",
					[id]
				)
				const [cintureRows] = await connection.execute(
					"SELECT id_cintura FROM categorie_cinture WHERE id_categoria = ?",
					[id]
				)

				return {
					...categoriaRows[0],
					fasce: fasceRows.map((row) => row.id_fascia),
					cinture: cintureRows.map((row) => row.id_cintura),
				}
			} catch (error) {
				// Rollback in case of error
				await connection.rollback()
				throw createError({
					statusCode: 500,
					message: error.message,
				})
			}
		} else if (method === "DELETE") {
			const { id } = query
			if (!id) {
				throw new Error("ID categoria mancante")
			}

			// Eliminazione delle relazioni
			await connection.execute(
				"DELETE FROM categorie_fasce WHERE id_categoria = ?",
				[id]
			)
			await connection.execute(
				"DELETE FROM categorie_cinture WHERE id_categoria = ?",
				[id]
			)
			await connection.execute(
				"DELETE FROM categorie WHERE id_categoria = ?",
				[id]
			)

			return { id_categoria: id }
		}
	} catch (error) {
		console.error("Errore nella gestione delle categorie:", error)
		if (error.code === "ER_DUP_ENTRY") {
			throw createError({
				statusCode: 400,
				message: "Categoria già esistente con questi valori",
			})
		}
		throw createError({
			statusCode: 500,
			message: error.message,
		})
	} finally {
		if (connection) {
			await connection.end()
		}
	}
})
