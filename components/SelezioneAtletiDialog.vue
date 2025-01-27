<template>
	<div
		v-if="show"
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
	>
		<div
			class="bg-white rounded-lg p-6 max-w-4xl w-full h-5/6 overflow-y-auto"
		>
			<div class="flex justify-between items-center mb-6">
				<h2 class="text-xl font-bold">Seleziona finalisti</h2>
				<span class="text-sm text-gray-600">
					Selezionati: {{ atletiSelezionati.length }} atleti
				</span>
			</div>

			<!-- Lista incontri in stile kumite -->
			<div class="bg-white rounded-lg">
				<table class="min-w-full divide-y divide-gray-200">
					<tbody class="bg-white divide-y divide-gray-200">
						<template
							v-for="incontro in incontri"
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
							<!-- Riga atleta rosso -->
							<tr
								class="group h-16 cursor-pointer transition-colors"
								:class="{
									'bg-yellow-200 hover:bg-yellow-300':
										atletiSelezionati.includes(
											incontro.id_atleta_rosso
										),
									'hover:bg-gray-50':
										!atletiSelezionati.includes(
											incontro.id_atleta_rosso
										),
								}"
								v-if="getAtleta(incontro.id_atleta_rosso)"
								@click="toggleAtleta(incontro.id_atleta_rosso)"
							>
								<td class="px-6 py-2">
									<div class="flex items-center h-12">
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
										<input
											type="checkbox"
											:id="
												'atleta-' +
												incontro.id_atleta_rosso
											"
											v-model="atletiSelezionati"
											:value="incontro.id_atleta_rosso"
											class="h-5 w-5 text-red-600 mr-4"
											@click.stop
										/>
									</div>
								</td>
							</tr>
							<!-- Riga atleta bianco -->
							<tr
								class="group h-16 cursor-pointer transition-colors"
								:class="{
									'bg-yellow-200 hover:bg-yellow-300':
										atletiSelezionati.includes(
											incontro.id_atleta_bianco
										),
									'hover:bg-gray-50':
										!atletiSelezionati.includes(
											incontro.id_atleta_bianco
										),
								}"
								v-if="getAtleta(incontro.id_atleta_bianco)"
								@click="toggleAtleta(incontro.id_atleta_bianco)"
							>
								<td class="px-6 py-2 border-t-0">
									<div class="flex items-center h-12">
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
										<input
											type="checkbox"
											:id="
												'atleta-' +
												incontro.id_atleta_bianco
											"
											v-model="atletiSelezionati"
											:value="incontro.id_atleta_bianco"
											class="h-5 w-5 text-gray-600 mr-4"
											@click.stop
										/>
									</div>
								</td>
							</tr>
						</template>
					</tbody>
				</table>
			</div>

			<!-- Footer con bottoni -->
			<div class="flex justify-between items-center pt-4 border-t mt-6">
				<div class="text-sm text-gray-600">
					Minimo consigliato: 4 atleti
				</div>
				<div class="flex gap-4">
					<button
						@click="$emit('close')"
						class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
					>
						Annulla
					</button>
					<button
						@click="confermaSelezionati"
						class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
						:disabled="atletiSelezionati.length < 2"
						:class="{
							'opacity-50 cursor-not-allowed':
								atletiSelezionati.length < 2,
						}"
					>
						Conferma selezione
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, watch } from "vue"

const props = defineProps({
	show: Boolean,
	atleti: {
		type: Array,
		required: true,
		default: () => [],
	},
	incontri: {
		type: Array,
		required: true,
		default: () => [],
	},
})

const emit = defineEmits(["close", "confirm"])
const atletiSelezionati = ref([])

function getAtleta(id) {
	return props.atleti.find((a) => a.id_atleta === id)
}

function getAtletaNomeCompleto(id) {
	const atleta = getAtleta(id)
	return atleta ? `${atleta.cognome} ${atleta.nome}` : ""
}

const confermaSelezionati = () => {
	if (atletiSelezionati.value.length < 2) {
		alert("Seleziona almeno 2 atleti per continuare")
		return
	}
	emit("confirm", atletiSelezionati.value)
	atletiSelezionati.value = [] // Reset selezione
}

// Reset quando il dialog viene chiuso
watch(
	() => props.show,
	(newValue) => {
		if (!newValue) atletiSelezionati.value = []
	}
)

// Aggiungi questa funzione per gestire il toggle della selezione
function toggleAtleta(idAtleta) {
	const index = atletiSelezionati.value.indexOf(idAtleta)
	if (index === -1) {
		atletiSelezionati.value.push(idAtleta)
	} else {
		atletiSelezionati.value.splice(index, 1)
	}
}
</script>
