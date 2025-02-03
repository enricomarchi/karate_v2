<template>
	<div class="container mx-auto p-4">
		<h1 class="text-2xl font-bold mb-4">Importazione Dati</h1>

		<div class="bg-white shadow rounded p-4">
			<p class="mb-4">
				Assicurati che i file Excel siano nella cartella corretta prima
				di procedere con l'importazione.
			</p>

			<button
				@click="handleImport"
				class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
			>
				Importa dati
			</button>
		</div>

		<!-- Visualizzazione degli errori -->
		<div v-if="errorStore.errors" class="mt-4">
			<div v-if="errorStore.errors.validazione?.length" class="mb-4">
				<h2 class="text-xl font-semibold text-red-600">
					Errori di Validazione
				</h2>
				<ul class="list-disc pl-5">
					<li
						v-for="(err, index) in errorStore.errors.validazione"
						:key="index"
					>
						File: {{ err.file }} - Riga: {{ err.riga }}
						<ul class="list-disc pl-5">
							<li v-for="(det, i) in err.dettagli" :key="i">
								{{ det }}
								<span
									v-if="err.valori_grezzi"
									class="text-gray-500"
								>
									(Valore inserito: "{{
										err.valori_grezzi.anno
									}}")
								</span>
							</li>
						</ul>
					</li>
				</ul>
			</div>

			<div v-if="errorStore.errors.database?.length" class="mb-4">
				<h2 class="text-xl font-semibold text-orange-600">
					Errori Database
				</h2>
				<ul class="list-disc pl-5">
					<li
						v-for="(err, index) in errorStore.errors.database"
						:key="index"
					>
						Società: {{ err.societa }} - {{ err.errore.tipo }}
					</li>
				</ul>
			</div>

			<div v-if="errorStore.errors.sistema?.length" class="mb-4">
				<h2 class="text-xl font-semibold text-yellow-600">
					Errori di Sistema
				</h2>
				<ul class="list-disc pl-5">
					<li
						v-for="(err, index) in errorStore.errors.sistema"
						:key="index"
					>
						{{ err.errore }}
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script setup>
const handleImport = async () => {
	errorStore.clearErrors() // Reset errori prima di una nuova importazione

	try {
		const response = await $fetch("/api/import")

		if (!response.success) {
			errorStore.setErrors(response.dettagli)
			alert("Si sono verificati degli errori durante l'importazione.")
			return
		}

		if (
			response.errori_validazione > 0 ||
			response.errori_database > 0 ||
			response.errori_sistema > 0
		) {
			errorStore.setErrors(response.dettagli)
			alert(
				`Importazione completata con ${
					response.errori_validazione +
					response.errori_database +
					response.errori_sistema
				} errori. Controlla i dettagli nella finestra degli errori.`
			)
		} else {
			alert("Importazione completata con successo!")
		}
	} catch (error) {
		errorStore.setErrors({
			sistema: [
				{
					tipo: "Errore critico",
					errore:
						error.message ||
						"Errore imprevisto durante l'importazione",
				},
			],
		})
	}
}
</script>
