<template>
	<div class="bg-gray-100">
		<!-- Toolbar sotto la navbar -->
		<div
			class="flex items-center justify-between mx-auto px-12 w-full py-4 bg-gray-200 fixed top-16 z-10"
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
					title="Elimina Selezionati"
				>
					<i class="fas fa-trash"></i>
				</button>
				<button
					@click="copySelectedIscrizioni"
					class="text-gray-700 hover:text-blue-500 px-2 rounded mr-4 hover:bg-gray-200"
					title="Copia Selezionati"
				>
					<i class="fas fa-copy"></i>
				</button>
				<button
					@click="confirmSelectedIscrizioni"
					class="text-gray-700 hover:text-green-500 px-2 rounded mr-4 hover:bg-gray-200"
					title="Conferma Selezionati"
				>
					<i class="fas fa-check"></i>
				</button>
				<button
					@click="unconfirmSelectedIscrizioni"
					class="text-gray-700 hover:text-red-500 px-2 rounded hover:bg-gray-200"
					title="Annulla Conferme"
				>
					<i class="fas fa-times"></i>
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
					v-model="filters.disciplina"
					class="border p-2 rounded"
					@change="applyFilters"
				>
					<option value="">Tutte le discipline</option>
					<option
						v-for="d in discipline"
						:key="d.id_disciplina"
						:value="d.id_disciplina"
					>
						{{ d.id_disciplina }}
					</option>
				</select>
				<select
					v-model="filters.stato"
					class="border p-2 rounded"
					@change="applyFilters"
				>
					<option value="">Tutti gli stati</option>
					<option value="non_assegnata">Non assegnata</option>
					<option value="da_confermare">Da confermare</option>
					<option value="confermata">Confermata</option>
				</select>
				<!-- Nuovo filtro per numero tabellone -->
				<input
					v-model="filters.tabellone"
					placeholder="N° Tabellone"
					type="number"
					class="border p-2 rounded w-24"
					@input="applyFilters"
				/>
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
								class="border px-4 py-2 cursor-pointer text-center"
								@click="sortTable('id_iscrizione')"
							>
								ID
								<span v-if="sortKey === 'id_iscrizione'">
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
							<th
								class="border px-4 py-2 cursor-pointer text-center"
								@click="sortTable('id_atleta')"
							>
								N
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
								Anno
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
								@click="sortTable('id_disciplina')"
							>
								Disciplina
								<span v-if="sortKey === 'id_disciplina'">
									{{ sortAsc ? "▲" : "▼" }}
								</span>
							</th>
							<th
								class="border px-4 py-2 cursor-pointer"
								@click="sortTable('categoria')"
							>
								Categoria
								<span v-if="sortKey === 'categoria'">
									{{ sortAsc ? "▲" : "▼" }}
								</span>
							</th>
							<th
								class="border px-4 py-2 cursor-pointer"
								@click="sortTable('stato')"
							>
								Stato
								<span v-if="sortKey === 'stato'">
									{{ sortAsc ? "▲" : "▼" }}
								</span>
							</th>
							<th class="border px-4 py-2 min-w-[180px]">
								Azioni
							</th>
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="iscrizione in iscrizioniWithRowId"
							:key="iscrizione.rowId"
							:class="{
								'bg-blue-200': selectedIscrizioni.includes(
									iscrizione.rowId
								),
								'text-red-600': iscrizione.manuale,
							}"
							class="mb-4"
							@click="
								(e) =>
									toggleIscrizioneSelection(
										iscrizione.rowId,
										e
									)
							"
						>
							<td class="border px-4 py-2 cursor-pointer">
								<input
									type="checkbox"
									:checked="
										selectedIscrizioni.includes(
											iscrizione.rowId
										)
									"
								/>
							</td>
							<td class="border px-4 py-2 text-center">
								{{ iscrizione.id_iscrizione }}
							</td>
							<td
								class="border px-4 py-2 truncate max-w-[200px]"
								:title="iscrizione.nome_societa"
							>
								{{ iscrizione.nome_societa }}
							</td>
							<td class="border px-4 py-2 text-center">
								{{ iscrizione.id_atleta }}
							</td>
							<td class="border px-4 py-2">
								{{ iscrizione.cognome }}
							</td>
							<td class="border px-4 py-2">
								{{ iscrizione.nome }}
							</td>
							<td class="border px-4 py-2 text-center">
								{{ iscrizione.sesso }}
							</td>
							<td class="border px-4 py-2">
								{{ iscrizione.anno_nascita }}
							</td>
							<td
								class="border px-4 py-2 truncate max-w-[200px]"
								:title="iscrizione.cintura"
							>
								{{ iscrizione.cintura }}
							</td>
							<td class="border px-4 py-2">
								{{ iscrizione.dan }}
							</td>
							<td class="border px-4 py-2">
								{{ iscrizione.peso_kg }}
							</td>
							<td class="border px-4 py-2">
								{{ iscrizione.id_disciplina }}
							</td>

							<td
								class="border px-4 py-2 truncate max-w-[200px]"
								:title="iscrizione.categoria"
							>
								{{ iscrizione.categoria }}
							</td>

							<td class="border px-4 py-2 text-center">
								<span
									:class="{
										'bg-red-500': !iscrizione.id_categoria,
										'bg-yellow-500':
											!iscrizione.confermata &&
											iscrizione.id_categoria,
										'bg-green-500': iscrizione.confermata,
									}"
									class="inline-block w-4 h-4 rounded-full"
								></span>
							</td>
							<td class="border px-4 py-2 min-w-[180px]">
								<div class="h-full flex justify-start">
									<button
										@click.stop="editIscrizione(iscrizione)"
										class="text-gray-700 hover:bg-gray-100 p-2 rounded mx-1 hover:text-yellow-500"
										title="Modifica Iscrizione"
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
										title="Elimina Iscrizione"
									>
										<i class="fas fa-trash"></i>
									</button>
									<button
										@click.stop="copyIscrizione(iscrizione)"
										class="text-gray-700 hover:bg-gray-100 p-2 rounded mx-1 hover:text-blue-500"
										title="Duplica Iscrizione"
									>
										<i class="fas fa-copy"></i>
									</button>
									<button
										@click.stop="
											iscrizione.confermata
												? unconfirmIscrizione(
														iscrizione
												  )
												: confirmIscrizione(iscrizione)
										"
										class="text-gray-700 hover:bg-gray-100 p-2 rounded mx-1"
										:class="{
											'hover:text-green-500':
												!iscrizione.confermata,
											'hover:text-red-500':
												iscrizione.confermata,
										}"
										:title="
											iscrizione.confermata
												? 'Annulla Conferma'
												: 'Conferma Iscrizione'
										"
									>
										<i
											:class="
												iscrizione.confermata
													? 'fas fa-times'
													: 'fas fa-check'
											"
										></i>
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
			:categorie="categorie"
			:cinture="cinture"
			:societa="societa"
			:discipline="discipline"
			@close="closeForm"
			@save="saveIscrizione"
		/>
		<LoadingOverlay :show="loading" :message="loadingMessage" />
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useFetch } from "nuxt/app"
import LoadingOverlay from "@/components/LoadingOverlay.vue"
import IscrizioneFormModal from "~/components/IscrizioneFormModalbck.vue"
import type {
	Atleta,
	Iscrizione,
	Categoria,
	Cintura,
	Societa,
	Disciplina,
	SessoOption,
} from "~/types/global" // Aggiungi questa riga
import { getSessoOptions } from "~/types/global" // Importa la funzione helper

// Aggiungi questa definizione all'inizio dello script setup
const filters = ref({
	search: "",
	societa: "",
	disciplina: "",
	stato: "",
	tabellone: "", // Nuovo filtro per tabellone
})

const iscrizione = ref<Iscrizione>({
	id_iscrizione: undefined,
	data_iscrizione: undefined,
	manuale: false,
	confermata: false,
	ammesso_in_finale: false,
	classifica: undefined,
	atleta: {
		id_atleta: undefined,
		cognome: "",
		nome: "",
		sesso: "M",
		anno_nascita: undefined,
		cintura_id: undefined,
		dan: undefined,
		peso_kg: undefined,
		id_societa: undefined,
		cintura: undefined,
		societa: undefined,
	},
	categoria: undefined,
	tabellone: undefined,
	disciplina: undefined,
})

const formVisible = ref(false)

const { data: iscrizioni, error } = useFetch<Iscrizione[]>("/api/iscrizioni")
const { data: atleti } = useFetch<Atleta[]>("/api/atleti")
const { data: categorie } = useFetch<Categoria[]>("/api/categorie")
const { data: cinture } = useFetch<Cintura[]>("/api/cinture")
const { data: societa } = useFetch<Societa[]>("/api/societa")
const { data: discipline } = useFetch<Disciplina[]>("/api/discipline")

// Usa invece la funzione helper
const sessoOptions = getSessoOptions()

const selectedAtleta = ref("new")
const isExistingAtleta = computed(() => selectedAtleta.value !== "new")
const sortedAtleti = computed(() => {
	return [...(atleti.value || [])].sort((a, b) =>
		a.cognome.localeCompare(b.cognome)
	)
})

const atleta = ref<Atleta>({
	id_atleta: undefined,
	cognome: "",
	nome: "",
	sesso: "M",
	anno_nascita: undefined,
	cintura_id: undefined,
	dan: undefined,
	peso_kg: undefined,
	id_societa: undefined,
})

const handleAtletaSelection = () => {
	if (isExistingAtleta.value) {
		const atletaToEdit = atleti.value.find(
			(a) => a.id_atleta === selectedAtleta.value
		)
		atleta.value = {
			id_atleta: atletaToEdit.id_atleta,
			cognome: atletaToEdit.cognome,
			nome: atletaToEdit.nome,
			sesso: atletaToEdit.sesso_valore
				? atletaToEdit.sesso
				: atletaToEdit.sesso, // Usa il valore corretto dal backend
			anno_nascita: atletaToEdit.anno_nascita,
			cintura_id: atletaToEdit.cintura_id,
			dan: atletaToEdit.dan,
			peso_kg: atletaToEdit.peso_kg,
			id_societa: atletaToEdit.id_societa,
		}
	} else {
		atleta.value = {
			id_atleta: undefined,
			cognome: "",
			nome: "",
			sesso: "M", // Reset del sesso per nuovo atleta
			anno_nascita: undefined,
			cintura_id: undefined, // Assicurati che venga resettato
			dan: undefined,
			peso_kg: undefined,
			id_societa: undefined,
		}
	}
}

const emits = defineEmits(["atletaCreated"])

const saveIscrizione = async (savedIscrizione: Iscrizione) => {
	try {
		const { data, error } = await useFetch("/api/iscrizioni", {
			method: "POST",
			body: savedIscrizione,
		})

		if (error.value) throw error.value

		// Aggiorna la lista delle iscrizioni
		if (data.value) {
			iscrizioni.value.push(data.value)
		}

		closeForm()
		showFeedback("Iscrizione creata con successo", "success")
	} catch (error) {
		console.error("Errore durante il salvataggio:", error)
		showFeedback("Errore durante la creazione dell'iscrizione", "error")
	}
}

// Utility function per mostrare il feedback
const showFeedback = (message: string, type: "success" | "error") => {
	feedbackMessage.value = message
	feedbackType.value = type
	setTimeout(() => {
		feedbackMessage.value = ""
	}, 3000)
}

// Aggiorna anche le altre chiamate API per la conferma/annullamento
const confirmIscrizione = async (iscrizione: Iscrizione) => {
	try {
		const { error } = await useFetch<Iscrizione>(`/api/iscrizioni`, {
			method: "PUT",
			query: { id: iscrizione.id_iscrizione as number },
			body: { confermata: true },
		})
		if (error.value) throw error.value

		showFeedback("Iscrizione confermata con successo", "success")
	} catch (error) {
		showFeedback("Errore durante la conferma dell'iscrizione", "error")
		console.error(error)
	}
}

// Modifica questa riga
const selectedIscrizioni = ref<number[]>([]) // array di ID delle iscrizioni selezionate
// oppure, se preferisci riferimenti alle iscrizioni complete:
// const selectedIscrizioni = ref<Iscrizione['id_iscrizione'][]>([])

const feedbackMessage = ref("")
const feedbackType = ref("")

const openForm = () => {
	// Reset dell'iscrizione
	iscrizione.value = {
		id_iscrizione: undefined,
		data_iscrizione: undefined,
		manuale: false,
		confermata: false,
		ammesso_in_finale: false,
		classifica: undefined,
		atleta: {
			id_atleta: undefined,
			cognome: "",
			nome: "",
			sesso: "M",
			anno_nascita: undefined,
			cintura_id: undefined,
			dan: undefined,
			peso_kg: undefined,
			id_societa: undefined,
			cintura: undefined,
			societa: undefined,
		},
		categoria: undefined,
		tabellone: undefined,
		disciplina: undefined,
	}

	// Apri il form
	formVisible.value = true
}

const closeForm = () => {
	formVisible.value = false
	iscrizione.value = {
		id_iscrizione: undefined,
		data_iscrizione: undefined,
		manuale: false,
		confermata: false,
		ammesso_in_finale: false,
		classifica: undefined,
		atleta: {
			id_atleta: undefined,
			cognome: "",
			nome: "",
			sesso: "M",
			anno_nascita: undefined,
			cintura_id: undefined,
			dan: undefined,
			peso_kg: undefined,
			id_societa: undefined,
			cintura: undefined,
			societa: undefined,
		},
		categoria: undefined,
		tabellone: undefined,
		disciplina: undefined,
	}
}

const editIscrizione = (iscrizioneToEdit) => {
	// Clona profondamente l'iscrizione per evitare modifiche dirette
	iscrizione.value = {
		id_iscrizione: iscrizioneToEdit.id_iscrizione,
		data_iscrizione: iscrizioneToEdit.data_iscrizione,
		manuale: iscrizioneToEdit.manuale,
		confermata: iscrizioneToEdit.confermata,
		ammesso_in_finale: iscrizioneToEdit.ammesso_in_finale,
		classifica: iscrizioneToEdit.classifica,
		atleta: {
			id_atleta: iscrizioneToEdit.id_atleta,
			cognome: iscrizioneToEdit.cognome,
			nome: iscrizioneToEdit.nome,
			sesso: iscrizioneToEdit.sesso,
			anno_nascita: iscrizioneToEdit.anno_nascita,
			cintura_id: iscrizioneToEdit.cintura_id,
			dan: iscrizioneToEdit.dan,
			peso_kg: iscrizioneToEdit.peso_kg,
			id_societa: iscrizioneToEdit.id_societa,
			cintura: iscrizioneToEdit.cintura,
			societa: {
				id_societa: iscrizioneToEdit.id_societa,
				nome_societa: iscrizioneToEdit.nome_societa,
			},
		},
		categoria: {
			id_categoria: iscrizioneToEdit.id_categoria,
			nome: iscrizioneToEdit.nome_categoria,
		},
		disciplina: {
			id_disciplina: iscrizioneToEdit.id_disciplina,
			valore: iscrizioneToEdit.disciplina_valore,
		},
	}
	formVisible.value = true
}

// Modifica la funzione deleteIscrizione per aggiungere la conferma
const deleteIscrizione = async (id_iscrizione: number) => {
	// Chiedi conferma solo se non ci sono iscrizioni selezionate (cioè è una cancellazione singola)
	if (
		selectedIscrizioni.value.length === 0 &&
		!confirm("Sei sicuro di voler eliminare questa iscrizione?")
	) {
		return
	}

	try {
		const { error } = await useFetch<{ id: number }>(`/api/iscrizioni`, {
			method: "DELETE",
			query: { id: id_iscrizione },
		})
		if (error.value) {
			console.error(
				"Errore nella cancellazione dell'iscrizione:",
				error.value
			)
			feedbackMessage.value =
				"Errore durante l'eliminazione dell'iscrizione"
			feedbackType.value = "error"
		} else {
			iscrizioni.value = iscrizioni.value.filter(
				(i) => i.id_iscrizione !== id_iscrizione
			)
			feedbackMessage.value = "Iscrizione eliminata con successo"
			feedbackType.value = "success"
		}
	} catch (error) {
		console.error("Errore nella cancellazione dell'iscrizione:", error)
		feedbackMessage.value = "Errore durante l'eliminazione dell'iscrizione"
		feedbackType.value = "error"
	}
	setTimeout(() => {
		feedbackMessage.value = ""
	}, 3000)
}

// Computed property per aggiungere rowId alle iscrizioni
const iscrizioniWithRowId = computed(() => {
	if (!iscrizioni.value) return []

	let filtered = iscrizioni.value.filter((iscrizione) => {
		// Filtro di ricerca testuale
		if (filters.value.search) {
			const searchTerm = filters.value.search.toLowerCase()
			const searchFields = [
				iscrizione.cognome,
				iscrizione.nome,
				iscrizione.nome_societa,
				iscrizione.categoria,
			].map((field) => (field || "").toLowerCase())

			if (!searchFields.some((field) => field.includes(searchTerm))) {
				return false
			}
		}

		// Filtro società - correzione
		if (filters.value.societa && filters.value.societa !== "") {
			// Trova la società selezionata
			const societaSelezionata = societa.value?.find(
				(s) => s.id_societa === parseInt(filters.value.societa)
			)
			// Verifica se il nome della società dell'iscrizione corrisponde
			if (
				!societaSelezionata ||
				iscrizione.nome_societa !== societaSelezionata.nome_societa
			) {
				return false
			}
		}

		// Filtro disciplina
		if (
			filters.value.disciplina &&
			iscrizione.disciplina?.id_disciplina !== filters.value.disciplina // Modifica qui
		) {
			return false
		}

		// Filtro stato
		if (filters.value.stato) {
			switch (filters.value.stato) {
				case "non_assegnata":
					if (iscrizione.id_categoria) return false
					break
				case "da_confermare":
					if (!iscrizione.id_categoria || iscrizione.confermata)
						return false
					break
				case "confermata":
					if (!iscrizione.confermata) return false
					break
			}
		}

		// Filtro tabellone
		if (filters.value.tabellone) {
			// da implementare
		}

		return true
	})

	return filtered.map((iscrizione) => ({
		...iscrizione,
		rowId: iscrizione.id_iscrizione,
	}))
})

const lastSelectedIndex = ref(null)

const toggleIscrizioneSelection = (rowId, event) => {
	const currentIndex = iscrizioniWithRowId.value.findIndex(
		(i) => i.rowId === rowId
	)

	if (event.shiftKey && lastSelectedIndex.value !== null) {
		// Calcola l'intervallo di selezione
		const start = Math.min(lastSelectedIndex.value, currentIndex)
		const end = Math.max(lastSelectedIndex.value, currentIndex)

		// Seleziona tutte le iscrizioni nell'intervallo
		for (let i = start; i <= end; i++) {
			const id = iscrizioniWithRowId.value[i].rowId
			if (!selectedIscrizioni.value.includes(id)) {
				selectedIscrizioni.value.push(id)
			}
		}
	} else {
		// Comportamento normale per click singolo
		const index = selectedIscrizioni.value.indexOf(rowId)
		if (index === -1) {
			selectedIscrizioni.value.push(rowId)
		} else {
			selectedIscrizioni.value.splice(index, 1)
		}
	}

	lastSelectedIndex.value = currentIndex
}

// Modifica anche deleteSelectedIscrizioni per aggiungere la conferma
const deleteSelectedIscrizioni = async () => {
	if (selectedIscrizioni.value.length === 0) return

	// Chiedi conferma prima di eliminare
	if (
		!confirm(
			`Sei sicuro di voler eliminare ${selectedIscrizioni.value.length} iscrizioni?`
		)
	) {
		return
	}

	loading.value = true
	loadingMessage.value = "Eliminazione iscrizioni in corso..."
	document.body.style.cursor = "wait"

	try {
		for (const rowId of selectedIscrizioni.value) {
			const iscrizione = iscrizioniWithRowId.value.find(
				(i) => i.rowId === rowId
			)
			if (iscrizione?.id_iscrizione) {
				await deleteIscrizione(iscrizione.id_iscrizione)
			}
		}
		feedbackMessage.value = "Iscrizioni eliminate con successo"
		feedbackType.value = "success"
	} catch (error) {
		feedbackMessage.value = "Errore durante l'eliminazione"
		feedbackType.value = "error"
	} finally {
		loading.value = false
		document.body.style.cursor = "default"
		selectedIscrizioni.value = []
		setTimeout(() => {
			feedbackMessage.value = ""
		}, 3000)
	}
}

const copyIscrizione = async (iscrizione) => {
	const newIscrizione = { ...iscrizione, id_iscrizione: null }
	try {
		const { data, error } = await useFetch("/api/iscrizioni", {
			method: "POST",
			body: { ...newIscrizione },
		})
		if (error.value) {
			console.error("Errore nella copia dell'iscrizione:", error.value)
		} else {
			iscrizioni.value.push(data.value)
		}
	} catch (error) {
		console.error("Errore nella copia dell'iscrizione:", error)
	}
}

const copySelectedIscrizioni = async () => {
	if (selectedIscrizioni.value.length === 0) return

	loading.value = true
	loadingMessage.value = "Copia iscrizioni in corso..."
	document.body.style.cursor = "wait"

	try {
		for (const rowId of selectedIscrizioni.value) {
			const iscrizione = iscrizioniWithRowId.value.find(
				(i) => i.rowId === rowId
			)
			if (iscrizione) {
				await copyIscrizione(iscrizione)
			}
		}
		feedbackMessage.value = "Iscrizioni copiate con successo"
		feedbackType.value = "success"
	} catch (error) {
		feedbackMessage.value = "Errore durante la copia"
		feedbackType.value = "error"
	} finally {
		loading.value = false
		document.body.style.cursor = "default"
		selectedIscrizioni.value = []
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

	if (key === "stato") {
		// Funzione di ordinamento personalizzata per lo stato
		iscrizioni.value.sort((a, b) => {
			const getStatoValue = (iscrizione) => {
				if (iscrizione.confermata) return 3 // verde
				if (iscrizione.id_categoria) return 2 // giallo
				return 1 // rosso
			}

			const aValue = getStatoValue(a)
			const bValue = getStatoValue(b)

			if (aValue === bValue) return 0
			return sortAsc.value ? aValue - bValue : bValue - aValue
		})
	} else if (key === "n_ordine") {
		// Ordinamento specifico per n_ordine
		iscrizioni.value.sort((a, b) => {
			const aValue = a.id_categoria
				? categorie.value.find(
						(cat) => cat.id_categoria === a.id_categoria
				  )?.n_ordine ?? 0
				: 0
			const bValue = b.id_categoria
				? categorie.value.find(
						(cat) => cat.id_categoria === b.id_categoria
				  )?.n_ordine ?? 0
				: 0

			if (aValue === bValue) return 0
			return sortAsc.value ? aValue - bValue : bValue - aValue
		})
	} else {
		// Ordinamento standard per le altre colonne
		iscrizioni.value.sort((a, b) => {
			if (a[key] < b[key]) return sortAsc.value ? -1 : 1
			if (a[key] > b[key]) return sortAsc.value ? 1 : -1
			return 0
		})
	}
}

const toggleAllSelection = () => {
	if (selectedIscrizioni.value.length === iscrizioniWithRowId.value.length) {
		selectedIscrizioni.value = []
	} else {
		selectedIscrizioni.value = iscrizioniWithRowId.value.map(
			(iscrizione) => iscrizione.rowId
		)
	}
}

const confirmSelectedIscrizioni = async () => {
	const nonConfirmableIscrizioni = selectedIscrizioni.value.filter(
		(rowId) => {
			const iscrizione = iscrizioniWithRowId.value.find(
				(i) => i.rowId === rowId
			)
			return !iscrizione.id_categoria
		}
	)

	if (nonConfirmableIscrizioni.length > 0) {
		feedbackMessage.value =
			"Alcune iscrizioni selezionate non hanno una categoria assegnata"
		feedbackType.value = "error"
		setTimeout(() => {
			feedbackMessage.value = ""
		}, 3000)
		return
	}

	loading.value = true
	loadingMessage.value = "Conferma iscrizioni in corso..."
	document.body.style.cursor = "wait"

	try {
		for (const rowId of selectedIscrizioni.value) {
			const iscrizione = iscrizioniWithRowId.value.find(
				(i) => i.rowId === rowId
			)
			if (iscrizione) {
				await confirmIscrizione(iscrizione)
			}
		}
		feedbackMessage.value = "Iscrizioni confermate con successo"
		feedbackType.value = "success"
	} catch (error) {
		feedbackMessage.value = "Errore durante la conferma"
		feedbackType.value = "error"
	} finally {
		loading.value = false
		document.body.style.cursor = "default"
		selectedIscrizioni.value = []
		setTimeout(() => {
			feedbackMessage.value = ""
		}, 3000)
	}
}

const unconfirmIscrizione = async (iscrizione: Iscrizione) => {
	if (!iscrizione.id_iscrizione) {
		feedbackMessage.value = "Impossibile annullare: iscrizione non trovata"
		feedbackType.value = "error"
		setTimeout(() => {
			feedbackMessage.value = ""
		}, 3000)
		return
	}

	try {
		const { data, error } = await useFetch<Iscrizione>(`/api/iscrizioni`, {
			method: "PUT",
			query: { id: iscrizione.id_iscrizione },
			body: {
				confermata: false,
			},
		})
		if (error.value) throw new Error(error.value)

		// Aggiorna la lista delle iscrizioni
		const { data: refreshedData } = await useFetch("/api/iscrizioni")
		iscrizioni.value = refreshedData.value

		feedbackMessage.value = "Conferma iscrizione annullata"
		feedbackType.value = "success"
	} catch (error) {
		feedbackMessage.value = "Errore durante l'annullamento della conferma"
		feedbackType.value = "error"
		console.error(error)
	}

	setTimeout(() => {
		feedbackMessage.value = ""
	}, 3000)
}

const unconfirmSelectedIscrizioni = async () => {
	const nonUnconfirmableIscrizioni = selectedIscrizioni.value.filter(
		(rowId) => {
			const iscrizione = iscrizioniWithRowId.value.find(
				(i) => i.rowId === rowId
			)
			return !iscrizione.confermata
		}
	)

	if (nonUnconfirmableIscrizioni.length === selectedIscrizioni.value.length) {
		feedbackMessage.value = "Nessuna iscrizione selezionata è confermata"
		feedbackType.value = "error"
		setTimeout(() => {
			feedbackMessage.value = ""
		}, 3000)
		return
	}

	loading.value = true
	loadingMessage.value = "Annullamento conferme in corso..."
	document.body.style.cursor = "wait"

	try {
		for (const rowId of selectedIscrizioni.value) {
			const iscrizione = iscrizioniWithRowId.value.find(
				(i) => i.rowId === rowId
			)
			if (iscrizione && iscrizione.confermata) {
				await unconfirmIscrizione(iscrizione)
			}
		}
		feedbackMessage.value = "Conferme annullate con successo"
		feedbackType.value = "success"
	} catch (error) {
		feedbackMessage.value = "Errore durante l'annullamento"
		feedbackType.value = "error"
	} finally {
		loading.value = false
		document.body.style.cursor = "default"
		selectedIscrizioni.value = []
		setTimeout(() => {
			feedbackMessage.value = ""
		}, 3000)
	}
}

const loading = ref(false)
const loadingMessage = ref("")

// Aggiungi queste funzioni per gestire i filtri
const applyFilters = () => {
	selectedIscrizioni.value = []
}

// Modifica la funzione resetFilters
const resetFilters = () => {
	filters.value = {
		search: "",
		societa: "",
		disciplina: "",
		stato: "",
		tabellone: "", // Reset anche del filtro tabellone
	}
	applyFilters()
}

onMounted(async () => {
	// Carica i dati delle iscrizioni
})
</script>

<style scoped>
/* Rimuovere .main-container e .alert poiché sono ora in global.css */
/* Mantenere solo stili specifici della pagina se necessari */
</style>
