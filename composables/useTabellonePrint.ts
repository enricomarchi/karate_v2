import { useKumiteBasePrint } from "./prints/useKumiteBasePrint"
import { useEliminazioneDirettaPrint } from "./prints/useEliminazioneDirettaPrint"
import type { Prova, Incontro } from "../types/tabellone"
import { useProvaPrint } from "./prints/useProvaPrint" // Updated import path
import { useGironeItaPrint } from "./prints/useGironeItaPrint"

export const useTabellonePrint = () => {
	const { kumiteBase } = useKumiteBasePrint()
	const { eliminazioneDiretta } = useEliminazioneDirettaPrint()
	const { gironeIta } = useGironeItaPrint()

	const stampaTabellone = async (
		prova: Prova,
		incontri: Incontro[],
		atleti: any[] = []
	): Promise<void> => {
		console.log("Stampa tabellone con template:", prova.template_tabellone)

		switch (prova.template_tabellone) {
			case "KUMITE_BASE":
				console.log("Chiamata a kumite base") // Debug log
				await kumiteBase([prova], [incontri])
				break
			case "ELIM_DIR_REC":
				await eliminazioneDiretta([prova], [incontri])
				break
			case "GIRONE_ITA":
				console.log("Chiamata a gironeIta") // Debug log
				await gironeIta([prova], [incontri], [atleti])
				break
			default:
				console.error("Template non valido:", prova.template_tabellone)
		}
	}

	return {
		stampaTabellone,
	}
}
