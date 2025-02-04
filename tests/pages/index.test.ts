import { describe, it, expect, vi } from "vitest"
import { mount, flushPromises } from "@vue/test-utils"
import { defineComponent, h } from "vue"
import IndexPage from "../../pages/index.vue"

// Mock delle funzioni fetch necessarie
vi.mock("nuxt/app", () => ({
	useFetch: () => Promise.resolve({ data: { value: [] } }),
}))

// Crea un wrapper per il componente asincrono
const AsyncWrapper = defineComponent({
	components: { IndexPage },
	template: `
    <Suspense>
      <template #default>
        <IndexPage />
      </template>
      <template #fallback>
        <div>Loading...</div>
      </template>
    </Suspense>
  `,
})

describe("IndexPage", () => {
	it("monta correttamente la pagina", async () => {
		const wrapper = mount(AsyncWrapper)
		await flushPromises()
		expect(wrapper.html()).toBeTruthy()
	})

	it("visualizza almeno un titolo", async () => {
		const wrapper = mount(AsyncWrapper)
		await flushPromises()
		const titles = wrapper.findAll("h2")
		expect(titles.length).toBeGreaterThan(0)
	})

	it("contiene le card principali", async () => {
		const wrapper = mount(AsyncWrapper)
		await flushPromises()
		const cards = wrapper.findAll(".card")
		expect(cards.length).toBeGreaterThan(0)
	})
})
