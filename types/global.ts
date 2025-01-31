import type { RowDataPacket } from "mysql2/promise"

// ============================= SEZIONE ENUM =============================

// Definizione dei valori possibili per il sesso
export const SESSO_VALUES = {
	MASCHILE: "M",
	FEMMINILE: "F",
	MISTO: "X",
} as const

// Type per i valori possibili del sesso
export type SessoValue = (typeof SESSO_VALUES)[keyof typeof SESSO_VALUES]

// Mapping fisso tra valori e label
export const SESSO_LABELS: Record<SessoValue, string> = {
	M: "MASCHILE",
	F: "FEMMINILE",
	X: "MISTO",
}

// Tipo per le opzioni di sesso (usato nei select)
export interface SessoOption {
	value: SessoValue
	label: string
}

// Helper function per ottenere le opzioni di sesso
export const getSessoOptions = (): SessoOption[] => {
	return Object.entries(SESSO_LABELS).map(([value, label]) => ({
		value: value as SessoValue,
		label,
	}))
}

// Definizione dei valori possibili per il livello kata
export const LIVELLO_VALUES = {
	BASE: "BASE",
	INTERMEDIO: "INTERMEDIO",
	AVANZATO: "AVANZATO",
} as const

export type LivelloValue = (typeof LIVELLO_VALUES)[keyof typeof LIVELLO_VALUES]

// ============================= SEZIONE ROW =============================

// Interfacce Row per mysql2
export interface CategoriaRow extends RowDataPacket {
	id_categoria?: number
	nome?: string
	id_disciplina?: string
	sesso?: "M" | "F" | "X"
	peso_min: number | null
	peso_max: number | null
	n_ordine?: number | null
	disciplina_id?: string
	disciplina_valore?: string // Modifica qui: usando lo stesso nome della vista SQL
}
export interface FasciaRow extends Fascia, RowDataPacket {}
export interface CinturaRow extends Cintura, RowDataPacket {}
export interface KataRow extends RowDataPacket {
	id_kata?: number
	codice?: string
	nome?: string
	livello?: LivelloValue
}
export interface AtletaRow extends RowDataPacket {
	id_atleta?: number
	cognome?: string
	nome?: string
	sesso?: "M" | "F"
	anno_nascita?: number
	cintura_id?: number
	dan?: number
	peso_kg?: number
	id_societa?: number
	cintura?: string // Campo piatto dalla vista
	kyu?: number // Campo piatto dalla vista
	nome_societa?: string // Campo piatto dalla vista
}
export interface SocietaRow extends Societa, RowDataPacket {}
export interface IscrizioneRow extends Iscrizione, RowDataPacket {}

// ============================= SEZIONE DB SQL =============================

// Interfaccia per gli errori MySQL
export interface MySQLError extends Error {
	code?: string
	errno?: number
	sqlState?: string
	sqlMessage?: string
	statusCode?: number
}

// Tipi base per fasce e cinture come appaiono nelle tabelle
export interface Fascia {
	id_fascia?: number
	descrizione?: string
	anno_nascita_min?: number
	anno_nascita_max?: number
}

export interface Cintura {
	id_cintura?: number
	colore?: string
	kyu?: number
}

export interface Disciplina {
	id_disciplina?: string
	valore?: string
}

// Tipo principale Categoria che include gli array di Fascia e Cintura
export interface Categoria {
	id_categoria?: number
	nome?: string
	id_disciplina?: string
	sesso?: "M" | "F" | "X"
	peso_min: number | null
	peso_max: number | null
	n_ordine?: number | null
	disciplina?: Disciplina
	fasce?: Fascia[]
	cinture?: Cintura[]
}

// Interfaccia per le categorie sovrapposte
export interface CategorieSovrapposte extends RowDataPacket {
	cat1_id?: number
	cat1_nome?: string
	cat2_id?: number
	cat2_nome?: string
	id_disciplina?: string
	disciplina?: string
}

// Tipo base per l'atleta che include gli oggetti correlati
export interface Atleta {
	id_atleta?: number
	cognome?: string
	nome?: string
	sesso?: "M" | "F"
	anno_nascita?: number
	cintura_id?: number
	dan?: number
	peso_kg?: number
	id_societa?: number
	// Oggetti correlati
	cintura?: Cintura
	societa?: Societa
}

// Tipo base per la società come appare nella tabella
export interface Societa {
	id_societa?: number
	nome_societa?: string
	pagato?: number
	resto_consegnato?: number
}

// Interfaccia per le iscrizioni
export interface Iscrizione {
	id_iscrizione?: number
	id_atleta?: number
	id_disciplina?: string
	id_categoria?: number
	id_tabellone?: number | null
	data_iscrizione?: Date
	manuale?: boolean
	confermata?: boolean
	ammesso_in_finale?: boolean
	classifica?: number | null
}
