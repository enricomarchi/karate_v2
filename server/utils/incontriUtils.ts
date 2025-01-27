import { Connection, RowDataPacket, ResultSetHeader } from "mysql2/promise"
import { FaseTorneo } from "./torneoUtils"

// Aggiungi il type per lo stato
export type StatoIncontro = "DA_INIZIARE" | "IN_CORSO" | "COMPLETATO"

export interface IncontroRow extends RowDataPacket {
	id_incontro: number
	id_prova: number
	ordine: number
	stato: StatoIncontro
	id_atleta_rosso: number
	id_atleta_bianco: number | null
	punti_rosso: number
	punti_bianco: number
	voti: string | null
	fase: FaseTorneo
}

export async function inserisciIncontro(
	connection: Connection,
	id_prova: number,
	id_atleta_rosso: number | null,
	id_atleta_bianco: number | null,
	ordine: number,
	fase: string | FaseTorneo = "SEDICESIMI", // Modificato il tipo
	stato: StatoIncontro = "DA_INIZIARE",
	completaAutomaticamente: boolean = false // Nuovo parametro
): Promise<number> {
	// Verifica che i parametri obbligatori non siano undefined
	if (id_prova === undefined || ordine === undefined) {
		throw new Error("Parametri obbligatori mancanti")
	}

	// Imposta lo stato a COMPLETATO solo se richiesto esplicitamente
	stato =
		completaAutomaticamente &&
		id_atleta_bianco === null &&
		id_atleta_rosso !== null
			? "COMPLETATO"
			: stato

	const [result] = await connection.execute<ResultSetHeader>(
		`INSERT INTO incontri_prova 
         (id_prova, id_atleta_rosso, id_atleta_bianco, ordine, fase, stato) 
         VALUES (?, ?, ?, ?, ?, ?)`,
		[id_prova, id_atleta_rosso, id_atleta_bianco, ordine, fase, stato]
	)

	return result.insertId
}

export async function aggiornaIncontro(
	connection: Connection,
	id_incontro: number,
	id_prova: number,
	id_atleta_rosso: number,
	id_atleta_bianco: number | null,
	ordine: number,
	stato: StatoIncontro = "DA_INIZIARE" // Aggiunto parametro con default
): Promise<void> {
	await connection.execute(
		`UPDATE incontri_prova 
         SET id_atleta_rosso = ?, id_atleta_bianco = ?, ordine = ?, stato = ? 
         WHERE id_incontro = ? AND id_prova = ?`,
		[
			id_atleta_rosso,
			id_atleta_bianco,
			ordine,
			stato,
			id_incontro,
			id_prova,
		]
	)
}

export async function getIncontriByProva(
	connection: Connection,
	id_prova: number
): Promise<IncontroRow[]> {
	// Modifica la query per includere lo stato dell'incontro nella vista
	const [rows] = await connection.execute<IncontroRow[]>(
		`SELECT i.*, v.voti,
         i.stato as stato_incontro  -- Aggiungi esplicitamente lo stato
         FROM vista_incontri i
         LEFT JOIN (
             SELECT id_incontro, 
                    JSON_ARRAYAGG(
                        JSON_OBJECT('arbitro', numero_arbitro, 'voto', voto)
                    ) as voti
             FROM voti_incontro
             GROUP BY id_incontro
         ) v ON i.id_incontro = v.id_incontro
         WHERE i.id_prova = ?
         ORDER BY i.ordine`,
		[id_prova]
	)
	return rows
}
