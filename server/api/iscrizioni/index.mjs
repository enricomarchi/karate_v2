import mysql from "mysql2/promise"
import dotenv from "dotenv"
import {
	defineEventHandler,
	getQuery,
	readBody,
	assertMethod,
	createError,
} from "h3"
import {
	findTabelloniByIscrizione,
	ricalcolaConfigurazione,
} from "../../utils/tabelloniUtils"

dotenv.config()

const dbConfig = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	connectTimeout: 10000,
}

export default defineEventHandler(async (event) => {
	const method = event.node.req.method
	const query = getQuery(event)
	let body = {}

	if (method !== "GET") {
		body = await readBody(event)
	}

	let connection

	try {
		assertMethod(event, ["GET", "POST", "PUT", "DELETE"])

		connection = await mysql.createConnection(dbConfig)

		if (method === "GET") {
			const { id } = query
			if (id) {
				const [rows] = await connection.execute(
					"SELECT * FROM dettaglio_iscrizioni WHERE id_iscrizione = ?",
					[id]
				)
				return rows[0]
			} else {
				const [rows] = await connection.execute(
					"SELECT * FROM dettaglio_iscrizioni"
				)
				return rows
			}
		} else if (method === "POST") {
			const { id_atleta, id_disciplina, nuovo_atleta } = body
			let atletaId = id_atleta

			// Validazione iniziale
			if (!id_atleta && !nuovo_atleta) {
				throw new Error(
					"È necessario fornire o id_atleta o i dati del nuovo_atleta"
				)
			}

			if (!id_disciplina) {
				throw new Error("id_disciplina è obbligatorio")
			}

			// Se abbiamo i dati per un nuovo atleta, verifichiamo che siano completi
			if (nuovo_atleta) {
				if (
					!nuovo_atleta.nome ||
					!nuovo_atleta.cognome ||
					!nuovo_atleta.data_nascita ||
					!nuovo_atleta.sesso ||
					!nuovo_atleta.id_societa ||
					!nuovo_atleta.cintura_id // Aggiungiamo questo controllo
				) {
					throw new Error("Dati del nuovo atleta incompleti")
				}

				// Estraiamo l'anno dalla data di nascita
				const anno_nascita = new Date(
					nuovo_atleta.data_nascita
				).getFullYear()

				const [atletaResult] = await connection.execute(
					"INSERT INTO atleti (nome, cognome, anno_nascita, sesso, id_societa, cintura_id) VALUES (?, ?, ?, ?, ?, ?)",
					[
						nuovo_atleta.nome,
						nuovo_atleta.cognome,
						anno_nascita,
						nuovo_atleta.sesso,
						nuovo_atleta.id_societa,
						nuovo_atleta.cintura_id, // Aggiungiamo la cintura_id
					]
				)
				atletaId = atletaResult.insertId
			}

			// Verifica se esiste già un'iscrizione per questo atleta e disciplina
			const [existingIscrizioni] = await connection.execute(
				"SELECT id_iscrizione FROM iscrizioni WHERE id_atleta = ? AND id_disciplina = ?",
				[atletaId, id_disciplina]
			)

			if (existingIscrizioni.length > 0) {
				throw new Error(
					"Esiste già un'iscrizione per questo atleta in questa disciplina"
				)
			}

			// Ottieni informazioni complete dell'atleta
			const [atletaInfo] = await connection.execute(
				`SELECT a.*, c.kyu, c.id_cintura 
				 FROM atleti a 
				 LEFT JOIN cinture c ON a.cintura_id = c.id_cintura 
				 WHERE a.id_atleta = ?`,
				[atletaId]
			)

			if (!atletaInfo || atletaInfo.length === 0) {
				throw new Error("Atleta non trovato")
			}

			const atleta = atletaInfo[0]

			if (!atleta.cintura_id) {
				throw new Error("L'atleta non ha una cintura assegnata")
			}

			// Trova la categoria appropriata per l'atleta
			const [categoriaAppropriata] = await connection.execute(
				`SELECT c.id_categoria
				 FROM categorie c
				 JOIN categorie_cinture cc ON c.id_categoria = cc.id_categoria
				 JOIN categorie_fasce cf ON c.id_categoria = cf.id_categoria
				 JOIN fasce_eta fe ON cf.id_fascia = fe.id_fascia
				 WHERE c.id_disciplina = ?
				 AND (c.sesso = ? OR c.sesso = 'MIXED')
				 AND cc.id_cintura = ?
				 AND ? BETWEEN fe.anno_nascita_min AND fe.anno_nascita_max
				 AND (c.peso_min IS NULL OR ? >= c.peso_min)
				 AND (c.peso_max IS NULL OR ? <= c.peso_max)
				 LIMIT 1`,
				[
					id_disciplina,
					atleta.sesso,
					atleta.cintura_id,
					atleta.anno_nascita,
					atleta.peso_kg || 0,
					atleta.peso_kg || 999,
				]
			)

			const categoriaId = categoriaAppropriata[0]?.id_categoria

			if (categoriaId) {
				// Controlla se esistono iscrizioni con pool per questa categoria
				const [poolInfo] = await connection.execute(
					`SELECT pool, COUNT(*) as count
					 FROM iscrizioni 
					 WHERE id_categoria = ? AND pool IS NOT NULL
					 GROUP BY pool
					 ORDER BY COUNT(*), pool`, // Ordina prima per numero di iscritti, poi per numero pool
					[categoriaId]
				)

				let poolToAssign = null
				if (poolInfo && poolInfo.length > 0) {
					// Usa la pool con meno iscritti
					poolToAssign = poolInfo[0].pool
				}

				// Crea l'iscrizione includendo la pool assegnata
				const [result] = await connection.execute(
					"INSERT INTO iscrizioni (id_atleta, id_categoria, id_disciplina, data_iscrizione, manuale, pool, confermata) VALUES (?, ?, ?, NOW(), ?, ?, true)",
					[
						atletaId,
						categoriaId,
						id_disciplina,
						body.manuale || false,
						poolToAssign,
					]
				)

				if (result.affectedRows === 0) {
					throw new Error("Inserimento iscrizione fallito")
				}

				const [newIscrizione] = await connection.execute(
					"SELECT * FROM dettaglio_iscrizioni WHERE id_iscrizione = ?",
					[result.insertId]
				)

				if (!newIscrizione || newIscrizione.length === 0) {
					throw new Error(
						"Impossibile recuperare l'iscrizione creata"
					)
				}

				if (newIscrizione[0].id_categoria) {
					const tabelloniDaAggiornare =
						await findTabelloniByIscrizione(
							connection,
							newIscrizione[0].id_categoria
						)
					for (const id_tabellone of tabelloniDaAggiornare) {
						await connection.execute(
							"UPDATE tabelloni SET stampato = false WHERE id_tabellone = ?",
							[id_tabellone]
						)
						await ricalcolaConfigurazione(connection, id_tabellone)
					}
				}

				return newIscrizione[0]
			} else {
				// Inserimento senza pool per categorie senza categoria assegnata
				const [result] = await connection.execute(
					"INSERT INTO iscrizioni (id_atleta, id_categoria, id_disciplina, data_iscrizione, manuale) VALUES (?, ?, ?, NOW(), ?)",
					[atletaId, null, id_disciplina, body.manuale || false]
				)

				if (result.affectedRows === 0) {
					throw new Error("Inserimento iscrizione fallito")
				}

				const [newIscrizione] = await connection.execute(
					"SELECT * FROM dettaglio_iscrizioni WHERE id_iscrizione = ?",
					[result.insertId]
				)

				if (!newIscrizione || newIscrizione.length === 0) {
					throw new Error(
						"Impossibile recuperare l'iscrizione creata"
					)
				}

				return newIscrizione[0]
			}
		} else if (method === "PUT") {
			const { id } = query
			if (!id) {
				throw new Error("ID iscrizione mancante")
			}

			// Se il body contiene solo confermata, aggiorna anche la data_iscrizione
			if (
				Object.keys(body).length === 1 &&
				body.hasOwnProperty("confermata")
			) {
				const [result] = await connection.execute(
					"UPDATE iscrizioni SET confermata = ?, data_iscrizione = NOW() WHERE id_iscrizione = ?",
					[body.confermata, id]
				)

				if (result.affectedRows === 0) {
					throw new Error("Iscrizione non trovata o non modificata")
				}
			} else {
				// Aggiornamento completo includendo il campo confermata
				const { id_atleta, id_categoria, id_disciplina, confermata } =
					body

				const [result] = await connection.execute(
					"UPDATE iscrizioni SET id_atleta = ?, id_categoria = ?, id_disciplina = ?, confermata = ? WHERE id_iscrizione = ?",
					[id_atleta, id_categoria, id_disciplina, confermata, id]
				)

				if (result.affectedRows === 0) {
					throw new Error("Iscrizione non trovata o non modificata")
				}
			}

			// Get updated data from dettaglio_iscrizioni instead of tab_iscrizioni_con_dettagli
			const [updated] = await connection.execute(
				"SELECT * FROM dettaglio_iscrizioni WHERE id_iscrizione = ?",
				[id]
			)

			if (updated.length === 0) {
				throw new Error(
					"Impossibile recuperare l'iscrizione aggiornata"
				)
			}

			// Se è cambiata la categoria, aggiorna i tabelloni vecchi e nuovi
			const oldCategoriaId = updated[0].id_categoria
			const newCategoriaId = body.id_categoria

			if (oldCategoriaId !== newCategoriaId) {
				const tabelloniDaAggiornare = new Set([
					...(oldCategoriaId
						? await findTabelloniByIscrizione(
								connection,
								oldCategoriaId
						  )
						: []),
					...(newCategoriaId
						? await findTabelloniByIscrizione(
								connection,
								newCategoriaId
						  )
						: []),
				])

				for (const id_tabellone of tabelloniDaAggiornare) {
					await connection.execute(
						"UPDATE tabelloni SET stampato = false WHERE id_tabellone = ?",
						[id_tabellone]
					)
					await ricalcolaConfigurazione(connection, id_tabellone)
				}
			}

			return updated[0]
		} else if (method === "DELETE") {
			const { id } = query
			if (!id) {
				throw new Error("ID mancante")
			}

			// Prima di eliminare l'iscrizione, trova i tabelloni da aggiornare
			const [iscrizioneToDelete] = await connection.execute(
				"SELECT id_categoria FROM iscrizioni WHERE id_iscrizione = ?",
				[id]
			)

			if (iscrizioneToDelete[0]?.id_categoria) {
				const tabelloniDaAggiornare = await findTabelloniByIscrizione(
					connection,
					iscrizioneToDelete[0].id_categoria
				)

				// Aggiorna il campo stampato prima di eliminare l'iscrizione
				for (const id_tabellone of tabelloniDaAggiornare) {
					await connection.execute(
						"UPDATE tabelloni SET stampato = false WHERE id_tabellone = ?",
						[id_tabellone]
					)
				}

				await connection.execute(
					"DELETE FROM iscrizioni WHERE id_iscrizione = ?",
					[id]
				)

				// Ricalcola la configurazione dopo aver eliminato l'iscrizione
				for (const id_tabellone of tabelloniDaAggiornare) {
					await ricalcolaConfigurazione(connection, id_tabellone)
				}
			}

			return { id }
		}
	} catch (error) {
		console.error("Errore nella gestione delle iscrizioni:", error)
		throw createError({ statusCode: 500, message: error.message })
	} finally {
		if (connection) {
			await connection.end()
		}
	}
})
