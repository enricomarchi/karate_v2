export type TemplateTabellone = "KUMITE_BASE" | "ELIM_DIR_REC" | "GIRONE_ITA"
export type TipoTabellone = "punteggio" | "bandierine"

export interface RegolaCriterio {
	tipo: "bandierine_totali" | "top"
	valore: number
}

export interface RegoleAccesso {
	criteri: RegolaCriterio[]
}

export interface ConfigurazioneProva {
	disciplina: string
	nome_prova: string
	ordine: number
	tipo_tabellone: TipoTabellone
	template_tabellone: TemplateTabellone
	numero_arbitri: number
	is_finale: boolean
	regole_accesso: RegolaCriterio[] // Modificato da RegoleAccesso a RegolaCriterio[]
	calcola_totali: boolean
	durata_incontro?: string // format "MM:SS"
}

export interface Configurazione {
	id?: number
	nome: string
	data_creazione?: string
	prove: ConfigurazioneProva[]
}

export type ProvaAPI = {
	id?: number
	disciplina: string
	nome_prova: string
	ordine: number
	tipo_tabellone: "punteggio" | "bandierine"
	template_tabellone: TemplateTabellone
	numero_arbitri: number
	is_finale: boolean
	calcola_totali: boolean
	durata_incontro: string
	// Remove regole_accesso from here as it will be handled separately
}

export type RegolaAccesso = {
	tipo_regola: string
	valore: number
}

// Rimuovi il tipo ProvaAPI perché non serve più la conversione JSON
