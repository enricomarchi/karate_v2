import {
	defineEventHandler,
	getQuery,
	readBody,
	assertMethod,
	createError,
} from "h3"
import { getConnection } from "../utils/db"
import type { SocietaRow, MySQLError } from "../../types/global"
import type { ResultSetHeader } from "mysql2/promise"

export default defineEventHandler(async (event) => {
	const method = event.node.req.method
	const query = getQuery(event)
	let body = {}
	let connection

	if (method !== "GET") {
		body = await readBody(event)
	}

	try {
		assertMethod(event, ["GET", "POST", "PUT", "DELETE"])
		connection = await getConnection()

		if (method === "GET") {
			const { id } = query
			if (id) {
				const [rows] = await connection.execute<SocietaRow[]>(
					"SELECT * FROM dettaglio_societa WHERE id_societa = ?",
					[id]
				)
				return rows[0]
			} else {
				const [rows] = await connection.execute<SocietaRow[]>(
					"SELECT * FROM dettaglio_societa"
				)
				return rows
			}
		} else if (method === "POST") {
			const { nome_societa, pagato, resto_consegnato } =
				body as SocietaRow

			const [result] = await connection.execute<ResultSetHeader>(
				"INSERT INTO societa (nome_societa, pagato, resto_consegnato) VALUES (?, ?, ?)",
				[nome_societa || null, pagato || 0, resto_consegnato || 0]
			)

			return { id_societa: result.insertId, ...body }
		} else if (method === "PUT") {
			const { id } = query
			const { nome_societa, pagato, resto_consegnato } =
				body as SocietaRow

			await connection.execute(
				"UPDATE societa SET nome_societa = ?, pagato = ?, resto_consegnato = ? WHERE id_societa = ?",
				[nome_societa || null, pagato || 0, resto_consegnato || 0, id]
			)

			return { id, ...body }
		} else if (method === "DELETE") {
			const { id } = query
			if (!id) {
				throw new Error("ID mancante")
			}

			// Elimina gli atleti associati alla società
			await connection.execute(
				"DELETE FROM discipline_atleti WHERE id_atleta IN (SELECT id_atleta FROM atleti WHERE id_societa = ?)",
				[id]
			)
			await connection.execute(
				"DELETE FROM iscrizioni WHERE id_atleta IN (SELECT id_atleta FROM atleti WHERE id_societa = ?)",
				[id]
			)
			await connection.execute(
				"DELETE FROM atleti WHERE id_societa = ?",
				[id]
			)

			// Elimina la società
			await connection.execute(
				"DELETE FROM societa WHERE id_societa = ?",
				[id]
			)

			return { id }
		}
	} catch (error) {
		console.error("Errore nella gestione delle società:", error)
		throw createError({
			statusCode: (error as MySQLError).statusCode || 500,
			message: (error as Error).message,
		})
	} finally {
		if (connection) {
			connection.release()
		}
	}
})
