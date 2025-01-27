<template>
	<div
		v-if="errors && hasErrors"
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
	>
		<div
			class="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto mx-4"
		>
			<h2 class="text-xl font-bold mb-4">Errori di Importazione</h2>

			<!-- Errori di validazione -->
			<div v-if="errors.validazione?.length" class="mb-6">
				<h3 class="text-lg font-semibold text-red-600 mb-2">
					Errori nei dati ({{ errors.validazione.length }})
				</h3>
				<div
					v-for="(error, index) in errors.validazione"
					:key="'val-' + index"
					class="border-l-4 border-red-500 bg-red-50 p-4 mb-3"
				>
					<div class="font-medium">
						Società: {{ getSocieta(error.file) }}
					</div>
					<div class="mb-1">
						<span class="font-medium">Atleta:</span>
						{{ error.dati_riga.cognome }}
						{{ error.dati_riga.nome }} (riga {{ error.riga }})
					</div>
					<div
						v-for="(det, i) in error.dettagli"
						:key="i"
						class="text-sm text-red-700 ml-2"
					>
						• {{ det }}
						<span
							v-if="
								error.valori_grezzi?.anno &&
								det.includes('Anno')
							"
							class="text-red-600 font-medium"
						>
							(valore trovato: "{{ error.valori_grezzi.anno }}")
						</span>
					</div>
				</div>
			</div>

			<!-- Errori del database -->
			<div v-if="errors.database?.length" class="mb-6">
				<h3 class="text-lg font-semibold text-orange-600 mb-2">
					Errori di inserimento ({{ errors.database.length }})
				</h3>
				<div
					v-for="(error, index) in errors.database"
					:key="'db-' + index"
					class="border-l-4 border-orange-500 bg-orange-50 p-4 mb-3"
				>
					<div class="font-medium">Società: {{ error.societa }}</div>
					<div class="mb-1">
						<span class="font-medium">Atleta:</span>
						{{ error.atleta.COGNOME }} {{ error.atleta.NOME }}
					</div>
					<div class="text-sm text-orange-700">
						• {{ error.errore.errore }}
						<div
							v-if="error.errore.campo_problematico"
							class="ml-2"
						>
							Campo: {{ error.errore.campo_problematico }}
						</div>
					</div>
				</div>
			</div>

			<!-- Errori di sistema -->
			<div v-if="errors.sistema?.length" class="mb-6">
				<h3 class="text-lg font-semibold text-yellow-700 mb-2">
					Errori di sistema ({{ errors.sistema.length }})
				</h3>
				<div
					v-for="(error, index) in errors.sistema"
					:key="'sys-' + index"
					class="border-l-4 border-yellow-500 bg-yellow-50 p-4 mb-3"
				>
					<div class="font-medium">Società: {{ error.societa }}</div>
					<div class="text-sm text-yellow-700">
						{{ error.errore }}
					</div>
				</div>
			</div>

			<div class="flex justify-end mt-4">
				<button
					@click="clearErrors"
					class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
				>
					Chiudi
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { useErrorStore } from "~/stores/error"
import path from "path"

const errorStore = useErrorStore()
const errors = computed(() => errorStore.errors)
const hasErrors = computed(() => {
	return (
		errors.value &&
		(errors.value.validazione?.length || 0) +
			(errors.value.database?.length || 0) +
			(errors.value.sistema?.length || 0) >
			0
	)
})

const getSocieta = (filePath) => {
	// Estrae il nome della società dal percorso del file
	const parts = filePath.split(path.sep)
	return parts[parts.length - 2] || "Sconosciuta"
}

const clearErrors = () => {
	errorStore.clearErrors()
}
</script>
