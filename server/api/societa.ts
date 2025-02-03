import { defineEventHandler, getQuery, readBody, createError } from "h3"
import { prisma } from "~/lib/prisma"

export default defineEventHandler(async (event) => {
	const method = event.node.req.method

	try {
		// GET
		if (method === "GET") {
			const query = getQuery(event)
			const id = query.id ? parseInt(query.id as string) : null

			if (id) {
				const societa = await prisma.societa.findUnique({
					where: { id_societa: id },
					include: { atleti: true },
				})
				if (!societa)
					throw createError({
						statusCode: 404,
						message: "Società non trovata",
					})
				return societa
			}

			return await prisma.societa.findMany({
				include: { atleti: true },
			})
		}

		// POST
		if (method === "POST") {
			const body = await readBody(event)
			return await prisma.societa.create({
				data: {
					nome_societa: body.nome_societa,
					pagato: body.pagato || 0,
					resto_consegnato: body.resto_consegnato || 0,
				},
				include: { atleti: true },
			})
		}

		// PUT
		if (method === "PUT") {
			const query = getQuery(event)
			const id = parseInt(query.id as string)
			const body = await readBody(event)

			return await prisma.societa.update({
				where: { id_societa: id },
				data: {
					nome_societa: body.nome_societa,
					pagato: body.pagato || 0,
					resto_consegnato: body.resto_consegnato || 0,
				},
				include: { atleti: true },
			})
		}

		// DELETE
		if (method === "DELETE") {
			const query = getQuery(event)
			const id = parseInt(query.id as string)

			// Prisma gestirà automaticamente l'eliminazione degli atleti associati
			// grazie alla relazione onDelete: Cascade definita nello schema
			await prisma.societa.delete({
				where: { id_societa: id },
			})

			return { id_societa: id }
		}
	} catch (error) {
		console.error("Errore nella gestione delle società:", error)
		throw error
	}
})
