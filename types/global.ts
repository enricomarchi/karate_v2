import type {
	Categoria,
	Disciplina,
	FasciaEta,
	Cintura,
	CategoriaFascia,
	CategoriaCintura,
	categorie_sesso,
	Prisma,
} from "@prisma/client"
import { Decimal } from "@prisma/client/runtime/library"

// ============================= SEZIONE ENUM =============================

// Definizione dei valori possibili per il sesso
export const SESSO_VALUES = {
	MASCHILE: "M",
	FEMMINILE: "F",
	MISTO: "X",
} as const

export type SessoValue = (typeof SESSO_VALUES)[keyof typeof SESSO_VALUES]

export const SESSO_LABELS: Record<SessoValue, string> = {
	M: "MASCHILE",
	F: "FEMMINILE",
	X: "MISTO",
}

export interface SessoOption {
	value: SessoValue
	label: string
}

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

export interface CategoriaWithRelations extends Categoria {
	disciplina: Disciplina
	fasce: (CategoriaFascia & { fascia: FasciaEta })[]
	cinture: (CategoriaCintura & { cintura: Cintura })[]
}

export interface CategoriaFasciaWithRelation {
	id_fascia: number
	id_categoria: number
	fascia: FasciaEta
}

export interface CategoriaCinturaWithRelation {
	id_cintura: number
	id_categoria: number
	cintura: Cintura
}

export interface CategoriaPreview
	extends Omit<Partial<Categoria>, "peso_min" | "peso_max"> {
	disciplina?: {
		id_disciplina?: string
		valore?: string
	}
	fasce?: number[]
	cinture?: number[]
	sesso?: categorie_sesso // Now this type is properly defined
	peso_min?: Decimal | null
	peso_max?: Decimal | null
	n_ordine?: number | null
}

// Nota: Tutte le interfacce Row e le interfacce base sono state rimosse
// perché ora vengono gestite dai tipi generati da Prisma

export interface CategorieSovrapposte {
	cat1_id: number
	cat1_nome: string
	cat2_id: number
	cat2_nome: string
	id_disciplina: string
	disciplina: string
}

// Tipi per i test delle API
export interface MockEvent {
	__is_event__: true
	node: {
		req: {
			method: string
		}
	}
	context: {
		params?: Record<string, string>
	}
	method: string
	path: string
	headers: Headers
	handled: boolean
	body?: unknown
	_handled: boolean
	_onBeforeResponseCalled: boolean
	_onAfterResponseCalled: boolean
	handle: () => Promise<void>
	handleError: (error: Error) => Promise<void>
	getQuery: () => Record<string, string>
	getParams: () => Record<string, string>
}

export interface MockResponse<T> {
	data: { value: T | null }
	error: { value: Error | null }
}

// Tipi per le fasce d'età
export interface FasciaEtaForm
	extends Omit<Prisma.FasciaEtaCreateInput, "id_fascia"> {
	id_fascia?: number
}

export interface FasciaEtaTest {
	id_fascia: number
	descrizione: string
	anno_nascita_min: number
	anno_nascita_max: number
}
