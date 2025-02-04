import { defineNuxtConfig } from "nuxt/config"

export default defineNuxtConfig({
	compatibilityDate: "2024-04-03",
	devtools: { enabled: true },
	css: [
		"@fortawesome/fontawesome-free/css/all.css",
		"~/assets/css/tailwind.css",
		"@/assets/css/global.css",
	],
	postcss: {
		plugins: {
			tailwindcss: {},
			autoprefixer: {},
		},
	},
	modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt", "@prisma/nuxt"],
	pages: true,
	nitro: {
		preset: "node-server",
	},
	runtimeConfig: {
		prisma: {
			database: process.env.DATABASE_URL,
		},
	},
})
