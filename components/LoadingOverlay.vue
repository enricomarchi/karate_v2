<template>
	<div
		v-if="show"
		class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
	>
		<div
			class="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center"
		>
			<div
				class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"
			></div>
			<p class="mt-4 text-gray-700">{{ message || "Caricamento..." }}</p>
		</div>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	show: boolean
	message?: string
}>()
</script>
