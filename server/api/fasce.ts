import { defineEventHandler, getQuery, readBody, createError } from "h3"
import { prisma } from "~/lib/prisma"
import type { Prisma } from "@prisma/client"

export default defineEventHandler(async (event) => {
	const method = event.method || event.node.req.method

	try {
		// GET
		if (method === "GET") {
			const query = getQuery(event)
			const id = query.id ? parseInt(query.id as string) : null

			if (id) {
				const fascia = await prisma.fasciaEta.findUnique({
					where: { id_fascia: id },
				})
				if (!fascia)
					throw createError({
						statusCode: 404,
						message: "Fascia non trovata",
					})
				return fascia
			}

			return await prisma.fasciaEta.findMany({
				include: {
					categorie: true, // Questo includerà le relazioni con le categorie
				},
			})
		}

		// POST
		if (method === "POST") {
			const body = await readBody(event)
			// Verifica se esiste già una fascia con la stessa descrizione
			const existingFascia = await prisma.fasciaEta.findFirst({
				where: {
					descrizione: body.descrizione,
				},
			})

			if (existingFascia) {
				throw createError({
					statusCode: 409,
					message: "Esiste già una fascia con questa descrizione",
				})
			}

			return await prisma.fasciaEta.create({
				data: body,
			})
		}

		// PUT
		if (method === "PUT") {
			const query = getQuery(event)
			const id = parseInt(query.id as string)
			const body = (await readBody(event)) as Prisma.FasciaEtaUpdateInput

			return await prisma.fasciaEta.update({
				where: { id_fascia: id },
				data: body,
			})
		}

		// DELETE
		if (method === "DELETE") {
			const query = getQuery(event)
			const id = parseInt(query.id as string)

			await prisma.fasciaEta.delete({
				where: { id_fascia: id },
			})
			return { id_fascia: id }
		}
	} catch (error) {
		console.error("Errore nell'operazione:", error)
		throw error
	}
})
