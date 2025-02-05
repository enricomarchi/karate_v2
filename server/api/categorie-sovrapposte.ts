import { defineEventHandler } from "h3"
import prisma from "../utils/prisma"
import type { CategorieSovrapposte } from "~/types/categorie"

export default defineEventHandler(async () => {
	// Qui implementiamo la logica che prima era nella view MySQL
	const sovrapposizioni = await prisma.$queryRaw<CategorieSovrapposte[]>`
    SELECT 
      c1.id_categoria as cat1_id,
      c1.nome as cat1_nome,
      c2.id_categoria as cat2_id,
      c2.nome as cat2_nome,
      c1.id_disciplina as disciplina
    FROM categorie c1
    JOIN categorie c2 ON c1.id_disciplina = c2.id_disciplina
    WHERE c1.id_categoria < c2.id_categoria
    AND c1.sesso IN (c2.sesso, 'X')
    AND c2.sesso IN (c1.sesso, 'X')
    AND (
      (c1.peso_min IS NULL AND c1.peso_max IS NULL) OR
      (c2.peso_min IS NULL AND c2.peso_max IS NULL) OR
      (
        c1.peso_min <= c2.peso_max AND
        c2.peso_min <= c1.peso_max
      )
    )
    AND EXISTS (
      SELECT 1
      FROM categorie_fasce cf1
      JOIN categorie_fasce cf2 ON cf1.id_fascia = cf2.id_fascia
      WHERE cf1.id_categoria = c1.id_categoria
      AND cf2.id_categoria = c2.id_categoria
    )
    AND EXISTS (
      SELECT 1
      FROM categorie_cinture cc1
      JOIN categorie_cinture cc2 ON cc1.id_cintura = cc2.id_cintura
      WHERE cc1.id_categoria = c1.id_categoria
      AND cc2.id_categoria = c2.id_categoria
    )
  `

	const overlappingIds = [
		...new Set(sovrapposizioni.flatMap((s) => [s.cat1_id, s.cat2_id])),
	]

	return {
		overlappingIds,
		details: sovrapposizioni,
	}
})
