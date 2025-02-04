import { config } from "@vue/test-utils"
import { vi } from "vitest"

// Setup globale per i test
config.global.stubs = {
	NuxtLink: true,
	RouterLink: true,
}

// Mock delle API globali del browser
global.fetch = vi.fn()
