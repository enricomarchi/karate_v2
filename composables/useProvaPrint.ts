import type { Prova } from "../types/tabellone"
import { useTabellonePrint } from "./useTabellonePrint"

export const useProvaPrint = () => {
	const { stampaTabellone } = useTabellonePrint()

	const stampaProva = async (prova: Prova): Promise<void> => {
		console.log("useProvaPrint - Stampa prova:", {
			id: prova.id_prova,
			template: prova.template_tabellone,
		})

		const response = await fetch(`/api/prove/${prova.id_prova}/stampa`)
		if (!response.ok) throw new Error("Errore nel recupero dei dati")
		const { incontri, atleti } = await response.json()

		await stampaTabellone(prova, incontri, atleti)
	}

	return {
		stampaProva,
	}
}
