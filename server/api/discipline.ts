import { defineEventHandler } from "h3"
import prisma from "../utils/prisma"

export default defineEventHandler(async () => {
	try {
		return await prisma.disciplina.findMany({
			orderBy: {
				valore: "asc",
			},
		})
	} catch (error) {
		console.error("Errore nel recupero delle discipline:", error)
	}
})
