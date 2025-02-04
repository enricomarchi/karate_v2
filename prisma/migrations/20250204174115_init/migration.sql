-- CreateTable
CREATE TABLE `atleti` (
    `id_atleta` INTEGER NOT NULL AUTO_INCREMENT,
    `cognome` VARCHAR(50) NOT NULL,
    `nome` VARCHAR(50) NOT NULL,
    `sesso` ENUM('M', 'F') NOT NULL,
    `anno_nascita` INTEGER NOT NULL,
    `cintura_id` INTEGER NULL,
    `dan` INTEGER NULL,
    `peso_kg` INTEGER NULL,
    `id_societa` INTEGER NOT NULL,

    INDEX `cintura_id`(`cintura_id`),
    INDEX `id_societa`(`id_societa`),
    PRIMARY KEY (`id_atleta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categorie` (
    `id_categoria` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(255) NOT NULL,
    `id_disciplina` VARCHAR(20) NOT NULL,
    `sesso` ENUM('M', 'F', 'X') NOT NULL,
    `peso_min` DECIMAL(5, 2) NULL,
    `peso_max` DECIMAL(5, 2) NULL,
    `n_ordine` INTEGER NULL,

    INDEX `id_disciplina`(`id_disciplina`),
    PRIMARY KEY (`id_categoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categorie_cinture` (
    `id_categoria` INTEGER NOT NULL,
    `id_cintura` INTEGER NOT NULL,

    INDEX `id_cintura`(`id_cintura`),
    PRIMARY KEY (`id_categoria`, `id_cintura`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categorie_fasce` (
    `id_categoria` INTEGER NOT NULL,
    `id_fascia` INTEGER NOT NULL,

    INDEX `id_fascia`(`id_fascia`),
    PRIMARY KEY (`id_categoria`, `id_fascia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cinture` (
    `id_cintura` INTEGER NOT NULL AUTO_INCREMENT,
    `colore` VARCHAR(20) NOT NULL,
    `kyu` DECIMAL(3, 1) NULL,

    PRIMARY KEY (`id_cintura`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `configurazioni_prove` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `config_id` INTEGER NOT NULL,
    `disciplina` VARCHAR(20) NOT NULL,
    `ordine` INTEGER NOT NULL,
    `valutazione` ENUM('PUNTEGGIO', 'BANDIERINE') NULL DEFAULT 'PUNTEGGIO',
    `template_tabellone` VARCHAR(50) NULL DEFAULT 'KUMITE_BASE',
    `numero_arbitri` INTEGER NULL DEFAULT 3,
    `finale` BOOLEAN NULL DEFAULT false,
    `calcola_totali` BOOLEAN NULL DEFAULT false,
    `durata_incontro` TIME(0) NULL DEFAULT '00:00:20',

    INDEX `config_id`(`config_id`),
    INDEX `disciplina`(`disciplina`),
    INDEX `template_tabellone`(`template_tabellone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `configurazioni_tabelloni` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `data_creazione` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `discipline` (
    `id_disciplina` VARCHAR(20) NOT NULL,
    `valore` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id_disciplina`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fasce_eta` (
    `id_fascia` INTEGER NOT NULL AUTO_INCREMENT,
    `descrizione` VARCHAR(50) NOT NULL,
    `anno_nascita_min` INTEGER NOT NULL,
    `anno_nascita_max` INTEGER NOT NULL,

    PRIMARY KEY (`id_fascia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `impostazioni_gara` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `nome_gara` VARCHAR(100) NOT NULL,
    `data_gara` DATE NOT NULL,
    `luogo` VARCHAR(100) NULL,
    `quota_iscrizione` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `incontri_prova` (
    `id_incontro` INTEGER NOT NULL AUTO_INCREMENT,
    `id_prova` INTEGER NOT NULL,
    `id_atleta_rosso` INTEGER NULL,
    `id_atleta_bianco` INTEGER NULL,
    `ordine` INTEGER NOT NULL,
    `turno` VARCHAR(20) NOT NULL,

    INDEX `id_atleta_bianco`(`id_atleta_bianco`),
    INDEX `id_atleta_rosso`(`id_atleta_rosso`),
    INDEX `id_prova`(`id_prova`),
    PRIMARY KEY (`id_incontro`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `iscrizioni` (
    `id_iscrizione` INTEGER NOT NULL AUTO_INCREMENT,
    `id_atleta` INTEGER NOT NULL,
    `id_disciplina` VARCHAR(20) NOT NULL,
    `id_categoria` INTEGER NULL,
    `id_tabellone` INTEGER NULL,
    `data_iscrizione` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `manuale` BOOLEAN NULL DEFAULT false,
    `confermata` BOOLEAN NULL DEFAULT false,
    `ammesso_in_finale` BOOLEAN NULL DEFAULT false,
    `classifica` INTEGER NULL,

    INDEX `id_atleta`(`id_atleta`),
    INDEX `id_categoria`(`id_categoria`),
    INDEX `id_disciplina`(`id_disciplina`),
    INDEX `id_tabellone`(`id_tabellone`),
    PRIMARY KEY (`id_iscrizione`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kata_shotokan` (
    `id_kata` INTEGER NOT NULL AUTO_INCREMENT,
    `codice` VARCHAR(10) NOT NULL,
    `nome` VARCHAR(50) NOT NULL,
    `livello` ENUM('BASE', 'INTERMEDIO', 'AVANZATO') NOT NULL,

    UNIQUE INDEX `codice`(`codice`),
    PRIMARY KEY (`id_kata`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prove` (
    `id_prova` INTEGER NOT NULL AUTO_INCREMENT,
    `id_tabellone` INTEGER NOT NULL,
    `id_disciplina` VARCHAR(20) NOT NULL,
    `numero_prova` INTEGER NOT NULL,
    `stato` ENUM('DA_INIZIARE', 'IN_CORSO', 'COMPLETATA') NULL DEFAULT 'DA_INIZIARE',
    `valutazione` ENUM('PUNTEGGIO', 'BANDIERINE') NULL DEFAULT 'PUNTEGGIO',
    `template_tabellone` VARCHAR(50) NULL DEFAULT 'KUMITE_BASE',
    `numero_arbitri` INTEGER NULL DEFAULT 3,
    `tatami` INTEGER NULL,
    `ora_inizio_prevista` DATETIME(0) NULL,
    `ora_fine_prevista` DATETIME(0) NULL,
    `ora_inizio_effettiva` DATETIME(0) NULL,
    `ora_fine_effettiva` DATETIME(0) NULL,
    `finale` BOOLEAN NULL DEFAULT false,
    `calcola_totali` BOOLEAN NULL DEFAULT false,
    `durata_incontro` TIME(0) NULL DEFAULT '00:00:20',

    INDEX `id_disciplina`(`id_disciplina`),
    INDEX `id_tabellone`(`id_tabellone`),
    INDEX `template_tabellone`(`template_tabellone`),
    PRIMARY KEY (`id_prova`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `punteggi_societa` (
    `posizione` INTEGER NOT NULL,
    `punti` INTEGER NOT NULL,
    `descrizione` VARCHAR(50) NULL,

    PRIMARY KEY (`posizione`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `societa` (
    `id_societa` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_societa` VARCHAR(100) NOT NULL,
    `pagato` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `resto_consegnato` DECIMAL(10, 2) NULL DEFAULT 0.00,

    PRIMARY KEY (`id_societa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tabelloni` (
    `id_tabellone` INTEGER NOT NULL AUTO_INCREMENT,
    `codice_tabellone` VARCHAR(50) NOT NULL,
    `nome_tabellone` VARCHAR(100) NOT NULL,
    `data_creazione` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `stato` ENUM('BOZZA', 'ATTIVO', 'COMPLETATO') NULL DEFAULT 'BOZZA',
    `tipo` ENUM('CATEGORIA_SINGOLA', 'POOL', 'ACCORPAMENTO') NULL,
    `pool_numero` INTEGER NULL,
    `pool_totali` INTEGER NULL,
    `configurazione_id` INTEGER NULL,
    `ora_inizio_effettiva` DATETIME(0) NULL,
    `ora_fine_effettiva` DATETIME(0) NULL,
    `stampato` BOOLEAN NULL DEFAULT false,

    UNIQUE INDEX `codice_tabellone`(`codice_tabellone`),
    INDEX `configurazione_id`(`configurazione_id`),
    PRIMARY KEY (`id_tabellone`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tabelloni_categorie` (
    `id_tabellone` INTEGER NOT NULL,
    `id_categoria` INTEGER NOT NULL,

    INDEX `id_categoria`(`id_categoria`),
    PRIMARY KEY (`id_tabellone`, `id_categoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `template_tabelloni` (
    `id` VARCHAR(50) NOT NULL,
    `descrizione` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `utenti` (
    `id_utente` INTEGER NOT NULL AUTO_INCREMENT,
    `codice_univoco` VARCHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `hash_password` VARCHAR(255) NOT NULL,
    `ruolo` ENUM('amministratore', 'pdg_tavolo_centrale', 'pdg_tatami', 'societa') NOT NULL,
    `data_creazione` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `data_aggiornamento` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `codice_univoco`(`codice_univoco`),
    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`id_utente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `voti_incontro` (
    `id_voto` INTEGER NOT NULL AUTO_INCREMENT,
    `id_incontro` INTEGER NOT NULL,
    `numero_arbitro` INTEGER NOT NULL,
    `bandierina` ENUM('ROSSO', 'BIANCO') NULL,
    `punteggio` DECIMAL(2, 1) NULL,
    `ora` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `unique_voto`(`id_incontro`, `numero_arbitro`),
    PRIMARY KEY (`id_voto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `atleti` ADD CONSTRAINT `atleti_ibfk_1` FOREIGN KEY (`id_societa`) REFERENCES `societa`(`id_societa`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atleti` ADD CONSTRAINT `atleti_ibfk_2` FOREIGN KEY (`cintura_id`) REFERENCES `cinture`(`id_cintura`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categorie` ADD CONSTRAINT `categorie_ibfk_1` FOREIGN KEY (`id_disciplina`) REFERENCES `discipline`(`id_disciplina`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categorie_cinture` ADD CONSTRAINT `categorie_cinture_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorie`(`id_categoria`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categorie_cinture` ADD CONSTRAINT `categorie_cinture_ibfk_2` FOREIGN KEY (`id_cintura`) REFERENCES `cinture`(`id_cintura`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categorie_fasce` ADD CONSTRAINT `categorie_fasce_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorie`(`id_categoria`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categorie_fasce` ADD CONSTRAINT `categorie_fasce_ibfk_2` FOREIGN KEY (`id_fascia`) REFERENCES `fasce_eta`(`id_fascia`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `configurazioni_prove` ADD CONSTRAINT `configurazioni_prove_ibfk_1` FOREIGN KEY (`config_id`) REFERENCES `configurazioni_tabelloni`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `configurazioni_prove` ADD CONSTRAINT `configurazioni_prove_ibfk_2` FOREIGN KEY (`disciplina`) REFERENCES `discipline`(`id_disciplina`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `configurazioni_prove` ADD CONSTRAINT `configurazioni_prove_ibfk_3` FOREIGN KEY (`template_tabellone`) REFERENCES `template_tabelloni`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `incontri_prova` ADD CONSTRAINT `incontri_prova_ibfk_1` FOREIGN KEY (`id_prova`) REFERENCES `prove`(`id_prova`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `incontri_prova` ADD CONSTRAINT `incontri_prova_ibfk_2` FOREIGN KEY (`id_atleta_rosso`) REFERENCES `atleti`(`id_atleta`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `incontri_prova` ADD CONSTRAINT `incontri_prova_ibfk_3` FOREIGN KEY (`id_atleta_bianco`) REFERENCES `atleti`(`id_atleta`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `iscrizioni` ADD CONSTRAINT `iscrizioni_ibfk_1` FOREIGN KEY (`id_atleta`) REFERENCES `atleti`(`id_atleta`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `iscrizioni` ADD CONSTRAINT `iscrizioni_ibfk_2` FOREIGN KEY (`id_categoria`) REFERENCES `categorie`(`id_categoria`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `iscrizioni` ADD CONSTRAINT `iscrizioni_ibfk_3` FOREIGN KEY (`id_disciplina`) REFERENCES `discipline`(`id_disciplina`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `iscrizioni` ADD CONSTRAINT `iscrizioni_ibfk_4` FOREIGN KEY (`id_tabellone`) REFERENCES `tabelloni`(`id_tabellone`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prove` ADD CONSTRAINT `prove_ibfk_1` FOREIGN KEY (`id_tabellone`) REFERENCES `tabelloni`(`id_tabellone`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `prove` ADD CONSTRAINT `prove_ibfk_2` FOREIGN KEY (`id_disciplina`) REFERENCES `discipline`(`id_disciplina`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `prove` ADD CONSTRAINT `prove_ibfk_3` FOREIGN KEY (`template_tabellone`) REFERENCES `template_tabelloni`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tabelloni` ADD CONSTRAINT `tabelloni_ibfk_1` FOREIGN KEY (`configurazione_id`) REFERENCES `configurazioni_tabelloni`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tabelloni_categorie` ADD CONSTRAINT `tabelloni_categorie_ibfk_1` FOREIGN KEY (`id_tabellone`) REFERENCES `tabelloni`(`id_tabellone`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tabelloni_categorie` ADD CONSTRAINT `tabelloni_categorie_ibfk_2` FOREIGN KEY (`id_categoria`) REFERENCES `categorie`(`id_categoria`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `voti_incontro` ADD CONSTRAINT `voti_incontro_ibfk_1` FOREIGN KEY (`id_incontro`) REFERENCES `incontri_prova`(`id_incontro`) ON DELETE CASCADE ON UPDATE NO ACTION;
