import type { Ref } from "vue"
import type { UseFetchOptions } from "nuxt/app"

declare module "nuxt/app" {
	interface NuxtApp {
		$fetch: typeof fetch
	}
}

declare module "@vue/runtime-core" {
	interface ComponentCustomProperties {
		useFetch: <T>(
			url: string,
			opts?: UseFetchOptions<T>
		) => Promise<{
			data: Ref<T | null>
			pending: Ref<boolean>
			refresh: () => Promise<void>
			error: Ref<Error | null>
		}>
	}
}

export {}
