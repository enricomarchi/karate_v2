<template>
	<div class="bg-gray-100 min-h-screen">
		<!-- Header -->
		<div class="bg-white shadow">
			<div class="max-w-7xl mx-auto py-6 px-4">
				<!-- Aggiungi qui il bottone per tornare indietro -->
				<div class="mb-4">
					<button
						@click="router.push('/tabelloni')"
						class="flex items-center text-gray-600 hover:text-gray-800"
					>
						<i class="fas fa-arrow-left mr-2"></i>
						Torna ai Tabelloni
					</button>
				</div>

				<div class="flex justify-between items-center">
					<h1 class="text-3xl font-bold text-gray-900">
						Configurazioni Tabelloni
					</h1>
					<button
						@click="nuovaConfigurazione"
						class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
					>
						Nuova Configurazione
					</button>
				</div>
			</div>
		</div>

		<!-- Lista configurazioni -->
		<div class="max-w-7xl mx-auto py-6 px-4">
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<div
					v-for="config in configurazioni"
					:key="config.id"
					class="bg-white rounded-lg shadow p-6"
				>
					<div class="flex justify-between items-start mb-4">
						<div>
							<h2 class="text-xl font-semibold">
								{{ config.nome }}
							</h2>
							<p class="text-gray-600">
								{{ getProveDisplay(config.prove) }}
							</p>
						</div>
						<div class="flex gap-2">
							<button
								@click="modificaConfigurazione(config)"
								class="text-blue-500 hover:text-blue-700"
							>
								<i class="fas fa-edit"></i>
							</button>
							<button
								@click="eliminaConfigurazione(config.id)"
								class="text-red-500 hover:text-red-700"
							>
								<i class="fas fa-trash"></i>
							</button>
						</div>
					</div>

					<!-- Lista prove -->
					<div class="space-y-2">
						<div
							v-for="prova in config.prove"
							:key="prova.ordine"
							class="border rounded p-2 bg-gray-50"
						>
							<div class="flex flex-col gap-1">
								<div class="flex justify-between items-center">
									<!-- Modifica qui per usare nome_prova invece di nome -->
									<span class="font-medium">{{
										prova.nome_prova
									}}</span>
									<span class="text-gray-600 text-sm">{{
										prova.disciplina
									}}</span>
								</div>
								<div
									class="text-sm text-gray-500 flex justify-between"
								>
									<span>{{
										prova.tipo_tabellone === "punteggio"
											? "A Punteggio"
											: "A Bandierine"
									}}</span>
									<span>{{
										formatTemplateTabellone(
											prova.template_tabellone
										)
									}}</span>
									<span class="whitespace-nowrap">
										{{
											formatDuration(
												prova.durata_incontro
											)
										}}
										| {{ prova.numero_arbitri }} arbitri
									</span>
								</div>
								<!-- Aggiungi info sul calcolo totali -->
								<div
									v-if="prova.calcola_totali"
									class="text-sm text-gray-600 mt-1"
								>
									<span class="italic"
										>Calcola totali prove precedenti</span
									>
								</div>
								<!-- Aggiungi informazioni sulla finale -->
								<div
									v-if="prova.is_finale"
									class="text-sm mt-1"
								>
									<div class="text-blue-600 font-medium">
										Finale
									</div>
									<div
										class="text-gray-600"
										v-if="prova.regole_accesso"
									>
										<div
											v-if="
												prova.regole_accesso.criteri &&
												prova.regole_accesso.criteri
													.length > 0
											"
										>
											Criteri di accesso:
											<ul
												class="list-disc list-inside ml-2"
											>
												<li
													v-for="(
														criterio, idx
													) in prova.regole_accesso
														.criteri"
													:key="idx"
												>
													{{
														formatCriterio(criterio)
													}}
												</li>
											</ul>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()
const configurazioni = ref([])

onMounted(async () => {
	try {
		const response = await fetch("/api/configurazioni")
		const data = await response.json()
		// Assicurati che le prove abbiano il nome corretto
		configurazioni.value = data.map((config) => ({
			...config,
			prove: config.prove
				.sort((a, b) => a.ordine - b.ordine)
				.map((prova) => ({
					...prova,
					nome_prova: prova.nome_prova || `Prova ${prova.ordine}`,
				})),
		}))
	} catch (error) {
		// Rimuovi il console.error
	}
})

const nuovaConfigurazione = () => {
	router.push("/configurazioni/nuova")
}

const modificaConfigurazione = (config) => {
	router.push(`/configurazioni/${config.id}`)
}

const eliminaConfigurazione = async (id) => {
	if (!confirm("Sei sicuro di voler eliminare questa configurazione?")) return

	try {
		const response = await fetch(`/api/configurazioni/${id}`, {
			method: "DELETE",
		})

		if (!response.ok) throw new Error("Errore nell'eliminazione")

		configurazioni.value = configurazioni.value.filter((c) => c.id !== id)
	} catch (error) {
		// Rimuovi il console.error
		alert("Errore durante l'eliminazione della configurazione")
	}
}

// Aggiungi questa funzione per formattare i criteri
const formatCriterio = (criterio) => {
	switch (criterio.tipo) {
		case "bandierine_totali":
			return `Minimo ${criterio.valore} bandierine totali`
		case "top":
			return `Top ${criterio.valore} atleti`
		default:
			return "Criterio non specificato"
	}
}

// Aggiungi questa funzione helper
const formatTemplateTabellone = (template) => {
	// Rimuoviamo la formattazione estesa e ritorniamo direttamente il codice
	return template
}

const formatDuration = (duration) => {
	if (!duration || duration === "00:00") return "Senza tempo"
	return `${duration} min`
}

// Aggiungi questa funzione nello <script setup>
const getProveDisplay = (prove) => {
	if (!prove?.length) return "0 prove"

	const proveNormali = prove.filter((p) => !p.is_finale)
	const hasFinale = prove.some((p) => p.is_finale)

	let display = `${proveNormali.length} ${
		proveNormali.length === 1 ? "prova" : "prove"
	}`
	if (hasFinale) display += " + Finale"

	return display
}
</script>
