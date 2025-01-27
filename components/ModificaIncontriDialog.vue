<template>
	<div
		v-if="show"
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
	>
		<div
			class="bg-white rounded-lg p-6 max-w-4xl w-full h-5/6 overflow-y-auto"
		>
			<div class="flex justify-between items-center mb-6">
				<h2 class="text-xl font-bold">Modifica incontri</h2>
				<span class="text-sm text-gray-600"
					>Trascina gli atleti per modificare gli accoppiamenti</span
				>
			</div>

			<!-- Lista incontri -->
			<div class="bg-white rounded-lg">
				<table class="min-w-full divide-y divide-gray-200">
					<tbody class="bg-white divide-y divide-gray-200">
						<template
							v-for="incontro in incontriModificati"
							:key="incontro.id_incontro"
						>
							<!-- Header numero incontro -->
							<tr class="bg-gray-50">
								<td
									class="px-6 py-2 text-sm font-medium text-gray-500"
								>
									Incontro {{ incontro.ordine }}
								</td>
							</tr>
							<!-- Zona di drop per atleta rosso -->
							<tr
								class="h-16 transition-colors"
								:class="{
									'bg-red-50':
										isDraggingOver ===
										'rosso-' + incontro.ordine,
								}"
							>
								<td
									class="px-6 py-2"
									@dragover.prevent
									@drop="
										handleDrop($event, 'rosso', incontro)
									"
								>
									<div
										v-if="
											getAtleta(incontro.id_atleta_rosso)
										"
										class="flex items-center h-12"
										draggable="true"
										@dragstart="
											handleDragStart(
												$event,
												incontro,
												'rosso'
											)
										"
									>
										<div class="flex gap-2">
											<div
												class="border rounded px-2 text-sm text-gray-600 w-12 text-center"
											>
												<span class="font-bold">{{
													incontro.id_atleta_rosso
												}}</span>
											</div>
											<div
												class="border rounded px-2 text-sm"
											>
												<span
													class="font-bold text-red-600"
													>R</span
												>
											</div>
										</div>
										<div class="ml-4 flex-1">
											<div
												class="text-sm font-medium text-red-600"
											>
												{{
													getAtletaNomeCompleto(
														incontro.id_atleta_rosso
													)
												}}
											</div>
											<div class="text-xs text-gray-500">
												{{
													getAtleta(
														incontro.id_atleta_rosso
													)?.nome_societa
												}}
											</div>
										</div>
									</div>
									<div
										v-else
										class="h-12 border-2 border-dashed border-gray-300 rounded flex items-center justify-center"
									>
										<span class="text-gray-400"
											>Trascina qui un atleta</span
										>
									</div>
								</td>
							</tr>
							<!-- Zona di drop per atleta bianco -->
							<tr
								class="h-16 transition-colors"
								:class="{
									'bg-blue-50':
										isDraggingOver ===
										'bianco-' + incontro.ordine,
								}"
							>
								<td
									class="px-6 py-2 border-t-0"
									@dragover.prevent
									@drop="
										handleDrop($event, 'bianco', incontro)
									"
								>
									<div
										v-if="
											getAtleta(incontro.id_atleta_bianco)
										"
										class="flex items-center h-12"
										draggable="true"
										@dragstart="
											handleDragStart(
												$event,
												incontro,
												'bianco'
											)
										"
									>
										<div class="flex gap-2">
											<div
												class="border rounded px-2 text-sm text-gray-600 w-12 text-center"
											>
												<span class="font-bold">{{
													incontro.id_atleta_bianco
												}}</span>
											</div>
											<div
												class="border rounded px-2 text-sm"
											>
												<span
													class="font-bold text-gray-700"
													>B</span
												>
											</div>
										</div>
										<div class="ml-4 flex-1">
											<div
												class="text-sm font-medium text-gray-700"
											>
												{{
													getAtletaNomeCompleto(
														incontro.id_atleta_bianco
													)
												}}
											</div>
											<div class="text-xs text-gray-500">
												{{
													getAtleta(
														incontro.id_atleta_bianco
													)?.nome_societa
												}}
											</div>
										</div>
									</div>
									<div
										v-else
										class="h-12 border-2 border-dashed border-gray-300 rounded flex items-center justify-center"
									>
										<span class="text-gray-400"
											>Trascina qui un atleta</span
										>
									</div>
								</td>
							</tr>
						</template>
					</tbody>
				</table>
			</div>

			<!-- Footer con bottoni -->
			<div class="flex justify-end items-center pt-4 border-t mt-6 gap-4">
				<button
					@click="$emit('close')"
					class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
				>
					Annulla
				</button>
				<button
					@click="salvaModifiche"
					class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
				>
					Salva modifiche
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue" // Aggiungi watch all'importazione
import type { Incontro, Atleta } from "~/types/tabellone"

const props = defineProps<{
	show: boolean
	atleti: Atleta[]
	incontri: Incontro[]
}>()

const emit = defineEmits<{
	close: []
	save: [incontri: Incontro[]]
}>()

const isDraggingOver = ref("")
const incontriModificati = ref<Incontro[]>([...props.incontri])

// Aggiungi questo watcher per mantenere sincronizzati gli incontri
watch(
	() => props.incontri,
	(newIncontri) => {
		incontriModificati.value = [...newIncontri]
	},
	{ immediate: true }
)

// Utility functions
function getAtleta(id: number | null) {
	return id ? props.atleti.find((a) => a.id_atleta === id) : null
}

function getAtletaNomeCompleto(id: number | null) {
	const atleta = getAtleta(id)
	return atleta ? `${atleta.cognome} ${atleta.nome}` : ""
}

// Drag and drop handlers
function handleDragStart(
	event: DragEvent,
	incontro: Incontro,
	colore: "rosso" | "bianco"
) {
	if (event.dataTransfer) {
		event.dataTransfer.setData(
			"application/json",
			JSON.stringify({
				incontroOrigine: incontro.ordine,
				coloreOrigine: colore,
				idAtleta:
					colore === "rosso"
						? incontro.id_atleta_rosso
						: incontro.id_atleta_bianco,
			})
		)
	}
}

function handleDrop(
	event: DragEvent,
	coloreDest: string,
	incontroDest: Incontro
) {
	isDraggingOver.value = ""
	const data = JSON.parse(
		event.dataTransfer?.getData("application/json") || "{}"
	)

	// Trova l'incontro di origine
	const incontroOrigine = incontriModificati.value.find(
		(i) => i.ordine === data.incontroOrigine
	)
	if (!incontroOrigine) return

	// Scambia gli atleti
	const atletaOrigine =
		data.coloreOrigine === "rosso"
			? incontroOrigine.id_atleta_rosso
			: incontroOrigine.id_atleta_bianco
	const atletaDest =
		coloreDest === "rosso"
			? incontroDest.id_atleta_rosso
			: incontroDest.id_atleta_bianco

	if (data.coloreOrigine === "rosso") {
		incontroOrigine.id_atleta_rosso = atletaDest
	} else {
		incontroOrigine.id_atleta_bianco = atletaDest
	}

	if (coloreDest === "rosso") {
		incontroDest.id_atleta_rosso = atletaOrigine
	} else {
		incontroDest.id_atleta_bianco = atletaOrigine
	}
}

function salvaModifiche() {
	emit("save", incontriModificati.value)
}

// Gestione effetti drag over
function onDragOver(event: DragEvent, tipo: string) {
	event.preventDefault()
	isDraggingOver.value = tipo
}
</script>
