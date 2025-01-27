export type FaseTorneo =
	| "SEDICESIMI"
	| "OTTAVI"
	| "QUARTI"
	| "SEMIFINALI"
	| "FINALE"
	| "TERZO_QUARTO"

// Helper function per identificare se è un turno del girone
export function isTurnoGirone(fase: string): boolean {
	return fase.startsWith("TURNO_")
}

export const ordineDellaFase: Record<FaseTorneo, number> = {
	SEDICESIMI: 1,
	OTTAVI: 2,
	QUARTI: 3,
	SEMIFINALI: 4,
	FINALE: 5,
	TERZO_QUARTO: 6,
}

export const fasiSuccessive: Record<FaseTorneo, FaseTorneo[]> = {
	SEDICESIMI: ["OTTAVI", "QUARTI", "SEMIFINALI", "FINALE"],
	OTTAVI: ["QUARTI", "SEMIFINALI", "FINALE"],
	QUARTI: ["SEMIFINALI", "FINALE"],
	SEMIFINALI: ["FINALE"],
	FINALE: [],
	TERZO_QUARTO: [],
}

export const numIncontriPerFase: Record<FaseTorneo, number> = {
	SEDICESIMI: 16,
	OTTAVI: 8,
	QUARTI: 4,
	SEMIFINALI: 2,
	FINALE: 1,
	TERZO_QUARTO: 1,
}

export function isFaseEliminazione(fase: FaseTorneo): boolean {
	return [
		"SEDICESIMI",
		"OTTAVI",
		"QUARTI",
		"SEMIFINALI",
		"FINALE",
		"TERZO_QUARTO",
	].includes(fase)
}

export function isFaseGirone(fase: FaseTorneo): boolean {
	return fase.startsWith("TURNO_")
}

export function determinaFaseIniziale(numAtleti: number): FaseTorneo {
	if (numAtleti <= 2) {
		return "FINALE"
	} else if (numAtleti <= 4) {
		return "SEMIFINALI"
	} else if (numAtleti <= 8) {
		return "QUARTI"
	} else if (numAtleti <= 16) {
		return "OTTAVI"
	} else {
		return "SEDICESIMI"
	}
}
