<template>
	<div class="bg-gray-100">
		<!-- Main toolbar -->
		<div
			class="flex items-center justify-between mx-auto px-24 w-full py-4 bg-gray-200 fixed top-16 z-10"
		>
			<div class="flex items-center gap-4">
				<h1 class="text-2xl font-bold">Tabelloni</h1>
				<span class="text-sm text-gray-600"
					>{{ tabelloni?.length || 0 }} tabelloni totali</span
				>
				<span
					v-if="selectedTabelloni.length > 0"
					class="text-sm text-gray-600"
				>
					({{ selectedTabelloni.length }} selezionati)
				</span>
				<!-- Sposta qui il select della configurazione -->
				<select
					v-if="selectedTabelloni.length > 0"
					v-model="selectedConfigurazioneMultipla"
					class="px-4 py-2 rounded text-sm"
					@change="applicaConfigurazioneMultipla"
				>
					<option value="">Applica configurazione</option>
					<option
						v-for="config in configurazioni"
						:key="config.id"
						:value="config.id"
					>
						{{ config.nome }}
					</option>
				</select>
			</div>
			<div class="flex gap-4 items-center">
				<button
					@click="toggleSelectAll"
					class="bg-gray-500 text-white w-10 h-10 rounded hover:bg-gray-600 flex items-center justify-center"
					:title="
						areAllSelected ? 'Deseleziona tutto' : 'Seleziona tutto'
					"
				>
					<i
						class="fas"
						:class="
							areAllSelected
								? 'fa-times-square'
								: 'fa-check-square'
						"
					></i>
				</button>

				<!-- Azioni multiple -->
				<div
					v-if="selectedTabelloni.length > 0"
					class="flex items-center gap-2"
				>
					<!-- Bottoni di azione -->
					<button
						v-if="canActivateMultiple"
						@click="attivaTabelloniSelezionati"
						class="bg-green-500 text-white w-10 h-10 rounded hover:bg-green-600 flex items-center justify-center"
						title="Attiva tabelloni selezionati"
					>
						<i class="fas fa-play"></i>
					</button>

					<button
						v-if="canCompletaMultiple"
						@click="completaTabelloniSelezionati"
						class="bg-blue-500 text-white w-10 h-10 rounded hover:bg-blue-600 flex items-center justify-center"
						title="Completa tabelloni selezionati"
					>
						<i class="fas fa-check"></i>
					</button>

					<button
						v-if="canTornaBozzaMultiple"
						@click="tornaBozzaTabelloniSelezionati"
						class="bg-yellow-500 text-white w-10 h-10 rounded hover:bg-yellow-600 flex items-center justify-center"
						title="Riporta in bozza i tabelloni selezionati"
					>
						<i class="fas fa-undo"></i>
					</button>

					<button
						v-if="canRiattivaMultiple"
						@click="riattivaTabelloniSelezionati"
						class="bg-purple-500 text-white w-10 h-10 rounded hover:bg-purple-600 flex items-center justify-center"
						title="Riattiva tabelloni selezionati"
					>
						<i class="fas fa-redo"></i>
					</button>

					<button
						@click="stampaTabelloniSelezionati"
						class="bg-gray-500 text-white w-10 h-10 rounded hover:bg-gray-600 flex items-center justify-center"
						title="Stampa tabelloni selezionati"
					>
						<i class="fas fa-print"></i>
					</button>

					<!-- Nuovo bottone per toggleStampato -->
					<button
						@click="toggleStampatoSelezionati"
						class="bg-orange-500 text-white w-10 h-10 rounded hover:bg-orange-600 flex items-center justify-center"
						:title="
							'Imposta come ' +
							(isAnySelected ? 'Da stampare' : 'Stampato')
						"
					>
						<span
							class="relative inline-flex items-center justify-center"
						>
							<i class="fas fa-clipboard-check"></i>
							<i
								v-if="isAnySelected"
								class="fas fa-ban absolute text-red-500 text-lg opacity-75"
								style="transform: translate(-50%, -50%)"
							></i>
						</span>
					</button>

					<!-- Aggiungi il pulsante di reset nelle azioni multiple -->
					<button
						v-if="canResetVotiMultiple"
						@click="resetVotiMultipli"
						class="bg-red-500 text-white w-10 h-10 rounded hover:bg-red-600 flex items-center justify-center"
						title="Reset voti tabelloni selezionati"
					>
						<i class="fas fa-eraser"></i>
					</button>
				</div>

				<!-- Configurazioni button -->
				<button
					@click="router.push('/configurazioni')"
					class="bg-green-500 text-white w-10 h-10 rounded hover:bg-green-600 flex items-center justify-center"
					title="Gestisci configurazioni"
				>
					<i class="fas fa-cog"></i>
				</button>
			</div>
		</div>

		<!-- Filters toolbar -->
		<div
			class="flex items-center gap-4 mx-auto px-24 w-full py-3 bg-white fixed top-32 z-10 border-b shadow-sm"
		>
			<select
				v-model="selectedDisciplina"
				class="px-4 py-2 rounded border"
			>
				<option value="">Tutte le discipline</option>
				<option
					v-for="d in discipline"
					:key="d.id_disciplina"
					:value="d.id_disciplina"
				>
					{{ d.valore }}
				</option>
			</select>
			<select v-model="selectedStato" class="px-4 py-2 rounded border">
				<option value="">Tutti gli stati</option>
				<option value="BOZZA">Bozza</option>
				<option value="ATTIVO">Attivo</option>
				<option value="COMPLETATO">Completato</option>
			</select>
			<select v-model="selectedStampato" class="px-4 py-2 rounded border">
				<option value="">Tutti gli stati di stampa</option>
				<option value="true">Stampati</option>
				<option value="false">Da stampare</option>
			</select>
			<select v-model="selectedIscritti" class="px-4 py-2 rounded border">
				<option value="">Tutti i tabelloni</option>
				<option value="con">Con iscritti</option>
				<option value="senza">Senza iscritti</option>
			</select>
		</div>

		<!-- Main content -->
		<div class="pt-44 pb-8 px-24">
			<!-- Tabelloni esistenti -->
			<div v-if="tabelloniFiltrati.length" class="mb-8">
				<div
					class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
				>
					<div
						v-for="tabellone in tabelloniFiltrati"
						:key="tabellone.id_tabellone"
						class="rounded-lg shadow-sm p-4 transition-shadow cursor-pointer relative"
						:class="[
							getCardStyle(tabellone),
							tabellone.totale_iscritti > 0 ? '' : 'opacity-50',
							selectedTabelloni.includes(tabellone.id_tabellone)
								? 'ring-2 ring-blue-500'
								: '',
						]"
						@click="
							tabellone.totale_iscritti > 0
								? router.push(
										`/tabellone/${tabellone.id_tabellone}`
								  )
								: null
						"
					>
						<!-- Checkbox per selezione invece dell'indicatore -->
						<div class="absolute top-2 left-2" @click.stop>
							<input
								type="checkbox"
								:checked="
									selectedTabelloni.includes(
										tabellone.id_tabellone
									)
								"
								@change="
									toggleSelection(tabellone.id_tabellone)
								"
								class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
							/>
						</div>

						<!-- Contenuto del tabellone -->
						<div class="h-full">
							<!-- Header compatto -->
							<div class="flex items-center justify-between mb-2">
								<div class="flex items-center gap-1">
									<span
										:class="statoClass(tabellone.stato)"
										class="px-2 py-0.5 rounded-full text-xs font-medium"
									>
										{{ tabellone.stato }}
									</span>
									<span
										v-if="tabellone.totale_iscritti > 0"
										:class="[
											'px-2 py-0.5 rounded-full text-xs font-medium',
											tabellone.stampato
												? 'bg-green-100 text-green-800'
												: 'bg-red-100 text-red-800',
										]"
									>
										{{
											tabellone.stampato
												? "Stampato"
												: "Da stampare"
										}}
									</span>
								</div>
								<div>
									<span
										class="flex items-center justify-center px-3 h-8 rounded-full border-2 text-sm font-bold"
										:class="
											getDisciplinaStyle(
												tabellone.disciplina_principale
											)
										"
									>
										{{ tabellone.codice_tabellone }}
									</span>
								</div>
							</div>

							<!-- Info principali -->
							<h3
								class="text-base font-semibold truncate mb-1"
								:title="tabellone.nome_tabellone"
							>
								{{ tabellone.nome_tabellone }}
							</h3>

							<!-- Stats compatte -->
							<div
								class="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3"
							>
								<div>
									Categorie:
									{{ tabellone.num_categorie || 0 }}
								</div>
								<div>Prove: {{ tabellone.num_prove || 0 }}</div>
								<div>
									Disciplina:
									{{
										tabellone.disciplina_principale || "N/D"
									}}
								</div>
								<div>
									Sesso:
									{{ getSessoFromTabellone(tabellone) }}
								</div>
								<div class="col-span-2">
									Fasce: {{ tabellone.fasce || "N/D" }}
								</div>
								<div class="col-span-2">
									Cinture: {{ tabellone.cinture || "N/D" }}
								</div>
								<div class="col-span-2">
									Iscritti:
									<span
										class="inline-flex items-center justify-center px-2 py-0.5 ml-1 text-xs font-medium rounded-full"
										:class="[
											tabellone.totale_iscritti > 0
												? 'bg-blue-100 text-blue-800'
												: 'bg-red-100 text-red-800',
										]"
									>
										{{ tabellone.totale_iscritti || 0 }}
									</span>
								</div>
								<!-- Configurazione inline -->
								<div
									v-if="tabellone.totale_iscritti > 0"
									class="col-span-2 flex flex-col gap-1"
								>
									<span>Configurazione:</span>
									<select
										v-model="tabellone.configurazione_id"
										@change.stop="
											applicaConfigurazione(tabellone)
										"
										@click.stop
										class="w-full border rounded text-xs px-1.5 py-0.5 text-gray-600"
									>
										<option value="">
											Seleziona config.
										</option>
										<option
											v-for="config in configurazioni"
											:key="config.id"
											:value="config.id"
										>
											{{ config.nome }}
										</option>
									</select>
								</div>
							</div>

							<!-- Azioni compatte -->
							<div
								class="flex justify-between items-center pt-2 border-t"
							>
								<div class="flex gap-1">
									<button
										v-if="tabellone.totale_iscritti > 0"
										@click.stop="
											stampaDirettaTabellone(tabellone)
										"
										class="text-gray-500 hover:text-gray-700 p-1"
										title="Stampa"
									>
										<i class="fas fa-print text-xs"></i>
									</button>
									<button
										v-if="tabellone.stato === 'BOZZA'"
										@click.stop="
											eliminaTabellone(tabellone)
										"
										class="text-red-500 hover:text-red-700 p-1"
										title="Elimina"
									>
										<i class="fas fa-trash text-xs"></i>
									</button>
									<!-- Nuovo bottone per ricalcolare la configurazione -->
									<button
										v-if="
											tabellone.configurazione_id &&
											tabellone.stato === 'BOZZA'
										"
										@click.stop="
											ricalcolaConfigurazione(
												tabellone.id_tabellone
											)
										"
										class="text-yellow-500 hover:text-yellow-700 p-1"
										title="Ricalcola configurazione"
									>
										<i class="fas fa-sync text-xs"></i>
									</button>
									<!-- Nuovo bottone per rimuovi la configurazione -->
									<button
										v-if="
											tabellone.configurazione_id &&
											tabellone.stato === 'BOZZA'
										"
										@click.stop="
											rimuoviConfigurazione(
												tabellone.id_tabellone
											)
										"
										class="text-red-500 hover:text-red-700 p-1"
										title="Rimuovi configurazione"
									>
										<i class="fas fa-times text-xs"></i>
									</button>
									<button
										v-if="tabellone.stato === 'ATTIVO'"
										@click.stop="tornaInBozza(tabellone)"
										class="text-yellow-500 hover:text-yellow-700 p-1"
										title="Torna in Bozza"
									>
										<i class="fas fa-undo-alt text-xs"></i>
									</button>
									<!-- Aggiungi il pulsante di reset -->
									<button
										v-if="tabellone.stato === 'ATTIVO'"
										@click.stop="
											resetVotiTabellone(
												tabellone.id_tabellone
											)
										"
										class="text-red-500 hover:text-red-700 p-1"
										title="Reset voti"
									>
										<i class="fas fa-eraser text-xs"></i>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Messaggio di feedback -->
		<div
			v-if="feedback.show"
			:class="[
				'fixed bottom-4 right-4 p-4 rounded-lg shadow-lg',
				feedback.error
					? 'bg-red-100 text-red-800'
					: 'bg-green-100 text-green-800',
			]"
		>
			{{ feedback.message }}
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useRouter, useAsyncData } from "#app"
import { useProvaPrint } from "../../composables/prints/useProvaPrint"
import type { Tabellone } from "../../types/tabellone"

// Rimuovi le interfacce duplicate e mantieni solo quelle specifiche del componente
interface Feedback {
	show: boolean
	message: string
	error: boolean
}

interface Discipline {
	id_disciplina: string
	valore: string
}

interface Configurazione {
	id: number
	nome: string
}

const route = useRoute()
const router = useRouter()
const selectedDisciplina = ref("")
const selectedStato = ref("")
const feedback = ref<Feedback>({ show: false, message: "", error: false })
const loading = ref(false)

const matriceData = ref<any[]>([]) // TODO: Define proper type
const discipline = ref<Discipline[]>([])
const tabelloni = ref<Tabellone[]>([])
const configurazioni = ref<Configurazione[]>([])

// Keep only one instance of each of these refs
const selectedTabelloni = ref<number[]>([])
const selectedConfigurazioneMultipla = ref("")
const selectedStampato = ref("")
const selectedIscritti = ref("con")

// Aggiungi questa computed property
const areAllSelected = computed(() => {
	return (
		tabelloniFiltrati.value.length > 0 &&
		selectedTabelloni.value.length === tabelloniFiltrati.value.length
	)
})

// Aggiungi queste funzioni per gestire la selezione
const toggleSelection = (id: number): void => {
	const index = selectedTabelloni.value.indexOf(id)
	if (index === -1) {
		selectedTabelloni.value.push(id)
	} else {
		selectedTabelloni.value.splice(index, 1)
	}
}

const toggleSelectAll = () => {
	if (areAllSelected.value) {
		selectedTabelloni.value = []
	} else {
		selectedTabelloni.value = tabelloniFiltrati.value.map(
			(t) => t.id_tabellone
		)
	}
}

// Funzione per inizializzare i tabelloni
const initializeTabelloni = async () => {
	loading.value = true
	try {
		console.log("Inizio inizializzazione tabelloni") // Debug log

		// Carica i dati necessari
		const matriceResponse = await $fetch("/api/matrice-iscrizioni")
		console.log(
			"Matrice iscrizioni caricata:",
			matriceResponse?.length || 0,
			"elementi"
		) // Debug log

		if (!matriceResponse || !matriceResponse.length) {
			console.warn("Nessun dato nella matrice iscrizioni")
			return
		}

		matriceData.value = matriceResponse

		// Carica discipline e tabelloni esistenti
		const [disciplineData, configurazioniData, tabelloniEsistenti] =
			await Promise.all([
				$fetch("/api/discipline"),
				$fetch("/api/configurazioni"),
				$fetch("/api/tabelloni"),
			])

		discipline.value = disciplineData
		configurazioni.value = configurazioniData
		tabelloni.value = tabelloniEsistenti

		console.log("Tabelloni esistenti:", tabelloniEsistenti?.length || 0) // Debug log

		// Raggruppa le categorie
		const categoriePerAccorpamento = {}
		for (const cat of matriceData.value) {
			if (cat.n_accorpamento) {
				const key = `acc_${cat.n_accorpamento}`
				if (!categoriePerAccorpamento[key])
					categoriePerAccorpamento[key] = []
				categoriePerAccorpamento[key].push(cat)
			} else if (cat.num_pools) {
				for (let i = 1; i <= cat.num_pools; i++) {
					const key = `pool_${cat.n_ordine}_${i}`
					if (!categoriePerAccorpamento[key])
						categoriePerAccorpamento[key] = []
					categoriePerAccorpamento[key].push({ ...cat, pool: i })
				}
			} else {
				const key = `single_${cat.n_ordine}`
				if (!categoriePerAccorpamento[key])
					categoriePerAccorpamento[key] = []
				categoriePerAccorpamento[key].push(cat)
			}
		}

		// Crea o aggiorna i tabelloni
		for (const [key, categorie] of Object.entries(
			categoriePerAccorpamento
		)) {
			const isAccorpamento = key.startsWith("acc_")
			const isPool = key.startsWith("pool_")
			const primaCategoria = categorie[0]

			const codiceTabellone = isAccorpamento
				? categorie.map((c) => c.n_ordine).join("-")
				: isPool
				? `${primaCategoria.n_ordine}.${primaCategoria.pool}`
				: String(primaCategoria.n_ordine)

			const tabelloneData = {
				categoria_id: categorie.map((c) => c.id_categoria),
				nome_tabellone: isAccorpamento
					? primaCategoria.nome_accorpamento
					: isPool
					? `${primaCategoria.cinture} ${primaCategoria.fascia} - Pool ${primaCategoria.pool}`
					: `${primaCategoria.cinture} ${primaCategoria.fascia}`,
				codice_tabellone: codiceTabellone,
				pool: isPool ? primaCategoria.pool : null,
			}

			console.log("Creazione tabellone:", codiceTabellone) // Debug log

			try {
				await $fetch("/api/tabelloni", {
					method: "POST",
					body: tabelloneData,
				})
			} catch (error) {
				console.error(
					"Errore creazione tabellone:",
					codiceTabellone,
					error
				)
			}
		}

		// Ricarica i tabelloni
		const tabelloniAggiornati = await $fetch("/api/tabelloni")
		tabelloni.value = tabelloniAggiornati
		console.log(
			"Tabelloni dopo aggiornamento:",
			tabelloniAggiornati?.length || 0
		) // Debug log

		showFeedback("Tabelloni aggiornati con successo")
	} catch (error) {
		console.error("Errore nell'inizializzazione:", error)
		showFeedback("Errore nel caricamento dei dati", true)
	} finally {
		loading.value = false
	}
}

// Funzione per caricare i tabelloni
async function loadTabelloni() {
	try {
		const { data } = await useAsyncData("tabelloni", () =>
			$fetch("/api/tabelloni")
		)
		tabelloni.value = data.value
	} catch (error) {
		console.error("Errore nel caricamento dei tabelloni:", error)
		showFeedback("Errore nel caricamento dei tabelloni", true)
	}
}

async function loadConfigurazioni() {
	try {
		const { data } = await useAsyncData("configurazioni", () =>
			$fetch("/api/configurazioni")
		)
		configurazioni.value = data.value
	} catch (error) {
		console.error("Errore nel caricamento delle configurazioni:", error)
		showFeedback("Errore nel caricamento delle configurazioni", true)
	}
}

// Modifica l'onMounted esistente per includere anche il caricamento delle configurazioni
onMounted(async () => {
	await Promise.all([initializeTabelloni(), loadConfigurazioni()])
})

// Computed properties
const tabelloniFiltrati = computed(() => {
	if (!tabelloni.value) return []
	return tabelloni.value
		.filter(
			(t) =>
				!selectedDisciplina.value ||
				t.disciplina_principale === selectedDisciplina.value
		)
		.filter((t) => !selectedStato.value || t.stato === selectedStato.value)
		.filter((t) => {
			if (selectedStampato.value === "") return true
			// Converti esplicitamente il valore booleano per il confronto
			const stampato = selectedStampato.value === "true"
			// Gestisci il caso in cui t.stampato potrebbe essere null o undefined
			return Boolean(t.stampato) === stampato
		})
		.filter((t) => {
			if (!selectedIscritti.value) return true
			if (selectedIscritti.value === "con") return t.totale_iscritti > 0
			return t.totale_iscritti === 0
		})
		.sort((a, b) => {
			// Gestisci sia i codici con punti che quelli con trattini
			const getNumbers = (code) => {
				if (code.includes(".")) {
					const [main, sub] = code.split(".").map(Number)
					return { main, sub: sub || 0 }
				}
				if (code.includes("-")) {
					const nums = code.split("-").map(Number)
					return { main: nums[0], sub: 0 }
				}
				return { main: Number(code), sub: 0 }
			}

			const aNumbers = getNumbers(a.codice_tabellone)
			const bNumbers = getNumbers(b.codice_tabellone)

			if (aNumbers.main !== bNumbers.main) {
				return aNumbers.main - bNumbers.main
			}
			return aNumbers.sub - bNumbers.sub
		})
})

// Aggiungi queste computed properties per gestire la visibilità dei bottoni
const canActivateMultiple = computed(() => {
	return selectedTabelloni.value.every((id) => {
		const tabellone = tabelloni.value.find((t) => t.id_tabellone === id)
		return tabellone?.stato === "BOZZA"
	})
})

const canCompletaMultiple = computed(() => {
	return selectedTabelloni.value.every((id) => {
		const tabellone = tabelloni.value.find((t) => t.id_tabellone === id)
		return tabellone?.stato === "ATTIVO"
	})
})

const canTornaBozzaMultiple = computed(() => {
	return selectedTabelloni.value.every((id) => {
		const tabellone = tabelloni.value.find((t) => t.id_tabellone === id)
		return tabellone?.stato === "ATTIVO"
	})
})

const canRiattivaMultiple = computed(() => {
	return selectedTabelloni.value.every((id) => {
		const tabellone = tabelloni.value.find((t) => t.id_tabellone === id)
		return tabellone?.stato === "COMPLETATO"
	})
})

// Aggiungi questa computed property
const isAnySelected = computed(() => {
	return selectedTabelloni.value.some((id) => {
		const tabellone = tabelloni.value.find((t) => t.id_tabellone === id)
		return tabellone?.stampato
	})
})

// Aggiungi queste computed properties nelle computed properties esistenti
const canResetVotiMultiple = computed(() => {
	return selectedTabelloni.value.every((id) => {
		const tabellone = tabelloni.value.find((t) => t.id_tabellone === id)
		return tabellone?.stato === "ATTIVO"
	})
})

// Helper functions
const showFeedback = (message: string, error = false): void => {
	feedback.value = { show: true, message, error }
	setTimeout(() => (feedback.value.show = false), 3000)
}

const statoClass = (stato: string): string => {
	const classes: Record<string, string> = {
		BOZZA: "bg-yellow-100 text-yellow-800",
		ATTIVO: "bg-green-100 text-green-800",
		COMPLETATO: "bg-blue-100 text-blue-800",
	}
	return classes[stato] || "bg-gray-100 text-gray-800"
}

const getDisciplinaStyle = (disciplina?: string): string => {
	if (disciplina === "KATA") {
		return "border-blue-500 text-blue-600"
	} else if (disciplina === "KUMITE") {
		return "border-red-500 text-red-600"
	}
	return "border-gray-500 text-gray-600"
}

const getCardStyle = (tabellone: Tabellone): string => {
	// Base class con sfondo bianco
	return "bg-white"
}

const getSessoFromTabellone = (tabellone: Tabellone): string => {
	if (!tabellone.categorie) return "N/D"

	// Check if any category contains "MASCHILE"
	const hasMaschile = String(tabellone.categorie).includes("MASCHILE")
	// Check if any category contains "FEMMINILE"
	const hasFemminile = String(tabellone.categorie).includes("FEMMINILE")

	if (hasMaschile && hasFemminile) return "MISTO"
	if (hasMaschile) return "M"
	if (hasFemminile) return "F"
	return "MISTO" // default case if neither is found
}

// Action handlers
const stampaDirettaTabellone = async (tabellone) => {
	try {
		const { data: prove } = await useFetch(
			`/api/tabelloni/${tabellone.id_tabellone}/prove`
		)

		const { stampaProveMultiple } = useProvaPrint()
		await stampaProveMultiple(
			prove.value.map((prova) => ({
				...prova,
				id_tabellone: tabellone.id_tabellone,
				codice_tabellone: tabellone.codice_tabellone,
				nome_tabellone: tabellone.nome_tabellone,
			}))
		)

		// Aggiorna lo stato stampato
		await useFetch(`/api/tabelloni/${tabellone.id_tabellone}/stampato`, {
			method: "POST",
			body: { stampato: true },
		})

		await loadTabelloni()
		showFeedback("Stampa di tutte le prove avviata con successo")
	} catch (error) {
		console.error("Errore durante la stampa:", error)
		showFeedback("Errore durante la stampa: " + error.message, true)
	}
}

const eliminaTabellone = async (tabellone) => {
	if (!confirm("Sei sicuro di voler eliminare questo tabellone?")) return

	try {
		const response = await fetch(
			`/api/tabelloni/${tabellone.id_tabellone}`,
			{
				method: "DELETE",
			}
		)

		if (!response.ok)
			throw new Error("Errore nell'eliminazione del tabellone")

		// Aggiorna la lista dei tabelloni
		const { data } = await useFetch("/api/tabelloni")
		tabelloni.value = data.value
	} catch (error) {
		console.error("Errore:", error)
		alert(error.message)
	}
}

const applicaConfigurazione = async (tabellone) => {
	if (!tabellone.configurazione_id) return

	try {
		const { error } = await useAsyncData(
			`applica-config-${tabellone.id_tabellone}`,
			() =>
				$fetch(
					`/api/tabelloni/${tabellone.id_tabellone}/applica-configurazione`,
					{
						method: "POST",
						body: {
							configurazione_id: tabellone.configurazione_id,
						},
					}
				)
		)

		if (error.value) {
			throw new Error(
				error.value.error ||
					"Errore nell'applicazione della configurazione"
			)
		}

		showFeedback("Configurazione applicata con successo")

		// Reset dello stato stampato
		await useAsyncData(`reset-stampato-${tabellone.id_tabellone}`, () =>
			$fetch(`/api/tabelloni/${tabellone.id_tabellone}/stampato`, {
				method: "POST",
				body: { stampato: false },
			})
		)

		// Ricarica i dati del tabellone
		const { data } = await useAsyncData("tabelloni", () =>
			$fetch("/api/tabelloni")
		)

		// Aggiorna mantenendo la configurazione_id
		tabelloni.value = data.value.map((t) => ({
			...t,
			configurazione_id:
				t.id_tabellone === tabellone.id_tabellone
					? tabellone.configurazione_id
					: t.configurazione_id,
		}))
	} catch (error) {
		console.error("Errore:", error)
		showFeedback(
			error.message || "Errore nell'applicazione della configurazione",
			true
		)
	}
}

// Nuova funzione per applicare la configurazione a più tabelloni
const applicaConfigurazioneMultipla = async () => {
	if (!selectedConfigurazioneMultipla.value) return

	if (
		!confirm(
			`Applicare la configurazione a ${selectedTabelloni.value.length} tabelloni?`
		)
	) {
		selectedConfigurazioneMultipla.value = ""
		return
	}

	try {
		// Aggiungi un contatore per i successi
		let successCount = 0
		let errorCount = 0
		const errors = []

		// Processa i tabelloni in serie invece che in parallelo
		for (const id_tabellone of selectedTabelloni.value) {
			try {
				const response = await fetch(
					`/api/tabelloni/${id_tabellone}/applica-configurazione`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							configurazione_id:
								selectedConfigurazioneMultipla.value,
						}),
					}
				)

				if (!response.ok) {
					const error = await response.json()
					throw new Error(
						error.message ||
							`Errore per il tabellone ${id_tabellone}`
					)
				}

				// Reset dello stato stampato
				await fetch(`/api/tabelloni/${id_tabellone}/stampato`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ stampato: false }),
				})

				successCount++
			} catch (error) {
				errorCount++
				errors.push(`Tabellone ${id_tabellone}: ${error.message}`)
				console.error(`Errore per il tabellone ${id_tabellone}:`, error)
			}
		}

		await loadTabelloni()

		// Messaggio di feedback più dettagliato
		const feedbackMessage =
			successCount === selectedTabelloni.value.length
				? `Configurazione applicata con successo a tutti i ${successCount} tabelloni`
				: `Configurazione applicata a ${successCount} tabelloni su ${selectedTabelloni.value.length}. ${errorCount} errori.`

		showFeedback(feedbackMessage, errorCount > 0)

		// Se ci sono errori, mostra i dettagli nella console
		if (errors.length > 0) {
			console.error("Dettaglio errori:", errors)
		}

		selectedConfigurazioneMultipla.value = ""
	} catch (error) {
		console.error("Errore generale:", error)
		showFeedback(
			"Errore nell'applicazione della configurazione multipla",
			true
		)
	}
}

// Modifica la funzione stampaTabelloniSelezionati
const stampaTabelloniSelezionati = async () => {
	if (!confirm(`Stampare ${selectedTabelloni.value.length} tabelloni?`))
		return

	try {
		const provaPromises = selectedTabelloni.value.map(
			async (id_tabellone) => {
				const tabellone = tabelloni.value.find(
					(t) => t.id_tabellone === id_tabellone
				)
				const response = await fetch(
					`/api/tabelloni/${id_tabellone}/prove`
				)
				if (!response.ok)
					throw new Error(
						`Errore nel recupero delle prove per il tabellone ${id_tabellone}`
					)

				const prove = await response.json()
				// Filtra le prove che non sono finali e mappa i dati necessari
				return prove
					.filter((prova) => !prova.is_finale)
					.map((prova) => ({
						...prova,
						id_tabellone,
						codice_tabellone: tabellone.codice_tabellone,
						nome_tabellone: tabellone.nome_tabellone,
						template_tabellone:
							prova.template_tabellone ||
							tabellone.template_tabellone,
					}))
			}
		)

		const allProve = (await Promise.all(provaPromises)).flat()

		// Usa stampaProveMultiple per gestire la stampa
		const { stampaProveMultiple } = useProvaPrint()
		await stampaProveMultiple(allProve)

		// Aggiorna lo stato stampato per tutti i tabelloni
		await Promise.all(
			selectedTabelloni.value.map((id_tabellone) =>
				fetch(`/api/tabelloni/${id_tabellone}/stampato`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ stampato: true }),
				})
			)
		)

		await loadTabelloni()
		showFeedback(
			`Stampa di ${selectedTabelloni.value.length} tabelloni completata`
		)
	} catch (error) {
		console.error("Errore dettagliato:", error)
		showFeedback(
			"Errore durante la stampa multipla: " + error.message,
			true
		)
	}
}

// Nuova funzione per gestire il toggle dello stato stampato
const toggleStampatoSelezionati = async () => {
	// Determina il nuovo stato in base alla presenza di tabelloni stampati
	const newStato = !isAnySelected.value

	if (
		!confirm(
			`Impostare ${selectedTabelloni.value.length} tabelloni come ${
				newStato ? "stampati" : "da stampare"
			}?`
		)
	)
		return

	try {
		const results = await Promise.all(
			selectedTabelloni.value.map((id) =>
				fetch(`/api/tabelloni/${id}/stampato`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ stampato: newStato }),
				})
			)
		)

		if (results.some((r) => !r.ok)) {
			throw new Error("Alcuni stati non sono stati aggiornati")
		}

		await loadTabelloni()
		showFeedback(
			`Tabelloni impostati come ${
				newStato ? "stampati" : "da stampare"
			} con successo`
		)
	} catch (error) {
		console.error("Errore nell'aggiornamento degli stati di stampa:", error)
		showFeedback(error.message, true)
	}
}

// Additional functions from index.vue
async function rimuoviConfigurazione(id_tabellone) {
	if (
		!confirm(
			"Sei sicuro di voler rimuovere la configurazione? Questo eliminerà tutte le prove associate."
		)
	)
		return

	try {
		const response = await fetch(
			`/api/tabelloni/${id_tabellone}/rimuovi-configurazione`,
			{
				method: "POST",
			}
		)

		if (!response.ok) {
			const error = await response.json()
			throw new Error(
				error.message || "Errore nella rimozione della configurazione"
			)
		}

		await loadTabelloni()
		showFeedback("Configurazione rimossa con successo")
	} catch (error) {
		console.error("Errore:", error)
		showFeedback(error.message, true)
	}
}

async function ricalcolaConfigurazione(id_tabellone) {
	if (
		!confirm(
			"Sei sicuro di voler ricalcolare la configurazione? Questo resetterà tutte le prove esistenti."
		)
	)
		return

	try {
		const tabellone = tabelloni.value.find(
			(t) => t.id_tabellone === id_tabellone
		)
		const response = await fetch(
			`/api/tabelloni/${id_tabellone}/applica-configurazione`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					configurazione_id: tabellone.configurazione_id,
				}),
			}
		)

		if (!response.ok) {
			const error = await response.json()
			throw new Error(
				error.message || "Errore nel ricalcolo della configurazione"
			)
		}

		await loadTabelloni()
		showFeedback("Configurazione ricalcolata con successo")
	} catch (error) {
		console.error("Errore:", error)
		showFeedback(error.message, true)
	}
}

const tornaInBozza = async (tabellone) => {
	if (
		!confirm(
			"Sei sicuro di voler riportare questo tabellone in bozza? Questo eliminerà tutti i risultati registrati."
		)
	) {
		return
	}

	try {
		const response = await fetch(
			`/api/tabelloni/${tabellone.id_tabellone}/torna-in-bozza`,
			{ method: "POST" }
		)

		if (!response.ok) {
			const error = await response.json()
			throw new Error(
				error.error || "Errore nel riportare il tabellone in bozza"
			)
		}

		await loadTabelloni()
		showFeedback("Tabellone riportato in bozza con successo")
	} catch (error) {
		console.error("Errore:", error)
		showFeedback(error.message, true)
	}
}

// Aggiungi le funzioni per gestire le azioni multiple
const attivaTabelloniSelezionati = async () => {
	if (!confirm(`Attivare ${selectedTabelloni.value.length} tabelloni?`))
		return

	try {
		const results = await Promise.all(
			selectedTabelloni.value.map((id) =>
				fetch(`/api/tabelloni/${id}/attiva`, { method: "POST" })
			)
		)

		if (results.some((r) => !r.ok)) {
			throw new Error("Alcuni tabelloni non sono stati attivati")
		}

		await loadTabelloni()
		showFeedback("Tabelloni attivati con successo")
	} catch (error) {
		console.error("Errore nell'attivazione dei tabelloni:", error)
		showFeedback(error.message, true)
	}
}

const completaTabelloniSelezionati = async () => {
	if (!confirm(`Completare ${selectedTabelloni.value.length} tabelloni?`))
		return

	try {
		const results = await Promise.all(
			selectedTabelloni.value.map((id) =>
				fetch(`/api/tabelloni/${id}/completa`, { method: "POST" })
			)
		)

		if (results.some((r) => !r.ok)) {
			throw new Error("Alcuni tabelloni non sono stati completati")
		}

		await loadTabelloni()
		showFeedback("Tabelloni completati con successo")
	} catch (error) {
		console.error("Errore nel completamento dei tabelloni:", error)
		showFeedback(error.message, true)
	}
}

const tornaBozzaTabelloniSelezionati = async () => {
	if (
		!confirm(
			`Riportare in bozza ${selectedTabelloni.value.length} tabelloni? Questo eliminerà tutti i risultati registrati.`
		)
	)
		return

	try {
		const results = await Promise.all(
			selectedTabelloni.value.map((id) =>
				fetch(`/api/tabelloni/${id}/torna-in-bozza`, { method: "POST" })
			)
		)

		if (results.some((r) => !r.ok)) {
			throw new Error(
				"Alcuni tabelloni non sono stati riportati in bozza"
			)
		}

		await loadTabelloni()
		showFeedback("Tabelloni riportati in bozza con successo")
	} catch (error) {
		console.error("Errore nel riportare in bozza i tabelloni:", error)
		showFeedback(error.message, true)
	}
}

const riattivaTabelloniSelezionati = async () => {
	if (!confirm(`Riattivare ${selectedTabelloni.value.length} tabelloni?`))
		return

	try {
		const results = await Promise.all(
			selectedTabelloni.value.map((id) =>
				fetch(`/api/tabelloni/${id}/riattiva`, { method: "POST" })
			)
		)

		if (results.some((r) => !r.ok)) {
			throw new Error("Alcuni tabelloni non sono stati riattivati")
		}

		await loadTabelloni()
		showFeedback("Tabelloni riattivati con successo")
	} catch (error) {
		console.error("Errore nella riattivazione dei tabelloni:", error)
		showFeedback(error.message, true)
	}
}

// Aggiungi queste funzioni nelle action handlers
const resetVotiTabellone = async (id_tabellone) => {
	if (
		!confirm(
			"Sei sicuro di voler resettare tutti i voti di questo tabellone? Questa azione non può essere annullata."
		)
	) {
		return
	}

	try {
		const response = await fetch(
			`/api/tabelloni/${id_tabellone}/reset-voti`,
			{
				method: "POST",
			}
		)

		if (!response.ok) {
			const errorData = await response.json()
			throw new Error(errorData.error || "Errore nel reset dei voti")
		}

		await loadTabelloni()
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

const resetVotiMultipli = async () => {
	if (
		!confirm(
			`Resettare i voti di ${selectedTabelloni.value.length} tabelloni? Questa azione non può essere annullata.`
		)
	) {
		return
	}

	try {
		const results = await Promise.all(
			selectedTabelloni.value.map((id) =>
				fetch(`/api/tabelloni/${id}/reset-voti`, { method: "POST" })
			)
		)

		if (results.some((r) => !r.ok)) {
			throw new Error("Alcuni voti non sono stati resettati")
		}

		await loadTabelloni()
		showFeedback("Voti resettati con successo")
	} catch (error) {
		console.error("Errore nel reset dei voti:", error)
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
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.border-l-4 {
	border-left-width: 4px;
}

.border-l-blue-500 {
	border-left-color: #3b82f6;
}

.border-l-pink-500 {
	border-left-color: #ec4899;
}

.border-l-yellow-500 {
	border-left-color: #eab308;
}

/* Aggiungi questi stili per l'effetto di hover */
.cursor-pointer:hover {
	transform: translateY(-1px);
	transition: transform 0.2s ease;
}
</style>
