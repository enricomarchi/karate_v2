import { defineEventHandler, getQuery, readBody, createError } from "h3"
import prisma from "../utils/prisma"

export default defineEventHandler(async (event) => {
	const method = event.node.req.method

	try {
		// GET
		if (method === "GET") {
			const query = getQuery(event)
			const id = query.id ? parseInt(query.id as string) : null

			if (id) {
				const atleta = await prisma.atleti.findUnique({
					where: { id_atleta: id },
					include: {
						cinture: true,
						societa: true,
						iscrizioni: {
							include: {
								categorie: true,
								discipline: true,
							},
						},
					},
				})
				if (!atleta)
					throw createError({
						statusCode: 404,
						message: "Atleta non trovato",
					})
				return atleta
			}

			return await prisma.atleti.findMany({
				include: {
					cinture: true,
					societa: true,
				},
			})
		}

		// POST
		if (method === "POST") {
			const body = await readBody(event)
			return await prisma.atleti.create({
				data: {
					cognome: body.cognome,
					nome: body.nome,
					sesso: body.sesso,
					anno_nascita: body.anno_nascita,
					cintura_id: body.cintura_id,
					dan: body.dan,
					peso_kg: body.peso_kg,
					id_societa: body.id_societa,
				},
				include: {
					cinture: true,
					societa: true,
				},
			})
		}

		// PUT
		if (method === "PUT") {
			const query = getQuery(event)
			const id = parseInt(query.id as string)
			const body = await readBody(event)

			// Aggiornamento dell'atleta
			const updatedAthlete = await prisma.atleti.update({
				where: { id_atleta: id },
				data: {
					cognome: body.cognome,
					nome: body.nome,
					sesso: body.sesso,
					anno_nascita: body.anno_nascita,
					cintura_id: body.cintura_id,
					dan: body.dan,
					peso_kg: body.peso_kg,
					id_societa: body.id_societa,
				},
				include: {
					cinture: true,
					societa: true,
					iscrizioni: true,
				},
			})

			return updatedAthlete
		}

		// DELETE
		if (method === "DELETE") {
			const query = getQuery(event)
			const id = parseInt(query.id as string)

			// Prisma gestirà automaticamente l'eliminazione delle iscrizioni correlate
			// grazie alla relazione onDelete: Cascade definita nello schema
			await prisma.atleti.delete({
				where: { id_atleta: id },
			})

			return { id_atleta: id }
		}
	} catch (error) {
		console.error("Errore nella gestione degli atleti:", error)
	}
})
