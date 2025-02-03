import { PrismaClient, Iscrizione, Atleta } from "@prisma/client"

export const aggiornaCategorie = async (
	prisma: PrismaClient,
	input: Atleta | Iscrizione
) => {
	try {
		let id_atleta: number | undefined

		// Determina l'id_atleta in base al tipo di input
		if ("id_iscrizione" in input) {
			// Se è un'iscrizione, usa l'id_atleta dall'oggetto atleta
			id_atleta = input.id_atleta
			if (!id_atleta) {
				// Se non troviamo l'id_atleta nell'oggetto atleta, cerchiamolo nel database
				const iscrizione = await prisma.iscrizione.findUnique({
					where: { id_iscrizione: input.id_iscrizione },
					select: { id_atleta: true },
				})
				id_atleta = iscrizione?.id_atleta
			}
		} else {
			// Se è un atleta, usa direttamente il suo id_atleta
			id_atleta = input.id_atleta
		}

		// Verifica che id_atleta sia definito
		if (!id_atleta) {
			throw new Error("id_atleta non trovato nell'input")
		}

		// Recupera tutte le iscrizioni per questo atleta
		const iscrizioni = await prisma.iscrizione.findMany({
			where: { id_atleta },
		})

		// Per ogni iscrizione, trova la categoria appropriata
		for (const iscrizione of iscrizioni) {
			const categorie = await prisma.$queryRaw<
				Array<{ id_categoria: number }>
			>`
				SELECT id_categoria 
				FROM categoria_per_iscrizione 
				WHERE id_atleta = ${id_atleta} 
				AND id_disciplina = ${iscrizione.id_disciplina}
			`

			if (categorie.length > 0) {
				const nuovaCategoria = categorie[0]

				if (nuovaCategoria.id_categoria !== iscrizione.id_categoria) {
					// Aggiorna l'iscrizione con la nuova categoria
					await prisma.iscrizione.update({
						where: { id_iscrizione: iscrizione.id_iscrizione },
						data: {
							id_categoria: nuovaCategoria.id_categoria,
							manuale: true,
							confermata: true,
						},
					})

					// Se l'iscrizione ha un tabellone, marca il tabellone come non stampato
					if (iscrizione.id_tabellone) {
						await prisma.tabelloni.update({
							where: { id_tabellone: iscrizione.id_tabellone },
							data: { stampato: false },
						})
					}
				}
			}
		}
	} catch (error) {
		console.error("Errore nell'aggiornamento delle categorie:", error)
		throw error
	}
}
