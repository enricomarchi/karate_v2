<template>
	<div
		v-if="show"
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
	>
		<div
			class="bg-white rounded-lg p-6 max-w-4xl w-full h-5/6 overflow-y-auto"
		>
			<div class="flex justify-between items-center mb-6">
				<h2 class="text-xl font-bold">Definisci Classifica Finale</h2>
				<button
					@click="$emit('close')"
					class="text-gray-500 hover:text-gray-700"
				>
					<i class="fas fa-times"></i>
				</button>
			</div>

			<!-- Tabella atleti -->
			<div class="overflow-x-auto">
				<table class="min-w-full bg-white border">
					<thead>
						<tr class="bg-gray-100">
							<th class="px-4 py-2 text-left">Atleta</th>
							<th class="px-4 py-2 text-left">Società</th>
							<th class="px-4 py-2 text-center w-32">
								Posizione
							</th>
							<th class="px-4 py-2 text-center w-24">Azioni</th>
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="atleta in props.atleti"
							:key="atleta.id_atleta"
							:class="{
								'bg-blue-50': isAtletaClassificato(
									atleta.id_atleta
								),
							}"
						>
							<td class="px-4 py-2">
								{{ atleta.cognome }} {{ atleta.nome }}
							</td>
							<td class="px-4 py-2">{{ atleta.nome_societa }}</td>
							<td class="px-4 py-2">
								<input
									type="number"
									min="1"
									v-model="posizioniAtleti[atleta.id_atleta]"
									class="w-20 text-center border rounded mx-auto block"
									@blur="updatePosizione(atleta.id_atleta)"
								/>
							</td>
							<td class="px-4 py-2 text-center">
								<button
									v-if="getPosizione(atleta.id_atleta)"
									@click="rimuoviPosizione(atleta.id_atleta)"
									class="text-red-500 hover:text-red-700"
								>
									<i class="fas fa-times"></i>
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<!-- Footer con bottoni e statistiche -->
			<div class="flex justify-between items-center pt-4 border-t mt-6">
				<div class="text-sm text-gray-600">
					{{ atletiClassificati.size }} di
					{{ props.atleti.length }} atleti classificati
				</div>
				<div class="flex gap-4">
					<button
						@click="$emit('close')"
						class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
					>
						Annulla
					</button>
					<button
						@click="confermaClassifica"
						class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
						:disabled="atletiClassificati.size === 0"
					>
						Salva Classifica
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
})

const emit = defineEmits(["close", "confirm"])
const posizioniAtleti = ref({})
const classifica = ref(new Map())

const atletiClassificati = computed(() => {
	return new Set([...classifica.value.values()].flat())
})

function getPosizione(idAtleta) {
	for (const [pos, atleti] of classifica.value.entries()) {
		if (atleti.includes(idAtleta)) {
			return pos
		}
	}
	return null
}

const isAtletaClassificato = computed(() => (idAtleta) => {
	return getPosizione(idAtleta) !== null
})

function updatePosizione(idAtleta) {
	const nuovaPosizione = parseInt(posizioniAtleti.value[idAtleta])
	if (!nuovaPosizione || isNaN(nuovaPosizione)) {
		rimuoviPosizione(idAtleta)
		return
	}

	// Rimuovi l'atleta da qualsiasi posizione precedente
	rimuoviPosizione(idAtleta)

	// Aggiungi l'atleta alla nuova posizione
	if (classifica.value.has(nuovaPosizione)) {
		classifica.value.get(nuovaPosizione).push(idAtleta)
	} else {
		classifica.value.set(nuovaPosizione, [idAtleta])
	}

	// Assicurati che posizioniAtleti sia aggiornato
	posizioniAtleti.value[idAtleta] = nuovaPosizione
}

function rimuoviPosizione(idAtleta) {
	for (const [pos, atleti] of classifica.value.entries()) {
		const index = atleti.indexOf(idAtleta)
		if (index > -1) {
			atleti.splice(index, 1)
			if (atleti.length === 0) {
				classifica.value.delete(pos)
			}
			delete posizioniAtleti.value[idAtleta]
			return
		}
	}
}

function confermaClassifica() {
	if (atletiClassificati.value.size === 0) {
		alert("Devi assegnare almeno una posizione")
		return
	}

	const classificaFinale = []
	classifica.value.forEach((atleti, pos) => {
		atleti.forEach((idAtleta) => {
			classificaFinale.push({
				id_atleta: idAtleta,
				posizione: pos,
			})
		})
	})

	emit("confirm", classificaFinale)
}

watch(
	() => props.show,
	(newValue) => {
		if (!newValue) {
			classifica.value.clear()
			posizioniAtleti.value = {}
		}
	}
)
</script>
