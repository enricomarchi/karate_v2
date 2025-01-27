import type { RowDataPacket } from "mysql2/promise"
import type { FaseTorneo } from "../server/utils/torneoUtils"

export interface IncontroVoto {
	arbitro: number
	voto: "ROSSO" | "BIANCO"
}

export interface Incontro {
	id_incontro: number
	fase: string | FaseTorneo // Modificato per accettare entrambi i tipi
	ordine: number // cambiato da numero_incontro
	turno: number
	id_atleta_rosso: number | null
	id_atleta_bianco: number | null
	nome_rosso?: string
	cognome_rosso?: string
	societa_rosso?: string
	punti_rosso?: number
	sesso_rosso?: string
	anno_nascita_rosso?: number
	cintura_rosso?: string
	dan_rosso?: number
	peso_rosso?: number
	nome_bianco?: string
	cognome_bianco?: string
	societa_bianco?: string
	punti_bianco?: number
	sesso_bianco?: string
	anno_nascita_bianco?: number
	cintura_bianco?: string
	dan_bianco?: number
	peso_bianco?: number
	vincitore?: "ROSSO" | "BIANCO"
	voti?: IncontroVoto[] | string // Modificato per usare l'interfaccia IncontroVoto
	disciplina?: string
	stato: "DA_INIZIARE" | "IN_CORSO" | "COMPLETATO"
	id_incontro_succ?: number // Aggiunta questa proprietà come opzionale
	id_prova: number
}

export interface Tabellone {
	id_tabellone: number
	codice_tabellone: string
	nome_tabellone: string
	stato: "BOZZA" | "ATTIVO" | "COMPLETATO"
	data_creazione: string
	pool?: number
	configurazione_id?: number
	ora_inizio_effettiva?: string
	ora_fine_effettiva?: string
	stampato: boolean
	categorie?: string
	disciplina_principale?: string
	fasce?: string
	cinture?: string
	num_categorie?: number
	num_prove?: number
	totale_iscritti?: number
}

export interface RegolaAccesso {
	tipo_regola: string
	valore: number
}

export interface Prova {
	id_prova: number
	codice_tabellone: string
	nome_tabellone: string
	disciplina: string
	numero_prova: number
	stato: StatoProva // Modificato da string a StatoProva
	tabellone_stato?: string
	template_tabellone: "KUMITE_BASE" | "ELIM_DIR_REC" | "GIRONE_ITA"
	tipo_tabellone: string
	numero_arbitri: number
	id_tabellone: number
	nome_accorpamento?: string
	nome_categoria?: string
	ora_inizio_effettiva?: string
	ora_fine_effettiva?: string
	is_finale?: boolean
	pool?: number
	tatami?: string
	totale_incontri?: number
	num_risultati?: number
	calcola_totali?: boolean // Aggiungi questa proprietà
	durata_incontro?: string // Add this line - format "MM:SS"
	regole?: RegolaAccesso[] // Modificato per usare il nuovo tipo
}

export interface Atleta {
	id_atleta: number
	nome: string
	cognome: string
	societa?: string
	nome_societa?: string // Add this property
	id_societa: number
}

export interface AtletaBase extends RowDataPacket {
	id_atleta: number
	id_societa: number
}

export type StatoProva = "DA_INIZIARE" | "IN_CORSO" | "COMPLETATA"
