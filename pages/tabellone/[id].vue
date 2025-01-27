<template>
	<div class="bg-gray-100 min-h-screen">
		<!-- Loading state -->
		<div v-if="loading" class="flex justify-center items-center h-screen">
			<p class="text-gray-600">Caricamento...</p>
		</div>

		<!-- Content when loaded -->
		<div v-else>
			<div class="bg-white shadow">
				<div class="px-8 py-4">
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

					<div class="flex items-center justify-between">
						<div class="flex items-center gap-6">
							<!-- Numero tabellone in cerchio -->
							<div class="flex-shrink-0">
								<div
									class="px-4 h-16 rounded-full border-4 border-blue-500 flex items-center justify-center bg-white"
								>
									<span
										class="text-2xl font-bold text-blue-500"
										>{{
											tabellone?.codice_tabellone ?? ""
										}}</span
									>
								</div>
							</div>
							<!-- Info tabellone -->
							<div>
								<div class="text-2xl font-bold">
									{{ tabellone?.nome_tabellone ?? "" }}
								</div>
								<div class="text-sm text-gray-500 mt-2">
									Stato:
									<span
										:class="{
											'text-yellow-600':
												tabellone?.stato === 'ATTIVO',
											'text-green-600':
												tabellone?.stato ===
												'COMPLETATO',
											'text-gray-600':
												tabellone?.stato === 'BOZZA',
										}"
										>{{ tabellone?.stato }}</span
									>
								</div>
							</div>
						</div>
						<div class="flex gap-4">
							<button
								@click="attivaTabellone"
								v-if="tabelloneData.stato === 'BOZZA'"
								class="bg-green-500 text-white px-4 py-2 rounded"
							>
								Attiva Tabellone
							</button>
							<button
								@click="completaTabellone"
								v-if="tabelloneData.stato === 'ATTIVO'"
								class="bg-blue-500 text-white px-4 py-2 rounded"
							>
								Completa Tabellone
							</button>
							<button
								@click="tornaInBozza"
								v-if="tabelloneData.stato === 'ATTIVO'"
								class="bg-yellow-500 text-white px-4 py-2 rounded"
							>
								Torna in Bozza
							</button>
							<!-- Aggiungi il nuovo pulsante di reset -->
							<button
								@click="resetVotiTabellone"
								v-if="tabelloneData.stato === 'ATTIVO'"
								class="bg-red-500 text-white px-4 py-2 rounded"
							>
								Reset Voti
							</button>
							<button
								v-if="mostraSelezioneFinale"
								@click="showSelezioneManuale = true"
								class="bg-purple-500 text-white px-4 py-2 rounded"
							>
								Selezione Manuale Finale
							</button>
							<button
								v-if="mostraDefinizioneClassifica"
								@click="showSelezioneClassifica = true"
								class="bg-green-500 text-white px-4 py-2 rounded"
							>
								Definisci Classifica
							</button>
							<button
								v-if="tabelloneData.stato === 'COMPLETATO'"
								@click="riattivaTabellone"
								class="bg-yellow-500 text-white px-4 py-2 rounded"
							>
								Riattiva Tabellone
							</button>
							<button
								@click="openModificaIncontri()"
								class="bg-orange-500 text-white px-4 py-2 rounded"
							>
								Modifica Incontri
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- Main content -->
			<div class="px-8 py-6">
				<!-- Prove -->
				<div
					class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
				>
					<div
						v-for="prova in prove"
						:key="prova.id_prova"
						class="bg-white rounded-lg shadow p-4 cursor-pointer"
						@click="router.push(`/prova/${prova.id_prova}`)"
					>
						<div class="flex items-center justify-between mb-4">
							<!-- Aggiunta badge per la finale -->
							<div class="flex items-center gap-2">
								<h3 class="text-lg font-semibold">
									Prova {{ prova.numero_prova }}
								</h3>
								<span
									v-if="prova.is_finale"
									class="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded"
								>
									Finale
								</span>
							</div>
							<span
								:class="getStatoClass(prova.stato)"
								class="px-2 py-1 rounded-full text-xs"
							>
								{{ prova.stato }}
							</span>
						</div>

						<div class="text-sm text-gray-600 mb-4">
							<p>Disciplina: {{ prova.disciplina }}</p>
							<p>Valutazione: {{ prova.tipo_tabellone }}</p>
							<p>Template: {{ prova.template_tabellone }}</p>
							<p>
								Durata incontro:
								{{
									prova.durata_incontro &&
									prova.durata_incontro !== "00:00"
										? prova.durata_incontro
										: "Senza tempo"
								}}
							</p>
							<p>Arbitri: {{ prova.numero_arbitri }}</p>
							<p>Tatami: {{ prova.tatami || "Non assegnato" }}</p>
						</div>

						<div class="flex justify-between items-center">
							<span class="text-sm text-gray-500">
								{{
									!prova.num_risultati ||
									prova.num_risultati === 0
										? "Nessun risultato registrato"
										: `${
												prova.num_risultati
										  } su ${getTotaleRisultatiAttesi(
												prova
										  )} risultati registrati`
								}}
							</span>
							<div class="flex gap-2">
								<button
									@click.stop="handleStampa(prova)"
									class="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
									title="Stampa"
								>
									<i class="fas fa-print"></i>
								</button>
								<button
									@click.stop="openModificaIncontri(prova)"
									class="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600"
									title="Modifica incontri"
								>
									<i class="fas fa-edit"></i>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Feedback message -->
		<div
			v-if="feedback.show"
			:class="[
				'fixed bottom-4 right-4 p-4 rounded-lg shadow-lg transition-opacity duration-300',
				feedback.error
					? 'bg-red-100 text-red-800'
					: 'bg-green-100 text-green-800',
			]"
		>
			{{ feedback.message }}
		</div>
		<SelezioneAtletiDialog
			:show="showSelezioneManuale"
			:atleti="atletiTabellone"
			:incontri="incontriProva"
			@close="showSelezioneManuale = false"
			@confirm="handleSelezioneManuale"
		/>
		<SelezioneClassificaDialog
			:show="showSelezioneClassifica"
			:atleti="atletiTabellone"
			@close="showSelezioneClassifica = false"
			@confirm="handleSelezioneClassifica"
		/>
		<ModificaIncontriDialog
			:show="showModificaIncontri"
			:atleti="atletiTabellone"
			:incontri="incontriProva"
			@close="showModificaIncontri = false"
			@save="handleSalvaModifiche"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useProvaPrint } from "~/composables/useProvaPrint"
import SelezioneAtletiDialog from "~/components/SelezioneAtletiDialog.vue"
import SelezioneClassificaDialog from "~/components/SelezioneClassificaDialog.vue"
import ModificaIncontriDialog from "~/components/ModificaIncontriDialog.vue"
import type {
	Tabellone,
	Prova,
	Atleta,
	StatoProva,
	Incontro,
} from "~/types/tabellone"

// Add interface for Feedback
interface Feedback {
	show: boolean
	message: string
	error: boolean
}

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const tabellone = ref<Tabellone | null>(null)
const prove = ref<Prova[]>([])
const feedback = ref<Feedback>({ show: false, message: "", error: false })
const showSelezioneManuale = ref(false)
const showSelezioneClassifica = ref(false)
const showModificaIncontri = ref(false)
const atletiTabellone = ref<Atleta[]>([])
// Modifica la definizione di incontriProva per includere il tipo corretto
const incontriProva = ref<Incontro[]>([]) // se hai bisogno di tipizzare anche gli incontri, crea un'interfaccia apposita

const tabelloneData = computed(() => {
	return (
		tabellone.value || {
			codice_tabellone: "",
			nome_tabellone: "",
			stato: "BOZZA" as const,
			pool: undefined,
			totale_iscritti: 0,
		}
	)
})

const provaFinale = computed(() => {
	return prove.value.find((p) => p.is_finale)
})

const finalistiSelezionati = computed(() => {
	if (!provaFinale.value) return false
	// Verifica se ci sono atleti assegnati alla finale
	return (
		provaFinale.value.num_risultati && provaFinale.value.num_risultati > 0
	)
})

const mostraSelezioneFinale = computed(() => {
	return tabelloneData.value.stato === "ATTIVO" && !finalistiSelezionati.value
})

const mostraDefinizioneClassifica = computed(() => {
	return tabelloneData.value.stato === "ATTIVO" && finalistiSelezionati.value
})

// Aggiungi il computed per la prova selezionata
const provaSelezionata = computed(() => {
	// Prendi la prima prova non finale come prova di riferimento
	const prova = prove.value.find((p) => !p.is_finale)
	return prova?.id_prova
})

// Aggiungi ref per la prova corrente
const provaCorrente = ref<Prova | null>(null)

// Aggiungi una ref per tracciare se la modifica è generale o specifica
const isModificaGenerale = ref(false)

// Modifica la funzione openModificaIncontri per gestire sia il click sul bottone generale che quello sulla singola prova
function openModificaIncontri(prova?: Prova) {
	if (prova) {
		// Se viene passata una prova specifica, usa quella
		provaCorrente.value = prova
		isModificaGenerale.value = false
	} else {
		// Altrimenti usa la prima prova non finale
		const primaProva = prove.value.find((p) => !p.is_finale)
		if (!primaProva) {
			showFeedback("Nessuna prova disponibile", true)
			return
		}
		provaCorrente.value = primaProva
		isModificaGenerale.value = true
	}

	// Carica gli incontri della prova selezionata
	loadIncontriProva(provaCorrente.value.id_prova)
	showModificaIncontri.value = true
}

async function loadIncontriProva(idProva: number) {
	try {
		const response = await fetch(`/api/prove/${idProva}/incontri`)
		if (!response.ok)
			throw new Error("Errore nel caricamento degli incontri")
		incontriProva.value = await response.json()
	} catch (error) {
		console.error("Errore:", error)
		showFeedback("Errore nel caricamento degli incontri", true)
	}
}

onMounted(async () => {
	await loadData()
	await loadAtletiTabellone()
})

async function loadData() {
	loading.value = true
	try {
		const [tabelloneRes, proveRes] = await Promise.all([
			fetch(`/api/tabelloni/${route.params.id}`),
			fetch(`/api/tabelloni/${route.params.id}/prove`),
		])

		// Controlla le risposte prima di procedere
		if (!tabelloneRes.ok)
			throw new Error("Errore nel caricamento del tabellone")
		if (!proveRes.ok) throw new Error("Errore nel caricamento delle prove")

		const [tabelloneData, proveData] = await Promise.all([
			tabelloneRes.json(),
			proveRes.json(),
		])

		tabellone.value = tabelloneData
		prove.value = proveData
	} catch (error) {
		console.error("Errore nel caricamento dei dati:", error)
	} finally {
		loading.value = false
	}
}

async function loadAtletiTabellone() {
	try {
		const provaRiferimento = prove.value.find((p) => !p.is_finale)
		if (!provaRiferimento) {
			throw new Error("Nessuna prova disponibile per caricare gli atleti")
		}

		// Carica sia gli atleti che gli incontri
		const [atletiRes, incontriRes] = await Promise.all([
			fetch(`/api/prove/${provaRiferimento.id_prova}/atleti`),
			fetch(`/api/prove/${provaRiferimento.id_prova}/incontri`),
		])

		if (!atletiRes.ok || !incontriRes.ok)
			throw new Error("Errore nel caricamento dei dati")

		const [atleti, incontri] = await Promise.all([
			atletiRes.json(),
			incontriRes.json(),
		])

		atletiTabellone.value = atleti
		incontriProva.value = incontri
	} catch (error) {
		console.error("Errore:", error)
		showFeedback("Errore nel caricamento dei dati", true)
	}
}

async function attivaTabellone() {
	try {
		const response = await fetch(
			`/api/tabelloni/${route.params.id}/attiva`,
			{
				method: "POST",
			}
		)
		if (!response.ok)
			throw new Error("Errore nell'attivazione del tabellone")
		await loadData()
	} catch (error) {
		console.error("Errore:", error)
	}
}

async function completaTabellone() {
	try {
		const response = await fetch(
			`/api/tabelloni/${route.params.id}/completa`,
			{
				method: "POST",
			}
		)
		if (!response.ok)
			throw new Error("Errore nel completamento del tabellone")
		await loadData()
	} catch (error) {
		console.error("Errore:", error)
	}
}

async function tornaInBozza() {
	if (
		!confirm(
			"Sei sicuro di voler riportare questo tabellone in bozza? Questo eliminerà tutti i risultati registrati."
		)
	) {
		return
	}

	try {
		const response = await fetch(
			`/api/tabelloni/${route.params.id}/torna-in-bozza`,
			{ method: "POST" }
		)

		if (!response.ok) {
			const error = await response.json()
			throw new Error(
				error.error || "Errore nel riportare il tabellone in bozza"
			)
		}

		await loadData()
	} catch (error) {
		console.error("Errore:", error)
		alert(
			error instanceof Error ? error.message : "Si è verificato un errore"
		)
	}
}

async function handleSelezioneManuale(
	atletiSelezionati: Atleta[]
): Promise<void> {
	try {
		const response = await fetch(
			`/api/tabelloni/${route.params.id}/selezione-manuale-finale`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ atleti: atletiSelezionati }),
			}
		)

		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || "Errore nella selezione manuale")
		}

		showFeedback("Selezione manuale completata con successo")
		showSelezioneManuale.value = false
		await loadData() // Ricarica i dati del tabellone
	} catch (error) {
		console.error("Errore:", error)
		showFeedback(
			error instanceof Error
				? error.message
				: "Si è verificato un errore",
			true
		)
	}
}

async function handleSelezioneClassifica(
	classifica: Array<{ id_atleta: number; posizione: number }>
) {
	try {
		if (!classifica || classifica.length === 0) {
			throw new Error("Nessun dato di classifica da salvare")
		}

		const response = await fetch(
			`/api/tabelloni/${route.params.id}/classifica`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ classifica: classifica }),
			}
		)

		const data = await response.json()

		if (!response.ok) {
			throw new Error(
				data.message || "Errore nel salvataggio della classifica"
			)
		}

		showFeedback("Classifica salvata con successo")
		showSelezioneClassifica.value = false
		await loadData()
	} catch (error) {
		showFeedback(
			error instanceof Error
				? error.message
				: "Si è verificato un errore",
			true
		)
	}
}

async function riattivaTabellone() {
	if (
		!confirm(
			"Sei sicuro di voler riattivare questo tabellone? Questo permetterà di modificare i risultati."
		)
	) {
		return
	}

	try {
		const response = await fetch(
			`/api/tabelloni/${route.params.id}/riattiva`,
			{
				method: "POST",
			}
		)

		if (!response.ok) {
			const error = await response.json()
			throw new Error(
				error.error || "Errore nella riattivazione del tabellone"
			)
		}

		await loadData()
		showFeedback("Tabellone riattivato con successo")
	} catch (error) {
		console.error("Errore:", error)
		showFeedback(
			error instanceof Error
				? error.message
				: "Si è verificato un errore",
			true
		)
	}
}

async function handleSalvaModifiche(incontriModificati: Incontro[]) {
	try {
		if (!provaCorrente.value?.id_prova) {
			// Verifica esplicitamente id_prova
			throw new Error("Nessuna prova selezionata")
		}

		const response = await fetch(
			`/api/prove/${provaCorrente.value.id_prova}/modifica-incontri`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					incontri: incontriModificati,
					modificaTutte: isModificaGenerale.value,
				}),
			}
		)

		if (!response.ok) {
			const errorData = await response.json()
			throw new Error(
				errorData.message || "Errore nel salvataggio delle modifiche"
			)
		}

		showFeedback("Modifiche salvate con successo")
		showModificaIncontri.value = false

		if (isModificaGenerale.value) {
			// Se è una modifica generale, ricarica tutto
			await loadData()
			await loadAtletiTabellone()
		} else {
			// Se è una modifica specifica, ricarica solo gli incontri della prova corrente
			await loadIncontriProva(provaCorrente.value.id_prova)
		}
	} catch (error) {
		console.error("Errore:", error)
		showFeedback("Errore nel salvataggio delle modifiche", true)
	}
}

function getStatoClass(stato: StatoProva): string {
	const classes: Record<StatoProva, string> = {
		DA_INIZIARE: "bg-gray-100 text-gray-800",
		IN_CORSO: "bg-yellow-100 text-yellow-800",
		COMPLETATA: "bg-green-100 text-green-800",
	}
	return classes[stato]
}

const showFeedback = (message: string, error: boolean = false): void => {
	feedback.value = { show: true, message, error }
	setTimeout(() => (feedback.value.show = false), 3000)
}

// Modifica la firma della funzione getTotaleRisultatiAttesi
function getTotaleRisultatiAttesi(prova: Prova): number {
	return prova.totale_incontri || 0
}

// Modifica la funzione handleStampa
const handleStampa = async (prova: Prova): Promise<void> => {
	try {
		// Aggiungi log per debug
		console.log("Tentativo di stampa prova:", {
			id: prova.id_prova,
			template: prova.template_tabellone,
			nome: prova.nome_tabellone,
		})

		const response = await fetch(`/api/prove/${prova.id_prova}/stampa`)
		if (!response.ok) throw new Error("Errore nel recupero degli incontri")
		const data = await response.json()

		// Verifica che i dati includano il template corretto
		console.log("Dati ricevuti dall'API:", {
			template: data.template_tabellone,
			incontri: data.incontri?.length,
		})

		const { stampaProva } = useProvaPrint()
		await stampaProva({
			...prova,
			template_tabellone: prova.template_tabellone, // Assicurati che questo venga passato correttamente
		})
	} catch (error) {
		console.error("Errore dettagliato:", error)
		showFeedback(
			"Errore durante la stampa: " +
				(error instanceof Error ? error.message : "Errore sconosciuto"),
			true
		)
	}
}

// Modifica la funzione resetVotiTabellone rimuovendo i type annotations
const resetVotiTabellone = async () => {
	if (
		!confirm(
			"Sei sicuro di voler resettare tutti i voti di questo tabellone? Questa azione non può essere annullata."
		)
	) {
		return
	}

	try {
		const response = await fetch(
			`/api/tabelloni/${route.params.id}/reset-voti`,
			{
				method: "POST",
			}
		)

		if (!response.ok) {
			const errorData = await response.json()
			throw new Error(errorData.error || "Errore nel reset dei voti")
		}

		await loadData()
		showFeedback("Voti resettati con successo")
	} catch (error) {
		console.error("Errore:", error)
		showFeedback(
			error instanceof Error
				? error.message
				: "Si è verificato un errore",
			true
		)
	}
}
</script>

<style scoped>
/* Aggiungi un effetto di hover per migliorare l'usabilità */
.opacity-60:hover {
	cursor: pointer;
}
</style>
