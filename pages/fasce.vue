<template>
	<div class="bg-gray-100">
		<!-- Toolbar sotto la navbar -->
		<div
			class="flex items-center justify-between mx-auto px-24 w-full py-4 bg-gray-200 fixed top-16 z-10"
		>
			<h1 class="text-2xl font-bold">Fasce d'Età</h1>
			<div>
				<button
					@click="openForm"
					class="text-gray-700 hover:text-green-500 px-2 rounded mr-4 hover:bg-gray-200"
					title="Aggiungi Fascia"
				>
					<i class="fas fa-plus"></i>
				</button>
				<button
					@click="deleteSelectedAgeRanges"
					class="text-gray-700 hover:text-red-500 px-2 rounded mr-4 hover:bg-gray-200"
					title="Elimina Selezionate"
				>
					<i class="fas fa-trash"></i>
				</button>
				<button
					@click="copySelectedAgeRanges"
					class="text-gray-700 hover:text-blue-500 px-2 rounded mr-4 hover:bg-gray-200"
					title="Copia Selezionate"
				>
					<i class="fas fa-copy"></i>
				</button>
			</div>
		</div>
		<div class="bg-gray-100 pt-16 z-10 main-container">
			<div class="container mx-auto py-8 px-24 max-w-full z-10">
				<div class="overflow-x-auto">
					<table class="bg-white z-10">
						<thead class="bg-white z-10">
							<tr>
								<th class="border px-4 py-2 w-[50px]">
									<input
										type="checkbox"
										@click="toggleAllSelection"
									/>
								</th>
								<th
									class="border px-4 py-2 w-[250px] cursor-pointer"
									@click="sortTable('descrizione')"
								>
									Nome Fascia d'Età
									<span v-if="sortKey === 'descrizione'">{{
										sortAsc ? "▲" : "▼"
									}}</span>
								</th>
								<th
									class="border px-4 py-2 w-[150px] cursor-pointer"
									@click="sortTable('anno_nascita_min')"
								>
									Anno Minimo
									<span
										v-if="sortKey === 'anno_nascita_min'"
										>{{ sortAsc ? "▲" : "▼" }}</span
									>
								</th>
								<th
									class="border px-4 py-2 w-[150px] cursor-pointer"
									@click="sortTable('anno_nascita_max')"
								>
									Anno Massimo
									<span
										v-if="sortKey === 'anno_nascita_max'"
										>{{ sortAsc ? "▲" : "▼" }}</span
									>
								</th>
								<th class="border px-4 py-2 w-[150px]">
									Azioni
								</th>
							</tr>
						</thead>
						<tbody>
							<tr
								v-for="ar in ageRanges"
								:key="ar.id_fascia"
								:class="{
									'bg-blue-200': selectedAgeRanges.includes(
										ar.id_fascia
									),
								}"
								class="mb-4"
								@click="toggleAgeRangeSelection(ar.id_fascia)"
							>
								<td
									class="border px-4 py-2 w-[50px] cursor-pointer"
								>
									<input
										type="checkbox"
										:checked="
											selectedAgeRanges.includes(
												ar.id_fascia
											)
										"
									/>
								</td>
								<td class="border px-4 py-2 w-[250px]">
									{{ ar.descrizione }}
								</td>
								<td class="border px-4 py-2 w-[150px]">
									{{ ar.anno_nascita_min }}
								</td>
								<td class="border px-4 py-2 w-[150px]">
									{{ ar.anno_nascita_max }}
								</td>
								<td class="border px-4 py-2 w-[150px]">
									<div class="h-full">
										<button
											@click="editAgeRange(ar)"
											class="text-gray-700 hover:bg-gray-100 p-2 rounded mx-1 hover:text-yellow-500"
										>
											<i class="fas fa-edit"></i>
										</button>
										<button
											@click="
												deleteAgeRange(ar.id_fascia)
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
						ageRange.id_fascia
							? "Modifica Fascia"
							: "Aggiungi Fascia"
					}}
				</h2>
				<form
					@submit.prevent="saveAgeRange"
					class="flex flex-wrap gap-4"
				>
					<input
						v-model="ageRange.descrizione"
						placeholder="Nome Fascia d'Età"
						class="border p-2 rounded w-full"
					/>
					<div class="w-full flex flex-col gap-2">
						<div class="flex items-center gap-2">
							<input
								type="checkbox"
								v-model="appendYearsToTitle"
								id="appendYears"
								class="form-checkbox"
							/>
							<label for="appendYears">
								Includi anni nel titolo
							</label>
						</div>
						<div
							v-if="appendYearsToTitle && ageRange.descrizione"
							class="text-sm text-gray-600 italic"
						>
							Anteprima: {{ previewTitle }}
						</div>
					</div>
					<input
						v-model="ageRange.anno_nascita_min"
						type="number"
						placeholder="Anno Minimo"
						class="border p-2 rounded w-full"
					/>
					<input
						v-model="ageRange.anno_nascita_max"
						type="number"
						placeholder="Anno Massimo"
						class="border p-2 rounded w-full"
					/>
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
import { ref, computed } from "vue"
import { useFetch } from "#app"

const ageRange = ref({
	id_fascia: null,
	descrizione: "",
	anno_nascita_min: null,
	anno_nascita_max: null,
})

const formVisible = ref(false)

// Effettua il fetch dei dati direttamente nello setup
const { data: ageRanges, error } = useFetch("/api/fasce-eta")

const loading = ref(false)
const loadingMessage = ref("")
const feedbackMessage = ref("")
const feedbackType = ref("")

const appendYearsToTitle = ref(true)

// Aggiungi questa computed property
const previewTitle = computed(() => {
	if (appendYearsToTitle.value && ageRange.value.descrizione) {
		if (
			ageRange.value.anno_nascita_min &&
			ageRange.value.anno_nascita_max
		) {
			return `${ageRange.value.descrizione} (${ageRange.value.anno_nascita_min}-${ageRange.value.anno_nascita_max})`
		} else {
			return `${ageRange.value.descrizione} (...-...)`
		}
	}
	return ageRange.value.descrizione
})

// Modifica la funzione saveAgeRange per utilizzare previewTitle
const saveAgeRange = async () => {
	loading.value = true
	loadingMessage.value = "Salvataggio in corso..."
	document.body.style.cursor = "wait"

	try {
		const dataToSave = {
			...ageRange.value,
			descrizione: appendYearsToTitle.value
				? previewTitle.value
				: ageRange.value.descrizione,
		}

		if (ageRange.value.id_fascia) {
			const { error } = await useFetch(
				`/api/fasce-eta?id=${ageRange.value.id_fascia}`,
				{
					method: "PUT",
					body: dataToSave,
				}
			)
			if (error.value) {
				console.error(
					"Errore nel salvataggio della fascia d'età:",
					error.value
				)
				feedbackMessage.value = "Errore durante il salvataggio"
				feedbackType.value = "error"
			} else {
				const index = ageRanges.value.findIndex(
					(ar) => ar.id_fascia === ageRange.value.id_fascia
				)
				ageRanges.value[index] = { ...ageRange.value }
				feedbackMessage.value = "Fascia salvata con successo"
				feedbackType.value = "success"
			}
		} else {
			const { data, error } = await useFetch("/api/fasce-eta", {
				method: "POST",
				body: dataToSave,
			})
			if (error.value) {
				console.error(
					"Errore nel salvataggio della fascia d'età:",
					error.value
				)
				feedbackMessage.value = "Errore durante il salvataggio"
				feedbackType.value = "error"
			} else {
				ageRanges.value.push(data.value)
				feedbackMessage.value = "Fascia salvata con successo"
				feedbackType.value = "success"
			}
		}
		closeForm()
	} catch (error) {
		console.error("Errore nel salvataggio della fascia d'età:", error)
		feedbackMessage.value = "Errore durante il salvataggio"
		feedbackType.value = "error"
	} finally {
		loading.value = false
		document.body.style.cursor = "default"
		setTimeout(() => {
			feedbackMessage.value = ""
		}, 3000)
	}
}

const editAgeRange = (ar) => {
	ageRange.value = { ...ar }
	formVisible.value = true
}

const deleteAgeRange = async (id_fascia) => {
	loading.value = true
	loadingMessage.value = "Eliminazione in corso..."
	document.body.style.cursor = "wait"

	try {
		const { error } = await useFetch(`/api/fasce-eta?id=${id_fascia}`, {
			method: "DELETE",
		})
		if (error.value) {
			console.error(
				"Errore nella cancellazione della fascia d'età:",
				error.value
			)
			feedbackMessage.value = "Errore durante l'eliminazione"
			feedbackType.value = "error"
		} else {
			ageRanges.value = ageRanges.value.filter(
				(ar) => ar.id_fascia !== id_fascia
			)
			feedbackMessage.value = "Fascia eliminata con successo"
			feedbackType.value = "success"
		}
	} catch (error) {
		console.error("Errore nella cancellazione della fascia d'età:", error)
		feedbackMessage.value = "Errore durante l'eliminazione"
		feedbackType.value = "error"
	} finally {
		loading.value = false
		document.body.style.cursor = "default"
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
	ageRanges.value.sort((a, b) => {
		if (a[key] < b[key]) return sortAsc.value ? -1 : 1
		if (a[key] > b[key]) return sortAsc.value ? 1 : -1
		return 0
	})
}

const selectedAgeRanges = ref([])

const toggleAgeRangeSelection = (id_fascia) => {
	const index = selectedAgeRanges.value.indexOf(id_fascia)
	if (index === -1) {
		selectedAgeRanges.value.push(id_fascia)
	} else {
		selectedAgeRanges.value.splice(index, 1)
	}
}

const deleteSelectedAgeRanges = async () => {
	for (const id_fascia of selectedAgeRanges.value) {
		await deleteAgeRange(id_fascia)
	}
	selectedAgeRanges.value = []
}

const copySelectedAgeRanges = () => {
	const selected = ageRanges.value.filter((ar) =>
		selectedAgeRanges.value.includes(ar.id_fascia)
	)
	navigator.clipboard.writeText(JSON.stringify(selected))
	alert("Fasce d'età copiate negli appunti!")
}

const openForm = () => {
	formVisible.value = true
}

const closeForm = () => {
	formVisible.value = false
	ageRange.value = {
		id_fascia: null,
		descrizione: "",
		anno_nascita_min: null,
		anno_nascita_max: null,
	}
}

const toggleAllSelection = () => {
	if (selectedAgeRanges.value.length === ageRanges.value.length) {
		selectedAgeRanges.value = []
	} else {
		selectedAgeRanges.value = ageRanges.value.map(
			(ageRange) => ageRange.id_fascia
		)
	}
}
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
