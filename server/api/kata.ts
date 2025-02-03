import { defineEventHandler } from "h3"
import { prisma } from "~/lib/prisma"

export default defineEventHandler(async () => {
	try {
		return await prisma.kata_shotokan.findMany({
			orderBy: [{ livello: "asc" }, { nome: "asc" }],
		})
	} catch (error) {
		console.error("Errore nel recupero dei kata:", error)
	}
})
