<template>
	<div class="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
		<div class="max-w-4xl mx-auto">
			<div class="bg-white shadow-lg rounded-lg p-6">
				<h1 class="text-2xl font-bold mb-6">Modifica Configurazione</h1>
				<div v-if="loading" class="text-center py-4">
					Caricamento...
				</div>
				<ConfigurationForm
					v-else-if="config"
					:initial-data="config"
					submit-label="Salva Modifiche"
					@submit="salvaConfigurazione"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRouter, useRoute } from "vue-router"
import type { Configurazione, ProvaAPI } from "~/types/configurazioni"
import ConfigurationForm from "~/components/ConfigurationForm.vue"

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const config = ref<Configurazione | null>(null)

onMounted(async () => {
	await caricaConfigurazione()
})

const caricaConfigurazione = async () => {
	loading.value = true
	try {
		const response = await fetch(`/api/configurazioni/${route.params.id}`)
		if (!response.ok) {
			throw new Error("Errore nel caricamento della configurazione")
		}

		const configData = await response.json()

		// Assicurati che le prove mantengano il loro template_tabellone
		if (configData.prove) {
			configData.prove = configData.prove.map((prova: any) => ({
				...prova,
				nome_prova: `Prova ${prova.ordine}`, // Forza il nome corretto
				template_tabellone: prova.template_tabellone, // Mantieni il template originale
				regole_accesso: prova.regole_accesso || { criteri: [] },
			}))
		}

		config.value = configData
	} catch (error: unknown) {
		console.error("Errore nel caricamento:", error)
		const message =
			error instanceof Error
				? error.message
				: "Errore nel caricamento della configurazione"
		alert(message)
		router.push("/configurazioni")
	} finally {
		loading.value = false
	}
}

const salvaConfigurazione = async (configData: Configurazione) => {
	loading.value = true
	try {
		const response = await fetch(`/api/configurazioni/${route.params.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(configData),
		})

		if (!response.ok) throw new Error("Errore nel salvataggio")
		router.push("/configurazioni")
	} catch (error: unknown) {
		console.error("Errore:", error)
		const message =
			error instanceof Error ? error.message : "Errore sconosciuto"
		alert(message)
	} finally {
		loading.value = false
	}
}
</script>
