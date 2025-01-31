import { defineEventHandler, getQuery, readBody, assertMethod } from "h3"
import { getConnection } from "../utils/db"
import type { ResultSetHeader } from "mysql2/promise"
import type { CinturaRow, Cintura, MySQLError } from "~/types/global"

export default defineEventHandler(async (event) => {
	const method = event.node.req.method
	const query = getQuery(event)
	let body: Cintura = {} as Cintura

	if (method !== "GET") {
		body = await readBody(event)
	}

	let connection

	try {
		assertMethod(event, ["GET", "POST", "PUT", "DELETE"])

		connection = await getConnection()

		if (method === "GET") {
			const [rows] = await connection.execute<CinturaRow[]>(
				"SELECT * FROM cinture ORDER BY kyu DESC"
			)
			return rows
		} else if (method === "POST") {
			const { colore, kyu } = body as Cintura
			if (!colore || kyu === undefined) {
				throw new Error("Parametri mancanti")
			}

			const [result] = await connection.execute<ResultSetHeader>(
				"INSERT INTO cinture (colore, kyu) VALUES (?, ?)",
				[colore, kyu]
			)
			const response: Cintura = {
				id_cintura: result.insertId,
				colore,
				kyu,
			}
			return response
		} else if (method === "PUT") {
			const { id } = query
			const { colore, kyu } = body as Cintura
			if (id && colore && kyu !== undefined) {
				await connection.execute(
					"UPDATE cinture SET colore = ?, kyu = ? WHERE id_cintura = ?",
					[colore, kyu, id]
				)
				return { id, colore, kyu }
			} else {
				throw new Error(
					"Parametri mancanti per l'aggiornamento della cintura"
				)
			}
		} else if (method === "DELETE") {
			const { id } = query
			if (id) {
				await connection.execute(
					"DELETE FROM cinture WHERE id_cintura = ?",
					[id]
				)
				return { id }
			} else {
				throw new Error(
					"ID mancante per la cancellazione della cintura"
				)
			}
		}
	} catch (error) {
		console.error("Errore nella gestione delle cinture:", error)
		const mysqlError = error as MySQLError
		return { success: false, error: mysqlError.message }
	} finally {
		if (connection) {
			connection.release()
		}
	}
})
