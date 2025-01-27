<template>
	<div class="bg-gray-100">
		<!-- Toolbar sotto la navbar -->
		<div
			class="flex items-center justify-between mx-auto px-24 w-full py-4 bg-gray-200 fixed top-16 z-10"
		>
			<h1 class="text-2xl font-bold">Atleti</h1>
			<div>
				<button
					@click="openForm"
					class="text-gray-700 hover:text-green-500 px-2 rounded mr-4 hover:bg-gray-200"
					title="Aggiungi Atleta"
				>
					<i class="fas fa-plus"></i>
				</button>
				<button
					@click="deleteSelectedAtleti"
					class="text-gray-700 hover:text-red-500 px-2 rounded mr-4 hover:bg-gray-200"
					title="Elimina Selezionati"
				>
					<i class="fas fa-trash"></i>
				</button>
				<button
					@click="copySelectedAtleti"
					class="text-gray-700 hover:text-blue-500 px-2 rounded hover:bg-gray-200"
					title="Copia Selezionati"
				>
					<i class="fas fa-copy"></i>
				</button>
			</div>
		</div>

		<!-- Form dei filtri -->
		<div class="bg-white py-4 px-24 fixed top-32 w-full z-10 border-b">
			<div class="flex flex-wrap gap-4">
				<input
					v-model="filters.search"
					placeholder="Cerca..."
					class="border p-2 rounded"
					@input="applyFilters"
				/>
				<select
					v-model="filters.societa"
					class="border p-2 rounded"
					@change="applyFilters"
				>
					<option value="">Tutte le società</option>
					<option
						v-for="s in societa"
						:key="s.id_societa"
						:value="s.id_societa"
					>
						{{ s.nome_societa }}
					</option>
				</select>
				<select
					v-model="filters.sesso"
					class="border p-2 rounded"
					@change="applyFilters"
				>
					<option value="">Tutti</option>
					<option value="M">Maschile</option>
					<option value="F">Femminile</option>
				</select>
				<select
					v-model="filters.cintura"
					class="border p-2 rounded"
					@change="applyFilters"
				>
					<option value="">Tutte le cinture</option>
					<option
						v-for="c in cinture"
						:key="c.id_cintura"
						:value="c.id_cintura"
					>
						{{ c.colore }}
					</option>
				</select>
				<button
					@click="resetFilters"
					class="bg-gray-200 p-2 rounded hover:bg-gray-300"
				>
					Reset filtri
				</button>
			</div>
		</div>

		<div class="bg-gray-100 pt-40 z-10 main-container">
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
							<th
								class="border px-4 py-2 cursor-pointer"
								@click="sortTable('id_atleta')"
							>
								N.
								<span v-if="sortKey === 'id_atleta'">
									{{ sortAsc ? "▲" : "▼" }}
								</span>
							</th>
							<th
								class="border px-4 py-2 cursor-pointer"
								@click="sortTable('cognome')"
							>
								Cognome
								<span v-if="sortKey === 'cognome'">
									{{ sortAsc ? "▲" : "▼" }}
								</span>
							</th>
							<th
								class="border px-4 py-2 cursor-pointer"
								@click="sortTable('nome')"
							>
								Nome
								<span v-if="sortKey === 'nome'">
									{{ sortAsc ? "▲" : "▼" }}
								</span>
							</th>
							<th
								class="border px-4 py-2 cursor-pointer"
								@click="sortTable('sesso')"
							>
								Sesso
								<span v-if="sortKey === 'sesso'">
									{{ sortAsc ? "▲" : "▼" }}
								</span>
							</th>
							<th
								class="border px-4 py-2 cursor-pointer"
								@click="sortTable('anno_nascita')"
							>
								Anno Nascita
								<span v-if="sortKey === 'anno_nascita'">
									{{ sortAsc ? "▲" : "▼" }}
								</span>
							</th>
							<th
								class="border px-4 py-2 cursor-pointer"
								@click="sortTable('cintura')"
							>
								Cintura
								<span v-if="sortKey === 'cintura'">
									{{ sortAsc ? "▲" : "▼" }}
								</span>
							</th>
							<th
								class="border px-4 py-2 cursor-pointer"
								@click="sortTable('dan')"
							>
								Dan
								<span v-if="sortKey === 'dan'">
									{{ sortAsc ? "▲" : "▼" }}
								</span>
							</th>
							<th
								class="border px-4 py-2 cursor-pointer"
								@click="sortTable('peso_kg')"
							>
								Peso
								<span v-if="sortKey === 'peso_kg'">
									{{ sortAsc ? "▲" : "▼" }}
								</span>
							</th>
							<th
								class="border px-4 py-2 cursor-pointer"
								@click="sortTable('nome_societa')"
							>
								Società
								<span v-if="sortKey === 'nome_societa'">
									{{ sortAsc ? "▲" : "▼" }}
								</span>
							</th>
							<th class="border px-4 py-2">Azioni</th>
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="atleta in atletiFiltrati"
							:key="atleta.id_atleta"
							:class="{
								'bg-blue-200': selectedAtleti.includes(
									atleta.id_atleta
								),
							}"
							class="mb-4"
							@click="toggleAtletaSelection(atleta.id_atleta)"
						>
							<td class="border px-4 py-2 cursor-pointer">
								<input
									type="checkbox"
									:checked="
										selectedAtleti.includes(
											atleta.id_atleta
										)
									"
								/>
							</td>
							<td class="border px-4 py-2">
								{{ atleta.id_atleta }}
							</td>
							<td class="border px-4 py-2">
								{{ atleta.cognome }}
							</td>
							<td class="border px-4 py-2">
								{{ atleta.nome }}
							</td>
							<td class="border px-4 py-2 text-center">
								{{ atleta.sesso }}
							</td>
							<td class="border px-4 py-2">
								{{ atleta.anno_nascita }}
							</td>
							<td class="border px-4 py-2">
								{{ atleta.cintura }}
							</td>
							<td class="border px-4 py-2">
								{{ atleta.dan }}
							</td>
							<td class="border px-4 py-2">
								{{ atleta.peso_kg }}
							</td>
							<td class="border px-4 py-2">
								{{ atleta.nome_societa }}
							</td>
							<td class="border px-4 py-2">
								<div class="flex items-center">
									<button
										@click.stop="editAtleta(atleta)"
										class="text-gray-700 hover:bg-gray-100 p-2 rounded mx-1 hover:text-yellow-500"
									>
										<i class="fas fa-edit"></i>
									</button>
									<button
										@click.stop="
											deleteAtleta(atleta.id_atleta)
										"
										class="text-gray-700 hover:bg-gray-100 p-2 rounded mx-1 hover:text-red-500"
									>
										<i class="fas fa-trash"></i>
									</button>
									<button
										@click.stop="copyAtleta(atleta)"
										class="text-gray-700 hover:bg-gray-100 p-2 rounded mx-1 hover:text-blue-500"
									>
										<i class="fas fa-copy"></i>
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
						atleta.id_atleta ? "Modifica Atleta" : "Aggiungi Atleta"
					}}
				</h2>
				<form @submit.prevent="saveAtleta" class="flex flex-wrap gap-4">
					<input
						v-model="atleta.cognome"
						placeholder="Cognome"
						class="border p-2 rounded w-full"
					/>
					<input
						v-model="atleta.nome"
						placeholder="Nome"
						class="border p-2 rounded w-full"
					/>
					<select
						v-model="atleta.sesso"
						class="border p-2 rounded w-full"
					>
						<option value="M">Maschile</option>
						<option value="F">Femminile</option>
					</select>
					<input
						v-model="atleta.anno_nascita"
						type="number"
						placeholder="Anno Nascita"
						class="border p-2 rounded w-full"
					/>
					<select
						v-model="atleta.cintura_id"
						class="border p-2 rounded w-full"
					>
						<option
							v-for="cintura in cinture"
							:key="cintura.id_cintura"
							:value="cintura.id_cintura"
						>
							{{ cintura.colore }}
						</option>
					</select>
					<input
						v-model="atleta.dan"
						type="number"
						placeholder="Dan"
						class="border p-2 rounded w-full"
					/>
					<input
						v-model="atleta.peso_kg"
						type="number"
						placeholder="Peso"
						class="border p-2 rounded w-full"
					/>
					<select
						v-model="atleta.id_societa"
						class="border p-2 rounded w-full"
					>
						<option
							v-for="societa in societa"
							:key="societa.id_societa"
							:value="societa.id_societa"
						>
							{{ societa.nome_societa }}
						</option>
					</select>
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
import { ref, onMounted, computed } from "vue"
import { useFetch } from "#app"
import LoadingOverlay from "@/components/LoadingOverlay.vue"

const atleta = ref({
	id_atleta: null,
	cognome: "",
	nome: "",
	sesso: "",
	anno_nascita: null,
	cintura_id: null,
	dan: null,
	peso_kg: null,
	id_societa: null,
})

const formVisible = ref(false)

const selectedAtleti = ref([])
const atleti = ref([]) // Spostato qui per chiarezza

// Rimuovi queste righe che usano useFetch direttamente
// const { data: cinture } = useFetch("/api/cinture")
// const { data: societa } = useFetch("/api/societa")

// Aggiungi queste refs
const cinture = ref([])
const societa = ref([])

const feedbackMessage = ref("")
const feedbackType = ref("")

const loading = ref(false)
const loadingMessage = ref("")

// Aggiungi la definizione dei filtri
const filters = ref({
	search: "",
	societa: "",
	sesso: "",
	cintura: "",
})

// Aggiungi la computed property per gli atleti filtrati
const atletiFiltrati = computed(() => {
	if (!atleti.value) return []

	return atleti.value.filter((atleta) => {
		// Filtro di ricerca testuale
		if (filters.value.search) {
			const searchTerm = filters.value.search.toLowerCase()
			const searchFields = [
				atleta.cognome,
				atleta.nome,
				atleta.nome_societa,
			].map((field) => (field || "").toLowerCase())

			if (!searchFields.some((field) => field.includes(searchTerm))) {
				return false
			}
		}

		// Filtro società
		if (
			filters.value.societa &&
			atleta.id_societa !== parseInt(filters.value.societa)
		) {
			return false
		}

		// Filtro sesso
		if (filters.value.sesso && atleta.sesso !== filters.value.sesso) {
			return false
		}

		// Filtro cintura
		if (
			filters.value.cintura &&
			atleta.cintura_id !== parseInt(filters.value.cintura)
		) {
			return false
		}

		return true
	})
})

// Aggiungi le funzioni per gestire i filtri
const applyFilters = () => {
	selectedAtleti.value = []
}

const resetFilters = () => {
	filters.value = {
		search: "",
		societa: "",
		sesso: "",
		cintura: "",
	}
	applyFilters()
}

const openForm = () => {
	formVisible.value = true
}

const closeForm = () => {
	formVisible.value = false
	atleta.value = {
		id_atleta: null,
		cognome: "",
		nome: "",
		sesso: "",
		anno_nascita: null,
		cintura_id: null,
		dan: null,
		peso_kg: null,
		id_societa: null,
	}
}

const saveAtleta = async () => {
	try {
		if (atleta.value.id_atleta) {
			const { data, error } = await useFetch(
				`/api/atleti?id=${atleta.value.id_atleta}`,
				{
					method: "PUT",
					body: { ...atleta.value },
				}
			)
			if (error.value) {
				console.error(
					"Errore nel salvataggio dell'atleta:",
					error.value
				)
			} else {
				const index = atleti.value.findIndex(
					(a) => a.id_atleta === atleta.value.id_atleta
				)
				atleti.value[index] = { ...data.value }
				// Aggiorna la cintura e la società
				atleti.value[index].cintura = cinture.value.find(
					(c) => c.id_cintura === atleta.value.cintura_id
				)?.colore
				atleti.value[index].nome_societa = societa.value.find(
					(s) => s.id_societa === atleta.value.id_societa
				)?.nome_societa
			}
		} else {
			const { data, error } = await useFetch("/api/atleti", {
				method: "POST",
				body: { ...atleta.value },
			})
			if (error.value) {
				console.error(
					"Errore nel salvataggio dell'atleta:",
					error.value
				)
			} else {
				// Aggiorna la cintura e la società
				data.value.cintura = cinture.value.find(
					(c) => c.id_cintura === atleta.value.cintura_id
				)?.colore
				data.value.nome_societa = societa.value.find(
					(s) => s.id_societa === atleta.value.id_societa
				)?.nome_societa
				atleti.value.push(data.value)
			}
		}
		closeForm()
	} catch (error) {
		console.error("Errore nel salvataggio dell'atleta:", error)
	}
}

const editAtleta = (atletaToEdit) => {
	atleta.value = { ...atletaToEdit }
	formVisible.value = true
}

const deleteAtleta = async (id_atleta) => {
	try {
		const { error } = await useFetch(`/api/atleti?id=${id_atleta}`, {
			method: "DELETE",
		})
		if (error.value) {
			console.error(
				"Errore nella cancellazione dell'atleta:",
				error.value
			)
		} else {
			atleti.value = atleti.value.filter((a) => a.id_atleta !== id_atleta)
		}
	} catch (error) {
		console.error("Errore nella cancellazione dell'atleta:", error)
	}
}

const toggleAtletaSelection = (id_atleta) => {
	const index = selectedAtleti.value.indexOf(id_atleta)
	if (index === -1) {
		selectedAtleti.value.push(id_atleta)
	} else {
		selectedAtleti.value.splice(index, 1)
	}
}

const deleteSelectedAtleti = async () => {
	if (selectedAtleti.value.length === 0) return

	loading.value = true
	loadingMessage.value = "Eliminazione atleti in corso..."
	document.body.style.cursor = "wait"

	try {
		for (const id_atleta of selectedAtleti.value) {
			await deleteAtleta(id_atleta)
		}
		feedbackMessage.value = "Atleti eliminati con successo"
		feedbackType.value = "success"
	} catch (error) {
		feedbackMessage.value = "Errore durante l'eliminazione"
		feedbackType.value = "error"
	} finally {
		loading.value = false
		document.body.style.cursor = "default"
		selectedAtleti.value = []
		setTimeout(() => {
			feedbackMessage.value = ""
		}, 3000)
	}
}

const copyAtleta = async (atleta) => {
	const newAtleta = { ...atleta, id_atleta: null }
	if (!newAtleta.id_societa || !newAtleta.cintura_id) {
		console.error(
			"Errore: id_societa e cintura_id non possono essere nulli"
		)
		return
	}
	try {
		const { data, error } = await useFetch("/api/atleti", {
			method: "POST",
			body: { ...newAtleta },
		})
		if (error.value) {
			console.error("Errore nella copia dell'atleta:", error.value)
		} else {
			atleti.value.push(data.value)
		}
	} catch (error) {
		console.error("Errore nella copia dell'atleta:", error)
	}
}

const copySelectedAtleti = async () => {
	if (selectedAtleti.value.length === 0) return

	loading.value = true
	loadingMessage.value = "Copia atleti in corso..."
	document.body.style.cursor = "wait"

	try {
		for (const id_atleta of selectedAtleti.value) {
			const atleta = atleti.value.find((a) => a.id_atleta === id_atleta)
			await copyAtleta(atleta)
		}
		feedbackMessage.value = "Atleti copiati con successo"
		feedbackType.value = "success"
	} catch (error) {
		feedbackMessage.value = "Errore durante la copia"
		feedbackType.value = "error"
	} finally {
		loading.value = false
		document.body.style.cursor = "default"
		selectedAtleti.value = []
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
	atleti.value.sort((a, b) => {
		if (a[key] < b[key]) return sortAsc.value ? -1 : 1
		if (a[key] > b[key]) return sortAsc.value ? 1 : -1
		return 0
	})
}

const toggleAllSelection = () => {
	if (selectedAtleti.value.length === atleti.value.length) {
		selectedAtleti.value = []
	} else {
		selectedAtleti.value = atleti.value.map((atleta) => atleta.id_atleta)
	}
}

const refreshAtleti = async () => {
	loading.value = true
	loadingMessage.value = "Caricamento dati in corso..."
	try {
		// Carica i dati usando async/await in modo più esplicito
		const atletiResponse = await $fetch("/api/atleti")
		const cintureResponse = await $fetch("/api/cinture")
		const societaResponse = await $fetch("/api/societa")

		// Verifica e assegna i dati
		if (!atletiResponse) {
			throw new Error("Nessun dato ricevuto per gli atleti")
		}
		atleti.value = atletiResponse

		if (!cintureResponse) {
			throw new Error("Nessun dato ricevuto per le cinture")
		}
		cinture.value = cintureResponse

		if (!societaResponse) {
			throw new Error("Nessun dato ricevuto per le società")
		}
		societa.value = societaResponse

		console.log("Dati caricati:", {
			atleti: atleti.value.length,
			cinture: cinture.value.length,
			societa: societa.value.length,
		})
	} catch (error) {
		console.error("Errore nel caricamento dei dati:", error)
		feedbackMessage.value =
			error.message || "Errore nel caricamento dei dati"
		feedbackType.value = "error"
	} finally {
		loading.value = false
		loadingMessage.value = ""
	}
}

// Assicuriamoci che il caricamento avvenga all'mount del componente
onMounted(() => {
	refreshAtleti()
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
