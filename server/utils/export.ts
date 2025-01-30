import type { RowDataPacket } from "mysql2/promise"
import { getConnection } from "./db"

export const exportSocieta = async (): Promise<string> => {
	const conn = await getConnection()
	try {
		const [rows] = await conn.query<RowDataPacket[]>(
			"SELECT * FROM societa"
		)
		if (!Array.isArray(rows) || rows.length === 0) return ""

		let data = "-- Dati per la tabella societa\n"
		data += "INSERT INTO `societa` VALUES\n"
		const values = rows.map((row) => {
			const values = Object.values(row).map((value) =>
				value === null
					? "NULL"
					: typeof value === "string"
					? `'${value.replace(/'/g, "''")}'`
					: value
			)
			return `(${values.join(", ")})`
		})
		data += values.join(",\n") + ";\n\n"
		return data
	} finally {
		conn.release()
	}
}

export const exportAtleti = async (): Promise<string> => {
	const conn = await getConnection()
	try {
		const [rows] = await conn.query<RowDataPacket[]>("SELECT * FROM atleti")
		if (!Array.isArray(rows) || rows.length === 0) return ""

		let data = "-- Dati per la tabella atleti\n"
		data += "INSERT INTO `atleti` VALUES\n"
		const values = rows.map((row) => {
			const values = Object.values(row).map((value) =>
				value === null
					? "NULL"
					: typeof value === "string"
					? `'${value.replace(/'/g, "''")}'`
					: value
			)
			return `(${values.join(", ")})`
		})
		data += values.join(",\n") + ";\n\n"
		return data
	} finally {
		conn.release()
	}
}

export const exportCategorie = async (): Promise<string> => {
	const conn = await getConnection()
	try {
		const [rows] = await conn.query<RowDataPacket[]>(
			"SELECT * FROM categorie"
		)
		if (!Array.isArray(rows) || rows.length === 0) return ""

		let data = "-- Dati per la tabella categorie\n"
		data += "INSERT INTO `categorie` VALUES\n"
		const values = rows.map((row) => {
			const values = Object.values(row).map((value) =>
				value === null
					? "NULL"
					: typeof value === "string"
					? `'${value.replace(/'/g, "''")}'`
					: value
			)
			return `(${values.join(", ")})`
		})
		data += values.join(",\n") + ";\n\n"
		return data
	} finally {
		conn.release()
	}
}

export const exportCategorieCinture = async (): Promise<string> => {
	const conn = await getConnection()
	try {
		const [rows] = await conn.query<RowDataPacket[]>(
			"SELECT * FROM categorie_cinture"
		)
		if (!Array.isArray(rows) || rows.length === 0) return ""

		let data = "-- Dati per la tabella categorie_cinture\n"
		data += "INSERT INTO `categorie_cinture` VALUES\n"
		const values = rows.map((row) => {
			const values = Object.values(row).map((value) =>
				value === null
					? "NULL"
					: typeof value === "string"
					? `'${value.replace(/'/g, "''")}'`
					: value
			)
			return `(${values.join(", ")})`
		})
		data += values.join(",\n") + ";\n\n"
		return data
	} finally {
		conn.release()
	}
}

export const exportFasceEta = async (): Promise<string> => {
	const conn = await getConnection()
	try {
		const [rows] = await conn.query<RowDataPacket[]>(
			"SELECT * FROM fasce_eta"
		)
		if (!Array.isArray(rows) || rows.length === 0) return ""

		let data = "-- Dati per la tabella fasce_eta\n"
		data += "INSERT INTO `fasce_eta` VALUES\n"
		const values = rows.map((row) => {
			const values = Object.values(row).map((value) =>
				value === null
					? "NULL"
					: typeof value === "string"
					? `'${value.replace(/'/g, "''")}'`
					: value
			)
			return `(${values.join(", ")})`
		})
		data += values.join(",\n") + ";\n\n"
		return data
	} finally {
		conn.release()
	}
}

export const exportCategorieFasce = async (): Promise<string> => {
	const conn = await getConnection()
	try {
		const [rows] = await conn.query<RowDataPacket[]>(
			"SELECT * FROM categorie_fasce"
		)
		if (!Array.isArray(rows) || rows.length === 0) return ""

		let data = "-- Dati per la tabella categorie_fasce\n"
		data += "INSERT INTO `categorie_fasce` VALUES\n"
		const values = rows.map((row) => {
			const values = Object.values(row).map((value) =>
				value === null
					? "NULL"
					: typeof value === "string"
					? `'${value.replace(/'/g, "''")}'`
					: value
			)
			return `(${values.join(", ")})`
		})
		data += values.join(",\n") + ";\n\n"
		return data
	} finally {
		conn.release()
	}
}

export const exportConfigurazioniTabelloni = async (): Promise<string> => {
	const conn = await getConnection()
	try {
		const [rows] = await conn.query<RowDataPacket[]>(
			"SELECT * FROM configurazioni_tabelloni"
		)
		if (!Array.isArray(rows) || rows.length === 0) return ""

		let data = "-- Dati per la tabella configurazioni_tabelloni\n"
		data += "INSERT INTO `configurazioni_tabelloni` VALUES\n"
		const values = rows.map((row) => {
			const values = Object.values(row).map((value) => {
				if (value === null) return "NULL"
				if (value instanceof Date)
					return `'${value.toISOString().slice(0, 10)}'`
				return typeof value === "string"
					? `'${value.replace(/'/g, "''")}'`
					: value
			})
			return `(${values.join(", ")})`
		})
		data += values.join(",\n") + ";\n\n"
		return data
	} finally {
		conn.release()
	}
}

export const exportTabelloni = async (): Promise<string> => {
	const conn = await getConnection()
	try {
		const [rows] = await conn.query<RowDataPacket[]>(
			"SELECT * FROM tabelloni"
		)
		if (!Array.isArray(rows) || rows.length === 0) return ""

		let data = "-- Dati per la tabella tabelloni\n"
		data += "INSERT INTO `tabelloni` VALUES\n"
		const values = rows.map((row) => {
			const values = Object.values(row).map((value) => {
				if (value === null) return "NULL"
				if (value instanceof Date)
					return `'${value.toISOString().slice(0, 10)}'`
				return typeof value === "string"
					? `'${value.replace(/'/g, "''")}'`
					: value
			})
			return `(${values.join(", ")})`
		})
		data += values.join(",\n") + ";\n\n"
		return data
	} finally {
		conn.release()
	}
}

export const exportConfigurazioniProve = async (): Promise<string> => {
	const conn = await getConnection()
	try {
		const [rows] = await conn.query<RowDataPacket[]>(
			"SELECT * FROM configurazioni_prove"
		)
		if (!Array.isArray(rows) || rows.length === 0) return ""

		let data = "-- Dati per la tabella configurazioni_prove\n"
		data += "INSERT INTO `configurazioni_prove` VALUES\n"
		const values = rows.map((row) => {
			const values = Object.values(row).map((value) => {
				if (value === null) return "NULL"
				if (typeof value === "object")
					return `'${JSON.stringify(value)}'`
				return typeof value === "string"
					? `'${value.replace(/'/g, "''")}'`
					: value
			})
			return `(${values.join(", ")})`
		})
		data += values.join(",\n") + ";\n\n"
		return data
	} finally {
		conn.release()
	}
}

export const exportImpostazioniGara = async (): Promise<string> => {
	const conn = await getConnection()
	try {
		const [rows] = await conn.query<RowDataPacket[]>(
			"SELECT * FROM impostazioni_gara"
		)
		if (!Array.isArray(rows) || rows.length === 0) return ""

		let data = "-- Dati per la tabella impostazioni_gara\n"
		data += "INSERT INTO `impostazioni_gara` VALUES\n"
		const values = rows.map((row) => {
			const values = Object.values(row).map((value) => {
				if (value === null) return "NULL"
				if (value instanceof Date)
					return `'${value.toISOString().slice(0, 10)}'`
				return typeof value === "string"
					? `'${value.replace(/'/g, "''")}'`
					: value
			})
			return `(${values.join(", ")})`
		})
		data += values.join(",\n") + ";\n\n"
		return data
	} finally {
		conn.release()
	}
}

export const exportIscrizioni = async (): Promise<string> => {
	const conn = await getConnection()
	try {
		const [rows] = await conn.query<RowDataPacket[]>(
			"SELECT * FROM iscrizioni"
		)
		if (!Array.isArray(rows) || rows.length === 0) return ""

		let data = "-- Dati per la tabella iscrizioni\n"
		data += "INSERT INTO `iscrizioni` VALUES\n"
		const values = rows.map((row) => {
			const values = Object.values(row).map((value) => {
				if (value === null) return "NULL"
				if (value instanceof Date)
					return `'${value.toISOString().slice(0, 10)}'`
				return typeof value === "string"
					? `'${value.replace(/'/g, "''")}'`
					: value
			})
			return `(${values.join(", ")})`
		})
		data += values.join(",\n") + ";\n\n"
		return data
	} finally {
		conn.release()
	}
}

export const exportPunteggiSocieta = async (): Promise<string> => {
	const conn = await getConnection()
	try {
		const [rows] = await conn.query<RowDataPacket[]>(
			"SELECT * FROM punteggi_societa"
		)
		if (!Array.isArray(rows) || rows.length === 0) return ""

		let data = "-- Dati per la tabella punteggi_societa\n"
		data += "INSERT INTO `punteggi_societa` VALUES\n"
		const values = rows.map((row) => {
			const values = Object.values(row).map((value) =>
				value === null
					? "NULL"
					: typeof value === "string"
					? `'${value.replace(/'/g, "''")}'`
					: value
			)
			return `(${values.join(", ")})`
		})
		data += values.join(",\n") + ";\n\n"
		return data
	} finally {
		conn.release()
	}
}

export const exportTabelloniCategorie = async (): Promise<string> => {
	const conn = await getConnection()
	try {
		const [rows] = await conn.query<RowDataPacket[]>(
			"SELECT * FROM tabelloni_categorie"
		)
		if (!Array.isArray(rows) || rows.length === 0) return ""

		let data = "-- Dati per la tabella tabelloni_categorie\n"
		data += "INSERT INTO `tabelloni_categorie` VALUES\n"
		const values = rows.map((row) => {
			const values = Object.values(row).map((value) =>
				value === null
					? "NULL"
					: typeof value === "string"
					? `'${value.replace(/'/g, "''")}'`
					: value
			)
			return `(${values.join(", ")})`
		})
		data += values.join(",\n") + ";\n\n"
		return data
	} finally {
		conn.release()
	}
}

export const exportAccorpamenti = async (): Promise<string> => {
	const conn = await getConnection()
	try {
		const [rows] = await conn.query<RowDataPacket[]>(
			"SELECT * FROM accorpamenti"
		)
		if (!Array.isArray(rows) || rows.length === 0) return ""

		let data = "-- Dati per la tabella accorpamenti\n"
		data += "INSERT INTO `accorpamenti` VALUES\n"
		const values = rows.map((row) => {
			const values = Object.values(row).map((value) =>
				value === null
					? "NULL"
					: typeof value === "string"
					? `'${value.replace(/'/g, "''")}'`
					: value
			)
			return `(${values.join(", ")})`
		})
		data += values.join(",\n") + ";\n\n"
		return data
	} finally {
		conn.release()
	}
}

export const exportProve = async (): Promise<string> => {
	const conn = await getConnection()
	try {
		const [rows] = await conn.query<RowDataPacket[]>("SELECT * FROM prove")
		if (!Array.isArray(rows) || rows.length === 0) return ""

		let data = "-- Dati per la tabella prove\n"
		data += "INSERT INTO `prove` VALUES\n"
		const values = rows.map((row) => {
			const values = Object.values(row).map((value) => {
				if (value === null) return "NULL"
				if (value instanceof Date)
					return `'${value
						.toISOString()
						.slice(0, 19)
						.replace("T", " ")}'`
				return typeof value === "string"
					? `'${value.replace(/'/g, "''")}'`
					: value
			})
			return `(${values.join(", ")})`
		})
		data += values.join(",\n") + ";\n\n"
		return data
	} finally {
		conn.release()
	}
}

export const exportRisultatiProve = async (): Promise<string> => {
	const conn = await getConnection()
	try {
		const [rows] = await conn.query<RowDataPacket[]>(
			"SELECT * FROM risultati_prove"
		)
		if (!Array.isArray(rows) || rows.length === 0) return ""

		let data = "-- Dati per la tabella risultati_prove\n"
		data += "INSERT INTO `risultati_prove` VALUES\n"
		const values = rows.map((row) => {
			const values = Object.values(row).map((value) =>
				value === null
					? "NULL"
					: typeof value === "string"
					? `'${value.replace(/'/g, "''")}'`
					: value
			)
			return `(${values.join(", ")})`
		})
		data += values.join(",\n") + ";\n\n"
		return data
	} finally {
		conn.release()
	}
}

export const exportIncontriProve = async (): Promise<string> => {
	const conn = await getConnection()
	try {
		const [rows] = await conn.query<RowDataPacket[]>(
			"SELECT * FROM incontri_prova"
		)
		if (!Array.isArray(rows) || rows.length === 0) return ""

		let data = "-- Dati per la tabella incontri_prova\n"
		data += "INSERT INTO `incontri_prova` VALUES\n"
		const values = rows.map((row) => {
			const values = Object.values(row).map((value) => {
				if (value === null) return "NULL"
				if (value instanceof Date)
					return `'${value
						.toISOString()
						.slice(0, 19)
						.replace("T", " ")}'`
				return typeof value === "string"
					? `'${value.replace(/'/g, "''")}'`
					: value
			})
			return `(${values.join(", ")})`
		})
		data += values.join(",\n") + ";\n\n"
		return data
	} finally {
		conn.release()
	}
}

export const exportVotiIncontro = async (): Promise<string> => {
	const conn = await getConnection()
	try {
		const [rows] = await conn.query<RowDataPacket[]>(
			"SELECT * FROM voti_incontro"
		)
		if (!Array.isArray(rows) || rows.length === 0) return ""

		let data = "-- Dati per la tabella voti_incontro\n"
		data += "INSERT INTO `voti_incontro` VALUES\n"
		const values = rows.map((row) => {
			const values = Object.values(row).map((value) =>
				value === null
					? "NULL"
					: typeof value === "string"
					? `'${value.replace(/'/g, "''")}'`
					: value
			)
			return `(${values.join(", ")})`
		})
		data += values.join(",\n") + ";\n\n"
		return data
	} finally {
		conn.release()
	}
}

export const exportClassifiche = async (): Promise<string> => {
	const conn = await getConnection()
	try {
		const [rows] = await conn.query<RowDataPacket[]>(
			"SELECT * FROM classifiche_finali"
		)
		if (!Array.isArray(rows) || rows.length === 0) return ""

		let data = "-- Dati per la tabella classifiche_finali\n"
		data += "INSERT INTO `classifiche_finali` VALUES\n"
		const values = rows.map((row) => {
			const values = Object.values(row).map((value) => {
				if (value === null) return "NULL"
				if (value instanceof Date)
					return `'${value
						.toISOString()
						.slice(0, 19)
						.replace("T", " ")}'`
				return typeof value === "string"
					? `'${value.replace(/'/g, "''")}'`
					: value
			})
			return `(${values.join(", ")})`
		})
		data += values.join(",\n") + ";\n\n"
		return data
	} finally {
		conn.release()
	}
}
