import type { Pool, PoolConnection } from "mysql2/promise"
import type {
	Atleta,
	Iscrizione,
	CategoriaRow,
	IscrizioneRow,
} from "../../types/global"

export const aggiornaCategorie = async (
	connection: Pool | PoolConnection,
	input: Atleta | Iscrizione
) => {
	try {
		let iscrizioni: IscrizioneRow[]
		let id_atleta: number | undefined

		// Determina l'id_atleta in base al tipo di input
		if ("id_iscrizione" in input) {
			// Se è un'iscrizione, usa l'id_atleta dall'oggetto atleta
			id_atleta = input.atleta?.id_atleta
			if (!id_atleta) {
				// Se non troviamo l'id_atleta nell'oggetto atleta, cerchiamolo nel database
				const [rows] = await connection.execute<IscrizioneRow[]>(
					"SELECT id_atleta FROM iscrizioni WHERE id_iscrizione = ?",
					[input.id_iscrizione]
				)
				id_atleta = rows[0]?.id_atleta
			}
			iscrizioni = [{ ...(input as IscrizioneRow) }]
		} else {
			// Se è un atleta, usa direttamente il suo id_atleta
			id_atleta = (input as Atleta).id_atleta
			// Recupera tutte le iscrizioni per questo atleta
			const [rows] = await connection.execute<IscrizioneRow[]>(
				"SELECT * FROM iscrizioni WHERE id_atleta = ?",
				[id_atleta]
			)
			iscrizioni = rows
		}

		// Verifica che id_atleta sia definito
		if (!id_atleta) {
			throw new Error("id_atleta non trovato nell'input")
		}

		// Per ogni iscrizione, trova la categoria appropriata
		for (const iscrizione of iscrizioni) {
			const [categorie] = await connection.execute<CategoriaRow[]>(
				`SELECT * FROM categoria_per_iscrizione 
                 WHERE id_atleta = ? AND id_disciplina = ?`,
				[id_atleta, iscrizione.id_disciplina]
			)

			// ...resto del codice invariato...
			if (categorie.length > 0) {
				const nuovaCategoria = categorie[0]

				if (nuovaCategoria.id_categoria !== iscrizione.id_categoria) {
					await connection.execute(
						`UPDATE iscrizioni 
                         SET id_categoria = ?, 
                             manuale = true,
                             confermata = true
                         WHERE id_iscrizione = ?`,
						[nuovaCategoria.id_categoria, iscrizione.id_iscrizione]
					)

					if (iscrizione.id_tabellone) {
						await connection.execute(
							"UPDATE tabelloni SET stampato = false WHERE id_tabellone = ?",
							[iscrizione.id_tabellone]
						)
					}
				}
			}
		}
	} catch (error) {
		console.error("Errore nell'aggiornamento delle categorie:", error)
		throw error
	}
}
