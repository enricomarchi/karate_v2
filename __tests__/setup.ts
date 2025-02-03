import { beforeAll, afterAll, vi } from "vitest"
import { ref } from "vue"
import { prisma } from "../lib/prisma"

// Rimuoviamo l'importazione e la dichiarazione di expect poiché è già globale
// grazie all'opzione globals: true in vitest.config.ts

// Set timezone for consistent date handling
process.env.TZ = "UTC"

// Mock delle API di Nuxt
vi.mock("#app", () => ({
	useNuxtApp: () => ({
		$fetch: vi.fn(),
	}),
	defineNuxtRouteMiddleware: vi.fn(),
	useRouter: () => ({
		push: vi.fn(),
	}),
	navigateTo: vi.fn(),
	useFetch: () => ({
		data: ref([]),
		error: ref(null),
		pending: ref(false),
		refresh: vi.fn(),
	}),
}))

// Aggiungi setup globale
beforeAll(async () => {
	// Assicurati di usare il database di test
	process.env.NODE_ENV = "test"

	try {
		// Ottieni solo le tabelle (escludendo le viste)
		const tables = await prisma.$queryRawUnsafe<
			Array<{ TABLE_NAME: string }>
		>(
			`SELECT TABLE_NAME 
             FROM information_schema.tables 
             WHERE table_schema = 'karate_gare_test' 
             AND table_type = 'BASE TABLE'`
		)

		// Disabilita i controlli delle chiavi esterne
		await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0")

		// Svuota ogni tabella
		for (const table of tables) {
			await prisma.$executeRawUnsafe(
				`TRUNCATE TABLE \`${table.TABLE_NAME}\``
			)
		}

		// Riabilita i controlli delle chiavi esterne
		await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1")
	} catch (error) {
		console.error("Errore durante la pulizia del database:", error)
		throw error
	}

	// Setup globale prima di tutti i test
	// Extend matchers if needed
	expect.extend({
		// Add custom matchers here
	})
})

afterAll(async () => {
	// Chiudi la connessione al database
	await prisma.$disconnect()

	// Cleanup dopo tutti i test
	vi.resetModules()
	vi.clearAllMocks()
})
