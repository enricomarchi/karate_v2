/**
 * Sanitizza i valori per il database convertendo undefined e stringhe vuote in null
 * @param obj - Oggetto o valore da sanitizzare
 * @returns Oggetto o valore sanitizzato
 */
export function sanitizeForDatabase(obj: any): any {
	if (obj === undefined || obj === "") return null
	if (typeof obj === "object" && obj !== null) {
		return Object.fromEntries(
			Object.entries(obj).map(([key, value]) => [
				key,
				value === undefined || value === "" ? null : value,
			])
		)
	}
	return obj
}
