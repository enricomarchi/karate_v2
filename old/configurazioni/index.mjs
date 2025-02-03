import mysql from "mysql2/promise"
import dotenv from "dotenv"
import { defineEventHandler, readBody } from "h3"

dotenv.config()

const dbConfig = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
}

export default defineEventHandler(async (event) => {
	const method = event.method
	let connection

	try {
		connection = await mysql.createConnection(dbConfig)

		if (method === "GET") {
			const [rows] = await connection.execute(
				"SELECT * FROM vista_configurazioni"
			)

			return rows.map((row) => {
				let prove = []
				if (row.prove_json) {
					try {
						// Estrai l'array interno dal prove_json che è un array di array
						const provaArray = row.prove_json[0]
						prove = provaArray.map((prova) => ({
							...prova,
							is_finale: Boolean(prova.is_finale),
							calcola_totali: Boolean(prova.calcola_totali),
							regole_accesso:
								typeof prova.regole_accesso === "string"
									? JSON.parse(prova.regole_accesso)
									: prova.regole_accesso,
						}))
					} catch (error) {
						prove = []
					}
				}

				return {
					...row,
					prove,
					prove_json: undefined,
				}
			})
		}

		if (method === "POST") {
			const body = await readBody(event)
			await connection.beginTransaction()

			try {
				// Crea la configurazione principale
				const [result] = await connection.execute(
					"INSERT INTO configurazioni_tabelloni (nome) VALUES (?)",
					[body.nome]
				)

				const config_id = result.insertId

				// Inserisci le prove con i nuovi campi
				for (let i = 0; i < body.prove.length; i++) {
					const prova = body.prove[i]
					const durataMatch = (
						prova.durata_incontro || "00:00"
					).match(/^(\d{1,2}):(\d{1,2})$/)
					const minutes = durataMatch
						? Math.min(
								59,
								Math.max(0, parseInt(durataMatch[1]) || 0)
						  )
						: 0
					const seconds = durataMatch
						? Math.min(
								59,
								Math.max(0, parseInt(durataMatch[2]) || 0)
						  )
						: 0
					const durata = `${minutes
						.toString()
						.padStart(2, "0")}:${seconds
						.toString()
						.padStart(2, "0")}`

					// Insert the prove first
					const [provaResult] = await connection.execute(
						`INSERT INTO configurazioni_prove 
						 (config_id, disciplina, nome_prova, ordine, tipo_tabellone, 
						  template_tabellone, numero_arbitri, is_finale, calcola_totali, durata_incontro) 
						 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TIME(?))`,
						[
							config_id,
							prova.disciplina || "",
							prova.nome_prova || "",
							i + 1,
							prova.tipo_tabellone || "punteggio",
							prova.template_tabellone,
							prova.numero_arbitri || 3,
							prova.is_finale || false,
							prova.calcola_totali || false,
							durata,
						]
					)

					// If this is a final, insert the access rules
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
				return { success: true, id: config_id }
			} catch (error) {
				await connection.rollback()
				throw error
			}
		}

		throw new Error(`Metodo ${method} non supportato`)
	} catch (error) {
		console.error("Errore nella gestione delle configurazioni:", error)
		return { success: false, error: error.message }
	} finally {
		if (connection) await connection.end()
	}
})
