import { jsPDF } from "jspdf"
import type { Prova } from "../../types/tabellone"

export const usePrintHeader = () => {
	const formatDurata = (durata: string | undefined): string => {
		if (!durata) return "Senza tempo"
		const [minuti, secondi] = durata.split(":").map(Number)
		if (minuti === 0 && secondi === 0) return "Senza tempo"
		if (minuti === 0) return `${secondi}"`
		return `${minuti}' ${secondi}"`
	}

	const drawHeader = (doc: jsPDF, tabellone: Prova, margin: number = 15) => {
		const headerHeight = 35
		const baseY = margin

		// Recupera il codice del tabellone senza il numero della prova
		const numeroTabellone = tabellone.codice_tabellone.split("-P")[0]

		// Configurazione font per il numero tabellone
		const fontSize = 26
		doc.setFont("helvetica", "bold")
		doc.setFontSize(fontSize)
		doc.setTextColor(0, 0, 0)

		// Calcola dimensioni per il rettangolo
		const textWidth = doc.getTextDimensions(numeroTabellone).w
		const padding = 3
		const rectHeight = 16
		const rectWidth = textWidth + padding * 2
		const cornerRadius = rectHeight / 2

		// Disegna il rettangolo arrotondato
		doc.setDrawColor(0, 0, 0)
		doc.setLineWidth(0.5)
		doc.roundedRect(
			margin,
			baseY,
			rectWidth,
			rectHeight,
			cornerRadius,
			cornerRadius
		)

		// Centra il testo nel rettangolo
		const textX = margin + rectWidth / 2
		const textMetrics = doc.getTextDimensions(numeroTabellone)
		const textY = baseY + rectHeight / 2 + textMetrics.h / 3
		doc.text(numeroTabellone, textX, textY, { align: "center" })

		// Log per debug
		console.log("Nome tabellone per stampa:", tabellone.nome_tabellone)

		// Nome del tabellone con controllo null/undefined
		doc.setTextColor(0, 0, 0)
		doc.setFontSize(16)
		const nomeY = baseY + 7
		const nomeTabellone = tabellone.nome_tabellone || ""
		doc.text(nomeTabellone, margin + rectWidth + 10, nomeY)

		// Sottotitolo con numero prova e disciplina
		doc.setFontSize(11)
		doc.setFont("helvetica", "normal")
		const numeroProva = tabellone.codice_tabellone.split("-P")[1]
		const provaInfo = tabellone.is_finale
			? `Finale - ${tabellone.disciplina || ""}`
			: `Prova ${tabellone.numero_prova} - ${tabellone.disciplina || ""}`
		const provaY = nomeY + 7
		doc.text(provaInfo, margin + rectWidth + 10, provaY)

		// Durata incontro su nuova riga
		const durataInfo = `Durata incontro: ${formatDurata(
			tabellone.durata_incontro
		)}`
		const durataY = provaY + 7
		doc.text(durataInfo, margin + rectWidth + 10, durataY)

		// Linea separatrice
		doc.setDrawColor(0, 0, 0)
		doc.setLineWidth(0.2)
		const lineY = durataY + 5 // Modificato da 10 a 7 per spostare la linea più in alto
		doc.line(margin, lineY, doc.internal.pageSize.width - margin, lineY)

		return {
			headerHeight: lineY + 5, // 5mm di spazio dopo la linea
			rectWidth,
		}
	}

	return {
		drawHeader,
	}
}
