import { defineEventHandler } from "h3"
import { getConnection } from "../utils/db"
import type { CategorieSovrapposte } from "~/types/global"

export default defineEventHandler(async (event) => {
	const connection = await getConnection()
	try {
		const [rows] = await connection.execute<CategorieSovrapposte[]>(
			"SELECT cat1_id, cat1_nome, cat2_id, cat2_nome, id_disciplina, disciplina FROM categorie_sovrapposte"
		)

		return {
			details: rows,
			overlappingIds: rows.reduce((acc: number[], row) => {
				// Verifica che gli ID esistano prima di aggiungerli
				if (row.cat1_id && !acc.includes(row.cat1_id)) {
					acc.push(row.cat1_id)
				}
				if (row.cat2_id && !acc.includes(row.cat2_id)) {
					acc.push(row.cat2_id)
				}
				return acc
			}, []),
		}
	} finally {
		connection.release()
	}
})
