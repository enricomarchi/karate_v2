import { defineEventHandler, getQuery, readBody, createError } from "h3"
import prisma from "../utils/prisma"
import { type Prisma, categorie_sesso } from "@prisma/client" // Aggiungi l'import dell'enum

interface CreateCategoriaBody {
	nome: string
	sesso: string
	disciplina?: { id_disciplina: string }
	id_disciplina?: string
	peso_min?: number
	peso_max?: number
	n_ordine?: number
	fasce?: number[]
	cinture?: number[]
}

interface UpdateCategoriaBody extends CreateCategoriaBody {}

interface PrismaError {
	code?: string
	message?: string
}

export default defineEventHandler(async (event) => {
	const method = event.node.req.method
	const query = getQuery(event)

	try {
		// GET per una categoria specifica o tutte
		if (method === "GET") {
			const id = query.id ? parseInt(query.id as string) : null
			const atletaId = query.atletaId
				? parseInt(query.atletaId as string)
				: null

			if (atletaId) {
				const atleta = await prisma.atleti.findUnique({
					where: { id_atleta: atletaId },
					include: { cinture: true },
				})

				if (!atleta || !atleta.cintura_id) {
					throw createError({
						statusCode: 404,
						message: "Atleta non trovato o senza cintura assegnata",
					})
				}

				// Trova categorie compatibili
				return await prisma.categorie.findMany({
					where: {
						OR: [{ sesso: atleta.sesso }, { sesso: "X" }],
						categorie_cinture: {
							some: { id_cintura: atleta.cintura_id },
						},
						categorie_fasce: {
							some: {
								fasce_eta: {
									anno_nascita_min: {
										lte: atleta.anno_nascita,
									},
									anno_nascita_max: {
										gte: atleta.anno_nascita,
									},
								},
							},
						},
						AND: [
							{
								OR: [
									{ peso_min: null },
									{
										peso_min: atleta.peso_kg
											? { lte: atleta.peso_kg }
											: undefined,
									},
								],
							},
							{
								OR: [
									{ peso_max: null },
									{
										peso_max: atleta.peso_kg
											? { gte: atleta.peso_kg }
											: undefined,
									},
								],
							},
						],
					},
					include: {
						discipline: true,
						categorie_fasce: { include: { fasce_eta: true } },
						categorie_cinture: { include: { cinture: true } },
					},
				})
			}

			if (id) {
				const categoria = await prisma.categorie.findUnique({
					where: { id_categoria: id },
					include: {
						discipline: true,
						categorie_fasce: { include: { fasce_eta: true } },
						categorie_cinture: { include: { cinture: true } },
					},
				})

				if (!categoria) {
					throw createError({
						statusCode: 404,
						message: "Categoria non trovata",
					})
				}

				return categoria
			}

			return await prisma.categorie.findMany({
				include: {
					discipline: true,
					categorie_fasce: { include: { fasce_eta: true } },
					categorie_cinture: { include: { cinture: true } },
				},
			})
		}

		// POST
		if (method === "POST") {
			const body = (await readBody(event)) as CreateCategoriaBody

			const categoria = await prisma.categorie.create({
				data: {
					nome: body.nome,
					sesso: body.sesso as categorie_sesso, // Ora TypeScript riconoscerà l'enum
					id_disciplina:
						body.id_disciplina ||
						body.disciplina?.id_disciplina ||
						"",
					peso_min: body.peso_min
						? parseFloat(body.peso_min.toString())
						: null,
					peso_max: body.peso_max
						? parseFloat(body.peso_max.toString())
						: null,
					n_ordine: body.n_ordine || (await getNextOrder()),
					categorie_fasce: {
						create:
							body.fasce?.map((id_fascia) => ({
								fasce_eta: {
									connect: { id_fascia },
								},
							})) || [],
					},
					categorie_cinture: {
						create:
							body.cinture?.map((id_cintura) => ({
								cinture: {
									connect: { id_cintura },
								},
							})) || [],
					},
				},
				include: {
					discipline: true,
					categorie_fasce: { include: { fasce_eta: true } },
					categorie_cinture: { include: { cinture: true } },
				},
			})

			return categoria
		}

		// PUT
		if (method === "PUT") {
			const id = parseInt(query.id as string)
			const body = (await readBody(event)) as UpdateCategoriaBody

			// Prima elimina le relazioni esistenti
			await prisma.categorie_fasce.deleteMany({
				where: { id_categoria: id },
			})
			await prisma.categorie_cinture.deleteMany({
				where: { id_categoria: id },
			})

			// Poi aggiorna la categoria con le nuove relazioni
			const categoria = await prisma.categorie.update({
				where: { id_categoria: id },
				data: {
					nome: body.nome,
					sesso: body.sesso as categorie_sesso, // Ora TypeScript riconoscerà l'enum
					id_disciplina:
						body.id_disciplina ||
						body.disciplina?.id_disciplina ||
						"",
					peso_min: body.peso_min
						? parseFloat(body.peso_min.toString())
						: null,
					peso_max: body.peso_max
						? parseFloat(body.peso_max.toString())
						: null,
					n_ordine: body.n_ordine,
					categorie_fasce: {
						create:
							body.fasce?.map((id_fascia) => ({
								fasce_eta: {
									connect: { id_fascia },
								},
							})) || [],
					},
					categorie_cinture: {
						create:
							body.cinture?.map((id_cintura) => ({
								cinture: {
									connect: { id_cintura },
								},
							})) || [],
					},
				},
				include: {
					discipline: true,
					categorie_fasce: { include: { fasce_eta: true } },
					categorie_cinture: { include: { cinture: true } },
				},
			})

			return categoria
		}

		// DELETE
		if (method === "DELETE") {
			const id = parseInt(query.id as string)
			await prisma.categorie.delete({
				where: { id_categoria: id },
			})
			return { id_categoria: id }
		}

		throw createError({
			statusCode: 405,
			message: "Method not allowed",
		})
	} catch (error) {
		console.error("Errore nella gestione delle categorie:", error)
		throw error instanceof Error
			? createError({ statusCode: 500, message: error.message })
			: createError({
					statusCode: 500,
					message: "Errore interno del server",
				})
	}
})

async function getNextOrder() {
	const maxOrder = await prisma.categorie.aggregate({
		_max: { n_ordine: true },
	})
	return (maxOrder._max.n_ordine || 0) + 1
}
