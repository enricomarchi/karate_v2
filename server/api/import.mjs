import fs from "fs"
import path from "path"
import { defineEventHandler } from "h3"
import { read } from "xlsx"
import { getConnection } from "../utils/db"

const getCinturaId = async (colore) => {
	const conn = await getConnection()
	try {
		const [rows] = await conn.execute(
			"SELECT id_cintura FROM cinture WHERE colore = ?",
			[colore]
		)
		return rows.length ? rows[0].id_cintura : null
	} finally {
		conn.release()
	}
}

const getSocietaId = async (nome_societa) => {
	const conn = await getConnection()
	try {
		const [rows] = await conn.execute(
			"SELECT id_societa FROM societa WHERE nome_societa = ?",
			[nome_societa]
		)
		if (rows.length) {
			return rows[0].id_societa
		} else {
			const [result] = await conn.execute(
				"INSERT INTO societa (nome_societa) VALUES (?)",
				[nome_societa]
			)
			return result.insertId
		}
	} finally {
		conn.release()
	}
}

const insertAtleta = async (row, nome_societa) => {
	const conn = await getConnection()
	try {
		const cintura_id = await getCinturaId(row.CINTURA)
		if (!cintura_id) {
			throw {
				tipo: "Errore cintura",
				errore: `Cintura non valida: ${row.CINTURA}`,
				campo_problematico: "cintura",
			}
		}
		const societa_id = await getSocietaId(nome_societa)
		const [result] = await conn.execute(
			`
            INSERT INTO atleti (cognome, nome, sesso, anno_nascita, cintura_id, id_societa)
            VALUES (?, ?, ?, ?, ?, ?)
            `,
			[
				row.COGNOME,
				row.NOME,
				row.SESSO[0],
				row.ANNO,
				cintura_id,
				societa_id,
			]
		)
		return result.insertId
	} catch (error) {
		const errorInfo = {
			tipo: "Errore inserimento atleta",
			errore: error.message || error.errore,
			campo_problematico:
				error.campo_problematico ||
				(error.message?.includes("anno_nascita")
					? "anno_nascita"
					: error.message?.includes("sesso")
					? "sesso"
					: error.message?.includes("cintura")
					? "cintura"
					: "altro"),
		}
		throw errorInfo
	} finally {
		conn.release()
	}
}

const insertDiscipline = async (atleta_id, row) => {
	const conn = await getConnection()
	try {
		const [discipline] = await conn.execute(
			"SELECT id_disciplina FROM discipline"
		)
		for (const disciplina of discipline) {
			if (row[disciplina.id_disciplina.toUpperCase()] === "SI") {
				try {
					await conn.execute(
						"INSERT INTO iscrizioni (id_atleta, id_disciplina) VALUES (?, ?)",
						[atleta_id, disciplina.id_disciplina]
					)
				} catch (error) {
					throw {
						tipo: "Errore inserimento disciplina",
						atleta_id: atleta_id,
						disciplina: disciplina.id_disciplina,
						messaggio: error.message,
					}
				}
			}
		}
	} finally {
		conn.release()
	}
}

const clearTables = async () => {
	const conn = await getConnection()
	try {
		await conn.execute("SET FOREIGN_KEY_CHECKS = 0")

		// Cancella i dati
		await conn.execute("DELETE FROM iscrizioni")
		await conn.execute("DELETE FROM atleti")
		await conn.execute("DELETE FROM societa")

		// Resetta gli auto_increment
		await conn.execute("ALTER TABLE iscrizioni AUTO_INCREMENT = 1")
		await conn.execute("ALTER TABLE atleti AUTO_INCREMENT = 1")
		await conn.execute("ALTER TABLE societa AUTO_INCREMENT = 1")

		await conn.execute("SET FOREIGN_KEY_CHECKS = 1")
	} finally {
		conn.release()
	}
}

const insertIscrizioni = async () => {
	const conn = await getConnection()
	try {
		await conn.execute(`
            UPDATE iscrizioni i
            JOIN atleti_categorie ac ON i.id_atleta = ac.id_atleta 
                AND i.id_disciplina = ac.id_disciplina
            SET i.id_categoria = ac.id_categoria
            WHERE i.id_categoria IS NULL
        `)
	} catch (error) {
		console.error("Errore durante l'aggiornamento delle iscrizioni:", error)
		throw error
	} finally {
		conn.release()
	}
}

const validateAnno = (anno) => {
	// Converti in stringa e rimuovi spazi
	const annoStr = String(anno).trim()

	// Verifica se ci sono caratteri non numerici (incluso O al posto di 0)
	if (annoStr.match(/[^\d]/)) {
		throw new Error(
			`Anno non valido: "${anno}" - contiene caratteri non numerici (forse 'O' invece di '0'?)`
		)
	}

	// Verifica il formato corretto
	if (!/^\d{4}$/.test(annoStr)) {
		throw new Error(
			`Anno non valido: "${anno}" - deve essere un numero di 4 cifre`
		)
	}

	const annoNum = parseInt(annoStr)
	const currentYear = new Date().getFullYear()
	if (annoNum < currentYear - 100 || annoNum > currentYear) {
		throw new Error(`Anno fuori range: ${annoNum}`)
	}
	return annoNum
}

const validateString = (value, campo) => {
	if (!value || typeof value !== "string" || value.trim().length === 0) {
		throw new Error(
			`${campo} non valido: "${value}" - non può essere vuoto`
		)
	}
	// Rimuove spazi multipli e spazi all'inizio e fine
	return value.trim().replace(/\s+/g, " ")
}

const processExcelFile = (filePath, errori) => {
	const buffer = fs.readFileSync(filePath)
	const workbook = read(buffer)
	const worksheet = workbook.Sheets[workbook.SheetNames[0]]
	const rows = []

	let rowIndex = 7

	while (true) {
		const cellA = worksheet[`A${rowIndex}`]
		if (!cellA || !cellA.v) break

		const erroriRiga = []
		const rowData = {
			cognome: worksheet[`B${rowIndex}`]?.v || "",
			nome: worksheet[`C${rowIndex}`]?.v || "",
			anno: worksheet[`D${rowIndex}`]?.v || "",
			sesso: worksheet[`E${rowIndex}`]?.v || "",
			cintura: worksheet[`F${rowIndex}`]?.v || "",
			kata: worksheet[`G${rowIndex}`]?.v === "SI" ? "SI" : "NO",
			kumite: worksheet[`H${rowIndex}`]?.v === "SI" ? "SI" : "NO",
			palloncino: worksheet[`I${rowIndex}`]?.v === "SI" ? "SI" : "NO",
			fazzoletto: worksheet[`J${rowIndex}`]?.v === "SI" ? "SI" : "NO",
			percorso: worksheet[`K${rowIndex}`]?.v === "SI" ? "SI" : "NO",
			prove_miste: worksheet[`L${rowIndex}`]?.v === "SI" ? "SI" : "NO",
		}

		// Valida ogni campo e raccogli eventuali errori
		let cognome,
			nome,
			anno,
			isValid = true

		const valoriGrezzi = {
			anno: rowData.anno,
			cognome: rowData.cognome,
			nome: rowData.nome,
		}

		try {
			cognome = validateString(rowData.cognome, "Cognome")
		} catch (error) {
			erroriRiga.push(error.message)
			isValid = false
		}

		try {
			nome = validateString(rowData.nome, "Nome")
		} catch (error) {
			erroriRiga.push(error.message)
			isValid = false
		}

		try {
			anno = validateAnno(rowData.anno)
		} catch (error) {
			erroriRiga.push(error.message)
			isValid = false
		}

		if (!rowData.sesso) {
			erroriRiga.push("Sesso non specificato")
			isValid = false
		}

		if (!rowData.cintura) {
			erroriRiga.push("Cintura non specificata")
			isValid = false
		}

		// Se ci sono errori, li aggiungiamo alla lista errori
		if (erroriRiga.length > 0) {
			errori.validazione.push({
				riga: rowIndex,
				file: filePath,
				tipo: "Errori validazione dati",
				dettagli: erroriRiga,
				dati_riga: rowData,
				valori_grezzi: valoriGrezzi, // Aggiungiamo i valori grezzi all'errore
			})
			console.log(
				`Errore validazione in ${path.basename(
					filePath
				)} riga ${rowIndex}: ${erroriRiga.join(", ")}`
			)
		}

		// Se tutti i campi obbligatori sono validi, aggiungi la riga
		if (isValid) {
			rows.push({
				COGNOME: cognome,
				NOME: nome,
				ANNO: anno,
				SESSO: rowData.sesso,
				CINTURA: rowData.cintura,
				KATA: rowData.kata,
				KUMITE: rowData.kumite,
				PALLONCINO: rowData.palloncino,
				FAZZOLETTO: rowData.fazzoletto,
				PERCORSO: rowData.percorso,
				PROVE_MISTE: rowData.prove_miste,
			})
		}

		rowIndex++
	}

	return rows
}

export default defineEventHandler(async (event) => {
	const errori = {
		validazione: [], // errori nella lettura/validazione dei dati
		database: [], // errori nell'inserimento nel database
		sistema: [], // errori di sistema (file non trovati, ecc)
	}

	try {
		const xlsxFolder = path.resolve(
			"c:/Users/enrico/Documents/git-hub/kv1/iscrizioni"
		)
		await clearTables()

		for (const dir of fs.readdirSync(xlsxFolder)) {
			const dirPath = path.join(xlsxFolder, dir)
			if (fs.lstatSync(dirPath).isDirectory()) {
				for (const file of fs.readdirSync(dirPath)) {
					if (file.endsWith(".xlsx")) {
						const filePath = path.join(dirPath, file)
						const nome_societa = dir

						try {
							const rows = await processExcelFile(
								filePath,
								errori
							)
							for (const row of rows) {
								try {
									const atleta_id = await insertAtleta(
										row,
										nome_societa
									)
									await insertDiscipline(atleta_id, row)
								} catch (error) {
									errori.database.push({
										file: filePath,
										societa: nome_societa,
										atleta: row,
										errore: error,
									})
								}
							}
						} catch (error) {
							errori.sistema.push({
								file: filePath,
								societa: nome_societa,
								errore: error.message,
							})
						}
					}
				}
			}
		}

		await insertIscrizioni()

		// Prepara il messaggio di risposta
		const riepilogo = {
			success: true,
			errori_validazione: errori.validazione.length,
			errori_database: errori.database.length,
			errori_sistema: errori.sistema.length,
			dettagli: {
				validazione:
					errori.validazione.length > 0 ? errori.validazione : null,
				database: errori.database.length > 0 ? errori.database : null,
				sistema: errori.sistema.length > 0 ? errori.sistema : null,
			},
		}

		return riepilogo
	} catch (error) {
		return {
			success: false,
			errore: error.message,
			dettagli: errori,
		}
	}
})
