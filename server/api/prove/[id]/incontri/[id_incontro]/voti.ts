import { defineEventHandler, readBody } from "h3"
import { getConnection } from "../../../../../utils/db"
import { RowDataPacket } from "mysql2/promise"

interface IncontroRow extends RowDataPacket {
	id_atleta_bianco: number | null
}

export default defineEventHandler(async (event) => {
	if (event.method !== "POST") {
		return { statusCode: 405, body: "Method Not Allowed" }
	}

	const { arbitro, voto } = await readBody(event)
	const params = event.context.params || {}
	const id_incontro = params.id_incontro

	if (!id_incontro) {
		throw new Error("ID incontro non fornito")
	}

	let connection

	try {
		connection = await getConnection()

		// Prima ottieni il numero di arbitri previsto per la prova
		const [provaRows] = await connection.execute<RowDataPacket[]>(
			"SELECT p.numero_arbitri FROM incontri_prova i JOIN prove p ON i.id_prova = p.id_prova WHERE i.id_incontro = ?",
			[id_incontro]
		)
		const numeroArbitriPrevisto = provaRows[0]?.numero_arbitri

		// Modifica qui per usare il tipo corretto
		const [incontroRows] = await connection.execute<IncontroRow[]>(
			"SELECT id_atleta_bianco FROM incontri_prova WHERE id_incontro = ?",
			[id_incontro]
		)

		const incontro = incontroRows[0]

		// Se non c'è atleta bianco, assegna automaticamente il voto ROSSO
		if (!incontro.id_atleta_bianco) {
			await connection.execute(
				`INSERT INTO voti_incontro (id_incontro, numero_arbitro, voto)
				 VALUES (?, ?, 'ROSSO')
				 ON DUPLICATE KEY UPDATE voto = 'ROSSO'`,
				[id_incontro, arbitro]
			)

			// Aggiorna lo stato dell'incontro a COMPLETATO
			await connection.execute(
				`UPDATE incontri_prova 
				 SET stato = 'COMPLETATO'
				 WHERE id_incontro = ?`,
				[id_incontro]
			)
		} else {
			// Comportamento normale per incontri con due atleti
			await connection.execute(
				`INSERT INTO voti_incontro (id_incontro, numero_arbitro, voto)
				 VALUES (?, ?, ?)
				 ON DUPLICATE KEY UPDATE voto = ?`,
				[id_incontro, arbitro, voto, voto]
			)
		}

		// Controlla se tutti gli arbitri hanno votato
		const [votiAttuali] = await connection.execute<RowDataPacket[]>(
			"SELECT COUNT(*) as count FROM voti_incontro WHERE id_incontro = ?",
			[id_incontro]
		)

		// Se il numero di voti corrisponde al numero di arbitri previsto, imposta lo stato a COMPLETATO
		if (votiAttuali[0].count === numeroArbitriPrevisto) {
			await connection.execute(
				"UPDATE incontri_prova SET stato = 'COMPLETATO' WHERE id_incontro = ?",
				[id_incontro]
			)
		}

		return { success: true }
	} catch (error) {
		console.error("Errore nell'assegnazione del voto:", error)
		return { success: false, error: (error as Error).message }
	} finally {
		if (connection) connection.release()
	}
})
