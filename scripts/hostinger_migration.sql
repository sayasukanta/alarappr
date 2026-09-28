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

-- 5. Masukkan 4 master kategori pelatihan resmi BAPETEN
INSERT INTO `training_categories` (`id`, `code`, `name`, `description`, `order_index`, `is_active`, `created_at`, `updated_at`)
VALUES
(1, 'PPR_ANALISIS', 'PPR Bidang Analisis', 'Pelatihan Calon Petugas Proteksi Radiasi bidang analisis dengan SRP (XRF, XRD, dll)', 1, 1, NOW(), NOW()),
(2, 'PPR_BAGASI', 'PPR Pemindai Bagasi', 'Pelatihan Calon Petugas Proteksi Radiasi pemindai bagasi / barang (X-ray bandara/fasilitas keamanan)', 2, 1, NOW(), NOW()),
(3, 'PKR_PEKERJA', 'PKR Pekerja Radiasi', 'Pelatihan Proteksi dan Keselamatan Radiasi untuk seluruh pekerja dan staf di medan radiasi', 3, 1, NOW(), NOW()),
(4, 'PPR_PENYEGARAN', 'PPR Penyegaran', 'Penyegaran kompetensi PPR untuk syarat perpanjangan Surat Izin Bekerja (SIB) BAPETEN', 4, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `description`=VALUES(`description`), `order_index`=VALUES(`order_index`);

-- 6. Hubungkan data pelatihan yang ada ke category_id
UPDATE `trainings` t
JOIN `training_categories` c ON t.category = c.code
SET t.category_id = c.id
WHERE t.category_id IS NULL;

-- 7. Hubungkan 145 butir soal dasar yang ada ke 4 kategori aktif (PPR Analisis, PPR Bagasi, PKR Pekerja, PPR Penyegaran)
INSERT IGNORE INTO `question_categories` (`question_id`, `category_id`, `created_at`)
SELECT q.id, 1, NOW() FROM `questions` q
UNION ALL
SELECT q.id, 2, NOW() FROM `questions` q
UNION ALL
SELECT q.id, 3, NOW() FROM `questions` q
UNION ALL
SELECT q.id, 4, NOW() FROM `questions` q;

