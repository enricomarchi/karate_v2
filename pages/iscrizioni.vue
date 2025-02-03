<template>
	<div class="bg-gray-100">
		<!-- Toolbar sotto la navbar -->
		<div
			class="flex items-center justify-between mx-auto px-24 w-full py-4 bg-gray-200 fixed top-16 z-10"
		>
			<h1 class="text-2xl font-bold">Iscrizioni</h1>
			<div>
				<button
					@click="openForm"
					class="text-gray-700 hover:text-green-500 px-2 rounded mr-4 hover:bg-gray-200"
					title="Aggiungi Iscrizione"
				>
					<i class="fas fa-plus"></i>
				</button>
				<button
					@click="deleteSelectedIscrizioni"
					class="text-gray-700 hover:text-red-500 px-2 rounded mr-4 hover:bg-gray-200"
					title="Elimina Selezionate"
				>
					<i class="fas fa-trash"></i>
				</button>
			</div>
		</div>
		<div class="bg-gray-100 pt-16 z-10 main-container">
			<div class="container mx-auto py-8 px-24 max-w-full z-10">
				<table class="bg-white z-10">
					<thead class="bg-white z-10">
						<tr>
							<th class="border px-4 py-2">
								<input
									type="checkbox"
									@click="toggleAllSelection"
								/>
							</th>
							<th class="border px-4 py-2">ID</th>
							<th class="border px-4 py-2">Atleta</th>
							<th class="border px-4 py-2">Disciplina</th>
							<th class="border px-4 py-2">Categoria</th>
							<th class="border px-4 py-2">Data Iscrizione</th>
							<th class="border px-4 py-2">Stato</th>
							<th class="border px-4 py-2">Azioni</th>
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="iscrizione in iscrizioni"
							:key="iscrizione.id_iscrizione"
							:class="{
								'transition-all duration-200': true,
								'bg-blue-200 hover:bg-blue-300':
									selectedIscrizioni.includes(
										iscrizione.id_iscrizione
									),
								'bg-white hover:bg-gray-200':
									!selectedIscrizioni.includes(
										iscrizione.id_iscrizione
									),
							}"
							class="mb-4"
							@click="
								toggleIscrizioneSelection(
									iscrizione.id_iscrizione
								)
							"
						>
							<td class="border px-4 py-2 cursor-pointer">
								<input
									type="checkbox"
									:checked="
										selectedIscrizioni.includes(
											iscrizione.id_iscrizione
										)
									"
								/>
							</td>
							<td class="border px-4 py-2">
								{{ iscrizione.id_iscrizione }}
							</td>
							<td class="border px-4 py-2">
								{{ iscrizione.cognome }} {{ iscrizione.nome }}
							</td>
							<td class="border px-4 py-2">
								{{ iscrizione.disciplina_valore }}
							</td>
							<td class="border px-4 py-2">
								{{ iscrizione.nome_categoria }}
							</td>
							<td class="border px-4 py-2">
								{{ formatDateTime(iscrizione.data_iscrizione) }}
							</td>
							<td class="border px-4 py-2">
								<div class="flex items-center justify-center">
									<span
										class="h-3 w-3 rounded-full"
										:class="{
											'bg-green-500':
												iscrizione.confermata &&
												iscrizione.id_categoria,
											'bg-yellow-500':
												!iscrizione.confermata &&
												iscrizione.id_categoria,
											'bg-red-500':
												!iscrizione.id_categoria,
										}"
										:title="getStatoTitle(iscrizione)"
									></span>
								</div>
							</td>
							<td class="border px-4 py-2">
								<div class="h-full">
									<button
										@click.stop="editIscrizione(iscrizione)"
										class="text-gray-700 hover:bg-gray-100 p-2 rounded mx-1 hover:text-yellow-500"
									>
										<i class="fas fa-edit"></i>
									</button>
									<button
										@click.stop="
											deleteIscrizione(
												iscrizione.id_iscrizione
											)
										"
										class="text-gray-700 hover:bg-gray-100 p-2 rounded mx-1 hover:text-red-500"
									>
										<i class="fas fa-trash"></i>
									</button>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		<!-- Modale per il form di modifica/inserimento -->
		<IscrizioneFormModal
			v-if="formVisible"
			:iscrizione="iscrizione"
			:atleti="atleti"
			:discipline="discipline"
			:categorie="categorie"
			:cinture="cinture"
			:societa="societa"
			@close="closeForm"
			@save="saveIscrizione"
		/>
		<LoadingOverlay :show="loading" :message="loadingMessage" />
	</div>
</template>

<script setup lang="ts">
import { ref, type Ref, watch, onMounted } from "vue"
import { useFetch } from "nuxt/app"
import IscrizioneFormModal from "@/components/IscrizioneFormModal.vue"
import LoadingOverlay from "@/components/LoadingOverlay.vue"
import type {
	Iscrizione,
	Atleta,
	Disciplina,
	Categoria,
	Cintura,
	Societa,
} from "~/types/global"

const iscrizione: Ref<Iscrizione> = ref({
	id_iscrizione: undefined,
	atleta: undefined,
	disciplina: undefined,
	categoria: undefined,
	data_iscrizione: undefined,
	manuale: false,
	confermata: false,
	ammesso_in_finale: false,
	classifica: null,
})

const { data: iscrizioni } = await useFetch<Iscrizione[]>("/api/iscrizioni")
const { data: atleti } = await useFetch<Atleta[]>("/api/atleti")
const { data: discipline } = await useFetch<Disciplina[]>("/api/discipline")
const { data: categorie } = await useFetch<Categoria[]>("/api/categorie")
const { data: cinture } = await useFetch<Cintura[]>("/api/cinture")
const { data: societa } = await useFetch<Societa[]>("/api/societa")

const formVisible = ref(false)
const selectedIscrizioni = ref<number[]>([])
const loading = ref(false)
const loadingMessage = ref("")

const openForm = () => {
	formVisible.value = true
	iscrizione.value = {
		id_iscrizione: undefined,
		atleta: undefined,
		disciplina: undefined,
		categoria: undefined,
		data_iscrizione: undefined,
		manuale: false,
		confermata: false,
		ammesso_in_finale: false,
		classifica: null,
	}
}

const closeForm = () => {
	formVisible.value = false
	iscrizione.value = {
		id_iscrizione: undefined,
		atleta: undefined,
		disciplina: undefined,
		categoria: undefined,
		data_iscrizione: undefined,
		manuale: false,
		confermata: false,
		ammesso_in_finale: false,
		classifica: null,
	}
}

const saveIscrizione = async (savedIscrizione: Iscrizione) => {
	if (!savedIscrizione.atleta?.id_atleta) {
		console.error("Errore: il campo 'atleta' non può essere nullo")
		return
	}

	if (!savedIscrizione.disciplina?.id_disciplina) {
		console.error("Errore: il campo 'disciplina' non può essere nullo")
		return
	}

	const method = savedIscrizione.id_iscrizione ? "PUT" : "POST"
	const query = savedIscrizione.id_iscrizione
		? { id: savedIscrizione.id_iscrizione }
		: undefined

	const { data } = await useFetch("/api/iscrizioni", {
		method,
		query,
		body: savedIscrizione,
	})

	if (data.value) {
		const { data: iscrizioniAggiornate } = await useFetch<Iscrizione[]>(
			"/api/iscrizioni"
		)
		iscrizioni.value = iscrizioniAggiornate.value
	}

	closeForm()
}

const toggleIscrizioneSelection = (id_iscrizione?: number) => {
	if (id_iscrizione === undefined) return
	const index = selectedIscrizioni.value.indexOf(id_iscrizione)
	if (index === -1) {
		selectedIscrizioni.value.push(id_iscrizione)
	} else {
		selectedIscrizioni.value.splice(index, 1)
	}
}

const toggleAllSelection = () => {
	if (selectedIscrizioni.value.length === iscrizioni.value.length) {
		selectedIscrizioni.value = []
	} else {
		selectedIscrizioni.value = iscrizioni.value.map((i) => i.id_iscrizione)
	}
}

const editIscrizione = async (iscrizioneToEdit: Iscrizione) => {
	try {
		// Recupera i dettagli completi dell'iscrizione dal backend
		const { data } = await useFetch<Iscrizione>(`/api/iscrizioni`, {
			query: { id: iscrizioneToEdit.id_iscrizione },
		})

		if (data.value) {
			// Assicurati che tutti i riferimenti agli oggetti correlati siano corretti
			const iscrizione_completa = {
				...data.value,
				atleta:
					atleti.value?.find(
						(a) => a.id_atleta === data.value.id_atleta
					) || data.value.atleta,
				disciplina:
					discipline.value?.find(
						(d) => d.id_disciplina === data.value.id_disciplina
					) || data.value.disciplina,
				categoria:
					categorie.value?.find(
						(c) => c.id_categoria === data.value.id_categoria
					) || data.value.categoria,
			}

			// Aggiorna il ref dell'iscrizione con i dati completi
			iscrizione.value = iscrizione_completa
			formVisible.value = true
		}
	} catch (error) {
		console.error(
			"Errore nel recupero dei dettagli dell'iscrizione:",
			error
		)
	}
}

const deleteIscrizione = async (id_iscrizione?: number) => {
	if (id_iscrizione === undefined) return
	try {
		await useFetch(`/api/iscrizioni`, {
			method: "DELETE",
			query: { id: id_iscrizione },
		})
		const { data: iscrizioniAggiornate } = await useFetch<Iscrizione[]>(
			"/api/iscrizioni"
		)
		iscrizioni.value = iscrizioniAggiornate.value
	} catch (error) {
		console.error("Errore nella cancellazione dell'iscrizione:", error)
	}
}

const deleteSelectedIscrizioni = async () => {
	if (selectedIscrizioni.value.length === 0) return

	loading.value = true
	loadingMessage.value = "Eliminazione iscrizioni in corso..."
	document.body.style.cursor = "wait"

	try {
		for (const id_iscrizione of selectedIscrizioni.value) {
			await deleteIscrizione(id_iscrizione)
		}
	} catch (error) {
		console.error("Errore durante l'eliminazione delle iscrizioni:", error)
	} finally {
		loading.value = false
		document.body.style.cursor = "default"
		selectedIscrizioni.value = []
	}
}

// Modifica la funzione getStatoTitle per gestire il caso undefined
const getStatoTitle = (iscrizione: Iscrizione): string => {
	if (!iscrizione.categoria?.id_categoria) {
		return "Nessuna categoria associata"
	}
	return iscrizione.confermata
		? "Iscrizione confermata"
		: "Iscrizione da confermare"
}

// Aggiungi questa funzione per formattare la data
const formatDateTime = (dateString: string | undefined): string => {
	if (!dateString) return ""
	const date = new Date(dateString)
	return date.toLocaleString("it-IT", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	})
}
</script>

<style scoped>
/* Aggiungi transizione per l'effetto di evidenziazione */
tr {
	transition: background-color 0.2s ease;
}

/* Aggiungi stile per l'hover del tooltip */
[title] {
	position: relative;
	cursor: help;
}
</style>
