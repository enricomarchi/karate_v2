import { getConnection } from "../utils/db"
import dotenv from "dotenv"
import {
	defineEventHandler,
	getQuery,
	readBody,
	assertMethod,
	createError,
} from "h3"
import { type ResultSetHeader } from "mysql2"
import type { Fascia, FasciaRow, MySQLError } from "~/types/global"

dotenv.config()

export default defineEventHandler(async (event) => {
	const method = event.node.req.method
	const query = getQuery(event)
	let body: Partial<Fascia> = {}

	if (method !== "GET") {
		body = await readBody<Partial<Fascia>>(event)
	}

	let connection = await getConnection()

	try {
		assertMethod(event, ["GET", "POST", "PUT", "DELETE"])

		if (method === "GET") {
			const id = query.id ? parseInt(query.id as string) : null

			if (id) {
				// Recupera una specifica fascia d'età
				const [rows] = await connection.execute<FasciaRow[]>(
					"SELECT * FROM fasce_eta WHERE id_fascia = ?",
					[id]
				)
				if (!Array.isArray(rows) || rows.length === 0) {
					throw createError({
						statusCode: 404,
						message: "Fascia d'età non trovata",
					})
				}
				return rows[0]
			} else {
				// Recupera tutte le fasce d'età
				const [rows] = await connection.execute<FasciaRow[]>(
					"SELECT * FROM fasce_eta"
				)
				return rows
			}
		} else if (method === "POST") {
			const { descrizione, anno_nascita_min, anno_nascita_max } = body
			if (!descrizione) {
				throw createError({
					statusCode: 400,
					message: "Descrizione mancante",
				})
			}
			if (anno_nascita_min === undefined || anno_nascita_min === null) {
				throw createError({
					statusCode: 400,
					message: "Anno nascita minimo mancante",
				})
			}
			if (anno_nascita_max === undefined || anno_nascita_max === null) {
				throw createError({
					statusCode: 400,
					message: "Anno nascita massimo mancante",
				})
			}

			const [result] = await connection.execute<ResultSetHeader>(
				"INSERT INTO fasce_eta (descrizione, anno_nascita_min, anno_nascita_max) VALUES (?, ?, ?)",
				[descrizione, anno_nascita_min, anno_nascita_max]
			)
			return {
				id_fascia: result.insertId,
				descrizione,
				anno_nascita_min,
				anno_nascita_max,
			} as Fascia
		} else if (method === "PUT") {
			const { id } = query
			if (!id) {
				throw createError({
					statusCode: 400,
					message: "ID mancante per l'aggiornamento",
				})
			}

			const { descrizione, anno_nascita_min, anno_nascita_max } = body
			if (
				!descrizione ||
				anno_nascita_min === undefined ||
				anno_nascita_max === undefined
			) {
				throw createError({
					statusCode: 400,
					message:
						"Parametri mancanti per l'aggiornamento della fascia d'età",
				})
			}

			await connection.execute(
				"UPDATE fasce_eta SET descrizione = ?, anno_nascita_min = ?, anno_nascita_max = ? WHERE id_fascia = ?",
				[descrizione, anno_nascita_min, anno_nascita_max, id]
			)
			return {
				id_fascia: Number(id),
				descrizione,
				anno_nascita_min,
				anno_nascita_max,
			} as Fascia
		} else if (method === "DELETE") {
			const { id } = query
			if (!id) {
				throw createError({
					statusCode: 400,
					message: "ID mancante per la cancellazione",
				})
			}

			await connection.execute(
				"DELETE FROM fasce_eta WHERE id_fascia = ?",
				[id]
			)
			return { id_fascia: Number(id) } as Partial<Fascia>
		}
	} catch (error) {
		console.error("Errore nella gestione delle fasce d'età:", error)
		const mysqlError = error as MySQLError
		// Gestione specifica per errori di duplicazione
		if (mysqlError.code === "ER_DUP_ENTRY") {
			throw createError({
				statusCode: 400,
				message: "Fascia d'età già esistente con questi valori",
			})
		}
		throw createError({
			statusCode: mysqlError.statusCode || 500,
			message: mysqlError.message || "Errore interno del server",
		})
	} finally {
		if (connection) {
			connection.release()
		}
	}
})
