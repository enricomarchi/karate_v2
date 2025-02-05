import { config } from "@vue/test-utils"
import { vi } from "vitest"
import { ref } from "vue"

// Setup globale per i test
config.global.stubs = {
	NuxtLink: true,
	RouterLink: true,
}

// Mock delle API globali del browser
global.fetch = vi.fn()

// Mock delle funzionalità di Nuxt
vi.mock("nuxt/app", () => ({
	useNuxtApp: () => ({
		$fetch: vi.fn(),
	}),
	defineNuxtConfig: vi.fn(),
	useRuntimeConfig: () => ({
		public: {},
	}),
	useFetch: () => ({
		data: ref([]),
		pending: ref(false),
		error: ref(null),
	}),
}))

// Aggiungi ref se non è definito
if (typeof ref === "undefined") {
	const ref = (val: any) => ({
		value: val,
	})
}
