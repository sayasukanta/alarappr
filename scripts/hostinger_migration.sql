-- =========================================================================
-- MIGRASI DATABASE HOSTINGER: MULTI-KATEGORI & MASTER TRAINING CATEGORIES
-- =========================================================================
-- Aman dijalankan: TIDAK menghapus data yang sudah ada (145 soal, user, dll tetap aman).

-- 1. Buat tabel master kategori pelatihan jika belum ada
CREATE TABLE IF NOT EXISTS `training_categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `order_index` INT NOT NULL DEFAULT 1,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `training_categories_code_key`(`code`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Buat tabel perantara relasi multi-kategori soal jika belum ada
CREATE TABLE IF NOT EXISTS `question_categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `question_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `question_categories_question_id_idx`(`question_id`),
  INDEX `question_categories_category_id_idx`(`category_id`),
  UNIQUE INDEX `question_categories_question_id_category_id_key`(`question_id`, `category_id`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tambahkan kolom category_id pada trainings (jika belum ada)
-- Catatan: jika error 'Duplicate column name', lewati baris ini.
ALTER TABLE `trainings` ADD COLUMN `category_id` INT NULL;

-- 4. Perluas enum category pada questions agar mendukung PPR_PENYEGARAN
ALTER TABLE `questions` MODIFY COLUMN `category` ENUM('PPR_ANALISIS','PPR_BAGASI','PKR_PEKERJA','PPR_PENYEGARAN') NOT NULL;

-- 5. Masukkan 9 master kategori pelatihan
INSERT INTO `training_categories` (`id`, `code`, `name`, `description`, `order_index`, `is_active`, `created_at`, `updated_at`)
VALUES
(1, 'PPR_ANALISIS', 'PPR Bidang Analisis', 'Pelatihan Calon Petugas Proteksi Radiasi bidang analisis dengan SRP (XRF, XRD, dll)', 1, 1, NOW(), NOW()),
(2, 'PPR_BAGASI', 'PPR Pemindai Bagasi', 'Pelatihan Calon Petugas Proteksi Radiasi pemindai bagasi / barang (X-ray bandara/fasilitas keamanan)', 2, 1, NOW(), NOW()),
(3, 'PKR_PEKERJA', 'PKR Pekerja Radiasi', 'Pelatihan Proteksi dan Keselamatan Radiasi untuk seluruh pekerja dan staf di medan radiasi', 3, 1, NOW(), NOW()),
(4, 'PPR_PENYEGARAN', 'PPR Penyegaran', 'Penyegaran kompetensi PPR untuk syarat perpanjangan Surat Izin Bekerja (SIB) BAPETEN', 4, 1, NOW(), NOW()),
(5, 'PPR_EKSPOR_IMPOR', 'PPR Ekspor Impor', 'Pelatihan Calon Petugas Proteksi Radiasi untuk instansi importir / distributor SRP', 5, 1, NOW(), NOW()),
(6, 'PPR_INDUSTRI_1', 'PPR Industri Tingkat 1', 'Pelatihan Calon PPR Industri Tingkat 1 (Radiografi Industri & Iradiator)', 6, 1, NOW(), NOW()),
(7, 'PPR_INDUSTRI_2', 'PPR Industri Tingkat 2', 'Pelatihan Calon PPR Industri Tingkat 2 (Gauging, Logging, dll)', 7, 1, NOW(), NOW()),
(8, 'PPR_MEDIK_1', 'PPR Medik Tingkat 1', 'Pelatihan Calon PPR Medik Tingkat 1 (Radioterapi & Kedokteran Nuklir)', 8, 1, NOW(), NOW()),
(9, 'PPR_MEDIK_2', 'PPR Medik Tingkat 2', 'Pelatihan Calon PPR Medik Tingkat 2 (Radiologi Diagnostik & Intervensional)', 9, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `description`=VALUES(`description`), `order_index`=VALUES(`order_index`);

-- 6. Hubungkan data pelatihan yang ada ke category_id
UPDATE `trainings` t
JOIN `training_categories` c ON t.category = c.code
SET t.category_id = c.id
WHERE t.category_id IS NULL;

-- 7. Hubungkan 145 butir soal yang sudah ada ke question_categories
INSERT IGNORE INTO `question_categories` (`question_id`, `category_id`, `created_at`)
SELECT q.id, c.id, NOW()
FROM `questions` q
JOIN `training_categories` c ON q.category = c.code;
