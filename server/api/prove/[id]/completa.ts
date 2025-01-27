import { defineEventHandler, createError } from "h3"
import { getConnection } from "../../../utils/db"
import { RowDataPacket, OkPacket, PoolConnection } from "mysql2/promise" // Cambiato Connection in PoolConnection

interface ProvaRow extends RowDataPacket {
	id_prova: number
	stato: string
	id_tabellone: number
	stato_tabellone: string
}

interface ProveInfoRow extends RowDataPacket {
	totale_prove: number
	prove_completate: number
}

interface ProvaFinale extends RowDataPacket {
	id_prova: number
	is_finale: boolean
	regole_accesso: string | null // Può essere null
}

interface RegoleAccesso {
	criteri: Array<{
		tipo: "numero_finalisti" | "bandierine_totali" | "percentuale_atleti"
		valore: number
	}>
}

export default defineEventHandler(async (event) => {
	const id = event.context.params?.id
	let connection: PoolConnection | null = null // Cambiato da Connection a PoolConnection

	try {
		connection = await getConnection()
		await connection.beginTransaction()

		// Ottieni informazioni sulla prova e il tabellone
		const [rows] = await connection.execute<ProvaRow[]>(
			`SELECT p.*, t.id_tabellone, t.stato as stato_tabellone
             FROM prove p 
             JOIN tabelloni t ON p.id_tabellone = t.id_tabellone 
             WHERE p.id_prova = ?`,
			[id]
		)

		if (!rows.length) throw new Error("Prova non trovata")
		const prova = rows[0]
		const now = new Date()

		// Aggiorna lo stato e l'ora di fine della prova
		await connection.execute(
			`UPDATE prove 
             SET stato = 'COMPLETATA', ora_fine_effettiva = ? 
             WHERE id_prova = ?`,
			[now, id]
		)

		// Verifica se tutte le prove del tabellone sono completate
		const [proveInfo] = await connection.execute<ProveInfoRow[]>(
			`SELECT 
                COUNT(*) as totale_prove,
                COUNT(CASE WHEN stato = 'COMPLETATA' OR id_prova = ? THEN 1 END) as prove_completate
             FROM prove 
             WHERE id_tabellone = ?`,
			[id, prova.id_tabellone]
		)

		// Se tutte le prove sono completate, aggiorna il tabellone
		if (proveInfo[0].totale_prove === proveInfo[0].prove_completate) {
			await connection.execute(
				`UPDATE tabelloni 
                 SET stato = 'COMPLETATO', 
                     ora_fine_effettiva = CASE 
                         WHEN ora_fine_effettiva IS NULL THEN ?
                         ELSE ora_fine_effettiva
                     END 
                 WHERE id_tabellone = ?`,
				[now, prova.id_tabellone]
			)
		}

		// Verifica se tutte le prove non finali sono state completate
		const [proveInfoFinale] = await connection.execute<RowDataPacket[]>(
			`SELECT 
                p1.id_tabellone,
                (SELECT COUNT(*) FROM prove p2 WHERE p2.id_tabellone = p1.id_tabellone AND p2.is_finale = 0) as totale_prove,
                (SELECT COUNT(*) FROM prove p3 WHERE p3.id_tabellone = p1.id_tabellone AND p3.is_finale = 0 AND p3.stato = 'COMPLETATA') as prove_completate,
                (SELECT COUNT(*) FROM prove p4 WHERE p4.id_tabellone = p1.id_tabellone AND p4.is_finale = 1) as ha_finale
            FROM prove p1 
            WHERE p1.id_prova = ?
            GROUP BY p1.id_tabellone`,
			[id]
		)

		if (
			proveInfoFinale[0].totale_prove ===
				proveInfoFinale[0].prove_completate &&
			proveInfoFinale[0].ha_finale
		) {
			// Verifica se la prova finale ha già degli incontri
			const [incontriFinale] = await connection.execute<RowDataPacket[]>(
				`SELECT COUNT(*) as num_incontri 
                 FROM incontri_prova ip 
                 JOIN prove p ON ip.id_prova = p.id_prova 
                 WHERE p.id_tabellone = ? AND p.is_finale = 1`,
				[proveInfoFinale[0].id_tabellone]
			)

			// Prima di generare nuovi incontri, elimina quelli esistenti
			if (incontriFinale[0].num_incontri === 0) {
				const [provaFinale] = await connection.execute<RowDataPacket[]>(
					`SELECT id_prova FROM prove WHERE id_tabellone = ? AND is_finale = 1`,
					[proveInfoFinale[0].id_tabellone]
				)

				if (provaFinale.length > 0) {
					// Ottieni tipo e template del tabellone della finale
					const [tipoTabellone] = await connection.execute<
						RowDataPacket[]
					>(
						`SELECT tipo_tabellone, template_tabellone 
						 FROM prove 
						 WHERE id_prova = ?`,
						[provaFinale[0].id_prova]
					)

					// Ottieni gli atleti qualificati
					const [atletiQualificati] = await connection.execute<
						RowDataPacket[]
					>(
						`WITH RisultatiAtleti AS (
							SELECT 
								a.id_atleta,
								a.id_societa,
								COUNT(DISTINCT CASE 
									WHEN vi.voto = 'ROSSO' AND ip.id_atleta_rosso = a.id_atleta THEN ip.id_incontro
									WHEN vi.voto = 'BIANCO' AND ip.id_atleta_bianco = a.id_atleta THEN ip.id_incontro
								END) as vittorie
							FROM atleti a
							JOIN incontri_prova ip ON (ip.id_atleta_rosso = a.id_atleta OR ip.id_atleta_bianco = a.id_atleta)
							JOIN prove p ON ip.id_prova = p.id_prova
							LEFT JOIN voti_incontro vi ON ip.id_incontro = vi.id_incontro
							WHERE p.id_tabellone = ? AND p.is_finale = 0
							GROUP BY a.id_atleta, a.id_societa
							ORDER BY vittorie DESC
							LIMIT 8
						)
						SELECT id_atleta, id_societa FROM RisultatiAtleti`,
						[proveInfoFinale[0].id_tabellone]
					)

					// Elimina eventuali incontri esistenti
					await connection.execute(
						"DELETE FROM incontri_prova WHERE id_prova = ?",
						[provaFinale[0].id_prova]
					)

					// Aggiorna lo stato della prova finale
					await connection.execute(
						"UPDATE prove SET stato = 'DA_INIZIARE' WHERE id_prova = ?",
						[provaFinale[0].id_prova]
					)
				}
			}
		}

		await connection.commit()
		return { success: true }
	} catch (error) {
		if (connection) await connection.rollback()
		console.error("Errore nel completamento della prova:", error)
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Errore sconosciuto",
		}
	} finally {
		if (connection) connection.release()
	}
})
