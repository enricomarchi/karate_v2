import mysql, {
	type Pool,
	type PoolConnection,
	type ResultSetHeader,
	type RowDataPacket,
} from "mysql2/promise"
import dotenv from "dotenv"

dotenv.config()

export const dbConfig = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	connectTimeout: 10000,
}

let pool: Pool | null = null

export const getConnection = async (): Promise<PoolConnection> => {
	try {
		if (!pool) {
			pool = mysql.createPool(dbConfig)
		}
		return await pool.getConnection()
	} catch (error) {
		console.error("Errore nella connessione al database:", error)
		throw new Error("Impossibile stabilire la connessione al database")
	}
}
