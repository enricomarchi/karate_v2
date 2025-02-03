import { defineEventHandler, readBody } from "h3"
import { getConnection } from "../../../utils/db"
import { RowDataPacket } from "mysql2/promise"
import { ricalcolaConfigurazione } from "../../../utils/tabelloniUtils"

interface ProvaRow extends RowDataPacket {
	id_prova: number
	numero_arbitri: number
	is_finale: boolean
}

interface IncontroProva extends RowDataPacket {
	id_incontro: number
	id_atleta_rosso: number
	id_atleta_bianco: number | null
}

interface AtletaRow extends RowDataPacket {
	id_atleta: number
	id_societa: number
	nome: string
	cognome: string
	nome_societa: string
}

export default defineEventHandler(async (event) => {
	if (event.method !== "POST") {
		return { statusCode: 405, body: "Method Not Allowed" }
	}

	const id = event.context.params?.id
	if (!id) {
		throw new Error("ID tabellone non fornito")
	}

	const body = await readBody(event)
	const atletiSelezionati = body.atleti as number[]
	let connection

	try {
		connection = await getConnection()
		await connection.beginTransaction()

		// 1. Recupera le prove non finali e assegna i voti per far passare gli atleti selezionati
		const [proveNonFinali] = await connection.execute<ProvaRow[]>(
			"SELECT id_prova, numero_arbitri FROM prove WHERE id_tabellone = ? AND is_finale = 0",
			[id]
		)

		// Per ogni prova non finale
		for (const prova of proveNonFinali) {
			// Recupera gli incontri della prova
			const [incontri] = await connection.execute<IncontroProva[]>(
				"SELECT id_incontro, id_atleta_rosso, id_atleta_bianco FROM incontri_prova WHERE id_prova = ? ORDER BY ordine",
				[prova.id_prova]
			)

			// Per ogni incontro, determina il vincitore in base agli atleti selezionati
			for (const incontro of incontri) {
				const rossoSelezionato = atletiSelezionati.includes(
					incontro.id_atleta_rosso
				)
				const biancoSelezionato = incontro.id_atleta_bianco
					? atletiSelezionati.includes(incontro.id_atleta_bianco)
					: false

				// Determina il voto da assegnare
				let voto = "ROSSO"
				if (!rossoSelezionato && biancoSelezionato) {
					voto = "BIANCO"
				}

				// Assegna i voti per tutti gli arbitri
				for (let i = 1; i <= prova.numero_arbitri; i++) {
					await connection.execute(
						`INSERT INTO voti_incontro (id_incontro, numero_arbitro, voto)
                         VALUES (?, ?, ?)
                         ON DUPLICATE KEY UPDATE voto = ?`,
						[incontro.id_incontro, i, voto, voto]
					)
				}
			}

			// Segna la prova come completata
			await connection.execute(
				"UPDATE prove SET stato = 'COMPLETATA', ora_fine_effettiva = CURRENT_TIMESTAMP WHERE id_prova = ?",
				[prova.id_prova]
			)
		}

		// 2. Gestione della prova finale
		const [proveFinali] = await connection.execute<ProvaRow[]>(
			"SELECT id_prova FROM prove WHERE id_tabellone = ? AND is_finale = 1",
			[id]
		)

		if (proveFinali.length === 0) {
			throw new Error("Nessuna prova finale trovata")
		}

		// 3. Recupera i dati completi degli atleti selezionati
		const placeholders = atletiSelezionati.map(() => "?").join(",")
		const [atleti] = await connection.execute<AtletaRow[]>(
			`SELECT 
                a.id_atleta,
                a.id_societa,
                a.nome,
                a.cognome,
                s.nome_societa
            FROM atleti a
            JOIN societa s ON a.id_societa = s.id_societa 
            WHERE a.id_atleta IN (${placeholders})`,
			atletiSelezionati
		)

		if (atleti.length === 0) {
			throw new Error("Nessun atleta trovato per gli ID selezionati")
		}

		// 4. Usa ricalcolaConfigurazione per rigenerare la prova finale
		await ricalcolaConfigurazione(
			connection,
			parseInt(id),
			proveFinali[0].id_prova,
			atleti
		)

		// 5. Attiva il tabellone
		await connection.execute(
			"UPDATE tabelloni SET stato = 'ATTIVO' WHERE id_tabellone = ?",
			[id]
		)

		await connection.commit()
		return { success: true }
	} catch (error) {
		if (connection) await connection.rollback()
		console.error("Errore nella selezione manuale:", error)
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Errore sconosciuto",
		}
	} finally {
		if (connection) connection.release()
	}
})
