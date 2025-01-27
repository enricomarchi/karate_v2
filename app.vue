<template>
	<div>
		<ErrorNotification v-if="errorStore.errors" />
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</div>
</template>

<script setup>
import { useErrorStore } from "~/stores/error"
import "~/assets/css/tailwind.css"
import "@fortawesome/fontawesome-free/css/all.css"

const errorStore = useErrorStore()
</script>
