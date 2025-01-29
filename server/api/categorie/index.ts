import { getConnection } from "../../utils/db"
import {
	defineEventHandler,
	getQuery,
	readBody,
	assertMethod,
	createError,
} from "h3"
import type {
	Categoria,
	CategoriaRow,
	FasciaRow,
	CinturaRow,
	MySQLError,
} from "~/types/global"
import type { ResultSetHeader, PoolConnection } from "mysql2/promise"

export default defineEventHandler(async (event) => {
	const method = event.node.req.method
	const query = getQuery(event)

	// Ottieni la connessione prima del try/catch principale
	const connection = await getConnection()

	try {
		assertMethod(event, ["GET", "POST", "PUT", "DELETE"])

		if (method === "GET") {
			const id = query.id ? parseInt(query.id as string) : null
			if (id) {
				// Recupera i dati completi della categoria dalla view
				const [rows] = await connection.execute<CategoriaRow[]>(
					"SELECT * FROM dettaglio_categorie WHERE id_categoria = ?",
					[id]
				)

				// Recupera le fasce dalla view
				const [fasce] = await connection.execute<FasciaRow[]>(
					"SELECT * FROM dettaglio_categorie_fasce WHERE id_categoria = ?",
					[id]
				)

				// Recupera le cinture dalla view
				const [cinture] = await connection.execute<CinturaRow[]>(
					"SELECT * FROM dettaglio_categorie_cinture WHERE id_categoria = ?",
					[id]
				)

				if (rows.length === 0) {
					throw createError({
						statusCode: 404,
						message: "Categoria non trovata",
					})
				}

				// Combina i risultati
				return {
					...rows[0],
					fasce: fasce,
					cinture: cinture,
				}
			} else {
				const [rows] = await connection.execute<CategoriaRow[]>(
					"SELECT * FROM dettaglio_categorie"
				)
				// Per ogni categoria, carica le sue fasce e cinture
				const categorie = await Promise.all(
					rows.map(async (cat) => {
						const [fasce] = await connection.execute<FasciaRow[]>(
							"SELECT * FROM dettaglio_categorie_fasce WHERE id_categoria = ?",
							[cat.id_categoria]
						)
						const [cinture] = await connection.execute<
							CinturaRow[]
						>(
							"SELECT * FROM dettaglio_categorie_cinture WHERE id_categoria = ?",
							[cat.id_categoria]
						)
						return {
							...cat,
							fasce: fasce,
							cinture: cinture,
						}
					})
				)
				return categorie
			}
		} else if (method === "POST") {
			const categoriaInput = await readBody<Categoria>(event)
			const { fasce, cinture } = categoriaInput // Destrutturiamo solo ciò che usiamo

			// Start transaction
			await connection.beginTransaction()

			try {
				// Insert main category data
				const [result] = await connection.execute<ResultSetHeader>(
					"INSERT INTO categorie (nome, id_disciplina, sesso, peso_min, peso_max, n_ordine) VALUES (?, ?, ?, ?, ?, ?)",
					[
						categoriaInput.nome || null,
						categoriaInput.id_disciplina || null,
						categoriaInput.sesso || null,
						categoriaInput.peso_min || null,
						categoriaInput.peso_max || null,
						categoriaInput.n_ordine || null,
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

				// Dopo il commit, recupera i dati completi usando le view
				const [categoriaRows] = await connection.execute<
					CategoriaRow[]
				>("SELECT * FROM dettaglio_categorie WHERE id_categoria = ?", [
					id_categoria,
				])
				const [fasceRows] = await connection.execute<FasciaRow[]>(
					"SELECT * FROM dettaglio_categorie_fasce WHERE id_categoria = ?",
					[id_categoria]
				)
				const [cintureRows] = await connection.execute<CinturaRow[]>(
					"SELECT * FROM dettaglio_categorie_cinture WHERE id_categoria = ?",
					[id_categoria]
				)

				return {
					...categoriaRows[0],
					fasce: fasceRows,
					cinture: cintureRows,
				}
			} catch (error) {
				// Rollback in case of error
				await connection.rollback()
				const mysqlError = error as MySQLError
				throw createError({
					statusCode: 500,
					message: mysqlError.message || "Errore interno del server",
				})
			}
		} else if (method === "PUT") {
			const id = parseInt(query.id as string)
			if (!id || isNaN(id)) {
				throw createError({
					statusCode: 400,
					statusMessage: "ID mancante o non valido",
				})
			}

			const updateData = await readBody<Categoria>(event)
			const { fasce, cinture, ...categoriaData } = updateData

			// Start transaction
			await connection.beginTransaction()

			try {
				// Update main category data if there are fields to update
				if (Object.keys(categoriaData).length > 0) {
					const updateFields: string[] = []
					const updateValues: (string | number | null)[] = []

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

				// Dopo il commit, recupera i dati completi usando le view
				const [categoriaRows] = await connection.execute<
					CategoriaRow[]
				>("SELECT * FROM dettaglio_categorie WHERE id_categoria = ?", [
					id,
				])
				const [fasceRows] = await connection.execute<FasciaRow[]>(
					"SELECT * FROM dettaglio_categorie_fasce WHERE id_categoria = ?",
					[id]
				)
				const [cintureRows] = await connection.execute<CinturaRow[]>(
					"SELECT * FROM dettaglio_categorie_cinture WHERE id_categoria = ?",
					[id]
				)

				return {
					...categoriaRows[0],
					fasce: fasceRows,
					cinture: cintureRows,
				}
			} catch (error) {
				// Rollback in case of error
				await connection.rollback()
				const mysqlError = error as MySQLError
				throw createError({
					statusCode: 500,
					message: mysqlError.message || "Errore interno del server",
				})
			}
		} else if (method === "DELETE") {
			const id = parseInt(query.id as string)
			if (!id || isNaN(id)) {
				throw new Error("ID categoria mancante o non valido")
			}

			// Eliminazione delle relazioni
			await connection.beginTransaction()

			try {
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

				await connection.commit()
				return { id_categoria: id }
			} catch (error) {
				await connection.rollback()
				const mysqlError = error as MySQLError
				throw error
			}
		}
	} catch (error) {
		console.error("Errore nella gestione delle categorie:", error)
		const mysqlError = error as MySQLError
		if (mysqlError.code === "ER_DUP_ENTRY") {
			throw createError({
				statusCode: 400,
				message: "Categoria già esistente con questi valori",
			})
		}
		throw createError({
			statusCode: 500,
			message: mysqlError.message || "Errore interno del server",
		})
	} finally {
		await connection.release()
	}
})
