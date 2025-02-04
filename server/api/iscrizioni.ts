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
				const iscrizione = await prisma.iscrizione.findUnique({
					where: { id_iscrizione: id },
					include: {
						atleta: {
							include: {
								cintura: true,
								societa: true,
							},
						},
						categoria: true,
						disciplina: true,
						tabelloni: true,
					},
				})

				if (!iscrizione) {
					throw createError({
						statusCode: 404,
						message: "Iscrizione non trovata",
					})
				}

				return iscrizione
			}

			return await prisma.iscrizione.findMany({
				include: {
					atleta: {
						include: {
							cintura: true,
							societa: true,
						},
					},
					categoria: true,
					disciplina: true,
					tabelloni: true,
				},
			})
		}

		// POST
		if (method === "POST") {
			const body = await readBody(event) // Add event parameter here

			if (!body.atleta?.id_atleta) {
				throw createError({
					statusCode: 400,
					message: "È necessario fornire id_atleta",
				})
			}

			if (!body.disciplina?.id_disciplina) {
				throw createError({
					statusCode: 400,
					message: "id_disciplina è obbligatorio",
				})
			}

			// Verifica duplicati
			const existingIscrizione = await prisma.iscrizione.findFirst({
				where: {
					id_atleta: body.atleta.id_atleta,
					id_disciplina: body.disciplina.id_disciplina,
				},
			})

			if (existingIscrizione) {
				throw createError({
					statusCode: 400,
					message:
						"Esiste già un'iscrizione per questo atleta in questa disciplina",
				})
			}

			// Trova la categoria appropriata
			const atleta = await prisma.atleta.findUnique({
				where: { id_atleta: body.atleta.id_atleta },
				include: { cintura: true },
			})

			if (!atleta) {
				throw createError({
					statusCode: 404,
					message: "Atleta non trovato",
				})
			}

			// Cerca la categoria compatibile
			const categoria = await prisma.categoria.findFirst({
				where: {
					id_disciplina: body.disciplina.id_disciplina,
					OR: [{ sesso: atleta.sesso }, { sesso: "X" }],
					cinture: { some: { id_cintura: atleta.cintura_id } },
					fasce: {
						some: {
							fascia: {
								anno_nascita_min: { lte: atleta.anno_nascita },
								anno_nascita_max: { gte: atleta.anno_nascita },
							},
						},
					},
					AND: [
						{
							OR: [
								{ peso_min: null },
								{ peso_min: { lte: atleta.peso_kg } },
							],
						},
						{
							OR: [
								{ peso_max: null },
								{ peso_max: { gte: atleta.peso_kg } },
							],
						},
					],
				},
			})

			return await prisma.iscrizione.create({
				data: {
					id_atleta: body.atleta.id_atleta,
					id_disciplina: body.disciplina.id_disciplina,
					id_categoria: categoria?.id_categoria,
					manuale: body.manuale || false,
					confermata: categoria ? true : false,
				},
				include: {
					atleta: {
						include: {
							cintura: true,
							societa: true,
						},
					},
					categoria: true,
					disciplina: true,
				},
			})
		}

		// PUT
		if (method === "PUT") {
			const query = getQuery(event)
			const id = parseInt(query.id as string)
			const body = await readBody(event) // Add event parameter here

			return await prisma.iscrizione.update({
				where: { id_iscrizione: id },
				data: {
					confermata: body.confermata,
					id_disciplina: body.disciplina?.id_disciplina,
					id_categoria: body.categoria?.id_categoria,
					manuale: true,
				},
				include: {
					atleta: {
						include: {
							cintura: true,
							societa: true,
						},
					},
					categoria: true,
					disciplina: true,
				},
			})
		}

		// DELETE
		if (method === "DELETE") {
			const query = getQuery(event)
			const id = parseInt(query.id as string)

			await prisma.iscrizione.delete({
				where: { id_iscrizione: id },
			})

			return { id_iscrizione: id }
		}
	} catch (error) {
		console.error("Errore nella gestione delle iscrizioni:", error)
	}
})
