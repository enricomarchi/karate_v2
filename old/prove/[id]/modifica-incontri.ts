import { defineEventHandler, readBody, createError } from "h3"
import { getConnection } from "../../../utils/db"
import type { Incontro } from "~/types/tabellone"
import type { RowDataPacket } from "mysql2/promise"

interface ProvaRow extends RowDataPacket {
	id_tabellone: number
}

interface ProvaResult extends RowDataPacket {
	id_prova: number
}

export default defineEventHandler(async (event) => {
	// Verifica il metodo HTTP
	if (event.method !== "POST") {
		throw createError({
			statusCode: 405,
			message: "Method Not Allowed",
		})
	}

	const idProva = event.context.params?.id
	if (!idProva) {
		throw createError({
			statusCode: 400,
			message: "ID prova mancante",
		})
	}

	const body = await readBody(event)
	const incontri: Incontro[] = body.incontri
	const modificaTutte: boolean = body.modificaTutte ?? false

	if (!Array.isArray(incontri)) {
		throw createError({
			statusCode: 400,
			message: "Formato incontri non valido",
		})
	}

	const connection = await getConnection()

	try {
		await connection.beginTransaction()

		if (modificaTutte) {
			const [provaResult] = await connection.execute<ProvaRow[]>(
				"SELECT id_tabellone FROM prove WHERE id_prova = ?",
				[idProva]
			)
			const idTabellone = provaResult[0]?.id_tabellone

			if (!idTabellone) {
				throw new Error("Tabellone non trovato")
			}

			const [proveResult] = await connection.execute<ProvaResult[]>(
				"SELECT id_prova FROM prove WHERE id_tabellone = ? AND is_finale = 0",
				[idTabellone]
			)
			const idProve = proveResult as { id_prova: number }[]

			// Aggiorna gli incontri per tutte le prove non finali
			for (const prova of idProve) {
				for (const incontro of incontri) {
					await connection.execute(
						`UPDATE incontri_prova 
                         SET id_atleta_rosso = ?, 
                             id_atleta_bianco = ?
                         WHERE ordine = ? AND id_prova = ?`,
						[
							incontro.id_atleta_rosso,
							incontro.id_atleta_bianco,
							incontro.ordine,
							prova.id_prova,
						]
					)
				}
			}
		} else {
			// Aggiorna solo la prova corrente
			for (const incontro of incontri) {
				await connection.execute(
					`UPDATE incontri_prova 
                     SET id_atleta_rosso = ?, 
                         id_atleta_bianco = ?
                     WHERE ordine = ? AND id_prova = ?`,
					[
						incontro.id_atleta_rosso,
						incontro.id_atleta_bianco,
						incontro.ordine,
						idProva,
					]
				)
			}
		}

		await connection.commit()
		return {
			success: true,
			message: modificaTutte
				? "Incontri aggiornati con successo in tutte le prove non finali"
				: "Incontri aggiornati con successo",
		}
	} catch (error) {
		await connection.rollback()
		console.error("Errore nell'aggiornamento degli incontri:", error)

		throw createError({
			statusCode: 500,
			message:
				error instanceof Error
					? error.message
					: "Errore interno del server",
		})
	} finally {
		connection.release()
	}
})
