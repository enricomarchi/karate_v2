import { defineEventHandler } from "h3"
import { prisma } from "~/lib/prisma"

export default defineEventHandler(async () => {
	try {
		// Utilizziamo una query raw con Prisma perché stiamo lavorando con una vista
		const rows = await prisma.$queryRaw`
            SELECT 
                cat1_id, 
                cat1_nome, 
                cat2_id, 
                cat2_nome, 
                id_disciplina, 
                disciplina 
            FROM categorie_sovrapposte
        `

		return {
			details: rows,
			overlappingIds: (rows as any[]).reduce((acc: number[], row) => {
				if (row.cat1_id && !acc.includes(row.cat1_id)) {
					acc.push(row.cat1_id)
				}
				if (row.cat2_id && !acc.includes(row.cat2_id)) {
					acc.push(row.cat2_id)
				}
				return acc
			}, []),
		}
	} catch (error) {
		console.error("Errore nel recupero delle categorie sovrapposte:", error)
		throw error
	}
})
