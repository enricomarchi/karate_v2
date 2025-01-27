import { defineEventHandler, createError } from "h3"
import { getConnection } from "../../utils/db.ts"

export default defineEventHandler(async (event) => {
	let connection
	try {
		connection = await getConnection()
		const [rows] = await connection.execute(
			"SELECT * FROM atleti_senza_categoria"
		)
		return rows
	} catch (error) {
		console.error(
			"Errore nella gestione delle iscrizioni non assegnate:",
			error
		)
		throw createError({
			statusCode: 500,
			statusMessage: "Errore database",
			message: error.message,
		})
	} finally {
		if (connection) connection.release()
	}
})
