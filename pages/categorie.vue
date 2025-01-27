<template>
	<div class="bg-gray-100">
		<!-- Toolbar sotto la navbar -->
		<div
			class="flex items-center justify-between mx-auto px-24 w-full py-4 bg-gray-200 fixed top-16 z-10"
		>
			<h1 class="text-2xl font-bold">Categorie</h1>
			<div>
				<button
					@click="openForm"
					class="text-gray-700 hover:text-green-500 px-2 rounded mr-4 hover:bg-gray-200"
					title="Aggiungi Categoria"
				>
					<i class="fas fa-plus"></i>
				</button>
				<button
					@click="deleteSelectedCategorie"
					class="text-gray-700 hover:text-red-500 px-2 rounded mr-4 hover:bg-gray-200"
					title="Elimina Selezionate"
				>
					<i class="fas fa-trash"></i>
				</button>
				<button
					@click="copySelectedCategorie"
					class="text-gray-700 hover:text-blue-500 px-2 rounded mr-4 hover:bg-gray-200"
					title="Copia Selezionate"
				>
					<i class="fas fa-copy"></i>
				</button>
				<button
					@click="openAutomaticForm"
					class="text-gray-700 hover:text-purple-500 px-2 rounded hover:bg-gray-200"
					title="Crea Automaticamente"
				>
					<i class="fas fa-magic"></i>
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
							<th
								class="border px-4 py-2 cursor-pointer"
								@click="sortTable('n_ordine')"
							>
								n.
								<span v-if="sortKey === 'n_ordine'">{{
									sortAsc ? "▲" : "▼"
								}}</span>
							</th>
							<th
								class="border px-4 py-2 cursor-pointer"
								@click="sortTable('nome')"
							>
								Nome
								<span v-if="sortKey === 'nome'">{{
									sortAsc ? "▲" : "▼"
								}}</span>
							</th>
							<th
								class="border px-4 py-2 cursor-pointer"
								@click="sortTable('id_disciplina')"
							>
								Disciplina
								<span v-if="sortKey === 'id_disciplina'">{{
									sortAsc ? "▲" : "▼"
								}}</span>
							</th>
							<th
								class="border px-4 py-2 cursor-pointer"
								@click="sortTable('sesso')"
							>
								Sesso
								<span v-if="sortKey === 'sesso'">{{
									sortAsc ? "▲" : "▼"
								}}</span>
							</th>
							<th
								class="border px-4 py-2 cursor-pointer"
								@click="sortTable('peso_min')"
							>
								Peso Min
								<span v-if="sortKey === 'peso_min'">{{
									sortAsc ? "▲" : "▼"
								}}</span>
							</th>
							<th
								class="border px-4 py-2 cursor-pointer"
								@click="sortTable('peso_max')"
							>
								Peso Max
								<span v-if="sortKey === 'peso_max'">{{
									sortAsc ? "▲" : "▼"
								}}</span>
							</th>
							<th class="border px-4 py-2">Fasce</th>
							<th class="border px-4 py-2">Cinture</th>
							<th class="border px-4 py-2">Azioni</th>
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="categoria in categorie"
							:key="categoria.id_categoria"
							:class="{
								'bg-blue-200': selectedCategorie.includes(
									categoria.id_categoria
								),
								'bg-gray-100':
									dragTarget === categoria.id_categoria,
								'bg-red-100': hasOverlap(
									categoria.id_categoria
								),
							}"
							class="mb-4"
							@click="
								toggleCategoriaSelection(categoria.id_categoria)
							"
							draggable="true"
							@dragstart="onDragStart(categoria)"
							@dragover.prevent="onDragOver(categoria)"
							@dragleave="onDragLeave(categoria)"
							@drop="onDrop(categoria)"
						>
							<td class="border px-4 py-2 cursor-pointer">
								<input
									type="checkbox"
									:checked="
										selectedCategorie.includes(
											categoria.id_categoria
										)
									"
								/>
							</td>
							<td class="border px-4 py-2">
								{{ categoria.n_ordine }}
							</td>
							<td class="border px-4 py-2">
								{{ categoria.nome }}
							</td>
							<td class="border px-4 py-2">
								{{ categoria.id_disciplina }}
							</td>
							<td class="border px-4 py-2">
								{{ categoria.sesso }}
							</td>
							<td class="border px-4 py-2">
								{{ categoria.peso_min }}
							</td>
							<td class="border px-4 py-2">
								{{ categoria.peso_max }}
							</td>
							<td class="border px-4 py-2">
								<ul class="list-disc list-inside">
									<li
										v-for="fascia in getFasce(
											categoria.id_categoria
										)"
										:key="fascia.id_fascia"
									>
										{{ fascia.descrizione }}
									</li>
								</ul>
							</td>
							<td class="border px-4 py-2">
								<ul class="list-disc list-inside">
									<li
										v-for="cintura in getCinture(
											categoria.id_categoria
										)"
										:key="cintura.id_cintura"
									>
										{{ cintura.colore }}
									</li>
								</ul>
							</td>
							<td class="border px-4 py-2">
								<div class="h-full">
									<button
										@click.stop="editCategoria(categoria)"
										class="text-gray-700 hover:bg-gray-100 p-2 rounded mx-1 hover:text-yellow-500"
									>
										<i class="fas fa-edit"></i>
									</button>
									<button
										@click.stop="
											deleteCategoria(
												categoria.id_categoria
											)
										"
										class="text-gray-700 hover:bg-gray-100 p-2 rounded mx-1 hover:text-red-500"
									>
										<i class="fas fa-trash"></i>
									</button>
									<button
										@click.stop="copyCategoria(categoria)"
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
		<CategoriaFormModal
			v-if="formVisible"
			:categoria="categoria"
			:discipline="discipline"
			:sessoOptions="sessoOptions"
			:fasceEta="fasceEta"
			:cinture="cinture"
			@close="closeForm"
			@save="saveCategoria"
		/>
		<CategorieAutomaticheFormModal
			v-if="automaticFormVisible"
			:discipline="discipline"
			:sessoOptions="sessoOptions"
			:fasceEta="fasceEta"
			:cinture="cinture"
			@close="closeAutomaticForm"
			@create="createCategorieAutomatiche"
		/>
		<LoadingOverlay :show="loading" :message="loadingMessage" />
	</div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue"
import { useFetch } from "#app"
import CategoriaFormModal from "@/components/CategoriaFormModal.vue"
import CategorieAutomaticheFormModal from "@/components/CategorieAutomaticheFormModal.vue"
import LoadingOverlay from "@/components/LoadingOverlay.vue"

const categoria = ref({
	id_categoria: null,
	nome: "",
	id_disciplina: null,
	sesso: "",
	peso_min: null,
	peso_max: null,
	n_ordine: null,
	fasce: "",
	cinture: "",
})

const formVisible = ref(false)
const automaticFormVisible = ref(false)
const { data: categorie } = useFetch("/api/categorie")
const { data: discipline } = useFetch("/api/discipline")
const { data: sessoOptions } = useFetch("/api/sesso")
const { data: fasceEta } = useFetch("/api/fasce-eta")
const { data: cinture } = useFetch("/api/cinture")
const { data: categorieFasce } = useFetch("/api/vista_categorie_fasce")
const { data: categorieCinture } = useFetch("/api/vista_categorie_cinture")
const { data: categorieOverlap } = useFetch("/api/categorie-sovrapposte")
const selectedCategorie = ref([])

const sortKey = ref("")
const sortAsc = ref(true)

const sortTable = (key) => {
	if (sortKey.value === key) {
		sortAsc.value = !sortAsc.value
	} else {
		sortKey.value = key
		sortAsc.value = true
	}
	categorie.value.sort((a, b) => {
		if (a[key] < b[key]) return sortAsc.value ? -1 : 1
		if (a[key] > b[key]) return sortAsc.value ? 1 : -1
		return 0
	})
}

const openForm = () => {
	formVisible.value = true
	categoria.value = {
		id_categoria: null,
		nome: "",
		id_disciplina: null,
		sesso: "",
		peso_min: null,
		peso_max: null,
		n_ordine: null,
		fasce: "",
		cinture: "",
	}
}

const closeForm = () => {
	formVisible.value = false
	categoria.value = {
		id_categoria: null,
		nome: "",
		id_disciplina: null,
		sesso: "",
		peso_min: null,
		peso_max: null,
		n_ordine: null,
		fasce: "",
		cinture: "",
	}
}

const saveCategoria = async (savedCategoria) => {
	if (!savedCategoria.nome) {
		console.error("Errore: il campo 'nome' non può essere nullo")
		return
	}
	// Aggiorna i dati dopo il salvataggio
	const [
		{ data: categorieAggiornate },
		{ data: categorieFasceAggiornate },
		{ data: categorieCintureAggiornate },
		{ data: categorieOverlapAggiornate }, // Aggiungi questa riga
	] = await Promise.all([
		useFetch("/api/categorie"),
		useFetch("/api/vista_categorie_fasce"),
		useFetch("/api/vista_categorie_cinture"),
		useFetch("/api/categorie-sovrapposte"), // Aggiungi questa riga
	])

	// Aggiorna tutti i riferimenti
	categorie.value = categorieAggiornate.value
	categorieFasce.value = categorieFasceAggiornate.value
	categorieCinture.value = categorieCintureAggiornate.value
	categorieOverlap.value = categorieOverlapAggiornate.value // Aggiungi questa riga

	closeForm()
}

const toggleCategoriaSelection = (id_categoria) => {
	const index = selectedCategorie.value.indexOf(id_categoria)
	if (index === -1) {
		selectedCategorie.value.push(id_categoria)
	} else {
		selectedCategorie.value.splice(index, 1)
	}
}

const toggleAllSelection = () => {
	if (selectedCategorie.value.length === categorie.value.length) {
		selectedCategorie.value = []
	} else {
		selectedCategorie.value = categorie.value.map((c) => c.id_categoria)
	}
}

const editCategoria = async (categoriaToEdit) => {
	try {
		// Recupera i dettagli completi della categoria dal backend
		const { data } = await useFetch(
			`/api/categorie?id=${categoriaToEdit.id_categoria}`
		)

		console.log("Dati ricevuti dal server:", data.value) // Aggiungi questo log

		// Assicurati che i dati siano disponibili e inizializza gli array vuoti se necessario
		if (data.value) {
			categoria.value = {
				...data.value,
				fasce: data.value.fasce || [],
				cinture: data.value.cinture || [],
			}
			console.log("Categoria preparata per il form:", categoria.value) // Aggiungi questo log
			formVisible.value = true
		}
	} catch (error) {
		console.error(
			"Errore nel recupero dei dettagli della categoria:",
			error
		)
	}
}

const deleteCategoria = async (id_categoria) => {
	try {
		await useFetch(`/api/categorie?id=${id_categoria}`, {
			method: "DELETE",
		})
		// Aggiorna tutti i dati dopo l'eliminazione
		const [
			{ data: categorieAggiornate },
			{ data: categorieFasceAggiornate },
			{ data: categorieCintureAggiornate },
			{ data: categorieOverlapAggiornate },
		] = await Promise.all([
			useFetch("/api/categorie"),
			useFetch("/api/vista_categorie_fasce"),
			useFetch("/api/vista_categorie_cinture"),
			useFetch("/api/categorie-sovrapposte"),
		])

		categorie.value = categorieAggiornate.value
		categorieFasce.value = categorieFasceAggiornate.value
		categorieCinture.value = categorieCintureAggiornate.value
		categorieOverlap.value = categorieOverlapAggiornate.value
	} catch (error) {
		console.error("Errore nella cancellazione della categoria:", error)
	}
}

const deleteSelectedCategorie = async () => {
	if (selectedCategorie.value.length === 0) return

	loading.value = true
	loadingMessage.value = "Eliminazione categorie in corso..."
	document.body.style.cursor = "wait"

	try {
		for (const id_categoria of selectedCategorie.value) {
			await deleteCategoria(id_categoria)
		}
		feedbackMessage.value = "Categorie eliminate con successo"
		feedbackType.value = "success"
	} catch (error) {
		feedbackMessage.value = "Errore durante l'eliminazione"
		feedbackType.value = "error"
	} finally {
		loading.value = false
		document.body.style.cursor = "default"
		selectedCategorie.value = []
		setTimeout(() => {
			feedbackMessage.value = ""
		}, 3000)
	}
}

const copyCategoria = async (categoria) => {
	if (!categoria.nome) {
		console.error("Errore: il campo 'nome' non può essere nullo")
		return
	}
	const { data } = await useFetch(
		`/api/categorie?id=${categoria.id_categoria}`
	)
	const newCategoria = {
		...data.value,
		id_categoria: null,
		nome: `${data.value.nome} (copia)`,
	}
	await useFetch("/api/categorie", { method: "POST", body: newCategoria })

	// Aggiorna tutti i dati dopo la copia
	const [
		{ data: categorieAggiornate },
		{ data: categorieFasceAggiornate },
		{ data: categorieCintureAggiornate },
		{ data: categorieOverlapAggiornate },
	] = await Promise.all([
		useFetch("/api/categorie"),
		useFetch("/api/vista_categorie_fasce"),
		useFetch("/api/vista_categorie_cinture"),
		useFetch("/api/categorie-sovrapposte"),
	])

	categorie.value = categorieAggiornate.value
	categorieFasce.value = categorieFasceAggiornate.value
	categorieCinture.value = categorieCintureAggiornate.value
	categorieOverlap.value = categorieOverlapAggiornate.value
}

const copySelectedCategorie = async () => {
	if (selectedCategorie.value.length === 0) return

	loading.value = true
	loadingMessage.value = "Copia categorie in corso..."
	document.body.style.cursor = "wait"

	try {
		for (const id_categoria of selectedCategorie.value) {
			const categoria = categorie.value.find(
				(c) => c.id_categoria === id_categoria
			)
			if (categoria) {
				await copyCategoria(categoria)
			}
		}
		feedbackMessage.value = "Categorie copiate con successo"
		feedbackType.value = "success"
	} catch (error) {
		feedbackMessage.value = "Errore durante la copia"
		feedbackType.value = "error"
	} finally {
		loading.value = false
		document.body.style.cursor = "default"
		selectedCategorie.value = []
		setTimeout(() => {
			feedbackMessage.value = ""
		}, 3000)
	}
}

const getFasce = (id_categoria) => {
	return categorieFasce.value.filter(
		(fascia) => fascia.id_categoria === id_categoria
	)
}

const getCinture = (id_categoria) => {
	return categorieCinture.value.filter(
		(cintura) => cintura.id_categoria === id_categoria
	)
}

const openAutomaticForm = () => {
	automaticFormVisible.value = true
}

const closeAutomaticForm = () => {
	automaticFormVisible.value = false
}

const createCategorieAutomatiche = async (categorieData) => {
	// Aggiorna i dati dopo la creazione
	const [
		{ data: categorieAggiornate },
		{ data: categorieFasceAggiornate },
		{ data: categorieCintureAggiornate },
		{ data: categorieOverlapAggiornate }, // Aggiungi questa riga
	] = await Promise.all([
		useFetch("/api/categorie"),
		useFetch("/api/vista_categorie_fasce"),
		useFetch("/api/vista_categorie_cinture"),
		useFetch("/api/categorie-sovrapposte"), // Aggiungi questa riga
	])

	// Aggiorna tutti i riferimenti
	categorie.value = categorieAggiornate.value
	categorieFasce.value = categorieFasceAggiornate.value
	categorieCinture.value = categorieCintureAggiornate.value
	categorieOverlap.value = categorieOverlapAggiornate.value // Aggiungi questa riga

	closeAutomaticForm()
}

let draggedCategoria = null
const dragTarget = ref(null)

const onDragStart = (categoria) => {
	draggedCategoria = categoria
}

const onDragOver = (categoria) => {
	dragTarget.value = categoria.id_categoria
}

const onDragLeave = (categoria) => {
	if (dragTarget.value === categoria.id_categoria) {
		dragTarget.value = null
	}
}

const onDrop = async (targetCategoria) => {
	dragTarget.value = null
	if (
		draggedCategoria &&
		draggedCategoria.id_categoria !== targetCategoria.id_categoria
	) {
		const tempOrder = draggedCategoria.n_ordine
		draggedCategoria.n_ordine = targetCategoria.n_ordine
		targetCategoria.n_ordine = tempOrder

		// Aggiorna solo il campo n_ordine nel backend
		await useFetch(`/api/categorie?id=${draggedCategoria.id_categoria}`, {
			method: "PUT",
			body: { n_ordine: draggedCategoria.n_ordine },
		})
		await useFetch(`/api/categorie?id=${targetCategoria.id_categoria}`, {
			method: "PUT",
			body: { n_ordine: targetCategoria.n_ordine },
		})

		// Ricarica tutti i dati necessari
		const [
			{ data: categorieAggiornate },
			{ data: categorieFasceAggiornate },
			{ data: categorieCintureAggiornate },
		] = await Promise.all([
			useFetch("/api/categorie"),
			useFetch("/api/vista_categorie_fasce"),
			useFetch("/api/vista_categorie_cinture"),
		])

		// Aggiorna tutti i riferimenti
		categorie.value = categorieAggiornate.value
		categorieFasce.value = categorieFasceAggiornate.value
		categorieCinture.value = categorieCintureAggiornate.value

		// Riapplica l'ordinamento corrente
		if (sortKey.value) {
			categorie.value.sort((a, b) => {
				if (a[sortKey.value] < b[sortKey.value])
					return sortAsc.value ? -1 : 1
				if (a[sortKey.value] > b[sortKey.value])
					return sortAsc.value ? 1 : -1
				return 0
			})
		}
	}
	draggedCategoria = null
}

const hasOverlap = (id_categoria) => {
	return categorieOverlap.value?.includes(id_categoria)
}

const loading = ref(false)
const loadingMessage = ref("")
</script>

<style scoped>
/* Aggiungi transizione per l'effetto di evidenziazione */
tr {
	transition: background-color 0.2s ease;
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
</style>
