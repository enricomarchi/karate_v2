import { defineEventHandler } from "h3"
import { getConnection } from "../../../utils/db"
import { RowDataPacket } from "mysql2/promise"

interface Atleta extends RowDataPacket {
	id_atleta: number
	cognome: string
	nome: string
	nome_societa: string
	punteggio: number | null
	note: string | null
}

export default defineEventHandler(async (event) => {
	const id = event.context.params?.id
	let connection

	try {
		connection = await getConnection()
		const [rows] = await connection.execute<Atleta[]>(
			`SELECT * FROM vista_atleti_prove WHERE id_atleta IN (
                SELECT i.id_atleta 
                FROM iscrizioni i
                JOIN tabelloni_categorie tc ON i.id_categoria = tc.id_categoria 
                JOIN prove p ON tc.id_tabellone = p.id_tabellone
                WHERE p.id_prova = ?
            )`,
			[id]
		)

		return rows
	} catch (error) {
		console.error("Errore nel recupero degli atleti:", error)
		return { error: (error as Error).message }
	} finally {
		if (connection) connection.release()
	}
})
