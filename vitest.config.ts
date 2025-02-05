import { defineConfig } from "vitest/config"
import vue from "@vitejs/plugin-vue"
import { fileURLToPath } from "node:url"
import { resolve } from "path"

export default defineConfig({
	plugins: [vue()],
	test: {
		globals: true,
		environment: "happy-dom",
		deps: {
			inline: [/vue/, /@nuxt/, /nuxt/],
		},
		setupFiles: ["./vitest.setup.ts"],
		include: ["./tests/**/*.test.ts"],
		root: fileURLToPath(new URL("./", import.meta.url)),
	},
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./", import.meta.url)),
			"~": fileURLToPath(new URL("./", import.meta.url)),
			"#app": resolve(__dirname, "node_modules/nuxt/dist/app"),
			"#head": resolve(__dirname, "node_modules/nuxt/dist/head/runtime"),
			"#build": resolve(__dirname, ".nuxt"),
			"vue-demi": resolve(
				__dirname,
				"node_modules/nuxt/dist/app/compat/vue-demi"
			),
			"#imports": resolve(__dirname, ".nuxt/imports.d.ts"),
			"nuxt/app": resolve(__dirname, "node_modules/nuxt/dist/app"),
		},
	},
})
