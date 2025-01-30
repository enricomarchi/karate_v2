import { getConnection } from "../utils/db"
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
	Disciplina,
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

				// Trasforma i dati dal database nel formato dell'interfaccia Categoria
				const categoriaWithDisciplina = {
					...rows[0],
					disciplina:
						rows[0].disciplina_id && rows[0].disciplina_valore
							? {
									id_disciplina: rows[0].disciplina_id,
									valore: rows[0].disciplina_valore,
							  }
							: undefined,
					fasce,
					cinture,
				}

				// Rimuovi i campi extra che non fanno parte dell'interfaccia Categoria
				const { disciplina_id, disciplina_valore, ...result } =
					categoriaWithDisciplina

				return result
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
			// Estrai solo l'id dalla disciplina se presente, altrimenti usa id_disciplina direttamente
			const id_disciplina =
				categoriaInput.disciplina?.id_disciplina ||
				categoriaInput.id_disciplina
			const { fasce, cinture } = categoriaInput

			// Start transaction
			await connection.beginTransaction()

			try {
				// Se n_ordine non è specificato, trova il massimo disponibile e aggiunge 1
				if (!categoriaInput.n_ordine) {
					const [rows] = await connection.execute<CategoriaRow[]>(
						"SELECT MAX(n_ordine) as max_order FROM categorie WHERE n_ordine IS NOT NULL"
					)
					const maxOrder = rows[0]?.max_order
					categoriaInput.n_ordine = maxOrder ? maxOrder + 1 : 1
				}

				// Insert main category data
				const [result] = await connection.execute<ResultSetHeader>(
					"INSERT INTO categorie (nome, id_disciplina, sesso, peso_min, peso_max, n_ordine) VALUES (?, ?, ?, ?, ?, ?)",
					[
						categoriaInput.nome || null,
						id_disciplina || null,
						categoriaInput.sesso || null,
						categoriaInput.peso_min ?? null, // Ensure null is used instead of undefined
						categoriaInput.peso_max ?? null, // Ensure null is used instead of undefined
						categoriaInput.n_ordine,
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
			const { fasce, cinture, disciplina, ...categoriaData } = updateData

			// Start transaction
			await connection.beginTransaction()

			try {
				// Update main category data if there are fields to update
				if (Object.keys(categoriaData).length > 0 || disciplina) {
					const updateFields: string[] = []
					const updateValues: (string | number | null)[] = []

					Object.entries(categoriaData).forEach(([key, value]) => {
						updateFields.push(`${key} = ?`)
						updateValues.push(value ?? null)
					})

					if (disciplina?.id_disciplina) {
						updateFields.push("id_disciplina = ?")
						updateValues.push(disciplina.id_disciplina)
					}

					if (updateFields.length > 0) {
						updateValues.push(id)
						await connection.execute(
							`UPDATE categorie SET ${updateFields.join(
								", "
							)} WHERE id_categoria = ?`,
							updateValues
						)
					}
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
		connection.release()
	}
})
