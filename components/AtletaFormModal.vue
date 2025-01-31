<template>
	<div
		class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50"
	>
		<div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
			<h2 class="text-2xl font-bold mb-4">
				{{ atleta.id_atleta ? "Modifica Atleta" : "Aggiungi Atleta" }}
			</h2>
			<form @submit.prevent="handleSave" class="space-y-4">
				<!-- Dati anagrafici -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block mb-1">Cognome</label>
						<input
							v-model="atleta.cognome"
							placeholder="Cognome"
							class="border p-2 rounded w-full"
							required
						/>
					</div>
					<div>
						<label class="block mb-1">Nome</label>
						<input
							v-model="atleta.nome"
							placeholder="Nome"
							class="border p-2 rounded w-full"
							required
						/>
					</div>
				</div>

				<!-- Sesso e Anno di nascita -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block mb-1">Sesso</label>
						<select
							v-model="atleta.sesso"
							class="border p-2 rounded w-full"
							required
						>
							<option value="" disabled>Seleziona sesso</option>
							<option value="M">Maschile</option>
							<option value="F">Femminile</option>
						</select>
					</div>
					<div>
						<label class="block mb-1">Anno di nascita</label>
						<input
							v-model="atleta.anno_nascita"
							type="number"
							placeholder="Anno"
							class="border p-2 rounded w-full"
							required
						/>
					</div>
				</div>

				<!-- Cintura e Dan -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block mb-1">Cintura</label>
						<select
							v-model="atleta.cintura_id"
							class="border p-2 rounded w-full"
							required
							@change="updateCintura"
						>
							<option :value="undefined" disabled>
								Seleziona cintura
							</option>
							<option
								v-for="c in cinture"
								:key="c.id_cintura"
								:value="c.id_cintura"
							>
								{{ c.colore }}
							</option>
						</select>
					</div>
					<div>
						<label class="block mb-1">Dan</label>
						<input
							v-model="atleta.dan"
							type="number"
							placeholder="Dan"
							class="border p-2 rounded w-full"
							:disabled="!isBlackBelt"
						/>
					</div>
				</div>

				<!-- Peso e Società -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block mb-1">Peso (kg)</label>
						<input
							v-model="atleta.peso_kg"
							type="number"
							step="0.1"
							placeholder="Peso in kg"
							class="border p-2 rounded w-full"
						/>
					</div>
					<div>
						<label class="block mb-1">Società</label>
						<select
							v-model="atleta.id_societa"
							class="border p-2 rounded w-full"
							required
							@change="updateSocieta"
						>
							<option value="" disabled>Seleziona società</option>
							<option
								v-for="s in societa"
								:key="s.id_societa"
								:value="s.id_societa"
							>
								{{ s.nome_societa }}
							</option>
						</select>
					</div>
				</div>

				<!-- Pulsanti -->
				<div class="flex justify-end gap-4 mt-4">
					<button
						type="submit"
						class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
					>
						Salva
					</button>
					<button
						type="button"
						@click="$emit('close')"
						class="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
					>
						Annulla
					</button>
				</div>
			</form>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from "vue"
import type { PropType } from "vue"
import type {
	Atleta,
	Cintura,
	Societa,
	CinturaRow,
	SocietaRow,
} from "~/types/global"

const props = defineProps({
	atleta: {
		type: Object as PropType<Atleta>,
		required: true,
	},
	cinture: {
		type: Array as PropType<CinturaRow[]>,
		required: true,
	},
	societa: {
		type: Array as PropType<SocietaRow[]>,
		required: true,
	},
})

const emit = defineEmits(["close", "save"])

const isBlackBelt = computed(() => {
	const cintura = props.cinture.find(
		(c) => c.id_cintura === props.atleta.cintura_id
	)
	return cintura?.colore?.toUpperCase() === "NERA"
})

const updateCintura = () => {
	const selectedCintura = props.cinture.find(
		(c) => c.id_cintura === props.atleta.cintura_id
	)

	if (selectedCintura) {
		props.atleta.cintura = {
			id_cintura: selectedCintura.id_cintura,
			colore: selectedCintura.colore || "",
			kyu: selectedCintura.kyu,
		}

		// Resetta il dan solo se la cintura cambia da nera a non-nera
		if (!isBlackBelt.value) {
			props.atleta.dan = undefined
		}
	}
}

const updateSocieta = () => {
	const selectedSocieta = props.societa.find(
		(s) => s.id_societa === props.atleta.id_societa
	)
	if (selectedSocieta) {
		props.atleta.societa = {
			id_societa: selectedSocieta.id_societa,
			nome_societa: selectedSocieta.nome_societa,
			pagato: selectedSocieta.pagato,
			resto_consegnato: selectedSocieta.resto_consegnato,
		}
	}
}

const handleSave = () => {
	emit("save", props.atleta)
}

// Aggiorna gli oggetti correlati quando cambiano i valori selezionati
watch(() => props.atleta.cintura_id, updateCintura)
watch(() => props.atleta.id_societa, updateSocieta)

onMounted(() => {
	// Aggiorna la cintura se esiste già
	if (props.atleta.cintura_id) {
		updateCintura()
	}
})
</script>

<style scoped>
input[type="number"] {
	-webkit-appearance: textfield;
	-moz-appearance: textfield;
	-ms-appearance: textfield;
	appearance: textfield;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
	-webkit-appearance: none;
	-moz-appearance: none;
	-ms-appearance: none;
	appearance: none;
	margin: 0;
}
</style>
