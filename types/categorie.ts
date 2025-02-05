import type {
	categorie as Categoria,
	fasce_eta as FasciaEta,
	cinture as Cintura,
	discipline as Disciplina,
} from "@prisma/client"

export interface CategorieSovrapposte {
	cat1_id: number
	cat1_nome: string
	cat2_id: number
	cat2_nome: string
	disciplina: string
}

export interface CategoriaWithRelations extends Categoria {
	discipline: Disciplina
	categorie_fasce: { fasce_eta: FasciaEta }[]
	categorie_cinture: { cinture: Cintura }[]
}
