import { defineEventHandler } from "h3"
import { getConnection } from "../../../utils/db"
import { RowDataPacket } from "mysql2/promise"

interface Tabellone extends RowDataPacket {
	stato: string
}

interface ProvaRow extends RowDataPacket {
	id_prova: number
	is_finale: boolean
}

export default defineEventHandler(async (event) => {
	if (event.method !== "POST") {
		return { statusCode: 405, body: "Method Not Allowed" }
	}

	const id = event.context.params?.id
	if (!id) throw new Error("ID tabellone non fornito")

	const connection = await getConnection()

	try {
		await connection.beginTransaction()

		// Verifica lo stato corrente del tabellone
		const [tabellone] = await connection.execute<Tabellone[]>(
			"SELECT stato FROM tabelloni WHERE id_tabellone = ?",
			[id]
		)

		if (!tabellone.length) {
			throw new Error("Tabellone non trovato")
		}

		if (tabellone[0].stato !== "ATTIVO") {
			throw new Error("Solo i tabelloni ATTIVI possono tornare in BOZZA")
		}

		// 1. Recupera tutte le prove del tabellone
		const [proveRows] = await connection.execute<ProvaRow[]>(
			"SELECT id_prova, is_finale FROM prove WHERE id_tabellone = ?",
			[id]
		)

		// 2. Reset dei voti e degli incontri
		for (const prova of proveRows) {
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
                     WHERE id_prova = ?`,
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
			[id]
		)

		// 4. Torna in bozza il tabellone
		await connection.execute(
			"UPDATE tabelloni SET stato = 'BOZZA' WHERE id_tabellone = ?",
			[id]
		)

		await connection.commit()
		return { success: true }
	} catch (error) {
		await connection.rollback()
		console.error("Errore nel tornare in bozza:", error)
		throw error
	} finally {
		connection.release()
	}
})
