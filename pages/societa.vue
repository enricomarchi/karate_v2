<template>
	<div class="bg-gray-100">
		<!-- Toolbar sotto la navbar -->
		<div
			class="flex items-center justify-between mx-auto px-24 w-full py-4 bg-gray-200 fixed top-16 z-10"
		>
			<h1 class="text-2xl font-bold">Società</h1>
			<div>
				<button
					@click="printClassifica"
					class="text-gray-700 hover:text-blue-500 px-2 rounded mr-4 hover:bg-gray-200"
					title="Stampa Classifica"
				>
					<i class="fas fa-print"></i>
				</button>
				<button
					@click="openForm"
					class="text-gray-700 hover:text-green-500 px-2 rounded mr-4 hover:bg-gray-200"
					title="Aggiungi Società"
				>
					<i class="fas fa-plus"></i>
				</button>
				<button
					@click="deleteSelectedSocieta"
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
							<th class="border px-4 py-2 w-[50px]">
								<input
									type="checkbox"
									@click="toggleAllSelection"
								/>
							</th>
							<!-- Aggiunta colonna posizione -->
							<th
								class="border px-4 py-2 w-[100px] cursor-pointer"
								@click="sortTable('posizione_classifica')"
							>
								Classifica
								<span v-if="sortKey === 'posizione_classifica'">
									{{ sortAsc ? "▲" : "▼" }}
								</span>
							</th>
							<th
								class="border px-4 py-2 w-[100px] cursor-pointer"
								@click="sortTable('punteggio_totale')"
							>
								Punteggio
								<span v-if="sortKey === 'punteggio_totale'">{{
									sortAsc ? "▲" : "▼"
								}}</span>
							</th>
							<th
								class="border px-4 py-2 w-[250px] cursor-pointer"
								@click="sortTable('nome_societa')"
							>
								Nome Società
								<span v-if="sortKey === 'nome_societa'">
									{{ sortAsc ? "▲" : "▼" }}
								</span>
							</th>
							<!-- Nuove colonne -->
							<th
								class="border px-4 py-2 w-[100px] cursor-pointer"
								@click="sortTable('numero_atleti')"
							>
								Atleti
								<span v-if="sortKey === 'numero_atleti'">{{
									sortAsc ? "▲" : "▼"
								}}</span>
							</th>
							<th
								class="border px-4 py-2 w-[100px] cursor-pointer"
								@click="sortTable('numero_iscrizioni')"
							>
								Iscrizioni Tot
								<span v-if="sortKey === 'numero_iscrizioni'">{{
									sortAsc ? "▲" : "▼"
								}}</span>
							</th>
							<th
								class="border px-4 py-2 w-[100px] cursor-pointer"
								@click="
									sortTable('numero_iscrizioni_confermate')
								"
							>
								Confermate
								<span
									v-if="
										sortKey ===
										'numero_iscrizioni_confermate'
									"
									>{{ sortAsc ? "▲" : "▼" }}</span
								>
							</th>
							<th
								class="border px-4 py-2 w-[120px] cursor-pointer"
								@click="sortTable('importo_dovuto')"
							>
								Importo €
								<span v-if="sortKey === 'importo_dovuto'">{{
									sortAsc ? "▲" : "▼"
								}}</span>
							</th>
							<th
								class="border px-4 py-2 w-[120px] cursor-pointer"
								@click="sortTable('pagato')"
							>
								Pagato €
								<span v-if="sortKey === 'pagato'">{{
									sortAsc ? "▲" : "▼"
								}}</span>
							</th>
							<th
								class="border px-4 py-2 w-[120px] cursor-pointer"
								@click="sortTable('resto_consegnato')"
							>
								Resto €
								<span v-if="sortKey === 'resto_consegnato'">{{
									sortAsc ? "▲" : "▼"
								}}</span>
							</th>
							<th
								class="border px-4 py-2 w-[120px] cursor-pointer"
								@click="sortTable('resto_da_consegnare')"
							>
								Da Consegnare €
								<span v-if="sortKey === 'resto_da_consegnare'">
									{{ sortAsc ? "▲" : "▼" }}
								</span>
							</th>
							<th class="border px-4 py-2 w-[150px]">Azioni</th>
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="societa in societaList"
							:key="societa.id_societa"
							:class="{
								'bg-blue-200': selectedSocieta.includes(
									societa.id_societa
								),
							}"
							class="mb-4"
							@click="toggleSocietaSelection(societa.id_societa)"
						>
							<td
								class="border px-4 py-2 w-[50px] cursor-pointer"
							>
								<input
									type="checkbox"
									:checked="
										selectedSocieta.includes(
											societa.id_societa
										)
									"
								/>
							</td>
							<!-- Aggiunta cella posizione -->
							<td class="border px-4 py-2 text-center">
								<span class="font-semibold"
									>{{ societa.posizione_classifica }}°</span
								>
							</td>
							<td class="border px-4 py-2 text-center">
								{{ societa.punteggio_totale }}
							</td>
							<td class="border px-4 py-2 w-[250px]">
								{{ societa.nome_societa }}
							</td>
							<td class="border px-4 py-2 text-center">
								{{ societa.numero_atleti }}
							</td>
							<td class="border px-4 py-2 text-center">
								{{ societa.numero_iscrizioni }}
							</td>
							<td class="border px-4 py-2 text-center">
								{{ societa.numero_iscrizioni_confermate }}
							</td>
							<td class="border px-4 py-2 text-right">
								{{
									typeof societa.importo_dovuto === "number"
										? societa.importo_dovuto.toFixed(2)
										: Number(
												societa.importo_dovuto
										  ).toFixed(2)
								}}
							</td>
							<td class="border px-4 py-2 text-right">
								{{
									typeof societa.pagato === "number"
										? societa.pagato.toFixed(2)
										: Number(societa.pagato).toFixed(2)
								}}
							</td>
							<td class="border px-4 py-2 text-right">
								{{
									typeof societa.resto_consegnato === "number"
										? societa.resto_consegnato.toFixed(2)
										: Number(
												societa.resto_consegnato
										  ).toFixed(2)
								}}
							</td>
							<td
								class="border px-4 py-2 text-right"
								:class="{
									'text-red-600':
										societa.resto_da_consegnare > 0,
								}"
							>
								{{
									typeof societa.resto_da_consegnare ===
									"number"
										? societa.resto_da_consegnare.toFixed(2)
										: Number(
												societa.resto_da_consegnare
										  ).toFixed(2)
								}}
							</td>
							<td class="border px-4 py-2 w-[150px]">
								<div class="h-full">
									<button
										@click="editSocieta(societa)"
										class="text-gray-700 hover:bg-gray-100 p-2 rounded mx-1 hover:text-yellow-500"
									>
										<i class="fas fa-edit"></i>
									</button>
									<button
										@click="
											deleteSocieta(societa.id_societa)
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
		<div
			v-if="formVisible"
			class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50"
		>
			<div
				class="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl overflow-auto max-h-full"
			>
				<h2 class="text-2xl font-bold mb-4">
					{{
						societa.id_societa
							? "Modifica Società"
							: "Aggiungi Società"
					}}
				</h2>
				<form
					@submit.prevent="saveSocieta"
					class="flex flex-wrap gap-4"
				>
					<!-- Campo Nome Società -->
					<div class="w-full">
						<label
							class="block text-sm font-medium text-gray-700 mb-1"
						>
							Nome Società
						</label>
						<input
							v-model="societa.nome_societa"
							placeholder="Inserisci il nome della società"
							class="border p-2 rounded w-full"
						/>
					</div>

					<!-- Campo Importo Pagato -->
					<div class="w-1/2">
						<label
							class="block text-sm font-medium text-gray-700 mb-1"
						>
							Importo Pagato (€)
						</label>
						<input
							v-model.number="societa.pagato"
							placeholder="0.00"
							type="number"
							step="0.01"
							class="border p-2 rounded w-full"
						/>
					</div>

					<!-- Campo Resto Consegnato -->
					<div class="w-1/2">
						<label
							class="block text-sm font-medium text-gray-700 mb-1"
						>
							Resto Consegnato (€)
						</label>
						<input
							v-model.number="societa.resto_consegnato"
							placeholder="0.00"
							type="number"
							step="0.01"
							class="border p-2 rounded w-full"
						/>
					</div>

					<!-- Riepilogo valori calcolati -->
					<div class="grid grid-cols-2 gap-4 w-full">
						<div>
							<label
								class="block text-sm font-medium text-gray-700 mb-1"
							>
								Importo Dovuto
							</label>
							<p class="text-lg font-bold">
								{{ societa.importo_dovuto?.toFixed(2) }} €
							</p>
						</div>
						<div>
							<label
								class="block text-sm font-medium text-gray-700 mb-1"
							>
								Resto da Consegnare
							</label>
							<p
								class="text-lg font-bold"
								:class="{
									'text-red-600':
										societa.resto_da_consegnare > 0,
								}"
							>
								{{ societa.resto_da_consegnare?.toFixed(2) }} €
							</p>
						</div>
					</div>

					<!-- Pulsanti -->
					<div class="w-full flex justify-end gap-4">
						<button
							type="submit"
							class="bg-blue-500 text-white p-2 rounded"
						>
							Salva
						</button>
						<button
							@click="closeForm"
							type="button"
							class="bg-gray-500 text-white p-2 rounded"
						>
							Annulla
						</button>
					</div>
				</form>
			</div>
		</div>
		<div v-if="feedbackMessage" :class="`alert ${feedbackType}`">
			{{ feedbackMessage }}
		</div>
		<LoadingOverlay :show="loading" :message="loadingMessage" />
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useFetch } from "#app"
import LoadingOverlay from "@/components/LoadingOverlay.vue"
import { useSocietaPrint } from "@/composables/prints/useSocietaPrint"

const societa = ref({
	id_societa: null,
	nome_societa: "",
	pagato: 0,
	resto_consegnato: 0,
	importo_dovuto: 0,
	resto_da_consegnare: 0,
	numero_atleti: 0,
	numero_iscrizioni: 0,
	numero_iscrizioni_confermate: 0,
	punteggio_totale: 0,
	posizione_classifica: 0,
})

const formVisible = ref(false)

const { data: societaList, error } = useFetch("/api/societa")

const selectedSocieta = ref([])

const openForm = () => {
	formVisible.value = true
}

const closeForm = () => {
	formVisible.value = false
	societa.value = {
		id_societa: null,
		nome_societa: "",
		pagato: 0,
		resto_consegnato: 0,
		importo_dovuto: 0,
		resto_da_consegnare: 0,
		numero_atleti: 0,
		numero_iscrizioni: 0,
		numero_iscrizioni_confermate: 0,
		punteggio_totale: 0,
		posizione_classifica: 0,
	}
}

const feedbackMessage = ref("")
const feedbackType = ref("")

const saveSocieta = async () => {
	loading.value = true
	loadingMessage.value = "Salvataggio in corso..."
	document.body.style.cursor = "wait"

	try {
		if (societa.value.id_societa) {
			const { data, error } = await useFetch(
				`/api/societa?id=${societa.value.id_societa}`,
				{
					method: "PUT",
					body: { ...societa.value },
				}
			)
			if (error.value) {
				console.error(
					"Errore nel salvataggio della società:",
					error.value
				)
			} else {
				// Ricarica i dati aggiornati da server
				await reloadData()
			}
		} else {
			const { data, error } = await useFetch("/api/societa", {
				method: "POST",
				body: { ...societa.value },
			})
			if (error.value) {
				console.error(
					"Errore nel salvataggio della società:",
					error.value
				)
			} else {
				// Ricarica i dati aggiornati da server
				await reloadData()
			}
		}
		feedbackMessage.value = "Società salvata con successo"
		feedbackType.value = "success"
		closeForm()
	} catch (error) {
		feedbackMessage.value = "Errore durante il salvataggio"
		feedbackType.value = "error"
		console.error("Errore nel salvataggio della società:", error)
	} finally {
		loading.value = false
		document.body.style.cursor = "default"
		setTimeout(() => {
			feedbackMessage.value = ""
		}, 3000)
	}
}

// Aggiungi questa nuova funzione per ricaricare i dati
const reloadData = async () => {
	const { data } = await useFetch("/api/societa")
	if (data.value) {
		societaList.value = data.value
	}
}

const editSocieta = (societaToEdit) => {
	// Converti esplicitamente i valori numerici
	societa.value = {
		...societaToEdit,
		pagato: Number(societaToEdit.pagato) || 0,
		resto_consegnato: Number(societaToEdit.resto_consegnato) || 0,
		importo_dovuto: Number(societaToEdit.importo_dovuto) || 0,
		resto_da_consegnare: Number(societaToEdit.resto_da_consegnare) || 0,
		numero_atleti: Number(societaToEdit.numero_atleti) || 0,
		numero_iscrizioni: Number(societaToEdit.numero_iscrizioni) || 0,
		numero_iscrizioni_confermate:
			Number(societaToEdit.numero_iscrizioni_confermate) || 0,
		punteggio_totale: Number(societaToEdit.punteggio_totale) || 0,
		posizione_classifica: Number(societaToEdit.posizione_classifica) || 0,
	}
	formVisible.value = true
}

const deleteSocieta = async (id_societa) => {
	loading.value = true
	loadingMessage.value = "Eliminazione in corso..."
	document.body.style.cursor = "wait"

	try {
		const { error } = await useFetch(`/api/societa?id=${id_societa}`, {
			method: "DELETE",
		})
		if (error.value) {
			console.error(
				"Errore nella cancellazione della società:",
				error.value
			)
		} else {
			societaList.value = societaList.value.filter(
				(s) => s.id_societa !== id_societa
			)
		}
		feedbackMessage.value = "Società eliminata con successo"
		feedbackType.value = "success"
	} catch (error) {
		feedbackMessage.value = "Errore durante l'eliminazione"
		feedbackType.value = "error"
		console.error("Errore nella cancellazione della società:", error)
	} finally {
		loading.value = false
		document.body.style.cursor = "default"
		setTimeout(() => {
			feedbackMessage.value = ""
		}, 3000)
	}
}

const toggleSocietaSelection = (id_societa) => {
	const index = selectedSocieta.value.indexOf(id_societa)
	if (index === -1) {
		selectedSocieta.value.push(id_societa)
	} else {
		selectedSocieta.value.splice(index, 1)
	}
}

const loading = ref(false)
const loadingMessage = ref("")

const deleteSelectedSocieta = async () => {
	if (selectedSocieta.value.length === 0) return

	loading.value = true
	loadingMessage.value = "Eliminazione società in corso..."
	document.body.style.cursor = "wait"

	try {
		for (const id_societa of selectedSocieta.value) {
			await deleteSocieta(id_societa)
		}
		feedbackMessage.value = "Società eliminate con successo"
		feedbackType.value = "success"
	} catch (error) {
		feedbackMessage.value = "Errore durante l'eliminazione"
		feedbackType.value = "error"
	} finally {
		loading.value = false
		document.body.style.cursor = "default"
		selectedSocieta.value = []
		setTimeout(() => {
			feedbackMessage.value = ""
		}, 3000)
	}
}

const sortKey = ref("")
const sortAsc = ref(true)

const sortTable = (key) => {
	if (sortKey.value === key) {
		sortAsc.value = !sortAsc.value
	} else {
		sortKey.value = key
		sortAsc.value = true
	}
	societaList.value.sort((a, b) => {
		// Gestione numerica per tutte le colonne numeriche
		if (
			[
				"numero_atleti",
				"punteggio_totale",
				"posizione_classifica",
				"numero_iscrizioni",
				"numero_iscrizioni_confermate",
			].includes(key)
		) {
			return sortAsc.value ? a[key] - b[key] : b[key] - a[key]
		}
		// Gestione alfabetica per il nome
		if (a[key] < b[key]) return sortAsc.value ? -1 : 1
		if (a[key] > b[key]) return sortAsc.value ? 1 : -1
		return 0
	})
}

const toggleAllSelection = () => {
	if (selectedSocieta.value.length === societaList.value.length) {
		selectedSocieta.value = []
	} else {
		selectedSocieta.value = societaList.value.map(
			(societa) => societa.id_societa
		)
	}
}

const printClassifica = () => {
	const { stampaClassifica } = useSocietaPrint()
	stampaClassifica(societaList.value)
}

onMounted(() => {
	// Carica i dati delle società
})
</script>

<style scoped>
.main-container {
	min-height: calc(100vh - 4rem);
}

.alert {
	position: fixed;
	bottom: 20px;
	right: 20px;
	padding: 10px 20px;
	border-radius: 5px;
	z-index: 1000;
	animation: slideIn 0.5s ease-in-out;
}

@keyframes slideIn {
	from {
		transform: translateX(100%);
		opacity: 0;
	}
	to {
		transform: translateX(0);
		opacity: 1;
	}
}

.alert.success {
	background-color: #4caf50;
	color: white;
}

.alert.error {
	background-color: #f44336;
	color: white;
}
</style>
