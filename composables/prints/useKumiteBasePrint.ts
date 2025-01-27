import { jsPDF } from "jspdf"
import autoTable, {
	type CellDef,
	type HAlignType,
	type VAlignType,
} from "jspdf-autotable" // Aggiungi HAlignType
import type { Prova, Incontro } from "../../types/tabellone" // Rimuovi TabelloneInfo
import { usePrintHeader } from "./usePrintHeader"

// Add type definition for table cell
type TableCell = {
	content: string | number
	styles?: {
		halign?: HAlignType
		valign?: VAlignType
		fillColor?: [number, number, number]
	}
	rowSpan?: number
}

export const useKumiteBasePrint = () => {
	// Helper function to avoid code duplication
	const generatePdfContent = async (
		doc: jsPDF,
		tabellone: Prova,
		incontri: Incontro[]
	): Promise<void> => {
		const { drawHeader } = usePrintHeader()
		const margin = 10
		const { headerHeight } = drawHeader(doc, tabellone, margin)

		// Recupera i dati del tabellone
		const response = await fetch(`/api/tabelloni/${tabellone.id_tabellone}`)
		if (!response.ok) throw new Error("Errore nel recupero del tabellone")

		// Modifica la definizione delle headers mantenendo solo bianco e nero
		const arbitriColumns = Array.from(
			{ length: tabellone.numero_arbitri },
			(_, i) => ({
				content: `A${i + 1}`,
				styles: { halign: "center" as HAlignType },
			})
		)

		// Definisci i colori come tuple di 3 numeri
		const alternateRowColor: [number, number, number] = [230, 230, 230]
		const whiteColor: [number, number, number] = [255, 255, 255]
		const blackColor: [number, number, number] = [0, 0, 0]
		const headerColor: [number, number, number] = [200, 200, 200]

		// Aggiungi uno spazio vuoto prima della colonna Tot Prove
		const tableHeaders: CellDef[][] = [
			[
				{
					content: "N°",
					styles: { halign: "center" as HAlignType, cellWidth: 16 },
				},
				{
					content: "C",
					styles: { halign: "center" as HAlignType, cellWidth: 16 },
				},
				{
					content: "Atleti",
					styles: { halign: "left" as HAlignType, cellWidth: 60 },
				},
				{
					content: "Società",
					styles: { halign: "left" as HAlignType, cellWidth: 60 },
				},
				...arbitriColumns.map((col) => ({
					...col,
					styles: { ...col.styles, cellWidth: 16 },
				})),
				{
					content: "Tot",
					styles: { halign: "center" as HAlignType, cellWidth: 16 },
				},
				...(tabellone.calcola_totali
					? [
							{
								content: "", // Colonna vuota per separazione
								styles: {
									halign: "center" as HAlignType,
									cellWidth: 4,
									fillColor: whiteColor,
								},
							},
							{
								content: "Tot Prove",
								styles: {
									halign: "center" as HAlignType,
									cellWidth: 20,
								},
							},
					  ]
					: []),
			],
		]

		// Funzione per contare i punti
		const contaPunti = (incontro: Incontro, colore: "ROSSO" | "BIANCO") => {
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

				return votiArray.filter(
					(v: { arbitro: number; voto: "ROSSO" | "BIANCO" }) =>
						v.voto === colore
				).length
			} catch (e) {
				console.error("Errore nel parsing dei voti:", e)
				return 0
			}
		}

		// Funzione per ottenere i totali di tutte le prove
		const getTotaliProve = async (
			idAtleta: number,
			idProva: number,
			puntiIncontroCorrente: number
		): Promise<number> => {
			if (!tabellone.calcola_totali) return 0

			// Otteniamo prima i dettagli della prova corrente per conoscere l'id del tabellone
			const provaResponse = await fetch(`/api/prove/${idProva}`)
			if (!provaResponse.ok) return 0
			const provaCorrente = await provaResponse.json()

			// Otteniamo tutte le prove dello stesso tabellone
			const proveResponse = await fetch(
				`/api/tabelloni/${provaCorrente.id_tabellone}/prove`
			)
			if (!proveResponse.ok) return 0
			const prove = await proveResponse.json()

			// Filtriamo le prove non finali e che vengono prima della prova corrente
			const proveNonFinali = prove.filter(
				(p: any) => !p.is_finale && p.id_prova < idProva // Solo prove precedenti, non includiamo la corrente
			)

			// Calcoliamo il totale per ogni prova
			const totaleProve = await Promise.all(
				proveNonFinali.map(async (p: any) => {
					const incontriResponse = await fetch(
						`/api/prove/${p.id_prova}/stampa`
					)
					if (!incontriResponse.ok) return 0
					const { incontri } = await incontriResponse.json()

					// Troviamo l'incontro dell'atleta
					const incontro = incontri.find(
						(inc: any) =>
							inc.id_atleta_rosso === idAtleta ||
							inc.id_atleta_bianco === idAtleta
					)

					if (!incontro) return 0

					// Contiamo i voti per l'atleta
					const votiArray =
						typeof incontro.voti === "string"
							? JSON.parse(incontro.voti)
							: incontro.voti || []

					// Se l'atleta è rosso
					if (incontro.id_atleta_rosso === idAtleta) {
						if (!incontro.id_atleta_bianco) return p.numero_arbitri // Vittoria a tavolino
						return votiArray.filter((v: any) => v.voto === "ROSSO")
							.length
					}
					// Se l'atleta è bianco
					if (incontro.id_atleta_bianco === idAtleta) {
						return votiArray.filter((v: any) => v.voto === "BIANCO")
							.length
					}
					return 0
				})
			)

			// Sommiamo tutti i totali più i punti dell'incontro corrente
			return (
				totaleProve.reduce((a: number, b: number) => a + b, 0) +
				puntiIncontroCorrente
			)
		}

		const formatTotal = (total: number | null): string => {
			if (!total || total === 0) return ""
			return total.toString() // Rimuove lo zero-padding
		}

		// Modifica delle righe per l'atleta rosso e bianco
		const tableRows: (string | TableCell)[][] = []
		for (const incontro of incontri) {
			const puntiRosso = contaPunti(incontro, "ROSSO")
			const puntiBianco = contaPunti(incontro, "BIANCO")

			// Definisci votiArray qui, prima di usarlo
			const votiArray =
				typeof incontro.voti === "string"
					? (JSON.parse(incontro.voti) as Array<{
							arbitro: number
							voto: "ROSSO" | "BIANCO"
					  }>)
					: incontro.voti || []

			// Calcola i totali se richiesto
			const totaleRosso =
				tabellone.calcola_totali && incontro.id_atleta_rosso
					? await getTotaliProve(
							incontro.id_atleta_rosso,
							tabellone.id_prova,
							puntiRosso
					  )
					: null
			const totaleBianco =
				tabellone.calcola_totali && incontro.id_atleta_bianco
					? await getTotaliProve(
							incontro.id_atleta_bianco,
							tabellone.id_prova,
							puntiBianco
					  )
					: null

			// Preparazione celle dei voti per ogni arbitro
			const votiCells = Array.from(
				{ length: tabellone.numero_arbitri },
				(_, i) => {
					const voto = votiArray.find(
						(v) => v.arbitro === i + 1
					)?.voto
					return {
						content:
							voto === "ROSSO"
								? "R"
								: voto === "BIANCO"
								? "B"
								: "",
						styles: {
							halign: "center" as HAlignType,
							valign: "middle" as VAlignType, // Corretto il tipo qui
						},
						rowSpan: 2, // Unisce le celle tra atleta rosso e bianco
					}
				}
			)

			// Riga Rosso
			const akaRow: (string | TableCell)[] = [
				{ content: incontro.ordine, rowSpan: 2 },
				"R",
				`${incontro.cognome_rosso} ${incontro.nome_rosso}`,
				incontro.societa_rosso || "",
				...votiCells,
				{
					content: formatTotal(puntiRosso),
					styles: { halign: "center" as HAlignType },
				},
				...(tabellone.calcola_totali
					? [
							{
								content: "",
								styles: { halign: "center" as HAlignType },
							},
							{
								content: formatTotal(totaleRosso),
								styles: { halign: "center" as HAlignType },
							},
					  ]
					: []),
			]

			// Riga Bianco (senza includere le celle dei voti che sono già unite)
			const shiroRow = [
				"B",
				`${incontro.cognome_bianco || ""} ${
					incontro.nome_bianco || ""
				}`.trim(),
				incontro.societa_bianco || "",
				// Non includiamo le celle dei voti qui perché sono unite con la riga sopra
				{
					content: formatTotal(puntiBianco),
					styles: { halign: "center" as HAlignType },
				},
				...(tabellone.calcola_totali
					? [
							{
								content: "",
								styles: { halign: "center" as HAlignType },
							},
							{
								content: formatTotal(totaleBianco),
								styles: { halign: "center" as HAlignType },
							},
					  ]
					: []),
			]

			tableRows.push(akaRow, shiroRow)
		}

		// Configura la tabella per iniziare dopo l'header
		autoTable(doc, {
			head: tableHeaders,
			body: tableRows,
			startY: headerHeight,
			theme: "grid",
			styles: {
				fontSize: 10,
				cellPadding: 4,
				valign: "middle",
				lineWidth: 0.1, // Linea più sottile per tutta la tabella
				lineColor: blackColor, // Colore nero per tutte le linee
				textColor: blackColor,
			},
			headStyles: {
				fillColor: headerColor,
			},
			didParseCell: (data) => {
				const styles = data.cell.styles as any
				const incontroIndex = Math.floor(data.row.index / 2)
				const isSpacerColumn =
					tabellone.calcola_totali &&
					data.column.index === tabellone.numero_arbitri + 5

				if (isSpacerColumn) {
					styles.lineWidth = {
						left: 0.1,
						right: 0.1,
						top: 0,
						bottom: 0,
					}
					styles.fillColor = whiteColor
				} else if (
					data.cell.section !== "head" &&
					incontroIndex % 2 === 1
				) {
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
				0: { cellWidth: 16, halign: "center" as HAlignType }, // N°
				1: { cellWidth: 16, halign: "center" as HAlignType }, // C
				2: { cellWidth: 60 }, // Atleti (rimane left)
				3: { cellWidth: 60 }, // Società (rimane left)
				// Colonne arbitri dinamiche
				...[...Array(tabellone.numero_arbitri)].reduce(
					(acc, _, i) => ({
						...acc,
						[i + 4]: {
							cellWidth: 16,
							halign: "center" as HAlignType,
						},
					}),
					{}
				),
				[tabellone.numero_arbitri + 4]: {
					cellWidth: 16,
					halign: "center" as HAlignType,
				}, // Tot
				...(tabellone.calcola_totali
					? {
							[tabellone.numero_arbitri + 5]: {
								cellWidth: 4, // Deve corrispondere al valore nell'header
								halign: "center" as HAlignType,
							},
							[tabellone.numero_arbitri + 6]: {
								cellWidth: 20,
								halign: "center" as HAlignType,
							},
					  }
					: {}),
			},
		})
	}

	// Aggiungi questa nuova funzione
	const stampaTutteLeProve = async (prove: Prova[]): Promise<void> => {
		const doc = new jsPDF({
			orientation: "landscape",
			unit: "mm",
			format: "a4",
		})

		try {
			// Genera il contenuto per ogni prova
			for (let i = 0; i < prove.length; i++) {
				if (i > 0) {
					doc.addPage()
				}
				const response = await fetch(
					`/api/prove/${prove[i].id_prova}/stampa`
				)
				if (!response.ok)
					throw new Error(
						`Errore nel recupero dei dati per la prova ${prove[i].id_prova}`
					)

				const { incontri } = await response.json()
				await generatePdfContent(doc, prove[i], incontri)
			}

			// Stampa tutte le pagine
			doc.autoPrint({ variant: "non-conform" })
			doc.output("dataurlnewwindow")
			window.close()
		} catch (error) {
			console.error("Errore durante la stampa:", error)
			throw error
		}
	}

	const generateMultipleProve = async (
		doc: jsPDF,
		tabellone: Prova,
		incontri: Incontro[]
	): Promise<void> => {
		await generatePdfContent(doc, tabellone, incontri)
	}

	const kumiteBase = async (
		tabelloni: Prova[],
		incontriPerProva: Incontro[][]
	): Promise<void> => {
		const doc = new jsPDF({
			orientation: "landscape",
			unit: "mm",
			format: "a4",
		})

		// Genera il contenuto per ogni prova
		for (let i = 0; i < tabelloni.length; i++) {
			if (i > 0) {
				doc.addPage()
			}
			await generatePdfContent(doc, tabelloni[i], incontriPerProva[i])
		}

		// Ripristino del metodo originale che funzionava
		doc.autoPrint({ variant: "non-conform" })
		doc.output("dataurlnewwindow")
		window.close()
	}

	const kumiteBaseMultiple = async (
		prove: Prova[],
		incontriPerProva: Incontro[][]
	): Promise<void> => {
		const doc = new jsPDF({
			orientation: "landscape",
			unit: "mm",
			format: "a4",
		})

		// Genera il contenuto per ogni prova
		for (let i = 0; i < prove.length; i++) {
			if (i > 0) {
				doc.addPage()
			}
			await generateMultipleProve(doc, prove[i], incontriPerProva[i])
		}

		// Usa lo stesso metodo di stampa che funzionava
		doc.autoPrint({ variant: "non-conform" })
		doc.output("dataurlnewwindow")
		window.close()
	}

	return {
		kumiteBase,
		kumiteBaseMultiple,
		stampaTutteLeProve, // Aggiungi all'export
	}
}
