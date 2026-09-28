-- =========================================================================
-- INITIAL SEED DATA FOR ALARA HOSTINGER DATABASE
-- =========================================================================

-- 1. USERS
INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `nik`, `phone_number`, `role`, `created_at`, `updated_at`)
VALUES
(1, 'admin@alara.co.id', '__ADMIN_HASH__', 'Admin ALARA', '3171010101010001', '08123456789', 'ADMIN', NOW(), NOW()),
(2, 'instructor@alara.co.id', '__INSTRUCTOR_HASH__', 'Ir. H. Expert Proteksi, M.Si.', '3171010101010002', '08198765432', 'INSTRUCTOR', NOW(), NOW()),
(3, 'peserta@alara.co.id', '__PESERTA_HASH__', 'Budi Santoso', '3172091238910001', '08112345678', 'PESERTA', NOW(), NOW()),
(4, 'sponsor@alara.co.id', '__SPONSOR_HASH__', 'PT Medika Radiasi', '3171010101010004', '02112345678', 'SPONSOR', NOW(), NOW());

-- 2. MASTER TRAINING CATEGORIES
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
(9, 'PPR_MEDIK_2', 'PPR Medik Tingkat 2', 'Pelatihan Calon PPR Medik Tingkat 2 (Radiologi Diagnostik & Intervensional)', 9, 1, NOW(), NOW());

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
