<template>
	<form @submit.prevent="onSubmit" class="space-y-6">
		<!-- Informazioni di base -->
		<div class="space-y-4">
			<div>
				<label class="block text-sm font-medium text-gray-700"
					>Nome configurazione</label
				>
				<input
					v-model="config.nome"
					type="text"
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					required
				/>
			</div>
		</div>

		<!-- Prove -->
		<div class="space-y-4">
			<div class="flex justify-between items-center">
				<h2 class="text-lg font-semibold">Prove</h2>
				<button
					type="button"
					@click="aggiungiProva"
					class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
				>
					Aggiungi Prova
				</button>
			</div>

			<div
				v-for="(prova, index) in config.prove"
				:key="index"
				class="border p-4 rounded-lg space-y-4"
			>
				<!-- Intestazione prova -->
				<div class="flex justify-between items-start">
					<h3 class="font-medium">Prova {{ index + 1 }}</h3>
					<button
						type="button"
						@click="rimuoviProva(index)"
						class="text-red-500 hover:text-red-700"
					>
						<i class="fas fa-trash"></i>
					</button>
				</div>

				<!-- Disciplina e Nome -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700"
							>Disciplina</label
						>
						<select
							v-model="prova.disciplina"
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							required
						>
							<option
								v-for="d in discipline"
								:key="d.id_disciplina"
								:value="d.id_disciplina"
							>
								{{ d.valore }}
							</option>
						</select>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700"
							>Nome prova</label
						>
						<input
							v-model="prova.nome_prova"
							type="text"
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							required
						/>
					</div>
				</div>

				<!-- Tipo tabellone, Template tabellone, Durata e Numero arbitri -->
				<div class="grid grid-cols-3 gap-4 mt-4">
					<div>
						<label class="block text-sm font-medium text-gray-700"
							>Valutazione</label
						>
						<select
							v-model="prova.tipo_tabellone"
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						>
							<option value="punteggio">A Punteggio</option>
							<option value="bandierine">A Bandierine</option>
						</select>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700"
							>Template tabellone</label
						>
						<select
							v-model="prova.template_tabellone"
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							required
						>
							<option value="">Seleziona template</option>
							<option
								v-for="template in templateOptions"
								:key="template.value"
								:value="template.value"
							>
								{{ template.label }}
							</option>
						</select>
					</div>

					<!-- Durata e Arbitri in un contenitore flex -->
					<div class="flex gap-4">
						<!-- Durata Incontro -->
						<div class="flex-1">
							<label
								class="block text-sm font-medium text-gray-700"
								>Durata</label
							>
							<div class="mt-1 flex gap-1 items-center">
								<input
									type="number"
									min="0"
									max="59"
									:value="getMinutes(index)"
									@input="handleMinutesChange($event, index)"
									class="w-16 rounded border-gray-300 text-right"
									placeholder="0"
								/>
								:
								<input
									type="number"
									min="0"
									max="59"
									:value="getSeconds(index)"
									@input="handleSecondsChange($event, index)"
									class="w-16 rounded border-gray-300 text-right"
									placeholder="00"
								/>
								<span class="text-xs text-gray-500"
									>(0:00 = senza tempo)</span
								>
							</div>
						</div>

						<!-- Numero Arbitri -->
						<div class="flex-1">
							<label
								class="block text-sm font-medium text-gray-700"
								>Arbitri</label
							>
							<input
								type="number"
								v-model="prova.numero_arbitri"
								min="1"
								max="7"
								class="mt-1 block w-full rounded border-gray-300"
							/>
						</div>
					</div>
				</div>

				<!-- Rimuovo il div con considera_precedenti e lascio solo calcola_totali -->
				<div>
					<div class="flex items-center mt-4">
						<input
							type="checkbox"
							v-model="prova.calcola_totali"
							class="rounded border-gray-300 text-blue-600"
							:disabled="index === 0"
						/>
						<label class="ml-2 text-sm text-gray-700"
							>Calcola totali prove precedenti</label
						>
					</div>
				</div>

				<!-- Configurazione finale -->
				<div class="mt-4">
					<div class="flex items-center">
						<input
							type="checkbox"
							v-model="prova.is_finale"
							class="rounded border-gray-300 text-blue-600"
							:disabled="index === 0"
						/>
						<label class="ml-2 text-sm text-gray-700"
							>È una finale</label
						>
					</div>

					<div v-if="prova.is_finale" class="mt-4 space-y-4">
						<label class="block text-sm font-medium text-gray-700"
							>Criteri di accesso</label
						>
						<div class="space-y-2">
							<div
								v-for="(criterio, idx) in prova.regole_accesso
									.criteri"
								:key="idx"
								class="flex gap-2"
							>
								<select v-model="criterio.tipo" class="w-1/3">
									<option value="bandierine_totali">
										Totale bandierine
									</option>
									<option value="top">Top atleti</option>
								</select>
								<input
									v-model="criterio.valore"
									type="number"
									class="w-2/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
									:placeholder="getPlaceholder(criterio.tipo)"
								/>
								<button
									type="button"
									@click="rimuoviCriterio(prova, idx)"
									class="text-red-500 hover:text-red-700"
								>
									<i class="fas fa-trash"></i>
								</button>
							</div>
							<button
								type="button"
								@click="aggiungiCriterio(prova)"
								class="text-blue-500 hover:text-blue-700"
							>
								Aggiungi Criterio
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Pulsanti -->
		<div class="flex justify-end space-x-4">
			<button
				type="button"
				@click="router.push('/configurazioni')"
				class="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
			>
				Annulla
			</button>
			<button
				type="submit"
				class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
				:disabled="loading"
			>
				{{ loading ? "Salvataggio..." : submitLabel }}
			</button>
		</div>
	</form>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue"
import { useRouter } from "vue-router"
import type {
	Configurazione,
	ConfigurazioneProva,
	TemplateTabellone,
} from "~/types/configurazioni"
import type { Disciplina } from "~/types/discipline"

interface Duration {
	minutes: number
	seconds: number
}

interface Props {
	initialData: Configurazione
	submitLabel: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
	(e: "submit", data: Configurazione): void
}>()

const formData = ref<Configurazione>(props.initialData)
const provasDurations = ref<Duration[]>([]) // Rinominato da durations a provasDurations

const templateOptions = [
	{
		value: "ELIM_DIR_REC" as TemplateTabellone,
		label: "ELIM_DIR_REC", // Modificato per mostrare il codice
	},
	{
		value: "KUMITE_BASE" as TemplateTabellone,
		label: "KUMITE_BASE", // Modificato per mostrare il codice
	},
	{
		value: "GIRONE_ITA" as TemplateTabellone,
		label: "GIRONE_ITA", // Aggiunto il nuovo template
	},
]

const router = useRouter()
const loading = ref(false)
const discipline = ref<Disciplina[]>([])
const config = ref({ ...props.initialData })

// Aggiungi questa struttura per gestire le durate
interface Duration {
	minutes: number
	seconds: number
}

// Fix the type of durations ref
const durations = ref<Duration[]>([])

// Aggiungi un watch per aggiornare i dati quando cambiano
watch(
	() => props.initialData,
	(newVal) => {
		config.value = JSON.parse(JSON.stringify(newVal))
	},
	{ deep: true }
)

onMounted(async () => {
	try {
		const response = await fetch("/api/discipline")
		discipline.value = (await response.json()) as Disciplina[]

		// Se ci sono dati iniziali, assicurati che vengano copiati correttamente
		if (props.initialData) {
			const cleanData = {
				...props.initialData,
				prove: props.initialData.prove.map((prova) => ({
					...prova,
					nome_prova: prova.nome_prova || `Prova ${prova.ordine}`,
					template_tabellone: prova.template_tabellone, // Rimuovi il default
				})),
			}
			config.value = JSON.parse(JSON.stringify(cleanData))
		}
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : "Errore sconosciuto"
		alert(message)
	}
})

// Rimuovi il watch duplicato e mantieni solo questo
watch(
	() => config.value.prove,
	(newProve) => {
		// Inizializza solo le nuove prove senza toccare quelle esistenti
		const currentLength = provasDurations.value.length
		if (newProve.length > currentLength) {
			// Aggiungi durate solo per le nuove prove
			for (let i = currentLength; i < newProve.length; i++) {
				const [minutes = "00", seconds = "00"] = (
					newProve[i].durata_incontro || "00:00"
				).split(":")
				provasDurations.value[i] = {
					minutes: parseInt(minutes),
					seconds: parseInt(seconds),
				}
			}
		}
		// Rimuovi le durate in eccesso
		provasDurations.value.length = newProve.length
	},
	{ deep: false } // Cambiato da deep: true a false per evitare reazioni in cascata
)

// Funzione per aggiornare la durata nella prova
const validateDuration = (duration: string): string => {
	if (!duration) return "00:20"

	const parts = duration.split(":")
	const minutes = parseInt(parts[0] || "0")
	const seconds = parseInt(parts[1] || "0")

	// Assicurati che i valori siano numeri validi e nel range corretto
	const validMinutes = Math.min(59, Math.max(0, isNaN(minutes) ? 0 : minutes))
	const validSeconds = Math.min(59, Math.max(0, isNaN(seconds) ? 0 : seconds))

	// Formatta come "MM:SS"
	return `${validMinutes.toString().padStart(2, "0")}:${validSeconds
		.toString()
		.padStart(2, "0")}`
}

const updateDurationString = (index: number) => {
	if (!durations.value[index]) {
		durations.value[index] = { minutes: 0, seconds: 20 }
	}

	const duration = durations.value[index]
	formData.value.prove[index].durata_incontro = `${Math.min(
		59,
		Math.max(0, duration.minutes || 0)
	)
		.toString()
		.padStart(2, "0")}:${Math.min(59, Math.max(0, duration.seconds || 0))
		.toString()
		.padStart(2, "0")}`
}

// Inizializza le durate quando il componente viene montato
onMounted(() => {
	if (config.value.prove) {
		durations.value = config.value.prove.map((prova) => {
			const [minutes = "02", seconds = "00"] = (
				prova.durata_incontro || "02:00"
			).split(":")
			return {
				minutes: parseInt(minutes),
				seconds: parseInt(seconds),
			}
		})
	}
})

const getMinutes = (index: number): number => {
	return durations.value[index]?.minutes || 0 // Changed default to 0
}

// Modifica la funzione getSeconds per rimuovere il default di 20
const getSeconds = (index: number): number => {
	return provasDurations.value[index]?.seconds || 0 // Cambiato da 20 a 0
}

// Modifica la funzione handleMinutesChange per aggiornare sia durations che la prova
const handleMinutesChange = (event: Event, index: number) => {
	const value = parseInt((event.target as HTMLInputElement).value) || 0
	const validValue = Math.min(59, Math.max(0, value))

	if (!provasDurations.value[index]) {
		provasDurations.value[index] = { minutes: validValue, seconds: 0 } // Cambiato da 20 a 0
	} else {
		provasDurations.value[index].minutes = validValue
	}

	const seconds = provasDurations.value[index].seconds
	const newDuration = `${validValue.toString().padStart(2, "0")}:${seconds
		.toString()
		.padStart(2, "0")}`
	config.value.prove[index].durata_incontro = newDuration
}

// Modifica la funzione handleSecondsChange per aggiornare sia durations che la prova
const handleSecondsChange = (event: Event, index: number) => {
	const value = parseInt((event.target as HTMLInputElement).value) || 0
	const validValue = Math.min(59, Math.max(0, value))

	if (!provasDurations.value[index]) {
		provasDurations.value[index] = { minutes: 0, seconds: validValue }
	} else {
		provasDurations.value[index].seconds = validValue
	}

	const minutes = provasDurations.value[index].minutes
	const newDuration = `${minutes.toString().padStart(2, "0")}:${validValue
		.toString()
		.padStart(2, "0")}`
	config.value.prove[index].durata_incontro = newDuration
}

const getDurationPart = (
	index: number,
	part: "minutes" | "seconds"
): number => {
	const duration = formData.value.prove[index]?.durata_incontro || "00:20"
	const [minutes = "0", seconds = "20"] = duration.split(":")
	return parseInt(part === "minutes" ? minutes : seconds)
}

const updateDuration = (
	index: number,
	part: "minutes" | "seconds",
	event: Event
) => {
	const value = Math.min(
		59,
		Math.max(0, parseInt((event.target as HTMLInputElement).value) || 0)
	)
	const currentDuration =
		formData.value.prove[index]?.durata_incontro || "00:20"
	const [minutes, seconds] = currentDuration.split(":")

	if (part === "minutes") {
		formData.value.prove[index].durata_incontro = `${value
			.toString()
			.padStart(2, "0")}:${seconds}`
	} else {
		formData.value.prove[index].durata_incontro = `${minutes}:${value
			.toString()
			.padStart(2, "0")}`
	}
}

// Modifica la funzione aggiungiProva per inizializzare correttamente la durata
const aggiungiProva = () => {
	const nuovaProva: ConfigurazioneProva = {
		disciplina: discipline.value[0]?.id_disciplina || "",
		nome_prova: `Prova ${config.value.prove.length + 1}`,
		ordine: config.value.prove.length + 1,
		tipo_tabellone: "punteggio",
		template_tabellone: "" as TemplateTabellone,
		numero_arbitri: 3,
		is_finale: false,
		calcola_totali: false,
		regole_accesso: { criteri: [] },
		durata_incontro: "00:00", // Cambiato da "00:20" a "00:00"
	}
	config.value.prove.push(nuovaProva)
	// Inizializza la durata con secondi a 0 invece di 20
	provasDurations.value.push({ minutes: 0, seconds: 0 })
}

const rimuoviProva = (index: number) => {
	config.value.prove.splice(index, 1)
}

const validaConfigurazione = () => {
	if (!config.value.nome?.trim()) {
		alert("Inserire un nome per la configurazione")
		return false
	}
	if (config.value.prove.length === 0) {
		alert("Inserire almeno una prova")
		return false
	}
	// Aggiungi validazione per template_tabellone
	if (config.value.prove.some((prova) => !prova.template_tabellone)) {
		alert("Selezionare un template per tutte le prove")
		return false
	}
	return true
}

const getPlaceholder = (tipo: "bandierine_totali" | "top"): string => {
	switch (tipo) {
		case "bandierine_totali":
			return "N. bandierine"
		case "top":
			return "N. atleti"
		default:
			return ""
	}
}

const aggiungiCriterio = (prova: ConfigurazioneProva) => {
	if (!prova.regole_accesso) {
		prova.regole_accesso = { criteri: [] }
	}
	prova.regole_accesso.criteri.push({
		tipo: "bandierine_totali",
		valore: 4,
	})
}

const rimuoviCriterio = (prova: ConfigurazioneProva, idx: number) => {
	prova.regole_accesso.criteri.splice(idx, 1)
}

const onSubmit = () => {
	if (!validaConfigurazione()) return

	// Assicurati che tutte le prove abbiano una durata valida
	config.value.prove.forEach((prova, index) => {
		if (!prova.durata_incontro) {
			prova.durata_incontro = "00:20" // default
		}
	})

	emit("submit", config.value)
}
</script>
