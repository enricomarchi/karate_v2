import { defineEventHandler, readBody, createError } from "h3"
import { getConnection } from "../../../utils/db"
import { PoolConnection } from "mysql2/promise"
import { ricalcolaConfigurazione } from "../../../utils/tabelloniUtils"

export default defineEventHandler(async (event) => {
	if (event.method !== "POST") {
		throw new Error("Method Not Allowed")
	}

	const body = await readBody(event)
	const id_tabellone_str = event.context.params?.id
	const configurazione_id = body.configurazione_id

	if (!id_tabellone_str || !configurazione_id) {
		throw createError({
			statusCode: 400,
			message: "ID tabellone o configurazione non forniti",
		})
	}

	const id_tabellone = parseInt(id_tabellone_str, 10)
	if (isNaN(id_tabellone)) {
		throw createError({
			statusCode: 400,
			message: "ID tabellone non valido",
		})
	}

	let connection: PoolConnection | null = null

	try {
		connection = await getConnection()
		await connection.beginTransaction()

		// Aggiorna la configurazione del tabellone
		await connection.execute(
			`UPDATE tabelloni SET configurazione_id = ? WHERE id_tabellone = ?`,
			[configurazione_id, id_tabellone]
		)

		// Ricalcola la configurazione
		await ricalcolaConfigurazione(connection, id_tabellone)

		await connection.commit()
		return { success: true }
	} catch (error) {
		if (connection) await connection.rollback()
		console.error("Errore nell'applicazione della configurazione:", error)
		throw createError({
			statusCode: 500,
			message:
				error instanceof Error ? error.message : "Errore sconosciuto",
		})
	} finally {
		if (connection) connection.release()
	}
})
