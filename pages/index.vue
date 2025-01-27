<template>
	<div class="bg-gray-100 main-container">
		<div class="container mx-auto py-8 px-12">
			<div class="flex flex-wrap justify-start gap-6">
				<a
					@click="importData"
					class="group block w-72 h-64 bg-white shadow-2xl rounded-lg overflow-hidden relative hover:shadow-2xl hover:bg-gray-100 hover:transform hover:-translate-y-2 transition-all duration-150 card cursor-pointer"
				>
					<div
						class="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-blue-500 transition-colors duration-150"
					></div>
					<div class="px-8 py-4">
						<h2 class="text-2xl font-bold mb-2 text-gray-800">
							Importa Iscrizioni
						</h2>
						<p class="text-gray-600 mb-6">
							Importa le iscrizioni da file CSV.
						</p>
					</div>
				</a>
				<a
					href="/fasce"
					class="group block w-72 h-64 bg-white shadow-2xl rounded-lg overflow-hidden relative hover:shadow-2xl hover:bg-gray-100 hover:transform hover:-translate-y-2 transition-all duration-150 card cursor-pointer"
				>
					<div
						class="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-blue-500 transition-colors duration-150"
					></div>
					<div class="px-8 py-4">
						<h2 class="text-2xl font-bold mb-2 text-gray-800">
							Fasce d'Età
						</h2>
						<p class="text-gray-600 mb-6">
							Crea e modifica le fasce d'età della gara.
						</p>
						<p class="text-gray-600">
							<span class="font-bold text-lg text-green-500">{{
								fasceCount
							}}</span>
							fasce in totale.
						</p>
					</div>
				</a>
				<a
					href="/categorie"
					class="group block w-72 h-64 bg-white shadow-2xl rounded-lg overflow-hidden relative hover:shadow-2xl hover:bg-gray-100 hover:transform hover:-translate-y-2 transition-all duration-150 card cursor-pointer"
				>
					<div
						class="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-blue-500 transition-colors duration-150"
					></div>
					<div class="px-8 py-4">
						<h2 class="text-2xl font-bold mb-2 text-gray-800">
							Categorie
						</h2>
						<p class="text-gray-600 mb-6">
							Crea e modifica le categorie della gara.
						</p>
						<p class="text-gray-600">
							<span class="font-bold text-lg text-green-500">{{
								categorieCount
							}}</span>
							categorie in totale.
						</p>
						<p
							v-if="categorieSovrapposteCount > 0"
							class="text-gray-600"
						>
							<span class="font-bold text-lg text-red-500">{{
								categorieSovrapposteCount
							}}</span>
							categorie sovrapposte.
						</p>
					</div>
				</a>
				<a
					href="/atleti"
					class="group block w-72 h-64 bg-white shadow-2xl rounded-lg overflow-hidden relative hover:shadow-2xl hover:bg-gray-100 hover:transform hover:-translate-y-2 transition-all duration-150 card cursor-pointer"
				>
					<div
						class="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-blue-500 transition-colors duration-150"
					></div>
					<div class="px-8 py-4">
						<h2 class="text-2xl font-bold mb-2 text-gray-800">
							Atleti
						</h2>
						<p class="text-gray-600 mb-6">
							Gestisci gli atleti iscritti.
						</p>
						<p class="text-gray-600">
							<span class="font-bold text-lg text-green-500">{{
								atletiCount
							}}</span>
							atleti in totale.
						</p>
					</div>
				</a>
				<a
					href="/societa"
					class="group block w-72 h-64 bg-white shadow-2xl rounded-lg overflow-hidden relative hover:shadow-2xl hover:bg-gray-100 hover:transform hover:-translate-y-2 transition-all duration-150 card cursor-pointer"
				>
					<div
						class="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-blue-500 transition-colors duration-150"
					></div>
					<div class="px-8 py-4">
						<h2 class="text-2xl font-bold mb-2 text-gray-800">
							Società
						</h2>
						<p class="text-gray-600 mb-6">
							Gestisci le società iscritte.
						</p>
						<p class="text-gray-600">
							<span class="font-bold text-lg text-green-500">{{
								societaCount
							}}</span>
							società in totale.
						</p>
					</div>
				</a>
				<a
					href="/iscrizioni"
					class="group block w-72 h-64 bg-white shadow-2xl rounded-lg overflow-hidden relative hover:shadow-2xl hover:bg-gray-100 hover:transform hover:-translate-y-2 transition-all duration-150 card cursor-pointer"
				>
					<div
						class="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-blue-500 transition-colors duration-150"
					></div>
					<div class="px-8 py-4">
						<h2 class="text-2xl font-bold mb-2 text-gray-800">
							Iscrizioni
						</h2>
						<p class="text-gray-600 mb-6">
							Gestisci le iscrizioni degli atleti.
						</p>
						<p class="text-gray-600">
							<span class="font-bold text-lg text-green-500">{{
								iscrizioniCount
							}}</span>
							iscrizioni in totale.
						</p>
						<p
							v-if="unconfirmedIscrizioniCount > 0"
							class="text-gray-600"
						>
							<span class="font-bold text-lg text-yellow-500">{{
								unconfirmedIscrizioniCount
							}}</span>
							da confermare.
						</p>
						<p class="text-gray-600">
							<span
								v-if="unassignedIscrizioniCount > 0"
								class="font-bold text-lg text-red-500"
							>
								{{ unassignedIscrizioniCount }}
							</span>
							<span v-if="unassignedIscrizioniCount > 0">
								senza categoria.
							</span>
						</p>
					</div>
				</a>
				<a
					href="/matrice-iscrizioni"
					class="group block w-72 h-64 bg-white shadow-2xl rounded-lg overflow-hidden relative hover:shadow-2xl hover:bg-gray-100 hover:transform hover:-translate-y-2 transition-all duration-150 card cursor-pointer"
				>
					<div
						class="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-blue-500 transition-colors duration-150"
					></div>
					<div class="px-8 py-4">
						<h2 class="text-2xl font-bold mb-2 text-gray-800">
							Matrice Iscrizioni
						</h2>
						<p class="text-gray-600 mb-6">
							Visualizza le iscrizioni raggruppate per categoria,
							cintura e fascia d'età.
						</p>
					</div>
				</a>
				<a
					href="/tabelloni"
					class="group block w-72 h-64 bg-white shadow-2xl rounded-lg overflow-hidden relative hover:shadow-2xl hover:bg-gray-100 hover:transform hover:-translate-y-2 transition-all duration-150 card cursor-pointer"
				>
					<div
						class="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-blue-500 transition-colors duration-150"
					></div>
					<div class="px-8 py-4">
						<h2 class="text-2xl font-bold mb-2 text-gray-800">
							Tabelloni
						</h2>
						<p class="text-gray-600 mb-6">
							Gestisci i tabelloni di gara e i punteggi.
						</p>
						<p class="text-gray-600">
							<span class="font-bold text-lg text-green-500">{{
								tabelloniCount
							}}</span>
							tabelloni totali.
						</p>
						<p class="text-gray-600">
							<span class="font-bold text-lg text-yellow-500">{{
								tabelloniBozzaCount
							}}</span>
							in bozza.
						</p>
						<p class="text-gray-600">
							<span class="font-bold text-lg text-blue-500">{{
								tabelloniAttiviCount
							}}</span>
							attivi.
						</p>
						<p class="text-gray-600">
							<span class="font-bold text-lg text-gray-500">{{
								tabelloniCompletatiCount
							}}</span>
							conclusi.
						</p>
					</div>
				</a>
				<a
					@click="exportData"
					class="group block w-72 h-64 bg-white shadow-2xl rounded-lg overflow-hidden relative hover:shadow-2xl hover:bg-gray-100 hover:transform hover:-translate-y-2 transition-all duration-150 card cursor-pointer"
				>
					<div
						class="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-blue-500 transition-colors duration-150"
					></div>
					<div class="px-8 py-4">
						<h2 class="text-2xl font-bold mb-2 text-gray-800">
							Esporta Dati
						</h2>
						<p class="text-gray-600 mb-6">
							Esporta i dati del database in formato SQL.
						</p>
					</div>
				</a>
			</div>
		</div>
		<div
			v-if="message"
			:class="[
				'alert',
				{
					success: !error,
					error: error,
				},
			]"
		>
			{{ message }}
		</div>
		<LoadingOverlay :show="loading" :message="loadingMessage" />
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useFetch } from "#app"
import LoadingOverlay from "@/components/LoadingOverlay.vue"

const message = ref("")
const error = ref(false)

const fasceCount = ref(0)
const categorieCount = ref(0)
const atletiCount = ref(0)
const societaCount = ref(0)
const iscrizioniCount = ref(0)
const unassignedIscrizioniCount = ref(0)
const categorieSovrapposteCount = ref(0)
const unconfirmedIscrizioniCount = ref(0)
const tabelloniCount = ref(0)
const tabelloniBozzaCount = ref(0)
const tabelloniAttiviCount = ref(0)
const tabelloniCompletatiCount = ref(0)

const loading = ref(false)
const loadingMessage = ref("")

const fetchWithRetry = async (url, retries = 3) => {
	for (let i = 0; i < retries; i++) {
		try {
			const response = await fetch(url)
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}
			const data = await response.json()
			return data
		} catch (error) {
			if (i === retries - 1) throw error
			await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)))
		}
	}
}

const fetchCounts = async () => {
	try {
		const endpoints = [
			"/api/fasce-eta",
			"/api/categorie",
			"/api/atleti",
			"/api/societa",
			"/api/iscrizioni",
			"/api/iscrizioni/unassigned",
			"/api/categorie-sovrapposte",
			"/api/iscrizioni/da-confermare",
			"/api/tabelloni",
		]

		const results = await Promise.all(
			endpoints.map((endpoint) => fetchWithRetry(endpoint))
		)

		console.log("Risultati delle chiamate:", results)

		// Aggiorna i contatori solo se i dati sono validi
		if (Array.isArray(results[0])) fasceCount.value = results[0].length
		if (Array.isArray(results[1])) categorieCount.value = results[1].length
		if (Array.isArray(results[2])) atletiCount.value = results[2].length
		if (Array.isArray(results[3])) societaCount.value = results[3].length
		if (Array.isArray(results[4])) iscrizioniCount.value = results[4].length
		if (Array.isArray(results[5]))
			unassignedIscrizioniCount.value = results[5].length
		if (Array.isArray(results[6]))
			categorieSovrapposteCount.value = results[6].length
		if (Array.isArray(results[7]))
			unconfirmedIscrizioniCount.value = results[7].length
		if (Array.isArray(results[8])) {
			tabelloniCount.value = results[8].length
			tabelloniBozzaCount.value = results[8].filter(
				(t) => t.stato === "BOZZA"
			).length
			tabelloniAttiviCount.value = results[8].filter(
				(t) => t.stato === "ATTIVO"
			).length
			tabelloniCompletatiCount.value = results[8].filter(
				(t) => t.stato === "COMPLETATO"
			).length
		}
	} catch (err) {
		console.error("Errore nel caricamento dei conteggi:", err)
		error.value = true
		message.value = "Errore nel caricamento dei dati: " + err.message
	}
}

const importData = async () => {
	loading.value = true
	loadingMessage.value = "Importazione iscrizioni in corso..."
	document.body.style.cursor = "wait"

	try {
		const response = await fetch("/api/import")
		const data = await response.json()

		if (!response.ok) {
			throw new Error(data.message || "Errore durante l'importazione")
		}

		message.value = "Importazione completata con successo"
		error.value = false
		await fetchCounts() // Aggiorna i conteggi dopo l'importazione
	} catch (err) {
		console.error("Errore durante l'importazione:", err)
		message.value = "Errore durante l'importazione"
		error.value = true
	} finally {
		loading.value = false
		document.body.style.cursor = "default"
		setTimeout(() => {
			message.value = ""
		}, 3000)
	}
}

const exportData = async () => {
	loading.value = true
	loadingMessage.value = "Esportazione dati in corso..."
	document.body.style.cursor = "wait"

	try {
		const response = await fetch("/api/export")
		const blob = await response.blob()

		// Crea un link per il download
		const url = window.URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = `database_export_${
			new Date().toISOString().split("T")[0]
		}.sql`
		document.body.appendChild(a)
		a.click()
		window.URL.revokeObjectURL(url)
		document.body.removeChild(a)

		message.value = "Esportazione completata con successo"
		error.value = false
	} catch (err) {
		console.error("Errore durante l'esportazione:", err)
		message.value = "Errore durante l'esportazione"
		error.value = true
	} finally {
		loading.value = false
		document.body.style.cursor = "default"
		setTimeout(() => {
			message.value = ""
		}, 3000)
	}
}

// Carica i conteggi quando il componente viene montato
onMounted(() => {
	fetchCounts()
})
</script>
