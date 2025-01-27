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
								:key="s.id_sesso"
								:value="s.id_sesso"
							>
								{{ s.valore }}
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
								:key="s.id_sesso"
								:value="s.id_sesso"
							>
								{{ s.valore }}
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

<script setup>
import { ref, onMounted, computed } from "vue"

const props = defineProps({
	discipline: Array,
	sessoOptions: Array,
	fasceEta: Array,
	cinture: Array,
})

const emit = defineEmits(["close", "create"])

const disciplineDisponibili = ref([])
const disciplineSelezionate = ref([])
const tempDisciplineDisponibili = ref([])
const tempDisciplineSelezionate = ref([])

const sessoDisponibili = ref([])
const sessoSelezionati = ref([])
const tempSessiDisponibili = ref([])
const tempSessiSelezionati = ref([])

const fasceDisponibili = ref([])
const fasceSelezionate = ref([])
const tempFasceDisponibili = ref([])
const tempFasceSelezionate = ref([])

const cintureDisponibili = ref([])
const cintureSelezionate = ref([])
const tempCintureDisponibili = ref([])
const tempCintureSelezionate = ref([])

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

const sortById = (a, b, idField) => a[idField] - b[idField]
const sortByString = (a, b, idField) => a[idField].localeCompare(b[idField])

onMounted(() => {
	disciplineDisponibili.value = [...props.discipline].sort((a, b) =>
		sortByString(a, b, "id_disciplina")
	)
	sessoDisponibili.value = [...props.sessoOptions].sort((a, b) =>
		sortByString(a, b, "id_sesso")
	)
	fasceDisponibili.value = [...props.fasceEta].sort((a, b) =>
		sortById(a, b, "id_fascia")
	)
	cintureDisponibili.value = [...props.cinture].sort((a, b) =>
		sortById(a, b, "id_cintura")
	)
})

const aggiungiDiscipline = () => {
	const selezionate = disciplineDisponibili.value.filter((disciplina) =>
		tempDisciplineDisponibili.value.includes(disciplina.id_disciplina)
	)
	disciplineSelezionate.value.push(...selezionate)
	disciplineSelezionate.value.sort((a, b) =>
		sortByString(a, b, "id_disciplina")
	)

	disciplineDisponibili.value = disciplineDisponibili.value.filter(
		(disciplina) =>
			!tempDisciplineDisponibili.value.includes(disciplina.id_disciplina)
	)
	tempDisciplineDisponibili.value = []
}

const rimuoviDiscipline = () => {
	const selezionate = disciplineSelezionate.value.filter((disciplina) =>
		tempDisciplineSelezionate.value.includes(disciplina.id_disciplina)
	)
	disciplineDisponibili.value.push(...selezionate)
	disciplineDisponibili.value.sort((a, b) =>
		sortByString(a, b, "id_disciplina")
	)

	disciplineSelezionate.value = disciplineSelezionate.value.filter(
		(disciplina) =>
			!tempDisciplineSelezionate.value.includes(disciplina.id_disciplina)
	)
	tempDisciplineSelezionate.value = []
}

const aggiungiSessi = () => {
	const selezionati = sessoDisponibili.value.filter((s) =>
		tempSessiDisponibili.value.includes(s.id_sesso)
	)
	sessoSelezionati.value.push(...selezionati)
	sessoSelezionati.value.sort((a, b) => sortByString(a, b, "id_sesso"))

	sessoDisponibili.value = sessoDisponibili.value.filter(
		(s) => !tempSessiDisponibili.value.includes(s.id_sesso)
	)
	tempSessiDisponibili.value = []
}

const rimuoviSessi = () => {
	const selezionati = sessoSelezionati.value.filter((s) =>
		tempSessiSelezionati.value.includes(s.id_sesso)
	)
	sessoDisponibili.value.push(...selezionati)
	sessoDisponibili.value.sort((a, b) => sortByString(a, b, "id_sesso"))

	sessoSelezionati.value = sessoSelezionati.value.filter(
		(s) => !tempSessiSelezionati.value.includes(s.id_sesso)
	)
	tempSessiSelezionati.value = []
}

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

const generateNome = (categoria) => {
	const parts = []

	if (nomeFields.value.disciplina && categoria.id_disciplina) {
		const disciplina = props.discipline.find(
			(d) => d.id_disciplina === categoria.id_disciplina
		)
		if (disciplina) parts.push(disciplina.valore)
	}

	if (nomeFields.value.sesso && categoria.sesso) {
		const sessoOption = props.sessoOptions.find(
			(s) => s.id_sesso === categoria.sesso
		)
		if (sessoOption) parts.push(sessoOption.valore)
	}

	if (nomeFields.value.peso && (categoria.peso_min || categoria.peso_max)) {
		const peso = `${categoria.peso_min || "0"}-${
			categoria.peso_max || "∞"
		}kg`
		parts.push(peso)
	}

	if (nomeFields.value.fasce && categoria.fasce?.length > 0) {
		const fasceDes = categoria.fasce
			.map(
				(id) =>
					props.fasceEta.find((f) => f.id_fascia === id)?.descrizione
			)
			.filter(Boolean)
		if (fasceDes.length) parts.push(fasceDes.join("/"))
	}

	if (nomeFields.value.cinture && categoria.cinture?.length > 0) {
		const cintureCol = categoria.cinture
			.map((id) => props.cinture.find((c) => c.id_cintura === id)?.colore)
			.filter(Boolean)
		if (cintureCol.length) parts.push(cintureCol.join("/"))
	}

	return parts.join(" ")
}

const handleSave = async () => {
	const createCombinations = (arrays) => {
		if (arrays.length === 0) return [[]]
		const [first, ...rest] = arrays
		const restCombinations = createCombinations(rest)
		return first.flatMap((item) =>
			restCombinations.map((combination) => [item, ...combination])
		)
	}

	let categoriesToCreate = []

	// Prepara gli array per le combinazioni
	const arrays = []

	// Aggiungi discipline
	if (disciplineSelezionate.value.length > 0) {
		arrays.push(
			distintaPerDisciplina.value
				? disciplineSelezionate.value
				: [disciplineSelezionate.value]
		)
	}

	// Aggiungi sessi
	if (sessoSelezionati.value.length > 0) {
		arrays.push(
			distintaPerSesso.value
				? sessoSelezionati.value
				: [sessoSelezionati.value]
		)
	}

	// Aggiungi fasce
	if (fasceSelezionate.value.length > 0) {
		arrays.push(
			distintaPerFascia.value
				? fasceSelezionate.value
				: [fasceSelezionate.value]
		)
	}

	// Aggiungi cinture
	if (cintureSelezionate.value.length > 0) {
		arrays.push(
			distintaPerCintura.value
				? cintureSelezionate.value
				: [cintureSelezionate.value]
		)
	}

	const combinations = createCombinations(arrays)

	for (const combination of combinations) {
		const [disciplina, sesso, fascia, cintura] = combination

		// Crea l'oggetto mockCategoria con gli stessi dati usati nel preview
		const mockCategoria = {
			id_disciplina: disciplina?.id_disciplina || null,
			sesso: sesso?.id_sesso || null,
			fasce: distintaPerFascia.value
				? [fascia?.id_fascia].filter(Boolean)
				: fasceSelezionate.value.map((f) => f.id_fascia),
			cinture: distintaPerCintura.value
				? [cintura?.id_cintura].filter(Boolean)
				: cintureSelezionate.value.map((c) => c.id_cintura),
		}

		const categoria = {
			nome: generateNome(mockCategoria), // Usa la stessa funzione del preview
			id_disciplina: mockCategoria.id_disciplina,
			sesso: mockCategoria.sesso,
			fasce: mockCategoria.fasce,
			cinture: mockCategoria.cinture,
			peso_min: null,
			peso_max: null,
			n_ordine: null,
		}
		categoriesToCreate.push(categoria)
	}

	// Ottieni il valore massimo di n_ordine esistente
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

	// Assegna n_ordine incrementale e crea le categorie in modo sincrono
	for (const categoria of categoriesToCreate) {
		maxNOrdine += 1
		categoria.n_ordine = maxNOrdine

		// Crea la categoria nel database
		try {
			const response = await fetch("/api/categorie", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(categoria),
			})

			if (!response.ok) {
				throw new Error(
					`Errore nella creazione della categoria: ${response.statusText}`
				)
			}

			const nuovaCategoria = await response.json()
			// Puoi gestire la nuova categoria se necessario
		} catch (error) {
			console.error("Errore nella creazione della categoria:", error)
			// Gestisci l'errore secondo le tue necessità
		}
	}

	// Dopo aver creato tutte le categorie, emetti l'evento e chiudi il form
	emit("create", categoriesToCreate)
	close()
}

const close = () => {
	emit("close")
}

// Sostituisci la computed property previewNome con questa nuova versione
const previewCategorie = computed(() => {
	// Usa la stessa logica di createCombinations da handleSave
	const createCombinations = (arrays) => {
		if (arrays.length === 0) return [[]]
		const [first, ...rest] = arrays
		const restCombinations = createCombinations(rest)
		return first.flatMap((item) =>
			restCombinations.map((combination) => [item, ...combination])
		)
	}

	// Prepara gli array per le combinazioni
	const arrays = []

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

	if (arrays.length === 0) return []

	const combinations = createCombinations(arrays)

	return combinations
		.map((combination) => {
			const [disciplina, sesso, fascia, cintura] = combination
			const mockCategoria = {
				id_disciplina: disciplina?.id_disciplina,
				sesso: sesso?.id_sesso,
				fasce: distintaPerFascia.value
					? [fascia?.id_fascia].filter(Boolean)
					: fasceSelezionate.value.map((f) => f.id_fascia),
				cinture: distintaPerCintura.value
					? [cintura?.id_cintura].filter(Boolean)
					: cintureSelezionate.value.map((c) => c.id_cintura),
			}

			return generateNome(mockCategoria)
		})
		.filter(Boolean)
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
