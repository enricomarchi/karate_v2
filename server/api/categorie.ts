import { defineEventHandler, getQuery, readBody, createError } from "h3"
import { prisma } from "~/lib/prisma"
import { type Prisma } from "@prisma/client"

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
				const atleta = await prisma.atleta.findUnique({
					where: { id_atleta: atletaId },
					include: { cintura: true },
				})

				if (!atleta || !atleta.cintura_id) {
					throw createError({
						statusCode: 404,
						message: "Atleta non trovato o senza cintura assegnata",
					})
				}

				// Trova categorie compatibili
				return await prisma.categoria.findMany({
					where: {
						OR: [{ sesso: atleta.sesso }, { sesso: "X" }],
						cinture: { some: { id_cintura: atleta.cintura_id } },
						fasce: {
							some: {
								fascia: {
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
						disciplina: true,
						fasce: { include: { fascia: true } },
						cinture: { include: { cintura: true } },
					},
				})
			}

			if (id) {
				const categoria = await prisma.categoria.findUnique({
					where: { id_categoria: id },
					include: {
						disciplina: true,
						fasce: { include: { fascia: true } },
						cinture: { include: { cintura: true } },
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

			return await prisma.categoria.findMany({
				include: {
					disciplina: true,
					fasce: { include: { fascia: true } },
					cinture: { include: { cintura: true } },
				},
			})
		}

		// POST
		if (method === "POST") {
			const body = await readBody(event)

			const data: Prisma.CategoriaCreateInput = {
				nome: body.nome,
				sesso: body.sesso,
				disciplina: {
					connect: {
						id_disciplina:
							body.disciplina?.id_disciplina ||
							body.id_disciplina,
					},
				},
				peso_min: body.peso_min || null,
				peso_max: body.peso_max || null,
				n_ordine: body.n_ordine || (await getNextOrder()),
				fasce: {
					create: body.fasce?.map((id_fascia: number) => ({
						fascia: { connect: { id_fascia } },
					})),
				},
				cinture: {
					create: body.cinture?.map((id_cintura: number) => ({
						cintura: { connect: { id_cintura } },
					})),
				},
			}

			return await prisma.categoria.create({
				data,
				include: {
					disciplina: true,
					fasce: { include: { fascia: true } },
					cinture: { include: { cintura: true } },
				},
			})
		}

		// PUT
		if (method === "PUT") {
			const id = parseInt(query.id as string)
			const body = await readBody(event)

			const data: Prisma.CategoriaUpdateInput = {
				nome: body.nome,
				sesso: body.sesso,
				disciplina: body.id_disciplina
					? {
							connect: { id_disciplina: body.id_disciplina },
					  }
					: undefined,
				peso_min: body.peso_min ?? null,
				peso_max: body.peso_max ?? null,
				n_ordine: body.n_ordine,
				fasce: body.fasce
					? {
							deleteMany: {},
							create: body.fasce.map((id_fascia: number) => ({
								fascia: { connect: { id_fascia } },
							})),
					  }
					: undefined,
				cinture: body.cinture
					? {
							deleteMany: {},
							create: body.cinture.map((id_cintura: number) => ({
								cintura: { connect: { id_cintura } },
							})),
					  }
					: undefined,
			}

			return await prisma.categoria.update({
				where: { id_categoria: id },
				data,
				include: {
					disciplina: true,
					fasce: { include: { fascia: true } },
					cinture: { include: { cintura: true } },
				},
			})
		}

		// DELETE
		if (method === "DELETE") {
			const id = parseInt(query.id as string)
			await prisma.categoria.delete({
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
	const maxOrder = await prisma.categoria.aggregate({
		_max: { n_ordine: true },
	})
	return (maxOrder._max.n_ordine || 0) + 1
}
