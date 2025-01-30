
--
-- Dumping data for table `atleti`
--

LOCK TABLES `atleti` WRITE;
/*!40000 ALTER TABLE `atleti` DISABLE KEYS */;
/*!40000 ALTER TABLE `atleti` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `categorie`
--

LOCK TABLES `categorie` WRITE;
/*!40000 ALTER TABLE `categorie` DISABLE KEYS */;
INSERT INTO `categorie` VALUES (1,'KATA MASCHILE FASCIA A BIANCA, BIANCO/GIALLA','KATA','M',NULL,NULL,NULL),(2,'KATA MASCHILE FASCIA B GIALLA, GIALLO/ARANCIO','KATA','M',NULL,NULL,NULL),(3,'KATA MASCHILE FASCIA A BIANCO/GIALLA, GIALLA','KATA','M',NULL,NULL,NULL);
/*!40000 ALTER TABLE `categorie` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `categorie_cinture`
--

LOCK TABLES `categorie_cinture` WRITE;
/*!40000 ALTER TABLE `categorie_cinture` DISABLE KEYS */;
INSERT INTO `categorie_cinture` VALUES (1,1),(1,2),(3,2),(2,3),(3,3),(2,4);
/*!40000 ALTER TABLE `categorie_cinture` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `categorie_fasce`
--

LOCK TABLES `categorie_fasce` WRITE;
/*!40000 ALTER TABLE `categorie_fasce` DISABLE KEYS */;
INSERT INTO `categorie_fasce` VALUES (1,1),(3,1),(2,2);
/*!40000 ALTER TABLE `categorie_fasce` ENABLE KEYS */;
UNLOCK TABLES;


LOCK TABLES `fasce_eta` WRITE;
/*!40000 ALTER TABLE `fasce_eta` DISABLE KEYS */;
INSERT INTO `fasce_eta` VALUES (1,'FASCIA A',2000,2001),(2,'FASCIA B',2002,2003),(3,'FASCIA C',2004,2005),(4,'FASCIA D',2006,2007);
/*!40000 ALTER TABLE `fasce_eta` ENABLE KEYS */;
UNLOCK TABLES;
