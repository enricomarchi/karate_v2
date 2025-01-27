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
					v-model="categoria.id_disciplina"
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
						v-for="s in sessoOptions"
						:key="s.id_sesso"
						:value="s.id_sesso"
					>
						{{ s.valore }}
					</option>
				</select>
				<input
					v-model="categoria.peso_min"
					type="number"
					placeholder="Peso Minimo"
					class="border p-2 rounded w-full"
				/>
				<input
					v-model="categoria.peso_max"
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

<script setup>
import { ref, watch, onMounted } from "vue"
import { useFetch } from "#app"

const props = defineProps({
	categoria: Object,
	discipline: Array,
	sessoOptions: Array,
	fasceEta: Array,
	cinture: Array,
})

const emit = defineEmits(["close", "save"])

const fasceDisponibili = ref([])
const fasceSelezionate = ref([])
const tempFasceDisponibili = ref([]) // Per la selezione dalla lista disponibile
const tempFasceSelezionate = ref([]) // Per la selezione dalla lista selezionata

const cintureDisponibili = ref([])
const cintureSelezionate = ref([])
const tempCintureDisponibili = ref([]) // Per la selezione dalla lista disponibile
const tempCintureSelezionate = ref([]) // Per la selezione dalla lista selezionata

const sortById = (a, b, idField) => a[idField] - b[idField]

onMounted(() => {
	fasceDisponibili.value = [...props.fasceEta].sort((a, b) =>
		sortById(a, b, "id_fascia")
	)
	cintureDisponibili.value = [...props.cinture].sort((a, b) =>
		sortById(a, b, "id_cintura")
	)
	// Inizializza categoria.id_disciplina se non è già definito
	if (!props.categoria.id_disciplina) {
		props.categoria.id_disciplina = ""
	}

	// Popola le liste selezionate se ci sono fasce e cinture
	if (props.categoria.fasce && props.categoria.fasce.length > 0) {
		// Trova le fasce corrispondenti agli ID
		fasceSelezionate.value = props.fasceEta.filter((f) =>
			props.categoria.fasce.includes(f.id_fascia)
		)
		// Rimuovi le fasce selezionate da quelle disponibili
		fasceDisponibili.value = fasceDisponibili.value.filter(
			(f) => !props.categoria.fasce.includes(f.id_fascia)
		)
	}

	if (props.categoria.cinture && props.categoria.cinture.length > 0) {
		// Trova le cinture corrispondenti agli ID
		cintureSelezionate.value = props.cinture.filter((c) =>
			props.categoria.cinture.includes(c.id_cintura)
		)
		// Rimuovi le cinture selezionate da quelle disponibili
		cintureDisponibili.value = cintureDisponibili.value.filter(
			(c) => !props.categoria.cinture.includes(c.id_cintura)
		)
	}
})

// Aggiungi questo watch per gestire i cambiamenti della categoria
watch(
	() => props.categoria,
	(newCategoria) => {
		if (newCategoria.fasce && newCategoria.fasce.length > 0) {
			fasceSelezionate.value = props.fasceEta.filter((f) =>
				newCategoria.fasce.includes(f.id_fascia)
			)
			fasceDisponibili.value = props.fasceEta.filter(
				(f) => !newCategoria.fasce.includes(f.id_fascia)
			)
		}

		if (newCategoria.cinture && newCategoria.cinture.length > 0) {
			cintureSelezionate.value = props.cinture.filter((c) =>
				newCategoria.cinture.includes(c.id_cintura)
			)
			cintureDisponibili.value = props.cinture.filter(
				(c) => !newCategoria.cinture.includes(c.id_cintura)
			)
		}
	},
	{ deep: true }
)

const aggiungiFasce = () => {
	const selezionate = fasceDisponibili.value.filter((fascia) =>
		tempFasceDisponibili.value.includes(fascia.id_fascia)
	)
	fasceSelezionate.value.push(...selezionate)
	fasceSelezionate.value.sort((a, b) => sortById(a, b, "id_fascia"))

	fasceDisponibili.value = fasceDisponibili.value.filter(
		(fascia) => !tempFasceDisponibili.value.includes(fascia.id_fascia)
	)
	tempFasceDisponibili.value = []
}

const rimuoviFasce = () => {
	const selezionate = fasceSelezionate.value.filter((fascia) =>
		tempFasceSelezionate.value.includes(fascia.id_fascia)
	)
	fasceDisponibili.value.push(...selezionate)
	fasceDisponibili.value.sort((a, b) => sortById(a, b, "id_fascia"))

	fasceSelezionate.value = fasceSelezionate.value.filter(
		(fascia) => !tempFasceSelezionate.value.includes(fascia.id_fascia)
	)
	tempFasceSelezionate.value = []
}

const aggiungiCinture = () => {
	const selezionate = cintureDisponibili.value.filter((cintura) =>
		tempCintureDisponibili.value.includes(cintura.id_cintura)
	)
	cintureSelezionate.value.push(...selezionate)
	cintureSelezionate.value.sort((a, b) => sortById(a, b, "id_cintura"))

	cintureDisponibili.value = cintureDisponibili.value.filter(
		(cintura) => !tempCintureDisponibili.value.includes(cintura.id_cintura)
	)
	tempCintureDisponibili.value = []
}

const rimuoviCinture = () => {
	const selezionate = cintureSelezionate.value.filter((cintura) =>
		tempCintureSelezionate.value.includes(cintura.id_cintura)
	)
	cintureDisponibili.value.push(...selezionate)
	cintureDisponibili.value.sort((a, b) => sortById(a, b, "id_cintura"))

	cintureSelezionate.value = cintureSelezionate.value.filter(
		(cintura) => !tempCintureSelezionate.value.includes(cintura.id_cintura)
	)
	tempCintureSelezionate.value = []
}

watch(
	() => [
		props.categoria.id_disciplina,
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

const generaNomeCategoria = () => {
	const disciplina =
		props.discipline.find(
			(d) => d.id_disciplina === props.categoria.id_disciplina
		)?.id_disciplina || ""
	const sesso =
		props.sessoOptions.find((s) => s.id_sesso === props.categoria.sesso)
			?.valore || ""
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

const handleSave = async () => {
	try {
		const fasceIds = fasceSelezionate.value.map((f) => f.id_fascia)
		const cintureIds = cintureSelezionate.value.map((c) => c.id_cintura)

		// Assegna automaticamente n_ordine se è una nuova categoria
		if (!props.categoria.id_categoria) {
			let maxNOrdine = 0
			try {
				const response = await fetch("/api/categorie?fields=n_ordine")
				const categorieEsistenti = await response.json()
				maxNOrdine = Math.max(
					0,
					...categorieEsistenti.map((c) => c.n_ordine || 0)
				)
			} catch (error) {
				console.error("Errore nel recupero di n_ordine:", error)
			}
			props.categoria.n_ordine = maxNOrdine + 1
		}

		const categoriaData = {
			...props.categoria,
			fasce: fasceIds,
			cinture: cintureIds,
		}

		const response = await fetch(
			`/api/categorie${
				categoriaData.id_categoria
					? `?id=${categoriaData.id_categoria}`
					: ""
			}`,
			{
				method: categoriaData.id_categoria ? "PUT" : "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(categoriaData),
			}
		)

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const savedCategoria = await response.json()
		emit("save", savedCategoria)
		close()
	} catch (error) {
		console.error("Errore nel salvataggio della categoria:", error)
	}
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

const generateNome = () => {
	if (!autoNomeEnabled.value) return

	const parts = []

	if (nomeFields.value.disciplina && props.categoria.id_disciplina) {
		const disciplina = props.discipline.find(
			(d) => d.id_disciplina === props.categoria.id_disciplina
		)
		if (disciplina) parts.push(disciplina.nome)
	}

	if (nomeFields.value.sesso && props.categoria.sesso) {
		parts.push(props.categoria.sesso)
	}

	if (
		nomeFields.value.peso &&
		(props.categoria.peso_min || props.categoria.peso_max)
	) {
		const peso = `${props.categoria.peso_min || "0"}-${
			props.categoria.peso_max || "∞"
		}kg`
		parts.push(peso)
	}

	if (nomeFields.value.fasce && props.categoria.fasce?.length > 0) {
		const fasceDes = props.categoria.fasce
			.map(
				(id) =>
					props.fasceEta.find((f) => f.id_fascia === id)?.descrizione
			)
			.filter(Boolean)
		if (fasceDes.length) parts.push(fasceDes.join("/"))
	}

	if (nomeFields.value.cinture && props.categoria.cinture?.length > 0) {
		const cintureCol = props.categoria.cinture
			.map((id) => props.cinture.find((c) => c.id_cintura === id)?.colore)
			.filter(Boolean)
		if (cintureCol.length) parts.push(cintureCol.join("/"))
	}

	props.categoria.nome = parts.join(" ")
}

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
	}
)
</script>

<style scoped>
.placeholder-option {
	color: #9ca3af; /* Colore grigio */
}
</style>
