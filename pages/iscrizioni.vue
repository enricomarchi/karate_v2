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
								class="border px-4 py-2 cursor-pointer text-center"
								@click="sortTable('n_ordine')"
							>
								Tab
								<span v-if="sortKey === 'n_ordine'">
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
								class="border px-4 py-2 cursor-pointer text-center"
								@click="sortTable('pool')"
							>
								Pool
								<span v-if="sortKey === 'pool'">
									{{ sortAsc ? "▲" : "▼" }}
								</span>
							</th>
							<th
								class="border px-4 py-2 cursor-pointer text-center"
								@click="sortTable('n_accorpamento')"
							>
								Acc.
								<span v-if="sortKey === 'n_accorpamento'">
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
							<td class="border px-4 py-2 text-center">
								{{ getCategoriaNumOrdine(iscrizione) }}
							</td>
							<td
								class="border px-4 py-2 truncate max-w-[200px]"
								:title="iscrizione.categoria"
							>
								{{ iscrizione.categoria }}
							</td>
							<td class="border px-4 py-2 text-center">
								{{
									iscrizione.pool
										? `${iscrizione.pool}/${getPoolTotal(
												iscrizione
										  )}`
										: "-"
								}}
							</td>
							<td class="border px-4 py-2 text-center">
								{{ getAccorpamentoDetails(iscrizione) }}
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
		<div
			v-if="formVisible"
			class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50"
		>
			<div
				class="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl overflow-auto max-h-full"
			>
				<h2 class="text-2xl font-bold mb-4">
					{{
						iscrizione.id_iscrizione
							? "Modifica Iscrizione"
							: "Aggiungi Iscrizione"
					}}
				</h2>
				<form
					@submit.prevent="saveIscrizione"
					class="flex flex-wrap gap-4"
				>
					<!-- Form semplificato per la modifica -->
					<template v-if="iscrizione.id_iscrizione">
						<div class="w-full">
							<p class="mb-2">
								<strong>Atleta:</strong>
								{{ iscrizione.cognome }} {{ iscrizione.nome }}
							</p>
						</div>
						<select
							v-model="iscrizione.id_categoria"
							class="border p-2 rounded w-full"
						>
							<option value="">Seleziona categoria</option>
							<option
								v-for="cat in categorieOrdinate"
								:key="cat.id_categoria"
								:value="cat.id_categoria"
							>
								{{ cat.nome }}
							</option>
						</select>
					</template>

					<!-- Form completo per nuova iscrizione -->
					<template v-else>
						<!-- Qui va il form esistente per nuove iscrizioni -->
						<select
							v-model="selectedAtleta"
							@change="handleAtletaSelection"
							class="border p-2 rounded w-full"
						>
							<!-- Selezione atleta esistente o nuovo -->
							<option value="new">Nuovo Atleta</option>
							<option
								v-for="atleta in sortedAtleti"
								:key="atleta.id_atleta"
								:value="atleta.id_atleta"
							>
								{{ atleta.cognome }} {{ atleta.nome }}
							</option>
						</select>

						<!-- Campi atleta -->
						<input
							v-model="atleta.cognome"
							:disabled="isExistingAtleta"
							placeholder="Cognome"
							class="border p-2 rounded w-full"
						/>
						<input
							v-model="atleta.nome"
							:disabled="isExistingAtleta"
							placeholder="Nome"
							class="border p-2 rounded w-full"
						/>
						<select
							v-model="atleta.sesso"
							:disabled="isExistingAtleta"
							class="border p-2 rounded w-full"
						>
							<option
								v-for="s in sesso"
								:key="s.id_sesso"
								:value="s.id_sesso"
							>
								{{ s.valore }}
							</option>
						</select>
						<input
							v-model="atleta.anno_nascita"
							:disabled="isExistingAtleta"
							type="number"
							placeholder="Anno Nascita"
							class="border p-2 rounded w-full"
						/>
						<select
							v-model="atleta.cintura_id"
							:disabled="isExistingAtleta"
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
							:disabled="isExistingAtleta"
							type="number"
							placeholder="Dan"
							class="border p-2 rounded w-full"
						/>
						<input
							v-model="atleta.peso_kg"
							:disabled="isExistingAtleta"
							type="number"
							step="0.1"
							placeholder="Peso"
							class="border p-2 rounded w-full"
						/>
						<select
							v-model="atleta.id_societa"
							:disabled="isExistingAtleta"
							class="border p-2 rounded w-full"
						>
							<option
								v-for="s in societa"
								:key="s.id_societa"
								:value="s.id_societa"
							>
								{{ s.nome_societa }}
							</option>
						</select>

						<!-- Selezione disciplina -->
						<select
							v-model="iscrizione.id_disciplina"
							class="border p-2 rounded w-full"
							required
						>
							<option value="">Seleziona disciplina</option>
							<option
								v-for="d in discipline"
								:key="d.id_disciplina"
								:value="d.id_disciplina"
							>
								{{ d.id_disciplina }}
							</option>
						</select>
					</template>

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

// Aggiungi questa definizione all'inizio dello script setup
const filters = ref({
	search: "",
	societa: "",
	disciplina: "",
	stato: "",
	tabellone: "", // Nuovo filtro per tabellone
})

const iscrizione = ref({
	id_iscrizione: null,
	id_atleta: null,
	cognome: null,
	nome: null,
	sesso: null,
	anno_nascita: null,
	cintura: null,
	dan: null,
	peso_kg: null,
	nome_societa: null,
	n_pettorale: null,
	id_disciplina: null,
	id_categoria: null,
	categoria: null,
	data_iscrizione: null,
	manuale: null,
	confermata: false,
})

const formVisible = ref(false)

const { data: iscrizioni, error } = useFetch("/api/iscrizioni")
const { data: atleti } = useFetch("/api/atleti")
const { data: categorie } = useFetch("/api/categorie")
const { data: cinture } = useFetch("/api/cinture")
const { data: societa } = useFetch("/api/societa")
const { data: discipline } = useFetch("/api/discipline")
const { data: sesso } = useFetch("/api/sesso")

const selectedAtleta = ref("new")
const isExistingAtleta = computed(() => selectedAtleta.value !== "new")
const sortedAtleti = computed(() => {
	return [...(atleti.value || [])].sort((a, b) =>
		a.cognome.localeCompare(b.cognome)
	)
})

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
			id_atleta: null,
			cognome: "",
			nome: "",
			sesso: "", // Reset del sesso per nuovo atleta
			anno_nascita: null,
			cintura_id: null, // Assicurati che venga resettato
			dan: null,
			peso_kg: null,
			id_societa: null,
		}
	}
}

const emits = defineEmits(["atletaCreated"])

const saveIscrizione = async () => {
	try {
		if (iscrizione.value.id_iscrizione) {
			// Modifica iscrizione esistente
			const categoriaSelezionata = categorie.value.find(
				(cat) => cat.id_categoria === iscrizione.value.id_categoria
			)

			const { data, error } = await useFetch(
				`/api/iscrizioni?id=${iscrizione.value.id_iscrizione}`,
				{
					method: "PUT",
					body: {
						id_atleta: iscrizione.value.id_atleta,
						id_categoria: iscrizione.value.id_categoria,
						id_disciplina: categoriaSelezionata?.id_disciplina,
						confermata: iscrizione.value.confermata,
					},
				}
			)
			if (error.value) throw new Error(error.value)

			// Aggiorna la lista delle iscrizioni
			const { data: refreshedData } = await useFetch("/api/iscrizioni")
			iscrizioni.value = refreshedData.value
		} else {
			// Nuova iscrizione
			let requestBody = {
				id_disciplina: iscrizione.value.id_disciplina,
				manuale: true,
			}

			if (selectedAtleta.value === "new") {
				if (!atleta.value.id_societa || !atleta.value.cintura_id) {
					throw new Error(
						"Selezionare una società e una cintura per il nuovo atleta"
					)
				}

				requestBody.nuovo_atleta = {
					nome: atleta.value.nome,
					cognome: atleta.value.cognome,
					data_nascita: `${atleta.value.anno_nascita}-01-01`,
					sesso: atleta.value.sesso,
					id_societa: atleta.value.id_societa,
					cintura_id: atleta.value.cintura_id, // Aggiungiamo la cintura_id
				}
			} else {
				requestBody.id_atleta = selectedAtleta.value
			}

			if (!requestBody.id_disciplina) {
				throw new Error("Selezionare una disciplina")
			}

			// Effettua una sola chiamata API per la creazione
			const { data: newIscrizione, error: iscrizioneError } =
				await useFetch("/api/iscrizioni", {
					method: "POST",
					body: requestBody,
				})

			if (iscrizioneError.value) throw new Error(iscrizioneError.value)

			// Aggiorna la lista delle iscrizioni
			const { data: refreshedData } = await useFetch("/api/iscrizioni")
			iscrizioni.value = refreshedData.value
		}

		closeForm()
		feedbackMessage.value = "Iscrizione creata con successo"
		feedbackType.value = "success"
		setTimeout(() => {
			feedbackMessage.value = ""
		}, 3000)
	} catch (error) {
		console.error("Errore nel salvataggio:", error)
		feedbackMessage.value = "Errore nel salvataggio: " + error.message
		feedbackType.value = "error"
	}
}

const selectedIscrizioni = ref([])

const feedbackMessage = ref("")
const feedbackType = ref("")

const openForm = () => {
	formVisible.value = true
}

const closeForm = () => {
	formVisible.value = false
	iscrizione.value = {
		id_iscrizione: null,
		id_atleta: null,
		cognome: null,
		nome: null,
		sesso: null,
		anno_nascita: null,
		cintura: null,
		dan: null,
		peso_kg: null,
		nome_societa: null,
		n_pettorale: null,
		id_disciplina: null,
		id_categoria: null,
		categoria: null,
		data_iscrizione: null,
		confermata: false,
		manuale: null,
	}
}

const editIscrizione = (iscrizioneToEdit) => {
	iscrizione.value = { ...iscrizioneToEdit }
	formVisible.value = true
}

// Modifica la funzione deleteIscrizione per aggiungere la conferma
const deleteIscrizione = async (id_iscrizione) => {
	// Chiedi conferma solo se non ci sono iscrizioni selezionate (cioè è una cancellazione singola)
	if (
		selectedIscrizioni.value.length === 0 &&
		!confirm("Sei sicuro di voler eliminare questa iscrizione?")
	) {
		return
	}

	try {
		const { error } = await useFetch(
			`/api/iscrizioni?id=${id_iscrizione}`,
			{
				method: "DELETE",
			}
		)
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
			iscrizione.id_disciplina !== filters.value.disciplina
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
			const numTabellone = getCategoriaNumOrdine(iscrizione)
			if (
				numTabellone === "-" ||
				numTabellone !== parseInt(filters.value.tabellone)
			) {
				return false
			}
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

const confirmIscrizione = async (iscrizione) => {
	if (!iscrizione.id_iscrizione) {
		feedbackMessage.value = "Impossibile confermare: iscrizione non salvata"
		feedbackType.value = "error"
		setTimeout(() => {
			feedbackMessage.value = ""
		}, 3000)
		return
	}

	try {
		const { data, error } = await useFetch(
			`/api/iscrizioni?id=${iscrizione.id_iscrizione}`,
			{
				method: "PUT",
				body: {
					confermata: true,
				},
			}
		)
		if (error.value) throw new Error(error.value)

		// Aggiorna la lista delle iscrizioni per mostrare la nuova data
		const { data: refreshedData } = await useFetch("/api/iscrizioni")
		iscrizioni.value = refreshedData.value

		feedbackMessage.value = "Iscrizione confermata con successo"
		feedbackType.value = "success"
	} catch (error) {
		feedbackMessage.value = "Errore durante la conferma dell'iscrizione"
		feedbackType.value = "error"
		console.error(error)
	}

	setTimeout(() => {
		feedbackMessage.value = ""
	}, 3000)
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

const unconfirmIscrizione = async (iscrizione) => {
	if (!iscrizione.id_iscrizione) {
		feedbackMessage.value = "Impossibile annullare: iscrizione non trovata"
		feedbackType.value = "error"
		setTimeout(() => {
			feedbackMessage.value = ""
		}, 3000)
		return
	}

	try {
		const { data, error } = await useFetch(
			`/api/iscrizioni?id=${iscrizione.id_iscrizione}`,
			{
				method: "PUT",
				body: {
					confermata: false,
				},
			}
		)
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

const categorieOrdinate = computed(() => {
	if (!categorie.value) return []
	return [...categorie.value].sort(
		(a, b) => (a.n_ordine || 0) - (b.n_ordine || 0)
	)
})

const loading = ref(false)
const loadingMessage = ref("")

// Aggiungi questa funzione per ottenere il numero d'ordine dalla categoria
const getCategoriaNumOrdine = (iscrizione) => {
	if (!iscrizione.id_categoria || !categorie.value) return "-"
	const categoria = categorie.value.find(
		(cat) => cat.id_categoria === iscrizione.id_categoria
	)
	return categoria?.n_ordine || "-"
}

// Modifica la funzione getAccorpamentoDetails
const getAccorpamentoDetails = (iscrizione) => {
	if (!iscrizione.n_accorpamento || !iscrizioni.value) return "-"

	// Trova tutte le iscrizioni con lo stesso numero di accorpamento
	const iscrizioniAccorpate = iscrizioni.value.filter(
		(i) => i.n_accorpamento === iscrizione.n_accorpamento
	)

	// Estrai e ordina i numeri di tabellone, eliminando i duplicati
	const numeriTabellone = [
		...new Set(
			iscrizioniAccorpate
				.map((i) => getCategoriaNumOrdine(i))
				.filter((n) => n !== "-")
		),
	] // Rimuove i valori "-"
		.map((n) => parseInt(n)) // Converte in numeri
		.sort((a, b) => a - b) // Ordina numericamente

	// Unisce i numeri con un trattino
	return numeriTabellone.length > 0 ? numeriTabellone.join("-") : "-"
}

// Aggiungi questa funzione nello script setup prima di onMounted
const getPoolTotal = (iscrizione) => {
	if (!iscrizione.id_categoria || !iscrizioni.value) return "-"

	// Trova tutte le iscrizioni nella stessa categoria
	const iscrizioniStessaCategoria = iscrizioni.value.filter(
		(i) => i.id_categoria === iscrizione.id_categoria
	)

	// Trova il numero più alto di pool
	const maxPool = Math.max(
		...iscrizioniStessaCategoria.map((i) => i.pool || 0)
	)

	return maxPool || "-"
}

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
