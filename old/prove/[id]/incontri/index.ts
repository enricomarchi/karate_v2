import { defineEventHandler, readBody, createError } from "h3"
import { getConnection } from "../../../../utils/db"
import {
	getIncontriByProva,
	inserisciIncontro,
	aggiornaIncontro,
} from "../../../../utils/incontriUtils"

export default defineEventHandler(async (event) => {
	const idParam = event.context.params?.id
	if (!idParam) {
		throw createError({
			statusCode: 400,
			message: "ID prova mancante",
		})
	}
	const id = parseInt(idParam, 10)
	if (isNaN(id)) {
		throw createError({
			statusCode: 400,
			message: "ID prova non valido",
		})
	}

	const method = event.method
	let connection

	try {
		connection = await getConnection()

		if (method === "GET") {
			const incontri = await getIncontriByProva(connection, id)
			return incontri.map((incontro) => ({
				...incontro,
				// Il campo voti ora è già un JSON valido dal database
				voti: incontro.voti || [],
			}))
		}

		if (method === "POST") {
			const body = await readBody(event)
			const result = await inserisciIncontro(
				connection,
				id,
				body.id_atleta_rosso,
				body.id_atleta_bianco,
				body.ordine,
				body.fase || "SEDICESIMI", // Usa il valore dal body o il default
				body.stato || "DA_INIZIARE" // Usa il valore dal body o il default
			)
			return { success: true, id: result }
		}

		if (method === "PUT") {
			const body = await readBody(event)
			await aggiornaIncontro(
				connection,
				body.id_incontro,
				id,
				body.id_atleta_rosso,
				body.id_atleta_bianco,
				body.ordine,
				body.stato || "DA_INIZIARE" // Usa il valore dal body o il default
			)
			return { success: true }
		}

		throw new Error(`Metodo ${method} non supportato`)
	} catch (error) {
		console.error("Errore nella gestione degli incontri:", error)
		return { success: false, error: (error as Error).message }
	} finally {
		if (connection) connection.release()
	}
})
