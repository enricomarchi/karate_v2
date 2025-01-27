<template>
	<div
		v-if="show"
		class="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center"
	>
		<div class="flex flex-col items-center bg-white p-4 rounded-lg">
			<div class="loader"></div>
			<div class="mt-2 text-gray-700">{{ message }}</div>
		</div>
	</div>
</template>

<script setup>
defineProps({
	show: Boolean,
	message: String,
})
</script>

<style scoped>
.loader {
	border: 4px solid #f3f3f3;
	border-radius: 50%;
	border-top: 4px solid #3498db;
	width: 40px;
	height: 40px;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}
</style>
