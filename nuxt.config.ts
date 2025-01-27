import { defineNuxtConfig } from "nuxt/config"

export default defineNuxtConfig({
	compatibilityDate: "2024-04-03",
	devtools: { enabled: false },
	css: [
		"@fortawesome/fontawesome-free/css/all.css",
		"~/assets/css/tailwind.css",
		"@/assets/css/global.css", // aggiungi questa riga
	],
	postcss: {
		plugins: {
			tailwindcss: {},
			autoprefixer: {},
		},
	},
	modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt"],
	pages: true,
	nitro: {
		externals: {
			inline: ["xlsx"],
		},
	},
	build: {
		transpile: ["xlsx"],
	},
})
