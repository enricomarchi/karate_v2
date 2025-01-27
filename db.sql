DROP DATABASE IF EXISTS `karate_gare`;
CREATE DATABASE IF NOT EXISTS `karate_gare`;
USE `karate_gare`;

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

CREATE TABLE cinture (
    id_cintura INT AUTO_INCREMENT PRIMARY KEY,
    colore VARCHAR(20) NOT NULL,
    kyu DECIMAL(3,1)
) AUTO_INCREMENT = 1;

CREATE TABLE discipline (
    id_disciplina VARCHAR(20) PRIMARY KEY,
    valore VARCHAR(100) NOT NULL
);

CREATE TABLE sesso (
    id_sesso VARCHAR(10) PRIMARY KEY,
    valore VARCHAR(20) NOT NULL
);

-- Popolamento tabella sesso
INSERT INTO sesso (id_sesso, valore) VALUES 
('M', 'MASCHILE'),
('F', 'FEMMINILE'),
('MIXED', 'MISTO');

-- Popolamento tabella discipline
INSERT INTO discipline (id_disciplina, valore) VALUES 
('KATA', 'KATA'),
('KUMITE', 'KUMITE'),
('KIHON_IPPON_KUMITE','KIHON IPPON KUMITE'),
('JYU_KUMITE_TEC_PREST','JYU KUMITE A TECNICHE PRESTABILITE'),
('JYU_KUMITE','JYU KUMITE'),
('PALLONCINO', 'GIOCO TECNICO AL PALLONCINO / TECNICHE AL SACCO'),
('FAZZOLETTO', 'GIOCO TECNICO DEL FAZZOLETTO'),
('PERCORSO', 'PERCORSO'),
('PROVE_MISTE', 'PROVE MISTE');

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

CREATE TABLE atleti (
    id_atleta INT AUTO_INCREMENT PRIMARY KEY,
    cognome VARCHAR(50) NOT NULL,
    nome VARCHAR(50) NOT NULL,
    sesso VARCHAR(10) NOT NULL,
    anno_nascita INT NOT NULL,
    cintura_id INT,
    dan INT,
    peso_kg DECIMAL(5,2),
    id_societa INT NOT NULL,
    FOREIGN KEY (id_societa) REFERENCES societa(id_societa),
    FOREIGN KEY (cintura_id) REFERENCES cinture(id_cintura),
    FOREIGN KEY (sesso) REFERENCES sesso(id_sesso)
) AUTO_INCREMENT = 1;

CREATE TABLE accorpamenti (
    n_accorpamento INT AUTO_INCREMENT PRIMARY KEY,
    nome_accorpamento VARCHAR(255) NOT NULL,
    n_ordine INT NOT NULL,
    colore VARCHAR(20) NOT NULL
) AUTO_INCREMENT = 1;

CREATE TABLE categorie (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    id_disciplina VARCHAR(20) NOT NULL,
    sesso VARCHAR(10) NOT NULL,
    peso_min DECIMAL(5,2),
    peso_max DECIMAL(5,2),
    n_ordine INT,
    n_accorpamento INT,
    FOREIGN KEY (id_disciplina) REFERENCES discipline(id_disciplina),
    FOREIGN KEY (sesso) REFERENCES sesso(id_sesso),
    FOREIGN KEY (n_accorpamento) REFERENCES accorpamenti(n_accorpamento)
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

CREATE TABLE iscrizioni (
    id_iscrizione INT AUTO_INCREMENT PRIMARY KEY,
    id_atleta INT NOT NULL,
    id_disciplina VARCHAR(20) NOT NULL,
    id_categoria INT,
    data_iscrizione TIMESTAMP DEFAULT NULL,
    manuale BOOLEAN DEFAULT FALSE,
    confermata BOOLEAN DEFAULT FALSE,
    pool INT DEFAULT NULL,
    FOREIGN KEY (id_atleta) REFERENCES atleti(id_atleta),
    FOREIGN KEY (id_categoria) REFERENCES categorie(id_categoria),
    FOREIGN KEY (id_disciplina) REFERENCES discipline(id_disciplina)
) AUTO_INCREMENT = 1;

-- Tabella per le impostazioni generali della gara (spostiamo qui la creazione)
CREATE TABLE impostazioni_gara (
    id INT PRIMARY KEY DEFAULT 1,  -- Solo una riga sarà presente
    nome_gara VARCHAR(100) NOT NULL,
    data_gara DATE NOT NULL,
    luogo VARCHAR(100),
    quota_iscrizione DECIMAL(10,2) NOT NULL DEFAULT 0,
    quota_iscrizione_aggiuntiva DECIMAL(10,2) NOT NULL DEFAULT 0,  -- Per iscrizioni multiple dello stesso atleta
    descrizione TEXT,
    ultima_modifica TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT single_row CHECK (id = 1)
);

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

-- Aggiungi tabelle per le configurazioni PRIMA della tabella tabelloni
CREATE TABLE configurazioni_tabelloni (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rimuovi il campo regole_accesso JSON da configurazioni_prove
CREATE TABLE configurazioni_prove (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_id INT NOT NULL,
    disciplina VARCHAR(20) NOT NULL,
    nome_prova VARCHAR(100) NOT NULL,
    ordine INT NOT NULL,
    tipo_tabellone ENUM('punteggio', 'bandierine') DEFAULT 'punteggio',
    template_tabellone ENUM('KUMITE_BASE', 'ELIM_DIR_REC', 'GIRONE_ITA') DEFAULT 'KUMITE_BASE',
    numero_arbitri INT DEFAULT 3,
    is_finale BOOLEAN DEFAULT FALSE,
    calcola_totali BOOLEAN DEFAULT FALSE,
    durata_incontro TIME DEFAULT '00:00:20',
    FOREIGN KEY (config_id) REFERENCES configurazioni_tabelloni(id) ON DELETE CASCADE,
    FOREIGN KEY (disciplina) REFERENCES discipline(id_disciplina)
);

-- Nuova tabella per le regole di accesso
CREATE TABLE regole_accesso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_prova INT NOT NULL,
    tipo_regola VARCHAR(50) NOT NULL,
    valore INT NOT NULL,
    FOREIGN KEY (id_prova) REFERENCES configurazioni_prove(id) ON DELETE CASCADE
);

-- ORA possiamo creare la tabella tabelloni con la foreign key
CREATE TABLE tabelloni (
    id_tabellone INT AUTO_INCREMENT PRIMARY KEY,
    codice_tabellone VARCHAR(50) NOT NULL UNIQUE, -- es: "1", "1.2", "1-2-3"
    nome_tabellone VARCHAR(100) NOT NULL,
    data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    stato ENUM('BOZZA', 'ATTIVO', 'COMPLETATO') DEFAULT 'BOZZA',
    pool INT DEFAULT NULL,
    configurazione_id INT NULL,
    ora_inizio_effettiva DATETIME DEFAULT NULL,
    ora_fine_effettiva DATETIME DEFAULT NULL,
    stampato BOOLEAN DEFAULT FALSE,  -- Nuovo campo
    FOREIGN KEY (configurazione_id) REFERENCES configurazioni_tabelloni(id)
);

-- Tabella per le classifiche finali (spostata prima della vista_societa)
CREATE TABLE classifiche_finali (
    id_tabellone INT NOT NULL,
    id_atleta INT NOT NULL,
    posizione INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_tabellone, id_atleta),
    FOREIGN KEY (id_tabellone) REFERENCES tabelloni(id_tabellone) ON DELETE CASCADE,
    FOREIGN KEY (id_atleta) REFERENCES atleti(id_atleta)
);

-- Tabella per i punteggi da assegnare alle società
CREATE TABLE punteggi_societa (
    posizione INT PRIMARY KEY,
    punti INT NOT NULL,
    descrizione VARCHAR(50),
    CONSTRAINT posizioni_valide CHECK (posizione BETWEEN 1 AND 10)
);

-- Ricrea la vista con il nuovo nome (ex classifica_societa)
DROP VIEW IF EXISTS vista_societa;
CREATE VIEW vista_societa AS
WITH RankingSocieta AS (
    SELECT 
        s.id_societa,
        s.nome_societa,
        s.pagato,
        s.resto_consegnato,
        COUNT(DISTINCT a.id_atleta) as numero_atleti,
        COUNT(DISTINCT i.id_iscrizione) as numero_iscrizioni,
        COUNT(DISTINCT CASE WHEN i.confermata = 1 THEN i.id_iscrizione END) as numero_iscrizioni_confermate,
        CAST(COALESCE((
            SELECT ig.quota_iscrizione 
            FROM impostazioni_gara ig 
            WHERE ig.id = 1
        ) * COUNT(DISTINCT CASE WHEN i.confermata = 1 THEN i.id_iscrizione END), 0) AS DECIMAL(10,2)) as importo_dovuto,
        -- Calcolo del resto da consegnare
        CAST((s.pagato - COALESCE((
            SELECT ig.quota_iscrizione 
            FROM impostazioni_gara ig 
            WHERE ig.id = 1
        ) * COUNT(DISTINCT CASE WHEN i.confermata = 1 THEN i.id_iscrizione END), 0) - s.resto_consegnato) AS DECIMAL(10,2)) as resto_da_consegnare,
        COALESCE(SUM(
            CASE 
                WHEN cf.id_atleta IS NOT NULL THEN 
                    COALESCE((
                        SELECT ps.punti 
                        FROM punteggi_societa ps 
                        WHERE ps.posizione = cf.posizione
                    ), 0)
                ELSE 0
            END
        ), 0) as punteggio_totale,
        DENSE_RANK() OVER (
            ORDER BY 
                COALESCE(SUM(
                    CASE 
                        WHEN cf.id_atleta IS NOT NULL THEN 
                            COALESCE((
                                SELECT ps.punti 
                                FROM punteggi_societa ps 
                                WHERE ps.posizione = cf.posizione
                            ), 0)
                        ELSE 0
                    END
                ), 0) DESC
        ) as posizione_classifica
    FROM societa s
    LEFT JOIN atleti a ON s.id_societa = a.id_societa
    LEFT JOIN iscrizioni i ON a.id_atleta = i.id_atleta
    LEFT JOIN classifiche_finali cf ON a.id_atleta = cf.id_atleta
    GROUP BY 
        s.id_societa,
        s.nome_societa
)
SELECT 
    id_societa,
    nome_societa,
    numero_atleti,
    numero_iscrizioni,
    numero_iscrizioni_confermate,
    importo_dovuto,
    pagato,
    resto_consegnato,
    resto_da_consegnare,
    punteggio_totale,
    posizione_classifica
FROM RankingSocieta
ORDER BY 
    posizione_classifica ASC,
    nome_societa ASC;

-- Tabella per collegare i tabelloni alle categorie
CREATE TABLE tabelloni_categorie (
    id_tabellone INT,
    id_categoria INT,
    PRIMARY KEY (id_tabellone, id_categoria),
    FOREIGN KEY (id_tabellone) REFERENCES tabelloni(id_tabellone) ON DELETE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES categorie(id_categoria) ON DELETE CASCADE
);

-- Modifica la tabella prove rimuovendo il campo regole_accesso JSON
CREATE TABLE prove (
    id_prova INT AUTO_INCREMENT PRIMARY KEY,
    id_tabellone INT NOT NULL,
    id_disciplina VARCHAR(20) NOT NULL,
    numero_prova INT NOT NULL, -- ordine delle prove nel tabellone
    nome_prova VARCHAR(100) NOT NULL,
    stato ENUM('DA_INIZIARE', 'IN_CORSO', 'COMPLETATA') DEFAULT 'DA_INIZIARE',
    tipo_tabellone ENUM('punteggio', 'bandierine') DEFAULT 'punteggio',
    template_tabellone ENUM('KUMITE_BASE', 'ELIM_DIR_REC', 'GIRONE_ITA') DEFAULT 'KUMITE_BASE',
    numero_arbitri INT DEFAULT 3,
    tatami VARCHAR(50),
    ora_inizio_prevista DATETIME,
    ora_fine_prevista DATETIME,
    ora_inizio_effettiva DATETIME,
    ora_fine_effettiva DATETIME,
    is_finale BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_tabellone) REFERENCES tabelloni(id_tabellone) ON DELETE CASCADE,
    FOREIGN KEY (id_disciplina) REFERENCES discipline(id_disciplina),
    UNIQUE (id_tabellone, numero_prova)
);

-- Tabella per i risultati delle prove
CREATE TABLE risultati_prove (
    id_risultato INT AUTO_INCREMENT PRIMARY KEY,
    id_prova INT NOT NULL,
    id_atleta INT NOT NULL,
    punteggio DECIMAL(10,2),
    note TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_prova) REFERENCES prove(id_prova) ON DELETE CASCADE,
    FOREIGN KEY (id_atleta) REFERENCES atleti(id_atleta),
    UNIQUE (id_prova, id_atleta)
);

CREATE TABLE incontri_prova (
    id_incontro INT AUTO_INCREMENT PRIMARY KEY,
    id_prova INT NOT NULL,
    id_atleta_rosso INT NULL,
    id_atleta_bianco INT NULL,
    ordine INT NOT NULL,
    stato ENUM('DA_INIZIARE', 'IN_CORSO', 'COMPLETATO') DEFAULT 'DA_INIZIARE',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fase VARCHAR(20) NOT NULL, -- Modificato per accettare entrambi i tipi di fase come stringa
    FOREIGN KEY (id_prova) REFERENCES prove(id_prova) ON DELETE CASCADE,
    FOREIGN KEY (id_atleta_rosso) REFERENCES atleti(id_atleta),
    FOREIGN KEY (id_atleta_bianco) REFERENCES atleti(id_atleta)
);

-- Ricrea la tabella voti_incontro
CREATE TABLE voti_incontro (
    id_voto INT AUTO_INCREMENT PRIMARY KEY,
    id_incontro INT NOT NULL,
    numero_arbitro INT NOT NULL,
    voto ENUM('ROSSO', 'BIANCO') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_incontro) REFERENCES incontri_prova(id_incontro) ON DELETE CASCADE,
    UNIQUE KEY unique_voto (id_incontro, numero_arbitro)
);

-- Ricrea la vista con il nuovo nome (ex classifica_societa)
DROP VIEW IF EXISTS vista_societa;
CREATE VIEW vista_societa AS
WITH RankingSocieta AS (
    SELECT 
        s.id_societa,
        s.nome_societa,
        s.pagato,
        s.resto_consegnato,
        COUNT(DISTINCT a.id_atleta) as numero_atleti,
        COUNT(DISTINCT i.id_iscrizione) as numero_iscrizioni,
        COUNT(DISTINCT CASE WHEN i.confermata = 1 THEN i.id_iscrizione END) as numero_iscrizioni_confermate,
        CAST(COALESCE((
            SELECT ig.quota_iscrizione 
            FROM impostazioni_gara ig 
            WHERE ig.id = 1
        ) * COUNT(DISTINCT CASE WHEN i.confermata = 1 THEN i.id_iscrizione END), 0) AS DECIMAL(10,2)) as importo_dovuto,
        -- Calcolo del resto da consegnare
        CAST((s.pagato - COALESCE((
            SELECT ig.quota_iscrizione 
            FROM impostazioni_gara ig 
            WHERE ig.id = 1
        ) * COUNT(DISTINCT CASE WHEN i.confermata = 1 THEN i.id_iscrizione END), 0) - s.resto_consegnato) AS DECIMAL(10,2)) as resto_da_consegnare,
        COALESCE(SUM(
            CASE 
                WHEN cf.id_atleta IS NOT NULL THEN 
                    COALESCE((
                        SELECT ps.punti 
                        FROM punteggi_societa ps 
                        WHERE ps.posizione = cf.posizione
                    ), 0)
                ELSE 0
            END
        ), 0) as punteggio_totale,
        DENSE_RANK() OVER (
            ORDER BY 
                COALESCE(SUM(
                    CASE 
                        WHEN cf.id_atleta IS NOT NULL THEN 
                            COALESCE((
                                SELECT ps.punti 
                                FROM punteggi_societa ps 
                                WHERE ps.posizione = cf.posizione
                            ), 0)
                        ELSE 0
                    END
                ), 0) DESC
        ) as posizione_classifica
    FROM societa s
    LEFT JOIN atleti a ON s.id_societa = a.id_societa
    LEFT JOIN iscrizioni i ON a.id_atleta = i.id_atleta
    LEFT JOIN classifiche_finali cf ON a.id_atleta = cf.id_atleta
    GROUP BY 
        s.id_societa,
        s.nome_societa
)
SELECT 
    id_societa,
    nome_societa,
    numero_atleti,
    numero_iscrizioni,
    numero_iscrizioni_confermate,  -- Aggiunto questo campo nel SELECT
    importo_dovuto,
    pagato,
    resto_consegnato,
    resto_da_consegnare,
    punteggio_totale,
    posizione_classifica
FROM RankingSocieta
ORDER BY 
    posizione_classifica ASC,
    nome_societa ASC;

CREATE VIEW dettaglio_atleti AS
SELECT 
    a.id_atleta,
    a.cognome,
    a.nome,
    s.valore AS sesso,
    a.anno_nascita,
    c.colore AS cintura,
    a.dan,
    a.peso_kg,
    so.nome_societa
FROM 
    atleti a
JOIN 
    cinture c ON a.cintura_id = c.id_cintura
JOIN 
    societa so ON a.id_societa = so.id_societa
JOIN 
    sesso s ON a.sesso = s.id_sesso;

CREATE VIEW atleti_categorie AS
SELECT DISTINCT
    a.id_atleta,
    a.cognome,
    a.nome,
    s.id_sesso AS sesso,
    a.anno_nascita,
    c.colore AS cintura,
    a.dan,
    a.peso_kg,
    so.nome_societa,
    cat.id_categoria,
    cat.nome AS categoria,
    cat.n_ordine,
    i.id_disciplina
FROM 
    iscrizioni i
LEFT JOIN 
    atleti a ON i.id_atleta = a.id_atleta
LEFT JOIN 
    cinture c ON a.cintura_id = c.id_cintura
LEFT JOIN 
    societa so ON a.id_societa = so.id_societa
LEFT JOIN 
    sesso s ON a.sesso = s.id_sesso
LEFT JOIN 
    categorie cat ON cat.id_disciplina = i.id_disciplina
    AND (cat.sesso = a.sesso OR cat.sesso = 'MIXED')
    AND EXISTS (
        SELECT 1 
        FROM categorie_cinture cc 
        WHERE cc.id_categoria = cat.id_categoria 
        AND cc.id_cintura = a.cintura_id
    )
    AND EXISTS (
        SELECT 1 
        FROM categorie_fasce cf 
        JOIN fasce_eta fe ON cf.id_fascia = fe.id_fascia
        WHERE cf.id_categoria = cat.id_categoria 
        AND a.anno_nascita BETWEEN fe.anno_nascita_min AND fe.anno_nascita_max
    )
    AND (cat.peso_min IS NULL OR a.peso_kg >= cat.peso_min)
    AND (cat.peso_max IS NULL OR a.peso_kg <= cat.peso_max);

CREATE VIEW vista_categorie_fasce AS
SELECT 
    cf.id_categoria,
    cf.id_fascia,
    fe.descrizione
FROM 
    categorie_fasce cf
JOIN 
    fasce_eta fe ON cf.id_fascia = fe.id_fascia;

CREATE VIEW vista_categorie_cinture AS
SELECT 
    cc.id_categoria,
    cc.id_cintura,
    c.colore
FROM 
    categorie_cinture cc
JOIN 
    cinture c ON cc.id_cintura = c.id_cintura;

CREATE VIEW vista_atleti AS
SELECT 
    a.id_atleta,
    a.cognome,
    a.nome,
    a.sesso AS sesso,  -- Manteniamo l'id_sesso invece del valore
    s.valore AS sesso_valore, -- Aggiungiamo anche il valore per visualizzazione
    a.anno_nascita,
    c.colore AS cintura,
    a.cintura_id,
    a.dan,
    a.peso_kg,
    so.nome_societa,
    a.id_societa
FROM 
    atleti a
JOIN 
    cinture c ON a.cintura_id = c.id_cintura
JOIN 
    societa so ON a.id_societa = so.id_societa
JOIN 
    sesso s ON a.sesso = s.id_sesso;

CREATE VIEW vista_iscrizioni AS
SELECT 
    i.id_iscrizione,
    a.id_atleta,
    a.cognome,
    a.nome,
    s.valore AS sesso,
    a.anno_nascita,
    c.colore AS cintura,
    a.dan,
    a.peso_kg,
    so.nome_societa,
    cat.nome AS categoria,
    cat.n_ordine,
    i.data_iscrizione,
    i.confermata
FROM 
    iscrizioni i
JOIN 
    atleti a ON i.id_atleta = a.id_atleta
JOIN 
    cinture c ON a.cintura_id = c.id_cintura
JOIN 
    societa so ON a.id_societa = so.id_societa
JOIN 
    categorie cat ON i.id_categoria = cat.id_categoria
JOIN 
    sesso s ON a.sesso = s.id_sesso;

CREATE VIEW richieste_iscrizione AS
SELECT 
    a.id_atleta,
    a.cognome,
    a.nome,
    s.id_sesso AS sesso,
    a.anno_nascita,
    c.colore AS cintura,
    a.dan,
    a.peso_kg,
    so.nome_societa,
    i.id_disciplina
FROM 
    atleti a
JOIN 
    cinture c ON a.cintura_id = c.id_cintura
JOIN 
    societa so ON a.id_societa = so.id_societa
JOIN 
    iscrizioni i ON a.id_atleta = i.id_atleta
JOIN 
    sesso s ON a.sesso = s.id_sesso;

DROP VIEW IF EXISTS richieste_iscrizione_categorie;

CREATE VIEW dettaglio_iscrizioni AS
SELECT 
    i.id_iscrizione,
    i.data_iscrizione,
    i.manuale,
    i.confermata,
    a.id_atleta,
    a.cognome,
    a.nome,
    s.id_sesso AS sesso,
    a.anno_nascita,
    c.colore AS cintura,
    a.dan,
    a.peso_kg,
    so.nome_societa,
    i.id_disciplina,
    i.id_categoria,
    cat.nome AS categoria,
    cat.n_accorpamento,
    acc.nome_accorpamento,
    i.pool         -- Aggiunta questa riga per mostrare il pool
FROM 
    iscrizioni i
LEFT JOIN 
    atleti a ON i.id_atleta = a.id_atleta
LEFT JOIN 
    cinture c ON a.cintura_id = c.id_cintura
LEFT JOIN 
    societa so ON a.id_societa = so.id_societa
LEFT JOIN 
    sesso s ON a.sesso = s.id_sesso
LEFT JOIN 
    categorie cat ON i.id_categoria = cat.id_categoria
LEFT JOIN
    accorpamenti acc ON cat.n_accorpamento = acc.n_accorpamento;

CREATE VIEW iscrizioni_da_confermare AS
SELECT 
    *
FROM 
    dettaglio_iscrizioni
WHERE 
    confermata=0;

    -- Vista per gli atleti senza categoria
CREATE VIEW atleti_senza_categoria AS
SELECT 
    di.*
FROM 
    dettaglio_iscrizioni di
WHERE 
    di.id_categoria IS NULL;

CREATE VIEW categorie_sovrapposte AS
WITH CategorieSovrapposte AS (
    SELECT 
        c1.id_disciplina,
        c1.id_categoria as cat1_id,
        c2.id_categoria as cat2_id,
        c1.nome as cat1_nome,
        c2.nome as cat2_nome
    FROM 
        categorie c1
    JOIN 
        categorie c2 ON c1.id_disciplina = c2.id_disciplina 
        AND c1.id_categoria < c2.id_categoria
    WHERE 
        -- Verifica sovrapposizione sesso
        (c1.sesso = c2.sesso OR c1.sesso = 'MIXED' OR c2.sesso = 'MIXED')
        -- Verifica sovrapposizione peso
        AND (
            (c1.peso_min IS NULL AND c2.peso_min IS NULL)
            OR (c1.peso_max IS NULL AND c2.peso_max IS NULL)
            OR (c1.peso_min <= c2.peso_max AND (c2.peso_min <= c1.peso_max OR c1.peso_max IS NULL))
            OR (c2.peso_min <= c1.peso_max AND (c1.peso_min <= c2.peso_max OR c2.peso_max IS NULL))
        )
        -- Verifica se hanno cinture in comune
        AND EXISTS (
            SELECT 1 
            FROM categorie_cinture cc1
            JOIN categorie_cinture cc2 ON cc1.id_cintura = cc2.id_cintura
            WHERE cc1.id_categoria = c1.id_categoria 
            AND cc2.id_categoria = c2.id_categoria
        )
        -- Verifica se hanno fasce d'età sovrapposte
        AND EXISTS (
            SELECT 1
            FROM categorie_fasce cf1
            JOIN fasce_eta fe1 ON cf1.id_fascia = fe1.id_fascia
            JOIN categorie_fasce cf2 ON cf2.id_categoria = c2.id_categoria
            JOIN fasce_eta fe2 ON cf2.id_fascia = fe2.id_fascia
            WHERE cf1.id_categoria = c1.id_categoria
            AND fe1.anno_nascita_min <= fe2.anno_nascita_max
            AND fe2.anno_nascita_min <= fe1.anno_nascita_max
        )
)
SELECT 
    id_disciplina,
    GROUP_CONCAT(DISTINCT CONCAT(cat1_nome, ' <-> ', cat2_nome)) as categorie_sovrapposte,
    COUNT(*) as numero_sovrapposizioni
FROM 
    CategorieSovrapposte
GROUP BY 
    id_disciplina;

CREATE VIEW tab_iscrizioni_con_dettagli AS
SELECT 
    i.id_iscrizione,
    i.data_iscrizione,
    a.id_atleta,
    a.cognome,
    a.nome,
    s.valore AS sesso,
    a.anno_nascita,
    c.colore AS cintura,
    a.dan,
    a.peso_kg,
    so.nome_societa,
    i.id_disciplina,
    i.id_categoria,
    cat.nome AS categoria,
    i.manuale,
    i.confermata
FROM 
    iscrizioni i
JOIN 
    atleti a ON i.id_atleta = a.id_atleta
JOIN 
    cinture c ON a.cintura_id = c.id_cintura
JOIN 
    societa so ON a.id_societa = so.id_societa
LEFT JOIN 
    categorie cat ON i.id_categoria = cat.id_categoria
JOIN 
    discipline d ON i.id_disciplina = d.id_disciplina
JOIN 
    sesso s ON a.sesso = s.id_sesso;

-- Rimuovi la vista se esiste già e ricreala
DROP VIEW IF EXISTS vista_matrice_iscrizioni;
CREATE VIEW vista_matrice_iscrizioni AS
WITH GruppiCinture AS (
    SELECT DISTINCT
        cat.id_categoria,
        cat.id_disciplina,
        cat.sesso,
        cat.n_ordine,
        MAX(c.kyu) as max_kyu,  -- Il kyu più alto (cintura più bassa)
        GROUP_CONCAT(DISTINCT c.colore ORDER BY c.kyu DESC SEPARATOR ', ') as gruppo_cinture
    FROM 
        categorie cat
    JOIN 
        categorie_cinture cc ON cat.id_categoria = cc.id_categoria
    JOIN 
        cinture c ON cc.id_cintura = c.id_cintura
    GROUP BY 
        cat.id_categoria,
        cat.id_disciplina,
        cat.sesso,
        cat.n_ordine
),
CategoriaFasceCombinations AS (
    SELECT 
        gc.id_disciplina,
        gc.sesso,
        gc.gruppo_cinture,
        fe.descrizione AS fascia,
        gc.n_ordine,
        gc.id_categoria,
        gc.max_kyu,  -- Cambiato da min_kyu a max_kyu
        fe.anno_nascita_max  -- Added this line to include anno_nascita_max
    FROM 
        GruppiCinture gc
    JOIN 
        categorie_fasce cf ON gc.id_categoria = cf.id_categoria
    JOIN 
        fasce_eta fe ON cf.id_fascia = fe.id_fascia
),
IscrizioniCount AS (
    SELECT 
        cfc.id_disciplina,
        cfc.sesso,
        cfc.gruppo_cinture,
        cfc.fascia,
        cfc.n_ordine,
        cfc.max_kyu,  -- Cambiato da min_kyu a max_kyu
        COUNT(DISTINCT CASE WHEN i.confermata = 1 THEN i.id_iscrizione ELSE NULL END) as numero_iscritti,
        MAX(i.pool) as num_pools  -- Add this line to get max pool number
    FROM 
        CategoriaFasceCombinations cfc
    LEFT JOIN 
        iscrizioni i ON cfc.id_categoria = i.id_categoria
    GROUP BY 
        cfc.id_disciplina,
        cfc.sesso,
        cfc.gruppo_cinture,
        cfc.fascia,
        cfc.n_ordine,
        cfc.max_kyu  -- Cambiato da min_kyu a max_kyu
)
SELECT 
    cfc.id_disciplina,
    cfc.sesso,
    cfc.gruppo_cinture as cinture,
    cfc.n_ordine,
    cfc.fascia,
    cfc.id_categoria,
    cfc.max_kyu,
    cfc.anno_nascita_max,  -- Added this line to include it in the final SELECT
    cat.n_accorpamento,
    acc.nome_accorpamento,
    acc.n_ordine as n_ordine_accorpamento,
    acc.colore,  -- Aggiungiamo il colore dell'accorpamento
    COALESCE(ic.numero_iscritti, 0) as numero_iscritti,
    ic.num_pools  -- Add this to final SELECT
FROM 
    CategoriaFasceCombinations cfc
LEFT JOIN 
    categorie cat ON cfc.id_categoria = cat.id_categoria
LEFT JOIN
    accorpamenti acc ON cat.n_accorpamento = acc.n_accorpamento
LEFT JOIN 
    IscrizioniCount ic ON cfc.id_disciplina = ic.id_disciplina
    AND cfc.sesso = ic.sesso
    AND cfc.gruppo_cinture = ic.gruppo_cinture
    AND cfc.fascia = ic.fascia
    AND cfc.n_ordine = ic.n_ordine
ORDER BY 
    cfc.id_disciplina,
    cfc.sesso,
    cfc.max_kyu DESC,  -- Modifica: ordina per kyu più alto in ordine decrescente
    cfc.anno_nascita_max DESC;  -- Now we can reference the column directly

-- Vista per visualizzare i dettagli dei tabelloni
DROP VIEW IF EXISTS vista_tabelloni;
CREATE OR REPLACE VIEW vista_tabelloni AS
SELECT 
    t.id_tabellone,
    t.codice_tabellone,
    -- Modificato per aggiungere il numero della pool al nome
    CONCAT(
        COALESCE(
            MAX(a.nome_accorpamento),
            MAX(c.nome)
        ),
        CASE 
            WHEN t.pool IS NOT NULL THEN CONCAT(' - Pool ', t.pool)
            ELSE ''
        END
    ) as nome_tabellone,
    t.stato,
    t.data_creazione,
    t.pool,
    t.configurazione_id,
    t.ora_inizio_effettiva,
    t.ora_fine_effettiva,
    t.stampato,
    COALESCE(
        GROUP_CONCAT(DISTINCT a.nome_accorpamento),
        GROUP_CONCAT(DISTINCT 
            CONCAT(
                COALESCE(
                    (SELECT GROUP_CONCAT(DISTINCT cin.colore ORDER BY cin.kyu DESC)
                    FROM categorie_cinture cc
                    JOIN cinture cin ON cc.id_cintura = cin.id_cintura
                    WHERE cc.id_categoria = c.id_categoria), ''
                ),
                ' ',
                COALESCE(
                    (SELECT GROUP_CONCAT(DISTINCT fe.descrizione ORDER BY fe.anno_nascita_max DESC)
                    FROM categorie_fasce cf 
                    JOIN fasce_eta fe ON cf.id_fascia = fe.id_fascia
                    WHERE cf.id_categoria = c.id_categoria), ''
                )
            )
        )
    ) as titolo_categoria,
    GROUP_CONCAT(DISTINCT 
        (SELECT GROUP_CONCAT(DISTINCT fe.descrizione ORDER BY fe.anno_nascita_max DESC)
        FROM categorie_fasce cf
        JOIN fasce_eta fe ON cf.id_fascia = fe.id_fascia
        WHERE cf.id_categoria = c.id_categoria)
    ) as fasce,
    GROUP_CONCAT(DISTINCT 
        (SELECT GROUP_CONCAT(DISTINCT cin.colore ORDER BY cin.kyu DESC)
        FROM categorie_cinture cc
        JOIN cinture cin ON cc.id_cintura = cin.id_cintura
        WHERE cc.id_categoria = c.id_categoria)
    ) as cinture,
    GROUP_CONCAT(
        DISTINCT 
        CONCAT(
            COALESCE(d.valore, ''),
            CASE 
                WHEN c.sesso = 'M' THEN ' MASCHILE'
                WHEN c.sesso = 'F' THEN ' FEMMINILE'
                ELSE ''
            END,
            CASE 
                WHEN i.numero_iscritti IS NOT NULL THEN CONCAT(' (', i.numero_iscritti, ' atleti)')
                ELSE ''
            END
        )
        ORDER BY c.n_ordine 
        SEPARATOR ' | '
    ) as categorie,
    COUNT(DISTINCT tc.id_categoria) as num_categorie,
    COUNT(DISTINCT p.id_prova) as num_prove,
    MAX(c.id_disciplina) as disciplina_principale,
    COALESCE(
        CASE 
            WHEN t.pool IS NULL THEN (
                SELECT COUNT(DISTINCT i2.id_atleta)
                FROM iscrizioni i2
                WHERE i2.id_categoria IN (
                    SELECT tc2.id_categoria 
                    FROM tabelloni_categorie tc2 
                    WHERE tc2.id_tabellone = t.id_tabellone
                )
                AND i2.confermata = 1
                AND (i2.pool IS NULL OR t.pool IS NOT NULL)
            )
            ELSE (
                SELECT COUNT(DISTINCT i2.id_atleta)
                FROM iscrizioni i2
                WHERE i2.id_categoria IN (
                    SELECT tc2.id_categoria 
                    FROM tabelloni_categorie tc2 
                    WHERE tc2.id_tabellone = t.id_tabellone
                )
                AND i2.pool = t.pool
                AND i2.confermata = 1
            )
        END, 
        0
    ) as totale_iscritti
FROM 
    tabelloni t
LEFT JOIN 
    tabelloni_categorie tc ON t.id_tabellone = tc.id_tabellone
LEFT JOIN 
    categorie c ON tc.id_categoria = c.id_categoria
LEFT JOIN 
    prove p ON t.id_tabellone = p.id_tabellone
LEFT JOIN 
    accorpamenti a ON c.n_accorpamento = a.n_accorpamento
LEFT JOIN (
    SELECT 
        i.id_categoria,
        COUNT(DISTINCT i.id_atleta) as numero_iscritti
    FROM 
        iscrizioni i
    WHERE 
        i.confermata = 1
    GROUP BY 
        i.id_categoria
) i ON c.id_categoria = i.id_categoria
LEFT JOIN discipline d ON c.id_disciplina = d.id_disciplina
WHERE 
    (t.pool IS NOT NULL OR NOT EXISTS (
        SELECT 1 
        FROM iscrizioni i3 
        WHERE i3.id_categoria = c.id_categoria 
        AND i3.pool IS NOT NULL
    ))
GROUP BY 
    t.id_tabellone, t.codice_tabellone, t.stato, 
    t.data_creazione, t.pool, t.configurazione_id, t.ora_inizio_effettiva, 
    t.ora_fine_effettiva, t.stampato, c.sesso
ORDER BY 
    CAST(SUBSTRING_INDEX(codice_tabellone, '.', 1) AS SIGNED),
    CAST(SUBSTRING_INDEX(codice_tabellone, '.', -1) AS SIGNED);

-- Modifica la vista vista_prove per includere calcola_totali
DROP VIEW IF EXISTS vista_prove;
CREATE VIEW vista_prove AS
SELECT 
    p.*,
    t.codice_tabellone,
    -- Modificato per usare la stessa logica di vista_tabelloni con collation esplicita
    CONCAT(
        COALESCE(
            MAX(a.nome_accorpamento COLLATE utf8mb4_bin),
            MAX(c.nome COLLATE utf8mb4_bin)
        ),
        CASE 
            WHEN t.pool IS NOT NULL THEN CONCAT(' - Pool ', t.pool)
            ELSE ''
        END
    ) as nome_tabellone,
    t.stato as tabellone_stato,
    d.valore as disciplina,
    MAX(cp.calcola_totali) as calcola_totali,
    -- Gestione durata incontro
    COALESCE(
        MAX(
            CONCAT(
                LPAD(MINUTE(cp.durata_incontro), 2, '0'),
                ':',
                LPAD(SECOND(cp.durata_incontro), 2, '0')
            ) COLLATE utf8mb4_bin
        ),
        '00:00'
    ) as durata_incontro,
    (
        SELECT GROUP_CONCAT(CONCAT(ra.tipo_regola, ':', ra.valore))
        FROM regole_accesso ra
        WHERE ra.id_prova = p.id_prova
    ) as regole,
    GROUP_CONCAT(DISTINCT 
        CONCAT(
            d.valore,
            CASE 
                WHEN c.sesso = 'M' THEN ' MASCHILE'
                WHEN c.sesso = 'F' THEN ' FEMMINILE'
                ELSE ''
            END,
            ' ',
            (SELECT descrizione 
             FROM categorie_fasce cf 
             JOIN fasce_eta fe ON cf.id_fascia = fe.id_fascia 
             WHERE cf.id_categoria = c.id_categoria 
             LIMIT 1), ' ',
            (SELECT GROUP_CONCAT(cin.colore ORDER BY cin.kyu DESC) 
             FROM categorie_cinture cc
             JOIN cinture cin ON cc.id_cintura = cin.id_cintura
             WHERE cc.id_categoria = c.id_categoria)
        )
        ORDER BY c.n_ordine SEPARATOR ' | '
    ) as categorie,
    COALESCE(
        (SELECT COUNT(*) 
         FROM risultati_prove rp 
         WHERE rp.id_prova = p.id_prova), 
        0
    ) + 
    COALESCE(
        (SELECT COUNT(DISTINCT ip.id_incontro) 
         FROM incontri_prova ip 
         WHERE ip.id_prova = p.id_prova 
         AND (
             EXISTS (SELECT 1 FROM voti_incontro vi WHERE vi.id_incontro = ip.id_incontro)
             OR ip.id_atleta_bianco IS NULL -- Conta anche gli incontri con pass automatico
         )
        ), 
        0
    ) as num_risultati,
    COALESCE((
        SELECT COUNT(DISTINCT i.id_atleta)
        FROM iscrizioni i
        JOIN tabelloni_categorie tc ON i.id_categoria = tc.id_categoria
        WHERE tc.id_tabellone = t.id_tabellone
        AND i.confermata = 1
    ), 0) as totale_atleti,
    COALESCE((
        SELECT COUNT(*)
        FROM incontri_prova ip
        WHERE ip.id_prova = p.id_prova
    ), 0) as totale_incontri
FROM 
    prove p
JOIN 
    tabelloni t ON p.id_tabellone = t.id_tabellone
LEFT JOIN
    configurazioni_prove cp ON t.configurazione_id = cp.config_id AND cp.ordine = p.numero_prova
JOIN 
    discipline d ON p.id_disciplina = d.id_disciplina
LEFT JOIN 
    tabelloni_categorie tc ON t.id_tabellone = tc.id_tabellone
LEFT JOIN 
    categorie c ON tc.id_categoria = c.id_categoria
LEFT JOIN 
    accorpamenti a ON c.n_accorpamento = a.n_accorpamento
GROUP BY 
    p.id_prova, 
    p.id_tabellone, 
    t.codice_tabellone, 
    t.nome_tabellone,
    p.numero_prova, 
    p.nome_prova, 
    p.id_disciplina, 
    d.valore, 
    p.stato,
    p.ora_inizio_effettiva, 
    p.ora_fine_effettiva;

DROP VIEW IF EXISTS vista_configurazioni;
CREATE VIEW vista_configurazioni AS
SELECT 
    c.*,
    GROUP_CONCAT(
        CONCAT(
            'disciplina:', p.disciplina,
            ',nome_prova:Prova ', p.ordine,
            ',ordine:', p.ordine,
            ',tipo_tabellone:', p.tipo_tabellone,
            ',template_tabellone:', COALESCE(p.template_tabellone, 'KUMITE_BASE'),
            ',numero_arbitri:', p.numero_arbitri,
            ',is_finale:', IF(p.is_finale, 'true', 'false'),
            ',calcola_totali:', IF(p.calcola_totali, 'true', 'false'),
            ',durata_incontro:', 
            CONCAT(
                LPAD(MINUTE(p.durata_incontro), 2, '0'),
                ':',
                LPAD(SECOND(p.durata_incontro), 2, '0')
            ),
            ',regole:', (
                SELECT GROUP_CONCAT(CONCAT(tipo_regola, ':', valore))
                FROM regole_accesso ra
                WHERE ra.id_prova = p.id
            )
        )
        ORDER BY p.ordine
        SEPARATOR ';'
    ) as prove_config,
    COUNT(p.id) as num_prove
FROM configurazioni_tabelloni c
LEFT JOIN configurazioni_prove p ON c.id = p.config_id
GROUP BY c.id
ORDER BY c.data_creazione DESC;

-- Vista per gli incontri con dettagli
DROP VIEW IF EXISTS vista_incontri;
CREATE OR REPLACE VIEW vista_incontri AS
SELECT 
    i.*,
    ar.cognome as cognome_rosso,
    ar.nome as nome_rosso,
    sr.nome_societa as societa_rosso,
    ar.sesso as sesso_rosso,
    ar.anno_nascita as anno_nascita_rosso,
    cr.colore as cintura_rosso,
    ar.dan as dan_rosso,
    ar.peso_kg as peso_rosso,
    ab.cognome as cognome_bianco,
    ab.nome as nome_bianco,
    sb.nome_societa as societa_bianco,
    ab.sesso as sesso_bianco,
    ab.anno_nascita as anno_nascita_bianco,
    cb.colore as cintura_bianco,
    ab.dan as dan_bianco,
    ab.peso_kg as peso_bianco,
    COALESCE(
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'arbitro', v.numero_arbitro,
                'voto', v.voto
            )
        ),
        JSON_ARRAY()
    ) as voti
FROM 
    incontri_prova i
    LEFT JOIN atleti ar ON i.id_atleta_rosso = ar.id_atleta
    LEFT JOIN societa sr ON ar.id_societa = sr.id_societa
    LEFT JOIN cinture cr ON ar.cintura_id = cr.id_cintura
    LEFT JOIN atleti ab ON i.id_atleta_bianco = ab.id_atleta
    LEFT JOIN societa sb ON ab.id_societa = sb.id_societa
    LEFT JOIN cinture cb ON ab.cintura_id = cb.id_cintura
    LEFT JOIN voti_incontro v ON i.id_incontro = v.id_incontro
GROUP BY
    i.id_incontro,
    i.id_prova,
    i.ordine,
    i.stato,
    i.fase,
    i.id_atleta_rosso,
    ar.cognome,
    ar.nome,
    sr.nome_societa,
    ar.sesso,
    ar.anno_nascita,
    cr.colore,
    ar.dan,
    ar.peso_kg,
    i.id_atleta_bianco,
    ab.cognome,
    ab.nome,
    sb.nome_societa,
    ab.sesso,
    ab.anno_nascita,
    cb.colore,
    ab.dan,
    ab.peso_kg;

-- Vista per gli atleti delle prove
DROP VIEW IF EXISTS vista_atleti_prove;
CREATE OR REPLACE VIEW vista_atleti_prove AS
SELECT DISTINCT 
    a.id_atleta,
    a.cognome,
    a.nome,
    s.nome_societa,
    rp.punteggio,
    rp.note
FROM prove p
JOIN tabelloni_categorie tc ON p.id_tabellone = tc.id_tabellone
JOIN iscrizioni i ON tc.id_categoria = i.id_categoria
JOIN atleti a ON i.id_atleta = a.id_atleta
JOIN societa s ON a.id_societa = s.id_societa
LEFT JOIN risultati_prove rp ON p.id_prova = rp.id_prova AND a.id_atleta = rp.id_atleta
ORDER BY a.cognome, a.nome;
