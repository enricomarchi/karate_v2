import { getConnection } from "../../utils/db.js"
import { defineEventHandler, readBody, H3Event } from "h3"
import dotenv from "dotenv"
import type { Tabellone } from "../../../types/tabellone"

dotenv.config()

async function updateTabelliFromCategorie(connection: any) {
	try {
		// Recupera tutti i tabelloni con le loro categorie
		const [tabelloni]: [Tabellone[]] = await connection.execute(`
            SELECT t.id_tabellone, t.codice_tabellone, 
                   GROUP_CONCAT(c.id_categoria) as categorie,
                   GROUP_CONCAT(c.n_accorpamento) as accorpamenti,
                   GROUP_CONCAT(DISTINCT c.n_accorpamento) as unique_accorpamenti
            FROM tabelloni t
            LEFT JOIN tabelloni_categorie tc ON t.id_tabellone = tc.id_tabellone
            LEFT JOIN categorie c ON tc.id_categoria = c.id_categoria
            GROUP BY t.id_tabellone
        `)

		if (!tabelloni.length) return // Se non ci sono tabelloni, esci

		for (const tabellone of tabelloni) {
			// Verifica che i valori esistano prima di fare split
			const categorie = tabellone.categorie
				? tabellone.categorie.split(",")
				: []
			const accorpamenti = tabellone.accorpamenti
				? tabellone.accorpamenti.split(",")
				: []
			const uniqueAccorpamenti = [
				...new Set(accorpamenti.filter((a) => a && a !== "null")),
			]

			if (uniqueAccorpamenti.length > 0) {
				const [categorieAccorpate]: [{ nomi: string }[]] =
					await connection.execute(
						`
                    SELECT GROUP_CONCAT(DISTINCT nome_accorpamento) as nomi
                    FROM accorpamenti 
                    WHERE n_accorpamento IN (?)
                `,
						[uniqueAccorpamenti]
					)

				if (categorieAccorpate[0]?.nomi) {
					await connection.execute(
						`
                        UPDATE tabelloni 
                        SET nome_tabellone = ?
                        WHERE id_tabellone = ?
                    `,
						[categorieAccorpate[0].nomi, tabellone.id_tabellone]
					)
				}
			}

			// Verifica se ci sono pool solo se ci sono categorie
			if (categorie.length > 0) {
				const [pools]: [{ num_pools: number }[]] =
					await connection.execute(
						`
                    SELECT COUNT(DISTINCT pool) as num_pools
                    FROM iscrizioni
                    WHERE id_categoria IN (?)
                    AND pool IS NOT NULL
                `,
						[categorie]
					)

				if (pools[0]?.num_pools > 0) {
					await connection.execute(
						`
                        UPDATE tabelloni 
                        SET nome_tabellone = CONCAT(nome_tabellone, ' (', ?, ' pool)')
                        WHERE id_tabellone = ?
                        AND nome_tabellone NOT LIKE '%(% pool)%'
                    `,
						[pools[0].num_pools, tabellone.id_tabellone]
					)
				}
			}
		}
	} catch (error) {
		console.error("Errore nell'aggiornamento dei tabelloni:", error)
		throw error
	}
}

export default defineEventHandler(async (event: H3Event) => {
	const method = event.node.req.method
	let connection: any

	try {
		connection = await getConnection()

		// GET: recupera tutti i tabelloni
		if (method === "GET") {
			const [rows]: [any[]] = await connection.execute(`
                SELECT * FROM vista_tabelloni 
                ORDER BY 
                    CASE 
                        WHEN codice_tabellone REGEXP '-' THEN 
                            CAST(SUBSTRING_INDEX(codice_tabellone, '-', 1) AS SIGNED)
                        WHEN codice_tabellone REGEXP '\\.' THEN 
                            CAST(SUBSTRING_INDEX(codice_tabellone, '.', 1) AS SIGNED)
                        ELSE 
                            CAST(codice_tabellone AS SIGNED)
                    END,
                    CASE 
                        WHEN codice_tabellone REGEXP '\\.' THEN 
                            CAST(SUBSTRING_INDEX(codice_tabellone, '.', -1) AS SIGNED)
                        ELSE 0
                    END
            `)
			return rows
		}

		// POST: crea un nuovo tabellone
		if (method === "POST") {
			const body = await readBody(event)

			console.log("Dati ricevuti:", body) // Debug log

			if (
				!body.codice_tabellone ||
				!body.nome_tabellone ||
				!body.categoria_id
			) {
				console.error("Dati mancanti:", { body }) // Debug log
				return { success: false, error: "Dati richiesti mancanti" }
			}

			await connection.beginTransaction()

			try {
				// Verifica se il tabellone esiste
				const [existingTabellone]: [any[]] = await connection.execute(
					"SELECT id_tabellone FROM tabelloni WHERE codice_tabellone = ? AND COALESCE(pool, 0) = COALESCE(?, 0)",
					[body.codice_tabellone, body.pool || 0]
				)

				let id_tabellone: number

				if (existingTabellone.length > 0) {
					console.log(
						"Tabellone esistente trovato:",
						existingTabellone[0]
					) // Debug log
					id_tabellone = existingTabellone[0].id_tabellone

					// Aggiorna il tabellone esistente
					await connection.execute(
						"UPDATE tabelloni SET nome_tabellone = ? WHERE id_tabellone = ?",
						[body.nome_tabellone, id_tabellone]
					)

					// Rimuovi le vecchie categorie
					await connection.execute(
						"DELETE FROM tabelloni_categorie WHERE id_tabellone = ?",
						[id_tabellone]
					)
				} else {
					console.log("Creazione nuovo tabellone") // Debug log
					// Inserisci nuovo tabellone
					const [result]: [any] = await connection.execute(
						"INSERT INTO tabelloni (codice_tabellone, nome_tabellone, pool) VALUES (?, ?, ?)",
						[
							body.codice_tabellone,
							body.nome_tabellone,
							body.pool || null,
						]
					)
					id_tabellone = result.insertId
				}

				// Inserisci le categorie
				const categorie = Array.isArray(body.categoria_id)
					? body.categoria_id
					: [body.categoria_id]
				for (const categoria_id of categorie) {
					await connection.execute(
						"INSERT INTO tabelloni_categorie (id_tabellone, id_categoria) VALUES (?, ?)",
						[id_tabellone, categoria_id]
					)
				}

				await connection.commit()
				console.log(
					"Tabellone creato/aggiornato con successo:",
					id_tabellone
				) // Debug log
				return { success: true, id_tabellone }
			} catch (error) {
				await connection.rollback()
				console.error(
					"Errore nella creazione/aggiornamento del tabellone:",
					error
				)
				throw error
			}
		}

		throw new Error(`Metodo ${method} non supportato`)
	} catch (error) {
		console.error("Errore nella gestione dei tabelloni:", error)
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Errore sconosciuto",
		}
	} finally {
		if (connection) {
			connection.release()
		}
	}
})
