<template>
	<div
		class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50"
	>
		<div
			class="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl overflow-auto max-h-[90vh]"
		>
			<h2 class="text-2xl font-bold mb-4">
				{{
					localIscrizione.id_iscrizione
						? "Modifica Iscrizione"
						: "Aggiungi Iscrizione"
				}}
			</h2>
			<form @submit.prevent="handleSave" class="flex flex-wrap gap-4">
				<!-- Sezione Atleta -->
				<div class="w-full space-y-4">
					<div class="flex justify-between items-center">
						<h3 class="font-semibold text-lg">Dati Atleta</h3>
						<button
							v-if="!isEditing"
							type="button"
							@click="toggleAtletaForm"
							class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
							:title="
								showAtletaForm
									? 'Torna alla selezione'
									: 'Aggiungi nuovo atleta'
							"
						>
							<i
								:class="
									showAtletaForm
										? 'fas fa-arrow-left'
										: 'fas fa-plus'
								"
							></i>
						</button>
					</div>

					<!-- Selezione atleta esistente -->
					<div v-if="!showAtletaForm" class="w-full">
						<label class="block mb-2 font-semibold">
							Seleziona Atleta:
						</label>
						<select
							v-model="localIscrizione.atleta"
							class="border p-2 rounded w-full"
							:disabled="isEditing"
							required
						>
							<option disabled value="">
								Seleziona un atleta
							</option>
							<option
								v-for="atleta in atleti"
								:key="atleta.id_atleta"
								:value="atleta"
							>
								{{ atleta.cognome }} {{ atleta.nome }}
							</option>
						</select>
					</div>

					<!-- Form dati atleta (per nuovo o modifica) -->
					<div
						v-if="showAtletaForm || isEditing"
						class="grid grid-cols-2 gap-4"
					>
						<!-- ID Atleta (solo in modalità modifica) -->
						<div v-if="isEditing" class="col-span-2">
							<label class="block mb-2 font-semibold">
								ID Atleta:
							</label>
							<input
								type="text"
								:value="localIscrizione.atleta?.id_atleta"
								class="border p-2 rounded w-full bg-gray-100"
								disabled
							/>
						</div>

						<!-- Cognome -->
						<div>
							<label class="block mb-2 font-semibold">
								Cognome:
							</label>
							<input
								v-model="atletaForm.cognome"
								class="border p-2 rounded w-full"
								placeholder="Cognome"
								required
							/>
						</div>

						<!-- Nome -->
						<div>
							<label class="block mb-2 font-semibold"
								>Nome:</label
							>
							<input
								v-model="atletaForm.nome"
								class="border p-2 rounded w-full"
								placeholder="Nome"
								required
							/>
						</div>

						<!-- Sesso -->
						<div>
							<label class="block mb-2 font-semibold"
								>Sesso:</label
							>
							<select
								v-model="atletaForm.sesso"
								class="border p-2 rounded w-full"
								required
							>
								<option value="" disabled>
									Seleziona Sesso
								</option>
								<option value="M">Maschile</option>
								<option value="F">Femminile</option>
							</select>
						</div>

						<!-- Anno di nascita -->
						<div>
							<label class="block mb-2 font-semibold">
								Anno di nascita:
							</label>
							<input
								v-model="atletaForm.anno_nascita"
								type="number"
								class="border p-2 rounded w-full"
								placeholder="Anno di nascita"
								required
							/>
						</div>

						<!-- Cintura -->
						<div>
							<label class="block mb-2 font-semibold">
								Cintura:
							</label>
							<select
								v-model="atletaForm.cintura_id"
								class="border p-2 rounded w-full"
								required
							>
								<option value="" disabled>
									Seleziona Cintura
								</option>
								<option
									v-for="cintura in cinture"
									:key="cintura.id_cintura"
									:value="cintura.id_cintura"
								>
									{{ cintura.colore }}
								</option>
							</select>
						</div>

						<!-- Peso -->
						<div>
							<label class="block mb-2 font-semibold">
								Peso (kg):
							</label>
							<input
								v-model="atletaForm.peso_kg"
								type="number"
								class="border p-2 rounded w-full"
								placeholder="Peso in kg"
							/>
						</div>

						<!-- Società -->
						<div>
							<label class="block mb-2 font-semibold">
								Società:
							</label>
							<select
								v-model="atletaForm.id_societa"
								class="border p-2 rounded w-full"
								required
							>
								<option value="" disabled>
									Seleziona Società
								</option>
								<option
									v-for="s in societa"
									:key="s.id_societa"
									:value="s.id_societa"
								>
									{{ s.nome_societa }}
								</option>
							</select>
						</div>

						<!-- Dan -->
						<div>
							<label class="block mb-2 font-semibold">Dan:</label>
							<input
								v-model="atletaForm.dan"
								type="number"
								class="border p-2 rounded w-full"
								placeholder="Dan"
								min="0"
							/>
						</div>
					</div>
				</div>

				<!-- Sezione Disciplina -->
				<div class="w-full">
					<label class="block mb-2 font-semibold">Disciplina:</label>
					<select
						v-model="localIscrizione.disciplina"
						class="border p-2 rounded w-full"
						required
					>
						<option disabled value="">Seleziona Disciplina</option>
						<option
							v-for="disciplina in discipline"
							:key="disciplina.id_disciplina"
							:value="disciplina"
						>
							{{ disciplina.valore }}
						</option>
					</select>
				</div>

				<!-- Checkbox per conferma automatica -->
				<div class="w-full flex items-center gap-2">
					<input
						type="checkbox"
						id="conferma-automatica"
						v-model="confermaAutomatica"
						class="form-checkbox h-5 w-5 text-blue-600"
					/>
					<label for="conferma-automatica" class="text-gray-700">
						Conferma automaticamente l'iscrizione
					</label>
				</div>

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
import { ref, watch, computed } from "vue"
import type { PropType } from "vue"
import { useFetch } from "nuxt/app"
import type {
	Iscrizione,
	Atleta,
	Disciplina,
	Categoria,
	Cintura,
	Societa,
} from "~/types/global"

const props = defineProps({
	iscrizione: {
		type: Object as PropType<Iscrizione>,
		required: true,
	},
	atleti: {
		type: Array as PropType<Atleta[]>,
		required: true,
	},
	discipline: {
		type: Array as PropType<Disciplina[]>,
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
})

const emit = defineEmits(["close", "save"])
const isEditing = computed(() => !!props.iscrizione.id_iscrizione)

// 1. Prima definisci atletaForm
const atletaForm = ref<Partial<Atleta>>(
	isEditing.value && props.iscrizione.atleta
		? { ...props.iscrizione.atleta }
		: {
				cognome: "",
				nome: "",
				sesso: undefined,
				anno_nascita: undefined,
				cintura_id: undefined,
				dan: undefined,
				peso_kg: undefined,
				id_societa: undefined,
		  }
)

// 2. Poi definisci gli altri ref
const localIscrizione = ref<Iscrizione>({ ...props.iscrizione })
const confermaAutomatica = ref(props.iscrizione.confermata ?? true)
const showAtletaForm = ref(false)

// 3. Infine aggiungi il watch
watch(
	() => props.iscrizione,
	(newValue) => {
		// Aggiorna l'iscrizione locale
		localIscrizione.value = { ...newValue }

		// Se siamo in modalità modifica, precarica i dati dell'atleta
		if (newValue.id_iscrizione && newValue.atleta) {
			atletaForm.value = { ...newValue.atleta }
			showAtletaForm.value = false // Nascondi il form di creazione
		} else {
			// Reset del form atleta se non siamo in modalità modifica
			atletaForm.value = {
				cognome: "",
				nome: "",
				sesso: undefined,
				anno_nascita: undefined,
				cintura_id: undefined,
				dan: undefined,
				peso_kg: undefined,
				id_societa: undefined,
			}
		}

		// Imposta il valore della conferma automatica
		confermaAutomatica.value = newValue.confermata ?? true
	},
	{ immediate: true, deep: true }
)

const close = () => {
	emit("close")
}

const nuovoAtleta = ref<Partial<Atleta>>({
	cognome: "",
	nome: "",
	sesso: undefined,
	anno_nascita: undefined,
	cintura_id: undefined,
	dan: undefined,
	peso_kg: undefined,
	id_societa: undefined,
})

const toggleAtletaForm = () => {
	showAtletaForm.value = !showAtletaForm.value
	if (!showAtletaForm.value) {
		// Reset form when hiding
		nuovoAtleta.value = {
			cognome: "",
			nome: "",
			sesso: undefined,
			anno_nascita: undefined,
			cintura_id: undefined,
			dan: undefined,
			peso_kg: undefined,
			id_societa: undefined,
		}
	}
}

// Aggiorna atletaForm quando cambia l'iscrizione
watch(
	() => props.iscrizione,
	(newValue) => {
		if (newValue.atleta) {
			atletaForm.value = { ...newValue.atleta }
		}
	},
	{ deep: true }
)

const handleSave = async () => {
	try {
		if (isEditing.value) {
			// Aggiorna i dati dell'atleta
			const { data: atletaAggiornato } = await useFetch(`/api/atleti`, {
				method: "PUT",
				query: { id: atletaForm.value.id_atleta },
				body: atletaForm.value,
			})

			if (atletaAggiornato.value) {
				localIscrizione.value.atleta = atletaAggiornato.value
			}
		} else if (showAtletaForm.value) {
			// Crea nuovo atleta
			const { data: nuovoAtleta } = await useFetch("/api/atleti", {
				method: "POST",
				body: atletaForm.value,
			})

			if (nuovoAtleta.value) {
				localIscrizione.value.atleta = nuovoAtleta.value
			}
		}

		// Prepara l'iscrizione per il salvataggio
		const iscrizioneDaSalvare = {
			...localIscrizione.value,
			confermata: confermaAutomatica.value,
			// Aggiungi esplicitamente la disciplina se è stata modificata
			disciplina: localIscrizione.value.disciplina,
			// Mantieni l'id dell'iscrizione se stiamo modificando
			id_iscrizione: isEditing.value
				? localIscrizione.value.id_iscrizione
				: undefined,
		}

		// Chiamata all'API che ora internamente userà la utils categorieUtils
		emit("save", iscrizioneDaSalvare)
	} catch (error) {
		console.error("Errore nel salvataggio:", error)
	}
}
</script>

<style scoped>
.placeholder-option {
	color: #9ca3af;
}
</style>
