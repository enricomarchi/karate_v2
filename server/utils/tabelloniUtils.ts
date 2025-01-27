import { Connection, RowDataPacket, ResultSetHeader } from "mysql2/promise"
import { AtletaBase } from "../../types/tabellone"
import {
	FaseTorneo,
	fasiSuccessive,
	numIncontriPerFase,
	determinaFaseIniziale,
	isTurnoGirone,
} from "./torneoUtils"
import { inserisciIncontro } from "./incontriUtils"

interface AtletaRow extends RowDataPacket {
	id_atleta: number
	id_societa: number
}

interface ConfigurazioneRow extends RowDataPacket {
	configurazione_id: number
}

// Modifica l'interfaccia ProvaRow per rimuovere il campo regole JSON
interface ProvaRow extends RowDataPacket {
	ordine: number
	nome_prova: string
	disciplina: string
	tipo_tabellone: string
	template_tabellone?: string
	numero_arbitri: number
	is_finale: boolean
}

// Modifica l'interfaccia Accoppiamento per permettere null
interface Accoppiamento {
	id_atleta_rosso: number | null
	id_atleta_bianco: number | null
	ordine: number
	fase: string | FaseTorneo // Modificato per accettare entrambi i tipi
	votiAutomatici?: boolean // Aggiungiamo questa proprietà per segnalare quando vanno inseriti i voti automatici
}

// Sposta la definizione degli schemi di accoppiamento a livello di modulo
const schemiAccoppiamento: Record<FaseTorneo, [number, number][]> = {
	SEDICESIMI: [
		[1, 17],
		[9, 25],
		[5, 21],
		[13, 29],
		[3, 19],
		[11, 27],
		[7, 23],
		[15, 31],
		[2, 18],
		[10, 26],
		[6, 22],
		[14, 30],
		[4, 20],
		[12, 28],
		[8, 24],
		[16, 32],
	],
	OTTAVI: [
		[1, 9],
		[5, 13],
		[3, 11],
		[7, 15],
		[2, 10],
		[6, 14],
		[4, 12],
		[8, 16],
	],
	QUARTI: [
		[1, 5],
		[3, 7],
		[2, 6],
		[4, 8],
	],
	SEMIFINALI: [
		[1, 3],
		[2, 4],
	],
	FINALE: [[1, 2]],
	TERZO_QUARTO: [],
}

// Mappa che definisce gli avanzamenti secondo lo schema richiesto
const avanzamenti: Record<FaseTorneo, [number, number, number][]> = {
	SEDICESIMI: [
		[1, 17, 1],
		[9, 25, 9],
		[5, 21, 5],
		[13, 29, 13],
		[3, 19, 3],
		[11, 27, 11],
		[7, 23, 7],
		[15, 31, 15],
		[2, 18, 2],
		[10, 26, 10],
		[6, 22, 6],
		[14, 30, 14],
		[4, 20, 4],
		[12, 28, 12],
		[8, 24, 8],
		[16, 32, 16],
	],
	OTTAVI: [
		[1, 9, 1],
		[5, 13, 5],
		[3, 11, 3],
		[7, 15, 7],
		[2, 10, 2],
		[6, 14, 6],
		[4, 12, 4],
		[8, 16, 8],
	],
	QUARTI: [
		[1, 5, 1],
		[3, 7, 3],
		[2, 6, 2],
		[4, 8, 4],
	],
	SEMIFINALI: [
		[1, 3, 1],
		[2, 4, 2],
	],
	FINALE: [[1, 2, 1]],
	TERZO_QUARTO: [],
}

export async function findTabelloniByIscrizione(
	connection: Connection,
	id_categoria: number
): Promise<number[]> {
	const [rows] = await connection.execute<RowDataPacket[]>(
		`SELECT DISTINCT t.id_tabellone 
     FROM tabelloni t
     JOIN tabelloni_categorie tc ON t.id_tabellone = tc.id_tabellone
     WHERE tc.id_categoria = ?`,
		[id_categoria]
	)

	return rows.map((row) => row.id_tabellone)
}

// Modifica la funzione per accettare parametri opzionali
export async function ricalcolaConfigurazione(
	connection: Connection,
	id_tabellone: number,
	id_prova?: number,
	atletiSelezionati?: AtletaRow[]
): Promise<void> {
	// Ottieni la configurazione corrente
	const [configRows] = await connection.execute<ConfigurazioneRow[]>(
		"SELECT configurazione_id FROM tabelloni WHERE id_tabellone = ?",
		[id_tabellone]
	)

	// Imposta stampato a false quando riconfigura il tabellone
	await connection.execute(
		"UPDATE tabelloni SET stampato = false WHERE id_tabellone = ?",
		[id_tabellone]
	)

	const configId = configRows[0]?.configurazione_id
	if (!configId) return

	// Se id_prova è specificato, rigenera solo quella prova
	if (id_prova !== undefined) {
		const [proveRows] = await connection.execute<ProvaRow[]>(
			`SELECT disciplina, nome_prova, ordine, tipo_tabellone, 
             template_tabellone, numero_arbitri, is_finale 
             FROM configurazioni_prove 
             WHERE config_id = ? AND ordine = (
                 SELECT numero_prova FROM prove WHERE id_prova = ? 
             )`,
			[configId, id_prova]
		)

		if (proveRows.length === 0) return

		const prova = proveRows[0]

		// Se sono stati forniti atleti specifici, usali
		let accoppiamenti: Accoppiamento[] = []
		if (atletiSelezionati && atletiSelezionati.length > 0) {
			if (prova.template_tabellone === "KUMITE_BASE") {
				accoppiamenti = await generaAccoppiamentiKumite(
					atletiSelezionati
				)
			} else if (prova.template_tabellone === "ELIM_DIR_REC") {
				accoppiamenti = await generaAccoppiamentiElimDirRec(
					atletiSelezionati
				)
			} else if (prova.template_tabellone === "GIRONE_ITA") {
				accoppiamenti = await generaAccoppiamentiGironeIta(
					atletiSelezionati
				)
			}
		}

		// Elimina gli incontri esistenti della prova
		await connection.execute(
			"DELETE FROM incontri_prova WHERE id_prova = ?",
			[id_prova]
		)

		// Rigenera gli incontri solo per questa prova
		for (const acc of accoppiamenti) {
			const id_incontro = await inserisciIncontro(
				connection,
				id_prova,
				acc.id_atleta_rosso,
				acc.id_atleta_bianco,
				acc.ordine,
				acc.fase
			)

			if (acc.votiAutomatici && acc.id_atleta_rosso !== null) {
				for (let i = 1; i <= prova.numero_arbitri; i++) {
					await connection.execute(
						`INSERT INTO voti_incontro (id_incontro, numero_arbitro, voto) 
                         VALUES (?, ?, 'ROSSO')`,
						[id_incontro, i]
					)
				}
			}
		}

		return
	}

	// Se nessun id_prova è specificato, continua con il comportamento originale

	// Recupera info pool del tabellone
	const [poolInfo] = await connection.execute<RowDataPacket[]>(
		"SELECT pool FROM tabelloni WHERE id_tabellone = ?",
		[id_tabellone]
	)
	const poolNumber = poolInfo[0]?.pool

	// Elimina prove esistenti
	await connection.execute("DELETE FROM prove WHERE id_tabellone = ?", [
		id_tabellone,
	])

	// Riapplica la configurazione
	await connection.execute(
		"UPDATE tabelloni SET configurazione_id = ? WHERE id_tabellone = ?",
		[configId, id_tabellone]
	)

	// Modifica la query per includere le regole di accesso
	const [proveRows] = await connection.execute<ProvaRow[]>(
		`SELECT p.disciplina, p.nome_prova, p.ordine, p.tipo_tabellone, 
		 p.template_tabellone, p.numero_arbitri, p.is_finale
		 FROM configurazioni_prove p
		 LEFT JOIN regole_accesso ra ON p.id = ra.id_prova
		 WHERE p.config_id = ? 
		 GROUP BY p.id
		 ORDER BY p.ordine`,
		[configId]
	)

	// Modifica la query per recuperare solo gli atleti della pool specifica
	const atletiQuery = poolNumber
		? `SELECT DISTINCT a.* 
           FROM atleti a
           JOIN iscrizioni i ON a.id_atleta = i.id_atleta
           JOIN tabelloni_categorie tc ON i.id_categoria = tc.id_categoria
           WHERE tc.id_tabellone = ? 
           AND i.confermata = 1
           AND i.pool = ?`
		: `SELECT DISTINCT a.* 
           FROM atleti a
           JOIN iscrizioni i ON a.id_atleta = i.id_atleta
           JOIN tabelloni_categorie tc ON i.id_categoria = tc.id_categoria
           WHERE tc.id_tabellone = ? 
           AND i.confermata = 1`

	const [atleti] = await connection.execute<AtletaRow[]>(
		atletiQuery,
		poolNumber ? [id_tabellone, poolNumber] : [id_tabellone]
	)

	// Genera gli accoppiamenti una sola volta
	let accoppiamenti: Accoppiamento[] = []
	if (atleti.length > 0) {
		if (proveRows[0].template_tabellone === "KUMITE_BASE") {
			accoppiamenti = await generaAccoppiamentiKumite(atleti)
		} else if (proveRows[0].template_tabellone === "ELIM_DIR_REC") {
			// Converti il risultato al tipo Accoppiamento
			accoppiamenti = await generaAccoppiamentiElimDirRec(atleti)
		} else if (proveRows[0].template_tabellone === "GIRONE_ITA") {
			accoppiamenti = await generaAccoppiamentiGironeIta(atleti)
		}
	}

	// Raggruppa le prove in finali e non finali usando is_finale
	const proveRegolari = proveRows.filter((p) => !p.is_finale)
	const proveFinali = proveRows.filter((p) => p.is_finale)

	// Crea prima tutte le prove regolari
	for (const prova of proveRegolari) {
		await creaProva(connection, id_tabellone, prova, accoppiamenti)
	}

	// Crea le prove finali senza incontri se esistono
	if (proveFinali.length > 0) {
		for (const prova of proveFinali) {
			await creaProvaFinale(connection, id_tabellone, prova)
		}
	}
}

// Nuova funzione per creare una prova finale senza incontri
async function creaProvaFinale(
	connection: Connection,
	id_tabellone: number,
	prova: ProvaRow
): Promise<void> {
	const [result] = await connection.execute<ResultSetHeader>(
		`INSERT INTO prove 
         (id_tabellone, numero_prova, nome_prova, id_disciplina, 
          tipo_tabellone, template_tabellone, numero_arbitri, is_finale) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		[
			id_tabellone,
			prova.ordine,
			prova.nome_prova,
			prova.disciplina,
			prova.tipo_tabellone,
			prova.template_tabellone,
			prova.numero_arbitri,
			prova.is_finale,
		]
	)
}

// Modifica la funzione creaProva per usare is_finale invece del controllo sul nome
async function creaProva(
	connection: Connection,
	id_tabellone: number,
	prova: ProvaRow,
	accoppiamenti: Accoppiamento[]
): Promise<void> {
	// Inserisci la prova
	const [result] = await connection.execute<ResultSetHeader>(
		`INSERT INTO prove 
         (id_tabellone, numero_prova, nome_prova, id_disciplina, 
          tipo_tabellone, template_tabellone, numero_arbitri, is_finale) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		[
			id_tabellone,
			prova.ordine,
			prova.nome_prova,
			prova.disciplina,
			prova.tipo_tabellone,
			prova.template_tabellone,
			prova.numero_arbitri,
			prova.is_finale,
		]
	)

	const id_prova = result.insertId

	// Se non è una finale, inserisci tutti gli accoppiamenti inclusi quelli vuoti
	if (!prova.is_finale) {
		for (const acc of accoppiamenti) {
			// Inserisci l'incontro e ottieni l'ID
			const id_incontro = await inserisciIncontro(
				connection,
				id_prova,
				acc.id_atleta_rosso,
				acc.id_atleta_bianco,
				acc.ordine,
				acc.fase,
				"DA_INIZIARE",
				acc.votiAutomatici
			)

			// Se è un passaggio automatico, inserisci i voti automatici
			if (acc.votiAutomatici && acc.id_atleta_rosso !== null) {
				for (let i = 1; i <= prova.numero_arbitri; i++) {
					await connection.execute(
						`INSERT INTO voti_incontro (id_incontro, numero_arbitro, voto) 
                         VALUES (?, ?, 'ROSSO')`,
						[id_incontro, i]
					)
				}
			}
		}
	}
}

// Nuova funzione per generare accoppiamenti Kumite
export async function generaAccoppiamentiKumite(
	atleti: AtletaRow[]
): Promise<Accoppiamento[]> {
	const accoppiamenti: Accoppiamento[] = []
	let ordine = 1

	// Raggruppa gli atleti per società
	const atletiPerSocieta = new Map<number, AtletaRow[]>()
	atleti.forEach((atleta) => {
		if (!atletiPerSocieta.has(atleta.id_societa)) {
			atletiPerSocieta.set(atleta.id_societa, [])
		}
		atletiPerSocieta.get(atleta.id_societa)!.push(atleta)
	})

	let atletiDisponibili = [...atleti]
	let atletaSingolo: AtletaRow | undefined

	// Se il numero di atleti è dispari, identifica l'atleta singolo
	if (atletiDisponibili.length % 2 !== 0) {
		const societaPiuNumerose = Array.from(atletiPerSocieta.entries()).sort(
			(a, b) => b[1].length - a[1].length
		)

		const numMaxAtleti = societaPiuNumerose[0][1].length
		const societaMaxAtleti = societaPiuNumerose.filter(
			([_, atleti]) => atleti.length === numMaxAtleti
		)

		const societaScelta =
			societaMaxAtleti[
				Math.floor(Math.random() * societaMaxAtleti.length)
			]
		const atletiSocieta = societaScelta[1]

		atletaSingolo =
			atletiSocieta[Math.floor(Math.random() * atletiSocieta.length)]
		atletiDisponibili = atletiDisponibili.filter(
			(a) => a.id_atleta !== atletaSingolo!.id_atleta
		)
	}

	// Array per tenere traccia degli accoppiamenti per società
	const accoppiamentiPerSocieta = new Map<number, number>()

	// Funzione per trovare il miglior atleta bianco
	const trovaMigliorAtletaBianco = (
		atletaRosso: AtletaRow,
		disponibili: AtletaRow[]
	): AtletaRow | null => {
		// Prima prova con atleti di società diverse
		const atletiAltreSocieta = disponibili.filter(
			(a) => a.id_societa !== atletaRosso.id_societa
		)
		if (atletiAltreSocieta.length > 0) {
			// Ordina per numero di accoppiamenti della società (meno accoppiamenti prima)
			return atletiAltreSocieta.sort((a, b) => {
				const accA = accoppiamentiPerSocieta.get(a.id_societa) || 0
				const accB = accoppiamentiPerSocieta.get(b.id_societa) || 0
				return accA - accB
			})[0]
		}

		// Se non possibile, ritorna null
		return null
	}

	// Crea gli accoppiamenti
	while (atletiDisponibili.length >= 2) {
		const atletaRosso = atletiDisponibili[0]
		atletiDisponibili = atletiDisponibili.filter(
			(a) => a.id_atleta !== atletaRosso.id_atleta
		)

		const atletaBianco = trovaMigliorAtletaBianco(
			atletaRosso,
			atletiDisponibili
		)

		if (atletaBianco) {
			atletiDisponibili = atletiDisponibili.filter(
				(a) => a.id_atleta !== atletaBianco.id_atleta
			)

			// Aggiorna il conteggio degli accoppiamenti per società
			accoppiamentiPerSocieta.set(
				atletaRosso.id_societa,
				(accoppiamentiPerSocieta.get(atletaRosso.id_societa) || 0) + 1
			)
			accoppiamentiPerSocieta.set(
				atletaBianco.id_societa,
				(accoppiamentiPerSocieta.get(atletaBianco.id_societa) || 0) + 1
			)

			accoppiamenti.push({
				id_atleta_rosso: atletaRosso.id_atleta,
				id_atleta_bianco: atletaBianco.id_atleta,
				ordine: ordine++,
				fase: "SEDICESIMI",
			})
		} else {
			// Se non troviamo un abbinamento ideale, rimettiamo l'atleta in fondo alla lista
			atletiDisponibili.push(atletaRosso)
			// Previeni loop infiniti se non ci sono più abbinamenti possibili
			if (
				atletiDisponibili.length === 2 &&
				atletiDisponibili[0].id_societa ===
					atletiDisponibili[1].id_societa
			) {
				const a1 = atletiDisponibili[0]
				const a2 = atletiDisponibili[1]
				accoppiamenti.push({
					id_atleta_rosso: a1.id_atleta,
					id_atleta_bianco: a2.id_atleta,
					ordine: ordine++,
					fase: "SEDICESIMI",
				})
				break
			}
		}
	}

	// Gestisci l'atleta singolo
	if (atletaSingolo) {
		accoppiamenti.push({
			id_atleta_rosso: atletaSingolo.id_atleta,
			id_atleta_bianco: null,
			ordine: ordine,
			fase: "SEDICESIMI",
			votiAutomatici: true,
		})
	}

	return accoppiamenti
}

// Nuova funzione di utilità per ordinare gli atleti per società
function ordinaAtletiPerSocieta(atleti: AtletaRow[]): AtletaRow[] {
	// Raggruppa gli atleti per società
	const atletiPerSocieta = new Map<number, AtletaRow[]>()
	atleti.forEach((atleta) => {
		if (!atletiPerSocieta.has(atleta.id_societa)) {
			atletiPerSocieta.set(atleta.id_societa, [])
		}
		atletiPerSocieta.get(atleta.id_societa)!.push(atleta)
	})

	// Converti la Map in array e ordina per numero di atleti
	const societaOrdinate = Array.from(atletiPerSocieta.entries()).sort(
		(a, b) => {
			// Prima per numero di atleti (decrescente)
			const diff = b[1].length - a[1].length
			if (diff !== 0) return diff
			// Se pari numero, ordine casuale
			return Math.random() - 0.5
		}
	)

	// Appiattisci l'array di atleti mantenendo l'ordine delle società
	return societaOrdinate.flatMap(([_, atleti]) => atleti)
}

export async function generaAccoppiamentiElimDirRec(
	atleti: AtletaBase[]
): Promise<Accoppiamento[]> {
	const accoppiamenti: Accoppiamento[] = []
	let ordine = 1

	// Ordina gli atleti e assegna posizioni
	const atletiOrdinati = ordinaAtletiPerSocieta(atleti).map(
		(atleta, idx) => ({
			...atleta,
			posizione: idx + 1,
		})
	)

	const faseIniziale = determinaFaseIniziale(atletiOrdinati.length)

	// Mappa per tenere traccia degli atleti per le fasi successive
	const atletiPerFase = new Map<FaseTorneo, Map<number, AtletaBase>>()
	atletiPerFase.set(
		faseIniziale,
		new Map(atletiOrdinati.map((a) => [a.posizione, a]))
	)

	// Genera gli incontri per la fase iniziale
	const schema = schemiAccoppiamento[faseIniziale]
	const atletiFase = atletiPerFase.get(faseIniziale)!

	// Genera incontri fase iniziale e traccia avanzamenti
	const avanzamentiAutomatici = new Map<number, AtletaBase>()

	for (let i = 0; i < schema.length; i++) {
		const [posRosso, posBianco] = schema[i]
		const atletaRosso = atletiFase.get(posRosso)
		const atletaBianco = atletiFase.get(posBianco)

		// Gestisci avanzamenti automatici solo nella fase iniziale
		if (atletaRosso && !atletaBianco) {
			const avanzamento = avanzamenti[faseIniziale][i]
			if (avanzamento) {
				avanzamentiAutomatici.set(avanzamento[2], atletaRosso)
			}
		}

		accoppiamenti.push({
			id_atleta_rosso: atletaRosso?.id_atleta || null,
			id_atleta_bianco: atletaBianco?.id_atleta || null,
			ordine: ordine++,
			fase: faseIniziale,
			votiAutomatici: !!(atletaRosso && !atletaBianco), // Solo nella fase iniziale
		})
	}

	// Genera incontri fasi successive
	let faseCorrente: string | FaseTorneo = faseIniziale
	while (true) {
		const faseSuccessiva = getFaseSuccessiva(faseCorrente)
		if (!faseSuccessiva) break

		// Solo se è una fase di eliminazione usiamo schemiAccoppiamento
		if (faseSuccessiva in schemiAccoppiamento) {
			const schemaSuccessivo =
				schemiAccoppiamento[faseSuccessiva as FaseTorneo]
			for (let i = 0; i < schemaSuccessivo.length; i++) {
				const [posRosso, posBianco] = schemaSuccessivo[i]

				accoppiamenti.push({
					id_atleta_rosso:
						avanzamentiAutomatici.get(posRosso)?.id_atleta || null,
					id_atleta_bianco:
						avanzamentiAutomatici.get(posBianco)?.id_atleta || null,
					ordine: ordine++,
					fase: faseSuccessiva,
					votiAutomatici: false, // Mai automatico nelle fasi successive
				})
			}
		}

		faseCorrente = faseSuccessiva
		// Pulisci gli avanzamenti dopo averli usati
		avanzamentiAutomatici.clear()
	}

	// Aggiungi l'incontro per il terzo/quarto posto
	accoppiamenti.push({
		id_atleta_rosso: null,
		id_atleta_bianco: null,
		ordine: ordine++,
		fase: "TERZO_QUARTO",
		votiAutomatici: false,
	})

	return accoppiamenti
}

// Modifica getFaseSuccessiva per essere più esplicito sui tipi di ritorno
function getFaseSuccessiva(
	fase: string | FaseTorneo
): string | FaseTorneo | null {
	if (isTurnoGirone(fase)) {
		const turnoCorrente = parseInt(fase.split("_")[1])
		return turnoCorrente < 10 ? `TURNO_${turnoCorrente + 1}` : null
	}

	const ordine = [
		"SEDICESIMI",
		"OTTAVI",
		"QUARTI",
		"SEMIFINALI",
		"FINALE",
	] as FaseTorneo[]
	const currentIndex = ordine.indexOf(fase as FaseTorneo)
	return currentIndex < ordine.length - 1 ? ordine[currentIndex + 1] : null
}

export async function findAndDeleteTabelloniByPool(
	connection: Connection,
	id_categoria: number
): Promise<void> {
	// Trova i tabelloni associati alla categoria che hanno pool
	const [tabelloni] = await connection.execute<RowDataPacket[]>(
		`SELECT t.id_tabellone 
         FROM tabelloni t
         JOIN tabelloni_categorie tc ON t.id_tabellone = tc.id_tabellone
         WHERE tc.id_categoria = ? AND t.pool IS NOT NULL`,
		[id_categoria]
	)

	// Elimina i tabelloni trovati
	for (const row of tabelloni) {
		await connection.execute(
			"DELETE FROM tabelloni WHERE id_tabellone = ?",
			[row.id_tabellone]
		)
	}
}

// Aggiungi questa funzione dopo generaAccoppiamentiElimDirRec
export async function generaAccoppiamentiGironeIta(
	atleti: AtletaRow[]
): Promise<Accoppiamento[]> {
	if (atleti.length > 5) {
		throw new Error("Il girone all'italiana supporta al massimo 5 atleti")
	}

	const accoppiamenti: Accoppiamento[] = []
	let ordine = 1

	// Schema degli accoppiamenti per il girone all'italiana
	const schemaGirone = [
		[1, 2], // TURNO_1
		[3, 4], // TURNO_2
		[1, 5], // TURNO_3
		[2, 3], // TURNO_4
		[4, 5], // TURNO_5
		[1, 3], // TURNO_6
		[2, 5], // TURNO_7
		[1, 4], // TURNO_8
		[3, 5], // TURNO_9
		[2, 4], // TURNO_10
	]

	// Mappa per associare le posizioni agli atleti
	const atletiPerPosizione = new Map<number, AtletaRow>()
	atleti.forEach((atleta, index) => {
		atletiPerPosizione.set(index + 1, atleta)
	})

	// Genera gli accoppiamenti secondo lo schema
	schemaGirone.forEach(([pos1, pos2], index) => {
		const atletaRosso = atletiPerPosizione.get(pos1)
		const atletaBianco = atletiPerPosizione.get(pos2)

		// Se uno dei due atleti non esiste, salta questo accoppiamento
		if (!atletaRosso || !atletaBianco) return

		accoppiamenti.push({
			id_atleta_rosso: atletaRosso.id_atleta,
			id_atleta_bianco: atletaBianco.id_atleta,
			ordine: ordine++,
			fase: `TURNO_${index + 1}`, // Non serve più il cast as FaseTorneo
		})
	})

	return accoppiamenti
}
