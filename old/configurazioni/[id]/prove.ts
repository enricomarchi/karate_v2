import { defineEventHandler } from "h3"
import { getConnection } from "~/server/utils/db"

export default defineEventHandler(async (event) => {
	const id = event.context.params?.id
	let connection

	try {
		connection = await getConnection()
		const [rows] = await connection.execute(
			`SELECT 
                disciplina,
                nome_prova,
                ordine,
                tipo_tabellone,
                numero_arbitri,
                is_finale,
                regole_accesso,
                calcola_totali
             FROM configurazioni_prove 
             WHERE config_id = ? 
             ORDER BY ordine`,
			[id]
		)
		return rows
	} catch (error) {
		console.error("Errore nel recupero delle prove:", error)
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred"
		return { success: false, error: errorMessage }
	} finally {
		if (connection) await connection.release()
	}
})
