<template>
	<div class="bg-gray-100">
		<div
			class="flex items-center justify-between mx-auto px-24 w-full py-4 bg-gray-200 fixed top-16 z-10 toolbar"
		>
			<h1 class="text-2xl font-bold">Matrice Iscrizioni</h1>
			<div class="flex gap-4">
				<select v-model="selectedDisciplina" class="px-4 py-2 rounded">
					<option value="">Tutte le discipline</option>
					<option
						v-for="d in discipline"
						:key="d.id_disciplina"
						:value="d.id_disciplina"
					>
						{{ d.id_disciplina }}
					</option>
				</select>
				<select v-model="selectedSesso" class="px-4 py-2 rounded">
					<option value="">Tutti i sessi</option>
					<option value="MASCHILE">MASCHILE</option>
					<option value="FEMMINILE">FEMMINILE</option>
					<option value="MISTO">MISTO</option>
				</select>
				<!-- Aggiungi il tasto di azione per accorpare -->
				<button
					v-if="selectedCells.size >= 2"
					@click="showAccorpamentoDialog"
					class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
				>
					Accorpa Categorie
				</button>
				<button
					v-if="hasSelectedAccorpamento"
					@click="eliminaAccorpamento"
					class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
				>
					Elimina Accorpamento
				</button>
				<button
					v-if="selectedCells.size === 1"
					@click="showPoolDialog"
					class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
				>
					Dividi Pool
				</button>
				<button
					v-if="hasSelectedPools"
					@click="eliminaPools"
					class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
				>
					Elimina Pool
				</button>
			</div>
		</div>

		<div class="bg-gray-100 pt-28 pb-8 px-24">
			<div class="flex flex-col items-center">
				<div
					v-for="disciplina in disciplineToShow"
					:key="disciplina"
					class="mb-12 w-full flex flex-col items-center"
				>
					<h2
						class="text-3xl font-bold mb-8 pb-2 border-b-4 border-blue-500"
					>
						{{ disciplina }}
					</h2>
					<div class="flex flex-wrap justify-evenly w-full px-8">
						<div
							v-for="sesso in sessiToShow"
							:key="sesso"
							class="mb-8"
						>
							<h3
								class="text-xl font-semibold mb-4 text-center"
								:class="{
									'text-blue-500': sesso === 'MASCHILE',
									'text-pink-500': sesso === 'FEMMINILE',
								}"
							>
								{{ sesso }}
							</h3>
							<div class="inline-block">
								<table class="bg-white border-collapse">
									<thead>
										<tr>
											<th
												class="border p-2 bg-gray-300 text-left"
											>
												<!-- Rimosso il titolo "Cinture" -->
											</th>
											<th
												v-for="fascia in getFasceForDisciplina(
													disciplina
												)"
												:key="fascia"
												class="border p-2 bg-gray-300 text-center w-14"
											>
												{{ fascia }}
											</th>
										</tr>
									</thead>
									<tbody>
										<tr
											v-for="cinture in getCintureForDisciplinaAndSesso(
												disciplina,
												sesso
											)"
											:key="cinture"
										>
											<td
												class="border p-2 font-medium bg-gray-300"
											>
												{{ cinture }}
											</td>
											<td
												v-for="fascia in getFasceForDisciplina(
													disciplina
												)"
												:key="`${cinture}-${fascia}`"
												class="border p-0 text-center h-14 w-14 relative cursor-pointer"
												:class="[
													getCellStyle(
														cinture,
														fascia,
														disciplina,
														sesso
													),
													getNumPools(
														cinture,
														fascia,
														disciplina,
														sesso
													)
														? 'border-2 border-green-500'
														: '',
												]"
												@click.stop="
													toggleCellSelection(
														cinture,
														fascia,
														disciplina,
														sesso,
														$event
													)
												"
												@mouseenter="
													handleCellHover(
														cinture,
														fascia,
														disciplina,
														sesso,
														true
													)
												"
												@mouseleave="
													handleCellHover(
														cinture,
														fascia,
														disciplina,
														sesso,
														false
													)
												"
											>
												<!-- Aggiungi l'indicatore del numero d'ordine -->

												<span
													v-if="
														getNumeroOrdine(
															cinture,
															fascia,
															disciplina,
															sesso
														)
													"
													class="absolute top-1 left-1 text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full"
												>
													{{
														getNumeroOrdine(
															cinture,
															fascia,
															disciplina,
															sesso
														)
													}}
												</span>

												<div
													class="flex items-center justify-center h-full w-full flex-col"
												>
													<span
														v-if="
															getNumeroIscrittiPerCinture(
																cinture,
																fascia,
																disciplina,
																sesso
															) > 0
														"
														class="text-2xl font-bold"
													>
														{{
															getNumeroIscrittiPerCinture(
																cinture,
																fascia,
																disciplina,
																sesso
															)
														}}
													</span>
													<span
														v-if="
															getNumPools(
																cinture,
																fascia,
																disciplina,
																sesso
															)
														"
														class="text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-800 rounded-full"
													>
														{{
															getNumPools(
																cinture,
																fascia,
																disciplina,
																sesso
															)
														}}
														pool
													</span>
												</div>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Dialog per accorpamento -->
		<div
			v-if="showDialog"
			class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center dialog"
		>
			<div class="bg-white p-6 rounded-lg shadow-lg w-[32rem]">
				<h3 class="text-lg font-bold mb-4">Accorpa Categorie</h3>
				<input
					v-model="nomeAccorpamento"
					placeholder="Nome nuova categoria"
					class="border p-2 mb-4 w-full"
				/>
				<div class="flex justify-end gap-2">
					<button
						@click="closeDialog"
						class="bg-gray-500 text-white px-4 py-2 rounded"
					>
						Annulla
					</button>
					<button
						@click="confermaAccorpamento"
						class="bg-blue-500 text-white px-4 py-2 rounded"
					>
						Conferma
					</button>
				</div>
			</div>
		</div>

		<!-- Dialog per divisione pool -->
		<div
			v-if="showPoolDialogVisible"
			class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
			@click.stop
		>
			<div
				class="bg-white p-6 rounded-lg shadow-lg w-[32rem]"
				@click.stop
			>
				<h3 class="text-lg font-bold mb-4">Dividi in Pool</h3>
				<input
					v-model.number="numPools"
					type="number"
					min="2"
					placeholder="Numero di pool"
					class="border p-2 mb-4 w-full"
				/>
				<div class="flex justify-end gap-2">
					<button
						@click.stop="closePoolDialog"
						class="bg-gray-500 text-white px-4 py-2 rounded"
					>
						Annulla
					</button>
					<button
						@click.stop="confermaDivisionePool"
						class="bg-green-500 text-white px-4 py-2 rounded"
					>
						Conferma
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue"
import { useFetch } from "#app"

const selectedDisciplina = ref("")
const selectedSesso = ref("")
const selectedCells = ref(new Set())
const currentTable = ref(null)
const hoveredAccorpamento = ref(null)
const showDialog = ref(false)
const nomeAccorpamento = ref("")
const showPoolDialogVisible = ref(false)
const numPools = ref(2)

// Aggiungi questa ref per tenere traccia delle celle selezionate
// const selectedCells = ref(new Set())

// Aggiungi ref per la tabella corrente
// const currentTable = ref(null)

// Aggiungi questa funzione per ottenere l'id della categoria
const getCategoriaId = (cinture, fascia, disciplina, sesso) => {
	const sessoCode =
		sesso === "MASCHILE" ? "M" : sesso === "FEMMINILE" ? "F" : "MIXED"
	const item = matriceData.value?.find(
		(item) =>
			item.id_disciplina === disciplina &&
			item.sesso === sessoCode &&
			item.cinture === cinture &&
			item.fascia === fascia &&
			item.id_categoria // Verifica che id_categoria esista
	)
	return item?.id_categoria
}

// Modifica la funzione toggleCellSelection per includere il console.log per debug
const toggleCellSelection = (cinture, fascia, disciplina, sesso, event) => {
	// Impedisci che l'evento si propaghi al documento
	event.stopPropagation()
	const sessoCode =
		sesso === "MASCHILE" ? "M" : sesso === "FEMMINILE" ? "F" : "MIXED"
	const item = matriceData.value?.find(
		(item) =>
			item.id_disciplina === disciplina &&
			item.sesso === sessoCode &&
			item.cinture === cinture &&
			item.fascia === fascia
	)

	if (!item?.id_categoria) return

	const tableId = `${disciplina}-${sesso}`
	if (currentTable.value !== tableId) {
		selectedCells.value = new Set()
		currentTable.value = tableId
	}

	const newSelected = new Set(selectedCells.value)

	// Se la cella fa parte di un accorpamento, seleziona/deseleziona tutto il gruppo
	if (item.n_accorpamento) {
		const accorpamentoItems = matriceData.value.filter(
			(cell) => cell.n_accorpamento === item.n_accorpamento
		)
		const allSelected = accorpamentoItems.every((cell) =>
			selectedCells.value.has(cell.id_categoria)
		)

		accorpamentoItems.forEach((cell) => {
			if (allSelected) {
				newSelected.delete(cell.id_categoria)
			} else {
				newSelected.add(cell.id_categoria)
			}
		})
	} else {
		if (newSelected.has(item.id_categoria)) {
			newSelected.delete(item.id_categoria)
		} else {
			newSelected.add(item.id_categoria)
		}
	}

	selectedCells.value = newSelected
}

// Aggiungi questa funzione per deselezionare tutte le celle
const clearSelection = () => {
	selectedCells.value = new Set()
	currentTable.value = null
}

// Modifica l'handler per il click globale per ignorare i click sulla toolbar
const handleGlobalClick = (event) => {
	// Verifica se il click è avvenuto sulla toolbar o sul dialog
	const isToolbar = event.target.closest(".toolbar")
	const isDialog = event.target.closest(".dialog")
	const isTableCell = event.target.closest("td")

	// Deseleziona solo se il click non è sulla toolbar, sul dialog o su una cella
	if (!isToolbar && !isDialog && !isTableCell) {
		clearSelection()
	}
}

// Aggiungi il listener quando il componente viene montato
onMounted(() => {
	document.addEventListener("click", handleGlobalClick)
})

// Rimuovi il listener quando il componente viene smontato
onUnmounted(() => {
	document.removeEventListener("click", handleGlobalClick)
})

// Fetch data
const { data: matriceData } = await useFetch("/api/matrice-iscrizioni")
const { data: discipline } = await useFetch("/api/discipline")
const { data: categorie } = await useFetch("/api/categorie")

const disciplineToShow = computed(() => {
	if (selectedDisciplina.value) {
		return [selectedDisciplina.value]
	}
	return [...new Set(matriceData.value.map((item) => item.id_disciplina))]
})

const sessiToShow = computed(() => {
	if (selectedSesso.value) {
		return [selectedSesso.value]
	}
	return [...new Set(matriceData.value.map((item) => item.sesso))]
		.map((sesso) => {
			return sesso === "M"
				? "MASCHILE"
				: sesso === "F"
				? "FEMMINILE"
				: sesso === "MIXED"
				? "MISTO"
				: sesso
		})
		.sort((a, b) => {
			const order = { MASCHILE: 1, FEMMINILE: 2, MISTO: 3 }
			return order[a] - order[b]
		})
})

const getFasceForDisciplina = (disciplina) => {
	const items = matriceData.value.filter(
		(item) => item.id_disciplina === disciplina
	)

	// Ottiene una mappa delle fasce con i loro anni di nascita max
	const fasceAnni = items.reduce((map, item) => {
		if (!map.has(item.fascia)) {
			const annoNascita =
				matriceData.value.find(
					(d) =>
						d.id_disciplina === disciplina &&
						d.fascia === item.fascia
				)?.anno_nascita_max || 0
			map.set(item.fascia, annoNascita)
		}
		return map
	}, new Map())

	// Converti in array e ordina per anno di nascita decrescente
	return [...new Set(items.map((item) => item.fascia))].sort((a, b) => {
		const annoA = fasceAnni.get(a) || 0
		const annoB = fasceAnni.get(b) || 0
		return annoB - annoA // Ordine decrescente
	})
}

const getCintureForDisciplinaAndSesso = (disciplina, sesso) => {
	const sessoCode =
		sesso === "MASCHILE" ? "M" : sesso === "FEMMINILE" ? "F" : "MIXED"
	return [
		...new Set(
			matriceData.value
				.filter(
					(item) =>
						item.id_disciplina === disciplina &&
						item.sesso === sessoCode
				)
				.sort((a, b) => b.max_kyu - a.max_kyu) // Invertito l'ordine del sort
				.map((item) => item.cinture)
		),
	]
}

const getNumeroIscrittiPerCinture = (cinture, fascia, disciplina, sesso) => {
	const sessoCode =
		sesso === "MASCHILE" ? "M" : sesso === "FEMMINILE" ? "F" : "MIXED"
	const items = matriceData.value.filter(
		(item) =>
			item.id_disciplina === disciplina &&
			item.sesso === sessoCode &&
			item.cinture === cinture &&
			item.fascia === fascia
	)
	return items.reduce((sum, item) => sum + (item.numero_iscritti || 0), 0)
}

const getNumeroOrdine = (cinture, fascia, disciplina, sesso) => {
	const sessoCode =
		sesso === "MASCHILE" ? "M" : sesso === "FEMMINILE" ? "F" : "MIXED"
	const item = matriceData.value.find(
		(item) =>
			item.id_disciplina === disciplina &&
			item.sesso === sessoCode &&
			item.cinture === cinture &&
			item.fascia === fascia
	)
	return item?.n_ordine || ""
}

const getAccorpamentoNumber = (cinture, fascia, disciplina, sesso) => {
	const sessoCode =
		sesso === "MASCHILE" ? "M" : sesso === "FEMMINILE" ? "F" : "MIXED"
	const item = matriceData.value.find(
		(item) =>
			item.id_disciplina === disciplina &&
			item.sesso === sessoCode &&
			item.cinture === cinture &&
			item.fascia === fascia
	)
	return item?.n_accorpamento || ""
}

const getAccorpamentoColor = (cinture, fascia, disciplina, sesso) => {
	const sessoCode =
		sesso === "MASCHILE" ? "M" : sesso === "FEMMINILE" ? "F" : "MIXED"
	const item = matriceData.value.find(
		(item) =>
			item.id_disciplina === disciplina &&
			item.sesso === sessoCode &&
			item.cinture === cinture &&
			item.fascia === fascia
	)
	return item?.colore || ""
}

const darkenColor = (color) => {
	const colors = {
		"bg-blue-100": "bg-blue-200",
		"bg-green-100": "bg-green-200",
		"bg-purple-100": "bg-purple-200",
		"bg-pink-100": "bg-pink-200",
		"bg-indigo-100": "bg-indigo-200",
		"bg-yellow-100": "bg-yellow-200",
		"bg-red-100": "bg-red-200",
		"bg-orange-100": "bg-orange-200", // Aggiunto il colore arancione
		"bg-teal-100": "bg-teal-200", // Aggiunto il colore teal
		"bg-lime-100": "bg-lime-200", // Aggiunto il colore lime
	}
	return colors[color] || color
}

// Modifica la funzione getCellStyle per gestire gli accorpamenti
const getCellStyle = (cinture, fascia, disciplina, sesso) => {
	const sessoCode =
		sesso === "MASCHILE" ? "M" : sesso === "FEMMINILE" ? "F" : "MIXED"
	const item = matriceData.value?.find(
		(item) =>
			item.id_disciplina === disciplina &&
			item.sesso === sessoCode &&
			item.cinture === cinture &&
			item.fascia === fascia
	)

	const isInHoveredGroup =
		hoveredAccorpamento.value &&
		item?.n_accorpamento === hoveredAccorpamento.value

	const baseClasses = []

	if (item?.n_accorpamento) {
		const color = item.colore
		if (isInHoveredGroup) {
			baseClasses.push(darkenColor(color))
		} else {
			baseClasses.push(
				selectedCells.value.has(item.id_categoria)
					? darkenColor(color)
					: color
			)
		}
	} else {
		if (selectedCells.value.has(item?.id_categoria)) {
			baseClasses.push("bg-yellow-200")
		} else {
			baseClasses.push("bg-white hover:bg-gray-100") // Rimossa la classe hover:shadow-darker
		}
	}

	return baseClasses.join(" ")
}

const handleCellHover = (cinture, fascia, disciplina, sesso, isEnter) => {
	const sessoCode =
		sesso === "MASCHILE" ? "M" : sesso === "FEMMINILE" ? "F" : "MIXED"
	const item = matriceData.value?.find(
		(item) =>
			item.id_disciplina === disciplina &&
			item.sesso === sessoCode &&
			item.cinture === cinture &&
			item.fascia === fascia
	)

	// Se la cella fa parte di un accorpamento, impostiamo l'hover per tutto il gruppo
	if (item?.n_accorpamento) {
		hoveredAccorpamento.value = isEnter ? item.n_accorpamento : null
	}
}

// Add this new function after your other computed properties
const generateAccorpamentoName = () => {
	const selectedCategoriesInfo = Array.from(selectedCells.value).map(
		(categoriaId) => {
			const categoria = matriceData.value.find(
				(item) => item.id_categoria === categoriaId
			)
			return {
				disciplina: categoria.id_disciplina,
				sesso:
					categoria.sesso === "M"
						? "MASCHILE"
						: categoria.sesso === "F"
						? "FEMMINILE"
						: "MISTO",
				cinture: categoria.cinture,
				fascia: categoria.fascia,
				max_kyu: categoria.max_kyu, // Aggiungi max_kyu per ordinare le cinture
			}
		}
	)

	// Raggruppa proprietà comuni mantenendo l'ordine
	const disciplina = selectedCategoriesInfo[0].disciplina
	const sesso = selectedCategoriesInfo[0].sesso

	// Verifica se sono tutti uguali
	const isCommonDisciplina = selectedCategoriesInfo.every(
		(c) => c.disciplina === disciplina
	)
	const isCommonSesso = selectedCategoriesInfo.every((c) => c.sesso === sesso)

	// Ordina le cinture per max_kyu decrescente e rimuovi i duplicati
	const cinture = [
		...new Set(
			selectedCategoriesInfo
				.sort((a, b) => b.max_kyu - a.max_kyu)
				.map((c) => c.cinture)
		),
	]

	// Ordina le fasce mantenendo l'ordine originale numerico
	const fasce = [
		...new Set(selectedCategoriesInfo.map((c) => c.fascia)),
	].sort((a, b) => {
		const numA = parseInt(a.replace(/\D/g, ""))
		const numB = parseInt(b.replace(/\D/g, ""))
		return numA - numB
	})

	// Costruisci il nome
	const parts = []
	if (isCommonDisciplina) parts.push(disciplina)
	if (isCommonSesso) parts.push(sesso)

	// Aggiungi range cinture
	if (cinture.length === 1) {
		parts.push(cinture[0])
	} else if (cinture.length > 1) {
		parts.push(`${cinture[0]}-${cinture[cinture.length - 1]}`)
	}

	// Aggiungi range fasce - CORRETTO QUI
	if (fasce.length === 1) {
		parts.push(fasce[0]) // Corretto da fascia[0] a fasce[0]
	} else if (fasce.length > 1) {
		parts.push(`${fasce[0]}-${fasce[fasce.length - 1]}`)
	}

	// Aggiungi il suffisso " - ACC." al nome generato
	return parts.join(" ") + " - ACC."
}

const showAccorpamentoDialog = () => {
	nomeAccorpamento.value = generateAccorpamentoName()
	showDialog.value = true
}

const closeDialog = () => {
	showDialog.value = false
	nomeAccorpamento.value = ""
}

const confermaAccorpamento = async () => {
	if (!nomeAccorpamento.value) {
		alert("Inserire un nome per la categoria accorpata")
		return
	}

	const categorieArray = Array.from(selectedCells.value)
	if (!categorieArray.length) {
		alert("Seleziona almeno una categoria da accorpare")
		return
	}

	try {
		const response = await fetch("/api/accorpa-categorie", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				categorie: categorieArray,
				nome: nomeAccorpamento.value, // Questo è il nome che verrà salvato nel DB
			}),
		})

		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.message || "Errore durante l'accorpamento")
		}

		// Reload data
		matriceData.value = await $fetch("/api/matrice-iscrizioni")
		selectedCells.value = new Set()
		closeDialog()
	} catch (error) {
		console.error("Errore:", error)
		alert(error.message || "Errore durante l'accorpamento")
	}
}

// Modifica computed property per verificare se c'è un accorpamento selezionato
const hasSelectedAccorpamento = computed(() => {
	if (selectedCells.value.size === 0) return false

	// Verifica se almeno una delle celle selezionate fa parte di un accorpamento
	return Array.from(selectedCells.value).some((categoriaId) => {
		const categoria = matriceData.value.find(
			(item) => item.id_categoria === categoriaId
		)
		return categoria?.n_accorpamento != null
	})
})

// Aggiungi funzione per eliminare l'accorpamento
const eliminaAccorpamento = async () => {
	if (!hasSelectedAccorpamento.value) return

	// Troviamo tutti gli accorpamenti unici dalle celle selezionate
	const accorpamentiDaEliminare = new Set(
		Array.from(selectedCells.value)
			.map((categoriaId) => {
				const categoria = matriceData.value.find(
					(item) => item.id_categoria === categoriaId
				)
				return categoria?.n_accorpamento
			})
			.filter((n_accorpamento) => n_accorpamento != null)
	)

	try {
		// Eliminiamo ogni accorpamento
		for (const n_accorpamento of accorpamentiDaEliminare) {
			const response = await fetch("/api/elimina-accorpamento", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ n_accorpamento }),
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(
					error.message || "Errore durante l'eliminazione"
				)
			}
		}

		// Reload data
		matriceData.value = await $fetch("/api/matrice-iscrizioni")
		selectedCells.value = new Set()
	} catch (error) {
		console.error("Errore:", error)
		alert(error.message || "Errore durante l'eliminazione")
	}
}

const showPoolDialog = () => {
	showPoolDialogVisible.value = true
}

const closePoolDialog = () => {
	showPoolDialogVisible.value = false
	numPools.value = 2
}

const confermaDivisionePool = async () => {
	if (!numPools.value || numPools.value < 2) {
		alert("Inserire un numero valido di pool (minimo 2)")
		return
	}

	const categoriaId = Array.from(selectedCells.value)[0]

	try {
		const response = await fetch("/api/dividi-pool", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id_categoria: categoriaId,
				num_pools: numPools.value,
			}),
		})

		if (!response.ok) {
			const error = await response.json()
			throw new Error(
				error.message || "Errore durante la divisione in pool"
			)
		}

		// Reload data
		matriceData.value = await $fetch("/api/matrice-iscrizioni")
		selectedCells.value = new Set()
		closePoolDialog()
	} catch (error) {
		console.error("Errore:", error)
		alert(error.message || "Errore durante la divisione in pool")
	}
}

// Add this new function to get number of pools
const getNumPools = (cinture, fascia, disciplina, sesso) => {
	const sessoCode =
		sesso === "MASCHILE" ? "M" : sesso === "FEMMINILE" ? "F" : "MIXED"
	const item = matriceData.value?.find(
		(item) =>
			item.id_disciplina === disciplina &&
			item.sesso === sessoCode &&
			item.cinture === cinture &&
			item.fascia === fascia
	)
	return item?.num_pools || null
}

// Aggiungi computed property per verificare se ci sono pool selezionate
const hasSelectedPools = computed(() => {
	return Array.from(selectedCells.value).some((categoriaId) => {
		const categoria = matriceData.value.find(
			(item) => item.id_categoria === categoriaId
		)
		return categoria?.num_pools > 0
	})
})

// Aggiungi funzione per eliminare le pool
const eliminaPools = async () => {
	if (!hasSelectedPools.value) return

	try {
		// Trova tutte le categorie selezionate che hanno pool
		const categorieConPool = Array.from(selectedCells.value).filter(
			(categoriaId) => {
				const categoria = matriceData.value.find(
					(item) => item.id_categoria === categoriaId
				)
				return categoria?.num_pools > 0
			}
		)

		// Elimina le pool per ogni categoria
		for (const categoriaId of categorieConPool) {
			const response = await fetch("/api/dividi-pool", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id_categoria: categoriaId,
					num_pools: 0, // 0 indica di rimuovere le pool
				}),
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(
					error.message || "Errore durante l'eliminazione delle pool"
				)
			}
		}

		// Reload data
		matriceData.value = await $fetch("/api/matrice-iscrizioni")
		selectedCells.value = new Set()
	} catch (error) {
		console.error("Errore:", error)
		alert(error.message || "Errore durante l'eliminazione delle pool")
	}
}

// ...existing code...
</script>

<style scoped>
table {
	border-spacing: 0;
	border: 1px solid #e2e8f0;
}

th,
td {
	border: 1px solid #e2e8f0;
}

.hover\:bg-gray-50:hover {
	background-color: #f9fafb;
}

td:not(:first-child) {
	min-width: 7rem; /* Raddoppiato da 3.5rem */
	max-width: 7rem; /* Raddoppiato da 3.5rem */
	height: 7rem; /* Raddoppiato da 3.5rem (implicito) */
}

th:not(:first-child) {
	min-width: 7rem; /* Aggiunto per mantenere l'allineamento con le celle */
	max-width: 7rem; /* Aggiunto per mantenere l'allineamento con le celle */
}

td:first-child {
	padding: 1rem; /* Aumentato il padding */
	min-width: 10rem; /* Aumentata la larghezza della prima colonna */
}

.flex {
	display: flex;
}

.flex-col {
	flex-direction: column;
}

.items-center {
	align-items: center;
}

/* Aggiungi questi stili */
.flex-wrap {
	display: flex;
	flex-wrap: wrap;
}

.justify-evenly {
	justify-content: space-evenly;
}

/* Rimuovi .gap-8 dato che stiamo usando space-evenly */
.text-blue-500 {
	color: #3b82f6;
}

.text-pink-500 {
	color: #ec4899;
}

.border-blue-500 {
	border-color: #3b82f6;
}

.relative {
	position: relative;
}

.absolute {
	position: absolute;
}

.text-xs {
	font-size: 0.75rem;
	line-height: 1rem;
}

.rounded-br {
	border-bottom-right-radius: 0.25rem;
}

.cursor-pointer {
	cursor: pointer;
}

.bg-red-500 {
	background-color: #ef4444;
}

.bg-blue-200 {
	background-color: #bfdbfe;
}

.bg-green-200 {
	background-color: #bbf7d0;
}

.bg-purple-200 {
	background-color: #e9d5ff;
}

.bg-pink-200 {
	background-color: #fbcfe8;
}

.bg-indigo-200 {
	background-color: #c7d2fe;
}

.bg-yellow-200 {
	background-color: #fef08a;
}

.bg-orange-100 {
	background-color: #ffedd5;
}

.bg-orange-200 {
	background-color: #fed7aa;
}

.bg-teal-100 {
	background-color: #ccfbf1;
}

.bg-teal-200 {
	background-color: #99f6e4;
}

.bg-lime-100 {
	background-color: #ecfccb;
}

.bg-lime-200 {
	background-color: #d9f99d;
}

/* Aggiungi effetto hover sulle celle */
.hover\:shadow-inner:hover {
	box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.1);
}

/* Aggiungi questo nuovo stile per l'ombreggiatura più scura */
/* .hover\:shadow-darker:hover {
	box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.2); 
	transition: all 0.2s ease-in-out;
} */
</style>
