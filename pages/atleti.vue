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
							v-for="atletaRow in atletiFiltrati"
							:key="atletaRow.id_atleta || 0"
							:class="{
								'transition-all duration-200': true,
								'bg-blue-200 hover:bg-blue-300':
									selectedAtleti.includes(
										atletaRow.id_atleta || 0
									),
								'bg-gray-100 hover:bg-gray-200':
									dragTarget === atletaRow.id_atleta,
								'bg-white hover:bg-gray-200':
									!selectedAtleti.includes(
										atletaRow.id_atleta || 0
									) && dragTarget !== atletaRow.id_atleta,
							}"
							class="mb-4"
							@click="
								atletaRow.id_atleta &&
									toggleAtletaSelection(atletaRow.id_atleta)
							"
							draggable="true"
							@dragstart="onDragStart(convertToAtleta(atletaRow))"
							@dragover.prevent="
								onDragOver(convertToAtleta(atletaRow))
							"
							@dragleave="onDragLeave(convertToAtleta(atletaRow))"
							@drop="onDrop(convertToAtleta(atletaRow))"
						>
							<td class="border px-4 py-2 cursor-pointer">
								<input
									type="checkbox"
									:checked="
										selectedAtleti.includes(
											atletaRow.id_atleta || 0
										)
									"
								/>
							</td>
							<td class="border px-4 py-2">
								{{ atletaRow.id_atleta }}
							</td>
							<td class="border px-4 py-2">
								{{ atletaRow.cognome }}
							</td>
							<td class="border px-4 py-2">
								{{ atletaRow.nome }}
							</td>
							<td class="border px-4 py-2 text-center">
								{{ atletaRow.sesso }}
							</td>
							<td class="border px-4 py-2">
								{{ atletaRow.anno_nascita }}
							</td>
							<td class="border px-4 py-2">
								{{ atletaRow.cintura }}
							</td>
							<td class="border px-4 py-2">
								{{ atletaRow.dan }}
							</td>
							<td class="border px-4 py-2">
								{{ atletaRow.peso_kg }}
							</td>
							<td class="border px-4 py-2">
								{{ atletaRow.nome_societa }}
							</td>
							<td class="border px-4 py-2">
								<div class="flex items-center">
									<button
										@click.stop="editAtleta(atletaRow)"
										class="text-gray-700 hover:bg-gray-100 p-2 rounded mx-1 hover:text-yellow-500"
									>
										<i class="fas fa-edit"></i>
									</button>
									<button
										@click.stop="
											atletaRow.id_atleta &&
												deleteAtleta(
													atletaRow.id_atleta
												)
										"
										class="text-gray-700 hover:bg-gray-100 p-2 rounded mx-1 hover:text-red-500"
									>
										<i class="fas fa-trash"></i>
									</button>
									<button
										@click.stop="copyAtleta(atletaRow)"
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
		<AtletaFormModal
			v-if="formVisible"
			:atleta="atleta"
			:cinture="cinture"
			:societa="societa"
			@close="closeForm"
			@save="saveAtleta"
		/>
		<div v-if="feedbackMessage" :class="`alert ${feedbackType}`">
			{{ feedbackMessage }}
		</div>
		<LoadingOverlay :show="loading" :message="loadingMessage" />
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { useFetch } from "nuxt/app"
import LoadingOverlay from "@/components/LoadingOverlay.vue"
import type {
	AtletaRow,
	CinturaRow,
	SocietaRow,
	MySQLError,
	Atleta, // Importa il tipo Atleta
	Cintura,
	Societa,
} from "~/types/global"
import AtletaFormModal from "../components/AtletaFormModal.vue"

// Cambia il tipo di atleta a Atleta
const atleta = ref<Atleta>({
	id_atleta: undefined,
	cognome: "",
	nome: "",
	sesso: undefined,
	anno_nascita: undefined,
	cintura_id: undefined,
	dan: undefined,
	peso_kg: undefined,
	id_societa: undefined,
	cintura: {
		id_cintura: undefined,
		colore: "",
		kyu: undefined,
	},
	societa: {
		id_societa: undefined,
		nome_societa: "",
		pagato: undefined,
		resto_consegnato: undefined,
	},
})

const formVisible = ref(false)
const dragTarget = ref<number | undefined>(undefined)
const loading = ref(false)
const loadingMessage = ref("")
const feedbackMessage = ref("")
const feedbackType = ref<"success" | "error">("success")

const { data: atleti } = await useFetch<AtletaRow[]>("/api/atleti")
const { data: cinture } = await useFetch<CinturaRow[]>("/api/cinture")
const { data: societa } = await useFetch<SocietaRow[]>("/api/societa")

const selectedAtleti = ref<number[]>([])

// Add drag and drop handlers
let draggedAtleta: Atleta | null = null

const onDragStart = (atleta: Atleta) => {
	draggedAtleta = atleta
}

const onDragOver = (atleta: Atleta) => {
	dragTarget.value = atleta.id_atleta
}

const onDragLeave = (atleta: Atleta) => {
	if (dragTarget.value === atleta.id_atleta) {
		dragTarget.value = undefined
	}
}

const onDrop = async (targetAtleta: Atleta) => {
	dragTarget.value = undefined
	if (draggedAtleta && draggedAtleta.id_atleta !== targetAtleta.id_atleta) {
		const tempOrder = draggedAtleta.id_atleta
		draggedAtleta.id_atleta = targetAtleta.id_atleta
		targetAtleta.id_atleta = tempOrder

		// Aggiorna solo il campo id_atleta nel backend
		await useFetch(`/api/atleti`, {
			method: "PUT",
			query: { id: draggedAtleta.id_atleta },
			body: { id_atleta: draggedAtleta.id_atleta },
		})
		await useFetch(`/api/atleti`, {
			method: "PUT",
			query: { id: targetAtleta.id_atleta },
			body: { id_atleta: targetAtleta.id_atleta },
		})

		// Ricarica tutti i dati necessari
		const [{ data: atletiAggiornati }] = await Promise.all([
			useFetch<AtletaRow[]>("/api/atleti"),
		])

		// Aggiorna tutti i riferimenti
		atleti.value = atletiAggiornati.value

		// Riapplica l'ordinamento corrente
		if (sortKey.value) {
			atleti.value.sort((a, b) => {
				if (a[sortKey.value] < b[sortKey.value])
					return sortAsc.value ? -1 : 1
				if (a[sortKey.value] > b[sortKey.value])
					return sortAsc.value ? 1 : -1
				return 0
			})
		}
	}
	draggedAtleta = null
}

const filters = ref({
	search: "",
	societa: "",
	sesso: "",
	cintura: "",
})

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
	// Reset with an empty object
	atleta.value = {
		id_atleta: undefined,
		cognome: "",
		nome: "",
		sesso: undefined,
		anno_nascita: undefined,
		cintura_id: undefined,
		dan: undefined,
		peso_kg: undefined,
		id_societa: undefined,
		cintura: {
			id_cintura: undefined,
			colore: "",
			kyu: undefined,
		},
		societa: {
			id_societa: undefined,
			nome_societa: "",
			pagato: undefined,
			resto_consegnato: undefined,
		},
	}
}

// Update the saveAtleta function to handle Atleta
const saveAtleta = async (savedAtleta: Atleta) => {
	try {
		loading.value = true
		loadingMessage.value = savedAtleta.id_atleta
			? "Aggiornamento atleta..."
			: "Creazione atleta..."

		const { data: response } = await useFetch(
			`/api/atleti${
				savedAtleta.id_atleta ? `?id=${savedAtleta.id_atleta}` : ""
			}`,
			{
				method: savedAtleta.id_atleta ? "PUT" : "POST",
				body: savedAtleta,
			}
		)

		// Ricarica i dati
		const { data: atletiAggiornati } = await useFetch<AtletaRow[]>(
			"/api/atleti"
		)
		atleti.value = atletiAggiornati.value

		closeForm()
		feedbackMessage.value = `Atleta ${
			savedAtleta.id_atleta ? "aggiornato" : "creato"
		} con successo`
		feedbackType.value = "success"
	} catch (error) {
		const mysqlError = error as MySQLError
		feedbackMessage.value =
			mysqlError.message || "Errore durante il salvataggio"
		feedbackType.value = "error"
	} finally {
		loading.value = false
	}
}

// Update the editAtleta function
const editAtleta = (atletaToEdit: AtletaRow) => {
	// Creiamo un nuovo oggetto Atleta con la struttura corretta
	const editedAtleta: Atleta = {
		id_atleta: atletaToEdit.id_atleta,
		cognome: atletaToEdit.cognome,
		nome: atletaToEdit.nome,
		sesso: atletaToEdit.sesso,
		anno_nascita: atletaToEdit.anno_nascita,
		cintura_id: atletaToEdit.cintura_id,
		dan: atletaToEdit.dan,
		peso_kg: atletaToEdit.peso_kg,
		id_societa: atletaToEdit.id_societa,
		cintura: {
			id_cintura: atletaToEdit.cintura_id,
			colore: atletaToEdit.cintura || "",
			kyu: atletaToEdit.kyu,
		},
		societa: {
			id_societa: atletaToEdit.id_societa,
			nome_societa: atletaToEdit.nome_societa || "",
			pagato: undefined,
			resto_consegnato: undefined,
		},
	}

	atleta.value = editedAtleta
	formVisible.value = true
}

const deleteAtleta = async (id_atleta: number) => {
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

const toggleAtletaSelection = (id_atleta: number) => {
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

// Update copyAtleta to use Atleta type
const copyAtleta = async (atletaOriginal: AtletaRow) => {
	// Creiamo un nuovo oggetto Atleta con la struttura corretta
	const newAtleta: Atleta = {
		cognome: atletaOriginal.cognome,
		nome: atletaOriginal.nome,
		sesso: atletaOriginal.sesso,
		anno_nascita: atletaOriginal.anno_nascita,
		cintura_id: atletaOriginal.cintura_id,
		dan: atletaOriginal.dan,
		peso_kg: atletaOriginal.peso_kg,
		id_societa: atletaOriginal.id_societa,
		cintura: {
			id_cintura: atletaOriginal.cintura_id,
			colore: atletaOriginal.cintura || "",
			kyu: atletaOriginal.kyu,
		},
		societa: {
			id_societa: atletaOriginal.id_societa,
			nome_societa: atletaOriginal.nome_societa || "",
			pagato: undefined,
			resto_consegnato: undefined,
		},
	}

	if (!newAtleta.id_societa || !newAtleta.cintura_id) {
		console.error(
			"Errore: id_societa e cintura_id non possono essere nulli"
		)
		return
	}

	try {
		const { data, error } = await useFetch("/api/atleti", {
			method: "POST",
			body: newAtleta,
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
			const atletaToFind = atleti.value.find(
				(a) => a.id_atleta === id_atleta
			)
			if (atletaToFind) {
				await copyAtleta(atletaToFind)
			}
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
		// Filtra gli id_atleta undefined prima di assegnarli
		selectedAtleti.value = atleti.value
			.map((atleta) => atleta.id_atleta)
			.filter((id): id is number => id !== undefined)
	}
}

// Funzione helper per convertire AtletaRow in Atleta
const convertToAtleta = (atletaRow: AtletaRow): Atleta => {
	return {
		id_atleta: atletaRow.id_atleta,
		cognome: atletaRow.cognome,
		nome: atletaRow.nome,
		sesso: atletaRow.sesso,
		anno_nascita: atletaRow.anno_nascita,
		cintura_id: atletaRow.cintura_id,
		dan: atletaRow.dan,
		peso_kg: atletaRow.peso_kg,
		id_societa: atletaRow.id_societa,
		cintura: {
			id_cintura: atletaRow.cintura_id,
			colore: atletaRow.cintura || "",
			kyu: atletaRow.kyu,
		},
		societa: {
			id_societa: atletaRow.id_societa,
			nome_societa: atletaRow.nome_societa || "",
			pagato: undefined,
			resto_consegnato: undefined,
		},
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
