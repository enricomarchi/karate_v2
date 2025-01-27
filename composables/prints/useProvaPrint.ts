import { useKumiteBasePrint } from "./useKumiteBasePrint"
import { useEliminazioneDirettaPrint } from "./useEliminazioneDirettaPrint"
import type { Prova } from "../../types/tabellone"

export const useProvaPrint = () => {
	const stampaProva = async (prova: Prova) => {
		try {
			const response = await fetch(`/api/prove/${prova.id_prova}/stampa`)
			if (!response.ok)
				throw new Error("Errore nel recupero dei dati per la stampa")

			const { incontri, disciplina, sesso } = await response.json()

			// Usa direttamente l'oggetto prova invece di creare un nuovo oggetto
			if (prova.template_tabellone === "ELIM_DIR_REC") {
				const { eliminazioneDiretta } = useEliminazioneDirettaPrint()
				return await eliminazioneDiretta([prova], [incontri])
			} else {
				const { kumiteBase } = useKumiteBasePrint()
				return await kumiteBase([prova], [incontri])
			}
		} catch (error) {
			console.error("Errore durante la stampa:", error)
			throw error
		}
	}

	const stampaProveMultiple = async (prove: Prova[]): Promise<void> => {
		try {
			// Filtra le prove che non sono finali
			const proveNonFinali = prove.filter((p) => !p.is_finale)

			// Ordina le prove per codice tabellone e numero prova
			const proveSorted = proveNonFinali.sort((a, b) => {
				if (a.codice_tabellone !== b.codice_tabellone) {
					return a.codice_tabellone.localeCompare(b.codice_tabellone)
				}
				return (a.numero_prova || 0) - (b.numero_prova || 0)
			})

			// Raggruppa per template_tabellone
			const provePerTemplate = proveSorted.reduce((acc, prova) => {
				const template = prova.template_tabellone || "KUMITE_BASE"
				if (!acc[template]) acc[template] = []
				acc[template].push(prova)
				return acc
			}, {} as Record<string, Prova[]>)

			// Per ogni template, crea un nuovo documento PDF
			for (const [template, proveTemplate] of Object.entries(
				provePerTemplate
			)) {
				const incontriPerProva = await Promise.all(
					proveTemplate.map(async (prova) => {
						const response = await fetch(
							`/api/prove/${prova.id_prova}/stampa`
						)
						if (!response.ok)
							throw new Error(
								`Errore nel recupero dei dati per la prova ${prova.id_prova}`
							)

						const {
							incontri,
							disciplina,
							sesso,
							numero_arbitri,
							template_tabellone,
						} = await response.json()

						return {
							incontri,
							disciplina,
							sesso,
							numero_arbitri:
								numero_arbitri || prova.numero_arbitri || 5,
							template_tabellone,
						}
					})
				)

				// Usa direttamente gli oggetti prova invece di creare nuovi oggetti
				if (template === "ELIM_DIR_REC") {
					const { eliminazioneDiretta } =
						useEliminazioneDirettaPrint()
					await eliminazioneDiretta(
						proveTemplate,
						incontriPerProva.map((p) => p.incontri)
					)
				} else {
					const { kumiteBase } = useKumiteBasePrint()
					await kumiteBase(
						proveTemplate,
						incontriPerProva.map((p) => p.incontri)
					)
				}
			}
		} catch (error) {
			console.error("Errore dettagliato:", error)
			throw error
		}
	}

	return {
		stampaProva,
		stampaProveMultiple,
	}
}
