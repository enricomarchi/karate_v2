<template>
	<div
		class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50"
	>
		<div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
			<h2 class="text-2xl font-bold mb-4">
				{{
					societa.id_societa ? "Modifica Società" : "Aggiungi Società"
				}}
			</h2>
			<form @submit.prevent="handleSave" class="space-y-4">
				<!-- Campo Nome Società -->
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">
						Nome Società
					</label>
					<input
						v-model="societa.nome_societa"
						placeholder="Inserisci il nome della società"
						class="border p-2 rounded w-full"
						required
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<!-- Campo Importo Pagato -->
					<div>
						<label
							class="block text-sm font-medium text-gray-700 mb-1"
						>
							Importo Pagato (€)
						</label>
						<input
							v-model.number="societa.pagato"
							placeholder="0.00"
							type="number"
							step="0.01"
							class="border p-2 rounded w-full"
						/>
					</div>

					<!-- Campo Resto Consegnato -->
					<div>
						<label
							class="block text-sm font-medium text-gray-700 mb-1"
						>
							Resto Consegnato (€)
						</label>
						<input
							v-model.number="societa.resto_consegnato"
							placeholder="0.00"
							type="number"
							step="0.01"
							class="border p-2 rounded w-full"
						/>
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
import type { PropType } from "vue"
import type { Societa } from "~/types/global"

const props = defineProps({
	societa: {
		type: Object as PropType<Societa>,
		required: true,
	},
})

const emit = defineEmits(["close", "save"])

const handleSave = () => {
	emit("save", props.societa)
}
</script>

<style scoped>
input[type="number"] {
	-webkit-appearance: textfield;
	-moz-appearance: textfield;
	appearance: textfield;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
	-webkit-appearance: none;
	appearance: none;
	margin: 0;
}
</style>
