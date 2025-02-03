<template>
	<div
		class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50"
	>
		<div
			class="bg-white p-6 rounded-lg shadow-lg w-full max-w-6xl overflow-auto max-h-full"
		>
			<h2 class="text-2xl font-bold mb-4">
				{{
					iscrizione.id_iscrizione
						? "Modifica Iscrizione"
						: "Aggiungi Iscrizione"
				}}
			</h2>
			<form
				@submit.prevent="handleSave"
				class="flex flex-wrap gap-4 w-full"
			>
				<!-- Form unificato per modifica e nuova iscrizione -->
				<div class="w-full">
					<!-- Selezione atleta e ID -->
					<div class="mb-4 w-full">
						<div v-if="!iscrizione.id_iscrizione">
							<select
								v-model="selectedAtleta"
								@change="handleAtletaSelection"
								class="border p-2 rounded w-full"
							>
								<option value="new">Nuovo Atleta</option>
								<option
									v-for="atleta in sortedAtleti"
									:key="atleta.id_atleta"
									:value="atleta.id_atleta"
								>
									{{ atleta.cognome }} {{ atleta.nome }}
								</option>
							</select>
						</div>

						<div
							v-if="iscrizione.id_iscrizione"
							class="bg-gray-100 p-4 rounded"
						>
							<p>
								<strong>ID Atleta:</strong>
								{{ iscrizione.atleta?.id_atleta }}
							</p>
						</div>
					</div>

					<!-- Griglia dei campi -->
					<div class="grid grid-cols-3 gap-4">
						<!-- Dati anagrafici -->
						<div class="flex flex-col">
							<label class="text-sm text-gray-600 mb-1"
								>Cognome</label
							>
							<input
								v-model="formData.cognome"
								placeholder="Cognome"
								class="border p-2 rounded w-full"
								required
							/>
						</div>

						<div class="flex flex-col">
							<label class="text-sm text-gray-600 mb-1"
								>Nome</label
							>
							<input
								v-model="formData.nome"
								placeholder="Nome"
								class="border p-2 rounded w-full"
								required
							/>
						</div>

						<div class="flex flex-col">
							<label class="text-sm text-gray-600 mb-1"
								>Sesso</label
							>
							<select
								v-model="formData.sesso"
								class="border p-2 rounded w-full"
								required
							>
								<option value="" disabled>
									Seleziona sesso
								</option>
								<option
									v-for="option in sessoOptions"
									:key="option.value"
									:value="option.value"
								>
									{{ option.label }}
								</option>
							</select>
						</div>

						<div class="flex flex-col">
							<label class="text-sm text-gray-600 mb-1"
								>Anno di nascita</label
							>
							<input
								v-model="formData.anno_nascita"
								type="number"
								placeholder="Anno di nascita"
								class="border p-2 rounded w-full"
								required
							/>
						</div>

						<div class="flex flex-col">
							<label class="text-sm text-gray-600 mb-1"
								>Cintura</label
							>
							<select
								v-model="formData.cintura_id"
								class="border p-2 rounded w-full"
								required
							>
								<option value="">Seleziona cintura</option>
								<option
									v-for="cintura in cinture"
									:key="cintura.id_cintura"
									:value="cintura.id_cintura"
								>
									{{ cintura.colore }}
								</option>
							</select>
						</div>

						<div class="flex flex-col">
							<label class="text-sm text-gray-600 mb-1"
								>Dan</label
							>
							<input
								v-model="formData.dan"
								type="number"
								placeholder="Dan"
								class="border p-2 rounded w-full"
							/>
						</div>

						<div class="flex flex-col">
							<label class="text-sm text-gray-600 mb-1"
								>Peso (kg)</label
							>
							<input
								v-model="formData.peso_kg"
								type="number"
								step="0.1"
								placeholder="Peso in kg"
								class="border p-2 rounded w-full"
							/>
						</div>

						<div class="flex flex-col">
							<label class="text-sm text-gray-600 mb-1"
								>Società</label
							>
							<select
								v-model="formData.id_societa"
								class="border p-2 rounded w-full"
								required
							>
								<option value="">Seleziona società</option>
								<option
									v-for="s in societa"
									:key="s.id_societa"
									:value="s.id_societa"
								>
									{{ s.nome_societa }}
								</option>
							</select>
						</div>

						<div class="flex flex-col">
							<label class="text-sm text-gray-600 mb-1"
								>Disciplina</label
							>
							<select
								v-model="selectedDisciplinaId"
								class="border p-2 rounded w-full"
								required
							>
								<option value="">Seleziona disciplina</option>
								<option
									v-for="d in discipline"
									:key="d.id_disciplina"
									:value="d.id_disciplina"
								>
									{{ d.valore }}
								</option>
							</select>
						</div>

						<div class="flex flex-col col-span-2">
							<label class="text-sm text-gray-600 mb-1"
								>Categoria</label
							>
							<select
								v-model="selectedCategoriaId"
								class="border p-2 rounded w-full"
							>
								<option value="">Seleziona categoria</option>
								<option
									v-for="cat in categorieOrdinate"
									:key="cat.id_categoria"
									:value="cat.id_categoria"
								>
									{{ cat.nome }}
								</option>
							</select>
						</div>
					</div>
				</div>

				<div class="w-full flex justify-end gap-4 mt-4">
					<button
						type="submit"
						class="bg-blue-500 text-white p-2 rounded"
					>
						Salva
					</button>
					<button
						@click="$emit('close')"
						type="button"
						class="bg-gray-500 text-white p-2 rounded"
					>
						Annulla
					</button>
				</div>
			</form>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { useFetch } from "nuxt/app"
import type { PropType } from "vue"
import type {
	Atleta,
	Iscrizione,
	Categoria,
	CategoriaRow, // Aggiunto questo import
	Cintura,
	Societa,
	Disciplina,
	SessoOption,
} from "~/types/global"
import { getSessoOptions } from "~/types/global"

const props = defineProps({
	iscrizione: {
		type: Object as PropType<Iscrizione>,
		required: true,
	},
	atleti: {
		type: Array as PropType<Atleta[]>,
		required: true,
	},
	categorie: {
		type: Array as PropType<Categoria[]>,
		required: true,
	},
	cinture: {
		type: Array as PropType<Cintura[]>,
		required: true,
	},
	societa: {
		type: Array as PropType<Societa[]>,
		required: true,
	},
	discipline: {
		type: Array as PropType<Disciplina[]>,
		required: true,
	},
})

// Aggiorna la definizione degli emit
const emit = defineEmits(["close", "save"])

// Update the selectedAtleta ref type to handle both string "new" and number
const selectedAtleta = ref<"new" | number>("new")

// Update the isExistingAtleta computed to handle type checking
const isExistingAtleta = computed(() => selectedAtleta.value !== "new")

const sortedAtleti = computed(() => {
	return [...(props.atleti || [])].sort((a, b) => {
		const cognomeA = a.cognome || ""
		const cognomeB = b.cognome || ""
		return cognomeA.localeCompare(cognomeB)
	})
})

const atleta = ref<Atleta>({
	id_atleta: undefined,
	cognome: "",
	nome: "",
	sesso: "M",
	anno_nascita: undefined,
	cintura_id: undefined,
	dan: undefined,
	peso_kg: undefined,
	id_societa: undefined,
})

// Modifica l'inizializzazione di formData per usare una funzione che restituisce l'oggetto iniziale
const getInitialFormData = () => ({
	cognome: props.iscrizione.atleta?.cognome || "",
	nome: props.iscrizione.atleta?.nome || "",
	sesso: props.iscrizione.atleta?.sesso || "M",
	anno_nascita: props.iscrizione.atleta?.anno_nascita || undefined,
	cintura_id: props.iscrizione.atleta?.cintura_id || undefined,
	dan: props.iscrizione.atleta?.dan || undefined,
	peso_kg: props.iscrizione.atleta?.peso_kg || undefined,
	id_societa: props.iscrizione.atleta?.id_societa || undefined,
})

const formData = ref(getInitialFormData())

// Aggiungi un watch sulle props.iscrizione per resettare il form quando cambia
watch(
	() => props.iscrizione,
	() => {
		formData.value = getInitialFormData()
		selectedAtleta.value = "new"
	},
	{ deep: true }
)

// Modifica handleAtletaSelection per utilizzare formData
const handleAtletaSelection = () => {
	if (isExistingAtleta.value && typeof selectedAtleta.value === "number") {
		const atletaToEdit = props.atleti.find(
			(a) => a.id_atleta === selectedAtleta.value
		)
		if (atletaToEdit) {
			formData.value = {
				cognome: atletaToEdit.cognome || "",
				nome: atletaToEdit.nome || "",
				sesso: atletaToEdit.sesso || "M",
				anno_nascita: atletaToEdit.anno_nascita,
				cintura_id: atletaToEdit.cintura_id,
				dan: atletaToEdit.dan,
				peso_kg: atletaToEdit.peso_kg,
				id_societa: atletaToEdit.id_societa,
			}
			props.iscrizione.atleta = { ...atletaToEdit }
		}
	} else {
		formData.value = getInitialFormData()
		props.iscrizione.atleta = undefined
	}
}

const categorieOrdinate = computed(() => {
	if (!props.categorie) return []
	return [...props.categorie].sort(
		(a, b) => (a.n_ordine || 0) - (b.n_ordine || 0)
	)
})

const sessoOptions = getSessoOptions()

// Aggiungi un watch per sincronizzare i dati con l'iscrizione
watch(
	formData,
	(newValue) => {
		if (props.iscrizione.atleta) {
			props.iscrizione.atleta = {
				...props.iscrizione.atleta,
				...newValue,
			}
		}
	},
	{ deep: true }
)

// Aggiungi questa funzione per recuperare la categoria
const fetchCategoriaForIscrizione = async (iscrizioneId: number) => {
	try {
		const { data: categorie } = await useFetch<CategoriaRow[]>(
			"/api/categorie",
			{
				query: { iscrizioneId },
			}
		)

		if (categorie.value && categorie.value.length > 0) {
			// Se c'è una sola categoria, assegnala automaticamente
			if (categorie.value.length === 1) {
				selectedCategoriaId.value = categorie.value[0].id_categoria
			}
			// Se ce ne sono multiple, mostra solo quelle disponibili nel select
			return categorie.value
		}
	} catch (error) {
		console.error("Errore nel recupero della categoria:", error)
	}
}

// Modifica handleSave per includere la ricerca della categoria
const handleSave = async () => {
	try {
		// Crea o aggiorna l'atleta
		let atletaData: Atleta

		if (
			isExistingAtleta.value &&
			typeof selectedAtleta.value === "number"
		) {
			atletaData = {
				id_atleta: selectedAtleta.value,
				...formData.value,
			}
		} else {
			// Crea nuovo atleta
			const atletaInput: Atleta = {
				cognome: formData.value.cognome,
				nome: formData.value.nome,
				sesso: formData.value.sesso,
				anno_nascita: formData.value.anno_nascita,
				cintura_id: formData.value.cintura_id,
				dan: formData.value.dan,
				peso_kg: formData.value.peso_kg,
				id_societa: formData.value.id_societa,
			}

			const { data: newAtleta, error: atletaError } =
				await useFetch<Atleta>("/api/atleti", {
					method: "POST",
					body: atletaInput,
				})

			if (atletaError.value) throw atletaError.value
			if (!newAtleta.value)
				throw new Error("Errore nella creazione dell'atleta")

			atletaData = newAtleta.value
		}

		// Assicurati che l'ID dell'atleta sia presente
		if (!atletaData.id_atleta) {
			throw new Error("ID atleta mancante")
		}

		// Prepara i dati dell'iscrizione con il tipo corretto
		const iscrizioneData: Iscrizione = {
			id_iscrizione: props.iscrizione.id_iscrizione,
			atleta: atletaData,
			disciplina: props.iscrizione.disciplina,
			categoria: props.iscrizione.categoria,
			data_iscrizione: new Date(),
			manuale: false,
			confermata: false,
			ammesso_in_finale: false,
			classifica: null,
		}

		// Salva l'iscrizione
		const { data: savedIscrizione, error } = await useFetch<Iscrizione>(
			"/api/iscrizioni",
			{
				method: props.iscrizione.id_iscrizione ? "PUT" : "POST",
				body: iscrizioneData,
				query: props.iscrizione.id_iscrizione
					? { id: props.iscrizione.id_iscrizione }
					: undefined,
			}
		)

		if (error.value) throw error.value

		if (savedIscrizione.value) {
			emit("save", savedIscrizione.value)
		}
	} catch (error) {
		console.error("Errore durante il salvataggio:", error)
		throw error
	}
}

// 1. Prima le computed properties
const selectedDisciplinaId = computed({
	get: () => props.iscrizione.disciplina?.id_disciplina ?? "",
	set: (value: string) => {
		const disciplinaSelezionata = props.discipline.find(
			(d) => d.id_disciplina === value
		)
		props.iscrizione.disciplina = disciplinaSelezionata || {
			id_disciplina: value || "",
			valore: "",
		}
	},
})

const selectedCategoriaId = computed({
	get: () => props.iscrizione.categoria?.id_categoria ?? "",
	set: (value: number | "") => {
		const categoriaSelezionata = props.categorie.find(
			(cat) => cat.id_categoria === value
		)
		props.iscrizione.categoria = categoriaSelezionata || {
			id_categoria: value || undefined,
			nome: "",
			id_disciplina: "",
			sesso: undefined,
			peso_min: null,
			peso_max: null,
			n_ordine: undefined,
			fasce: [],
			cinture: [],
		}
	},
})

// 2. Poi i watch che utilizzano le computed properties
watch(
	() => selectedDisciplinaId.value,
	async (newValue) => {
		if (newValue && props.iscrizione.id_iscrizione) {
			await fetchCategoriaForIscrizione(props.iscrizione.id_iscrizione)
		}
	}
)
</script>
