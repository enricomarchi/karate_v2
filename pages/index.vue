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
import { useFetch } from "nuxt/app"
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

const updateCounts = async () => {
	const { data: fasceData } = await useFetch("/api/fasce")
	const { data: categorieData } = await useFetch("/api/categorie")
	const { data: atletiData } = await useFetch("/api/atleti")
	const { data: societaData } = await useFetch("/api/societa")
	const { data: iscrizioniData } = await useFetch("/api/iscrizioni")
	const { data: unassignedData } = await useFetch(
		"/api/iscrizioni/unassigned"
	)
	const { data: sovrapposteData } = await useFetch(
		"/api/categorie/sovrapposte"
	)
	const { data: daConfermare } = await useFetch(
		"/api/iscrizioni/da-confermare"
	)
	const { data: tabelloniData } = await useFetch("/api/tabelloni")

	fasceCount.value = fasceData.value?.length || 0
	categorieCount.value = categorieData.value?.length || 0
	atletiCount.value = atletiData.value?.length || 0
	societaCount.value = societaData.value?.length || 0
	iscrizioniCount.value = iscrizioniData.value?.length || 0
	unassignedIscrizioniCount.value = unassignedData.value?.length || 0
	categorieSovrapposteCount.value = sovrapposteData.value?.length || 0
	unconfirmedIscrizioniCount.value = daConfermare.value?.length || 0
	tabelloniCount.value = tabelloniData.value?.length || 0
	tabelloniBozzaCount.value =
		tabelloniData.value?.filter((t) => t.stato === "BOZZA").length || 0
	tabelloniAttiviCount.value =
		tabelloniData.value?.filter((t) => t.stato === "ATTIVO").length || 0
	tabelloniCompletatiCount.value =
		tabelloniData.value?.filter((t) => t.stato === "COMPLETATO").length || 0
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
		await updateCounts() // Aggiorna i conteggi dopo l'importazione
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

onMounted(() => {
	updateCounts()
})
</script>
