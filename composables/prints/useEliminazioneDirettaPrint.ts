import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import type { Prova, Incontro } from "../../types/tabellone" // Rimuovi TabelloneInfo
import { usePrintHeader } from "./usePrintHeader"

export const useEliminazioneDirettaPrint = () => {
	// Costanti di layout
	const MATCH_BOX_HEIGHT = Math.max(8, 1) // Ridotto da 12 a 8
	const MATCH_BOX_WIDTH = Math.max(35, 1) // Torna a 35
	const COLOR_BOX_WIDTH = 4 // Torna a 4
	const COLOR_BOX_HEIGHT = 4 // Altezza del riquadro del colore
	const HORIZONTAL_GAP = Math.max(5, 1) // Torna a 5
	const CONNECTION_EXTEND = Math.max(2, 1) // Ridotto da 4 a 2
	const VERTICAL_BASE_GAP = Math.max(4, 1) // Ridotto da 5 a 4
	const VERTICAL_BOX_GAP = Math.max(4, 1) // Ridotto da 5 a 4
	const MATCH_PAIR_GAP = VERTICAL_BOX_GAP * 2 // Gap fra un incontro e l'altro nella fase iniziale
	const PAGE_MARGIN = Math.max(8, 1) // Ridotto da 15 a 8 per dare più spazio laterale
	const MATCH_PAIR_HEIGHT = MATCH_BOX_HEIGHT * 2 // Altezza totale di una coppia di box
	const WINNER_TEXT_OFFSET = 15 // Offset per il testo del vincitore

	// Aggiungi questa costante dopo le altre costanti di layout
	const FASE_TITLE_MARGIN = 5 // Margine sopra il titolo della fase

	// Mappa per l'ordine delle fasi
	const ordineDellaFase: Record<string, number> = {
		SEDICESIMI: 1,
		OTTAVI: 2,
		QUARTI: 3,
		SEMIFINALI: 4,
		FINALE: 5,
	}

	// Helper per disegnare un match box
	const drawMatchBox = (
		doc: jsPDF,
		x: number,
		y: number,
		incontro: Incontro | null,
		isRosso: boolean,
		allIncontri: Incontro[], // Aggiunto questo parametro
		isFinale: boolean = false // Aggiungi valore di default
	) => {
		// Assicurati che le coordinate siano numeri validi
		const safeX = Math.max(Number(x) || 0, 0)
		const safeY = Math.max(Number(y) || 0, 0)

		try {
			// Disegna sempre il box vuoto
			doc.setFillColor(255, 255, 255)
			doc.setDrawColor(0, 0, 0) // Modificato: ora nero invece di grigio
			doc.setLineWidth(0.2) // Aggiunto: linea più sottile
			doc.rect(safeX, safeY, MATCH_BOX_WIDTH, MATCH_BOX_HEIGHT, "F")
			doc.rect(safeX, safeY, MATCH_BOX_WIDTH, MATCH_BOX_HEIGHT, "S")

			// Disegna sempre il riquadro del colore
			doc.setFillColor(240, 240, 240)
			doc.rect(
				safeX + 2,
				safeY + (MATCH_BOX_HEIGHT - COLOR_BOX_HEIGHT) / 2,
				COLOR_BOX_WIDTH,
				COLOR_BOX_HEIGHT,
				"F"
			)
			doc.setDrawColor(0, 0, 0)
			doc.setLineWidth(0.2)
			doc.rect(
				safeX + 2,
				safeY + (MATCH_BOX_HEIGHT - COLOR_BOX_HEIGHT) / 2,
				COLOR_BOX_WIDTH,
				COLOR_BOX_HEIGHT,
				"S"
			)

			// Testo R o B nel riquadro (sempre)
			doc.setFontSize(6)
			doc.setTextColor(0, 0, 0)
			doc.text(
				isRosso ? "R" : "B",
				safeX + 4,
				safeY + MATCH_BOX_HEIGHT / 2 + 1,
				{ align: "center" }
			)

			if (incontro) {
				// Controlla se l'atleta deve essere mostrato
				const isFirstPhase =
					allIncontri.length > 0 &&
					incontro.fase === allIncontri[0].fase // Usa la prima fase degli incontri come fase iniziale
				const skipAtleta =
					isFirstPhase && !incontro.id_atleta_bianco && isRosso

				if (!skipAtleta) {
					// Nome e società con offset per il riquadro colore
					doc.setTextColor(0, 0, 0) // Modificato: tutto in nero invece di rosso/grigio
					doc.setFontSize(7)
					const nome = isRosso
						? `${incontro.cognome_rosso || ""} ${
								incontro.nome_rosso || ""
						  }`
						: `${incontro.cognome_bianco || ""} ${
								incontro.nome_bianco || ""
						  }`
					const societa = isRosso
						? incontro.societa_rosso
						: incontro.societa_bianco

					// Sposta il testo dopo il riquadro del colore
					const textStartX = safeX + COLOR_BOX_WIDTH + 4
					if (nome.trim()) {
						doc.text(nome.trim(), textStartX, safeY + 4)
					}
					if (societa) {
						doc.setFontSize(5)
						doc.text(societa, textStartX, safeY + 7)
					}
				}
			}

			// Aggiungi il testo del vincitore sotto al box della finale
			if (incontro && incontro.fase === "FINALE") {
				doc.setFontSize(7) // Stessa dimensione del nome atleta
				doc.setTextColor(0, 0, 0)
				const winnerText = isRosso
					? "Vincitore Gruppo A"
					: "Vincitore Gruppo B"
				doc.text(
					winnerText,
					safeX + COLOR_BOX_WIDTH + 4, // Stesso offset orizzontale del nome atleta
					safeY + MATCH_BOX_HEIGHT + 4, // Solo 4mm sotto il box
					{
						align: "left",
					}
				)
			}
		} catch (error) {
			console.error("Errore nel disegno del box:", error, {
				x: safeX,
				y: safeY,
			})
		}
	}

	// Helper per disegnare le connessioni tra i match
	const drawMatchConnections = (
		doc: jsPDF,
		fromX: number,
		fromY1: number, // posizione Y del rosso
		fromY2: number, // posizione Y del bianco
		toX: number,
		toY: number, // posizione Y di destinazione
		isToUpper: boolean // true se va al rosso, false se va al bianco
	) => {
		const safeFromX = Math.max(Number(fromX) || 0, 0)
		const safeFromY1 = Math.max(Number(fromY1) || 0, 0)
		const safeFromY2 = Math.max(Number(fromY2) || 0, 0)
		const safeToX = Math.max(Number(toX) || 0, 0)
		const safeToY = Math.max(Number(toY) || 0, 0)

		doc.setDrawColor(0, 0, 0) // Modificato: ora nero invece di grigio
		doc.setLineWidth(0.2) // Modificato: linea più sottile

		try {
			// Punto di partenza dal box rosso e bianco (al centro)
			const fromY1Middle = safeFromY1 + MATCH_BOX_HEIGHT / 2
			const fromY2Middle = safeFromY2 + MATCH_BOX_HEIGHT / 2

			// Modifica: sposta il punto verticale più vicino ai box di origine
			const verticalX = safeFromX + HORIZONTAL_GAP / 2

			// Punto centrale della linea verticale
			const verticalMiddleY = (fromY1Middle + fromY2Middle) / 2

			// 1. Linee orizzontali dai box alla linea verticale
			doc.line(safeFromX, fromY1Middle, verticalX, fromY1Middle) // dal rosso
			doc.line(safeFromX, fromY2Middle, verticalX, fromY2Middle) // dal bianco

			// 2. Linea verticale che congiunge le due orizzontali
			doc.line(verticalX, fromY1Middle, verticalX, fromY2Middle)

			// 3. Linea orizzontale dal punto centrale al match successivo
			doc.line(verticalX, verticalMiddleY, safeToX, verticalMiddleY)
		} catch (error) {
			console.error("Errore nel disegno delle connessioni:", error)
		}
	}

	const calculatePositions = (
		fase: string,
		faseIndex: number,
		numIncontri: number,
		startY: number,
		prevPositions?: number[],
		hasSedicesimi?: boolean // nuovo parametro
	): number[] => {
		const positions: number[] = []

		// Caso speciale per la finale solo se ci sono i sedicesimi
		if (fase === "FINALE" && hasSedicesimi) {
			if (prevPositions) {
				// Per il rosso: media delle posizioni dei semifinalisti nella prima pagina
				const rossoY = (prevPositions[0] + prevPositions[1]) / 2
				// Per il bianco: usa la stessa posizione Y del rosso
				const biancoY = rossoY
				positions.push(rossoY, biancoY)
			} else {
				positions.push(
					startY,
					startY + MATCH_BOX_HEIGHT + VERTICAL_BOX_GAP
				)
			}
			return positions
		}

		// Per tutte le altre fasi e per la finale quando non ci sono sedicesimi
		if (faseIndex === 0 || !prevPositions) {
			// Prima fase o se non ci sono posizioni precedenti: manteniamo la distanza fissa
			for (let i = 0; i < numIncontri; i++) {
				const baseY =
					startY +
					i *
						(MATCH_BOX_HEIGHT * 2 +
							VERTICAL_BOX_GAP +
							MATCH_PAIR_GAP)
				positions.push(baseY) // posizione rosso
				positions.push(baseY + MATCH_BOX_HEIGHT + VERTICAL_BOX_GAP) // posizione bianco
			}
		} else {
			// Fasi successive: ogni posizione è la media delle due posizioni precedenti
			for (let i = 0; i < numIncontri; i++) {
				const prevPosIndex = i * 4 // Indice base degli incontri precedenti

				// Verifica che gli indici esistano nell'array prevPositions
				if (prevPosIndex + 3 < prevPositions.length) {
					// Posizione rosso: media tra le posizioni dei due atleti che si sono scontrati
					const yRosso =
						(prevPositions[prevPosIndex] +
							prevPositions[prevPosIndex + 1]) /
						2

					// Posizione bianco: media tra le posizioni dei due atleti che si sono scontrati
					const yBianco =
						(prevPositions[prevPosIndex + 2] +
							prevPositions[prevPosIndex + 3]) /
						2

					positions.push(yRosso)
					positions.push(yBianco)
				} else {
					// Fallback se non abbiamo abbastanza posizioni precedenti
					const baseY =
						startY + i * (MATCH_BOX_HEIGHT * 2 + VERTICAL_BOX_GAP)
					positions.push(baseY)
					positions.push(baseY + MATCH_BOX_HEIGHT + VERTICAL_BOX_GAP)
				}
			}
		}

		return positions
	}

	// Aggiungi questa nuova funzione helper
	const shouldSplitPages = (incontri: Incontro[]): boolean => {
		return incontri.some((inc) => inc.fase === "SEDICESIMI")
	}

	// Sostituisci la funzione getIncontroPage con questa nuova versione
	const getIncontroPage = (incontro: Incontro, isRosso: boolean): number => {
		// Mappa degli ordini per la prima pagina
		const ordiniPrimaPagina = new Set([
			1,
			2,
			3,
			4,
			5,
			6,
			7,
			8, // Sedicesimi 1-8
			17,
			18,
			19,
			20, // Ottavi 17-20
			25,
			26, // Quarti 25-26
			29, // Semifinale 29
			...(isRosso ? [31] : []), // Finale 31 solo rosso
		])

		// Per la finale, separa rosso e bianco
		if (incontro.ordine === 31) {
			return isRosso ? 0 : 1
		}

		// Per tutti gli altri incontri
		return ordiniPrimaPagina.has(incontro.ordine) ? 0 : 1
	}

	// Aggiungi queste nuove funzioni dopo le altre funzioni helper
	const drawGroupText = (doc: jsPDF, pageNum: number, y: number) => {
		doc.setFontSize(12)
		doc.setTextColor(0, 0, 0)
		doc.setFont("", "bold")
		doc.text(
			pageNum === 0 ? "GRUPPO A" : "GRUPPO B",
			doc.internal.pageSize.width / 2,
			y + 2.5, // Modificato da 5 a 2.5 per dimezzare lo spazio
			{ align: "center" }
		)
		doc.setFont("", "normal")
	}

	const drawPageNote = (doc: jsPDF, pageNum: number) => {
		doc.setFontSize(10)
		doc.setTextColor(0, 0, 0)
		doc.setFont("", "bold")
		const note =
			pageNum === 0
				? "Il tabellone continua nella pagina successiva con il GRUPPO B"
				: "Fine del tabellone"
		doc.text(
			note,
			PAGE_MARGIN, // Usa PAGE_MARGIN invece di centrare
			doc.internal.pageSize.height - 15,
			{ align: "left" } // Cambiato da center a left
		)
		doc.setFont("", "normal")
	}

	// Aggiungi questa funzione helper dopo le altre funzioni helper
	const drawFaseTitle = (
		doc: jsPDF,
		fase: string,
		x: number,
		y: number,
		boxWidth: number
	) => {
		doc.setFontSize(8)
		doc.setTextColor(0, 0, 0)
		doc.setFont("helvetica", "bold")

		// Mappa dei nomi delle fasi per la visualizzazione
		const faseNames: Record<string, string> = {
			SEDICESIMI: "16° di Finale",
			OTTAVI: "8° di Finale",
			QUARTI: "4° di Finale",
			SEMIFINALI: "Semifinali",
			FINALE: "Finale",
		}

		const title = faseNames[fase] || fase
		// Centra il testo rispetto alla colonna degli incontri
		doc.text(title, x + boxWidth / 2, y - FASE_TITLE_MARGIN, {
			align: "center",
		})
	}

	// Modifica la mappa dei nomi delle fasi
	const faseNames: Record<string, string> = {
		SEDICESIMI: "SEDICESIMI",
		OTTAVI: "OTTAVI",
		QUARTI: "QUARTI",
		SEMIFINALI: "SEMIFINALI",
		FINALE: "FINALE",
	}

	// Aggiungi questa nuova funzione per disegnare tutti i titoli in una riga
	const drawAllFaseTitles = (
		doc: jsPDF,
		fasiOrdinate: string[],
		startX: number,
		startY: number
	) => {
		doc.setFontSize(8)
		doc.setTextColor(0, 0, 0)
		doc.setFont("helvetica", "bold")

		fasiOrdinate.forEach((fase, index) => {
			const title = faseNames[fase] || fase
			const x = startX + (MATCH_BOX_WIDTH + HORIZONTAL_GAP) * index
			doc.text(title, x + MATCH_BOX_WIDTH / 2, startY, {
				align: "center",
			})
		})
	}

	// Aggiungi questa nuova funzione dopo le altre funzioni helper
	const drawFinalistsTable = (
		doc: jsPDF,
		x: number,
		y: number,
		title: string,
		incontri: Incontro[],
		isThirdPlace: boolean = false
	) => {
		const TABLE_WIDTH = 60 // Aumentato da 50 a 60 per dare spazio al riquadro colore
		const ROW_HEIGHT = 8
		const PADDING = 2
		const COLOR_BOX_WIDTH = 4 // Stessa dimensione usata nei match box
		const COLOR_BOX_HEIGHT = 4 // Stessa dimensione usata nei match box
		const FIRST_COL_WIDTH = TABLE_WIDTH * 0.7 // 70% della larghezza per i Finalisti (aumentato per il riquadro colore)
		const SECOND_COL_WIDTH = TABLE_WIDTH * 0.3 // 30% della larghezza per la Classifica

		// Configura lo stile
		doc.setFontSize(8)
		doc.setTextColor(0, 0, 0)
		doc.setDrawColor(0, 0, 0)
		doc.setLineWidth(0.2)

		// Disegna il titolo
		doc.setFont("helvetica", "bold")
		doc.text(title, x + TABLE_WIDTH / 2, y - 3, { align: "center" })

		// Intestazioni colonne
		const headers = ["Finalisti", "Classifica"]

		// Disegna la riga di intestazione
		doc.line(x, y, x + TABLE_WIDTH, y)
		doc.line(x, y, x, y + ROW_HEIGHT * 3)
		doc.line(
			x + FIRST_COL_WIDTH,
			y,
			x + FIRST_COL_WIDTH,
			y + ROW_HEIGHT * 3
		)
		doc.line(x + TABLE_WIDTH, y, x + TABLE_WIDTH, y + ROW_HEIGHT * 3)

		// Disegna le intestazioni
		headers.forEach((header, i) => {
			const colWidth = i === 0 ? FIRST_COL_WIDTH : SECOND_COL_WIDTH
			const colX = x + (i === 0 ? 0 : FIRST_COL_WIDTH)
			doc.text(header, colX + colWidth / 2, y + PADDING + 2, {
				align: "center",
			})
		})

		// Linea sotto le intestazioni
		doc.line(x, y + ROW_HEIGHT, x + TABLE_WIDTH, y + ROW_HEIGHT)

		// Aggiungi due righe vuote per i risultati, includendo i riquadri colore
		for (let i = 1; i <= 2; i++) {
			const rowY = y + ROW_HEIGHT * i

			// Disegna la linea orizzontale della riga
			doc.line(x, rowY, x + TABLE_WIDTH, rowY)

			// Disegna il riquadro del colore
			doc.setFillColor(240, 240, 240)
			const boxY = rowY + (ROW_HEIGHT - COLOR_BOX_HEIGHT) / 2
			doc.rect(x + 2, boxY, COLOR_BOX_WIDTH, COLOR_BOX_HEIGHT, "F")
			doc.setDrawColor(0, 0, 0)
			doc.setLineWidth(0.2)
			doc.rect(x + 2, boxY, COLOR_BOX_WIDTH, COLOR_BOX_HEIGHT, "S")

			// Aggiungi il testo "R" o "B" nel riquadro
			doc.setFontSize(6)
			doc.setTextColor(0, 0, 0)
			doc.text(
				i === 1 ? "R" : "B",
				x + 4,
				boxY + COLOR_BOX_HEIGHT / 2 + 1,
				{
					align: "center",
				}
			)
		}

		// Linea finale della tabella
		doc.line(x, y + ROW_HEIGHT * 3, x + TABLE_WIDTH, y + ROW_HEIGHT * 3)

		return ROW_HEIGHT * 3 + 4
	}

	const eliminazioneDiretta = async (
		tabelloni: Prova[],
		incontriPerTabellone: Incontro[][]
	) => {
		const doc = new jsPDF({
			orientation: "portrait", // Cambiato in portrait
			unit: "mm",
			format: "a4",
		})
		const { drawHeader } = usePrintHeader()

		for (let i = 0; i < tabelloni.length; i++) {
			const tabellone = tabelloni[i]
			const incontri = incontriPerTabellone[i]
			const needsSplit = shouldSplitPages(incontri)

			try {
				for (
					let pageNum = 0;
					pageNum <= (needsSplit ? 1 : 0);
					pageNum++
				) {
					if (pageNum > 0 || (i > 0 && pageNum === 0)) {
						doc.addPage()
					}

					const { headerHeight } = drawHeader(
						doc,
						tabellone,
						PAGE_MARGIN
					)
					const startY = headerHeight + 5 // Ridotto da 10 a 5 per dimezzare lo spazio dopo l'header

					// Aggiungi il testo del gruppo se ci sono i sedicesimi
					if (needsSplit) {
						drawGroupText(doc, pageNum, headerHeight)
					}

					// Resto del codice per il disegno del tabellone
					// Filtra gli incontri per questa pagina
					const incontriDiPagina = incontri.filter((inc) => {
						// Se non è necessario dividere le pagine, mostra tutto nella prima
						if (!needsSplit) return pageNum === 0

						// Per la finale, dividi rosso e bianco nelle due pagine
						if (inc.ordine === 31) {
							if (pageNum === 0) {
								// Nella prima pagina, mostra solo la casella rossa
								return true
							} else {
								// Nella seconda pagina, mostra solo la casella bianca
								return true
							}
						}

						return getIncontroPage(inc, true) === pageNum
					})

					// Raggruppa gli incontri per fase
					const incontriPerFase = incontriDiPagina.reduce(
						(
							acc: Record<string, Incontro[]>,
							incontro: Incontro
						) => {
							if (!acc[incontro.fase]) {
								acc[incontro.fase] = []
							}
							acc[incontro.fase].push(incontro)
							return acc
						},
						{}
					)

					// Ordina gli incontri e calcola posizioni
					let startX = PAGE_MARGIN
					// Modifica startY per iniziare più in basso dopo l'header
					// Da PAGE_MARGIN + 12 a headerHeight + 10

					// Inizializza positionsMap all'interno del loop della pagina
					const positionsMap: Record<string, number[]> = {}

					// Ottieni l'array delle fasi ordinate presenti in questa pagina
					const fasiOrdinate = Object.keys(ordineDellaFase)
						.filter((fase) => incontriPerFase[fase])
						.sort((a, b) => ordineDellaFase[a] - ordineDellaFase[b])

					// Disegna tutti i titoli in una volta sola
					drawAllFaseTitles(doc, fasiOrdinate, startX, startY + 3)

					// Modifica il calcolo delle posizioni per considerare il nuovo startY
					fasiOrdinate.forEach((fase, faseIndex) => {
						const incontriDiFase = incontriPerFase[fase]
						const positions = calculatePositions(
							fase,
							faseIndex,
							incontriDiFase.length,
							startY + 10, // Aumentato da 5 a 10 per dare più spazio dopo i titoli
							faseIndex > 0
								? positionsMap[fasiOrdinate[faseIndex - 1]]
								: undefined,
							needsSplit // passa il flag che indica se ci sono sedicesimi
						)

						positionsMap[fase] = positions

						// Rimuovi la chiamata a drawFaseTitle qui

						// Disegna gli incontri usando le posizioni calcolate
						for (let i = 0; i < incontriDiFase.length; i++) {
							const incontro = incontriDiFase[i]
							const y = positions[i * 2]
							const yBianco = positions[i * 2 + 1]

							// Per la finale, disegna solo il box appropriato per la pagina
							if (incontro.ordine === 31) {
								if (pageNum === 0) {
									drawMatchBox(
										doc,
										startX,
										y,
										incontro,
										true,
										incontri,
										tabellone.is_finale ?? false // passa il flag is_finale
									) // Aggiunto incontri
								} else {
									drawMatchBox(
										doc,
										startX,
										yBianco,
										incontro,
										false,
										incontri,
										tabellone.is_finale ?? false // passa il flag is_finale
									) // Aggiunto incontri
								}
							} else {
								drawMatchBox(
									doc,
									startX,
									y,
									incontro,
									true,
									incontri,
									tabellone.is_finale ?? false // passa il flag is_finale
								) // Aggiunto incontri
								drawMatchBox(
									doc,
									startX,
									yBianco,
									incontro,
									false,
									incontri,
									tabellone.is_finale ?? false // passa il flag is_finale
								) // Aggiunto incontri
							}

							if (faseIndex < fasiOrdinate.length - 1) {
								// Se è un numero pari, va al rosso del prossimo incontro
								const isToUpper = i % 2 === 0
								const nextY =
									positions[
										Math.floor(i / 2) * 2 +
											(isToUpper ? 0 : 1)
									]

								drawMatchConnections(
									doc,
									startX + MATCH_BOX_WIDTH,
									y,
									yBianco,
									startX + MATCH_BOX_WIDTH + HORIZONTAL_GAP,
									nextY,
									isToUpper
								)
							}
						}

						startX += MATCH_BOX_WIDTH + HORIZONTAL_GAP
					})

					// Prima della fine del loop di pageNum, aggiungi la nota
					if (needsSplit) {
						drawPageNote(doc, pageNum)
					}

					// All'interno del loop delle pagine, dopo aver disegnato gli incontri:
					if (pageNum === 0) {
						// Disegna le tabelle solo nella prima pagina
						const tableStartX =
							doc.internal.pageSize.width - PAGE_MARGIN - 60 // 50 è TABLE_WIDTH
						let tableStartY = doc.internal.pageSize.height - 65 // Ridotto da 80 a 50 per meno spazio dal fondo

						// Disegna la tabella dei finalisti
						const heightFinale = drawFinalistsTable(
							doc,
							tableStartX,
							tableStartY,
							"FINALE",
							incontri
						)

						// Disegna la tabella del 3°/4° posto
						drawFinalistsTable(
							doc,
							tableStartX,
							tableStartY + heightFinale + 5,
							"FINALE 3°/4° POSTO",
							incontri,
							true
						)
					}
				}
			} catch (error) {
				console.error("Errore durante la generazione del PDF:", error)
				throw error
			}
		}

		// Crea un nome file significativo usando le informazioni del primo tabellone
		const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD
		const tabellone = tabelloni[0] // Usiamo il primo tabellone per il nome
		const fileName =
			`Tabellone_${tabellone.codice_tabellone}_${tabellone.nome_tabellone}_${today}.pdf`
				.replace(/\s+/g, "_") // Sostituisce spazi con underscore
				.replace(/[^a-z0-9_.-]/gi, "") // Rimuove caratteri speciali

		// Stampa diretta con nome file personalizzato
		doc.autoPrint({ variant: "non-conform" })
		doc.output("dataurlnewwindow", { filename: fileName })
	}

	return {
		eliminazioneDiretta, // esporta solo la funzione rinominata
	}
}
