-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `nik` VARCHAR(191) NULL,
    `tempat_lahir` VARCHAR(191) NULL,
    `tanggal_lahir` DATE NULL,
    `phone_number` VARCHAR(191) NULL,
    `alamat_domisili` VARCHAR(500) NULL,
    `instansi` VARCHAR(191) NULL,
    `alamat_instansi` VARCHAR(500) NULL,
    `role` ENUM('PESERTA', 'ADMIN', 'INSTRUCTOR', 'SPONSOR') NOT NULL DEFAULT 'PESERTA',
    `image` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_nik_key`(`nik`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `training_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `order_index` INTEGER NOT NULL DEFAULT 1,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `training_categories_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trainings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category` ENUM('PPR_ANALISIS', 'PPR_BAGASI', 'PKR_PEKERJA', 'PPR_PENYEGARAN') NOT NULL,
    `category_id` INTEGER NULL,
    `title` VARCHAR(191) NOT NULL,
    `title_en` VARCHAR(191) NULL,
    `cert_header_id` VARCHAR(191) NULL,
    `cert_subtitle_id` VARCHAR(191) NULL,
    `cert_header_en` VARCHAR(191) NULL,
    `cert_badge` VARCHAR(191) NULL DEFAULT 'BAPETEN',
    `price` DECIMAL(12, 2) NOT NULL,
    `duration_days` INTEGER NOT NULL DEFAULT 3,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `trainings_category_id_idx`(`category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `training_competency_units` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `training_id` INTEGER NOT NULL,
    `section_code` VARCHAR(191) NOT NULL DEFAULT 'A',
    `section_title` VARCHAR(191) NOT NULL,
    `unit_no` VARCHAR(191) NOT NULL,
    `mata_ajar` TEXT NOT NULL,
    `kode` VARCHAR(191) NOT NULL,
    `kode_kompetensi` TEXT NULL,
    `jp` INTEGER NOT NULL DEFAULT 2,
    `order_index` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `training_competency_units_training_id_section_code_idx`(`training_id`, `section_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `training_batches` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `training_id` INTEGER NOT NULL,
    `batch_number` INTEGER NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `quota` INTEGER NOT NULL,
    `location` VARCHAR(191) NULL,
    `status` ENUM('RENCANA', 'PELAKSANAAN', 'SELESAI') NOT NULL DEFAULT 'RENCANA',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tryout_open` BOOLEAN NOT NULL DEFAULT false,
    `tryout_start_time` DATETIME(3) NULL,
    `tryout_end_time` DATETIME(3) NULL,
    `tryout_duration_minutes` INTEGER NULL DEFAULT 60,
    `tryout_question_count` INTEGER NULL DEFAULT 20,
    `tryout_selection_mode` VARCHAR(191) NOT NULL DEFAULT 'AUTOMATIC',
    `documentation_url` TEXT NULL,
    `documentation_title` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `registrations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `batch_id` INTEGER NOT NULL,
    `registration_status` ENUM('DRAFT', 'MENUNGGU_VERIFIKASI', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'DRAFT',
    `payment_status` ENUM('UNPAID', 'PENDING_VERIFICATION', 'PAID') NOT NULL DEFAULT 'UNPAID',
    `sponsor_name` VARCHAR(191) NULL,
    `sponsor_npwp` VARCHAR(191) NULL,
    `tempat_lahir` VARCHAR(191) NULL,
    `tanggal_lahir` DATETIME(3) NULL,
    `alamat` TEXT NULL,
    `instansi` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `registration_documents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `registration_id` INTEGER NOT NULL,
    `doc_type` ENUM('IJAZAH', 'MCU', 'KTP', 'SURAT_KERJA', 'PASFOTO', 'NPWP') NOT NULL,
    `file_path` VARCHAR(191) NOT NULL,
    `is_valid` BOOLEAN NULL,
    `notes` TEXT NULL,
    `verified_by` INTEGER NULL,
    `verified_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `mcu_issue_date` DATETIME(3) NULL,
    `has_darah` BOOLEAN NULL,
    `has_urine` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `registration_id` INTEGER NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `bank_name` VARCHAR(191) NOT NULL DEFAULT 'Mandiri',
    `proof_file_path` VARCHAR(191) NULL,
    `payment_date` DATETIME(3) NULL,
    `sender_name` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `rejection_note` TEXT NULL,
    `verified_by` INTEGER NULL,
    `verified_at` DATETIME(3) NULL,
    `invoice_number` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `payments_invoice_number_key`(`invoice_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendances` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `registration_id` INTEGER NOT NULL,
    `day_number` INTEGER NOT NULL,
    `session_type` ENUM('MORNING', 'AFTERNOON') NOT NULL,
    `checkin_time` DATETIME(3) NULL,
    `status` ENUM('HADIR', 'IZIN', 'ALPA') NOT NULL DEFAULT 'HADIR',
    `selfie_url` VARCHAR(191) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `attendances_registration_id_day_number_session_type_key`(`registration_id`, `day_number`, `session_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_results` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `registration_id` INTEGER NOT NULL,
    `tryout_score` DOUBLE NULL,
    `bapeten_theory_score` DOUBLE NULL,
    `bapeten_practical_score` DOUBLE NULL,
    `bapeten_interview_score` DOUBLE NULL,
    `final_status` ENUM('LULUS', 'TIDAK_LULUS', 'REMIDIAL') NULL,
    `certificate_number` VARCHAR(191) NULL,
    `issued_at` DATETIME(3) NULL,
    `signatory_id` INTEGER NULL,
    `signed_certificate_url` VARCHAR(191) NULL,
    `signed_certificate_name` VARCHAR(191) NULL,
    `signed_uploaded_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `exam_results_registration_id_key`(`registration_id`),
    UNIQUE INDEX `exam_results_certificate_number_key`(`certificate_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instructors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `bapeten_license_no` VARCHAR(191) NULL,
    `license_expiry_date` DATETIME(3) NULL,
    `iaea_certification` BOOLEAN NOT NULL DEFAULT false,
    `specialization` ENUM('PPR_ANALISIS', 'PPR_BAGASI', 'PKR_PEKERJA', 'PPR_PENYEGARAN') NOT NULL,
    `bio_summary` TEXT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `instructors_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instructor_assignments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `batch_id` INTEGER NOT NULL,
    `instructor_id` INTEGER NOT NULL,
    `session_name` VARCHAR(191) NOT NULL,
    `teaching_date` DATETIME(3) NOT NULL,
    `start_time` VARCHAR(191) NOT NULL,
    `end_time` VARCHAR(191) NOT NULL,
    `session_type` ENUM('THEORY', 'PRACTICAL', 'TRYOUT_REVIEW') NOT NULL,
    `teaching_hours` DOUBLE NOT NULL,
    `confirmed` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instructor_evaluations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `batch_id` INTEGER NOT NULL,
    `instructor_id` INTEGER NOT NULL,
    `participant_id` INTEGER NOT NULL,
    `rating_score` DOUBLE NOT NULL,
    `feedback_notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lms_modules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `training_category` ENUM('PPR_ANALISIS', 'PPR_BAGASI', 'PKR_PEKERJA', 'PPR_PENYEGARAN') NOT NULL,
    `training_id` INTEGER NULL,
    `day_number` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `module_type` VARCHAR(191) NOT NULL DEFAULT 'reading',
    `duration_minutes` INTEGER NOT NULL DEFAULT 45,
    `content` LONGTEXT NULL,
    `content_path` VARCHAR(191) NULL,
    `file_url` VARCHAR(191) NULL,
    `file_name` VARCHAR(191) NULL,
    `file_size` VARCHAR(191) NULL,
    `video_url` VARCHAR(191) NULL,
    `page_count` INTEGER NOT NULL DEFAULT 1,
    `order_index` INTEGER NOT NULL DEFAULT 1,
    `is_published` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lms_modules_training_category_day_number_idx`(`training_category`, `day_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lms_progress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `module_id` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'in_progress',
    `completed_at` DATETIME(3) NULL,
    `last_accessed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lms_progress_user_id_idx`(`user_id`),
    INDEX `lms_progress_module_id_idx`(`module_id`),
    UNIQUE INDEX `lms_progress_user_id_module_id_key`(`user_id`, `module_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logbooks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `registration_id` INTEGER NOT NULL,
    `practice_date` DATETIME(3) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `dosis_laju` DOUBLE NULL,
    `kondisi_interlock` TEXT NULL,
    `penggunaan_dosimeter` TEXT NULL,
    `notes` TEXT NULL,
    `signed_off_by` INTEGER NULL,
    `signed_off_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category` ENUM('PPR_ANALISIS', 'PPR_BAGASI', 'PKR_PEKERJA', 'PPR_PENYEGARAN') NOT NULL,
    `training_id` INTEGER NULL,
    `topic` VARCHAR(191) NOT NULL,
    `question_text` TEXT NOT NULL,
    `image_url` VARCHAR(191) NULL,
    `option_a` TEXT NOT NULL,
    `option_b` TEXT NOT NULL,
    `option_c` TEXT NOT NULL,
    `option_d` TEXT NOT NULL,
    `option_e` TEXT NULL,
    `correct_answer` VARCHAR(191) NOT NULL,
    `explanation` TEXT NULL,
    `difficulty` INTEGER NOT NULL DEFAULT 1,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `question_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `question_categories_question_id_idx`(`question_id`),
    INDEX `question_categories_category_id_idx`(`category_id`),
    UNIQUE INDEX `question_categories_question_id_category_id_key`(`question_id`, `category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `batch_tryout_questions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `batch_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `order_index` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `batch_tryout_questions_batch_id_idx`(`batch_id`),
    UNIQUE INDEX `batch_tryout_questions_batch_id_question_id_key`(`batch_id`, `question_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tryout_attempts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `registration_id` INTEGER NOT NULL,
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `submitted_at` DATETIME(3) NULL,
    `total_score` DOUBLE NULL,
    `status` ENUM('LULUS_TRYOUT', 'BELUM_LULUS') NULL,
    `tab_switch_count` INTEGER NOT NULL DEFAULT 0,
    `time_expired` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tryout_answers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `attempt_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `selected_answer` VARCHAR(191) NULL,
    `is_marked` BOOLEAN NOT NULL DEFAULT false,
    `is_correct` BOOLEAN NULL,

    UNIQUE INDEX `tryout_answers_attempt_id_question_id_key`(`attempt_id`, `question_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `certificate_signatories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `position` VARCHAR(255) NOT NULL,
    `institution` VARCHAR(255) NOT NULL DEFAULT 'CV. HIKMAT PROTEKSI ALARA',
    `nip` VARCHAR(100) NULL,
    `signature_url` VARCHAR(500) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_menu_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `menu_key` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `href` VARCHAR(191) NOT NULL,
    `icon_name` VARCHAR(191) NULL,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,
    `order_index` INTEGER NOT NULL DEFAULT 1,
    `description` TEXT NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_menu_settings_menu_key_key`(`menu_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `footer_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `phone` VARCHAR(191) NOT NULL DEFAULT '+62 812-3456-7890',
    `email` VARCHAR(191) NOT NULL DEFAULT 'info@hikmatproteksi.com',
    `address` VARCHAR(191) NOT NULL DEFAULT 'Indonesia',
    `map_url` TEXT NULL,
    `brand_title` VARCHAR(191) NOT NULL DEFAULT 'ALARA Training System',
    `brand_subtitle` VARCHAR(191) NOT NULL DEFAULT 'CV. Hikmat Proteksi ALARA',
    `brand_description` TEXT NOT NULL DEFAULT 'Lembaga pelatihan proteksi radiasi terakreditasi BAPETEN, berkomitmen menghasilkan tenaga PPR profesional dan kompeten.',
    `institution_name` VARCHAR(191) NOT NULL DEFAULT 'CV. Hikmat Proteksi ALARA',
    `ktun_number` VARCHAR(191) NOT NULL DEFAULT 'No. 07998.722.1.040726',
    `bank_name` VARCHAR(191) NOT NULL DEFAULT 'Mandiri No. 166-00-0733926-0',
    `bank_account_name` VARCHAR(191) NOT NULL DEFAULT 'CV Hikmat Proteksi ALARA',
    `copyright_text` VARCHAR(191) NOT NULL DEFAULT 'CV. Hikmat Proteksi ALARA. Hak Cipta Dilindungi.',
    `footer_ktun_text` VARCHAR(191) NOT NULL DEFAULT 'KTUN BAPETEN No. 07998.722.1.040726',
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `slides` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NULL,
    `image_url` TEXT NOT NULL,
    `link_url` TEXT NULL,
    `is_tampil` INTEGER NOT NULL DEFAULT 1,
    `order_index` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `training_competency_units` ADD CONSTRAINT `training_competency_units_training_id_fkey` FOREIGN KEY (`training_id`) REFERENCES `trainings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `training_batches` ADD CONSTRAINT `training_batches_training_id_fkey` FOREIGN KEY (`training_id`) REFERENCES `trainings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registrations` ADD CONSTRAINT `registrations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registrations` ADD CONSTRAINT `registrations_batch_id_fkey` FOREIGN KEY (`batch_id`) REFERENCES `training_batches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registration_documents` ADD CONSTRAINT `registration_documents_registration_id_fkey` FOREIGN KEY (`registration_id`) REFERENCES `registrations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registration_documents` ADD CONSTRAINT `registration_documents_verified_by_fkey` FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_registration_id_fkey` FOREIGN KEY (`registration_id`) REFERENCES `registrations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendances` ADD CONSTRAINT `attendances_registration_id_fkey` FOREIGN KEY (`registration_id`) REFERENCES `registrations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_results` ADD CONSTRAINT `exam_results_registration_id_fkey` FOREIGN KEY (`registration_id`) REFERENCES `registrations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_results` ADD CONSTRAINT `exam_results_signatory_id_fkey` FOREIGN KEY (`signatory_id`) REFERENCES `certificate_signatories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instructors` ADD CONSTRAINT `instructors_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instructor_assignments` ADD CONSTRAINT `instructor_assignments_batch_id_fkey` FOREIGN KEY (`batch_id`) REFERENCES `training_batches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instructor_assignments` ADD CONSTRAINT `instructor_assignments_instructor_id_fkey` FOREIGN KEY (`instructor_id`) REFERENCES `instructors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instructor_evaluations` ADD CONSTRAINT `instructor_evaluations_batch_id_fkey` FOREIGN KEY (`batch_id`) REFERENCES `training_batches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instructor_evaluations` ADD CONSTRAINT `instructor_evaluations_instructor_id_fkey` FOREIGN KEY (`instructor_id`) REFERENCES `instructors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instructor_evaluations` ADD CONSTRAINT `instructor_evaluations_participant_id_fkey` FOREIGN KEY (`participant_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lms_modules` ADD CONSTRAINT `lms_modules_training_id_fkey` FOREIGN KEY (`training_id`) REFERENCES `trainings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lms_progress` ADD CONSTRAINT `lms_progress_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lms_progress` ADD CONSTRAINT `lms_progress_module_id_fkey` FOREIGN KEY (`module_id`) REFERENCES `lms_modules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_training_id_fkey` FOREIGN KEY (`training_id`) REFERENCES `trainings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `batch_tryout_questions` ADD CONSTRAINT `batch_tryout_questions_batch_id_fkey` FOREIGN KEY (`batch_id`) REFERENCES `training_batches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `batch_tryout_questions` ADD CONSTRAINT `batch_tryout_questions_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tryout_attempts` ADD CONSTRAINT `tryout_attempts_registration_id_fkey` FOREIGN KEY (`registration_id`) REFERENCES `registrations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tryout_answers` ADD CONSTRAINT `tryout_answers_attempt_id_fkey` FOREIGN KEY (`attempt_id`) REFERENCES `tryout_attempts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tryout_answers` ADD CONSTRAINT `tryout_answers_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;



-- =========================================================================
-- INITIAL SEED DATA FOR ALARA HOSTINGER DATABASE
-- =========================================================================

-- 1. USERS
INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `nik`, `phone_number`, `role`, `created_at`, `updated_at`)
VALUES
(1, 'admin@alara.co.id', '$2b$10$k3CS2mKuBMk/jMuw9A9oNe38AkGcYCCoSllvUAYQnNYQ2PQTIq/z.', 'Admin ALARA', '3171010101010001', '08123456789', 'ADMIN', NOW(), NOW()),
(2, 'instructor@alara.co.id', '$2b$10$SQo6Qqk0ZSKuPaUNbZ5C4Ow3DGkkbic9hFfG1KdA24qwTfvMqoW2q', 'Ir. H. Expert Proteksi, M.Si.', '3171010101010002', '08198765432', 'INSTRUCTOR', NOW(), NOW()),
(3, 'peserta@alara.co.id', '$2b$10$7mhNRFd5X3qX7dT8ZsRF9..i/8W42CdwsLg5ZUAlpQxGmXoCO6Xc2', 'Budi Santoso', '3172091238910001', '08112345678', 'PESERTA', NOW(), NOW()),
(4, 'sponsor@alara.co.id', '$2b$10$UrYMm1GUe8qRQwDULOIY7OFrIGXm9K6ZOwkgWdfxyEn4mxEQm1A3.', 'PT Medika Radiasi', '3171010101010004', '02112345678', 'SPONSOR', NOW(), NOW());

-- 2. MASTER TRAINING CATEGORIES
INSERT INTO `training_categories` (`id`, `code`, `name`, `description`, `order_index`, `is_active`, `created_at`, `updated_at`)
VALUES
(1, 'PPR_ANALISIS', 'PPR Bidang Analisis', 'Pelatihan Calon Petugas Proteksi Radiasi bidang analisis dengan SRP (XRF, XRD, dll)', 1, 1, NOW(), NOW()),
(2, 'PPR_BAGASI', 'PPR Pemindai Bagasi', 'Pelatihan Calon Petugas Proteksi Radiasi pemindai bagasi / barang (X-ray bandara/fasilitas keamanan)', 2, 1, NOW(), NOW()),
(3, 'PKR_PEKERJA', 'PKR Pekerja Radiasi', 'Pelatihan Proteksi dan Keselamatan Radiasi untuk seluruh pekerja dan staf di medan radiasi', 3, 1, NOW(), NOW()),
(4, 'PPR_PENYEGARAN', 'PPR Penyegaran', 'Penyegaran kompetensi PPR untuk syarat perpanjangan Surat Izin Bekerja (SIB) BAPETEN', 4, 1, NOW(), NOW());

-- 3. INSTRUCTORS
INSERT INTO `instructors` (`id`, `user_id`, `bapeten_license_no`, `license_expiry_date`, `iaea_certification`, `specialization`, `bio_summary`, `status`, `created_at`, `updated_at`)
VALUES
(1, 2, 'PPR-INSP-2024-009', '2028-12-31', 1, 'PPR_ANALISIS', 'Mantan Inspektur BAPETEN dengan pengalaman 20+ tahun di bidang proteksi radiasi dan keselamatan nuklir. Alumni IAEA Post-Graduate Educational Course.', 'ACTIVE', NOW(), NOW());

-- 4. TRAININGS
INSERT INTO `trainings` (`id`, `category`, `category_id`, `title`, `title_en`, `description`, `price`, `duration_days`, `cert_badge`, `created_at`)
VALUES
(1, 'PPR_ANALISIS', 1, 'Pelatihan Calon PPR Analisis Menggunakan Sumber Radiasi Pengion', 'Radiation Protection Officer for Analysis Using Ionizing Radiation Sources', 'Pelatihan untuk calon Petugas Proteksi Radiasi (PPR) bidang analisis menggunakan sumber radiasi pengion. Mencakup teori fisika radiasi, regulasi BAPETEN, prosedur proteksi radiasi, dan praktikum lapangan. Prasyarat: Ijazah minimal D3 Eksakta/Teknik.', 7000000, 3, 'BAPETEN', NOW()),
(2, 'PPR_BAGASI', 2, 'Pelatihan Calon PPR Pemindai Bagasi atau Barang Lainnya Menggunakan Sumber Radiasi Pengion', 'RPO Baggage Scanners or Other Items Using Ionizing Radiation Sources', 'Pelatihan untuk calon Petugas Proteksi Radiasi (PPR) bidang pemindai bagasi dan barang menggunakan sumber radiasi pengion. Ditujukan untuk teknisi X-ray bagasi di bandara, pelabuhan, atau fasilitas keamanan.', 7000000, 3, 'BAPETEN', NOW()),
(3, 'PKR_PEKERJA', 3, 'Pelatihan Proteksi dan Keselamatan Radiasi (PKR) Pekerja Radiasi', 'Radiation Protection and Safety Training for Radiation Workers', 'Pelatihan proteksi dan keselamatan radiasi untuk pekerja radiasi: operator, petugas analisis sampel, petugas perawatan, perawat, dan dokter di daerah/fasilitas radiasi.', 0, 3, 'Internal', NOW()),
(4, 'PPR_PENYEGARAN', 4, 'Penyegaran PPR', 'Refresher Course for Radiation Protection Officer', 'Penyegaran PPR adalah salah satu prasyarat untuk mengikuti ujian perpanjangan masa berlaku Surat Izin Bekerja (SIB) yang saat ini dimiliki PPR agar bisa tetap bekerja sebagai PPR dan izin-izin pemanfaatan yang telah dimiliki Instansi di tempat bekerja bisa tetap berlaku.', 3500000, 3, 'BAPETEN', NOW());

-- 5. TRAINING BATCHES
INSERT INTO `training_batches` (`id`, `training_id`, `batch_number`, `start_date`, `end_date`, `quota`, `location`, `status`, `created_at`, `updated_at`)
VALUES
(1, 1, 1, '2026-10-15', '2026-10-17', 25, 'CV. Hikmat Proteksi ALARA, Jakarta', 'OPEN', NOW(), NOW()),
(2, 2, 1, '2026-10-22', '2026-10-24', 25, 'CV. Hikmat Proteksi ALARA, Jakarta', 'OPEN', NOW(), NOW()),
(3, 3, 1, '2026-11-05', '2026-11-07', 30, 'CV. Hikmat Proteksi ALARA, Jakarta', 'OPEN', NOW(), NOW()),
(4, 4, 1, '2026-11-12', '2026-11-14', 30, 'CV. Hikmat Proteksi ALARA, Jakarta', 'OPEN', NOW(), NOW());

-- 6. SIGNATORIES
INSERT INTO `certificate_signatories` (`id`, `name`, `position`, `institution`, `nip`, `is_active`, `created_at`, `updated_at`)
VALUES
(1, 'Fransiskus Asisi Sanyata Putra, ST', 'Direktur CV. Hikmat Proteksi ALARA', 'CV. HIKMAT PROTEKSI ALARA', '198001012005011001', 1, NOW(), NOW());

-- 7. FOOTER SETTINGS
INSERT INTO `footer_settings` (`id`, `phone`, `email`, `address`, `map_url`, `brand_title`, `brand_subtitle`, `brand_description`, `institution_name`, `ktun_number`, `bank_name`, `bank_account_name`, `copyright_text`, `footer_ktun_text`, `created_at`, `updated_at`)
VALUES
(1, '+62 812-3456-7890', 'info@hikmatproteksi.com', 'Jakarta, Indonesia', 'https://maps.google.com/?q=Jakarta', 'ALARA Training System', 'CV. Hikmat Proteksi ALARA', 'Lembaga pelatihan proteksi radiasi terakreditasi BAPETEN, berkomitmen menghasilkan tenaga PPR profesional dan kompeten.', 'CV. Hikmat Proteksi ALARA', 'No. 07998.722.1.040726', 'Mandiri No. 166-00-0733926-0', 'CV Hikmat Proteksi ALARA', 'CV. Hikmat Proteksi ALARA. Hak Cipta Dilindungi.', 'KTUN BAPETEN No. 07998.722.1.040726', NOW(), NOW());

-- 8. SLIDES (HERO CAROUSEL)
INSERT INTO `slides` (`id`, `title`, `subtitle`, `description`, `badge_text`, `image_url`, `primary_btn_text`, `primary_btn_link`, `secondary_btn_text`, `secondary_btn_link`, `order_index`, `is_active`, `created_at`, `updated_at`)
VALUES
(1, 'Pelatihan Calon Petugas Proteksi Radiasi', 'Terakreditasi Resmi BAPETEN', 'Raih sertifikasi resmi kompetensi ketenaganukliran bersama instruktur berpengalaman dan kurikulum standar BAPETEN.', 'AKREDITASI BAPETEN', '/hero/slide1.jpg', 'Daftar Sekarang', '/pendaftaran', 'Lihat Program', '#program', 1, 1, NOW(), NOW()),
(2, 'Simulasi Ujian SIB BAPETEN Online', 'Persiapan Ujian Lisensi Lebih Matang', 'Akses bank soal tryout terkini dan latihan interaktif untuk memastikan kelulusan ujian Surat Izin Bekerja (SIB).', 'TRYOUT CBT ONLINE', '/hero/slide2.jpg', 'Mulai Tryout', '/tryout', 'Pelajari Alur', '#alur', 2, 1, NOW(), NOW());

-- 9. USER MENU SETTINGS
INSERT INTO `user_menu_settings` (`menu_key`, `label`, `href`, `icon_name`, `is_visible`, `order_index`, `description`, `created_at`, `updated_at`)
VALUES
('dashboard', 'Dashboard', '/dashboard', 'LayoutDashboard', 1, 1, 'Ringkasan status pendaftaran, pelatihan aktif, pengumuman, dan pintasan utama peserta.', NOW(), NOW()),
('pendaftaran', 'Pendaftaran', '/pendaftaran', 'ClipboardList', 1, 2, 'Formulir pendaftaran pelatihan baru, pemilihan jadwal angkatan, dan biodata peserta.', NOW(), NOW()),
('dokumen', 'Dokumen', '/dokumen', 'FileText', 1, 3, 'Unggah dan verifikasi berkas persyaratan (Ijazah, Surat Kerja, MCU Bebas Narkoba, Pasfoto, KTP).', NOW(), NOW()),
('pembayaran', 'Pembayaran', '/pembayaran', 'CreditCard', 1, 4, 'Informasi rekening tagihan, unggah bukti transfer pembayaran pelatihan, dan status verifikasi bendahara.', NOW(), NOW()),
('lms', 'LMS / Modul', '/lms', 'BookOpen', 1, 5, 'Materi pembelajaran harian, silabus BAPETEN, modul bacaan, video tutorial, dan unduhan bahan ajar.', NOW(), NOW()),
('presensi', 'Presensi', '/presensi', 'CalendarCheck', 1, 6, 'Absensi kehadiran harian sesi pagi dan siang disertai verifikasi swafoto (selfie) dan lokasi GPS.', NOW(), NOW()),
('logbook', 'Logbook', '/logbook', 'BookCheck', 1, 7, 'Pencatatan aktivitas harian praktikum proteksi radiasi dan persetujuan tanda tangan digital instruktur.', NOW(), NOW()),
('tryout', 'Tryout', '/tryout', 'HelpCircle', 1, 8, 'Simulasi ujian tertulis berbasis komputer (CBT) persiapan evaluasi BAPETEN dengan batas waktu.', NOW(), NOW()),
('sertifikat', 'Sertifikat', '/sertifikat', 'Award', 1, 9, 'Unduh e-sertifikat kelulusan resmi ber-QR Code legalitas BAPETEN setelah menyelesaikan seluruh tahapan.', NOW(), NOW());

-- 10. SAMPLE LMS MODULES
INSERT INTO `lms_modules` (`id`, `training_category`, `day_number`, `title`, `order_index`, `is_published`, `created_at`, `updated_at`)
VALUES
(1, 'PPR_ANALISIS', 1, 'Modul 1.1 - Dasar Fisika Radiasi & Interaksi Radiasi dengan Materi', 1, 1, NOW(), NOW()),
(2, 'PPR_ANALISIS', 1, 'Modul 1.2 - Regulasi Ketenaganukliran & Peraturan BAPETEN Terkini', 2, 1, NOW(), NOW()),
(3, 'PPR_ANALISIS', 2, 'Modul 2.1 - Sistem Pembatasan Dosis & Prinsip ALARA', 3, 1, NOW(), NOW()),
(4, 'PPR_ANALISIS', 2, 'Modul 2.2 - Alat Ukur Radiasi, Dosimetri & Kalibrasi', 4, 1, NOW(), NOW()),
(5, 'PPR_ANALISIS', 3, 'Modul 3.1 - Praktikum Lapangan & Prosedur Keadaan Darurat', 5, 1, NOW(), NOW()),
(6, 'PPR_BAGASI', 1, 'Modul 1.1 - Dasar Fisika Radiasi Pesawat Sinar-X Bagasi', 1, 1, NOW(), NOW()),
(7, 'PPR_BAGASI', 2, 'Modul 2.1 - Operasional & Proteksi Keselamatan Pesawat Sinar-X', 2, 1, NOW(), NOW()),
(8, 'PPR_BAGASI', 3, 'Modul 3.1 - Praktikum & Simulasi Ujian SIB BAPETEN', 3, 1, NOW(), NOW());

-- 11. SAMPLE QUESTIONS
INSERT INTO `questions` (`id`, `category`, `topic`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `option_e`, `correct_answer`, `explanation`, `difficulty`, `is_active`, `created_at`, `updated_at`)
VALUES
(1, 'PPR_ANALISIS', 'Regulasi BAPETEN', 'Berdasarkan Peraturan BAPETEN No. 4 Tahun 2024, Nilai Batas Dosis (NBD) efektif untuk pekerja radiasi adalah...', '10 mSv per tahun', '20 mSv per tahun rata-rata dalam 5 tahun', '50 mSv per tahun', '100 mSv dalam 5 tahun', '5 mSv per tahun', 'B', 'Berdasarkan Perba BAPETEN No. 4 Tahun 2024, NBD efektif untuk pekerja radiasi adalah 20 mSv per tahun rata-rata dalam 5 tahun berturut-turut, dengan nilai maksimum 50 mSv dalam satu tahun.', 1, 1, NOW(), NOW()),
(2, 'PPR_ANALISIS', 'Fisika Radiasi', 'Suatu sumber radiasi Co-60 memiliki aktivitas awal 100 Ci. Jika waktu paruh Co-60 adalah 5,27 tahun, berapakah sisa aktivitas sumber tersebut setelah 10,54 tahun?', '50 Ci', '25 Ci', '12,5 Ci', '6,25 Ci', '10 Ci', 'B', 'Menggunakan rumus peluruhan radioaktif: N(t) = N0 × (1/2)^(t/T½) = 100 × (1/2)^2 = 25 Ci', 2, 1, NOW(), NOW()),
(3, 'PPR_ANALISIS', 'Efek Biologi Radiasi', 'Efek stokastik dari radiasi pengion ditandai dengan...', 'Ada nilai ambang dosis yang jelas', 'Keparahan efek bergantung pada dosis', 'Probabilitas terjadinya efek bergantung pada dosis, tanpa nilai ambang', 'Efek langsung terlihat dalam waktu singkat', 'Hanya terjadi pada dosis tinggi', 'C', 'Efek stokastik (seperti kanker dan efek genetik) tidak memiliki nilai ambang dosis. Probabilitas terjadinya efek meningkat seiring peningkatan dosis, namun keparahan efek tidak bergantung pada dosis.', 1, 1, NOW(), NOW()),
(4, 'PPR_ANALISIS', 'Alat Ukur Radiasi', 'Detektor yang paling sesuai untuk mengukur laju dosis gamma di lapangan dengan respons yang cepat adalah...', 'Dosimeter TLD', 'Film badge', 'Ionization chamber (kamar ionisasi)', 'Bubble detector', 'Etched track detector', 'C', 'Ionization chamber (kamar ionisasi) memberikan respons real-time dan akurat untuk pengukuran laju dosis gamma di lapangan.', 2, 1, NOW(), NOW()),
(5, 'PPR_ANALISIS', 'Proteksi Spesifik', 'Prinsip ALARA dalam proteksi radiasi merupakan singkatan dari...', 'Always Low And Radiation Achievable', 'As Low As Reasonably Achievable', 'Applied Limit And Radiation Acceptable', 'Authorized Level And Radiation Allowance', 'Achieved Limit As Radiation Allows', 'B', 'ALARA merupakan singkatan dari "As Low As Reasonably Achievable", yaitu prinsip optimisasi proteksi radiasi untuk meminimalkan paparan radiasi serendah yang dapat dicapai secara wajar.', 1, 1, NOW(), NOW()),
(6, 'PPR_BAGASI', 'Regulasi BAPETEN', 'Pekerja yang mengoperasikan pesawat sinar X pemindai bagasi dikategorikan sebagai...', 'Pekerja tidak terpapar radiasi', 'Masyarakat umum', 'Pekerja Radiasi yang harus dipantau dosisnya', 'Petugas Proteksi Radiasi', 'Pasien yang menjalani prosedur medis', 'C', 'Operator pesawat sinar X pemindai bagasi dikategorikan sebagai Pekerja Radiasi berdasarkan Perba BAPETEN, sehingga wajib dipantau dosisnya menggunakan dosimeter personal.', 1, 1, NOW(), NOW());

-- 12. QUESTION CATEGORY LINKS (MULTI-CATEGORY)
INSERT INTO `question_categories` (`question_id`, `category_id`, `created_at`)
VALUES
(1, 1, NOW()), (1, 2, NOW()), (1, 3, NOW()), (1, 4, NOW()),
(2, 1, NOW()), (2, 2, NOW()), (2, 4, NOW()),
(3, 1, NOW()), (3, 2, NOW()), (3, 3, NOW()), (3, 4, NOW()),
(4, 1, NOW()), (4, 4, NOW()),
(5, 1, NOW()), (5, 2, NOW()), (5, 3, NOW()), (5, 4, NOW()),
(6, 2, NOW()), (6, 4, NOW());
