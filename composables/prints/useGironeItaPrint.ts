import { jsPDF } from "jspdf"
import autoTable, { type CellDef } from "jspdf-autotable"
import type { Prova, Incontro } from "../../types/tabellone"
import { usePrintHeader } from "./usePrintHeader"

type HAlignType = "left" | "center" | "right"
type TableCell =
	| string
	| {
			content: string | number
			styles?: { halign?: HAlignType }
			rowSpan?: number
	  }

export const useGironeItaPrint = () => {
	const generatePdfContent = async (
		doc: jsPDF,
		tabellone: Prova,
		incontri: Incontro[],
		atleti: any[] = [] // Rendi atleti opzionale con default vuoto
	): Promise<void> => {
		const { drawHeader } = usePrintHeader()
		const margin = 10
		const { headerHeight } = drawHeader(doc, tabellone, margin)

		// Definizione colori (spostata all'inizio per riuso)
		const alternateRowColor: [number, number, number] = [230, 230, 230]
		const blackColor: [number, number, number] = [0, 0, 0]
		const headerColor: [number, number, number] = [200, 200, 200]

		// Tabella degli atleti partecipanti
		const startY = headerHeight + 10
		doc.setFontSize(12)

		// Headers della tabella atleti
		const atletiHeaders: CellDef[][] = [
			[
				{ content: "N°", styles: { halign: "center", cellWidth: 16 } },
				{
					content: "COGNOME E NOME",
					styles: { halign: "left", cellWidth: 60 },
				},
				{
					content: "SOCIETÀ",
					styles: { halign: "left", cellWidth: 60 },
				},
				{
					content: "PUNTI",
					styles: { halign: "center", cellWidth: 25 },
				},
				{
					content: "CLASS.",
					styles: { halign: "center", cellWidth: 25 },
				},
			],
		]

		// Righe della tabella atleti (sempre 5 righe)
		const atletiRows = Array(5)
			.fill(null)
			.map((_, index) => {
				const atleta = atleti[index] || null
				return [
					{
						content: (index + 1).toString(),
						styles: { halign: "center" },
					},
					atleta ? `${atleta.cognome} ${atleta.nome}` : "",
					atleta ? atleta.nome_societa || "" : "",
					{ content: "", styles: { halign: "center" } },
					{ content: "", styles: { halign: "center" } }, // Colonna classifica
				]
			})

		// Disegna la tabella degli atleti con gli stessi stili della tabella incontri
		autoTable(doc, {
			head: atletiHeaders,
			body: atletiRows,
			startY: headerHeight + 5, // Modificato da +10 a +5
			theme: "grid",
			styles: {
				fontSize: 10,
				cellPadding: 4,
				lineWidth: 0.1,
				lineColor: blackColor,
				textColor: blackColor,
				valign: "middle",
			},
			headStyles: {
				fillColor: headerColor,
			},
			didParseCell: (data) => {
				const styles = data.cell.styles as any
				if (data.cell.section !== "head" && data.row.index % 2 === 1) {
					styles.fillColor = alternateRowColor
				}
			},
			margin: {
				left: margin,
				right: margin,
				top: margin,
				bottom: margin,
			},
		})

		// Recupera la posizione finale della tabella atleti
		const finalY = (doc as any).lastAutoTable.finalY + 10

		// Continua con la tabella degli incontri
		// ...existing code for incontri table...
		const tableStartY = finalY // Usa la nuova posizione di partenza

		// Definisci i colori
		const whiteColor: [number, number, number] = [255, 255, 255]

		// Definisci le headers della tabella (2 turni per riga)
		const tableHeaders: CellDef[][] = [
			[
				{
					content: "Turno",
					styles: { halign: "center", cellWidth: 18 },
				},
				{
					content: "Atleti",
					styles: { halign: "left", cellWidth: 60 },
				},
				{
					content: "Punti",
					styles: { halign: "center", cellWidth: 17 },
				},
				{
					content: "Atleti",
					styles: { halign: "left", cellWidth: 60 },
				},
				{
					content: "Punti",
					styles: { halign: "center", cellWidth: 17 },
				},
				{
					content: "Turno",
					styles: { halign: "center", cellWidth: 18 },
				},
			],
		]

		// Funzione per ottenere i dati dell'incontro del turno
		const getIncontroDiTurno = (turno: number) => {
			return (
				incontri.find(
					(inc) =>
						inc.fase === `TURNO_${turno}` || inc.fase === `${turno}`
				) || null
			)
		}

		// Funzione per contare i punti
		const contaPunti = (incontro: Incontro, colore: "ROSSO" | "BIANCO") => {
			if (!incontro) return ""
			try {
				const votiArray =
					typeof incontro.voti === "string"
						? (JSON.parse(incontro.voti) as Array<{
								arbitro: number
								voto: "ROSSO" | "BIANCO"
						  }>)
						: incontro.voti || []

				if (!incontro.nome_bianco && colore === "ROSSO") {
					return tabellone.numero_arbitri
				}

				return (
					votiArray.filter(
						(v: { arbitro: number; voto: "ROSSO" | "BIANCO" }) =>
							v.voto === colore
					).length || ""
				)
			} catch (e) {
				console.error("Errore nel parsing dei voti:", e)
				return ""
			}
		}

		// Preparazione delle righe (2 turni per riga)
		const tableRows: CellDef[][] = []
		for (let turno = 1; turno <= 10; turno += 2) {
			const incontro1 = getIncontroDiTurno(turno)
			const incontro2 = getIncontroDiTurno(turno + 1)

			// Prima coppia di atleti (Turno N)
			const akaRow1: CellDef[] = [
				{ content: turno, rowSpan: 2 },
				{
					content: incontro1
						? `${incontro1.cognome_rosso} ${incontro1.nome_rosso}`
						: "",
				},
				{
					content: incontro1 ? contaPunti(incontro1, "ROSSO") : "",
					styles: { halign: "center" as HAlignType },
				},
				{
					content: incontro2
						? `${incontro2.cognome_rosso} ${incontro2.nome_rosso}`
						: "",
				},
				{
					content: incontro2 ? contaPunti(incontro2, "ROSSO") : "",
					styles: { halign: "center" as HAlignType },
				},
				{ content: turno + 1, rowSpan: 2 },
			]

			// Seconda coppia di atleti (stessa riga)
			const shiroRow1: CellDef[] = [
				{
					content: incontro1
						? `${incontro1.cognome_bianco || ""} ${
								incontro1.nome_bianco || ""
						  }`.trim()
						: "",
				},
				{
					content: incontro1 ? contaPunti(incontro1, "BIANCO") : "",
					styles: { halign: "center" as HAlignType },
				},
				{
					content: incontro2
						? `${incontro2.cognome_bianco || ""} ${
								incontro2.nome_bianco || ""
						  }`.trim()
						: "",
				},
				{
					content: incontro2 ? contaPunti(incontro2, "BIANCO") : "",
					styles: { halign: "center" as HAlignType },
				},
			]

			tableRows.push(akaRow1, shiroRow1)
		}

		// Configura e disegna la tabella
		autoTable(doc, {
			head: tableHeaders,
			body: tableRows,
			startY: tableStartY, // Usa la nuova posizione di partenza
			theme: "grid",
			styles: {
				fontSize: 10,
				cellPadding: 4,
				lineWidth: 0.1,
				lineColor: blackColor,
				textColor: blackColor,
				valign: "middle",
			},
			headStyles: {
				fillColor: headerColor,
			},
			didParseCell: (data) => {
				const styles = data.cell.styles as any
				const incontroIndex = Math.floor(data.row.index / 2)
				if (data.cell.section !== "head" && incontroIndex % 2 === 1) {
					styles.fillColor = alternateRowColor
				}
			},
			margin: {
				left: margin,
				right: margin,
				top: margin,
				bottom: margin,
			},
			columnStyles: {
				0: { cellWidth: 16, halign: "center" }, // Turno 1
				1: { cellWidth: 60 }, // Atleti 1
				2: { cellWidth: 16, halign: "center" }, // Punti 1
				3: { cellWidth: 60 }, // Atleti 2
				4: { cellWidth: 16, halign: "center" }, // Punti 2
				5: { cellWidth: 16, halign: "center" }, // Turno 2
			},
		})
	}

	const gironeIta = async (
		tabelloni: Prova[],
		incontriPerProva: Incontro[][],
		atletiPerProva: any[][] = [] // Rendi atletiPerProva opzionale con default vuoto
	): Promise<void> => {
		const doc = new jsPDF({
			orientation: "portrait",
			unit: "mm",
			format: "a4",
		})

		// Genera il contenuto per ogni prova
		for (let i = 0; i < tabelloni.length; i++) {
			if (i > 0) {
				doc.addPage()
			}
			await generatePdfContent(
				doc,
				tabelloni[i],
				incontriPerProva[i],
				atletiPerProva[i] || [] // Gestisci il caso in cui atletiPerProva[i] sia undefined
			)
		}

		doc.autoPrint({ variant: "non-conform" })
		doc.output("dataurlnewwindow")
	}

	return {
		gironeIta, // Assicurati che questa funzione venga esportata correttamente
	}
}
