import { describe, it, expect, beforeEach, vi } from "vitest"
import { mount } from "@vue/test-utils"
import { nextTick, ref } from "vue"
import FascePage from "../../pages/fasce.vue"
import LoadingOverlay from "../../components/LoadingOverlay.vue"

// Mock delle API calls
vi.mock("#app", () => ({
	useFetch: () => ({
		data: ref([
			{
				id_fascia: 1,
				descrizione: "Test Fascia",
				anno_nascita_min: 2010,
				anno_nascita_max: 2012,
			},
		]),
		error: ref(null),
		pending: ref(false),
	}),
}))

describe("Fasce Page", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("should render correctly", async () => {
		const wrapper = mount(FascePage, {
			global: {
				components: {
					LoadingOverlay,
				},
				stubs: {
					Suspense: {
						template: "<div><slot /></div>",
					},
				},
			},
			shallow: true,
		})

		await nextTick()
		await nextTick() // doppio nextTick per l'async setup
		expect(wrapper.find("h1").exists()).toBe(true)
	})

	it("should open form when clicking add button", async () => {
		const wrapper = mount(FascePage, {
			global: {
				components: {
					LoadingOverlay,
				},
				stubs: {
					Suspense: true,
				},
			},
		})

		await nextTick()
		const addButton = wrapper.find('button[title="Aggiungi Fascia"]')
		await addButton.trigger("click")
		const form = wrapper.find("form")
		expect(form.exists()).toBe(true)
	})
})
