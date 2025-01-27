import mysql from "mysql2/promise"
import dotenv from "dotenv"
import { defineEventHandler, createError } from "h3"

dotenv.config()

const dbConfig = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	connectTimeout: 10000,
}

export default defineEventHandler(async (event) => {
	let connection

	try {
		connection = await mysql.createConnection(dbConfig)

		const [rows] = await connection.execute(`
            WITH CategorieSovrapposte AS (
                SELECT 
                    c1.id_categoria as cat1_id,
                    c2.id_categoria as cat2_id
                FROM 
                    categorie c1
                JOIN 
                    categorie c2 ON c1.id_disciplina = c2.id_disciplina 
                    AND c1.id_categoria < c2.id_categoria
                WHERE 
                    (c1.sesso = c2.sesso OR c1.sesso = 'MIXED' OR c2.sesso = 'MIXED')
                    AND (
                        (c1.peso_min IS NULL AND c2.peso_min IS NULL)
                        OR (c1.peso_max IS NULL AND c2.peso_max IS NULL)
                        OR (c1.peso_min <= c2.peso_max AND (c2.peso_min <= c1.peso_max OR c1.peso_max IS NULL))
                        OR (c2.peso_min <= c1.peso_max AND (c1.peso_min <= c2.peso_max OR c2.peso_max IS NULL))
                    )
                    AND EXISTS (
                        SELECT 1 
                        FROM categorie_cinture cc1
                        JOIN categorie_cinture cc2 ON cc1.id_cintura = cc2.id_cintura
                        WHERE cc1.id_categoria = c1.id_categoria 
                        AND cc2.id_categoria = c2.id_categoria
                    )
                    AND EXISTS (
                        SELECT 1
                        FROM categorie_fasce cf1
                        JOIN fasce_eta fe1 ON cf1.id_fascia = fe1.id_fascia
                        JOIN categorie_fasce cf2 ON cf2.id_categoria = c2.id_categoria
                        JOIN fasce_eta fe2 ON cf2.id_fascia = fe2.id_fascia
                        WHERE cf1.id_categoria = c1.id_categoria
                        AND fe1.anno_nascita_min <= fe2.anno_nascita_max
                        AND fe2.anno_nascita_min <= fe1.anno_nascita_max
                    )
            )
            SELECT DISTINCT cat1_id as id_categoria FROM CategorieSovrapposte
            UNION
            SELECT DISTINCT cat2_id as id_categoria FROM CategorieSovrapposte
        `)

		return rows.map((row) => row.id_categoria)
	} catch (error) {
		console.error("Errore nel recupero delle categorie sovrapposte:", error)
		throw createError({ statusCode: 500, message: error.message })
	} finally {
		if (connection) {
			await connection.end()
		}
	}
})
