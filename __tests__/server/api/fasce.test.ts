import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import type { H3Event } from "h3"
import type { FasciaEtaTest } from "../../../types/global"

// Define mockPrisma type
type MockPrisma = {
	fasciaEta: {
		findMany: ReturnType<typeof vi.fn>
		findUnique: ReturnType<typeof vi.fn>
		create: ReturnType<typeof vi.fn>
		update: ReturnType<typeof vi.fn>
		delete: ReturnType<typeof vi.fn>
	}
}

// Create mockPrisma outside the mock function so it's accessible everywhere
const mockPrisma: MockPrisma = {
	fasciaEta: {
		findMany: vi.fn(),
		findUnique: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
}

// Mock the prisma module with our mockPrisma
vi.mock("../../../lib/prisma", () => ({
	prisma: mockPrisma,
}))

// Import after mocking
const { default: fasceHandler } = await import("../../../server/api/fasce")

// Creiamo un contatore per generare ID univoci
let idCounter = Date.now()

const getUniqueId = () => {
	return idCounter++
}

describe("Fasce API Handler", () => {
	const createMockEvent = <T>(
		method: string,
		query = {},
		body?: T
	): H3Event =>
		({
			node: {
				req: {
					method,
					headers: {
						"content-type": "application/json",
					},
				},
				res: {},
			},
			context: {},
			req: {
				method,
				headers: {
					"content-type": "application/json",
				},
			},
			res: {},
			getQuery: () => query,
			readBody: () => Promise.resolve(body),
			// Aggiungi questi metodi necessari per H3
			method: method,
			_handled: false,
			handle: vi.fn(),
			handleError: vi.fn(),
			readRawBody: () =>
				Promise.resolve(Buffer.from(JSON.stringify(body || {}))),
		} as unknown as H3Event)

	beforeEach(() => {
		vi.clearAllMocks()
		// Reset del contatore prima di ogni test
		idCounter = Date.now()
	})

	it("GET - dovrebbe restituire tutte le fasce", async () => {
		const mockFasce: FasciaEtaTest[] = [
			{
				id_fascia: getUniqueId(),
				descrizione: "Test 1",
				anno_nascita_min: 2010,
				anno_nascita_max: 2012,
			},
			{
				id_fascia: getUniqueId(),
				descrizione: "Test 2",
				anno_nascita_min: 2013,
				anno_nascita_max: 2015,
			},
		]

		mockPrisma.fasciaEta.findMany.mockResolvedValue(mockFasce)

		const event = createMockEvent("GET")
		const response = await fasceHandler(event)
		expect(response).toEqual(mockFasce)
		expect(mockPrisma.fasciaEta.findMany).toHaveBeenCalledTimes(1)
	})

	it("GET - dovrebbe restituire una singola fascia", async () => {
		const mockFascia = {
			id_fascia: getUniqueId(),
			descrizione: "Test 1",
			anno_nascita_min: 2010,
			anno_nascita_max: 2012,
		}

		mockPrisma.fasciaEta.findUnique.mockResolvedValue(mockFascia)

		const event = createMockEvent("GET", { id: "1" })
		const response = await fasceHandler(event)
		expect(response).toEqual(mockFascia)
		expect(mockPrisma.fasciaEta.findUnique).toHaveBeenCalledWith({
			where: { id_fascia: 1 },
		})
	})

	it("POST - dovrebbe creare una nuova fascia", async () => {
		const newId = getUniqueId()
		const newFascia = {
			descrizione: `Test Fascia ${newId}`, // Nome univoco
			anno_nascita_min: 2010,
			anno_nascita_max: 2012,
		}

		mockPrisma.fasciaEta.create.mockResolvedValue({
			id_fascia: newId,
			...newFascia,
		})

		const event = createMockEvent("POST", {}, newFascia)
		const response = await fasceHandler(event)
		expect(response).toHaveProperty("id_fascia")
		expect(mockPrisma.fasciaEta.create).toHaveBeenCalledWith({
			data: newFascia,
		})
	})

	it("PUT - dovrebbe aggiornare una fascia esistente", async () => {
		const updatedFascia = {
			descrizione: "Fascia Aggiornata",
			anno_nascita_min: 2010,
			anno_nascita_max: 2012,
		}

		mockPrisma.fasciaEta.update.mockResolvedValue({
			id_fascia: 1,
			...updatedFascia,
		})

		const event = createMockEvent("PUT", { id: "1" }, updatedFascia)
		const response = await fasceHandler(event)
		expect(response).toHaveProperty("id_fascia")
		expect(mockPrisma.fasciaEta.update).toHaveBeenCalledWith({
			where: { id_fascia: 1 },
			data: updatedFascia,
		})
	})

	it("DELETE - dovrebbe eliminare una fascia", async () => {
		mockPrisma.fasciaEta.delete.mockResolvedValue({ id_fascia: 1 })

		const event = createMockEvent("DELETE", { id: "1" })
		const response = await fasceHandler(event)
		expect(response).toEqual({ id_fascia: 1 })
		expect(mockPrisma.fasciaEta.delete).toHaveBeenCalledWith({
			where: { id_fascia: 1 },
		})
	})

	// Test per gestire gli errori
	it("GET - dovrebbe gestire errori di database", async () => {
		mockPrisma.fasciaEta.findMany.mockRejectedValue(
			new Error("Database error")
		)

		const response = await fasceHandler(createMockEvent("GET"))
		expect(response).toBeUndefined()
	})

	// Test per validazione input
	it("POST - dovrebbe validare i dati in input", async () => {
		const invalidFascia = {
			descrizione: "", // descrizione vuota non valida
			anno_nascita_min: 2010,
			anno_nascita_max: 2012,
		}

		const event = createMockEvent("POST", {}, invalidFascia)
		const response = await fasceHandler(event)
		expect(response).toBeUndefined()
	})
})
