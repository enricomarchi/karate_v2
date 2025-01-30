DROP DATABASE IF EXISTS `karate_gare`;
CREATE DATABASE IF NOT EXISTS `karate_gare`;
USE `karate_gare`;

CREATE TABLE cinture (
    id_cintura INT AUTO_INCREMENT PRIMARY KEY,
    colore VARCHAR(20) NOT NULL,
    kyu DECIMAL(3,1)
) AUTO_INCREMENT = 1;

-- Popolamento tabella cinture
INSERT INTO cinture (colore, kyu) VALUES 
('BIANCA', 9.0),
('BIANCO/GIALLA', 8.0),
('GIALLA', 7.0),
('GIALLO/ARANCIO', 6.0),
('ARANCIO', 5.0),
('ARANCIO/VERDE', 4.0),
('VERDE', 3.0),
('VERDE/BLU', 2.5),
('BLU', 2.0),
('BLU/MARRONE', 1.5),
('MARRONE', 1.0),
('NERA', 0.0);

CREATE TABLE discipline (
    id_disciplina VARCHAR(20) PRIMARY KEY,
    valore VARCHAR(100) NOT NULL
);

-- Popolamento tabella discipline
INSERT INTO discipline (id_disciplina, valore) VALUES 
('KATA', 'KATA'),
('KUMITE', 'KUMITE'),
('KIHON_IPPON_KUMITE','KIHON IPPON KUMITE'),
('JYU_KUMITE_TEC_PREST','JYU KUMITE A TECNICHE PRESTABILITE'),
('JYU_KUMITE','JYU KUMITE'),
('PALLONCINO', 'GIOCO TECNICO AL PALLONCINO'),
('SACCO', 'TECNICHE AL SACCO'),
('FAZZOLETTO', 'GIOCO TECNICO DEL FAZZOLETTO'),
('PERCORSO', 'PERCORSO'),
('PROVE_MISTE', 'PROVE MISTE');

-- Tabella per i kata dello stile Shotokan
CREATE TABLE kata_shotokan (
    id_kata INT AUTO_INCREMENT PRIMARY KEY,
    codice VARCHAR(10) NOT NULL UNIQUE,
    nome VARCHAR(50) NOT NULL,
    livello ENUM('BASE', 'INTERMEDIO', 'AVANZATO') NOT NULL
);

-- Popolamento tabella kata_shotokan
INSERT INTO kata_shotokan (codice, nome, livello) VALUES 
('H1', 'Heian Shodan', 'BASE'),
('H2', 'Heian Nidan', 'BASE'),
('H3', 'Heian Sandan', 'BASE'),
('H4', 'Heian Yondan', 'BASE'),
('H5', 'Heian Godan', 'BASE'),
('TK', 'Tekki Shodan', 'INTERMEDIO'),
('BK', 'Bassai Dai', 'INTERMEDIO'),
('KK', 'Kanku Dai', 'INTERMEDIO'),
('JN', 'Jion', 'INTERMEDIO'),
('EN', 'Enpi', 'INTERMEDIO'),
('GD', 'Gankaku', 'AVANZATO'),
('HG', 'Hangetsu', 'AVANZATO'),
('BS', 'Bassai Sho', 'AVANZATO'),
('KS', 'Kanku Sho', 'AVANZATO'),
('CH', 'Chinte', 'AVANZATO'),
('JS', 'Jitte', 'AVANZATO'),
('SP', 'Sochin', 'AVANZATO'),
('NK', 'Nijushiho', 'AVANZATO'),
('GS', 'Gojushiho Sho', 'AVANZATO'),
('GD2', 'Gojushiho Dai', 'AVANZATO'), -- Modificato 'GD' in 'GD2' per evitare duplicati
('WS', 'Wankan', 'AVANZATO'),
('UR', 'Unsu', 'AVANZATO'),
('MS', 'Meikyo', 'AVANZATO');

CREATE TABLE template_tabelloni (
    id VARCHAR(50) PRIMARY KEY,
    descrizione VARCHAR(255) NOT NULL
);

INSERT INTO template_tabelloni (id, descrizione) VALUES
('KUMITE_BASE', 'Tabellone base per gli incontri di kumite'),
('ELIM_DIR', 'Eliminazione diretta'),
('GIRONE_ITA', 'Girone all''italiana');

CREATE TABLE utenti (
  id_utente INT PRIMARY KEY AUTO_INCREMENT,
  codice_univoco VARCHAR(36) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  hash_password VARCHAR(255) NOT NULL,
  ruolo ENUM('amministratore', 'pdg_tavolo_centrale', 'pdg_tatami', 'societa') NOT NULL,
  data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_aggiornamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) AUTO_INCREMENT = 1;

-- Tabella per le impostazioni generali della gara 
CREATE TABLE impostazioni_gara (
    id INT PRIMARY KEY DEFAULT 1,  -- Solo una riga sarà presente
    nome_gara VARCHAR(100) NOT NULL,
    data_gara DATE NOT NULL,
    luogo VARCHAR(100),
    quota_iscrizione DECIMAL(10,2) NOT NULL DEFAULT 0,
    CONSTRAINT single_row CHECK (id = 1)
);

-- Tabella per i punteggi per la classifica società
CREATE TABLE punteggi_societa (
    posizione INT PRIMARY KEY,
    punti INT NOT NULL,
    descrizione VARCHAR(50),
    CONSTRAINT posizioni_valide CHECK (posizione BETWEEN 1 AND 10)
);

CREATE TABLE societa (
    id_societa INT AUTO_INCREMENT PRIMARY KEY,
    nome_societa VARCHAR(100) NOT NULL,
    pagato DECIMAL(10,2) DEFAULT 0.00,
    resto_consegnato DECIMAL(10,2) DEFAULT 0.00
) AUTO_INCREMENT = 1;

CREATE TABLE fasce_eta (
    id_fascia INT AUTO_INCREMENT PRIMARY KEY,
    descrizione VARCHAR(50) NOT NULL,
    anno_nascita_min INT NOT NULL,
    anno_nascita_max INT NOT NULL
) AUTO_INCREMENT = 1;

CREATE TABLE atleti (
    id_atleta INT AUTO_INCREMENT PRIMARY KEY,
    cognome VARCHAR(50) NOT NULL,
    nome VARCHAR(50) NOT NULL,
    sesso ENUM('M', 'F') NOT NULL,
    anno_nascita INT NOT NULL,
    cintura_id INT,
    dan INT,
    peso_kg DECIMAL(5,2),
    id_societa INT NOT NULL,
    FOREIGN KEY (id_societa) REFERENCES societa(id_societa),
    FOREIGN KEY (cintura_id) REFERENCES cinture(id_cintura)
) AUTO_INCREMENT = 1;

CREATE TABLE categorie (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    id_disciplina VARCHAR(20) NOT NULL,
    sesso ENUM('M', 'F', 'X') NOT NULL,
    peso_min DECIMAL(5,2),
    peso_max DECIMAL(5,2),
    n_ordine INT,
    FOREIGN KEY (id_disciplina) REFERENCES discipline(id_disciplina)
) AUTO_INCREMENT = 1;

CREATE TABLE categorie_fasce (
    id_categoria INT,
    id_fascia INT,
    PRIMARY KEY (id_categoria, id_fascia),
    FOREIGN KEY (id_categoria) REFERENCES categorie(id_categoria) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_fascia) REFERENCES fasce_eta(id_fascia) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE categorie_cinture (
    id_categoria INT,
    id_cintura INT,
    PRIMARY KEY (id_categoria, id_cintura),
    FOREIGN KEY (id_categoria) REFERENCES categorie(id_categoria) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_cintura) REFERENCES cinture(id_cintura) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE configurazioni_tabelloni (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE configurazioni_prove (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_id INT NOT NULL,
    disciplina VARCHAR(20) NOT NULL,
    ordine INT NOT NULL,
    valutazione ENUM('PUNTEGGIO', 'BANDIERINE') DEFAULT 'PUNTEGGIO',
    template_tabellone VARCHAR(50) DEFAULT 'KUMITE_BASE',
    numero_arbitri INT DEFAULT 3,
    finale BOOLEAN DEFAULT FALSE,
    calcola_totali BOOLEAN DEFAULT FALSE,
    durata_incontro TIME DEFAULT '00:00:20',
    FOREIGN KEY (config_id) REFERENCES configurazioni_tabelloni(id) ON DELETE CASCADE,
    FOREIGN KEY (disciplina) REFERENCES discipline(id_disciplina),
    FOREIGN KEY (template_tabellone) REFERENCES template_tabelloni(id)
);

CREATE TABLE tabelloni (
    id_tabellone INT AUTO_INCREMENT PRIMARY KEY,
    codice_tabellone VARCHAR(50) NOT NULL UNIQUE, -- es: "1", "1.2", "1-2-3"
    nome_tabellone VARCHAR(100) NOT NULL,
    data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    stato ENUM('BOZZA', 'ATTIVO', 'COMPLETATO') DEFAULT 'BOZZA',
    tipo ENUM('CATEGORIA_SINGOLA', 'POOL', 'ACCORPAMENTO'), -- Added missing comma here
    pool_numero INT DEFAULT NULL,
    pool_totali INT DEFAULT NULL,
    configurazione_id INT NULL,
    ora_inizio_effettiva DATETIME DEFAULT NULL,
    ora_fine_effettiva DATETIME DEFAULT NULL,
    stampato BOOLEAN DEFAULT FALSE,  -- Nuovo campo
    FOREIGN KEY (configurazione_id) REFERENCES configurazioni_tabelloni(id)
) AUTO_INCREMENT = 1;

-- Tabella per collegare i tabelloni alle categorie
CREATE TABLE tabelloni_categorie (
    id_tabellone INT,
    id_categoria INT,
    PRIMARY KEY (id_tabellone, id_categoria),
    FOREIGN KEY (id_tabellone) REFERENCES tabelloni(id_tabellone) ON DELETE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES categorie(id_categoria) ON DELETE CASCADE
);

CREATE TABLE iscrizioni (
    id_iscrizione INT AUTO_INCREMENT PRIMARY KEY,
    id_atleta INT NOT NULL,
    id_disciplina VARCHAR(20) NOT NULL,
    id_categoria INT,
    id_tabellone INT DEFAULT NULL,
    data_iscrizione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    manuale BOOLEAN DEFAULT FALSE,
    confermata BOOLEAN DEFAULT FALSE,
    ammesso_in_finale BOOLEAN DEFAULT FALSE,
    classifica INT DEFAULT NULL,
    FOREIGN KEY (id_atleta) REFERENCES atleti(id_atleta),
    FOREIGN KEY (id_categoria) REFERENCES categorie(id_categoria),
    FOREIGN KEY (id_disciplina) REFERENCES discipline(id_disciplina),
    FOREIGN KEY (id_tabellone) REFERENCES tabelloni(id_tabellone)
) AUTO_INCREMENT = 1;

CREATE TABLE prove (
    id_prova INT AUTO_INCREMENT PRIMARY KEY,
    id_tabellone INT NOT NULL,
    id_disciplina VARCHAR(20) NOT NULL,
    numero_prova INT NOT NULL, -- ordine delle prove nel tabellone
    stato ENUM('DA_INIZIARE', 'IN_CORSO', 'COMPLETATA') DEFAULT 'DA_INIZIARE',
    valutazione ENUM('PUNTEGGIO', 'BANDIERINE') DEFAULT 'PUNTEGGIO',
    template_tabellone VARCHAR(50) DEFAULT 'KUMITE_BASE',
    numero_arbitri INT DEFAULT 3,
    tatami INT DEFAULT NULL,
    ora_inizio_prevista DATETIME,
    ora_fine_prevista DATETIME,
    ora_inizio_effettiva DATETIME,
    ora_fine_effettiva DATETIME,
    finale BOOLEAN DEFAULT FALSE,
    calcola_totali BOOLEAN DEFAULT FALSE,
    durata_incontro TIME DEFAULT '00:00:20',
    FOREIGN KEY (id_tabellone) REFERENCES tabelloni(id_tabellone) ON DELETE CASCADE,
    FOREIGN KEY (id_disciplina) REFERENCES discipline(id_disciplina),
    FOREIGN KEY (template_tabellone) REFERENCES template_tabelloni(id)
) AUTO_INCREMENT = 1;

CREATE TABLE incontri_prova (
    id_incontro INT AUTO_INCREMENT PRIMARY KEY,
    id_prova INT NOT NULL,
    id_atleta_rosso INT NULL,
    id_atleta_bianco INT NULL,
    ordine INT NOT NULL,
    turno VARCHAR(20) NOT NULL, 
    FOREIGN KEY (id_prova) REFERENCES prove(id_prova) ON DELETE CASCADE,
    FOREIGN KEY (id_atleta_rosso) REFERENCES atleti(id_atleta),
    FOREIGN KEY (id_atleta_bianco) REFERENCES atleti(id_atleta)
);

CREATE TABLE voti_incontro (
    id_voto INT AUTO_INCREMENT PRIMARY KEY,
    id_incontro INT NOT NULL,
    numero_arbitro INT NOT NULL,
    bandierina ENUM('ROSSO', 'BIANCO') DEFAULT NULL,
    punteggio DECIMAL(2,1) DEFAULT NULL,
    ora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_incontro) REFERENCES incontri_prova(id_incontro) ON DELETE CASCADE,
    UNIQUE KEY unique_voto (id_incontro, numero_arbitro)
) AUTO_INCREMENT = 1;

-- =================================================== SEZIONE VIEW =======================================================

-- Vista dettaglio_categorie che include tutti i campi delle tabelle correlate
CREATE OR REPLACE VIEW dettaglio_categorie AS
SELECT 
    c.id_categoria,
    c.nome,
    c.id_disciplina,
    c.sesso,
    c.peso_min,
    c.peso_max,
    c.n_ordine,
    d.id_disciplina as disciplina_id,
    d.valore as disciplina_valore
FROM categorie c
LEFT JOIN discipline d ON c.id_disciplina = d.id_disciplina;

-- Vista dettaglio_categorie_fasce che include tutti i campi della tabella fasce_eta
CREATE VIEW dettaglio_categorie_fasce AS
SELECT 
    cf.id_categoria,
    cf.id_fascia,
    f.descrizione,
    f.anno_nascita_min,
    f.anno_nascita_max
FROM categorie_fasce cf
JOIN fasce_eta f ON cf.id_fascia = f.id_fascia;

-- Vista dettaglio_categorie_cinture che include tutti i campi della tabella cinture
CREATE VIEW dettaglio_categorie_cinture AS
SELECT 
    cc.id_categoria,
    cc.id_cintura,
    c.colore,
    c.kyu
FROM categorie_cinture cc
JOIN cinture c ON cc.id_cintura = c.id_cintura;

-- Vista per calcolare i range di età per ogni categoria
CREATE VIEW range_fasce_categoria AS
SELECT 
    cf.id_categoria,
    MIN(f.anno_nascita_min) as min_anno,
    MAX(f.anno_nascita_max) as max_anno
FROM categorie_fasce cf
JOIN fasce_eta f ON cf.id_fascia = f.id_fascia
GROUP BY cf.id_categoria;

-- Vista per calcolare i range di cinture per ogni categoria
CREATE VIEW range_cinture_categoria AS
SELECT 
    cc.id_categoria,
    MIN(c.kyu) as min_kyu,
    MAX(c.kyu) as max_kyu
FROM categorie_cinture cc
JOIN cinture c ON cc.id_cintura = c.id_cintura
GROUP BY cc.id_categoria;

-- Vista per trovare le categorie che si sovrappongono
CREATE OR REPLACE VIEW categorie_sovrapposte AS
SELECT DISTINCT
    c1.id_categoria as cat1_id,
    c1.nome as cat1_nome,
    c2.id_categoria as cat2_id,
    c2.nome as cat2_nome,
    c1.id_disciplina,
    d.valore as disciplina
FROM categorie c1
JOIN categorie c2 ON c1.id_categoria < c2.id_categoria
JOIN discipline d ON c1.id_disciplina = d.id_disciplina
JOIN range_fasce_categoria f1 ON c1.id_categoria = f1.id_categoria
JOIN range_fasce_categoria f2 ON c2.id_categoria = f2.id_categoria
JOIN range_cinture_categoria cin1 ON c1.id_categoria = cin1.id_categoria
JOIN range_cinture_categoria cin2 ON c2.id_categoria = cin2.id_categoria
WHERE 
    c1.id_disciplina = c2.id_disciplina
    AND (c1.sesso = c2.sesso OR c1.sesso = 'X' OR c2.sesso = 'X')
    AND (
        -- Sovrapposizione di pesi (se presenti)
        (
            c1.peso_min IS NOT NULL 
            AND c2.peso_min IS NOT NULL 
            AND (
                (c1.peso_min BETWEEN c2.peso_min AND c2.peso_max)
                OR (c1.peso_max BETWEEN c2.peso_min AND c2.peso_max)
                OR (c2.peso_min BETWEEN c1.peso_min AND c1.peso_max)
                OR (c2.peso_max BETWEEN c1.peso_min AND c1.peso_max)
            )
        )
        OR (c1.peso_min IS NULL AND c2.peso_min IS NULL)
    )
    AND (
        -- Sovrapposizione di anni
        (f1.min_anno BETWEEN f2.min_anno AND f2.max_anno)
        OR (f1.max_anno BETWEEN f2.min_anno AND f2.max_anno)
        OR (f2.min_anno BETWEEN f1.min_anno AND f1.max_anno)
        OR (f2.max_anno BETWEEN f1.min_anno AND f1.max_anno)
    )
    AND (
        -- Sovrapposizione di cinture
        -- Due range si sovrappongono se l'inizio di uno è contenuto nel range dell'altro
        (cin1.min_kyu BETWEEN cin2.min_kyu AND cin2.max_kyu)
        OR (cin1.max_kyu BETWEEN cin2.min_kyu AND cin2.max_kyu)
        OR (cin2.min_kyu BETWEEN cin1.min_kyu AND cin1.max_kyu)
        OR (cin2.max_kyu BETWEEN cin1.min_kyu AND cin1.max_kyu)
    );

