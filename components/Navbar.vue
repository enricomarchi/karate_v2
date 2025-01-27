<template>
	<nav class="bg-gray-800 py-4 shadow-lg fixed top-0 w-full">
		<div class="container mx-auto px-12 max-w-full">
			<div class="flex items-center justify-between">
				<div class="text-white text-2xl font-bold">KARATE</div>
				<button
					@click="showMenu = !showMenu"
					class="md:hidden text-white"
				>
					<i class="fas fa-bars"></i>
				</button>
				<div :class="['md:flex', showMenu ? 'block' : 'hidden']">
					<a
						href="/"
						class="block md:inline-block text-gray-300 hover:text-gray-100 px-4 py-2 md:py-0 transition duration-300"
					>
						Home
					</a>
					<a
						href="/fasce"
						class="block md:inline-block text-gray-300 hover:text-gray-100 px-4 py-2 md:py-0 transition duration-300"
					>
						Fasce
					</a>
					<a
						href="/categorie"
						class="block md:inline-block text-gray-300 hover:text-gray-100 px-4 py-2 md:py-0 transition duration-300"
					>
						Categorie
					</a>
					<a
						href="/atleti"
						class="block md:inline-block text-gray-300 hover:text-gray-100 px-4 py-2 md:py-0 transition duration-300"
					>
						Atleti
					</a>
					<a
						href="/societa"
						class="block md:inline-block text-gray-300 hover:text-gray-100 px-4 py-2 md:py-0 transition duration-300"
					>
						Società
					</a>
					<a
						href="/iscrizioni"
						class="block md:inline-block text-gray-300 hover:text-gray-100 px-4 py-2 md:py-0 transition duration-300"
					>
						Iscrizioni
					</a>
					<a
						href="/matrice-iscrizioni"
						class="block md:inline-block text-gray-300 hover:text-gray-100 px-4 py-2 md:py-0 transition duration-300"
					>
						Matrice
					</a>
					<a
						href="/tabelloni"
						class="block md:inline-block text-gray-300 hover:text-gray-100 px-4 py-2 md:py-0 transition duration-300"
					>
						Tabelloni
					</a>
				</div>
			</div>
		</div>
	</nav>
</template>

<script setup>
import { ref } from "vue"

const showMenu = ref(false)
</script>
