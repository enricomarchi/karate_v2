<template>
	<div
		class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50"
	>
		<div
			class="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl overflow-auto max-h-[90vh]"
		>
			<h2 class="text-2xl font-bold mb-4">
				Crea Categorie Automaticamente
			</h2>
			<form @submit.prevent="handleSave" class="flex flex-wrap gap-4">
				<!-- Selettore delle discipline -->
				<div class="w-full flex">
					<div class="w-1/2">
						<h3>Discipline Disponibili</h3>
						<select
							v-model="tempDisciplineDisponibili"
							multiple
							class="border p-2 rounded w-full h-32"
						>
							<option
								v-for="disciplina in disciplineDisponibili"
								:key="disciplina.id_disciplina"
								:value="disciplina.id_disciplina"
							>
								{{ disciplina.valore }}
							</option>
						</select>
					</div>
					<div class="flex flex-col justify-center mx-2">
						<button
							@click.prevent="aggiungiDiscipline"
							class="bg-gray-300 p-2 rounded mb-2"
						>
							&gt;&gt;
						</button>
						<button
							@click.prevent="rimuoviDiscipline"
							class="bg-gray-300 p-2 rounded"
						>
							&lt;&lt;
						</button>
					</div>
					<div class="w-1/2">
						<h3>Discipline Selezionate</h3>
						<select
							v-model="tempDisciplineSelezionate"
							multiple
							class="border p-2 rounded w-full h-32"
						>
							<option
								v-for="disciplina in disciplineSelezionate"
								:key="disciplina.id_disciplina"
								:value="disciplina.id_disciplina"
							>
								{{ disciplina.valore }}
							</option>
						</select>
					</div>
				</div>
				<div class="w-full flex items-center mt-2">
					<input
						type="checkbox"
						v-model="distintaPerDisciplina"
						class="mr-2"
						checked
					/>
					<label
						>Categoria distinta per ogni valore selezionato</label
					>
				</div>
				<!-- Selettore dei sessi -->
				<div class="w-full flex mt-4">
					<div class="w-1/2">
						<h3>Sessi Disponibili</h3>
						<select
							v-model="tempSessiDisponibili"
							multiple
							class="border p-2 rounded w-full h-32"
						>
							<option
								v-for="s in sessoDisponibili"
								:key="s.value"
								:value="s.value"
							>
								{{ s.label }}
							</option>
						</select>
					</div>
					<div class="flex flex-col justify-center mx-2">
						<button
							@click.prevent="aggiungiSessi"
							class="bg-gray-300 p-2 rounded mb-2"
						>
							&gt;&gt;
						</button>
						<button
							@click.prevent="rimuoviSessi"
							class="bg-gray-300 p-2 rounded"
						>
							&lt;&lt;
						</button>
					</div>
					<div class="w-1/2">
						<h3>Sessi Selezionati</h3>
						<select
							v-model="tempSessiSelezionati"
							multiple
							class="border p-2 rounded w-full h-32"
						>
							<option
								v-for="s in sessoSelezionati"
								:key="s.value"
								:value="s.value"
							>
								{{ s.label }}
							</option>
						</select>
					</div>
				</div>
				<div class="w-full flex items-center mt-2">
					<input
						type="checkbox"
						v-model="distintaPerSesso"
						class="mr-2"
						checked
					/>
					<label
						>Categoria distinta per ogni valore selezionato</label
					>
				</div>
				<!-- Selettore delle fasce -->
				<div class="w-full flex mt-4">
					<div class="w-1/2">
						<h3>Fasce Disponibili</h3>
						<select
							v-model="tempFasceDisponibili"
							multiple
							class="border p-2 rounded w-full h-32"
						>
							<option
								v-for="fascia in fasceDisponibili"
								:key="fascia.id_fascia"
								:value="fascia.id_fascia"
							>
								{{ fascia.descrizione }}
							</option>
						</select>
					</div>
					<div class="flex flex-col justify-center mx-2">
						<button
							@click.prevent="aggiungiFasce"
							class="bg-gray-300 p-2 rounded mb-2"
						>
							&gt;&gt;
						</button>
						<button
							@click.prevent="rimuoviFasce"
							class="bg-gray-300 p-2 rounded"
						>
							&lt;&lt;
						</button>
					</div>
					<div class="w-1/2">
						<h3>Fasce Selezionate</h3>
						<select
							v-model="tempFasceSelezionate"
							multiple
							class="border p-2 rounded w-full h-32"
						>
							<option
								v-for="fascia in fasceSelezionate"
								:key="fascia.id_fascia"
								:value="fascia.id_fascia"
							>
								{{ fascia.descrizione }}
							</option>
						</select>
					</div>
				</div>
				<div class="w-full flex items-center mt-2">
					<input
						type="checkbox"
						v-model="distintaPerFascia"
						class="mr-2"
						checked
					/>
					<label
						>Categoria distinta per ogni valore selezionato</label
					>
				</div>
				<!-- Selettore delle cinture -->
				<div class="w-full flex mt-4">
					<div class="w-1/2">
						<h3>Cinture Disponibili</h3>
						<select
							v-model="tempCintureDisponibili"
							multiple
							class="border p-2 rounded w-full h-32"
						>
							<option
								v-for="cintura in cintureDisponibili"
								:key="cintura.id_cintura"
								:value="cintura.id_cintura"
							>
								{{ cintura.colore }}
							</option>
						</select>
					</div>
					<div class="flex flex-col justify-center mx-2">
						<button
							@click.prevent="aggiungiCinture"
							class="bg-gray-300 p-2 rounded mb-2"
						>
							&gt;&gt;
						</button>
						<button
							@click.prevent="rimuoviCinture"
							class="bg-gray-300 p-2 rounded"
						>
							&lt;&lt;
						</button>
					</div>
					<div class="w-1/2">
						<h3>Cinture Selezionate</h3>
						<select
							v-model="tempCintureSelezionate"
							multiple
							class="border p-2 rounded w-full h-32"
						>
							<option
								v-for="cintura in cintureSelezionate"
								:key="cintura.id_cintura"
								:value="cintura.id_cintura"
							>
								{{ cintura.colore }}
							</option>
						</select>
					</div>
				</div>
				<div class="w-full flex items-center mt-2">
					<input
						type="checkbox"
						v-model="distintaPerCintura"
						class="mr-2"
						checked
					/>
					<label
						>Categoria distinta per ogni valore selezionato</label
					>
				</div>
				<!-- Aggiungi questa sezione per i checkbox del nome -->
				<div class="mb-4">
					<h3 class="font-bold mb-2">Opzioni generazione nome</h3>
					<div class="space-y-2 ml-4">
						<label class="block">
							<input
								type="checkbox"
								v-model="nomeFields.disciplina"
								class="mr-2"
							/>
							Includi disciplina
						</label>

						<label class="block">
							<input
								type="checkbox"
								v-model="nomeFields.sesso"
								class="mr-2"
							/>
							Includi sesso
						</label>

						<label class="block">
							<input
								type="checkbox"
								v-model="nomeFields.peso"
								class="mr-2"
							/>
							Includi peso
						</label>

						<label class="block">
							<input
								type="checkbox"
								v-model="nomeFields.fasce"
								class="mr-2"
							/>
							Includi fasce d'età
						</label>

						<label class="block">
							<input
								type="checkbox"
								v-model="nomeFields.cinture"
								class="mr-2"
							/>
							Includi cinture
						</label>
					</div>
				</div>
				<!-- Modifica la sezione dell'anteprima -->
				<div class="mb-4 mt-4 p-4 bg-gray-100 rounded">
					<h3 class="font-bold mb-2">
						Anteprima categorie che verranno generate:
					</h3>
					<div class="italic text-gray-600 max-h-48 overflow-y-auto">
						<div
							v-if="previewCategorie.length === 0"
							class="text-gray-500"
						>
							(Seleziona i valori per vedere l'anteprima)
						</div>
						<div
							v-for="(cat, index) in previewCategorie"
							:key="index"
							class="mb-1"
						>
							{{ cat }}
						</div>
					</div>
				</div>
				<!-- Pulsanti di azione -->
				<div class="w-full flex justify-end gap-4 mt-4">
					<button
						type="submit"
						class="bg-blue-500 text-white p-2 rounded"
					>
						Crea
					</button>
					<button
						@click="close"
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
import { ref, computed, onMounted } from "vue"
import type { PropType } from "vue"
import type {
	Categoria,
	Disciplina,
	FasciaEta, // Usa FasciaEta invece di Fascia
	Cintura,
	categorie_sesso, // Make sure this is imported
	Prisma, // Add this import for Decimal
} from "@prisma/client"
import { Decimal } from "@prisma/client/runtime/library"
import {
	type SessoOption,
	type CategoriaWithRelations,
	type CategoriaPreview,
	type CategoriaFasciaWithRelation,
	type CategoriaCinturaWithRelation,
} from "~/types/global"

const props = defineProps({
	discipline: {
		type: Array as PropType<Disciplina[]>,
		required: true,
	},
	sessoOptions: {
		type: Array as PropType<SessoOption[]>,
		required: true,
	},
	fasceEta: {
		type: Array as PropType<FasciaEta[]>,
		required: true,
	},
	cinture: {
		type: Array as PropType<Cintura[]>,
		required: true,
	},
})

const emit = defineEmits(["close", "create"])

// Tipizza i ref degli array
const disciplineDisponibili = ref<Disciplina[]>([])
const disciplineSelezionate = ref<Disciplina[]>([])
const tempDisciplineDisponibili = ref<string[]>([])
const tempDisciplineSelezionate = ref<string[]>([])

const sessoDisponibili = ref<SessoOption[]>([])
const sessoSelezionati = ref<SessoOption[]>([])
const tempSessiDisponibili = ref<string[]>([])
const tempSessiSelezionati = ref<string[]>([])

const fasceDisponibili = ref<FasciaEta[]>([])
const fasceSelezionate = ref<FasciaEta[]>([])
const tempFasceDisponibili = ref<number[]>([])
const tempFasceSelezionate = ref<number[]>([])

const cintureDisponibili = ref<Cintura[]>([])
const cintureSelezionate = ref<Cintura[]>([])
const tempCintureDisponibili = ref<number[]>([])
const tempCintureSelezionate = ref<number[]>([])

// Configurazione flags
const distintaPerDisciplina = ref(true)
const distintaPerSesso = ref(true)
const distintaPerFascia = ref(true)
const distintaPerCintura = ref(true)

const nomeFields = ref({
	disciplina: true,
	sesso: true,
	peso: true,
	fasce: true,
	cinture: true,
})

// Type guards migliorati
const isFasciaWithId = (
	fascia: FasciaEta
): fascia is Required<Pick<FasciaEta, "id_fascia">> & FasciaEta => {
	return typeof fascia.id_fascia === "number"
}

const isCinturaWithId = (
	cintura: Cintura
): cintura is Required<Pick<Cintura, "id_cintura">> & Cintura => {
	return typeof cintura.id_cintura === "number"
}

// Helper functions per il sorting
const sortByString = (
	a: { [key: string]: any },
	b: { [key: string]: any },
	field: string
): number => {
	return (a[field] || "").localeCompare(b[field] || "")
}

const sortById = (
	a: { [key: string]: any },
	b: { [key: string]: any },
	field: string
): number => {
	return (a[field] || 0) - (b[field] || 0)
}

onMounted(() => {
	disciplineDisponibili.value = [...props.discipline].sort((a, b) =>
		sortByString(a, b, "id_disciplina")
	)
	sessoDisponibili.value = [...props.sessoOptions].sort((a, b) =>
		sortByString(a, b, "value")
	)
	fasceDisponibili.value = [...props.fasceEta].sort((a, b) =>
		sortById(a, b, "id_fascia")
	)
	cintureDisponibili.value = [...props.cinture].sort((a, b) =>
		sortById(a, b, "id_cintura")
	)
})

// Modifica la funzione generateNome per utilizzare il nuovo tipo
const generateNome = (
	categoria: Partial<CategoriaWithRelations> | CategoriaPreview
): string => {
	const parts: string[] = []

	if (nomeFields.value.disciplina && categoria.disciplina?.id_disciplina) {
		const disciplina = props.discipline.find(
			(d) => d.id_disciplina === categoria.disciplina?.id_disciplina
		)
		if (disciplina?.valore) parts.push(disciplina.valore)
	}

	if (nomeFields.value.sesso && categoria.sesso) {
		const sessoOption = props.sessoOptions.find(
			(s) => s.value === categoria.sesso
		)
		if (sessoOption?.label) parts.push(sessoOption.label)
	}

	if (nomeFields.value.fasce) {
		let fasceDes: string[] = []
		if ("fasce" in categoria && Array.isArray(categoria.fasce)) {
			if (typeof categoria.fasce[0] === "number") {
				// Handle CategoriaPreview case
				fasceDes = (categoria.fasce as number[])
					.map(
						(id) =>
							props.fasceEta.find((f) => f.id_fascia === id)
								?.descrizione
					)
					.filter(Boolean) as string[]
			} else {
				// Handle CategoriaWithRelations case
				fasceDes = (categoria.fasce as CategoriaFasciaWithRelation[])
					.map((f) => f.fascia.descrizione)
					.filter(Boolean)
			}
		}
		if (fasceDes.length) parts.push(fasceDes.join("/"))
	}

	if (nomeFields.value.cinture) {
		let cintureCol: string[] = []
		if ("cinture" in categoria && Array.isArray(categoria.cinture)) {
			if (typeof categoria.cinture[0] === "number") {
				// Handle CategoriaPreview case
				cintureCol = (categoria.cinture as number[])
					.map(
						(id) =>
							props.cinture.find((c) => c.id_cintura === id)
								?.colore
					)
					.filter(Boolean) as string[]
			} else {
				// Handle CategoriaWithRelations case
				cintureCol = (
					categoria.cinture as CategoriaCinturaWithRelation[]
				)
					.map((c) => c.cintura.colore)
					.filter(Boolean)
			}
		}
		if (cintureCol.length) parts.push(cintureCol.join("-"))
	}

	return parts.join(" ")
}

// Funzione per creare combinazioni di valori
const createCombinations = <T>(arrays: T[][]): T[][] => {
	if (arrays.length === 0) return [[]]
	const [first, ...rest] = arrays
	const restCombinations = createCombinations(rest)
	return first.flatMap((item) =>
		restCombinations.map((combination) => [item, ...combination])
	)
}

// Funzioni per gestire le discipline
const aggiungiDiscipline = () => {
	if (!tempDisciplineDisponibili.value.length) return
	const selected = disciplineDisponibili.value.filter((d) =>
		tempDisciplineDisponibili.value.includes(d.id_disciplina || "")
	)
	disciplineSelezionate.value = [
		...disciplineSelezionate.value,
		...selected,
	].sort((a, b) => sortByString(a, b, "id_disciplina"))
	disciplineDisponibili.value = disciplineDisponibili.value.filter(
		(d) => !tempDisciplineDisponibili.value.includes(d.id_disciplina || "")
	)
	tempDisciplineDisponibili.value = []
}

const rimuoviDiscipline = () => {
	if (!tempDisciplineSelezionate.value.length) return
	const selected = disciplineSelezionate.value.filter((d) =>
		tempDisciplineSelezionate.value.includes(d.id_disciplina || "")
	)
	disciplineDisponibili.value = [
		...disciplineDisponibili.value,
		...selected,
	].sort((a, b) => sortByString(a, b, "id_disciplina"))
	disciplineSelezionate.value = disciplineSelezionate.value.filter(
		(d) => !tempDisciplineSelezionate.value.includes(d.id_disciplina || "")
	)
	tempDisciplineSelezionate.value = []
}

// Funzioni per gestire i sessi
const aggiungiSessi = () => {
	if (!tempSessiDisponibili.value.length) return
	const selected = sessoDisponibili.value.filter((s) =>
		tempSessiDisponibili.value.includes(s.value)
	)
	sessoSelezionati.value = [...sessoSelezionati.value, ...selected].sort(
		(a, b) => sortByString(a, b, "value")
	)
	sessoDisponibili.value = sessoDisponibili.value.filter(
		(s) => !tempSessiDisponibili.value.includes(s.value)
	)
	tempSessiDisponibili.value = []
}

const rimuoviSessi = () => {
	if (!tempSessiSelezionati.value.length) return
	const selected = sessoSelezionati.value.filter((s) =>
		tempSessiSelezionati.value.includes(s.value)
	)
	sessoDisponibili.value = [...sessoDisponibili.value, ...selected].sort(
		(a, b) => sortByString(a, b, "value")
	)
	sessoSelezionati.value = sessoSelezionati.value.filter(
		(s) => !tempSessiSelezionati.value.includes(s.value)
	)
	tempSessiSelezionati.value = []
}

// Funzioni per gestire le fasce
const aggiungiFasce = () => {
	if (!tempFasceDisponibili.value.length) return
	const selected = fasceDisponibili.value.filter((f) =>
		tempFasceDisponibili.value.includes(f.id_fascia || 0)
	)
	fasceSelezionate.value = [...fasceSelezionate.value, ...selected].sort(
		(a, b) => sortById(a, b, "id_fascia")
	)
	fasceDisponibili.value = fasceDisponibili.value.filter(
		(f) => !tempFasceDisponibili.value.includes(f.id_fascia || 0)
	)
	tempFasceDisponibili.value = []
}

const rimuoviFasce = () => {
	if (!tempFasceSelezionate.value.length) return
	const selected = fasceSelezionate.value.filter((f) =>
		tempFasceSelezionate.value.includes(f.id_fascia || 0)
	)
	fasceDisponibili.value = [...fasceDisponibili.value, ...selected].sort(
		(a, b) => sortById(a, b, "id_fascia")
	)
	fasceSelezionate.value = fasceSelezionate.value.filter(
		(f) => !tempFasceSelezionate.value.includes(f.id_fascia || 0)
	)
	tempFasceSelezionate.value = []
}

// Funzioni per gestire le cinture
const aggiungiCinture = () => {
	if (!tempCintureDisponibili.value.length) return
	const selected = cintureDisponibili.value.filter((c) =>
		tempCintureDisponibili.value.includes(c.id_cintura || 0)
	)
	cintureSelezionate.value = [...cintureSelezionate.value, ...selected].sort(
		(a, b) => sortById(a, b, "id_cintura")
	)
	cintureDisponibili.value = cintureDisponibili.value.filter(
		(c) => !tempCintureDisponibili.value.includes(c.id_cintura || 0)
	)
	tempCintureDisponibili.value = []
}

const rimuoviCinture = () => {
	if (!tempCintureSelezionate.value.length) return
	const selected = cintureSelezionate.value.filter((c) =>
		tempCintureSelezionate.value.includes(c.id_cintura || 0)
	)
	cintureDisponibili.value = [...cintureDisponibili.value, ...selected].sort(
		(a, b) => sortById(a, b, "id_cintura")
	)
	cintureSelezionate.value = cintureSelezionate.value.filter(
		(c) => !tempCintureSelezionate.value.includes(c.id_cintura || 0)
	)
	tempCintureSelezionate.value = []
}

// Funzione close
const close = () => {
	emit("close")
}

// ...existing code for buttons and handlers...

const handleSave = async () => {
	try {
		const arrays: any[][] = []

		if (disciplineSelezionate.value.length > 0) {
			arrays.push(
				distintaPerDisciplina.value
					? disciplineSelezionate.value
					: [disciplineSelezionate.value]
			)
		}

		if (sessoSelezionati.value.length > 0) {
			arrays.push(
				distintaPerSesso.value
					? sessoSelezionati.value
					: [sessoSelezionati.value]
			)
		}

		if (fasceSelezionate.value.length > 0) {
			arrays.push(
				distintaPerFascia.value
					? fasceSelezionate.value
					: [fasceSelezionate.value]
			)
		}

		if (cintureSelezionate.value.length > 0) {
			arrays.push(
				distintaPerCintura.value
					? cintureSelezionate.value
					: [cintureSelezionate.value]
			)
		}

		const combinations = createCombinations(arrays)
		const categoriesToCreate = combinations.map((combination) => {
			const [disciplina, sesso, fascia, cintura] = combination

			// Define type for relationships
			type CategoriaFasciaWithRelation = {
				id_fascia: number
				id_categoria: number
				fascia: FasciaEta
			}

			type CategoriaCinturaWithRelation = {
				id_cintura: number
				id_categoria: number
				cintura: Cintura
			}

			// Create the new categoria with proper typing
			const newCategoria: Partial<CategoriaWithRelations> = {
				nome: "",
				id_disciplina: disciplina?.id_disciplina,
				sesso: sesso?.value as categorie_sesso,
				peso_min: null,
				peso_max: null,
				n_ordine: null,
				fasce: distintaPerFascia.value
					? fascia?.id_fascia
						? ([
								{
									id_fascia: fascia.id_fascia,
									id_categoria: 0, // Will be set by the backend
									fascia: fascia,
								},
						  ] as CategoriaFasciaWithRelation[])
						: []
					: (fasceSelezionate.value.map((f) => ({
							id_fascia: f.id_fascia,
							id_categoria: 0, // Will be set by the backend
							fascia: f,
					  })) as CategoriaFasciaWithRelation[]),
				cinture: distintaPerCintura.value
					? cintura?.id_cintura
						? ([
								{
									id_cintura: cintura.id_cintura,
									id_categoria: 0, // Will be set by the backend
									cintura: cintura,
								},
						  ] as CategoriaCinturaWithRelation[])
						: []
					: (cintureSelezionate.value.map((c) => ({
							id_cintura: c.id_cintura,
							id_categoria: 0, // Will be set by the backend
							cintura: c,
					  })) as CategoriaCinturaWithRelation[]),
			}

			newCategoria.nome = generateNome(newCategoria)
			return newCategoria
		})

		console.log("Categorie da creare:", categoriesToCreate)
		emit("create", categoriesToCreate)
		emit("close")
	} catch (error) {
		console.error("Errore nella creazione delle categorie:", error)
	}
}

// Computed property per l'anteprima
const previewCategorie = computed(() => {
	const arrays: any[][] = []

	if (disciplineSelezionate.value.length > 0) {
		arrays.push(
			distintaPerDisciplina.value
				? disciplineSelezionate.value
				: [disciplineSelezionate.value]
		)
	}

	if (sessoSelezionati.value.length > 0) {
		arrays.push(
			distintaPerSesso.value
				? sessoSelezionati.value
				: [sessoSelezionati.value]
		)
	}

	if (fasceSelezionate.value.length > 0) {
		arrays.push(
			distintaPerFascia.value
				? fasceSelezionate.value
				: [fasceSelezionate.value]
		)
	}

	if (cintureSelezionate.value.length > 0) {
		arrays.push(
			distintaPerCintura.value
				? cintureSelezionate.value
				: [cintureSelezionate.value]
		)
	}

	const combinations = createCombinations(arrays)
	return combinations.map((combination) => {
		const [disciplina, sesso, fascia, cintura] = combination
		const categoria: CategoriaPreview = {
			disciplina: disciplina
				? {
						id_disciplina: disciplina.id_disciplina,
						valore: disciplina.valore,
				  }
				: undefined,
			sesso: sesso?.value,
			peso_min: null,
			peso_max: null,
			fasce: distintaPerFascia.value
				? [fascia?.id_fascia]
				: fasceSelezionate.value.map((f) => f.id_fascia),
			cinture: distintaPerCintura.value
				? [cintura?.id_cintura]
				: cintureSelezionate.value.map((c) => c.id_cintura),
		}
		return generateNome(categoria)
	})
})
</script>

<style scoped>
/* Aggiungi questi stili per gestire meglio lo scrolling dell'anteprima */
.max-h-48 {
	max-height: 12rem;
}

.overflow-y-auto {
	overflow-y: auto;
	scrollbar-width: thin;
}
</style>
