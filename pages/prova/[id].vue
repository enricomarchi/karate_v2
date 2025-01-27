<template>
	<div class="bg-gray-100 min-h-screen">
		<div class="bg-white shadow">
			<div class="px-8 py-4">
				<!-- Bottone Indietro -->
				<div class="mb-4">
					<button
						@click="tornaAlTabellone"
						class="flex items-center text-gray-600 hover:text-gray-800"
					>
						<i class="fas fa-arrow-left mr-2"></i>
						Torna al Tabellone
					</button>
				</div>

				<!-- Header modificato -->
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-6">
						<!-- Numero tabellone in cerchio -->
						<div class="flex-shrink-0">
							<div
								class="px-4 h-16 rounded-full border-4 border-blue-500 flex items-center justify-center bg-white"
							>
								<span class="text-2xl font-bold text-blue-500">
									{{ prova?.codice_tabellone }}
								</span>
							</div>
						</div>
						<!-- Info prova -->
						<div>
							<div class="text-2xl text-gray-700 font-medium">
								{{
									prova?.nome_tabellone ||
									"Categoria non disponibile"
								}}
							</div>
							<div class="text-xl font-medium mt-1">
								Prova {{ prova?.numero_prova }} ({{
									prova?.disciplina
								}})
							</div>
							<!-- Orari -->
							<div
								v-if="
									prova?.ora_inizio_effettiva ||
									prova?.ora_fine_effettiva
								"
								class="text-sm text-gray-500 mt-2 flex gap-4"
							>
								<span v-if="prova.ora_inizio_effettiva">
									Inizio:
									{{
										formatDateTime(
											prova.ora_inizio_effettiva
										)
									}}
								</span>
								<span v-if="prova.ora_fine_effettiva">
									Fine:
									{{
										formatDateTime(prova.ora_fine_effettiva)
									}}
									<span class="ml-4">
										Durata:
										{{
											calcolaDurata(
												prova.ora_inizio_effettiva,
												prova.ora_fine_effettiva
											)
										}}
									</span>
								</span>
							</div>
						</div>
					</div>
					<!-- Controlli (solo bottoni, rimosso tatami) -->
					<div class="flex gap-4">
						<button
							@click="avviaProva"
							v-if="
								prova?.stato === 'DA_INIZIARE' &&
								prova?.tabellone_stato === 'ATTIVO'
							"
							class="bg-green-500 text-white px-4 py-2 rounded"
						>
							Avvia Prova
						</button>
						<button
							@click="completaProva"
							v-if="prova?.stato === 'IN_CORSO'"
							class="bg-blue-500 text-white px-4 py-2 rounded"
						>
							Completa Prova
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Main content -->
		<div class="px-8 py-6">
			<!-- Tabs per ELIM_DIR_REC -->
			<div
				v-if="prova?.template_tabellone === 'ELIM_DIR_REC'"
				class="mb-6"
			>
				<div class="border-b border-gray-200">
					<nav class="-mb-px flex space-x-8">
						<!-- Tab Vista Complessiva -->
						<a
							href="#"
							@click.prevent="selectedTab = 'complessiva'"
							:class="[
								selectedTab === 'complessiva'
									? 'border-blue-500 text-blue-600'
									: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
								'whitespace-nowrap pb-4 px-1 border-b-2 font-medium',
							]"
						>
							Vista Complessiva
						</a>
						<!-- Tab per ogni fase -->
						<a
							v-for="fase in fasiFiltrate"
							:key="`fase-${fase}`"
							href="#"
							@click.prevent="selectedTab = fase"
							:class="[
								selectedTab === fase
									? 'border-blue-500 text-blue-600'
									: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
								'whitespace-nowrap pb-4 px-1 border-b-2 font-medium',
							]"
						>
							{{ traduciFase(fase) }}
						</a>
					</nav>
				</div>

				<!-- Contenuto delle schede -->
				<div>
					<!-- Vista Complessiva -->
					<div
						v-if="selectedTab === 'complessiva'"
						class="overflow-x-auto"
					>
						<div class="bracket-container">
							<template
								v-for="(_, index) in tutteFasi"
								:key="'conn-' + index"
							>
								<div v-if="index > 0" class="connection-column">
									<!-- Spazio per le connessioni -->
								</div>

								<div class="phase-column">
									<div class="text-center font-semibold mb-8">
										{{ tutteFasi[index].nome }}
									</div>
									<template
										v-for="incontro in getIncontriFase(
											tutteFasi[index].id
										)"
										:key="incontro.id_incontro"
									>
										<!-- Spazio prima -->
										<template
											v-for="_ in index === 0
												? 0
												: Math.pow(2, index) - 1"
											:key="'space-before-' + _"
										>
											<div class="match-box-space"></div>
										</template>
										<!-- Box Atleta Rosso -->
										<div class="match-box">
											<div class="flex items-center">
												<!-- Riquadro colore -->
												<div
													class="color-box"
													:class="{
														'bg-red-50': true,
														'bg-gray-50': false,
													}"
												>
													<span
														:class="{
															'text-red-600': true,
															'text-gray-600': false,
														}"
													>
														R
													</span>
												</div>
												<!-- Info atleta -->
												<div
													class="athlete-info"
													v-if="
														incontro.id_atleta_rosso &&
														!(
															isFirstPhase(
																incontro.fase
															) &&
															!incontro.id_atleta_bianco
														)
													"
												>
													<div
														class="athlete-name"
														:class="{
															'text-red-600': true,
															'text-gray-600': false,
														}"
													>
														{{
															incontro.cognome_rosso
														}}
														{{
															incontro.nome_rosso
														}}
													</div>
													<div
														class="athlete-society"
													>
														{{
															incontro.societa_rosso
														}}
													</div>
												</div>
												<div
													v-else
													class="athlete-info text-gray-400"
												></div>
											</div>
										</div>
										<!-- Spazio fra i due atleti -->
										<template
											v-for="_ in Math.pow(2, index + 1) -
											1"
											:key="'space-middle-' + _"
										>
											<div class="match-box-space"></div>
										</template>
										<!-- Box Atleta Bianco -->
										<div class="match-box">
											<div class="flex items-center">
												<!-- Riquadro colore -->
												<div
													class="color-box"
													:class="{
														'bg-red-50': false,
														'bg-gray-50': true,
													}"
												>
													<span
														:class="{
															'text-red-600': false,
															'text-gray-600': true,
														}"
													>
														B
													</span>
												</div>
												<!-- Info atleta -->
												<div
													class="athlete-info"
													v-if="
														incontro.id_atleta_bianco &&
														!(
															isFirstPhase(
																incontro.fase
															) &&
															!incontro.id_atleta_bianco
														)
													"
												>
													<div
														class="athlete-name"
														:class="{
															'text-red-600': false,
															'text-gray-600': true,
														}"
													>
														{{
															incontro.cognome_bianco
														}}
														{{
															incontro.nome_bianco
														}}
													</div>
													<div
														class="athlete-society"
													>
														{{
															incontro.societa_bianco
														}}
													</div>
												</div>
												<div
													v-else
													class="athlete-info text-gray-400"
												></div>
											</div>
										</div>
										<!-- Spazio dopo -->
										<template
											v-for="_ in Math.pow(2, index)"
											:key="'space-after-' + _"
										>
											<div class="match-box-space"></div>
										</template>
									</template>
								</div>
							</template>
						</div>
					</div>

					<!-- Vista per fase singola -->
					<div v-else>
						<!-- Riutilizzo della vista tabella esistente -->
						<div class="bg-white rounded-lg shadow p-6">
							<h2 class="text-xl font-semibold mb-4">
								{{ traduciFase(selectedTab) }}
							</h2>
							<table class="min-w-full divide-y divide-gray-200">
								<thead class="bg-gray-50">
									<tr>
										<th
											class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											N°
										</th>
										<th
											class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Atleti
										</th>
										<th
											v-for="(
												i, _index
											) in prova?.numero_arbitri || 0"
											:key="`arbitro-${i}`"
											class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Arbitro {{ i }}
										</th>
										<th
											class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Totale
										</th>
										<th
											class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Azioni
										</th>
									</tr>
								</thead>
								<tbody
									class="bg-white divide-y divide-gray-200"
								>
									<template
										v-for="(
											incontro, index
										) in incontriPerFase"
										:key="`incontro-${incontro.id_incontro}`"
									>
										<!-- First row for red athlete -->
										<tr
											:class="[
												'group h-16',
												index % 2 === 0
													? 'bg-white'
													: 'bg-gray-100',
											]"
										>
											<td
												class="px-6 py-4 whitespace-nowrap text-sm"
												:rowspan="2"
											>
												{{ incontro.ordine }}
											</td>
											<td class="px-6 py-2">
												<div
													class="flex items-center h-12"
												>
													<div class="flex gap-2">
														<div
															class="border rounded px-2 text-sm text-gray-600 w-12 text-center"
														>
															<span
																class="font-bold"
																>{{
																	incontro.id_atleta_rosso ||
																	""
																}}</span
															>
														</div>
														<div
															class="border rounded px-2 text-sm"
														>
															<span
																class="font-bold text-red-600"
																>R</span
															>
														</div>
													</div>
													<div class="ml-4">
														<template
															v-if="
																!(
																	isFirstPhase(
																		incontro.fase
																	) &&
																	!incontro.id_atleta_bianco
																)
															"
														>
															<div
																class="text-sm font-medium"
																:class="{
																	'text-red-600': true,
																}"
															>
																{{
																	true
																		? `${
																				incontro.cognome_rosso ||
																				""
																		  } ${
																				incontro.nome_rosso ||
																				""
																		  }`
																		: `${
																				incontro.cognome_bianco ||
																				""
																		  } ${
																				incontro.nome_bianco ||
																				""
																		  }`
																}}
															</div>
															<div
																class="text-xs text-gray-500"
															>
																{{
																	true
																		? incontro.societa_rosso
																		: incontro.societa_bianco
																}}
															</div>
														</template>
													</div>
												</div>
											</td>
											<!-- Arbitri per Rosso - Modificato per gestire il caso singolo -->
											<td
												v-for="(
													i, _index
												) in prova?.numero_arbitri || 0"
												:key="`arbitro-${i}`"
												class="px-6 py-2 text-center"
											>
												<div
													class="flex justify-center"
												>
													<template
														v-if="
															prova.stato ===
																'IN_CORSO' &&
															incontro.id_atleta_rosso
														"
													>
														<button
															@click="
																assegnaVoto(
																	incontro.id_incontro,
																	i,
																	'ROSSO'
																)
															"
															:class="{
																'bg-red-500':
																	getVotoArbitro(
																		incontro,
																		i
																	) ===
																	'ROSSO',
															}"
															class="w-8 h-8 rounded-full border-2 border-red-500 hover:bg-red-500"
														></button>
													</template>
													<template
														v-else-if="
															isIncontroCompletato(
																incontro
															)
														"
													>
														<div
															class="w-8 h-8 rounded-full border-2"
															:class="{
																'bg-red-500 border-red-500':
																	getVotoArbitro(
																		incontro,
																		i
																	) ===
																	'ROSSO',
															}"
														></div>
													</template>
												</div>
											</td>
											<td
												class="px-6 py-2 text-center"
												:rowspan="2"
											>
												<div
													class="flex flex-col justify-center h-full"
												>
													<div
														class="text-red-600 font-bold"
													>
														{{
															contaPunti(
																incontro,
																"ROSSO"
															)
														}}
													</div>
													<div
														class="text-gray-700 font-bold"
													>
														{{
															contaPunti(
																incontro,
																"BIANCO"
															)
														}}
													</div>
												</div>
											</td>
											<td
												class="px-6 py-2 text-right"
												:rowspan="2"
											>
												<div
													class="flex justify-end gap-2"
												>
													<button
														v-if="
															prova.stato ===
																'IN_CORSO' &&
															incontro.id_atleta_bianco
														"
														@click="
															resetIncontro(
																incontro.id_incontro
															)
														"
														class="text-red-500 hover:text-red-700"
														title="Reset"
													>
														<i
															class="fas fa-undo"
														></i>
													</button>
												</div>
											</td>
										</tr>
										<!-- Seconda riga (atleta bianco) solo se presente -->
										<tr
											:class="[
												'group h-16',
												index % 2 === 0
													? 'bg-white'
													: 'bg-gray-100',
											]"
										>
											<td class="px-6 py-2">
												<div
													class="flex items-center h-12"
												>
													<div class="flex gap-2">
														<div
															class="border rounded px-2 text-sm text-gray-600 w-12 text-center"
														>
															<span
																class="font-bold"
																>{{
																	incontro.id_atleta_bianco ||
																	""
																}}</span
															>
														</div>
														<div
															class="border rounded px-2 text-sm"
														>
															<span
																class="font-bold text-gray-700"
																>B</span
															>
														</div>
													</div>
													<div class="ml-4">
														<template
															v-if="
																!(
																	isFirstPhase(
																		incontro.fase
																	) &&
																	!incontro.id_atleta_bianco
																)
															"
														>
															<div
																class="text-sm font-medium"
																:class="{
																	'text-red-600': false,
																}"
															>
																{{
																	false
																		? `${
																				incontro.cognome_rosso ||
																				""
																		  } ${
																				incontro.nome_rosso ||
																				""
																		  }`
																		: `${
																				incontro.cognome_bianco ||
																				""
																		  } ${
																				incontro.nome_bianco ||
																				""
																		  }`
																}}
															</div>
															<div
																class="text-xs text-gray-500"
															>
																{{
																	false
																		? incontro.societa_rosso
																		: incontro.societa_bianco
																}}
															</div>
														</template>
													</div>
												</div>
											</td>
											<!-- Modifica qui: rimuovi il v-if che controlla isIncontroCompletato -->
											<td
												v-for="(
													i, _index
												) in prova?.numero_arbitri || 0"
												:key="`arbitro-${i}`"
												class="px-6 py-2 text-center border-t-0"
											>
												<div
													class="flex justify-center"
												>
													<template
														v-if="
															prova.stato ===
																'IN_CORSO' &&
															incontro.id_atleta_bianco
														"
													>
														<button
															@click="
																assegnaVoto(
																	incontro.id_incontro,
																	i,
																	'BIANCO'
																)
															"
															:class="{
																'bg-gray-400':
																	getVotoArbitro(
																		incontro,
																		i
																	) ===
																	'BIANCO',
															}"
															class="w-8 h-8 rounded-full border-2 border-gray-400 hover:bg-gray-400"
														></button>
													</template>
													<template
														v-else-if="
															isIncontroCompletato(
																incontro
															)
														"
													>
														<div
															class="w-8 h-8 rounded-full border-2"
															:class="{
																'bg-gray-400 border-gray-400':
																	getVotoArbitro(
																		incontro,
																		i
																	) ===
																	'BIANCO',
															}"
														></div>
													</template>
												</div>
											</td>
										</tr>
									</template>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>

			<!-- Vista normale per altre tipologie di prove -->
			<div v-else>
				<!-- Sezione risultati -->
				<div
					v-if="prova?.tipo_tabellone === 'punteggio'"
					class="bg-white rounded-lg shadow p-6"
				>
					<h2 class="text-xl font-semibold mb-4">Risultati</h2>
					<div class="overflow-x-auto">
						<table class="min-w-full divide-y divide-gray-200">
							<thead class="bg-gray-50">
								<tr>
									<th
										class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Atleta
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Società
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Punteggio
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Note
									</th>
									<th
										class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Azioni
									</th>
								</tr>
							</thead>
							<tbody class="bg-white divide-y divide-gray-200">
								<tr
									v-for="atleta in atleti"
									:key="`atleta-${atleta.id_atleta}`"
								>
									<td class="px-6 py-4 whitespace-nowrap">
										{{ atleta.cognome }} {{ atleta.nome }}
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										{{ atleta.nome_societa }}
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<input
											v-if="prova.stato === 'IN_CORSO'"
											v-model="atleta.punteggio"
											type="number"
											step="0.1"
											class="border rounded px-2 py-1 w-24"
											@change="salvaRisultato(atleta)"
										/>
										<span v-else>{{
											atleta.punteggio || "-"
										}}</span>
									</td>
									<td class="px-6 py-4">
										<input
											v-if="prova.stato === 'IN_CORSO'"
											v-model="atleta.note"
											type="text"
											class="border rounded px-2 py-1 w-full"
											@change="salvaRisultato(atleta)"
										/>
										<span v-else>{{
											atleta.note || "-"
										}}</span>
									</td>
									<td class="px-6 py-4 text-right">
										<button
											v-if="prova.stato === 'IN_CORSO'"
											@click="resetRisultato(atleta)"
											class="text-red-500 hover:text-red-700"
										>
											<i class="fas fa-undo"></i>
										</button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				<!-- Sezione incontri (per prove a bandierine) -->
				<div
					v-if="prova?.tipo_tabellone === 'bandierine'"
					class="bg-white rounded-lg shadow p-6"
				>
					<!-- Template KUMITE_BASE e ELIM_DIR_REC -->
					<div
						v-if="
							prova.template_tabellone === 'KUMITE_BASE' ||
							prova.template_tabellone === 'ELIM_DIR_REC'
						"
						class="overflow-x-auto"
					>
						<table class="min-w-full divide-y divide-gray-200">
							<thead class="bg-gray-50">
								<tr>
									<th
										class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										N°
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Atleti
									</th>
									<th
										class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
										v-for="(
											i, _index
										) in prova?.numero_arbitri || 0"
										:key="`arbitro-${i}`"
									>
										Arbitro {{ i }}
									</th>
									<th
										class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Totale
									</th>
									<th
										class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Azioni
									</th>
								</tr>
							</thead>
							<tbody class="bg-white divide-y divide-gray-200">
								<template
									v-for="(incontro, index) in incontriPerFase"
									:key="`incontro-${incontro.id_incontro}`"
								>
									<!-- First row for red athlete -->
									<tr
										:class="[
											'group h-16',
											index % 2 === 0
												? 'bg-white'
												: 'bg-gray-100',
										]"
									>
										<td
											class="px-6 py-4 whitespace-nowrap text-sm"
											:rowspan="2"
										>
											{{ incontro.ordine }}
										</td>
										<td class="px-6 py-2">
											<div class="flex items-center h-12">
												<div class="flex gap-2">
													<div
														class="border rounded px-2 text-sm text-gray-600 w-12 text-center"
													>
														<span
															class="font-bold"
															>{{
																incontro.id_atleta_rosso ||
																""
															}}</span
														>
													</div>
													<div
														class="border rounded px-2 text-sm"
													>
														<span
															class="font-bold text-red-600"
															>R</span
														>
													</div>
												</div>
												<div class="ml-4">
													<template
														v-if="
															!(
																isFirstPhase(
																	incontro.fase
																) &&
																!incontro.id_atleta_bianco &&
																prova?.template_tabellone !==
																	'KUMITE_BASE' &&
																true
															)
														"
													>
														<div
															class="text-sm font-medium"
															:class="{
																'text-red-600': true,
															}"
														>
															{{
																true
																	? `${
																			incontro.cognome_rosso ||
																			""
																	  } ${
																			incontro.nome_rosso ||
																			""
																	  }`
																	: `${
																			incontro.cognome_bianco ||
																			""
																	  } ${
																			incontro.nome_bianco ||
																			""
																	  }`
															}}
														</div>
														<div
															class="text-xs text-gray-500"
														>
															{{
																true
																	? incontro.societa_rosso
																	: incontro.societa_bianco
															}}
														</div>
													</template>
												</div>
											</div>
										</td>

										<!-- Arbitri per Rosso - Modificato per gestire il caso singolo -->
										<td
											v-for="(
												i, _index
											) in prova?.numero_arbitri || 0"
											:key="`arbitro-${i}`"
											class="px-6 py-2 text-center"
										>
											<div class="flex justify-center">
												<template
													v-if="
														prova.stato ===
															'IN_CORSO' &&
														incontro.id_atleta_rosso
													"
												>
													<button
														@click="
															assegnaVoto(
																incontro.id_incontro,
																i,
																'ROSSO'
															)
														"
														:class="{
															'bg-red-500':
																getVotoArbitro(
																	incontro,
																	i
																) === 'ROSSO',
														}"
														class="w-8 h-8 rounded-full border-2 border-red-500 hover:bg-red-500"
													></button>
												</template>
												<template
													v-else-if="
														isIncontroCompletato(
															incontro
														)
													"
												>
													<div
														class="w-8 h-8 rounded-full border-2"
														:class="{
															'bg-red-500 border-red-500':
																getVotoArbitro(
																	incontro,
																	i
																) === 'ROSSO',
														}"
													></div>
												</template>
											</div>
										</td>
										<td
											class="px-6 py-2 text-center"
											:rowspan="2"
										>
											<div
												class="flex flex-col justify-center h-full"
											>
												<div
													class="text-red-600 font-bold"
												>
													{{
														contaPunti(
															incontro,
															"ROSSO"
														)
													}}
												</div>
												<div
													class="text-gray-700 font-bold"
												>
													{{
														contaPunti(
															incontro,
															"BIANCO"
														)
													}}
												</div>
											</div>
										</td>
										<td
											class="px-6 py-2 text-right"
											:rowspan="2"
										>
											<div class="flex justify-end gap-2">
												<button
													v-if="
														prova.stato ===
															'IN_CORSO' &&
														incontro.id_atleta_bianco
													"
													@click="
														resetIncontro(
															incontro.id_incontro
														)
													"
													class="text-red-500 hover:text-red-700"
													title="Reset"
												>
													<i class="fas fa-undo"></i>
												</button>
											</div>
										</td>
									</tr>
									<!-- Seconda riga (atleta bianco) solo se presente -->
									<tr
										:class="[
											'group h-16',
											index % 2 === 0
												? 'bg-white'
												: 'bg-gray-100',
										]"
									>
										<td class="px-6 py-2">
											<div class="flex items-center h-12">
												<div class="flex gap-2">
													<div
														class="border rounded px-2 text-sm text-gray-600 w-12 text-center"
													>
														<span
															class="font-bold"
															>{{
																incontro.id_atleta_bianco ||
																""
															}}</span
														>
													</div>
													<div
														class="border rounded px-2 text-sm"
													>
														<span
															class="font-bold text-gray-700"
															>B</span
														>
													</div>
												</div>
												<div class="ml-4">
													<template
														v-if="
															!(
																isFirstPhase(
																	incontro.fase
																) &&
																!incontro.id_atleta_bianco &&
																prova?.template_tabellone !==
																	'KUMITE_BASE' &&
																false
															)
														"
													>
														<div
															class="text-sm font-medium"
															:class="{
																'text-red-600': false,
															}"
														>
															{{
																false
																	? `${
																			incontro.cognome_rosso ||
																			""
																	  } ${
																			incontro.nome_rosso ||
																			""
																	  }`
																	: `${
																			incontro.cognome_bianco ||
																			""
																	  } ${
																			incontro.nome_bianco ||
																			""
																	  }`
															}}
														</div>
														<div
															class="text-xs text-gray-500"
														>
															{{
																false
																	? incontro.societa_rosso
																	: incontro.societa_bianco
															}}
														</div>
													</template>
												</div>
											</div>
										</td>
										<!-- Modifica qui: rimuovi il v-if che controlla isIncontroCompletato -->
										<td
											v-for="(
												i, _index
											) in prova?.numero_arbitri || 0"
											:key="`arbitro-${i}`"
											class="px-6 py-2 text-center border-t-0"
										>
											<div class="flex justify-center">
												<template
													v-if="
														prova.stato ===
															'IN_CORSO' &&
														incontro.id_atleta_bianco
													"
												>
													<button
														@click="
															assegnaVoto(
																incontro.id_incontro,
																i,
																'BIANCO'
															)
														"
														:class="{
															'bg-gray-400':
																getVotoArbitro(
																	incontro,
																	i
																) === 'BIANCO',
														}"
														class="w-8 h-8 rounded-full border-2 border-gray-400 hover:bg-gray-400"
													></button>
												</template>
												<template
													v-else-if="
														isIncontroCompletato(
															incontro
														)
													"
												>
													<div
														class="w-8 h-8 rounded-full border-2"
														:class="{
															'bg-gray-400 border-gray-400':
																getVotoArbitro(
																	incontro,
																	i
																) === 'BIANCO',
														}"
													></div>
												</template>
											</div>
										</td>
									</tr>
								</template>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import {
	type FaseTorneo, // Manteniamo solo questa importazione
	ordineDellaFase,
	numIncontriPerFase,
} from "../../server/utils/torneoUtils"
import type { Prova, Incontro, IncontroVoto } from "~/types/tabellone"

// Add the interface for Atleta
interface Atleta {
	id_atleta: number
	nome: string
	cognome: string
	nome_societa: string
	punteggio?: number | null // Allow null
	note?: string | null // Allow null
}

// Modifica le definizioni ref con i tipi corretti
const prova = ref<Prova | null>(null)
const atleti = ref<Atleta[]>([])
const incontri = ref<Incontro[]>([])

// Rimuoviamo la definizione locale di FaseTorneo e usiamo il tipo importato
const faseTorneo = ref<FaseTorneo>("FINALE")
const selectedTab = ref<FaseTorneo | "complessiva">("complessiva")

const route = useRoute()
const router = useRouter()

onMounted(async () => {
	await loadData()
	if (incontri.value && incontri.value.length > 0) {
		// Determina la fase iniziale dai dati
		const faseIniziale = fasiFiltrate.value[0]
		if (faseIniziale) {
			faseTorneo.value = faseIniziale
		}
	}
})

// Modifica la logica di loadData per garantire il tipo corretto
async function loadData() {
	try {
		const [provaRes, atletiRes, incontriRes] = await Promise.all([
			fetch(`/api/prove/${route.params.id}`),
			fetch(`/api/prove/${route.params.id}/atleti`),
			fetch(`/api/prove/${route.params.id}/incontri`),
		])

		const provaData = (await provaRes.json()) as ProvaResponse
		const incontriData = await incontriRes.json()

		prova.value = {
			id_prova: provaData.id_prova,
			codice_tabellone: provaData.codice_tabellone,
			nome_accorpamento: provaData.nome_accorpamento,
			nome_categoria: provaData.categorie?.split(" | ")[0],
			nome_tabellone: provaData.nome_tabellone,
			disciplina: provaData.disciplina,
			numero_prova: provaData.numero_prova,
			stato: provaData.stato,
			tabellone_stato: provaData.tabellone_stato,
			ora_inizio_effettiva: provaData.ora_inizio_effettiva,
			ora_fine_effettiva: provaData.ora_fine_effettiva,
			template_tabellone: provaData.template_tabellone,
			tipo_tabellone: provaData.tipo_tabellone,
			numero_arbitri: provaData.numero_arbitri,
			id_tabellone: provaData.id_tabellone,
		}

		atleti.value = await atletiRes.json()
		incontri.value = incontriData

		if (
			prova.value?.template_tabellone === "ELIM_DIR_REC" &&
			incontriData.length > 0
		) {
			const faseDisponibili = [
				...new Set(incontriData.map((i: Incontro) => i.fase)),
			]
			if (
				faseDisponibili.length > 0 &&
				isFaseTorneo(faseDisponibili[0])
			) {
				faseTorneo.value = faseDisponibili[0]
			}
		}
	} catch (error) {
		console.error("Errore nel caricamento dei dati:", error)
	}
}

// Aggiungi questa interfaccia se non esiste già
interface ProvaResponse extends Prova {
	categorie?: string
}

// Aggiungi una type guard per FaseTorneo
function isFaseTorneo(fase: unknown): fase is FaseTorneo {
	return typeof fase === "string" && fase in ordineDellaFase
}

async function avviaProva() {
	try {
		const response = await fetch(`/api/prove/${route.params.id}/avvia`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
		})

		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || "Errore nell'avvio della prova")
		}

		await loadData()
	} catch (error) {
		alert(
			error instanceof Error ? error.message : "Si è verificato un errore"
		)
		console.error("Errore:", error)
	}
}

async function completaProva() {
	try {
		const response = await fetch(`/api/prove/${route.params.id}/completa`, {
			method: "POST",
		})
		if (!response.ok)
			throw new Error("Errore nel completamento della prova")
		await loadData()
	} catch (error) {
		console.error("Errore:", error)
	}
}

async function salvaRisultato(atleta: Atleta) {
	try {
		const response = await fetch(
			`/api/prove/${route.params.id}/risultati/${atleta.id_atleta}`,
			{
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					punteggio: atleta.punteggio,
					note: atleta.note,
				}),
			}
		)
		if (!response.ok)
			throw new Error("Errore nel salvataggio del risultato")
	} catch (error) {
		console.error("Errore:", error)
	}
}

// Update resetRisultato function to handle null values
async function resetRisultato(atleta: Atleta) {
	try {
		const response = await fetch(
			`/api/prove/${route.params.id}/risultati/${atleta.id_atleta}`,
			{
				method: "DELETE",
			}
		)
		if (!response.ok) throw new Error("Errore nel reset del risultato")
		// Update with type safety
		atleta.punteggio = null
		atleta.note = null
	} catch (error) {
		console.error("Errore:", error)
	}
}

// Aggiungi type per i voti
type Voto = "ROSSO" | "BIANCO"

// Semplificare la funzione assegnaVoto
async function assegnaVoto(idIncontro: number, arbitro: number, voto: Voto) {
	try {
		const response = await fetch(
			`/api/prove/${route.params.id}/incontri/${idIncontro}/voti`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ arbitro, voto }),
			}
		)

		if (!response.ok) {
			throw new Error("Errore nel salvataggio del voto")
		}

		await loadData() // Ricarica i dati per aggiornare la visualizzazione
	} catch (error) {
		console.error("Errore nel salvataggio del voto:", error)
	}
}

// Modificare getVotoArbitro per gestire i tipi correttamente
function getVotoArbitro(
	incontro: Incontro,
	numeroArbitro: number
): "ROSSO" | "BIANCO" | null {
	if (!incontro.voti) return null

	// Handle case where voti is a string (likely JSON string)
	if (typeof incontro.voti === "string") {
		try {
			const votiArray = JSON.parse(incontro.voti) as IncontroVoto[]
			const voto = votiArray.find((v) => v.arbitro === numeroArbitro)
			return voto?.voto || null
		} catch {
			return null
		}
	}

	// Handle case where voti is already an array
	const voto = incontro.voti.find((v) => v.arbitro === numeroArbitro)
	return voto?.voto || null
}

// Update the contaPunti function to handle string | IncontroVoto[] type
function contaPunti(incontro: Incontro | null, colore: Voto): string {
	if (!incontro || !incontro.voti) return ""

	// Handle case where voti is a string (likely JSON string)
	let votiArray: IncontroVoto[]
	if (typeof incontro.voti === "string") {
		try {
			votiArray = JSON.parse(incontro.voti)
		} catch {
			return ""
		}
	} else {
		votiArray = incontro.voti
	}

	// Se l'incontro è completato, mostra sempre un numero
	if (incontro.stato === "COMPLETATO") {
		const votiColore = votiArray.filter((v) => v.voto === colore).length
		return String(votiColore)
	}

	// Per incontri non completati, mostra il conteggio solo se ci sono voti
	const votiColore = votiArray.filter((v) => v.voto === colore).length
	return votiColore > 0 ? String(votiColore) : ""
}

async function resetIncontro(idIncontro: number): Promise<void> {
	try {
		const response = await fetch(
			`/api/prove/${route.params.id}/incontri/${idIncontro}/reset`,
			{
				method: "POST",
			}
		)
		if (!response.ok) throw new Error("Errore nel reset dell'incontro")
		await loadData()
	} catch (error) {
		console.error("Errore:", error)
	}
}

// Verifica se l'incontro è completato
function isIncontroCompletato(incontro: Incontro): boolean {
	if (!incontro) return false

	// Verifica lo stato dell'incontro direttamente
	if (incontro.stato === "COMPLETATO") {
		return true
	}

	// Se non c'è avversario, l'incontro è automaticamente completato
	if (!incontro.id_atleta_bianco) {
		return true
	}

	// Controlla il numero di voti
	let votiArray = Array.isArray(incontro.voti) ? incontro.voti : []
	return votiArray.length === prova.value?.numero_arbitri
}

// Update formatDateTime function to handle undefined
function formatDateTime(dateString: string | undefined): string {
	if (!dateString) return ""
	const date = new Date(dateString)
	return date.toLocaleTimeString("it-IT", {
		hour: "2-digit",
		minute: "2-digit",
	})
}

// Update calcolaDurata function to handle undefined
function calcolaDurata(
	inizio: string | undefined,
	fine: string | undefined
): string {
	if (!inizio || !fine) return ""
	const start = new Date(inizio)
	const end = new Date(fine)
	const diff = end.getTime() - start.getTime()
	const minutes = Math.floor(diff / 60000)
	if (minutes < 60) {
		return `${minutes} min`
	}
	const hours = Math.floor(minutes / 60)
	const remainingMinutes = minutes % 60
	return `${hours}h ${remainingMinutes}min`
}

// Aggiungi la funzione per tornare al tabellone
async function tornaAlTabellone() {
	if (prova.value?.id_tabellone) {
		router.push(`/tabellone/${prova.value.id_tabellone}`)
	}
}

// Aggiungi computed property per filtrare gli incontri per fase
const incontriPerFase = computed(() => {
	if (!incontri.value) return []

	if (selectedTab.value === "complessiva") {
		return incontri.value.sort((a, b) => {
			// Add type guard for fase property
			const faseA = a.fase as FaseTorneo
			const faseB = b.fase as FaseTorneo

			if (isFaseTorneo(faseA) && isFaseTorneo(faseB)) {
				const ordineA = ordineDellaFase[faseA]
				const ordineB = ordineDellaFase[faseB]
				if (ordineA !== ordineB) return ordineA - ordineB
			}
			return a.ordine - b.ordine
		})
	}

	return incontri.value
		.filter((incontro) => incontro.fase === selectedTab.value)
		.sort((a, b) => a.ordine - b.ordine)
})

// Mappa delle traduzioni delle fasi
const traduzioni = {
	SEDICESIMI: "Sedicesimi",
	OTTAVI: "Ottavi",
	QUARTI: "Quarti",
	SEMIFINALI: "Semifinali",
	FINALE: "Finale",
	TERZO_QUARTO: "Terzo/Quarto posto",
}

// Funzione per tradurre le fasi
function traduciFase(fase: FaseTorneo | "complessiva"): string {
	if (fase === "complessiva") return "Vista Complessiva"
	return traduzioni[fase] || fase
}

// Computed property per filtrare le fasi disponibili
const fasiFiltrate = computed<FaseTorneo[]>(() => {
	if (!incontri.value || incontri.value.length === 0) return []

	// Define ordered phases including TERZO_QUARTO
	const ordineDelleColonne: FaseTorneo[] = [
		"SEDICESIMI",
		"OTTAVI",
		"QUARTI",
		"SEMIFINALI",
		"FINALE",
		"TERZO_QUARTO", // Aggiunto TERZO_QUARTO alla fine
	]

	// Trova tutte le fasi presenti negli incontri
	const fasiPresenti = [...new Set(incontri.value.map((i) => i.fase))].filter(
		(fase) => isFaseTorneo(fase)
	) as FaseTorneo[]

	// Filtra e ordina le fasi secondo l'ordine definito
	return ordineDelleColonne.filter((fase) => fasiPresenti.includes(fase))
})

// Costante per definire le fasi del torneo in ordine
interface FaseTabellaView {
	id: FaseTorneo
	nome: string
}

const tutteFasi = computed(() => {
	if (!incontri.value?.length) return []

	const fasi: FaseTabellaView[] = []

	// Define ordered phases excluding TERZO_QUARTO for bracket view
	const ordineDelleColonne: FaseTorneo[] = [
		"SEDICESIMI",
		"OTTAVI",
		"QUARTI",
		"SEMIFINALI",
		"FINALE",
		// TERZO_QUARTO rimosso intenzionalmente dalla vista complessiva
	]

	// Trova tutte le fasi presenti negli incontri
	const fasiPresenti = [...new Set(incontri.value.map((i) => i.fase))].filter(
		(fase) => isFaseTorneo(fase)
	) as FaseTorneo[]

	// Aggiungi le fasi presenti nell'ordine corretto, escludendo TERZO_QUARTO
	ordineDelleColonne.forEach((fase) => {
		if (fasiPresenti.includes(fase)) {
			fasi.push({
				id: fase,
				nome: traduzioni[fase],
			})
		}
	})

	return fasi
})

// Aggiungi questa nuova funzione nel <script setup>
function getIncontriFase(fase: FaseTorneo): Incontro[] {
	if (!incontri.value) return []

	const incontriDellaFase = incontri.value
		.filter((i) => i.fase === fase)
		.sort((a, b) => a.ordine - b.ordine)

	// Se non ci sono incontri, crea placeholder per il numero corretto di incontri
	if (incontriDellaFase.length === 0) {
		const numIncontri = numIncontriPerFase[fase]
		return Array(numIncontri)
			.fill(null)
			.map((_, idx) => ({
				id_incontro: -idx - 1,
				id_prova: prova.value?.id_prova || 0, // Add required id_prova
				fase: fase,
				ordine: idx + 1,
				id_atleta_rosso: null,
				id_atleta_bianco: null,
				voti: [],
				cognome_rosso: undefined,
				nome_rosso: undefined,
				cognome_bianco: undefined,
				nome_bianco: undefined,
				societa_rosso: undefined,
				societa_bianco: undefined,
				stato: "DA_INIZIARE",
				turno: 1, // Add required turno property
			})) as Incontro[] // Type assertion to Incontro[]
	}

	return incontriDellaFase
}

// Aggiungi questa funzione nello script
const isFirstPhase = (fase: string) => {
	// Se non ci sono incontri, non è la fase iniziale
	if (!incontri.value?.length) return false

	// Trova la prima fase presente negli incontri
	const faseIniziale = incontri.value[0].fase

	// È la fase iniziale se corrisponde alla prima fase presente
	return fase === faseIniziale
}
</script>

<style scoped>
.bracket-container {
	padding: 2rem;
	background: white;
	border-radius: 0.5rem;
	display: grid;
	grid-auto-flow: column;
	grid-template-columns: 200px repeat(5, 35px 200px); /* Ridotto da 300px a 200px e da 50px a 35px */
	gap: 0;
}

.match-box {
	height: 56px; /* Aumentato da 44px a 56px */
	min-height: 56px;
	max-height: 56px;
	background: white;
	border: 1px solid #9ca3af;
	border-radius: 0.375rem;
	grid-row: span 1;
	margin: 0;
	display: flex;
	flex-direction: column;
	justify-content: space-between; /* Cambiato da center a space-between */
	box-sizing: border-box;
	padding: 0.5rem;
}

.match-box-space {
	height: 56px; /* Aggiornato per corrispondere al match-box */
	min-height: 56px;
	max-height: 56px;
	pointer-events: none;
	grid-row: span 1;
	margin: 0;
	box-sizing: border-box;
}

/* Aggiungi questi nuovi stili */
.color-box {
	width: 24px;
	height: 24px;
	border: 1px solid #9ca3af;
	border-radius: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 12px;
	font-weight: bold;
	margin-right: 8px;
}

.athlete-info {
	display: flex;
	flex-direction: column;
	flex-grow: 1;
}

.athlete-name {
	font-size: 0.875rem;
	margin-bottom: 0.125rem; /* Manteniamo un piccolo spazio */
	padding-bottom: 0; /* Rimosso il padding */
	/* Rimossa la linea border-bottom */
}

.athlete-society {
	font-size: 0.75rem;
	color: #6b7280;
	line-height: 1; /* Aggiunto per ridurre lo spazio */
	margin-top: 0; /* Rimosso il margine */
}

.bracket-container {
	padding: 2rem;
	background: white;
	border-radius: 0.5rem;
	display: grid;
	grid-auto-flow: column;
	grid-template-columns: 300px repeat(5, 50px 300px);
	gap: 0;
}

.overflow-x-auto {
	overflow-x: auto;
	padding-bottom: 1rem;
	margin-bottom: -1rem;
	-webkit-overflow-scrolling: touch;
}

.match-box {
	height: 44px; /* Altezza fissa inclusi i bordi */
	min-height: 44px;
	max-height: 44px;
	background: white;
	border: 1px solid #9ca3af; /* Cambiato da #000 a grigio più scuro (gray-600) */
	border-radius: 0.375rem;
	grid-row: span 1;
	margin: 0;
	display: flex; /* Aggiungiamo flex per gestire meglio il contenuto interno */
	flex-direction: column;
	justify-content: center;
	box-sizing: border-box; /* Garantisce che padding e bordi siano inclusi nell'altezza */
	padding: 0.5rem; /* Aggiunto il padding qui */
}

.match-box-space {
	height: 44px; /* Stessa altezza del match-box inclusi i bordi */
	min-height: 44px;
	max-height: 44px;
	pointer-events: none;
	grid-row: span 1;
	margin: 0;
	box-sizing: border-box;
}

.connection-column {
	position: relative;
	width: 50px;
}

.connection-line {
	position: absolute;
	width: 50px;
	border-top: 2px solid #000;
	border-right: 2px solid #000;
	border-bottom: 2px solid #000;
}

.line-up {
	border-bottom: none;
	border-bottom-left-radius: 8px;
}

.line-down {
	border-top: none;
	border-top-left-radius: 8px;
}

.line-vertical {
	position: absolute;
	left: 50%;
	width: 2px;
	background-color: #000;
	transform: translateX(-50%);
}
</style>
