import { defineEventHandler, readBody } from "h3"
import { getConnection } from "~/server/utils/db"
import type mysql from "mysql2/promise"
import type {
	Configurazione,
	ConfigurazioneProva,
} from "~/types/configurazioni"

export default defineEventHandler(async (event) => {
	const id = event.context.params?.id
	const method = event.method
	let connection

	// Aggiungi questa funzione di validazione
	const validateTimeFormat = (time: string): string => {
		if (!time) return "00:00:00" // Default changed to "no time"

		const match = time.match(/^(\d{1,2}):(\d{1,2})$/)
		if (!match) return "00:00:00"

		const minutes = Math.min(59, Math.max(0, parseInt(match[1]) || 0))
		const seconds = Math.min(59, Math.max(0, parseInt(match[2]) || 0))

		// Se sia minuti che secondi sono 0, restituisci 00:00:00 (no time)
		// altrimenti aggiungi il prefisso delle ore (00)
		return `00:${minutes.toString().padStart(2, "0")}:${seconds
			.toString()
			.padStart(2, "0")}`
	}

	try {
		connection = await getConnection()

		// GET: recupera una configurazione
		if (method === "GET") {
			// Prima recupera la configurazione base
			const [configRows] = await connection.execute<
				mysql.RowDataPacket[]
			>("SELECT * FROM configurazioni_tabelloni WHERE id = ?", [id])

			if (!configRows[0]) {
				return { error: "Configurazione non trovata" }
			}

			// Recupera le prove
			const [proveRows] = await connection.execute<mysql.RowDataPacket[]>(
				`SELECT * FROM configurazioni_prove WHERE config_id = ? ORDER BY ordine`,
				[id]
			)

			// Per ogni prova recupera le regole di accesso
			const prove = await Promise.all(
				proveRows.map(async (prova) => {
					const [regoleRows] = await connection.execute<
						mysql.RowDataPacket[]
					>(
						`SELECT tipo_regola, valore FROM regole_accesso WHERE id_prova = ?`,
						[prova.id]
					)

					return {
						disciplina: prova.disciplina,
						nome_prova: prova.nome_prova,
						ordine: prova.ordine,
						tipo_tabellone: prova.tipo_tabellone,
						template_tabellone: prova.template_tabellone,
						numero_arbitri: prova.numero_arbitri,
						is_finale: Boolean(prova.is_finale),
						calcola_totali: Boolean(prova.calcola_totali),
						durata_incontro: prova.durata_incontro
							? prova.durata_incontro.substring(3, 8)
							: "00:00",
						regole_accesso: {
							criteri: regoleRows.map((regola) => ({
								tipo: regola.tipo_regola,
								valore: regola.valore,
							})),
						},
					}
				})
			)

			return {
				...configRows[0],
				prove,
			}
		}

		// PUT: aggiorna una configurazione
		if (method === "PUT") {
			const body = await readBody(event)
			await connection.beginTransaction()

			try {
				// Update main configuration
				await connection.execute(
					"UPDATE configurazioni_tabelloni SET nome = ? WHERE id = ?",
					[body.nome || "", id]
				)

				// Get current prove to handle deletions
				const [currentProve] = await connection.execute<
					mysql.RowDataPacket[]
				>("SELECT id FROM configurazioni_prove WHERE config_id = ?", [
					id,
				])

				// Delete all existing prove and their rules
				await connection.execute(
					"DELETE FROM configurazioni_prove WHERE config_id = ?",
					[id]
				)

				// Insert new prove and rules
				for (let i = 0; i < body.prove.length; i++) {
					const prova = body.prove[i]
					const [provaResult] = await connection.execute(
						`INSERT INTO configurazioni_prove 
						 (config_id, disciplina, nome_prova, ordine, tipo_tabellone, 
						  template_tabellone, numero_arbitri, is_finale, calcola_totali, durata_incontro) 
						 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TIME(?))`,
						[
							id,
							prova.disciplina || "",
							prova.nome_prova || "",
							i + 1,
							prova.tipo_tabellone || "punteggio",
							prova.template_tabellone,
							prova.numero_arbitri || 3,
							prova.is_finale || false,
							prova.calcola_totali || false,
							validateTimeFormat(
								prova.durata_incontro || "00:00"
							),
						]
					)

					// Insert access rules if it's a final
					if (prova.is_finale && prova.regole_accesso?.criteri) {
						for (const criterio of prova.regole_accesso.criteri) {
							await connection.execute(
								`INSERT INTO regole_accesso (id_prova, tipo_regola, valore) 
								 VALUES (?, ?, ?)`,
								[
									provaResult.insertId,
									criterio.tipo,
									criterio.valore,
								]
							)
						}
					}
				}

				await connection.commit()
				return { success: true }
			} catch (error) {
				await connection.rollback()
				throw error
			}
		}

		// DELETE: elimina una configurazione
		if (method === "DELETE") {
			await connection.beginTransaction()

			try {
				// Elimina prima le prove associate
				await connection.execute(
					"DELETE FROM configurazioni_prove WHERE config_id = ?",
					[id]
				)

				// Poi elimina la configurazione
				await connection.execute(
					"DELETE FROM configurazioni_tabelloni WHERE id = ?",
					[id]
				)

				await connection.commit()
				return { success: true }
			} catch (error) {
				await connection.rollback()
				throw error
			}
		}

		throw new Error(`Metodo ${method} non supportato`)
	} catch (error) {
		console.error("Errore nella gestione della configurazione:", error)
		const errorMessage =
			error instanceof Error ? error.message : "An unknown error occurred"
		return { success: false, error: errorMessage }
	} finally {
		if (connection) await connection.release() // usiamo release invece di end per le connessioni dal pool
	}
})
