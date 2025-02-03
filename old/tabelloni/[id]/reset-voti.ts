import { defineEventHandler } from "h3"
import { getConnection } from "../../../utils/db"
import { RowDataPacket, PoolConnection } from "mysql2/promise"

interface ProvaRow extends RowDataPacket {
	id_prova: number
	is_finale: boolean
}

export default defineEventHandler(async (event) => {
	if (event.method !== "POST") {
		return { statusCode: 405, body: "Method Not Allowed" }
	}

	const id_tabellone = event.context.params?.id
	if (!id_tabellone) {
		throw new Error("ID tabellone non fornito")
	}

	let connection: PoolConnection | undefined

	try {
		connection = await getConnection()

		// 1. Recupera tutte le prove del tabellone, incluso il flag is_finale
		const [proveRows] = await connection.execute<ProvaRow[]>(
			"SELECT id_prova, is_finale FROM prove WHERE id_tabellone = ?",
			[id_tabellone]
		)

		if (!proveRows.length) {
			throw new Error("Nessuna prova trovata per questo tabellone")
		}

		await connection.beginTransaction()

		// 2. Per ogni prova, gestisci il reset in base al tipo (finale o non)
		for (const prova of proveRows) {
			if (!connection) throw new Error("Connessione persa")

			// 2.1 Elimina tutti i voti degli incontri della prova
			await connection.execute(
				`DELETE v FROM voti_incontro v 
                 INNER JOIN incontri_prova i ON v.id_incontro = i.id_incontro 
                 WHERE i.id_prova = ?`,
				[prova.id_prova]
			)

			if (prova.is_finale) {
				// 2.2.a Per la finale, elimina tutti gli incontri
				await connection.execute(
					`DELETE FROM incontri_prova 
                     WHERE id_prova = ?`,
					[prova.id_prova]
				)
			} else {
				// 2.2.b Per le altre prove, reimposta solo lo stato
				await connection.execute(
					`UPDATE incontri_prova SET stato = 'DA_INIZIARE' 
                     WHERE id_prova = ? AND stato = 'COMPLETATO'`,
					[prova.id_prova]
				)
			}

			// 2.3 Reimposta lo stato della prova
			await connection.execute(
				`UPDATE prove SET 
                 stato = 'DA_INIZIARE',
                 ora_inizio_effettiva = NULL,
                 ora_fine_effettiva = NULL
                 WHERE id_prova = ?`,
				[prova.id_prova]
			)
		}

		// 3. Elimina eventuali classifiche finali
		await connection.execute(
			"DELETE FROM classifiche_finali WHERE id_tabellone = ?",
			[id_tabellone]
		)

		await connection.commit()
		return { success: true }
	} catch (error) {
		if (connection) await connection.rollback()
		console.error("Errore nel reset dei voti:", error)
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Errore sconosciuto nel reset dei voti",
		}
	} finally {
		if (connection) await connection.release()
	}
})
