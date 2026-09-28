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

