/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.20-12.3.3-MariaDB, for Linux (x86_64)
--
-- Host: serverless-europe-west2.sysp0000.db2.skysql.com    Database: alara
-- ------------------------------------------------------
-- Server version	11.8.6-MariaDB-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `attendances`
--

DROP TABLE IF EXISTS `attendances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendances` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `registration_id` int(11) NOT NULL,
  `day_number` int(11) NOT NULL,
  `session_type` enum('MORNING','AFTERNOON') NOT NULL,
  `checkin_time` datetime(3) DEFAULT NULL,
  `status` enum('HADIR','IZIN','ALPA') NOT NULL DEFAULT 'HADIR',
  `selfie_url` varchar(191) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `attendances_registration_id_day_number_session_type_key` (`registration_id`,`day_number`,`session_type`),
  CONSTRAINT `attendances_ibfk_1` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendances`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `attendances` WRITE;
/*!40000 ALTER TABLE `attendances` DISABLE KEYS */;
INSERT INTO `attendances` VALUES
(1,5,1,'MORNING','2026-09-24 15:35:04.586','HADIR',NULL,-6.1474,106.8711,'2026-09-24 15:35:04.588'),
(2,5,1,'AFTERNOON','2026-09-24 15:35:08.801','HADIR',NULL,-6.1474,106.8711,'2026-09-24 15:35:08.802'),
(4,6,1,'MORNING','2026-09-25 17:02:46.942','HADIR',NULL,NULL,NULL,'2026-09-25 17:02:46.943'),
(5,6,1,'AFTERNOON','2026-09-25 17:02:48.058','HADIR',NULL,NULL,NULL,'2026-09-25 17:02:48.059'),
(6,6,2,'MORNING','2026-09-25 17:02:49.080','HADIR',NULL,NULL,NULL,'2026-09-25 17:02:49.081'),
(7,6,2,'AFTERNOON','2026-09-25 17:02:50.089','HADIR',NULL,NULL,NULL,'2026-09-25 17:02:50.090'),
(8,6,3,'MORNING','2026-09-25 17:02:51.211','HADIR',NULL,NULL,NULL,'2026-09-25 17:02:51.213'),
(9,6,3,'AFTERNOON','2026-09-25 17:02:52.203','HADIR',NULL,NULL,NULL,'2026-09-25 17:02:52.204');
/*!40000 ALTER TABLE `attendances` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `batch_tryout_questions`
--

DROP TABLE IF EXISTS `batch_tryout_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `batch_tryout_questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `batch_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `order_index` int(11) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `batch_tryout_questions_batch_id_question_id_key` (`batch_id`,`question_id`),
  KEY `batch_tryout_questions_batch_id_idx` (`batch_id`),
  KEY `batch_tryout_questions_question_id_fkey` (`question_id`),
  CONSTRAINT `batch_tryout_questions_batch_id_fkey` FOREIGN KEY (`batch_id`) REFERENCES `training_batches` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `batch_tryout_questions_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `batch_tryout_questions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `batch_tryout_questions` WRITE;
/*!40000 ALTER TABLE `batch_tryout_questions` DISABLE KEYS */;
/*!40000 ALTER TABLE `batch_tryout_questions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `certificate_signatories`
--

DROP TABLE IF EXISTS `certificate_signatories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificate_signatories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `position` varchar(255) NOT NULL,
  `institution` varchar(255) NOT NULL DEFAULT 'CV. HIKMAT PROTEKSI ALARA',
  `nip` varchar(100) DEFAULT NULL,
  `signature_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificate_signatories`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `certificate_signatories` WRITE;
/*!40000 ALTER TABLE `certificate_signatories` DISABLE KEYS */;
INSERT INTO `certificate_signatories` VALUES
(1,'Fransiskus Asisi Sanyata Putra, ST','Direktur CV. Hikmat Proteksi ALARA','CV. HIKMAT PROTEKSI ALARA',NULL,NULL,1,'2026-09-25 17:46:54.908','2026-09-26 00:53:45.170');
/*!40000 ALTER TABLE `certificate_signatories` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `exam_results`
--

DROP TABLE IF EXISTS `exam_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_results` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `registration_id` int(11) NOT NULL,
  `tryout_score` double DEFAULT NULL,
  `bapeten_theory_score` double DEFAULT NULL,
  `bapeten_practical_score` double DEFAULT NULL,
  `bapeten_interview_score` double DEFAULT NULL,
  `final_status` enum('LULUS','TIDAK_LULUS','REMIDIAL') DEFAULT NULL,
  `certificate_number` varchar(191) DEFAULT NULL,
  `issued_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `signatory_id` int(11) DEFAULT NULL,
  `signed_certificate_name` varchar(191) DEFAULT NULL,
  `signed_certificate_url` varchar(191) DEFAULT NULL,
  `signed_uploaded_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `exam_results_registration_id_key` (`registration_id`),
  UNIQUE KEY `exam_results_certificate_number_key` (`certificate_number`),
  KEY `exam_results_signatory_id_fkey` (`signatory_id`),
  CONSTRAINT `exam_results_ibfk_1` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `exam_results_signatory_id_fkey` FOREIGN KEY (`signatory_id`) REFERENCES `certificate_signatories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_results`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `exam_results` WRITE;
/*!40000 ALTER TABLE `exam_results` DISABLE KEYS */;
INSERT INTO `exam_results` VALUES
(1,6,0,90,90,90,'LULUS','CERT/BAPETEN/2026/00006','2026-09-25 17:14:00.902','2026-09-25 17:14:00.903','2026-09-26 09:11:43.078',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `exam_results` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `footer_settings`
--

DROP TABLE IF EXISTS `footer_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `footer_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `phone` varchar(191) NOT NULL DEFAULT '+62 812-3456-7890',
  `email` varchar(191) NOT NULL DEFAULT 'info@hikmatproteksi.com',
  `address` varchar(191) NOT NULL DEFAULT 'Indonesia',
  `map_url` text DEFAULT NULL,
  `brand_title` varchar(191) NOT NULL DEFAULT 'ALARA Training System',
  `brand_subtitle` varchar(191) NOT NULL DEFAULT 'CV. Hikmat Proteksi ALARA',
  `brand_description` text NOT NULL DEFAULT 'Lembaga pelatihan proteksi radiasi terakreditasi BAPETEN, berkomitmen menghasilkan tenaga PPR profesional dan kompeten.',
  `institution_name` varchar(191) NOT NULL DEFAULT 'CV. Hikmat Proteksi ALARA',
  `ktun_number` varchar(191) NOT NULL DEFAULT 'No. 07998.722.1.040726',
  `bank_name` varchar(191) NOT NULL DEFAULT 'Mandiri No. 166-00-0733926-0',
  `bank_account_name` varchar(191) NOT NULL DEFAULT 'CV Hikmat Proteksi ALARA',
  `copyright_text` varchar(191) NOT NULL DEFAULT 'CV. Hikmat Proteksi ALARA. Hak Cipta Dilindungi.',
  `footer_ktun_text` varchar(191) NOT NULL DEFAULT 'KTUN BAPETEN No. 07998.722.1.040726',
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `footer_settings`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `footer_settings` WRITE;
/*!40000 ALTER TABLE `footer_settings` DISABLE KEYS */;
INSERT INTO `footer_settings` VALUES
(1,'+62 8237 5730 490','hikmatproteksialara@gmail.com','Jakarta','https://maps.app.goo.gl/AJhm4HXKCCyhFrF26?g_st=aw','ALARA Training System','CV. Hikmat Proteksi ALARA','Lembaga pelatihan proteksi radiasi terakreditasi BAPETEN, berkomitmen menghasilkan tenaga PPR profesional dan kompeten.','CV. Hikmat Proteksi ALARA','No. 07998.722.1.040726','Mandiri No. 166-00-0733926-0','CV Hikmat Proteksi ALARA','CV. Hikmat Proteksi ALARA. Hak Cipta Dilindungi.','KTUN BAPETEN No. 07998.722.1.040726','2026-09-27 08:56:40.595','2026-09-26 16:19:57.868');
/*!40000 ALTER TABLE `footer_settings` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `instructor_assignments`
--

DROP TABLE IF EXISTS `instructor_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `instructor_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `batch_id` int(11) NOT NULL,
  `instructor_id` int(11) NOT NULL,
  `session_name` varchar(191) NOT NULL,
  `teaching_date` datetime(3) NOT NULL,
  `start_time` varchar(191) NOT NULL,
  `end_time` varchar(191) NOT NULL,
  `session_type` enum('THEORY','PRACTICAL','TRYOUT_REVIEW') NOT NULL,
  `teaching_hours` double NOT NULL,
  `confirmed` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `instructor_assignments_batch_id_fkey` (`batch_id`),
  KEY `instructor_assignments_instructor_id_fkey` (`instructor_id`),
  CONSTRAINT `instructor_assignments_ibfk_1` FOREIGN KEY (`instructor_id`) REFERENCES `instructors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `instructor_assignments_ibfk_2` FOREIGN KEY (`batch_id`) REFERENCES `training_batches` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instructor_assignments`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `instructor_assignments` WRITE;
/*!40000 ALTER TABLE `instructor_assignments` DISABLE KEYS */;
INSERT INTO `instructor_assignments` VALUES
(1,3,1,'contoh nama sesi atau materi proteksi radiasi','2026-09-26 03:05:09.395','08:00','16:00','THEORY',4,0,'2026-09-26 03:05:09.397');
/*!40000 ALTER TABLE `instructor_assignments` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `instructor_evaluations`
--

DROP TABLE IF EXISTS `instructor_evaluations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `instructor_evaluations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `batch_id` int(11) NOT NULL,
  `instructor_id` int(11) NOT NULL,
  `participant_id` int(11) NOT NULL,
  `rating_score` double NOT NULL,
  `feedback_notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `instructor_evaluations_batch_id_fkey` (`batch_id`),
  KEY `instructor_evaluations_instructor_id_fkey` (`instructor_id`),
  KEY `instructor_evaluations_participant_id_fkey` (`participant_id`),
  CONSTRAINT `instructor_evaluations_ibfk_1` FOREIGN KEY (`participant_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `instructor_evaluations_ibfk_2` FOREIGN KEY (`instructor_id`) REFERENCES `instructors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `instructor_evaluations_ibfk_3` FOREIGN KEY (`batch_id`) REFERENCES `training_batches` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instructor_evaluations`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `instructor_evaluations` WRITE;
/*!40000 ALTER TABLE `instructor_evaluations` DISABLE KEYS */;
/*!40000 ALTER TABLE `instructor_evaluations` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `instructors`
--

DROP TABLE IF EXISTS `instructors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `instructors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `bapeten_license_no` varchar(191) DEFAULT NULL,
  `license_expiry_date` datetime(3) DEFAULT NULL,
  `iaea_certification` tinyint(1) NOT NULL DEFAULT 0,
  `specialization` enum('PPR_ANALISIS','PPR_BAGASI','PKR_PEKERJA') NOT NULL,
  `bio_summary` text DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `instructors_user_id_key` (`user_id`),
  CONSTRAINT `instructors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instructors`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `instructors` WRITE;
/*!40000 ALTER TABLE `instructors` DISABLE KEYS */;
INSERT INTO `instructors` VALUES
(1,2,'PPR-INSP-2024-009','2028-12-31 00:00:00.000',1,'PPR_ANALISIS','Mantan Inspektur BAPETEN dengan pengalaman 20+ tahun di bidang proteksi radiasi dan keselamatan nuklir. Alumni IAEA Post-Graduate Educational Course.','ACTIVE','2026-09-24 13:55:49.082');
/*!40000 ALTER TABLE `instructors` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `lms_modules`
--

DROP TABLE IF EXISTS `lms_modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `lms_modules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `training_category` enum('PPR_ANALISIS','PPR_BAGASI','PKR_PEKERJA') NOT NULL,
  `day_number` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `content_path` varchar(191) DEFAULT NULL,
  `order_index` int(11) NOT NULL DEFAULT 1,
  `is_published` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `content` longtext DEFAULT NULL,
  `description` text DEFAULT NULL,
  `duration_minutes` int(11) NOT NULL DEFAULT 45,
  `file_name` varchar(191) DEFAULT NULL,
  `file_size` varchar(191) DEFAULT NULL,
  `file_url` varchar(191) DEFAULT NULL,
  `module_type` varchar(191) NOT NULL DEFAULT 'reading',
  `page_count` int(11) NOT NULL DEFAULT 1,
  `training_id` int(11) DEFAULT NULL,
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `video_url` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lms_modules_training_category_day_number_idx` (`training_category`,`day_number`),
  KEY `lms_modules_training_id_fkey` (`training_id`),
  CONSTRAINT `lms_modules_training_id_fkey` FOREIGN KEY (`training_id`) REFERENCES `trainings` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lms_modules`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `lms_modules` WRITE;
/*!40000 ALTER TABLE `lms_modules` DISABLE KEYS */;
INSERT INTO `lms_modules` VALUES
(1,'PPR_ANALISIS',1,'Modul 1.1 - Dasar Fisika Radiasi',NULL,1,1,'2026-09-24 13:55:49.693','<h2>1. Pendahuluan Fisika Radiasi</h2><p>Radiasi pengion adalah radiasi yang memiliki energi cukup untuk melepaskan elektron dari atom atau molekul...</p><h3>Prinsip ALARA</h3><p>As Low As Reasonably Achievable: Justifikasi, Optimisasi, dan Limitasi Dosis.</p>','Pengenalan jenis radiasi pengion, struktur atom, interaksi radiasi dengan materi, dan prinsip proteksi dasar.',45,NULL,NULL,NULL,'reading',5,NULL,'2026-09-26 11:40:49.615',NULL),
(2,'PPR_ANALISIS',1,'Modul 1.2 - Regulasi BAPETEN Perba No. 4/2024',NULL,2,1,'2026-09-24 13:55:49.695','<h2>2. Kerangka Regulasi BAPETEN Terkini</h2><p>BAPETEN menetapkan Nilai Batas Dosis untuk pekerja radiasi sebesar 20 mSv/tahun secara efektif...</p>','Studi mendalam Peraturan BAPETEN No. 4 Tahun 2024 tentang Keselamatan Radiasi dan Nilai Batas Dosis (NBD).',60,NULL,NULL,NULL,'reading',6,NULL,'2026-09-26 11:40:49.622',NULL),
(3,'PPR_ANALISIS',2,'Modul 2.1 - Proteksi Radiasi Spesifik',NULL,3,1,'2026-09-24 13:55:49.697','<h2>3. Proteksi Radiasi Spesifik Industri</h2><p>Pada industri analisis zat radioaktif, sistem perisai (shielding) dan waktu kerja (time) sangat krusial...</p>','Penerapan proteksi radiasi khusus industri analisis dan pemanfaatan zat radioaktif tertutup.',50,NULL,NULL,NULL,'reading',4,NULL,'2026-09-26 11:40:49.625',NULL),
(4,'PPR_ANALISIS',2,'Modul 2.2 - Alat Ukur Radiasi & Dosimetri',NULL,4,1,'2026-09-24 13:55:49.699','<h2>4. Alat Ukur Radiasi & Dosimetri</h2><p>Pelajari demonstrasi kalibrasi alat ukur radiasi dan pembacaan dosimeter saku...</p>','Metodologi kalibrasi surveymeter, penggunaan dosimeter personal (TLD badge, dosimeter saku), dan interpretasi hasil ukur.',55,NULL,NULL,NULL,'video',3,NULL,'2026-09-26 11:40:49.628','https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
(5,'PPR_ANALISIS',3,'Modul 3.1 - Logbook Praktikum Lapangan',NULL,5,1,'2026-09-24 13:55:49.701','<h2>5. Logbook Praktikum</h2><p>Dokumen ini digunakan oleh peserta untuk mencatat laju dosis, kondisi interlock, dan kepatuhan APD.</p>','Tata cara pencatatan dan evaluasi logbook praktikum proteksi radiasi lapangan.',40,NULL,NULL,NULL,'file',2,NULL,'2026-09-26 11:40:49.630',NULL),
(6,'PPR_ANALISIS',3,'Modul 3.2 - Simulasi Ujian BAPETEN',NULL,6,1,'2026-09-24 13:55:49.703','<h2>6. Evaluasi dan Kuis Komprehensif</h2><p>Kerjakan simulasi soal evaluasi sebagai persiapan akhir menjelang ujian kompetensi BAPETEN.</p>','Simulasi dan latihan persiapan ujian kompetensi BAPETEN.',90,NULL,NULL,NULL,'quiz',1,NULL,'2026-09-26 11:40:49.633',NULL),
(7,'PPR_BAGASI',1,'Modul 1.1 - Dasar Fisika Radiasi & Regulasi',NULL,1,1,'2026-09-24 13:55:49.704',NULL,NULL,45,NULL,NULL,NULL,'reading',1,NULL,'2026-09-26 18:35:27.559',NULL),
(8,'PPR_BAGASI',2,'Modul 2.1 - Pengoperasian Alat X-Ray Bagasi',NULL,2,1,'2026-09-24 13:55:49.706',NULL,NULL,45,NULL,NULL,NULL,'reading',1,NULL,'2026-09-26 18:35:27.559',NULL),
(9,'PPR_BAGASI',3,'Modul 3.1 - Praktikum & Simulasi Ujian',NULL,3,1,'2026-09-24 13:55:49.708',NULL,NULL,45,NULL,NULL,NULL,'reading',1,NULL,'2026-09-26 18:35:27.559',NULL);
/*!40000 ALTER TABLE `lms_modules` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `lms_progress`
--

DROP TABLE IF EXISTS `lms_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `lms_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `module_id` int(11) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'in_progress',
  `completed_at` datetime(3) DEFAULT NULL,
  `last_accessed_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `lms_progress_user_id_module_id_key` (`user_id`,`module_id`),
  KEY `lms_progress_user_id_idx` (`user_id`),
  KEY `lms_progress_module_id_idx` (`module_id`),
  CONSTRAINT `lms_progress_module_id_fkey` FOREIGN KEY (`module_id`) REFERENCES `lms_modules` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lms_progress_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lms_progress`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `lms_progress` WRITE;
/*!40000 ALTER TABLE `lms_progress` DISABLE KEYS */;
INSERT INTO `lms_progress` VALUES
(1,8,7,'in_progress',NULL,'2026-09-26 11:49:10.869'),
(2,8,8,'in_progress',NULL,'2026-09-26 12:08:30.530'),
(3,8,9,'in_progress',NULL,'2026-09-26 11:49:05.959'),
(4,6,7,'in_progress',NULL,'2026-09-27 05:05:34.989'),
(5,6,8,'in_progress',NULL,'2026-09-27 05:05:43.358'),
(6,6,9,'in_progress',NULL,'2026-09-27 04:45:59.276');
/*!40000 ALTER TABLE `lms_progress` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `logbooks`
--

DROP TABLE IF EXISTS `logbooks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `logbooks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `registration_id` int(11) NOT NULL,
  `practice_date` datetime(3) NOT NULL,
  `location` varchar(191) NOT NULL,
  `dosis_laju` double DEFAULT NULL,
  `kondisi_interlock` text DEFAULT NULL,
  `penggunaan_dosimeter` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `signed_off_by` int(11) DEFAULT NULL,
  `signed_off_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logbooks`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `logbooks` WRITE;
/*!40000 ALTER TABLE `logbooks` DISABLE KEYS */;
INSERT INTO `logbooks` VALUES
(2,6,'2026-10-17 00:00:00.000','Menara BCA, Fasilitas X-Ray Bagasi',0.12,'Interlock mekanik dan elektrik berfungsi normal, sinar X otomatis mati saat pintu chamber dibukaaa','TLD Barcode No. TLD-8891 + Electronic Personal Dosimeter (EPD) No. EPD-04 (Akumulasi: 0.005 mSv)','Pengukuran paparan radiasi pada 5 titik batas luar permukaan scanner bagasi (depan, belakang, atas, kanan, kiri) berada di bawah ambang batas < 1 µSv/jam.',2,'2026-09-25 16:14:33.289','2026-09-25 16:14:33.290');
/*!40000 ALTER TABLE `logbooks` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `registration_id` int(11) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `bank_name` varchar(191) NOT NULL DEFAULT 'Mandiri',
  `proof_file_path` varchar(191) DEFAULT NULL,
  `payment_date` datetime(3) DEFAULT NULL,
  `sender_name` varchar(191) DEFAULT NULL,
  `status` enum('PENDING','VERIFIED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `rejection_note` text DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL,
  `verified_at` datetime(3) DEFAULT NULL,
  `invoice_number` varchar(191) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `payments_invoice_number_key` (`invoice_number`),
  KEY `payments_registration_id_fkey` (`registration_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES
(1,6,4000000.00,'Mandiri','/uploads/payments/payment_6_1790349682164.pdf','2026-09-25 00:00:00.000','Suparlan','VERIFIED',NULL,1,'2026-09-25 15:29:51.222','INV/ALARA/2026/0006/1','2026-09-25 15:21:22.173');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category` enum('PPR_ANALISIS','PPR_BAGASI','PKR_PEKERJA') NOT NULL,
  `topic` varchar(191) NOT NULL,
  `question_text` text NOT NULL,
  `option_a` text NOT NULL,
  `option_b` text NOT NULL,
  `option_c` text NOT NULL,
  `option_d` text NOT NULL,
  `option_e` text DEFAULT NULL,
  `correct_answer` varchar(191) NOT NULL,
  `explanation` text DEFAULT NULL,
  `difficulty` int(11) NOT NULL DEFAULT 1,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `image_url` varchar(191) DEFAULT NULL,
  `training_id` int(11) DEFAULT NULL,
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `questions_training_id_fkey` (`training_id`),
  CONSTRAINT `questions_training_id_fkey` FOREIGN KEY (`training_id`) REFERENCES `trainings` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES
(1,'PPR_ANALISIS','Regulasi BAPETEN','Berdasarkan Peraturan BAPETEN No. 4 Tahun 2024, Nilai Batas Dosis (NBD) efektif untuk pekerja radiasi adalah...','10 mSv per tahun','20 mSv per tahun rata-rata dalam 5 tahun berturut-turut','50 mSv per tahun','100 mSv dalam 5 tahun','5 mSv per tahun','B','Berdasarkan Perba BAPETEN No. 4 Tahun 2024, NBD dosis efektif untuk pekerja radiasi adalah 20 mSv per tahun rata-rata selama 5 tahun berturut-turut, dengan batas maksimal 50 mSv dalam satu tahun tunggal.',1,1,'2026-09-24 13:55:49.710',NULL,NULL,'2026-09-26 08:02:01.571'),
(2,'PPR_ANALISIS','Fisika Radiasi','Suatu sumber radiasi Co-60 memiliki aktivitas awal 100 Ci. Jika waktu paruh Co-60 adalah 5,27 tahun, berapakah sisa aktivitas sumber tersebut setelah 10,54 tahun?','50 Ci','25 Ci','12,5 Ci','6,25 Ci','10 Ci','B','Menggunakan rumus peluruhan radioaktif: A(t) = A0 × (1/2)^(t / T½) = 100 × (1/2)^(10,54 / 5,27) = 100 × (1/2)^2 = 100 × 0,25 = 25 Ci.',2,1,'2026-09-24 13:55:49.713',NULL,NULL,'2026-09-26 08:02:01.576'),
(3,'PPR_ANALISIS','Efek Biologi Radiasi','Efek stokastik dari radiasi pengion ditandai dengan...','Ada nilai ambang dosis yang jelas','Keparahan efek bergantung pada dosis yang diterima','Probabilitas terjadinya efek bergantung pada dosis tanpa nilai ambang','Efek langsung terlihat dalam waktu singkat setelah penyinaran','Hanya terjadi pada dosis sangat tinggi di atas 1 Gy','C','Efek stokastik (seperti karsinogenesis dan mutasi genetik) tidak memiliki nilai ambang dosis. Probabilitas terjadinya efek meningkat seiring dosis, namun tingkat keparahannya tidak dipengaruhi besarnya dosis.',1,1,'2026-09-24 13:55:49.716',NULL,NULL,'2026-09-26 08:02:01.579'),
(4,'PPR_ANALISIS','Alat Ukur Radiasi','Detektor yang paling sesuai untuk mengukur laju dosis radiasi gamma di lapangan dengan respon real-time dan ketergantungan energi rendah adalah...','Dosimeter TLD (Thermo Luminescent Dosimeter)','Film badge personal','Ionization chamber (kamar ionisasi)','Bubble detector neutron','Etched track detector','C','Kamar ionisasi (ionization chamber) memberikan respon laju dosis gamma/sinar-X yang linier dan presisi secara seketika (real-time) dengan ketergantungan energi yang relatif datar.',2,1,'2026-09-24 13:55:49.719',NULL,NULL,'2026-09-26 08:02:01.582'),
(5,'PPR_ANALISIS','Proteksi Radiasi','Prinsip optimisasi proteksi radiasi dikenal dengan konsep ALARA, yang merupakan akronim dari...','Always Low And Radiation Achievable','As Low As Reasonably Achievable','Applied Limit And Radiation Acceptable','Authorized Level And Radiation Allowance','Achieved Limit As Radiation Allows','B','ALARA (As Low As Reasonably Achievable) adalah prinsip optimisasi proteksi radiasi dengan mempertimbangkan faktor ekonomi dan sosial guna menekan dosis serendah mungkin.',1,1,'2026-09-24 13:55:49.721',NULL,NULL,'2026-09-26 08:02:01.584'),
(6,'PPR_ANALISIS','Keadaan Darurat Radiasi','Langkah pertama yang harus diambil ketika terjadi insiden tumpahan atau kebocoran zat radioaktif cair di laboratorium adalah...','Membersihkan tumpahan segera dengan kain lap tanpa melapor','Mengumpulkan bahan radioaktif ke satu wadah plastik biasa','Mengevakuasi personel, memasang tanda isolasi, dan segera melapor kepada PPR','Membuka seluruh jendela dan pintu ruangan selebar-lebarnya','Menunggu cairan mengering sebelum mengambil tindakan','C','SOP darurat kontaminasi: 1) Evakuasi personil dari area terkontaminasi, 2) Isolasi ruangan agar tidak menyebar, 3) Laporkan seketika kepada Petugas Proteksi Radiasi (PPR) untuk tindakan terkoordinasi.',2,1,'2026-09-24 13:55:49.724',NULL,NULL,'2026-09-26 08:02:01.587'),
(7,'PPR_BAGASI','Regulasi BAPETEN','Petugas operator mesin sinar-X pemindai bagasi (cabin / cargo X-ray) dalam ketenaganukliran diklasifikasikan sebagai...','Masyarakat umum non-radiasi','Pekerja radiasi yang wajib memperoleh pelatihan proteksi dan pemantauan dosis','Pekerja magang tanpa pengawasan','Inspektur keselamatan BAPETEN','Tenaga medis radiologi','B','Operator pesawat sinar-X bagasi bekerja di lingkungan sumber radiasi pengion, sehingga berstatus Pekerja Radiasi yang berhak dan wajib mendapatkan pelatihan proteksi radiasi serta pemantauan dosis perorangan.',1,1,'2026-09-24 13:55:49.726',NULL,NULL,'2026-09-26 08:02:01.589'),
(8,'PPR_BAGASI','Keselamatan Sinar-X Bagasi','Sesuai standar keselamatan BAPETEN, batas laju kebocoran radiasi pada jarak 5 cm dari permukaan eksternal mesin sinar-X bagasi tidak boleh melebihi...','5 µSv/jam (0,5 mR/jam)','50 µSv/jam (5 mR/jam)','100 µSv/jam (10 mR/jam)','1 mSv/jam','10 mSv/jam','A','Berdasarkan standar proteksi radiasi untuk pesawat sinar-X bagasi tertutup (cabinet X-ray system), laju dosis kebocoran di luar kabinet pada jarak 5 cm dari permukaan tidak boleh melampaui 5 µSv/jam (0,5 mR/jam).',2,1,'2026-09-26 08:02:01.591',NULL,NULL,'2026-09-26 08:02:01.591'),
(9,'PPR_BAGASI','Komponen & Perisai','Tirai bertimbal (lead curtains) yang dipasang pada pintu masuk dan keluar terowongan inspeksi bagasi berfungsi untuk...','Mencegah bagasi tergelincir dari ban berjalan (conveyor belt)','Menahan radiasi hambur (scattered radiation) agar tidak keluar dari terowongan','Membersihkan debu pada permukaan koper penumpang','Mendeteksi bahan peledak secara otomatis','Mengurangi kebisingan suara motor mesin','B','Tirai bertimbal (lead curtains) mengandung ekuivalen Pb tertentu yang berfungsi menahan radiasi hambur sinar-X yang timbul saat berkas utama menumbuk bagasi di dalam terowongan.',1,1,'2026-09-26 08:02:01.594',NULL,NULL,'2026-09-26 08:02:01.594'),
(10,'PPR_BAGASI','Prosedur Operasional','Apabila barang bawaan/koper tersangkut (jammed) di tengah terowongan inspeksi sinar-X, tindakan yang BENAR adalah...','Memasukkan tangan ke dalam terowongan melewati tirai timbal saat generator menyala','Mematikan pembangkit sinar-X (X-ray OFF / Power OFF) terlebih dahulu sebelum mengambil barang','Mendorong koper tersebut menggunakan koper penumpang berikutnya','Meningkatkan tegangan tabung (kV) agar barang terbakar','Membiarkan koper di dalam hingga mesin mati dengan sendirinya','B','Dilarang keras memasukkan anggota tubuh ke dalam terowongan saat sinar-X aktif. Tombol X-ray OFF atau emergency stop harus ditekan terlebih dahulu sebelum melakukan penanganan barang yang tersangkut.',2,1,'2026-09-26 08:02:01.596',NULL,NULL,'2026-09-26 08:02:01.596'),
(11,'PPR_BAGASI','Sistem Keselamatan','Interlock pengaman (safety interlock switch) pada panel penutup mesin sinar-X bagasi berfungsi untuk...','Menghentikan pancaran sinar-X seketika apabila panel penutup dibuka','Mengunci kecepatan conveyor belt','Mengatur ketajaman kontras monitor inspeksi','Menghubungkan sistem ke server pusat keamanan','Menghemat konsumsi daya listrik pendingin','A','Safety interlock switch adalah sistem proteksi otomatis yang memutus sirkuit tegangan tinggi tabung sinar-X sehingga paparan berhenti seketika jika pintu/panel perisai dibuka.',2,1,'2026-09-26 08:02:01.598',NULL,NULL,'2026-09-26 08:02:01.598'),
(12,'PPR_BAGASI','Pemantauan Dosis','Alat pemantau dosis personal yang wajib dipakai oleh operator mesin sinar-X bagasi selama bertugas adalah...','Survey meter analog','TLD badge atau dosimeter saku digital','Pencacah Geiger-Müller genggam','Monitor kontaminasi tangan dan kaki','Termometer infra merah','B','Operator wajib mengenakan dosimeter perorangan (seperti TLD badge, film badge, atau electronic personal dosimeter / EPD) yang disematkan pada pakaian kerja di bagian dada.',1,1,'2026-09-26 08:02:01.601',NULL,NULL,'2026-09-26 08:02:01.601'),
(13,'PKR_PEKERJA','Prinsip Dasar Proteksi','Tiga prinsip dasar proteksi radiasi terhadap sumber radiasi eksterna adalah...','Waktu, Jarak, dan Penahan (Perisai)','Tekanan, Suhu, dan Volume','Aktivitas, Massa, dan Kecepatan','Tegangan, Arus, dan Hambatan','Ventilasi, Pencahayaan, dan Kerapatan','A','Proteksi radiasi eksterna berlandaskan 3 pilar: 1) Memperpendek waktu penyinaran, 2) Memperjauh jarak dari sumber radiasi, 3) Memasang penahan/perisai (shielding) radiasi yang memadai.',1,1,'2026-09-26 08:02:01.603',NULL,NULL,'2026-09-26 08:02:01.603'),
(14,'PKR_PEKERJA','Regulasi BAPETEN','Berdasarkan regulasi proteksi radiasi BAPETEN, Nilai Batas Dosis (NBD) ekuivalen untuk lensa mata bagi pekerja radiasi adalah...','150 mSv per tahun','20 mSv per tahun (rata-rata 5 tahun berturut-turut)','500 mSv per tahun','50 mSv dalam 10 tahun','1 mSv per tahun','B','Sesuai ketentuan mutakhir BAPETEN dan ICRP 103/118, NBD untuk lensa mata telah diturunkan menjadi 20 mSv/tahun rata-rata dalam 5 tahun berturut-turut tanpa melampaui 50 mSv dalam satu tahun tunggal guna mencegah katarak radiasi.',2,1,'2026-09-26 08:02:01.604',NULL,NULL,'2026-09-26 08:02:01.604'),
(15,'PKR_PEKERJA','Klasifikasi Daerah Kerja','Daerah kerja di fasilitas radiasi yang potensi penerimaan dosisnya memungkinkan pekerja menerima dosis lebih dari 3/10 NBD disebut...','Daerah Supervisi / Pengawasan','Daerah Bebas / Publik','Daerah Pengendalian (Controlled Area)','Daerah Netral','Daerah Karantina','C','Daerah Pengendalian (Controlled Area) adalah area kerja di mana pekerja berpotensi menerima dosis > 3/10 NBD (6 mSv/tahun) sehingga memerlukan pengawasan ketat, pembatasan akses, dan pemantauan dosis khusus.',1,1,'2026-09-26 08:02:01.606',NULL,NULL,'2026-09-26 08:02:01.606'),
(16,'PKR_PEKERJA','Tanda Bahaya Radiasi','Simbol bahaya radiasi pengion internasional (trefoil) memiliki ciri visual berupa...','Segitiga merah dengan gambar api berkobar','Baling-baling berbilah tiga (trefoil) berwarna hitam atau magenta berlatar belakang kuning','Tengkorak putih dengan latar belakang hitam pekat','Lingkaran hijau bergaris silang putih','Bintang sudut lima berwarna oranye','B','Simbol internasional bahaya radiasi adalah trefoil (propeller berbilah tiga simetris) berwarna hitam atau ungu/magenta dengan dasar bidang berwarna kuning terang.',1,1,'2026-09-26 08:02:01.607',NULL,NULL,'2026-09-26 08:02:01.607'),
(17,'PKR_PEKERJA','Alat Pelindung Diri (APD)','Bila pekerja radiasi mengenakan apron bertimbal (lead apron) saat tindakan fluoroskopi, letak pemakaian TLD badge utama yang tepat adalah...','Di kantong celana sebelah belakang','Di dada sebelah dalam apron timbal','Di luar apron pada kerah leher (collar)','Di pergelangan kaki','Diletakkan di meja operator','B','Dosimeter personal utama yang mengukur dosis efektif seluruh tubuh harus dikenakan di bagian dada di balik/di dalam apron timbal (under apron). Jika memakai dosimeter kedua untuk mata/tiroid, dapat dipasang di kerah leher.',2,1,'2026-09-26 08:02:01.610',NULL,NULL,'2026-09-26 08:02:01.610'),
(18,'PPR_ANALISIS','Fisika Radiasi','Laju dosis dari suatu sumber titik radiasi gamma pada jarak 1 meter adalah 100 µSv/jam. Berdasarkan Hukum Kuadrat Terbalik, berapakah laju dosis pada jarak 2 meter dari sumber?','50 µSv/jam','25 µSv/jam','10 µSv/jam','12,5 µSv/jam','200 µSv/jam','B','Hukum Kuadrat Terbalik: I1 × (r1)^2 = I2 × (r2)^2. Sehingga: I2 = I1 × (r1 / r2)^2 = 100 × (1 / 2)^2 = 100 × 1/4 = 25 µSv/jam.',2,1,'2026-09-26 08:02:01.612',NULL,NULL,'2026-09-26 08:02:01.612'),
(19,'PPR_ANALISIS','Proteksi Radiasi','Suatu berkas radiasi gamma memiliki laju dosis awal 80 mGy/jam. Jika Half Value Layer (HVL) perisai timbal untuk energi tersebut adalah 1 cm, berapa ketebalan timbal yang dibutuhkan agar laju dosis turun menjadi 10 mGy/jam?','1 cm','2 cm','3 cm','4 cm','8 cm','C','Laju dosis tereduksi: 80 -> 40 (1 HVL) -> 20 (2 HVL) -> 10 mGy/jam (3 HVL). Karena 1 HVL = 1 cm, maka diperlukan ketebalan 3 × 1 cm = 3 cm timbal.',3,1,'2026-09-26 08:02:01.614',NULL,NULL,'2026-09-26 08:02:01.614'),
(20,'PKR_PEKERJA','Regulasi BAPETEN','Berdasarkan Peraturan Pemerintah dan Perba BAPETEN, batas dosis efektif tahunan bagi anggota masyarakat umum (non-pekerja radiasi) adalah...','1 mSv per tahun','5 mSv per tahun','10 mSv per tahun','20 mSv per tahun','50 mSv per tahun','A','Nilai Batas Dosis (NBD) untuk anggota masyarakat umum adalah 1 mSv per tahun (atau dapat 5 mSv dalam satu tahun tunggal asalkan rata-rata 5 tahun berturut-turut tidak melebihi 1 mSv/tahun).',1,1,'2026-09-26 08:02:01.617',NULL,NULL,'2026-09-26 08:02:01.617');
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `registration_documents`
--

DROP TABLE IF EXISTS `registration_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `registration_documents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `registration_id` int(11) NOT NULL,
  `doc_type` enum('IJAZAH','MCU','KTP','SURAT_KERJA','PASFOTO','NPWP') NOT NULL,
  `file_path` varchar(191) NOT NULL,
  `is_valid` tinyint(1) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL,
  `verified_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `mcu_issue_date` datetime(3) DEFAULT NULL,
  `has_darah` tinyint(1) DEFAULT NULL,
  `has_urine` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `registration_documents_registration_id_fkey` (`registration_id`),
  KEY `registration_documents_verified_by_fkey` (`verified_by`),
  CONSTRAINT `registration_documents_ibfk_1` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `registration_documents_registration_id_fkey` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `registration_documents_verified_by_fkey` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registration_documents`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `registration_documents` WRITE;
/*!40000 ALTER TABLE `registration_documents` DISABLE KEYS */;
INSERT INTO `registration_documents` VALUES
(1,5,'KTP','/uploads/7_5_KTP_1790262349390.png',NULL,NULL,NULL,NULL,'2026-09-24 15:05:49.393',NULL,NULL,NULL),
(2,5,'IJAZAH','/uploads/7_5_IJAZAH_1790262349395.png',NULL,NULL,NULL,NULL,'2026-09-24 15:05:49.398',NULL,NULL,NULL),
(3,5,'MCU','/uploads/7_5_MCU_1790262349400.png',NULL,NULL,NULL,NULL,'2026-09-24 15:05:49.402',NULL,NULL,NULL),
(4,5,'SURAT_KERJA','/uploads/7_5_SURAT_KERJA_1790262349403.png',NULL,NULL,NULL,NULL,'2026-09-24 15:05:49.406',NULL,NULL,NULL),
(5,5,'PASFOTO','/uploads/7_5_PASFOTO_1790262349407.png',NULL,NULL,NULL,NULL,'2026-09-24 15:05:49.409',NULL,NULL,NULL),
(6,5,'NPWP','/uploads/7_5_NPWP_1790262349411.png',NULL,NULL,NULL,NULL,'2026-09-24 15:05:49.413',NULL,NULL,NULL),
(7,6,'KTP','/uploads/8_6_KTP_1790345363957.jpg',1,NULL,1,'2026-09-25 14:48:53.207','2026-09-25 14:09:23.963',NULL,NULL,NULL),
(8,6,'IJAZAH','/uploads/8_6_IJAZAH_1790345363966.jpg',1,NULL,1,'2026-09-25 14:48:53.207','2026-09-25 14:09:23.970',NULL,NULL,NULL),
(9,6,'MCU','/uploads/8_6_MCU_1790345363972.jpg',1,NULL,1,'2026-09-25 14:48:53.207','2026-09-25 14:09:23.976','2026-09-25 00:00:00.000',1,1),
(10,6,'SURAT_KERJA','/uploads/8_6_SURAT_KERJA_1790345363979.jpg',1,NULL,1,'2026-09-25 14:48:53.207','2026-09-25 14:09:23.983',NULL,NULL,NULL),
(11,6,'PASFOTO','/uploads/8_6_PASFOTO_1790345363987.png',1,NULL,1,'2026-09-25 14:48:53.207','2026-09-25 14:09:23.992',NULL,NULL,NULL),
(12,6,'NPWP','/uploads/8_6_NPWP_1790345363996.jpg',1,NULL,1,'2026-09-25 14:48:53.207','2026-09-25 14:09:24.003',NULL,NULL,NULL),
(13,7,'KTP','/uploads/8_7_KTP_1790431627672.png',NULL,NULL,NULL,NULL,'2026-09-26 14:07:07.682',NULL,NULL,NULL),
(14,7,'IJAZAH','/uploads/8_7_IJAZAH_1790431627685.pdf',NULL,NULL,NULL,NULL,'2026-09-26 14:07:07.689',NULL,NULL,NULL),
(15,7,'MCU','/uploads/8_7_MCU_1790431627690.jpeg',NULL,NULL,NULL,NULL,'2026-09-26 14:07:07.693',NULL,NULL,NULL),
(16,7,'SURAT_KERJA','/uploads/8_7_SURAT_KERJA_1790431627695.pdf',NULL,NULL,NULL,NULL,'2026-09-26 14:07:07.699',NULL,NULL,NULL),
(17,7,'PASFOTO','/uploads/8_7_PASFOTO_1790431627701.jpeg',NULL,NULL,NULL,NULL,'2026-09-26 14:07:07.705',NULL,NULL,NULL);
/*!40000 ALTER TABLE `registration_documents` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `registrations`
--

DROP TABLE IF EXISTS `registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `batch_id` int(11) NOT NULL,
  `registration_status` enum('DRAFT','MENUNGGU_VERIFIKASI','APPROVED','REJECTED') NOT NULL DEFAULT 'DRAFT',
  `payment_status` enum('UNPAID','PENDING_VERIFICATION','PAID') NOT NULL DEFAULT 'UNPAID',
  `sponsor_name` varchar(191) DEFAULT NULL,
  `sponsor_npwp` varchar(191) DEFAULT NULL,
  `tempat_lahir` varchar(191) DEFAULT NULL,
  `tanggal_lahir` datetime(3) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `instansi` varchar(191) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `registrations_user_id_fkey` (`user_id`),
  KEY `registrations_batch_id_fkey` (`batch_id`),
  CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `training_batches` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `registrations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `registrations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registrations`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `registrations` WRITE;
/*!40000 ALTER TABLE `registrations` DISABLE KEYS */;
INSERT INTO `registrations` VALUES
(3,6,2,'DRAFT','UNPAID',NULL,NULL,'Jakarta','1977-02-12 00:00:00.000','Sunter',NULL,'2026-09-24 14:25:50.523','2026-09-27 04:36:12.712'),
(4,7,3,'DRAFT','UNPAID',NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-24 14:44:57.351','2026-09-24 14:44:57.351'),
(5,7,2,'MENUNGGU_VERIFIKASI','PENDING_VERIFICATION','PT. Anging Mamiri','12345432154356','Jakarta','1973-02-12 00:00:00.000','Sunter Jakarta Utara','PT. Anging Mamiri','2026-09-24 15:05:49.385','2026-09-26 16:03:10.259'),
(6,8,2,'APPROVED','PAID',NULL,NULL,'Jakarta','1992-02-12 00:00:00.000','Jl. Sunter Jaya VI-A Jakarta Utara','RSUD Kemayoran','2026-09-25 14:09:23.952','2026-09-25 15:29:51.224'),
(7,8,1,'MENUNGGU_VERIFIKASI','PENDING_VERIFICATION',NULL,NULL,'Jakarta','1992-02-12 00:00:00.000','Jl. Sunter Jaya VI-A Jakarta Utara','RSUD Kemayoran','2026-09-26 14:07:07.665','2026-09-26 14:07:07.665'),
(8,29,1,'MENUNGGU_VERIFIKASI','PENDING_VERIFICATION',NULL,NULL,'Jakarta','2000-03-20 00:00:00.000','Jl Pertanian Tengah No 32 Klender Duren Sawit','Alara','2026-09-27 05:39:29.618','2026-09-27 05:39:29.618');
/*!40000 ALTER TABLE `registrations` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `slides`
--

DROP TABLE IF EXISTS `slides`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `slides` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `image_url` text NOT NULL,
  `link_url` text DEFAULT NULL,
  `is_tampil` int(11) NOT NULL DEFAULT 1,
  `order_index` int(11) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `slides`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `slides` WRITE;
/*!40000 ALTER TABLE `slides` DISABLE KEYS */;
INSERT INTO `slides` VALUES
(1,'Pelatihan PPR Lingkup Pemindai Bagasi','/uploads/slides/flyer-ppr-bagasi.jpg','/pendaftaran',1,1,'2026-09-26 17:29:52.658','2026-09-26 17:29:52.658'),
(2,'Pelatihan PPR Lingkup Analisis XRF','/uploads/slides/flyer-ppr-analisis.jpg','/pendaftaran',1,2,'2026-09-26 17:29:52.658','2026-09-26 17:29:52.658'),
(3,'Apa itu PPR','/uploads/slides/slide_1790469317079_apa-itu-PPR.png','/pendaftaran',1,3,'2026-09-27 00:35:30.152','2026-09-27 00:35:30.152'),
(4,'Tugas PPR','/uploads/slides/slide_1790469353022_tugas_PPR.png','/pendaftaran',1,4,'2026-09-27 00:35:58.133','2026-09-27 00:35:58.133'),
(5,'Peran PPR','/uploads/slides/slide_1790469365459_peran_PPR.png','/pendaftaran',1,5,'2026-09-27 00:36:09.435','2026-09-27 00:36:09.435'),
(6,'Pelatihan bagasi','/uploads/slides/slide_1790469377418_pelatihan_bagasi.jpg','/pendaftaran',1,6,'2026-09-27 00:36:21.218','2026-09-27 00:36:21.218'),
(7,'Pelatihan analisis','/uploads/slides/slide_1790469390302_pelatihan_analisis.jpg','/pendaftaran',1,7,'2026-09-27 00:36:34.203','2026-09-27 00:36:34.203');
/*!40000 ALTER TABLE `slides` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `training_batches`
--

DROP TABLE IF EXISTS `training_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `training_batches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `training_id` int(11) NOT NULL,
  `batch_number` int(11) NOT NULL,
  `start_date` datetime(3) NOT NULL,
  `end_date` datetime(3) NOT NULL,
  `quota` int(11) NOT NULL,
  `location` varchar(191) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `status` enum('RENCANA','PELAKSANAAN','SELESAI') NOT NULL DEFAULT 'RENCANA',
  `tryout_duration_minutes` int(11) DEFAULT 60,
  `tryout_end_time` datetime(3) DEFAULT NULL,
  `tryout_open` tinyint(1) NOT NULL DEFAULT 0,
  `tryout_start_time` datetime(3) DEFAULT NULL,
  `tryout_question_count` int(11) DEFAULT 20,
  `tryout_selection_mode` varchar(191) NOT NULL DEFAULT 'AUTOMATIC',
  `documentation_title` varchar(255) DEFAULT NULL,
  `documentation_url` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `training_batches_training_id_fkey` (`training_id`),
  CONSTRAINT `training_batches_training_id_fkey` FOREIGN KEY (`training_id`) REFERENCES `trainings` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `training_batches`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `training_batches` WRITE;
/*!40000 ALTER TABLE `training_batches` DISABLE KEYS */;
INSERT INTO `training_batches` VALUES
(1,1,1,'2026-10-15 00:00:00.000','2026-10-17 00:00:00.000',20,'CV. Hikmat Proteksi ALARA, Jakarta','2026-09-24 13:55:49.683','PELAKSANAAN',30,'2026-09-26 09:52:10.370',0,'2026-09-26 09:51:55.257',20,'AUTOMATIC',NULL,NULL),
(2,2,1,'2026-10-22 00:00:00.000','2026-10-24 00:00:00.000',25,'Menara BCA, Jakarta Pusat','2026-09-24 13:55:49.688','PELAKSANAAN',30,'2026-09-26 09:51:42.901',0,'2026-09-26 09:51:05.074',20,'AUTOMATIC',NULL,NULL),
(3,3,1,'2026-09-09 00:00:00.000','2026-09-11 00:00:00.000',30,'CV. Hikmat Proteksi ALARA, Jakarta','2026-09-24 13:55:49.691','SELESAI',60,NULL,0,NULL,20,'AUTOMATIC',NULL,NULL),
(4,3,2,'2026-09-28 00:00:00.000','2026-09-30 00:00:00.000',20,NULL,'2026-09-26 14:13:28.182','RENCANA',60,NULL,0,NULL,20,'AUTOMATIC',NULL,NULL),
(5,3,3,'2026-10-05 00:00:00.000','2026-10-07 00:00:00.000',20,'Petamburan','2026-09-26 14:14:01.418','RENCANA',60,NULL,0,NULL,20,'AUTOMATIC',NULL,NULL);
/*!40000 ALTER TABLE `training_batches` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `training_competency_units`
--

DROP TABLE IF EXISTS `training_competency_units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `training_competency_units` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `training_id` int(11) NOT NULL,
  `section_code` varchar(191) NOT NULL DEFAULT 'A',
  `section_title` varchar(191) NOT NULL,
  `unit_no` varchar(191) NOT NULL,
  `mata_ajar` text NOT NULL,
  `kode` varchar(191) NOT NULL,
  `kode_kompetensi` text DEFAULT NULL,
  `jp` int(11) NOT NULL DEFAULT 2,
  `order_index` int(11) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `training_competency_units_training_id_section_code_idx` (`training_id`,`section_code`),
  CONSTRAINT `training_competency_units_training_id_fkey` FOREIGN KEY (`training_id`) REFERENCES `trainings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `training_competency_units`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `training_competency_units` WRITE;
/*!40000 ALTER TABLE `training_competency_units` DISABLE KEYS */;
INSERT INTO `training_competency_units` VALUES
(1,1,'A','MATERI PELATIHAN KOMPETENSI DASAR','1.','Fundamental Radioaktivitas & Dosimetri Radiasi Analisis','SI-PPR-ANALISIS-HP-ALARA-01','-',2,1,'2026-09-26 06:34:22.898','2026-09-26 06:34:22.898'),
(2,1,'A','MATERI PELATIHAN KOMPETENSI DASAR','2.','Efek Biologi Radiasi Pengion pada Tubuh','SI-PPR-ANALISIS-HP-ALARA-02','-',2,2,'2026-09-26 06:34:22.901','2026-09-26 06:34:22.901'),
(3,1,'B','MATERI PELATIHAN UTAMA: KOMPETENSI INTI','1.','Peralatan Analisis Radiasi (XRF, XRD, Gauging) & Potensi Bahaya','SI-PPR-ANALISIS-HP-ALARA-03','C.26PPR00.035.1',2,3,'2026-09-26 06:34:22.903','2026-09-26 06:34:22.903'),
(4,1,'B','MATERI PELATIHAN UTAMA: KOMPETENSI INTI','2.','Prinsip Dasar & Tujuan Proteksi Radiasi pada Fasilitas Analisis','SI-PPR-ANALISIS-HP-ALARA-04','C.26PPR00.030.1',2,4,'2026-09-26 06:34:22.904','2026-09-26 06:34:22.904'),
(5,1,'B','MATERI PELATIHAN UTAMA: KOMPETENSI INTI','3.','Pengendalian Paparan dan Pemantauan Daerah Kerja Analisis','SI-PPR-ANALISIS-HP-ALARA-05','C.26PPR00.031.1',2,5,'2026-09-26 06:34:22.907','2026-09-26 06:34:22.907'),
(6,1,'B','MATERI PELATIHAN UTAMA: KOMPETENSI INTI','4.','Implementasi & Audit Program Proteksi Radiasi Fasilitas','SI-PPR-ANALISIS-HP-ALARA-07','C.26PPR00.003.1\nC.26PPR00.046.1',4,6,'2026-09-26 06:34:22.909','2026-09-26 06:34:22.909'),
(7,1,'B','MATERI PELATIHAN UTAMA: KOMPETENSI INTI','5.','Penanganan Kedaruratan Radiasi dan Kontaminasi','SI-PPR-ANALISIS-HP-ALARA-08','C.26PPR00.050.1',2,7,'2026-09-26 06:34:22.911','2026-09-26 06:34:22.911'),
(8,1,'B','MATERI PELATIHAN UTAMA: KOMPETENSI INTI','6.','Budaya Keselamatan & Sistem Manajemen Fasilitas Radiasi','SI-PPR-ANALISIS-HP-ALARA-09','-',2,8,'2026-09-26 06:34:22.913','2026-09-26 06:34:22.913'),
(9,1,'C','MATERI PELATIHAN UTAMA: KOMPETENSI PILIHAN','1.','Peraturan Perundang-Undangan Terkait Pemanfaatan SRP Analisis','SI-PPR-ANALISIS-HP-ALARA-06','C.26PPR00.023.1',2,9,'2026-09-26 06:34:22.915','2026-09-26 06:34:22.915'),
(10,1,'D','MATERI PENDUKUNG','1.','Kapita Selekta Pemanfaatan Radiasi Pengion Bidang Analisis','SI-PPR-ANALISIS-HP-ALARA-10','-',2,10,'2026-09-26 06:34:22.916','2026-09-26 06:34:22.916'),
(11,2,'A','MATERI PELATIHAN KOMPETENSI DASAR','1.','Fundamental Radioaktivitas: Peluruhan, Sifat & Dosimetri (Ukuran/ Besaran Radiasi)','SI-PPR-PEMINDAI-HP-ALARA-01','-',2,1,'2026-09-26 06:34:22.921','2026-09-26 06:34:22.921'),
(12,2,'A','MATERI PELATIHAN KOMPETENSI DASAR','2.','Efek Radiasi Terhadap Manusia','SI-PPR-PEMINDAI-HP-ALARA-02','-',2,2,'2026-09-26 06:34:22.923','2026-09-26 06:34:22.923'),
(13,2,'B','MATERI PELATIHAN UTAMA: KOMPETENSI INTI','1.','Peralatan Pemindai Bagasi atau Barang Lainnya Menggunakan SRP: Manfaat, Prinsip Kerja & Potensi Bahayanya','SI-PPR-PEMINDAI-HP-ALARA-03','C.26PPR00.035.1\nC.26PPR00.001.1',2,3,'2026-09-26 06:34:22.925','2026-09-26 06:34:22.925'),
(14,2,'B','MATERI PELATIHAN UTAMA: KOMPETENSI INTI','2.','Prinsip Dasar & Tujuan Proteksi Radiasi','SI-PPR-PEMINDAI-HP-ALARA-04','C.26PPR00.030.1',2,4,'2026-09-26 06:34:22.927','2026-09-26 06:34:22.927'),
(15,2,'B','MATERI PELATIHAN UTAMA: KOMPETENSI INTI','3.','Pengendalian Paparan Kerja dlm Pemanfaatan Tenaga Nuklir Peralatan Pemindai Bagasi atau Barang lainnya menggunakan SRP Melalui Program Proteksi Radiasi','SI-PPR-PEMINDAI-HP-ALARA-05','C.26PPR00.030.1',2,5,'2026-09-26 06:34:22.930','2026-09-26 06:34:22.930'),
(16,2,'B','MATERI PELATIHAN UTAMA: KOMPETENSI INTI','4.','Implementasi Program Proteksi Radiasi','SI-PPR-PEMINDAI-HP-ALARA-07','C.26PPR00.003.1; C.26PPR00.004.1\nC.26PPR00.033.1; C.26PPR00.034.1\nC.26PPR00.036.1; C.26PPR00.037.1\nC.26PPR00.046.1; C.26PPR00.053.1\nC.26PPR00.040.1; C.26PPR00.044.1\nC.26PPR00.049.1; C.26PPR00.052.1',4,6,'2026-09-26 06:34:22.932','2026-09-26 06:34:22.932'),
(17,2,'B','MATERI PELATIHAN UTAMA: KOMPETENSI INTI','5.','Kesiapsiagaan & Tanggap Darurat Radiologi','SI-PPR-PEMINDAI-HP-ALARA-08','C.26PPR00.050.1; C.26PPR00.051.1',2,7,'2026-09-26 06:34:22.934','2026-09-26 06:34:22.934'),
(18,2,'B','MATERI PELATIHAN UTAMA: KOMPETENSI INTI','6.','Sistem Manajemen dan Budaya Keselamatan','SI-PPR-PEMINDAI-HP-ALARA-09','-',2,8,'2026-09-26 06:34:22.936','2026-09-26 06:34:22.936'),
(19,2,'C','MATERI PELATIHAN UTAMA: KOMPETENSI PILIHAN','1.','Peraturan Perundang-Undangan (PUU) Ketenaganukliran dlm Pemanfaatan Pemindai Bagasi atau Barang Lainnya menggunakan SRP','SI-PPR-PEMINDAI-HP-ALARA-06','C.26PPR00.023.1\nC.26PPR00.010.1',2,9,'2026-09-26 06:34:22.939','2026-09-26 06:34:22.939'),
(20,2,'D','MATERI PENDUKUNG','1.','Kapita Selekta','SI-PPR-PEMINDAI-HP-ALARA-10','-',2,10,'2026-09-26 06:34:22.941','2026-09-26 06:34:22.941'),
(21,3,'A','MATERI PELATIHAN KOMPETENSI DASAR','1.','Dasar-Dasar Radiasi Pengion & Satuan Dosis','SI-PKR-PEKERJA-HP-ALARA-01','-',2,1,'2026-09-26 06:34:22.946','2026-09-26 06:34:22.946'),
(22,3,'A','MATERI PELATIHAN KOMPETENSI DASAR','2.','Biologi Radiasi & Nilai Batas Dosis (NBD)','SI-PKR-PEKERJA-HP-ALARA-02','-',2,2,'2026-09-26 06:34:22.948','2026-09-26 06:34:22.948'),
(23,3,'B','MATERI PELATIHAN UTAMA: KOMPETENSI INTI','1.','Alat Pelindung Diri (APD) dan Dosimetri Personal (TLD/Film Badge)','SI-PKR-PEKERJA-HP-ALARA-03','C.26PKR00.010.1',2,3,'2026-09-26 06:34:22.950','2026-09-26 06:34:22.950'),
(24,3,'B','MATERI PELATIHAN UTAMA: KOMPETENSI INTI','2.','SOP Keselamatan Radiasi di Lingkungan Kerja','SI-PKR-PEKERJA-HP-ALARA-04','C.26PKR00.012.1',2,4,'2026-09-26 06:34:22.952','2026-09-26 06:34:22.952'),
(25,3,'B','MATERI PELATIHAN UTAMA: KOMPETENSI INTI','3.','Praktik Proteksi Radiasi: Jarak, Waktu, dan Penahan Radiasi (Shielding)','SI-PKR-PEKERJA-HP-ALARA-05','C.26PKR00.015.1',4,5,'2026-09-26 06:34:22.954','2026-09-26 06:34:22.954'),
(26,3,'B','MATERI PELATIHAN UTAMA: KOMPETENSI INTI','4.','Tindakan Awal Tanggap Darurat di Tempat Kerja','SI-PKR-PEKERJA-HP-ALARA-06','C.26PKR00.018.1',2,6,'2026-09-26 06:34:22.956','2026-09-26 06:34:22.956'),
(27,3,'C','MATERI PELATIHAN UTAMA: KOMPETENSI PILIHAN','1.','Hak dan Kewajiban Pekerja Radiasi Berdasarkan Regulasi BAPETEN','SI-PKR-PEKERJA-HP-ALARA-07','C.26PKR00.005.1',2,7,'2026-09-26 06:34:22.957','2026-09-26 06:34:22.957'),
(28,3,'D','MATERI PENDUKUNG','1.','Kapita Selekta & Evaluasi Pembelajaran Pekerja Radiasi','SI-PKR-PEKERJA-HP-ALARA-08','-',2,8,'2026-09-26 06:34:22.959','2026-09-26 06:34:22.959');
/*!40000 ALTER TABLE `training_competency_units` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `trainings`
--

DROP TABLE IF EXISTS `trainings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `trainings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category` enum('PPR_ANALISIS','PPR_BAGASI','PPR_PENYEGARAN','PKR_PEKERJA') NOT NULL,
  `title` varchar(191) NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `duration_days` int(11) NOT NULL DEFAULT 3,
  `description` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `cert_header_en` varchar(191) DEFAULT NULL,
  `cert_header_id` varchar(191) DEFAULT NULL,
  `cert_subtitle_id` varchar(191) DEFAULT NULL,
  `title_en` varchar(191) DEFAULT NULL,
  `cert_badge` varchar(191) DEFAULT 'BAPETEN',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trainings`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `trainings` WRITE;
/*!40000 ALTER TABLE `trainings` DISABLE KEYS */;
INSERT INTO `trainings` VALUES
(1,'PPR_ANALISIS','Pelatihan Calon PPR Analisis Menggunakan Sumber Radiasi Pengion',7000000.00,3,'Pelatihan untuk calon Petugas Proteksi Radiasi (PPR) bidang analisis menggunakan sumber radiasi pengion. Mencakup teori fisika radiasi, regulasi BAPETEN, prosedur proteksi radiasi, dan praktikum lapangan. Prasyarat: Ijazah minimal D3 Eksakta/Teknik.','2026-09-24 13:55:49.670','LIST OF COMPETENCY UNITS FOR TRAINING OF RADIATION PROTECTION OFFICER IN ANALYSIS USING IONIZING RADIATION','DAFTAR UNIT KOMPETENSI PELATIHAN PETUGAS PPR','ANALISIS MENGGUNAKAN SUMBER RADIASI PENGION','RPO Analysis Using Ionizing Radiation Sources','BAPETEN'),
(2,'PPR_BAGASI','Pelatihan Calon PPR Pemindai Bagasi atau Barang Lainnya Menggunakan Sumber Radiasi Pengion',7000000.00,3,'Pelatihan untuk calon Petugas Proteksi Radiasi (PPR) bidang pemindai bagasi dan barang menggunakan sumber radiasi pengion. Ditujukan untuk teknisi X-ray bagasi di bandara, pelabuhan, atau fasilitas keamanan.','2026-09-24 13:55:49.676','LIST OF COMPETENCY UNITS FOR TRAINING OF RADIATION PROTECTION OFFICER IN BAGGAGE SCANNER USING IONIZING RADIATION','DAFTAR UNIT KOMPETENSI PELATIHAN PETUGAS PPR','PEMINDAI BAGASI ATAU BARANG LAINNYA MENGGUNAKAN SRP','RPO Baggage Scanners or Other Items Using Ionizing Radiation Sources','BAPETEN'),
(3,'PKR_PEKERJA','Pelatihan Proteksi dan Keselamatan Radiasi (PKR) Pekerja Radiasi',0.00,3,'Pelatihan proteksi dan keselamatan radiasi untuk pekerja radiasi: operator, petugas analisis sampel, petugas perawatan, perawat, dan dokter di daerah/fasilitas radiasi.','2026-09-24 13:55:49.679','LIST OF COMPETENCY UNITS FOR TRAINING OF RADIATION PROTECTION AND SAFETY FOR RADIATION WORKERS','DAFTAR UNIT KOMPETENSI PELATIHAN PROTEKSI & KESELAMATAN RADIASI','PEKERJA RADIASI (OPERATOR & PETUGAS FASILITAS)','Radiation Protection and Safety for Radiation Workers','Internal'),
(4,'PPR_PENYEGARAN','Penyegaran PPR',3500000.00,3,'Penyegaran PPR adalah salah satu prasyarat untuk mengikuti ujian perpanjangan masa berlaku Surat Izin Bekerja (SIB) yang saat ini dimiliki PPR agar bisa tetap bekerja sebagai PPR dan izin-izin pemanfaatan yang telah dimiliki Instansi di tempat bekerja bisa tetap berlaku.','2026-09-27 07:13:13.059',NULL,NULL,NULL,NULL,'BAPETEN');
/*!40000 ALTER TABLE `trainings` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `tryout_answers`
--

DROP TABLE IF EXISTS `tryout_answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tryout_answers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `attempt_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `selected_answer` varchar(191) DEFAULT NULL,
  `is_marked` tinyint(1) NOT NULL DEFAULT 0,
  `is_correct` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tryout_answers_attempt_id_question_id_key` (`attempt_id`,`question_id`),
  KEY `tryout_answers_question_id_fkey` (`question_id`),
  CONSTRAINT `tryout_answers_attempt_id_fkey` FOREIGN KEY (`attempt_id`) REFERENCES `tryout_attempts` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `tryout_answers_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tryout_answers`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `tryout_answers` WRITE;
/*!40000 ALTER TABLE `tryout_answers` DISABLE KEYS */;
INSERT INTO `tryout_answers` VALUES
(1,1,18,NULL,0,0),
(2,1,3,NULL,0,0),
(3,1,2,NULL,0,0),
(4,1,1,NULL,0,0),
(5,1,4,NULL,0,0),
(6,1,19,NULL,0,0),
(7,1,6,NULL,0,0),
(8,1,5,NULL,0,0),
(9,1,7,'C',0,0),
(10,2,16,NULL,0,NULL),
(11,2,17,NULL,0,NULL),
(12,2,15,NULL,0,NULL),
(13,2,20,NULL,0,NULL),
(14,2,14,NULL,0,NULL),
(15,2,13,NULL,0,NULL);
/*!40000 ALTER TABLE `tryout_answers` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `tryout_attempts`
--

DROP TABLE IF EXISTS `tryout_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tryout_attempts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `registration_id` int(11) NOT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `submitted_at` datetime(3) DEFAULT NULL,
  `total_score` double DEFAULT NULL,
  `status` enum('LULUS_TRYOUT','BELUM_LULUS') DEFAULT NULL,
  `tab_switch_count` int(11) NOT NULL DEFAULT 0,
  `time_expired` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `tryout_attempts_registration_id_fkey` (`registration_id`),
  CONSTRAINT `tryout_attempts_registration_id_fkey` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tryout_attempts`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `tryout_attempts` WRITE;
/*!40000 ALTER TABLE `tryout_attempts` DISABLE KEYS */;
INSERT INTO `tryout_attempts` VALUES
(1,6,'2026-09-26 08:11:38.657','2026-09-26 09:11:43.071',0,'BELUM_LULUS',1,0),
(2,6,'2026-09-26 09:28:28.442',NULL,NULL,NULL,0,0);
/*!40000 ALTER TABLE `tryout_attempts` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `user_menu_settings`
--

DROP TABLE IF EXISTS `user_menu_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_menu_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `menu_key` varchar(191) NOT NULL,
  `label` varchar(191) NOT NULL,
  `href` varchar(191) NOT NULL,
  `icon_name` varchar(191) DEFAULT NULL,
  `is_visible` tinyint(1) NOT NULL DEFAULT 1,
  `order_index` int(11) NOT NULL DEFAULT 1,
  `description` text DEFAULT NULL,
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_menu_settings_menu_key_key` (`menu_key`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_menu_settings`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `user_menu_settings` WRITE;
/*!40000 ALTER TABLE `user_menu_settings` DISABLE KEYS */;
INSERT INTO `user_menu_settings` VALUES
(1,'dashboard','Dashboard','/dashboard','LayoutDashboard',1,1,'Ringkasan status pendaftaran, pelatihan aktif, pengumuman, dan pintasan utama peserta.','2026-09-26 11:59:53.423','2026-09-26 11:59:53.423'),
(2,'pendaftaran','Pendaftaran','/pendaftaran','ClipboardList',1,2,'Formulir pendaftaran pelatihan baru, pemilihan jadwal angkatan, dan biodata peserta.','2026-09-26 11:59:53.429','2026-09-26 11:59:53.429'),
(3,'dokumen','Dokumen','/dokumen','FileText',1,3,'Unggah dan verifikasi berkas persyaratan (Ijazah, Surat Kerja, MCU Bebas Narkoba, Pasfoto, KTP).','2026-09-26 11:59:53.431','2026-09-26 11:59:53.431'),
(4,'pembayaran','Pembayaran','/pembayaran','CreditCard',1,4,'Informasi rekening tagihan, unggah bukti transfer pembayaran pelatihan, dan status verifikasi bendahara.','2026-09-26 11:59:53.433','2026-09-26 11:59:53.433'),
(5,'lms','LMS / Modul','/lms','BookOpen',1,5,'Materi pembelajaran harian, silabus BAPETEN, modul bacaan, video tutorial, dan unduhan bahan ajar.','2026-09-26 12:08:49.202','2026-09-26 11:59:53.435'),
(6,'presensi','Presensi','/presensi','CalendarCheck',1,6,'Absensi kehadiran harian sesi pagi dan siang disertai verifikasi swafoto (selfie) dan lokasi GPS.','2026-09-26 11:59:53.437','2026-09-26 11:59:53.437'),
(7,'tryout','Tryout','/tryout','MonitorCheck',1,7,'Simulasi ujian daring dengan sistem batas waktu otomatis dan bank soal standar evaluasi BAPETEN.','2026-09-26 11:59:53.439','2026-09-26 11:59:53.439'),
(8,'logbook','Logbook','/logbook','BookMarked',1,8,'Pencatatan aktivitas praktikum lapangan, pemantauan laju dosis radiasi, dan persetujuan instruktur.','2026-09-26 11:59:53.441','2026-09-26 11:59:53.441'),
(9,'sertifikat','Sertifikat','/sertifikat','Award',1,9,'Penerbitan dan pengunduhan sertifikat resmi pelatihan, transkrip unit kompetensi, dan verifikasi QR code.','2026-09-26 11:59:53.443','2026-09-26 11:59:53.443');
/*!40000 ALTER TABLE `user_menu_settings` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(191) NOT NULL,
  `password_hash` varchar(191) DEFAULT NULL,
  `full_name` varchar(191) NOT NULL,
  `nik` varchar(191) DEFAULT NULL,
  `tempat_lahir` varchar(191) DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `phone_number` varchar(191) DEFAULT NULL,
  `alamat_domisili` varchar(500) DEFAULT NULL,
  `instansi` varchar(191) DEFAULT NULL,
  `alamat_instansi` varchar(500) DEFAULT NULL,
  `role` enum('PESERTA','ADMIN','INSTRUCTOR','SPONSOR') NOT NULL DEFAULT 'PESERTA',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `image` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`),
  UNIQUE KEY `users_nik_key` (`nik`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'admin@alara.co.id','$2b$12$5yKn4DilGz6QCQGQ9TICN.UJz2SdWUtbASqX5HQhDWGrJuIjOcjqu','Admin ALARA','3172021202730001','Jakarta','1973-02-12','08123456789','Sunter','ALARA','Kemayoran','ADMIN','2026-09-24 13:55:48.799','2026-09-25 14:15:47.588','/uploads/avatars/avatar-1-1790345712261.jpeg'),
(2,'instructor@alara.co.id','$2b$12$fardUtF2ZIN.b3oLOeS.q.7tLnCae9vAaub2SbOOnQvFHW856LOPO','Ir. H. Expert Proteksi, M.Si.',NULL,NULL,NULL,'08198765432',NULL,NULL,NULL,'INSTRUCTOR','2026-09-24 13:55:49.077','2026-09-24 13:55:49.077',NULL),
(4,'sponsor@alara.co.id','$2b$12$y2CUVFa5uGftR4hM.1KLie7jYSwC7Zyh1t5fBKyd3H5HwaBrKHZNG','PT Medika Radiasi',NULL,NULL,NULL,'02112345678',NULL,NULL,NULL,'SPONSOR','2026-09-24 13:55:49.666','2026-09-24 13:55:49.666',NULL),
(6,'sayasukanta@gmail.com','$2b$12$.gaFSfEzGzRyItaMwxhk1uyOahGpoZl9Bbj5Dbyf1BpRla1JDwcJ.','Sukanta','3172021202770009','Jakarta','1977-02-12','085718993746','Sunter',NULL,NULL,'PESERTA','2026-09-24 14:25:50.521','2026-09-27 04:44:24.834','data:image/png;base64,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d0NuuOEGWlpaOPnkkxu6WnmvrQZp6EaKeDbVnhU1agfE88fx8Qe/qE899dT8mOvXr69ROn6BjI6O8qMf/Sif0BdccMEcPEsxEGuM4Yc//GFNgei2bduw1hJFEevXr2fz5s088cQTudI688wz2bBhA2vXrmXdunVz4iBFl+a2225j27Zt3HXXXbz0pS8FYP369Wzbtq0G7vDoo4+yY8cOtmzZwo033pgf8+1vfzsAt99+OzfffHOesbrzzjvZs2cPv/nNbzjhhBMIw5BHHnmEa665hv/4j/9gx44dbN26le985ztEUUSpVGLt2rVs2rSJnTt3smzZsvz3wzDk6aefZseOHWzfvp3du3ezfft2fvnLX+bjUHR/0zRl5cqViAitra08+eSTucu6du1atNZ87nOfY8+ePezevZsbbriBOI65+uqr5+Cwiun+I+HS1EMS6ufroVjTB13xXHnllcr7rQvBL/QLc9OmTTz55JMopXj/+9/P1772NZYtW8aiRYu48cYbefjhh/n617+OUoqrrroq98W/+tWv5sd46qmnEBEqlQrXXXddDaCtHu/gJ1cx4+KtweJ3DtRhtBjbOeOMMxgZGcFay8aNG3MeHa9Q/A4bBAF/+qd/ijGGn/70p+zevTs/VpLhlYp+u29ZVCqVOPHEE9Fa8+pXvzo/h4GBAbq7u+nt7c1r8AYGBujr62NoaIiurq6agHcxYK61ZnBwkNbWVlatWsX//M//5Eryxz/+cc2u2t7enls7r3/96znrrLPQWrNr1y601rztbW/LLbbNmzezevVqAAYHB7n33ntpa2ujVCpxzTXXEEURcRzT0tLCokWL8rjP0NAQnZ2d+Zh6K9JaS1dXV24BiUh+jCAI8riPr9h/0YtexPT0NG1tbWzYsKHGainG6ACiKOLNb34zO3bsyK2oSqWyYOImxTlZHywXET75yU+qBa94AL7zne8smHIJvxiuv/76PJD3+c9/Pp98fiIcd9xxufsQBAFLliwhDEOuu+66fHL+9V//Nca4lrannnpqPnmLAcGiMvE3cd26ddx6663ceeed3Hbbbdx55501Qc35dh5/3MnJSV73utexdetWlFI8+OCD9PT0zFFoAMcff3xuKZx33nm8613vwlrLW9/6VqIoynduP9lEhI997GMYY3jPe97DzTffTJqmTExMMD4+3hBPo7XOXdWiG1l/7T5wHkVR7l74Y4VhSHt7e43VVxzDJEkYHh4mSRLa29uZmpqira0NYwyf/vSnC5ipgDCM0TrkO9/5V9LU8eCMjIyhdYhSQQ4AdAh1V5sWxy2A+z1vxX3+85/n7/7u7/jsZz/Ll7/8Zb70pS/VBHxFhHK5zGmnncbU1BRKKR555BFKpVKu2FpbWwnDkDAM+eIXv8jSpUt529vexsaNG2us3I6OjgUDEqyfxz5JEQQB//Iv/3JIfu+QOJLve9/71Lvf/W5ZCBrdx1ruv//+/D0PbPQ3vgjo8zfhG9/4Bm9961upVqvs3buX/v5+brvtNgCuuuqqOeDAemRycZL993//Nz/5yU9yv76Yjq9XNPWWTxAEbN++nS1btlAqlahWq0xOTtYom6JbNjw8zJo1azjnnHNYv359/plvfvOb/OAHP6hRDkEQMDw8TLlcRinF1VdfTRiGdHR0UC6Xee9738tNN91Uo0S9dVBUNv66i5tN0dUaHh6ms7OT8fFx3v72/ye3Gi+++GLH6Be7yv1///d/p7OzExHhH//xH9m0aRNhGPL617+emZmZPLZ2wQUXzImrBUHAaaedlp/TyMgIQ0NDNRm+YkyrCBj1SvUrX/nKHOTwRz7ykXxswzAkSRJGRkbysbjnnnty69Af85ZbbuHiiy/OFe/tt9/OWWedhTGGLVu25OMbRdGCyP4WYRrFdL+1lve9732HZBEfMrPkn/7pnxaMNveAwXo/3e/Y9ahUYwxnn312PimuvPJK7rnnnjw464PKxYVfH9vx3/Uo7iRJ8p21+LdnEp/yim1mZgaAs88+G2NmKcvTNKVSqeSUpCtWrODiiy/Ov3/zzTfXmP1FBfHBD34wX4zr16/nkUce4T3veQ9pmrJmzRqq1WpuoRQnadHSmg+75IOkL3/5y1m8eDGrVq3i4YcfJgxDXvKSl7B8+XK0hjStopTwt3/7Gf7P//lLrrji42zZsgmwrFx5El/96leIooA4DlFKePLJ9YgYjElqYkujo6O5wvBKuniP6t0If46VSoU0TTn11FM5+eSTWb16NatXr+aUU07J72vRTfbp8SiKeOc735krNj8Wp512Gtu3b+fGG29k+fLl+XiEYcg555wz534uBJyOH8MisvuGG244dAbBoTrwn//5n6uFguUxxvCOd7wjzw6tW7euJi5TH4/yMYi3vOUtJEnCTTfdxJ/8yZ9gjGHZsmW0tbXNCRoXXYwiujYIAi6//HLGxsbYtm0bu3fvzhfIgWqfvLKM45h//dd/5aabbsozNi7eQZ5F8uUBcRzn7q61losuuoiXvexl+TUVg4fWWm699dZ8Ub3iFa/g4osv5rrrrsvjH9dcc02NBeDdiEagv3rLLU1TZmZmiOM4X8BJkvCFL3yBW265ZY710d/fz+LFi/Ns3tKlS/nFL36BUip3TcIw5G/+5m9y67HIfPlnf/ZneUxm8eLF+Vj482+ERfLZriAIuO2227j11lu55ZZbuOOOO7j99ttrNhivyO666y62bduW43XOO++8HMPkrZwgCHjNa17Dvffey65du3jjG99IkiRs2bKlJsu3kNys+qTDZZddpo46xQPwhS98YcEM7Nvf/vbcYjn//PMZGxvLB7lSqfDiF7+Y7373uzXdM6699tp8p5ycnCSOY6699tp8It5xxx3cfffdNTt/0frx6V4/QYvuR71r4r9fr4T8ZL/00ku54IILeOc734nWOlskt+fnWtx1gyCgVCrxb//2b3zve9+ryZYYY2hpaaFarfLlL3+5ZrH4FHExZuGvt1jvVqlUcuuxXlEWr00pRalU4qGHHsqzO2NjY3zgAx+oydZ5xX/ffffx+OOP8w//8A8opdixYwd33HFH/tlPfOITuRv10Y9+lCRJckX/mc98hgcffBBrLStXrqSlpWXeyvRiyt/HqIqgwWJJhv+Ovw9tbW2sXLmSKIr4+te/ThAEbNy4kWuvvTY/zwsuuIALL7wwDyBba3nlK19Zk30sAh6P9KZcj1hXSvG3f/u3HNWyEEBQHtx2/fXXS09PjyxatEgGBgbk+OOPl+OOO056e3ulp6dHBgcH5dFHH81BU9VqVZYsWSJDQ0PS398vnZ2dYoyRNE3lW9/6lvT09EhfX5/cd999Yq2tAdFVq1VZvHix9PX1yac+9ak5gKz+/n7p7u6WH/3oRyJi5I47bpfu7k7p7++XJEnEisj5F/6+9PZ2y9DQQA0Acvny5TIwMCQ9PX1SLs9ImqZy9rnnSE9fr5xzzjk1v1OU3t5u6e/vlV/96h4REXd+Pb1yxcc/Iak14s7eAfBGR0dlaGixDPQNyrrH1+bHWLJkifT29srrXveG7HzyK3P/rYhNjYyPj0vfQL/09/fL8PBw4foTsTbNf2f37t3S19cj/X09MjY2IlaMpDaRVatWycDAgAz098rM9JQDD1ojL1yxTLq7O6Wvt1sG+vplcHDQAfg6u2RoYFAWL16c3wd/T9asuVN6erqkp6dHrLU1YMx//ud/lr6+PhkYGJD+fne+g4OD+T3v7u4Wa628973vlZ6eHlmyZEk+vmmayite8YoczLlz5075/ve/n4Mh+/r6ZHBwUJYtWya9vb3S29srp512miRJIo8++qj09fVJb2/vglkfRZDmIY+9HuofeNWrXlVjxtXHCQ6H/+p34g9/+MNcd911OUCwXC7nO10URXziE59g1apVNfQe3/72t3NT/o//+I/zc/ff8yUF9Zw2PnBY734UizeVUgRh7IjwwiBvHKF1iMEgWkAlDPT3ZN1IAaV45NHHCRQESnPmmWeigwCT/UvSrDOnz5Bl/GXWpgSh+wGthAceuJ+0mhCI5u8++3cYcc1yHE+wpbunh/6+QbRo/urjfwVYkqRCHEZgVUaK7sJMrmuodeRp4sitJGMxM5Kiw1nskNI640t29BEqyzhpgUBrUgGrAn79wENoAiJCXv6yl7seZErz5FMbueiii1xXD2uxqRCHJTSWk1e9iB3bXeavmmRcS5I6dsSMIVGhHAmbSRw3UKE+qphlrIc+eMulCATVWvPLX/4yBxe+5CUv4Y/+6I+46aab8vlQqVSYmZlBROjq6mLNmjWEYZhblPUu+pFKpxfn6CWXXHLof/MwLX4p4gUaURMc6qh9cdGLCD//+c+5/fbbSZKE173udbziFa/IXbHiRNBa8+1vf5u2tjbe/OY357EUgGuuuYbVq1fz2te+dk6BqYjw4IMPMjw8zOmnn55jSfyEfPDBB5mZmeG008+gtbWVfZPjPPbYY5iKcMGF55EqeGLDWiZH99Le2saLVp9CHLngtFjL5o1b2LdvH3tHRzjr5S/jqU1PMT09TaRKvOTMM1AqowtWjulTtOGxRx8iqVQ4+eRT2DsywejeMTpb21h6/PEE7aWMNdW4jl1G2L17D9WpCpXKNCtWr0AFAU+ue4IoKqF1yPIVL8yuWVA6IVData0JXMvnXz/8EC2tMaesPCWfaKk1jgI5YydMkoSd23dQmZ7mpJUrsYFrDBiIYu/uPSTTZSzCkhe+EFGOzyYONVRTHnjgIZ7cuInly5fz8rNehtKum6koTaADx3AaWFJTZXj3bkxiOX7pcqwVdOg5lCy7du2qwVUlSUIcO05say3HH388MzMzzMzM5Fggr4hEhOnpaaanp1FK0dXVlVf2T09Ps2HDBsbGxnjxi19Mb29vDUJ5cnISEaGtre2IxXsaFbIezGLQI6p4BgcH79+9e/fL6tvkHk6sT30leZEvaH/V5fU3pxHHTH1qtwga9L87fwbL4U6KPeYEqGR3pwRZ/yyFFUugMppfFeaMdiZNCaJw9nAWRFJUGLp+73kCzBDmVKFhDT20qIyt0KhCK06LNQYVBFSBhJSSO1uCrPlhahSeokVhc0J1YyWnFjVGCJTCGtfYIqeRhaw/mCPdUtq3y0oRbMad6PrEi2cQzcDRtlomilsw6JxdOitDdficjALNSBWtNEocOZeIOKuLzCKq41Gq36i8VesD6o0qzxv1la+fG42YMOur0Iv0JsV44OEQH6zv7++/ZHR09JZjQvEA7Ny5UxYtWrRfbXs4BreYFi6mSYsWkTe7D0SVWU+WVf9+/feL5vxsCjOjypQwb46ZmlmEVZApF6HQitf5LO64BVpNEUF7niaTuF7eYVBDlx7g2gpbGzqe80wh5Sky68/XcQMrDdY1x0EhBBhHzy4Z4bQKMtcOxCazFLJBqaYeCZnlRbc2zbikfe/m0HUd9UpFqq5dTcZanFYNYRTlbZudqnYa1hLm/VS95k1NQosqZQo1dRSkJprlYs+UjlPkuiFZ3P7obOcjSZuPXqO4yaUNFN181v/hXh8Hg8R9wSke73L5gX8mPDIHy5Qs7jTzkXU1mgDzkVEVs1DzuYtFOociSdecYykNSvJ921rX0ljllk3WQSXIzJNUQwCJquKa2YSQinNvfAcDm7VpUSCEGRm562Ols7YqXgk4C2Nuuzmv5ETSzEJw5PShdlZCEMSzegP/uUKpK0JOAAAgAElEQVTbG8muVdnZzxevXQDtWKETBNdrdVZ5BPjOMhmHDy4+k6YQBC5OpDBobwIp5zYFga5T0MZdqPFj7prCJhmxvzUpURD+TnOgfhNrRIy2P1L8egU3X+btcCmevOVSGB42fXBY6xquuOKKmjTs4RjUIijQD7LfmeqVSdFlqsf21HPQFK2kem4VH5gudjeoR/o6xafznd2KQSRB6xSlUrD7UGoKZBqlU5LqDFmr0uzGFfpHBbh2xVQA13wQJkGmgQQjCdoTkueKDGaqCRao2jRzoFTexCc1/h4ZoIJimlBVgMQFqQFrJVeOWuvsOjIuapWAdecRhGVQE2DGQCaASbSeRlNFkaBJ8l4TYk2mNHTB1bE5uX4YujGzpppZPVNgJ0CmCMMKShIw1dn2zr4o1nPz57zUYLBZ9wjm1NkV50/93KlPufuNxSukIqSgmEip6cleRyBX764frvXhz+HKK688vAHtwx3Mqlar4ukzD1c17nzmbaNdbj4qyvpdrpE7Vfy9IuVl/S5X83sGdACWatYRVFx/c5kEnS1C1Qr0kFIia/GNEdcuxi3XBCijmML1rbLODaIFoQdLC2INoXZxGWstor3bkqswAmZ1mVa481D7IJnKAsYaqgnEHUA7eU+ugi+XiCUgQaspMFOuR5mddheZ9xMXoMVZRRKDboO0BJRmt0Jda8H47hi5SrBVlKqA9X3QcOdjW4BW0G3YzD10hpfKfblqkhLEGsGgxLX+qY/R1Vscjdz0ItbKB4fn69jxTChNizGfw9keKqM8Uce04sluiByJItLizZ+POnM+E7hoOe2PHe5ApPBz3s9ugVEVAqYg2UJl5Ekk3YNJHM9NlR56XngBsIRq0kIUqUJXSu2sHIbZtflXUNlGS5xiEwWlJfQufSWGgVnWRBVmSXOLxQWTVKZyZlvrZY0KzU7K2+9B2WEqlQRRChVoorbjaV/0e8CA66KJztvCuNaBE4xsvBWpbMEmY8SRwdhKPnaBLpEmQltXPy3tPaj2QSgdB7YLbAcEXVjR6CCa08/QKkGTgoxDeTPjO9dQmdmJoEG1ouhj6OQLQBYhutspF5dEz5rSexc0i/0Q5Ib/fLGeest2vo2p0fP67++/vU7tBnU4lM/BJHD/XeSIsA3ddtttXHTRRQfMIh1sH7eIzKxrx5o/90ql+F7x5h+IkrIejdzIZK55X1wcxNkdI1S2/r+M77qNOJjEpBOEElCVxZT1DG3Hv5o4egFIK5gKhL5J3zTINia3/Iw2/QRVNQISMa1W0rvkNALdB8RIHs+1BAgBGvIIUJZZUziXzYyB2cDYxm/THmxCYQm0pmKgrFfRPrgMVBcoRYq4jqK4uAsMMzV6K3rqYSLGEDVDKIK2LtisgcBqkjGhHKRUTQh2iJ7Bl9P6ov8NrECr3syiSt05ZmOlJXLXq7ax8fHv0GYfIGInqQ2w0ok1i2GiBF0XAR25ASWiazofi2tzOO+9K86DRu1xGr3X6PmBvt9oftSTyx3MdHn9+7feeusRSeMfEcVz8cUXq6LVU+92LfR+6wd3x0kAgw5SYA/ju35Jq32ESKYIqBCFEZPJJHu3/Jy241eB6cJKjA69i2Pc4pR9lGQnrfIUMbuwRIi0ZNaQi9yIUpnr4VvvFvqLZ/EPk1YJwgoEI+x+/H9o10/QYn7rsnWJ0N1SYmQ6hbHHoW8I6HauTe6iBUBKKDuJgo2U7AixrqBTjSVAbIzrWyUonRIxTntLTDKzh+m9k+zYsYUTzvtTCE5BcMW9xver14HL4gVTUH6cVvMYsXmctng0ixJ1YdjHlodv4vjzX4ay/aD972WxLQwO4qifF/Or2CHEl2sUY0ivetWrjshiO2KjHwSB8gAtn3Kt56M59hWQRQcKHVSB3czsegit9tIaVSCpEOmItJJSCg0twRYY+zUEE+gw6zku2sVOsmxWgBBi0KSEkqAlzdJWLp5hSWc9FxVmFoVCxKLEHSbQcRYU3kpl4jFEjRCWII5aCHWETaq0tFR5/KGbQG0FKmgrecbI/UBIIC7lrgNnrVQlIg0HqYQnMalfxJgsYywdIJUBTCWmFCla9E76Wh5k831fAdmGIsGQosMIpUogIYIBxpl6+heUzJOU9DQawRpDFFWI9F5iPQLTW0A7pSvuEw6X5NNbUpfMO4bFI+nrUfPHHXfcETunI6r277rrrnl7ST1fJLWSBYS3s3PzGmJdJk2mCXSIGIUKIoyZIra72LL2VmAU8VaMnsXooAWbtcYNUAQoV1ZQVHJI5lzovPV7PgUyi8Cl4ycxm+6iRW0jDCokBmYqliBsdR1VzQS9HXuhvBbsPrQ1s01KsxMKdYDGYklIRDBhF+2LzqB71ZsYOP3dLDrj3Qyd/idI6zlM2+VUK6DsKBGbaNVbYWZbHii3OAMNW0UH0yDDTE88Tqvei6ZCkgiBhqQyjU1HiYNhRp5eA+wBEmanlEUrzfNNigBFv8Z+8YtfsHPnTvW8VDwXXnihqm/t0ajv1LErmkBHLitVfpySeYognULbCIIOptMIGwRoldDCFC12L6S7UYwjpFi3j+d5AlEaozRGhc7+kSBzp1IUFi04gKDN23dniGGNwWZYoRTCMnu330skWwm0YCSCqJNUldBRTKzKlOzTjGy4xcVbnApFa+twMySzG0oYkOqQVHVC18nQdxF0vha63gjdf0jXGZ+kdeC1EPcRhJY4UEQ6YWzHb4GpzFbLIt96BmQ7M5vuImaMOKgSh06dhlE3QguhSollhHTsIUifdvEqmykuQoTQBaKPWGrl8Eoxne+D5cYYLrnkEnVkZ/4RljAMVSPK0OLjsexqYSsgI+xY9wsis5WQMjrsYKIyQNsJ51OxHaADIl0htCPseORnILtQMlMbHFUqv51+LI1k/pPy2a/i5/3MzFwxlVleehz2ridmN21hGUkNOh5EtZ3MvupijG1FpEIse5DpjWB2QziNSJKHbRHjEYKOdkGUCyCrbmARyAuAZaBPBJbTvvxsklQRaosxCdakTO7bm8WvBJ0hdlAVsFvYtXkNWu0jFUslacfIYuKu06naQYwKKEXTxGYjbL0bZBQdpM7SkVnvSjCz2vcYVzx+E/AwjyiKjrjKXRB251/+5V8WemvbGvDdMe59o/QUmD2Ela10lsYpBWWmk4Bq6SWw9A1U1FKmkxACiPQ4ZvIRkE2gKq40IZ9hGiUQiCEkJVAWpU1WPe7gg1ZlAMSsJkpl9WFiM2Qz+4AtDP/2l4RmnEAsYVBiYrKd0invo/O4N2D0IkIdUKJMYPZQ3v4rYC++Rsr9d0jhQDShRIQ6QjuUIWBceZZXUhrQKWFgscbVnKkoIo46cKn+DMeTVkH2weRa2sJdqGCGirQybV5A5+Ar4YS3MGNPwoZ9JOkkLeEu9u68G9JNwCSoWZfLPi+s6WyB17VT+uQnP7lAbP0FIF/5ylfUnj178qj7oZ8U9hAd01cy7m8LKr6oQLqDqY13UgrGiZghtSnEfRy36g9AXkTUeTqJHsLYgECX6W7Zw8QTvwA7QaA91jgP82RoaOWyRplmsWhf6ZWfgyKdLZ3w9UtMg3kaqutRMolRATOmnbhrFYSrKb3gfKrSh7UxWglBMMGWjXcAW1EqwVhvQfmiWI0STaQ0WmZAxoCdKLUFxVZgI/AkMzvux9pJgkiTGiFNQ4aOOwFsCUShMYTagtrH8PrbiGQHNpkkta2kehksvRD0SqT1RSS2Ex0GBHoK0p3IxJMgww4MaXMnq6al0LEuvr/Znj17uPrqq1VT8RRkcHBQ+VhPEZxVNBmLFd/OFaNuodv8pWQREIvjsTHWJzJM9p7nrTH5BCw+f2b/i3okA935iSzF/2ZWKXlvBJyFETzN+J5fEdpxRAIqtDKt+qDrJFAvpOuUNzKjllMxLWgqSHUzUyOPgIw4RLBPjytFNbWkBBgVYANFao2P/mQwubywKo/LqJoSjCozG26hNdxKVEqZkRLTLKJnye+B6YO2pehoEUZ1Mp0qUDN0xVtdts2MZJaUq8SUKMIghFpDWkEzDtUnYfpuqNwG0z+HsZ8w8dBXmdr+U4J4irIV0K1Y2wady0B3gQ1RaeLKQGa2EaXbaAvG0TZF08lktQ/aTga1hMUnnUui2hFikmpKi6qw4/E7wQ6DmUZr5UJeFpQSV55xLDjsdeuk3tXy3FCDg4MLJqoVLqQB7O/vP3F0dPS3xQrvIlLYB56LqE6ZV49qFLM1Pl4faB3ki9W3R/EIYJXHQjxVhan5e/1jQY/MjVN6d8L/hmSaUoBAY2yFUO/D7LiHtmA7gZnGGkHrDtrauyBUQBmURpdawUSEFoIgoTKzFzv8CHrRcUDfrCIMMgSgdj8ehg32FaklkUCRZYsSkD1MjT5Gpx7G2GlQXSSmhFq83NV9mWn6TlrJyGMPEIcxga4QpzvZ9sQveMHZr3K1VyoGlCMN00BqiZQhoczE5l8x8/QGCDqQNEGradqDKQK1F2tmCEr9lKcHiLtOhdIijAlRWtCqCul2htfdTknGUHqaKNRUqikrTj4ZbALaEvR0EMctJNOG1lJEpTJOC1tg31roWZYXz4oYV4Khn7sr38g6P9wwkCICup7QzK+lpUuXLrC0ygKSsbGxpz70oQ/VNDtrVPXr+Uo88N9mKdeamyEu7oEIYlNXvJ1b10HmbmQ3LE8v1z7mlA/z/b3GxglBIlAaoyxVLAlglIueSJIpLQWoBK0rwDgjW+6h3e4EO41SAXYGOob6gMeAh4AnWXJ8iSSdopIYgkToCFK2PvULUJuYrc0yaJUCVcQm2EqCWJelMkVLUBtE22xsdEZ5OAXsQIZ/Q8QoijJiXKXTQGcLyDYwv4H0Eei0RCWXGUpNhZZgjNhuh+mnUeke5z6SEgUWbasoUyUMLLGtEiZ7aAs306bW0a3X0yWb0GYPgbIEKmI67WMyeCm9p74DcKRZRmWWodqKnVxHEFUdc4cWSi0JdE7B9KNQvh/SJ+lpDymFEUoZgnAfwlrGtv4MGMNqh2PSWoP22S39nBd9/f/DHTz2mSpfH1hUOkmScMUVV7Br164FlcNbUBYPwNe//nX1F3/xF3L66afPqYfxNVOzxZkqc6eoQaKq2plRcC38H9UsKVTwHCdeceqqWg/LKTXBWEsYFaweKmjZAzNPEdlhTDpMFAWgNFEkVDY9xMjaDRC1ofQ+QsZoUeKa0FUEpcaJ9SaYehjalzoFogwq0CiVBZwLSHBNiiL0Z1O72LQAM2A3s33TXXQxTqASVBQzk1ao7NvG5J0/gLAHISWW3dhknLikCAONTadpDabY/PDPWHbOiUAb2ARlhSgMCSSkWp1GBe3oMIMIpFU6IyHUKUoZqmJQOiaM+njhmX8IvBAoZVSlDjBot91NxBaUmkYrTVqpEOppxh/6b2zY5xae3kesdyLJDLEyoBVtLfsYGd9AT7obHS7DWIPWcX5v8hiZaJfl+l0frUKURYl2Y9ngc64YVbvPERS+d3CsoyIhvW9Q6WM7jz/+ONddd92CAw4sOMUD8OIXv1hVKhXxFb/1LH/F5xmGN8uqFA25LJpvrbvhymbo3awuyrNOObq+OSbrfM/rPxeoAqcygskySDqzp0JXYOQCr5kpFlABNcqWx35Oh50gbg2xSYqpVlFxgk2m6Ym6sFYTmARFFSspVZUSa4UK9hHyFLs33s7Qqa8E6QIJ0EEIRoEudilNCKnmKlLl2acEVMi0FVp1BaaeoMRmAjWJsSnGQikMSNO9ROE+rGxzIOm0TKkExqSkxqLDECNT6JnfgtkEQTfogFDHKImpGIsqtVK13ZhoBXHfmSSJYd/4w8SyjcjsIoqEVAuJFVzVewmsQXSa8RRV2bXzV7QG21C2DBkTosgEsdqKtbsJlaVqptBBFYlSAhVhU0EbQ1tQYXTzA/SesIJA9QIB1ha7fNhn/6hc+UctFLr20f9dKfFIyOx7jnCtVvk8+42wvp2P1pozzzxzQaKVFqTiASiVSnk9Vz3hUg1LXB6rsA2jLUosSicO+6IMQb7DZeaJDubEdoqvlSq+760FKbwuFPuhCWvwMtlktBpUD6g2R8TFNJhNyMxTiJqkmiakaUAU9VIxMamNkDSitdSGqc6gtJBqQxxVSGd2ocNpWpVhYvIpqG6DOHZpasmIli1YZdEyDuVHgClceUQxIqlAtdDafgKwh82P/Q8dZhNRVEURU0lbULYbkRitYlKpoI0Q0s5UNUVJhSBKkXSSQE3TXdrNzIZbaFm5ArQrzpipTNPaElG1lgptDJ14DnRf4pRL8nvs/NV3CNQUko5QmS6ThvuYevpB2pcOQbQsownZRzqylljtoS2exiYVLDGGbqy0u1IMa2nRCoIO597KNDaZItYJVGdoiafYvvUuelec5ShGpN2l92UGmHAWn9RlHZ/p4zNBIYrM/bwI2BilHPDx2Vo+RcaEYkV8xhu1YCGSC1bxFIPNXnvXB5nz6u5sp3A43rB2OiiFndzKExt+hJnZik4srUHk6ousYDSkNkGscp0ICBBMzWuVmdCui4LOX1OooheyIJISlFgiDFoEoyKm6efks9+NalnqlFBQYfTxn9ER7KQlTkmSEFVaTFmWYMMVGDWAJWAGISgJcSgkyThTUxsYjA0q2YFRFWK9j70b76R/ZQSUXU0OIaG4XbZNDzP8wD9g6SAQnNIrBMNmGKL/pDdRGuqmmy10xZNgE2ZsC9X4BFTrSYTqBZSrAUHoFG6qBGX3EesRymPr6Aj2gJmEYDNjw79m8ao/BkqYWAg7WjDJKFHUytS0gqAHGALpg6iPjr7tVHdvoSWcoCsIqTLNnqdupn3p8SC9oNqAbWxb///RaSdQUQKSkOhBwr5XMZ0uRsUdBKJIqilKUoiEUHaTjt1HyDZaIsHIOF08AXvuhMFlwOLMLBjjsbv/iZBhtIDBdbuwyntNCmUlf22VK0cpvsbYms/Xf05ZqTlu8f0Z6eeMCy4DFTPLhmQLSY8DS5HUrkjXoRZ4oeOCVjxjY2NPnXDCCTz11FNzXK45NJGNTNTM4NBt7Qz2DxCIQlVSYjTauq6UqRLSQv/s+nqxYsBwPqa4IipYKYtWhjALnxgVUZa+LJaUuI+aPcyMP0l7MIpJKhjppGqOY+iMN0PpDAgWZxNRMhcydSx7ow8yvvZG2tQ+QlJCO8PwjgfoX7nKmfKiQZcQo0lsAEGVjnAXSna5hFdqM0teIVoRsY9S8FumNowQmL0kZtKNbTBES9/ZdJ70WmAJ0DoL+CEBJoEdjN71b8SmTKQmiYIZlB2lunc98cAKrK1ijaVFBZgqKNUOMxF0tIMagGoHHSdfyvDYXcykM0S2jKZMZ7yLnb/+Dxa/fAXQCckGSnYHoUoRacXqdsp2CUOr3kKLelGmJcKCa2OBbaQbAiZ33UUY7EDSKTpL42xfdztL+l4PQbbRhBGnnHIaSu2etULmmhT7f23t7HuNHv0xZzlH8tdG+gvu/LNbI8U6LA8SPOmkkxY8BCBc6Cf49NNPqw996EPyta99rXGf7gz8pjLwXI0pLF4p9DFw/JuzDJAU0uIQHmhnaVS2kU8syRpX4RSFACrNgooOOROK0KVaQLW7HJjsJt31MCU1TkyKpZWK7WcqeBG0/R5wPNBDXn3ur08DfZ3MBLegzT4iqgQqoDsehy33wvFnoFWUlSa0Y1SQzXkhyLxQrSyoFFEBokIHGky3UB7fSkegEDqpEFA2QwyueBNwquP+UXF2zQJUs2B0P11LLmRy22Za2EtkNKG2bH5yDScNtKGtBdtKqDtIJURJezYGoYt8RZ0o08vg6rew+wkomfVEepxYjWPVNvasvYmBU/8XU0/9HM1utA6YqnZBaRGtA2eDWo6wLMMhValBZkpAeNKbmdy2Ex0mCFVaUktJp1DZDW3LUbodpBPV979AVZ+52/S7553mObYQEAHdcyg65utF3yjcUB/z/NjHPsZvf/tb1VQ8BynTtXr1avnwhz9cQ5IkIs61IVM69ekmlSkE1QK0PLsAnt7/lEqVq8wOJctWqKxmSUWzAe6s5khRBh3y+IbNdMtiqkRYFaHbT2Bg8UXACUAfqS0Rqij/jZlsksVqGR2DFzCxM0KlZYIoppy2smVnwvFLB9kzNQCtpxPKKNPVhKil5CaoQGjFVYur1BG3qxCrWigPh5TtEIl0okwVFbZB22pIV4A+Lg/fJ35IpYqSFrTuom3JeWzdej8dQRdYw4zpxpQ6oRJAtJKpFKaTYbRuIY1XYGUROg0dgZnSEPRD79nYzp2Mj4VEdi+htlRsL9V9hv49I+zYa2iJXsjMTJlSSyfTpoflSy4BjsfSgUIQG2G1zbtSBCqASoK0nc3eSkR32wmMl8uUzWLGn9zKitPOROlWUC2IOJbDQ+WZ7I/MbvZvdj/7nq2ptfKc5V75FNtFX3/99QsygzVfNviokQceeEBe8pKX1LRN8SC/opFs5zwzaKpZVqfkLIl8BJ4bZD7NgsqB4NwRnWQKI6rhM66YClFgCTCQjkEwmX07hCSAuB9MDLo1a/8we34Ogx0QUEbJCCQjEKSuTUKqIexAbOgAcTKaXZPvkaPyMShaermVZk1WQ1UIhNMNejHIbPPCJDP0QizWJC51zzSOemIy+34M0uYUfbXsAI1BVr2eRhD2unQ7JYwNUdqgZV/Gm5wULNIWSNoginFEZtOZ66nBxiAdQC+kofNnI7d4jTjskbIJ6BSqo1DKLDQs0IK17WjdjSXOyEOeI5TtuVT3NJx783cs2Z8ie/DBB3npS1961Kzno44YYHh4WAYGBgpBNZvXBRUTmlJThyMoqm5HlNas/Yq/z8++XsfmxQgUFI/JlnmUTyPn3mdlGVnZoyRVlA5BhzlfMfkxXEO8IFCYdIYgdPRe1qRE4gs9Jcvhua6fEkQYMcRKsoJPR2eaZhM5EgNiEVWbBfQ1XCprH6Oy804ywvcgo0o1gmuMl41VStbSV2uUFNPGkKa47g2Cc0W1kBCgFSg7g9ZRpphztmNXCIrBel5om7nNWSfQMAgdhYcKXJo8bxsxG2LzYRQRk/NIo1zHjCBwmCDJimUkyz9qgiOneBoqn/kVT6NWOCLC2NjYYeuH9bxVPACjo6PS09NTF1DM2qrILETZAcRmybxVo8mi7HOcOzoP93hLw8HSwtm/ZorH4hZEalLCIK4b/KycwiQQRFnfKw2SOJg/YdYvymaKLaMyFUWgZpWuIgERtDhMR5rN43BOqCFvOYoRC9q5hl5RpiQEGVWqzla3ZIFU19MqmO1flelxY4TQt8EQTZoYB5xUvq1VSpBhiioImhKRBIgFowxKK8++Q5i5QLPnWwUlmXoMndU6u684I1bPWrnWSA6JmOUyz8ZY6ZxwI3zOVsuhneuNlE7x+dTUFB0dHUfdOj4q6dh6e3tVuVx2WSXRBfvDZmhX5/4omaVVyDFeuACrnzTiuV6exSP+2IUJOMvxV1Q6blH63dWbzdU0cYveryBlXRsZXCsXY1yHT7GulbCbcNmRlesOoZVrkeOOn8U5iuT1Unt+c29/QKDCfCKk2flGShUq3531oWZbj842/LPutwFUkJkfGdQgjIIaw8DZYmFmZ4ROlWZJIU8WL3XT0qaZrlV+81BYDEZyKiFnR/oGqjbJlE1AECh0EGSAcYcWxrj/YqUAuXiOj4dQ6iEkxX5v1Wr1qFQ6R63F46VcnpE4KuF6ss3u4C5GoufiCZWLVoiPb9SVWcjv+FizqlR9XEnPta4kQzGnqWvdUmwYmLk7YqsZdijr4WSSvAd5tspmL5Gs1ErPZvfSpEwcxc7ys7MNAPMuo5kl5rkLlXdplHHnlkMgfd/0yJ12nkX031N5v3OnwO1su5hsPKxNM6CexmaWUg48qPEwDCkpojWayH2mrpbVj29qZgiDoMZVM3nPMB91w7VFNkIaKOcyAkrMbPN1BVZmC42fzf2Xw7AAcw4hW9sQYWJigu7u7qN2/R7VBLRtbS0qMcb1Gi8W/Pm7pQ7skqvnutFJoyEtdinNPmbJFU3gWxl7mo+MnkFQKB2itCbNjqt1lGc3/I8rnX1Vsl5WVvKGEXFUyidq7aK1NUiD3GpTdRckqXN3rKB1lMEUCt8zJrOgFDX4zczihIx8kEKJS/bZ3DY1hZPIKEMC7cpMdO62FqzIjLrUManG2R8sVrLyYE2B4sSPa0akr9z5+H7pFJJIunDhzxq4fKgtg6wVWN6DHiiXy0e10jnqLR4v09MVKZWiQmpS1+C1ajMBNgvMhQdsznc4pT4EI8/65th59pTa96VRzEvZuZaaeq6/+wyCssoWzumZ/H4tLUntx4pFnw0OIwtz9vs5Wt/qqT6LNT4+Tk9Pz1G/bo8Jyv3W1pIaGRnJ+lbrfKeo71ntniu0DvM+QwtpB1AHZU3MR/Wg57iWc39cz39Cz/p3D3DBqhgve6a/r+ceov481DyHUc/m2g59ANlnqrxlk6ZpDTuDiLBz585jQukcM4oHYGBgQK1bt67mZhZLG+ory6Moeh6QyTdloUuRW7zIuhmGYU3afN26dRx33HHHTF+MY6rJ0Omnn66++c1v5jtHo5tY6z+r5sxvypG1dLN56bmmtNaZ5T7bIeK73/0up5xyyjE1WY+57mYf/OAH1WWXXeYurtCutQi4ev50Km3KUbEICw0OrLU55S/A5Zdfzrvf/e5jbqIesyvvxBNPlPXr19cUliZJkte6eCBWU/k05Ui7WsXeV8X5uHr1ap544oljcoIe86vOWpfc3V/Fb1OasgDmaR7vyRTRMT05j/lG0lpr5blKvC/tFdHzrU97UxamxeMVTxAEvpHBMb8jPi862EdRpO69997cn/Y3up7gq5h+byqlphxs5VJ8XdwA/eM999yzINoLNxXPQZRzzz1XfehDH8qDdt6nLta+FP1s/7mmNOU5xzMyXA5Qw6FThHlcfvnlnHvuuc8b3/95F+To7e191Z18Zo4AAATTSURBVMjIyM+9hVPMfGmt8wC035macaCmPFdrxwePi3OqWHX+fHCtnveKx8uePXukv7+/oXLxblhxwjSlKc9VARlj8o4p2RxcUG2Fm67WYZCBgQH1yU9+MgdwFV2rouvVlKY8FynGcor4nI9//OPPW6XzvLZ4ipKmqXjYerF7RX0ni6Y05dlIkaB9ofe7alo8h1HCMFS33XZbrmj8rtSM7zTlYIiP5dx9991NpdO0eBq6X/93eHj4bc2gclMOlhwtDfaaFs8RlD179vyRUkrdeuutNQWlxfhPsfbLT6xGOI2mHDuKY3/zoP55vfznf/5nU+k0LZ7f2TcXX+tVD2mfLxM2H4FTU45ui6X+ftYTdvn3PPo4Y0RoToCmxfOsfHP1V3/1V3lavUi1Ub/L+UlYzGI0QYjHwM5cUDqenCubGzVKp0gs95nPfKapdJoWz8GRvXv3Sk9PzxwgWD1ArAhGbMqx5W4dqND4+YzLaVo8h0j6+/vV4ODgZd6kLhaZ1qff63l/mnJ0i3ej6+N+RaXT399/WVPpNBXPIZGRkZFvKaXU+eefn++A3qUqll/Ux3uacpQvkowVsGjFerfqwgsvRCmlRkZGvtUcqabiOaSyZs0apZRSn/rUp4qgsHySNt2sY8/aKQJMAT772c+ilFK33357c3dpypGRG2+8UURErLVijBERkTRNpSnHhlhrxVorIiLf/OY3m/5zUxaWfOMb38gnqheviIrv7U8xFd+v/05TnpvyKN6PRmPsnxc3EP+6qXCasuDl05/+dEPlkqbpnPf8buonujGmZgE05eAonEb3wkuSJPnrosIxxshVV13VVDhNObrkta997X4nvX9sKpjDo3zqrR5rbc29SdM03wTe9KY3NRXOIZRmYOwwSblcltbWVqrVKnEc1xBB1YPUwjDMH5vy3KU4xjCXb7uIxwqCoLkmDoM00y+HSdra2pRSSn3ve9+r1fxKkSRJnnr3yqapdA7i7joPrMFDHn7wgx+gtVZNpdO0eI55Wbx4sTzyyCP09vbW9HCv7fPeZEB8ruItxyK3kogwNjbG+eefz6OPPtpcA015fsob3vCGhkHnphx8eec739mM3TSlKfVy1VVXSbVabZj6bcrvLtVqVT760Y82lU1TmvJM5Y1vfGMNeG0+TFCjjFkj3Eqj7zfCHNWD5g6G7E+Jzve3+TBN/tz2Ny6XXnppU9k0pSnPVQYGBv7vj3/84xrsiV9wRRzKgZTPgRa4MeaAny8u/HrltL+/FX+j0bkVMU2NFKK3BBsd76c//akMDQ2NNGdKU5pyCOXEE0+UO+64QyqVSsNFPR92qJGlkKbpHAVwMK2eRsqpkRVWPIckSfZrjd13332yfPnyplXTlKYcSenr6/vzyy+/XEZGRp7Rop/P4thfndLvav3M5xrtr4yhUSlJuVyWz3zmM9Lf3//3zTvdlKYcBfKmN71J7r//ftm3b98cxPR8btcztXJ+F2voQGUgaZrK5OSk/OxnP5PXvOY1TUumKU05VuWUU06Rz33uc/Kb3/xmjlIoZta8+/Zs3K56i+qJJ56Qr33ta3L++ec3lUtTmtKUpjSlKU1pSlOa0pSmNKUpTWlKU5rSlKY0pSlNaUpTmtKUpjSlKU1pSlOa0pSmHEH5/wEUnH4O10Ux+gAAAABJRU5ErkJggg=='),
(7,'suk4nta@gmail.com','$2b$12$BSHLFb5QztUGjmVy9kjrcukcFt5m1FUHClEHrZJkm.7mVk2ASiifG','SUKANTA','3172021202730009','Jakarta','1973-02-12','085718993746','Sunter Jakarta Utara','PT. Anging Mamiri','Alamat kantor di jalan Gajahmada 8 Jakarta Pusat','PESERTA','2026-09-24 14:44:57.349','2026-09-26 16:03:10.253','https://lh3.googleusercontent.com/a/ACg8ocJG39RMaYYP2FjrO6vS7UR-BZTsj-f59KvzH2fhpyBuWof5yg=s96-c'),
(8,'okanhanif8@gmail.com','$2b$12$2CQHjLGQ2ehM78lIzwZWwOHDTdhtr6ZS4tGx3N1dvumECDxyPTjRm','okan hanif','3172021202730008','Jakarta','1992-02-12','085718355292','Jl. Sunter Jaya VI-A Jakarta Utara','RSUD Kemayoran','Jl. Serdang Raya Jakarta Pusat','PESERTA','2026-09-25 02:06:35.445','2026-09-26 14:07:07.658','/uploads/avatars/avatar-8-1790304337074.png'),
(19,'djuartinisaleh@yahoo.com/djtini@batan.go.id','$2b$12$fardUtF2ZIN.b3oLOeS.q.7tLnCae9vAaub2SbOOnQvFHW856LOPO','Dra. Djuartini Saleh','3674075801640001','Jakarta','1964-01-18','081384191832','',NULL,NULL,'INSTRUCTOR','2026-09-26 10:39:11.395','2026-09-26 10:39:11.395',NULL),
(20,'rinir@batan.go.id','$2b$12$fardUtF2ZIN.b3oLOeS.q.7tLnCae9vAaub2SbOOnQvFHW856LOPO','Rini Rindayani','3674056408600003','Jakarta','1960-08-24','085216525299','',NULL,NULL,'INSTRUCTOR','2026-09-26 10:39:11.395','2026-09-26 10:39:11.395',NULL),
(21,'sanyoto.aris@gmail.com','$2b$12$fardUtF2ZIN.b3oLOeS.q.7tLnCae9vAaub2SbOOnQvFHW856LOPO','Aris Sanyoto, SKM','3175071101660001','Klaten','1966-01-11','','',NULL,NULL,'INSTRUCTOR','2026-09-26 10:39:11.395','2026-09-26 10:39:11.395',NULL),
(22,'veronikatuka@gmail.com','$2b$12$fardUtF2ZIN.b3oLOeS.q.7tLnCae9vAaub2SbOOnQvFHW856LOPO','Veronika Tuka, Dra','3172027003600003','Jakarta','1960-03-30','','',NULL,NULL,'INSTRUCTOR','2026-09-26 10:39:11.395','2026-09-26 10:39:11.395',NULL),
(23,'asisi.putra@gmail.com','$2b$12$fardUtF2ZIN.b3oLOeS.q.7tLnCae9vAaub2SbOOnQvFHW856LOPO','Fransiskus Asisi Sanyata Putra, ST.','3175070501890001','Klaten','1989-01-05','081258605828','',NULL,NULL,'INSTRUCTOR','2026-09-26 10:39:11.395','2026-09-26 10:39:11.395',NULL),
(24,'tarmuji@sss-indonesia.com','$2b$12$fardUtF2ZIN.b3oLOeS.q.7tLnCae9vAaub2SbOOnQvFHW856LOPO','Tarmuji','3519130608910001','Madiun','1991-08-06','085776424040','',NULL,NULL,'INSTRUCTOR','2026-09-26 10:39:11.395','2026-09-26 10:39:11.395',NULL),
(25,'service@pros-energi.com','$2b$12$fardUtF2ZIN.b3oLOeS.q.7tLnCae9vAaub2SbOOnQvFHW856LOPO','Diky Putra','3275091512970020','Jakarta','1997-12-15','085810558436',NULL,NULL,NULL,'INSTRUCTOR','2026-09-26 10:39:11.395','2026-09-26 10:39:11.395',NULL),
(26,'ayuwinda9410@gmail.com','$2b$12$fardUtF2ZIN.b3oLOeS.q.7tLnCae9vAaub2SbOOnQvFHW856LOPO','Ayu Winda Astuti','3175075510940006','Klaten','1994-10-15','081317429937',NULL,NULL,NULL,'INSTRUCTOR','2026-09-26 10:39:11.395','2026-09-26 13:33:24.000',NULL),
(27,'diyah.astiyani@gmail.com','$2b$12$fardUtF2ZIN.b3oLOeS.q.7tLnCae9vAaub2SbOOnQvFHW856LOPO','Bernadetha Diyah Astiyani','3175074705951001','Klaten','1995-05-07',NULL,NULL,NULL,NULL,'INSTRUCTOR','2026-09-26 10:39:11.395','2026-09-26 13:33:24.000',NULL),
(28,'fransiska.sulistyawati@gmail.com','$2b$12$fardUtF2ZIN.b3oLOeS.q.7tLnCae9vAaub2SbOOnQvFHW856LOPO','Fransiska Sulistyawati','3310147103970001','Klaten','1994-03-25',NULL,NULL,NULL,NULL,'INSTRUCTOR','2026-09-26 10:39:11.395','2026-09-26 13:33:24.000',NULL),
(29,'gregoriusfernandes12@gmail.com','$2b$12$an1V8lrmLBBYpe4s.g6xLukrCzlT2lUcLkn.q1RCvRKeqM.Im3PLu','Gregorius Fernandes','3175072003000001','Jakarta','2000-03-20','081230052882','Jl Pertanian Tengah No 32 Klender Duren Sawit','Alara','Test','PESERTA','2026-09-27 05:28:30.409','2026-09-27 05:39:28.452','https://lh3.googleusercontent.com/a/ACg8ocL8G7EnN0u7Xx52OISku0BnFF1JzuyUrwrdXRcrYZm_3tibNRk=s96-c');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-27 22:28:58
