import type { Societa } from "../../types/societa"

export const useSocietaPrint = () => {
	const stampaClassifica = (societaList: Societa[]) => {
		const printWindow = window.open("", "_blank")
		if (!printWindow) {
			console.error("Non è stato possibile aprire la finestra di stampa")
			return
		}
		const title = "Classifica Società"

		const printContent = `
            <html>
                <head>
                    <title>${title}</title>
                    <style>
                        @page { size: portrait; }
                        body { 
                            font-family: Arial, sans-serif;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                        }
                        table { 
                            width: auto;
                            border-collapse: collapse; 
                            margin-top: 20px;
                            margin-left: auto;
                            margin-right: auto;
                        }
                        th, td { 
                            border: 1px solid #ddd; 
                            padding: 8px;
                        }
                        th:nth-child(1), td:nth-child(1),
                        th:nth-child(2), td:nth-child(2) { 
                            min-width: 60px;
                            width: 60px;
                        }
                        th:nth-child(3), td:nth-child(3) { 
                            min-width: 250px;
                        }
                        th { background-color: #f2f2f2; }
                        .header { 
                            text-align: center; 
                            margin-bottom: 20px;
                            width: 100%;
                        }
                        @media print {
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>${title}</h1>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th style="text-align: center">Pos.</th>
                                <th style="text-align: center">Punteggio</th>
                                <th style="text-align: left">Nome Società</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${societaList
								.map(
									(s) => `
                                <tr>
                                    <td style="text-align: center">${s.posizione_classifica}°</td>
                                    <td style="text-align: center">${s.punteggio_totale}</td>
                                    <td>${s.nome_societa}</td>
                                </tr>
                            `
								)
								.join("")}
                        </tbody>
                    </table>
                </body>
            </html>
        `

		printWindow.document.write(printContent)
		printWindow.document.close()
		printWindow.onload = () => {
			printWindow.print()
		}
	}

	return {
		stampaClassifica,
	}
}
