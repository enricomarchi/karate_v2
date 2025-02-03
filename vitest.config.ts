/// <reference types="vitest" />
/// <reference types="vitest/globals" />
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { resolve } from "path"

export default defineConfig({
	plugins: [vue()],
	test: {
		globals: true, // Questo abilita expect e altri globals
		environment: "jsdom",
		setupFiles: ["./__tests__/setup.ts"], // Percorso aggiornato
		include: ["__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/",
				"dist/",
				"**/*.{test,spec}.{js,ts}",
				"**/*.d.ts",
			],
			all: true,
			thresholds: {
				lines: 80,
				functions: 80,
				branches: 80,
				statements: 80,
			},
		},
		pool: "forks", // Use forks for better isolation
		poolOptions: {
			threads: {
				singleThread: true, // Better for debugging
			},
		},
		testTimeout: 10000, // 10 seconds
		hookTimeout: 10000,
		isolate: true,
		clearMocks: true,
		mockReset: true,
		restoreMocks: true,
		server: {
			deps: {
				inline: ["@prisma/client", "~/lib/prisma", "C:"],
			},
		},
	},
	resolve: {
		alias: {
			"~": resolve(__dirname, "./"),
			"@": resolve(__dirname, "./"),
			"#app": resolve(__dirname, "node_modules/nuxt/dist/app"),
		},
	},
})
