<template>
	<div
		class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50"
	>
		<div
			class="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl overflow-auto max-h-[90vh]"
		>
			<h2 class="text-2xl font-bold mb-4">
				{{
					categoria.id_categoria
						? "Modifica Categoria"
						: "Aggiungi Categoria"
				}}
			</h2>
			<form @submit.prevent="handleSave" class="flex flex-wrap gap-4">
				<input
					v-model="categoria.nome"
					:disabled="autoNomeEnabled"
					placeholder="Nome categoria"
					class="border p-2 rounded w-full"
				/>
				<div class="mb-4">
					<label class="block mb-2">
						<input
							type="checkbox"
							v-model="autoNomeEnabled"
							class="mr-2"
						/>
						Genera nome automaticamente
					</label>

					<div v-if="autoNomeEnabled" class="ml-4 space-y-2">
						<label class="block">
							<input
								type="checkbox"
								v-model="nomeFields.disciplina"
								class="mr-2"
								@change="generateNome"
							/>
							Includi disciplina
						</label>

						<label class="block">
							<input
								type="checkbox"
								v-model="nomeFields.sesso"
								class="mr-2"
								@change="generateNome"
							/>
							Includi sesso
						</label>

						<label class="block">
							<input
								type="checkbox"
								v-model="nomeFields.peso"
								class="mr-2"
								@change="generateNome"
							/>
							Includi peso
						</label>

						<label class="block">
							<input
								type="checkbox"
								v-model="nomeFields.fasce"
								class="mr-2"
								@change="generateNome"
							/>
							Includi fasce d'età
						</label>

						<label class="block">
							<input
								type="checkbox"
								v-model="nomeFields.cinture"
								class="mr-2"
								@change="generateNome"
							/>
							Includi cinture
						</label>
					</div>
				</div>
				<select
					:value="categoria.disciplina?.id_disciplina"
					@input="updateDisciplina"
					class="border p-2 rounded w-full"
				>
					<option disabled value="" class="placeholder-option">
						Seleziona Disciplina
					</option>
					<option
						v-for="disciplina in discipline"
						:key="disciplina.id_disciplina"
						:value="disciplina.id_disciplina"
					>
						{{ disciplina.valore }}
					</option>
				</select>
				<select
					v-model="categoria.sesso"
					class="border p-2 rounded w-full"
				>
					<option disabled value="" class="placeholder-option">
						Seleziona Sesso
					</option>
					<option
						v-for="option in sessoOptions"
						:key="option.value"
						:value="option.value"
					>
						{{ option.label }}
					</option>
				</select>
				<input
					:value="categoria.peso_min"
					@input="(e) => updatePesoMin(e)"
					type="number"
					placeholder="Peso Minimo"
					class="border p-2 rounded w-full"
				/>
				<input
					:value="categoria.peso_max"
					@input="(e) => updatePesoMax(e)"
					type="number"
					placeholder="Peso Massimo"
					class="border p-2 rounded w-full"
				/>
				<!-- Selettore delle fasce -->
				<div class="w-full flex">
					<!-- Listbox delle fasce disponibili -->
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
					<!-- Bottoni per spostare le fasce -->
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
					<!-- Listbox delle fasce selezionate -->
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
				<!-- Selettore delle cinture -->
				<div class="w-full flex mt-4">
					<!-- Listbox delle cinture disponibili -->
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
					<!-- Bottoni per spostare le cinture -->
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
					<!-- Listbox delle cinture selezionate -->
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
				<!-- Pulsanti di azione -->
				<div class="w-full flex justify-end gap-4 mt-4">
					<button
						type="submit"
						class="bg-blue-500 text-white p-2 rounded"
					>
						Salva
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
import { ref, watch, onMounted } from "vue"
import type { PropType } from "vue" // Modifica qui: importazione type-only di PropType
import { useFetch } from "nuxt/app"
import {
	type Categoria,
	type Disciplina,
	type Fascia,
	type Cintura,
	type SessoOption, // Aggiungi l'importazione del tipo
	getSessoOptions,
} from "~/types/global"

const props = defineProps({
	categoria: {
		type: Object as PropType<Categoria>,
		required: true,
		default: () => ({
			nome: "",
			disciplina: undefined, // Modifica qui: rimuovi id_disciplina e usa disciplina
			sesso: undefined,
			peso_min: null,
			peso_max: null,
			n_ordine: null,
			fasce: [],
			cinture: [],
		}),
	},
	discipline: {
		type: Array as PropType<Disciplina[]>,
		required: true,
	},
	sessoOptions: {
		type: Array as PropType<SessoOption[]>,
		default: () => getSessoOptions(),
	},
	fasceEta: {
		type: Array as PropType<Fascia[]>,
		required: true,
	},
	cinture: {
		type: Array as PropType<Cintura[]>,
		required: true,
	},
})

const emit = defineEmits(["close", "save"])

// Tipizza i ref degli array
const fasceDisponibili = ref<Fascia[]>([])
const fasceSelezionate = ref<Fascia[]>([])
const tempFasceDisponibili = ref<number[]>([])
const tempFasceSelezionate = ref<number[]>([])

const cintureDisponibili = ref<WithId[]>([])
const cintureSelezionate = ref<WithId[]>([])
const tempCintureDisponibili = ref<number[]>([])
const tempCintureSelezionate = ref<number[]>([])

// Tipizza la funzione sortById
interface WithId {
	[key: string]: unknown
	id_fascia?: number
	id_cintura?: number
}

interface SortableItem extends WithId {
	id_fascia?: number
	id_cintura?: number
}

// Sostituisci la funzione sortById con una versione type-safe
const sortById = <T extends SortableItem>(
	a: T,
	b: T,
	idField: keyof T
): number => {
	const valueA = a[idField]
	const valueB = b[idField]
	if (typeof valueA === "number" && typeof valueB === "number") {
		return valueA - valueB
	}
	return 0
}

// Type guards migliorati per gestire gli ID
const isFasciaWithId = (
	fascia: Fascia
): fascia is Required<Pick<Fascia, "id_fascia">> & Fascia => {
	return typeof fascia.id_fascia === "number"
}

const isCinturaWithId = (
	cintura: Cintura
): cintura is Required<Pick<Cintura, "id_cintura">> & Cintura => {
	return typeof cintura.id_cintura === "number"
}

// Helper function per il confronto degli ID
const hasSameId = <T extends { id_fascia?: number } | { id_cintura?: number }>(
	a: T,
	b: T
): boolean => {
	if ("id_fascia" in a && "id_fascia" in b) {
		return a.id_fascia === b.id_fascia
	}
	if ("id_cintura" in a && "id_cintura" in b) {
		return a.id_cintura === b.id_cintura
	}
	return false
}

// Aggiorna la funzione filterFasce per usare il tipo Fascia
const filterFasce = (fasce: Fascia[], ids: number[]): Fascia[] => {
	return fasce.filter((f) => isFasciaWithId(f) && ids.includes(f.id_fascia))
}

const filterCinture = (cinture: WithId[], ids: number[]): WithId[] => {
	return cinture.filter(
		(c) => isCinturaWithId(c) && ids.includes(c.id_cintura!)
	)
}

// Helper functions per controllare gli array
const hasItems = <T>(arr: T[] | undefined): arr is T[] => {
	return Array.isArray(arr) && arr.length > 0
}

onMounted(async () => {
	// Recupera le fasce dal backend
	const { data: fascheData } = await useFetch<Fascia[]>("/api/fasce")
	if (fascheData.value) {
		fasceDisponibili.value = fascheData.value
		fasceDisponibili.value.sort((a, b) => {
			return (a.id_fascia || 0) - (b.id_fascia || 0)
		})
	}

	cintureDisponibili.value = [...props.cinture].map((c) => ({
		...c,
		id_cintura: c.id_cintura,
	})) as WithId[]
	cintureDisponibili.value.sort((a, b) => sortById(a, b, "id_cintura"))

	// Inizializza categoria.id_disciplina se non è già definito
	if (!props.categoria.disciplina) {
		props.categoria.disciplina = { id_disciplina: "", valore: "" }
	}

	// Popola le liste selezionate se ci sono fasce e cinture
	const fasce = props.categoria.fasce ?? []
	const cinture = props.categoria.cinture ?? []

	// Aggiorna la gestione delle fasce nella categoria
	if (props.categoria.fasce && props.categoria.fasce.length > 0) {
		const fasceIds = props.categoria.fasce
			.filter(isFasciaWithId)
			.map((f) => f.id_fascia)

		fasceSelezionate.value = filterFasce(fasceDisponibili.value, fasceIds)

		fasceDisponibili.value = fasceDisponibili.value.filter(
			(f) => isFasciaWithId(f) && !fasceIds.includes(f.id_fascia)
		)
	}

	if (hasItems(cinture)) {
		const cintureIds = cinture
			.filter(isCinturaWithId)
			.map((c) => c.id_cintura)
		cintureSelezionate.value = filterCinture(
			props.cinture.map((c) => ({ ...c, id_cintura: c.id_cintura })),
			cintureIds
		)
		cintureDisponibili.value = props.cinture
			.filter(
				(c) => isCinturaWithId(c) && !cintureIds.includes(c.id_cintura)
			)
			.map((c) => ({ ...c, id_cintura: c.id_cintura })) as WithId[]
	}

	// Inizializza la disciplina se non è già definita
	if (!props.categoria.disciplina && props.categoria.id_disciplina) {
		const selectedDisciplina = props.discipline.find(
			(d) => d.id_disciplina === props.categoria.id_disciplina
		)
		if (selectedDisciplina) {
			props.categoria.disciplina = {
				id_disciplina: selectedDisciplina.id_disciplina!,
				valore: selectedDisciplina.valore!,
			}
		}
	}
})

// Aggiungi questa funzione nello script setup
const updateDisciplina = (e: Event) => {
	const input = e.target as HTMLSelectElement
	const selectedDisciplina = props.discipline.find(
		(d) => d.id_disciplina === input.value
	)
	if (selectedDisciplina) {
		props.categoria.disciplina = {
			id_disciplina: selectedDisciplina.id_disciplina!,
			valore: selectedDisciplina.valore!,
		}
	} else {
		props.categoria.disciplina = undefined
	}
}

// Aggiungi questo watch per gestire i cambiamenti della categoria
watch(
	() => props.categoria,
	(newCategoria) => {
		const fasce = newCategoria.fasce ?? []
		const cinture = newCategoria.cinture ?? []

		if (hasItems(fasce)) {
			fasceSelezionate.value = props.fasceEta
				.filter(
					(f) =>
						isFasciaWithId(f) &&
						fasce.some(
							(fascia) =>
								isFasciaWithId(fascia) &&
								fascia.id_fascia === f.id_fascia
						)
				)
				.map((f) => ({ ...f, id_fascia: f.id_fascia })) as WithId[]
			fasceDisponibili.value = props.fasceEta
				.filter(
					(f) =>
						isFasciaWithId(f) &&
						!fasce.some(
							(fascia) =>
								isFasciaWithId(fascia) &&
								fascia.id_fascia === f.id_fascia
						)
				)
				.map((f) => ({ ...f, id_fascia: f.id_fascia })) as WithId[]
		}

		if (hasItems(cinture)) {
			cintureSelezionate.value = props.cinture
				.filter(
					(c) =>
						isCinturaWithId(c) &&
						cinture.some(
							(cintura) =>
								isCinturaWithId(cintura) &&
								cintura.id_cintura === c.id_cintura
						)
				)
				.map((c) => ({ ...c, id_cintura: c.id_cintura })) as WithId[]
			cintureDisponibili.value = props.cinture
				.filter(
					(c) =>
						isCinturaWithId(c) &&
						!cinture.some(
							(cintura) =>
								isCinturaWithId(cintura) &&
								cintura.id_cintura === c.id_cintura
						)
				)
				.map((c) => ({ ...c, id_cintura: c.id_cintura })) as WithId[]
		}
	},
	{ deep: true }
)

watch(
	() => [
		props.categoria.disciplina?.id_disciplina,
		props.categoria.sesso,
		props.categoria.peso_min,
		props.categoria.peso_max,
		fasceSelezionate.value,
		cintureSelezionate.value,
	],
	() => {
		if (autoNomeEnabled.value) {
			generaNomeCategoria()
		}
	},
	{ deep: true } // Aggiungi questa opzione
)

// Modifica la funzione generaNomeCategoria per gestire correttamente i valori undefined
const generaNomeCategoria = () => {
	const disciplina =
		props.discipline.find(
			(d) => d.id_disciplina === props.categoria.disciplina?.id_disciplina
		)?.valore || ""

	const sesso =
		props.sessoOptions.find((s) => s.value === props.categoria.sesso)
			?.label || ""

	const pesoMin = props.categoria.peso_min
		? `+${props.categoria.peso_min}Kg`
		: ""
	const pesoMax = props.categoria.peso_max
		? `-${props.categoria.peso_max}Kg`
		: ""

	// Usa fasceSelezionate invece di fasceSelezionateSelezionate
	const fasceDesc =
		fasceSelezionate.value.length > 0
			? `${fasceSelezionate.value.map((f) => f.descrizione).join(", ")}`
			: ""

	// Usa cintureSelezionate invece di cintureSelezionateSelezionate
	const cintureDesc =
		cintureSelezionate.value.length > 0
			? `${cintureSelezionate.value.map((c) => c.colore).join(", ")}`
			: ""

	// Crea array di elementi non vuoti
	const parts = [disciplina, sesso, pesoMin, pesoMax, fasceDesc, cintureDesc]

	// Unisci gli elementi con spazi
	props.categoria.nome = parts.filter(Boolean).join(" ")
}

const close = () => {
	emit("close")
}

const autoNomeEnabled = ref(false)
const nomeFields = ref({
	disciplina: true,
	sesso: true,
	peso: true,
	fasce: true,
	cinture: true,
})

// Osserva i cambiamenti dei campi rilevanti per aggiornare il nome
watch(
	[
		() => props.categoria.id_disciplina,
		() => props.categoria.sesso,
		() => props.categoria.peso_min,
		() => props.categoria.peso_max,
		() => props.categoria.fasce,
		() => props.categoria.cinture,
	],
	() => {
		if (autoNomeEnabled.value) {
			generateNome()
		}
	},
	{ deep: true }
)

interface HasId {
	id_fascia?: number
	id_cintura?: number
}

const getValidId = (item: HasId): number | null => {
	if ("id_fascia" in item && typeof item.id_fascia === "number") {
		return item.id_fascia
	}
	if ("id_cintura" in item && typeof item.id_cintura === "number") {
		return item.id_cintura
	}
	return null
}

const filterByIds = <T extends HasId>(items: T[], ids: number[]): T[] => {
	return items.filter((item) => {
		const id = getValidId(item)
		return id !== null && ids.includes(id)
	})
}

const filterOutByIds = <T extends HasId>(items: T[], ids: number[]): T[] => {
	return items.filter((item) => {
		const id = getValidId(item)
		return id !== null && !ids.includes(id)
	})
}

const aggiungiFasce = () => {
	if (!tempFasceDisponibili.value.length) return

	const validIds = tempFasceDisponibili.value.filter(
		(id): id is number => typeof id === "number"
	)
	const selezionate = filterByIds(fasceDisponibili.value, validIds)

	fasceSelezionate.value = [...fasceSelezionate.value, ...selezionate].sort(
		(a, b) => sortById(a, b, "id_fascia")
	)

	fasceDisponibili.value = filterOutByIds(fasceDisponibili.value, validIds)
	tempFasceDisponibili.value = []
}

const rimuoviFasce = () => {
	const validIds = tempFasceSelezionate.value.filter(
		(id): id is number => typeof id === "number"
	)
	const selezionate = filterByIds(fasceSelezionate.value, validIds)

	fasceDisponibili.value = [...fasceDisponibili.value, ...selezionate].sort(
		(a, b) => sortById(a, b, "id_fascia")
	)

	fasceSelezionate.value = filterOutByIds(fasceSelezionate.value, validIds)
	tempFasceSelezionate.value = []
}

// Applica lo stesso pattern per le cinture
const aggiungiCinture = () => {
	if (!tempCintureDisponibili.value.length) return

	const validIds = tempCintureDisponibili.value.filter(
		(id): id is number => typeof id === "number"
	)
	const selezionate = filterByIds(cintureDisponibili.value, validIds)

	cintureSelezionate.value = [
		...cintureSelezionate.value,
		...selezionate,
	].sort((a, b) => sortById(a, b, "id_cintura"))

	cintureDisponibili.value = filterOutByIds(
		cintureDisponibili.value,
		validIds
	)
	tempCintureDisponibili.value = []
}

const rimuoviCinture = () => {
	const validIds = tempCintureSelezionate.value.filter(
		(id): id is number => typeof id === "number"
	)
	const selezionate = filterByIds(cintureSelezionate.value, validIds)

	cintureDisponibili.value = [
		...cintureDisponibili.value,
		...selezionate,
	].sort((a, b) => sortById(a, b, "id_cintura"))

	cintureSelezionate.value = filterOutByIds(
		cintureSelezionate.value,
		validIds
	)
	tempCintureSelezionate.value = []
}

const handleSave = async () => {
	try {
		const fasceIds = fasceSelezionate.value
			.filter(isFasciaWithId)
			.map((f) => f.id_fascia)

		const cintureIds = cintureSelezionate.value
			.map((c) => getValidId(c))
			.filter((id): id is number => id !== null)

		// Prepara i dati della categoria per il salvataggio
		const disciplina = props.categoria.disciplina
			? {
					id_disciplina: props.categoria.disciplina.id_disciplina,
					valore: props.discipline.find(
						(d) =>
							d.id_disciplina ===
							props.categoria.disciplina?.id_disciplina
					)?.valore,
			  }
			: undefined

		const categoriaToSave = {
			...props.categoria,
			disciplina,
			fasce: fasceIds,
			cinture: cintureIds,
		}

		// Determina se è un nuovo inserimento o una modifica
		const method = props.categoria.id_categoria ? "PUT" : "POST"
		const query = props.categoria.id_categoria
			? { id: props.categoria.id_categoria }
			: undefined

		// Effettua la richiesta al backend
		const { data } = await useFetch("/api/categorie", {
			method,
			query,
			body: categoriaToSave,
		})

		// Emetti l'evento save con i dati aggiornati
		if (data.value) {
			emit("save", data.value)
		}
	} catch (error) {
		console.error("Errore nel salvataggio della categoria:", error)
	}
}

const updatePesoMin = (e: Event) => {
	const input = e.target as HTMLInputElement
	props.categoria.peso_min = input.value === "" ? null : Number(input.value)
}

const updatePesoMax = (e: Event) => {
	const input = e.target as HTMLInputElement
	props.categoria.peso_max = input.value === "" ? null : Number(input.value)
}

const generateNome = () => {
	if (!autoNomeEnabled.value) return

	const parts: string[] = []

	if (
		nomeFields.value.disciplina &&
		props.categoria.disciplina?.id_disciplina
	) {
		const disciplina =
			props.categoria.disciplina.valore ||
			props.discipline.find(
				(d) =>
					d.id_disciplina ===
					props.categoria.disciplina?.id_disciplina
			)?.valore ||
			""
		if (disciplina) {
			parts.push(disciplina)
		}
	}

	if (nomeFields.value.sesso && props.categoria.sesso) {
		const sessoLabel =
			props.sessoOptions.find((s) => s.value === props.categoria.sesso)
				?.label || ""
		if (sessoLabel) {
			parts.push(sessoLabel)
		}
	}

	if (nomeFields.value.peso) {
		const pesoMin = props.categoria.peso_min ?? 0
		const pesoMax = props.categoria.peso_max ?? "∞"
		const peso = `${pesoMin}-${pesoMax}kg`
		parts.push(peso)
	}

	if (nomeFields.value.fasce && fasceSelezionate.value.length > 0) {
		const fasceDesc = fasceSelezionate.value
			.filter((f) => f.descrizione)
			.map((f) => f.descrizione)
			.join(", ")
		if (fasceDesc) {
			parts.push(fasceDesc)
		}
	}

	if (nomeFields.value.cinture && cintureSelezionate.value.length > 0) {
		const cintureDesc = cintureSelezionate.value
			.map((c) => c.colore)
			.join(", ")
		parts.push(cintureDesc)
	}

	props.categoria.nome = parts.join(" ")
}
</script>

<style scoped>
.placeholder-option {
	color: #9ca3af; /* Colore grigio */
}
</style>
