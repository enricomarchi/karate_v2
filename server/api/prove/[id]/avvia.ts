import { defineEventHandler } from "h3"
import { getConnection } from "../../../utils/db"
import { RowDataPacket } from "mysql2/promise"

interface ProvaRow extends RowDataPacket {
	id_prova: number
	id_tabellone: number
	numero_prova: number
	ora_inizio_effettiva: Date | null
	prima_prova: number
}

export default defineEventHandler(async (event) => {
	const id = event.context.params?.id
	let connection

	try {
		connection = await getConnection()
		await connection.beginTransaction()

		// Ottieni informazioni sulla prova e il tabellone
		const [rows] = await connection.execute<ProvaRow[]>(
			`SELECT p.*, t.id_tabellone, t.ora_inizio_effettiva,
             (SELECT MIN(numero_prova) FROM prove WHERE id_tabellone = t.id_tabellone) as prima_prova
             FROM prove p
             JOIN tabelloni t ON p.id_tabellone = t.id_tabellone
             WHERE p.id_prova = ?`,
			[id]
		)

		if (!rows.length) throw new Error("Prova non trovata")

		const prova = rows[0]
		const now = new Date()

		// Aggiorna lo stato della prova
		await connection.execute(
			`UPDATE prove 
             SET stato = 'IN_CORSO', ora_inizio_effettiva = ? 
             WHERE id_prova = ?`,
			[now, id]
		)

		// Se questa è la prima prova del tabellone E il tabellone non ha già un'ora di inizio
		if (
			prova.numero_prova === prova.prima_prova &&
			!prova.ora_inizio_effettiva
		) {
			await connection.execute(
				`UPDATE tabelloni 
                 SET ora_inizio_effettiva = ? 
                 WHERE id_tabellone = ? AND ora_inizio_effettiva IS NULL`,
				[now, prova.id_tabellone]
			)
		}

		await connection.commit()
		return { success: true }
	} catch (error) {
		if (connection) await connection.rollback()
		console.error("Errore nell'avvio della prova:", error)
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred"
		return { success: false, error: errorMessage }
	} finally {
		if (connection) connection.release()
	}
})
