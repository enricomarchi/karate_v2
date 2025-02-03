import { defineEventHandler } from "h3"
import { getConnection } from "~/server/utils/db"
import type { RowDataPacket } from "mysql2"
import type { Prova, Incontro } from "~/types/tabellone"

export default defineEventHandler(async (event) => {
	const id = event.context.params?.id
	let connection

	try {
		connection = await getConnection()
		const [provaDetails] = await connection.execute<
			(Prova & RowDataPacket)[]
		>(
			`SELECT p.*, t.codice_tabellone, t.pool,
                (SELECT COALESCE(
                    MAX(a.nome_accorpamento),
                    MAX(c.nome)
                )
                FROM tabelloni_categorie tc 
                LEFT JOIN categorie c ON tc.id_categoria = c.id_categoria
                LEFT JOIN accorpamenti a ON c.n_accorpamento = a.n_accorpamento
                WHERE tc.id_tabellone = t.id_tabellone
                ) as nome_tabellone,
                COALESCE(cp.calcola_totali, 0) as calcola_totali
             FROM prove p
             JOIN tabelloni t ON p.id_tabellone = t.id_tabellone
             LEFT JOIN configurazioni_prove cp ON t.configurazione_id = cp.config_id 
                  AND cp.ordine = p.numero_prova
             WHERE p.id_prova = ?`,
			[id]
		)

		const [incontri] = await connection.execute<
			(Incontro & RowDataPacket)[]
		>("SELECT * FROM vista_incontri WHERE id_prova = ? ORDER BY ordine", [
			id,
		])

		// Correggo la query includendo il campo posizione nel SELECT
		const [atleti] = await connection.execute<RowDataPacket[]>(
			`WITH atleti_posizioni AS (
                SELECT 
                    CASE 
                        WHEN ip.ordine = 1 AND ip.id_atleta_rosso IS NOT NULL THEN 1  -- Primo turno, rosso
                        WHEN ip.ordine = 1 AND ip.id_atleta_bianco IS NOT NULL THEN 2  -- Primo turno, bianco
                        WHEN ip.ordine = 2 AND ip.id_atleta_rosso IS NOT NULL THEN 3   -- Secondo turno, rosso
                        WHEN ip.ordine = 2 AND ip.id_atleta_bianco IS NOT NULL THEN 4  -- Secondo turno, bianco
                        WHEN ip.ordine = 3 AND ip.id_atleta_bianco IS NOT NULL THEN 5  -- Terzo turno, bianco
                    END as posizione,
                    CASE 
                        WHEN ip.ordine = 1 AND ip.id_atleta_rosso IS NOT NULL THEN ip.id_atleta_rosso
                        WHEN ip.ordine = 1 AND ip.id_atleta_bianco IS NOT NULL THEN ip.id_atleta_bianco
                        WHEN ip.ordine = 2 AND ip.id_atleta_rosso IS NOT NULL THEN ip.id_atleta_rosso
                        WHEN ip.ordine = 2 AND ip.id_atleta_bianco IS NOT NULL THEN ip.id_atleta_bianco
                        WHEN ip.ordine = 3 AND ip.id_atleta_bianco IS NOT NULL THEN ip.id_atleta_bianco
                    END as id_atleta
                FROM incontri_prova ip
                WHERE ip.id_prova = ? AND ip.ordine <= 3
            )
            SELECT DISTINCT a.id_atleta, a.cognome, a.nome, s.nome_societa, ap.posizione
            FROM atleti_posizioni ap
            JOIN atleti a ON ap.id_atleta = a.id_atleta
            LEFT JOIN societa s ON a.id_societa = s.id_societa
            WHERE ap.id_atleta IS NOT NULL
            ORDER BY ap.posizione`,
			[id]
		)

		return {
			...provaDetails[0],
			incontri,
			atleti,
		}
	} catch (error) {
		console.error("Errore nel recupero dei dati della prova:", error)
		throw error
	} finally {
		if (connection) await connection.release()
	}
})
