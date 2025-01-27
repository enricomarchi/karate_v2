import { defineEventHandler, createError } from "h3"
import {
	exportSocieta,
	exportAtleti,
	exportCategorie,
	exportCategorieCinture,
	exportFasceEta,
	exportCategorieFasce,
	exportConfigurazioniTabelloni,
	exportTabelloni,
	exportConfigurazioniProve,
	exportImpostazioniGara,
	exportIscrizioni,
	exportPunteggiSocieta,
	exportTabelloniCategorie,
	exportAccorpamenti,
	exportProve,
	exportRisultatiProve,
	exportIncontriProve,
	exportVotiIncontro,
	exportClassifiche,
} from "../utils/db"

export default defineEventHandler(async (event) => {
	try {
		// Genera il contenuto SQL per ogni tabella
		const exportData = await Promise.all([
			exportSocieta(),
			exportAtleti(),
			exportCategorie(),
			exportCategorieCinture(),
			exportFasceEta(),
			exportCategorieFasce(),
			exportAccorpamenti(),
			exportConfigurazioniTabelloni(),
			exportTabelloni(),
			exportConfigurazioniProve(),
			exportImpostazioniGara(),
			exportIscrizioni(),
			exportPunteggiSocieta(),
			exportTabelloniCategorie(),
			exportProve(),
			exportRisultatiProve(),
			exportIncontriProve(),
			exportVotiIncontro(),
			exportClassifiche(),
		])

		// Combina tutti i dati in un unico file SQL
		const sqlContent = exportData.join("")

		// Imposta gli headers per il download
		event.node.res.setHeader("Content-Type", "application/sql")
		event.node.res.setHeader(
			"Content-Disposition",
			`attachment; filename=database_export_${
				new Date().toISOString().split("T")[0]
			}.sql`
		)

		// Ritorna il contenuto SQL
		return new Response(sqlContent)
	} catch (error) {
		console.error("Errore durante l'esportazione:", error)
		throw createError({
			statusCode: 500,
			statusMessage: "Errore durante l'esportazione dei dati",
		})
	}
})
