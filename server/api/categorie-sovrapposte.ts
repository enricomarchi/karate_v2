import { defineEventHandler } from "h3"
import prisma from "../utils/prisma"

export default defineEventHandler(async () => {
	// Prima otteniamo tutte le categorie
	const categorie = await prisma.categorie.findMany({
		include: {
			discipline: true,
			categorie_fasce: {
				include: {
					fasce_eta: true,
				},
			},
			categorie_cinture: {
				include: {
					cinture: true,
				},
			},
		},
	})

	const risultati = []

	// Funzioni helper per i controlli
	const hasOverlappingWeights = (cat1: any, cat2: any) => {
		if (!cat1.peso_min || !cat2.peso_min) return true
		return (
			(cat1.peso_min >= cat2.peso_min &&
				cat1.peso_min <= cat2.peso_max) ||
			(cat1.peso_max >= cat2.peso_min &&
				cat1.peso_max <= cat2.peso_max) ||
			(cat2.peso_min >= cat1.peso_min &&
				cat2.peso_min <= cat1.peso_max) ||
			(cat2.peso_max >= cat1.peso_min && cat2.peso_max <= cat1.peso_max)
		)
	}

	const hasOverlappingAges = (cat1Fasce: any[], cat2Fasce: any[]) => {
		const cat1Range = {
			min: Math.min(
				...cat1Fasce.map((f) => f.fasce_eta.anno_nascita_min)
			),
			max: Math.max(
				...cat1Fasce.map((f) => f.fasce_eta.anno_nascita_max)
			),
		}
		const cat2Range = {
			min: Math.min(
				...cat2Fasce.map((f) => f.fasce_eta.anno_nascita_min)
			),
			max: Math.max(
				...cat2Fasce.map((f) => f.fasce_eta.anno_nascita_max)
			),
		}

		return (
			(cat1Range.min >= cat2Range.min &&
				cat1Range.min <= cat2Range.max) ||
			(cat1Range.max >= cat2Range.min &&
				cat1Range.max <= cat2Range.max) ||
			(cat2Range.min >= cat1Range.min &&
				cat2Range.min <= cat1Range.max) ||
			(cat2Range.max >= cat1Range.min && cat2Range.max <= cat1Range.max)
		)
	}

	const hasOverlappingBelts = (cat1Cinture: any[], cat2Cinture: any[]) => {
		const cat1Range = {
			min: Math.min(...cat1Cinture.map((c) => c.cinture.kyu)),
			max: Math.max(...cat1Cinture.map((c) => c.cinture.kyu)),
		}
		const cat2Range = {
			min: Math.min(...cat2Cinture.map((c) => c.cinture.kyu)),
			max: Math.max(...cat2Cinture.map((c) => c.cinture.kyu)),
		}

		return (
			(cat1Range.min >= cat2Range.min &&
				cat1Range.min <= cat2Range.max) ||
			(cat1Range.max >= cat2Range.min &&
				cat1Range.max <= cat2Range.max) ||
			(cat2Range.min >= cat1Range.min &&
				cat2Range.min <= cat1Range.max) ||
			(cat2Range.max >= cat1Range.min && cat2Range.max <= cat1Range.max)
		)
	}

	// Confronta ogni coppia di categorie
	for (let i = 0; i < categorie.length; i++) {
		for (let j = i + 1; j < categorie.length; j++) {
			const cat1 = categorie[i]
			const cat2 = categorie[j]

			// Verifica le condizioni di sovrapposizione
			if (
				cat1.id_disciplina === cat2.id_disciplina &&
				(cat1.sesso === cat2.sesso ||
					cat1.sesso === "X" ||
					cat2.sesso === "X") &&
				hasOverlappingWeights(cat1, cat2) &&
				hasOverlappingAges(
					cat1.categorie_fasce,
					cat2.categorie_fasce
				) &&
				hasOverlappingBelts(
					cat1.categorie_cinture,
					cat2.categorie_cinture
				)
			) {
				risultati.push({
					cat1_id: cat1.id_categoria,
					cat1_nome: cat1.nome,
					cat2_id: cat2.id_categoria,
					cat2_nome: cat2.nome,
					id_disciplina: cat1.id_disciplina,
					disciplina: cat1.discipline.valore,
				})
			}
		}
	}

	return risultati
})
