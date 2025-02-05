import { PrismaClient } from "@prisma/client"
import { defineEventHandler, getQuery, readBody, createError } from "h3"

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
	const method = event.method
	const query = getQuery(event)

	try {
		switch (method) {
			case "GET":
				return await prisma.fasce_eta.findMany()

			case "POST":
				const body = await readBody(event)
				return await prisma.fasce_eta.create({
					data: {
						descrizione: body.descrizione,
						anno_nascita_min: body.anno_nascita_min,
						anno_nascita_max: body.anno_nascita_max,
					},
				})

			case "PUT":
				const updateBody = await readBody(event)
				return await prisma.fasce_eta.update({
					where: { id_fascia: Number(query.id) },
					data: {
						descrizione: updateBody.descrizione,
						anno_nascita_min: updateBody.anno_nascita_min,
						anno_nascita_max: updateBody.anno_nascita_max,
					},
				})

			case "DELETE":
				return await prisma.fasce_eta.delete({
					where: { id_fascia: Number(query.id) },
				})
		}
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage:
				error instanceof Error ? error.message : "Errore del server",
		})
	}
})
