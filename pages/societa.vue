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
							<th
								class="border px-4 py-2 w-[250px] cursor-pointer"
								@click="sortTable('nome_societa')"
							>
								Nome Società
								<span v-if="sortKey === 'nome_societa'">
									{{ sortAsc ? "▲" : "▼" }}
								</span>
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
							<td class="border px-4 py-2 w-[250px]">
								{{ societa.nome_societa }}
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
		<!-- Sostituire la modale esistente con il nuovo componente -->
		<SocietaFormModal
			v-if="formVisible"
			:societa="societa"
			@close="closeForm"
			@save="saveSocieta"
		/>
		<div v-if="feedbackMessage" :class="`alert ${feedbackType}`">
			{{ feedbackMessage }}
		</div>
		<LoadingOverlay :show="loading" :message="loadingMessage" />
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useFetch } from "nuxt/app"
import LoadingOverlay from "@/components/LoadingOverlay.vue"
import SocietaFormModal from "@/components/SocietaFormModal.vue"
import { useSocietaPrint } from "@/composables/prints/useSocietaPrint"
import type { SocietaRow, MySQLError, Societa } from "~/types/global"

const societa = ref<Societa>({
	id_societa: undefined,
	nome_societa: "",
	pagato: 0,
	resto_consegnato: 0,
})

const formVisible = ref(false)
const loading = ref(false)
const loadingMessage = ref("")

const { data: societaList, error } = await useFetch<SocietaRow[]>(
	"/api/societa"
)

const selectedSocieta = ref<number[]>([])

const openForm = () => {
	formVisible.value = true
}

const closeForm = () => {
	formVisible.value = false
	societa.value = {
		id_societa: undefined,
		nome_societa: "",
		pagato: 0,
		resto_consegnato: 0,
	}
}

const feedbackMessage = ref("")
const feedbackType = ref<"success" | "error">("success")

const saveSocieta = async () => {
	loading.value = true
	loadingMessage.value = "Salvataggio in corso..."
	document.body.style.cursor = "wait"

	try {
		if (societa.value.id_societa) {
			const { data } = await useFetch<SocietaRow>(
				`/api/societa?id=${societa.value.id_societa}`,
				{
					method: "PUT",
					body: societa.value,
				}
			)
		} else {
			const { data } = await useFetch<SocietaRow>("/api/societa", {
				method: "POST",
				body: societa.value,
			})
		}
		await reloadData()
		feedbackMessage.value = "Società salvata con successo"
		feedbackType.value = "success"
		closeForm()
	} catch (error) {
		const mysqlError = error as MySQLError
		feedbackMessage.value =
			mysqlError.message || "Errore durante il salvataggio"
		feedbackType.value = "error"
	} finally {
		loading.value = false
		document.body.style.cursor = "default"
		setTimeout(() => {
			feedbackMessage.value = ""
		}, 3000)
	}
}

const reloadData = async () => {
	const { data } = await useFetch<SocietaRow[]>("/api/societa")
	if (data.value) {
		societaList.value = data.value
	}
}

const editSocieta = (societaToEdit: SocietaRow) => {
	// Converti esplicitamente i valori numerici
	societa.value = {
		id_societa: societaToEdit.id_societa,
		nome_societa: societaToEdit.nome_societa || "",
		pagato: Number(societaToEdit.pagato) || 0,
		resto_consegnato: Number(societaToEdit.resto_consegnato) || 0,
	}
	formVisible.value = true
}

const deleteSocieta = async (id_societa: number) => {
	loading.value = true
	loadingMessage.value = "Eliminazione in corso..."
	document.body.style.cursor = "wait"

	try {
		const { error } = await useFetch(`/api/societa?id=${id_societa}`, {
			method: "DELETE",
		})
		if (error.value) {
			throw error.value
		}
		societaList.value = societaList.value.filter(
			(s) => s.id_societa !== id_societa
		)
		feedbackMessage.value = "Società eliminata con successo"
		feedbackType.value = "success"
	} catch (error) {
		const mysqlError = error as MySQLError
		feedbackMessage.value =
			mysqlError.message || "Errore durante l'eliminazione"
		feedbackType.value = "error"
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

// Modifica la definizione di sortKey per accettare sia string che keyof SocietaRow
const sortKey = ref<keyof SocietaRow | "">("")
const sortAsc = ref(true)

const sortTable = (key: keyof SocietaRow) => {
	if (sortKey.value === key) {
		sortAsc.value = !sortAsc.value
	} else {
		sortKey.value = key
		sortAsc.value = true
	}
	societaList.value.sort((a, b) => {
		// Gestione semplificata dell'ordinamento
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
