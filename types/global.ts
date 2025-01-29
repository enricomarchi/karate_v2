import type { RowDataPacket } from "mysql2/promise"

// Interfaccia per gli errori MySQL
export interface MySQLError extends Error {
	code?: string
	errno?: number
	sqlState?: string
	sqlMessage?: string
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

export interface SessoOption {
	value?: "M" | "F" | "X"
	label?: string
}

// Tipo principale Categoria che include gli array di Fascia e Cintura
export interface Categoria {
	id_categoria?: number
	nome?: string
	id_disciplina?: string
	disciplina_nome?: string
	sesso?: "M" | "F" | "X"
	peso_min?: number | null
	peso_max?: number | null
	n_ordine?: number | null
	fasce?: Fascia[]
	cinture?: Cintura[]
}

// Interfacce Row per mysql2
export interface CategoriaRow
	extends Omit<Categoria, "fasce" | "cinture">,
		RowDataPacket {}
export interface FasciaRow extends Fascia, RowDataPacket {}
export interface CinturaRow extends Cintura, RowDataPacket {}
