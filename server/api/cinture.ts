import { defineEventHandler, getQuery, readBody, createError } from "h3"
import { prisma } from "~/lib/prisma"

export default defineEventHandler(async (event) => {
	const method = event.node.req.method

	try {
		// GET
		if (method === "GET") {
			return await prisma.cintura.findMany({
				orderBy: {
					kyu: "desc",
				},
			})
		}

		// POST
		if (method === "POST") {
			const body = await readBody(event)
			if (!body.colore || body.kyu === undefined) {
				throw createError({
					statusCode: 400,
					message: "Colore e kyu sono obbligatori",
				})
			}

			return await prisma.cintura.create({
				data: {
					colore: body.colore,
					kyu: body.kyu,
				},
			})
		}

		// PUT
		if (method === "PUT") {
			const query = getQuery(event)
			const id = parseInt(query.id as string)
			const body = await readBody(event)

			if (!body.colore || body.kyu === undefined) {
				throw createError({
					statusCode: 400,
					message: "Colore e kyu sono obbligatori",
				})
			}

			return await prisma.cintura.update({
				where: { id_cintura: id },
				data: {
					colore: body.colore,
					kyu: body.kyu,
				},
			})
		}

		// DELETE
		if (method === "DELETE") {
			const query = getQuery(event)
			const id = parseInt(query.id as string)

			await prisma.cintura.delete({
				where: { id_cintura: id },
			})
			return { id_cintura: id }
		}
	} catch (error) {
		console.error("Errore nella gestione delle cinture:", error)
		throw error
	}
})
