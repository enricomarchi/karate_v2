import { describe, it, expect, beforeEach, afterAll, vi } from "vitest"
import { mount, flushPromises } from "@vue/test-utils"
import { defineComponent } from "vue"
import FascePage from "../../pages/fasce.vue"
import prismaTest, { setupTestDb, teardownTestDb } from "../utils/testDb"

// Dati di esempio per i test
const mockFasciaData = {
	id_fascia: 1,
	descrizione: "Fascia Test",
	anno_nascita_min: 2010,
	anno_nascita_max: 2012,
}

// Mock di useFetch
vi.mock("nuxt/app", () => ({
	useFetch: () => ({
		data: { value: mockFasciaData },
		pending: { value: false },
		error: { value: null },
	}),
}))

// Wrapper component per Suspense
const AsyncWrapper = defineComponent({
	components: { FascePage },
	template: `
        <Suspense>
            <template #default>
                <FascePage />
            </template>
            <template #fallback>
                <div>Loading...</div>
            </template>
        </Suspense>
    `,
})

describe("Pagina Fasce", () => {
	beforeEach(async () => {
		await setupTestDb()
	})

	afterAll(async () => {
		await teardownTestDb()
	})

	describe("Test lato client", () => {
		it("si monta correttamente", async () => {
			const wrapper = mount(AsyncWrapper)
			await flushPromises()

			// Verifica che il componente sia montato
			expect(wrapper.html()).toBeTruthy()
			// Verifica il titolo
			expect(wrapper.find("h1").text()).toBe("Fasce d'Età")
		})

		it("mostra il form quando si clicca sul pulsante aggiungi", async () => {
			const wrapper = mount(AsyncWrapper)
			await flushPromises()

			const addButton = wrapper.find('button[title="Aggiungi Fascia"]')
			expect(addButton.exists()).toBe(true)

			await addButton.trigger("click")
			expect(wrapper.find("form").exists()).toBe(true)
		})
	})

	describe("Operazioni CRUD lato server", () => {
		it("crea una nuova fascia", async () => {
			const nuovaFascia = {
				descrizione: "Fascia di Test Creazione",
				anno_nascita_min: 2015,
				anno_nascita_max: 2017,
			}

			const creata = await prismaTest.fasce_eta.create({
				data: nuovaFascia,
			})

			expect(creata.descrizione).toBe(nuovaFascia.descrizione)
			expect(creata.anno_nascita_min).toBe(nuovaFascia.anno_nascita_min)
		})

		it("legge una fascia esistente", async () => {
			// Prima crea un record di test
			const fasciaTest = await prismaTest.fasce_eta.create({
				data: mockFasciaData,
			})

			// Poi lo recupera
			const trovata = await prismaTest.fasce_eta.findUnique({
				where: { id_fascia: fasciaTest.id_fascia },
			})

			expect(trovata).toBeTruthy()
			expect(trovata?.descrizione).toBe(mockFasciaData.descrizione)
		})

		it("aggiorna una fascia esistente", async () => {
			// Crea record di test
			const fasciaTest = await prismaTest.fasce_eta.create({
				data: mockFasciaData,
			})

			// Lo aggiorna
			const aggiornata = await prismaTest.fasce_eta.update({
				where: { id_fascia: fasciaTest.id_fascia },
				data: { descrizione: "Fascia Aggiornata" },
			})

			expect(aggiornata.descrizione).toBe("Fascia Aggiornata")
		})

		it("elimina una fascia esistente", async () => {
			// Crea record di test
			const fasciaTest = await prismaTest.fasce_eta.create({
				data: mockFasciaData,
			})

			// Lo elimina
			await prismaTest.fasce_eta.delete({
				where: { id_fascia: fasciaTest.id_fascia },
			})

			// Verifica l'eliminazione
			const trovata = await prismaTest.fasce_eta.findUnique({
				where: { id_fascia: fasciaTest.id_fascia },
			})

			expect(trovata).toBeNull()
		})
	})
})
