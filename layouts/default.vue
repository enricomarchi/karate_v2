<template>
	<div>
		<Navbar class="fixed top-0 w-full z-50" />
		<div class="mt-16">
			<NuxtPage />
		</div>
	</div>
</template>

<script setup>
import Navbar from "~/components/Navbar.vue"
</script>
