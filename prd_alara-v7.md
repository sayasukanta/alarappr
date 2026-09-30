# Project Requirement Document (PRD) v7.0
## Aplikasi Sistem Manajemen Pelatihan Proteksi Radiasi (ALARA Training System)

**Instansi:** CV. Hikmat Proteksi ALARA  
**Pengakuan/Izin Resmi:** KTUN BAPETEN No. 07998.722.1.040726  
**Landasan Regulasi Utama:** Peraturan BAPETEN No. 4 Tahun 2024  
**Tanggal Dokumen:** 20 September 2026  
**Versi Dokumen:** 6.0 (Updated dengan Detail Modul E-Sertifikat & Laporan Kelulusan BAPETEN)  

---

### 1. Pendahuluan & Ringkasan Eksekutif
* **Latar Belakang:** CV. Hikmat Proteksi ALARA merupakan Lembaga Pelatihan Ketenaganukliran resmi di Indonesia yang diakui oleh Badan Pengawas Tenaga Nuklir (BAPETEN) berdasarkan Keputusan KTUN No. 07998.722.1.040726. Untuk meningkatkan efisiensi operasional dan memberikan pengalaman pembelajaran digital yang modern, efisien, dan terstruktur, CV. Hikmat Proteksi ALARA membutuhkan pengembangan platform digital terintegrasi untuk pengelolaan pendaftaran, proses pembelajaran (LMS), hingga pelaporan ujian lisensi BAPETEN.
* **Tujuan Aplikasi:**
  1. **Digitalisasi Registrasi & Pembayaran:** Menggantikan proses manual/Gform menjadi portal pendaftaran online terpadu yang memfasilitasi verifikasi berkas administrasi dan pembayaran.
  2. **Learning Management System (LMS) Berbasis HAKI:** Menyediakan sarana distribusi modul pelatihan interaktif berhak cipta (HAKI) sesuai Peraturan BAPETEN No. 4 Tahun 2024.
  3. **Manajemen Ujian & Kelulusan:** Memfasilitasi simulasi ujian (tryout) serta pencatatan dan rekapitulasi tingkat kelulusan ujian lisensi BAPETEN.
* **Visi & Misi Acuan:** Mengacu pada visi menjadi Lembaga Pelatihan Ketenaganukliran dan Konsultan Proteksi & Keselamatan Radiasi yang Unggul, Profesional & Berintegritas, serta misi menerapkan prinsip dasar proteksi radiasi (*Azas Justifikasi, Limitasi, dan Optimisasi / ALARA*).

---

### 2. Target Pengguna (User Personas)
1. **Calon Peserta / Peserta Didik:**
   * Pekerja radiasi, calon Petugas Proteksi Radiasi (PPR), operator *gauging*, teknisi pemindai bagasi, perawat, atau dokter di fasilitas radiasi/klinis.
   * *Akses & Fitur:* Registrasi akun, pengunggahan dokumen prasyarat, pelaksanaan tryout, pengunduhan modul digital, dan pemantauan jadwal ujian BAPETEN.
2. **Administrator & Sekretariat ALARA:**
   * *Akses & Fitur:* Dashboard verifikasi berkas prasyarat (MCU, Ijazah, KTP, Surat Kerja), validasi pembayaran bank, pengaturan *batch* jadwal, presensi harian, dan penerbitan laporan.
3. **Tim Pengajar & Expert ALARA:**
   * Pakar proteksi radiasi, mantan Inspektur BAPETEN, dan alumni IAEA-Post Graduate.
   * *Akses & Fitur:* Pengelolaan materi modul, pemberian kuis/tugas, pemantauan logbook praktikum, serta evaluasi hasil tryout peserta.
4. **Instansi / Perusahaan Sponsor:**
   * Perusahaan pemanfaat tenaga nuklir (industri, rumah sakit, bandara/keamanan) yang membiayai peserta.
   * *Akses & Fitur:* Pendaftaran kolektif karyawan, pengunggahan NPWP perusahaan pembiaya, pemantauan progress dan laporan kelulusan peserta sponsor.

---

### 3. Spesifikasi Program Pelatihan
Aplikasi harus memfasilitasi tiga kategori utama pelatihan yang diselenggarakan:
1. **Pelatihan Calon PPR Analisis Menggunakan Sumber Radiasi Pengion:**
   * **Durasi:** 3 (tiga) hari pelatihan + Ujian Lisensi BAPETEN.
   * **Biaya Investasi:** Rp 7.000.000 per peserta (termasuk biaya ujian lisensi BAPETEN).
   * **Prasyarat Khusus:** Ijazah minimal D3 Eksakta/Teknik.
2. **Pelatihan Calon PPR Pemindai Bagasi atau Barang Lainnya Menggunakan Sumber Radiasi Pengion:**
   * **Durasi:** 3 (tiga) hari pelatihan + Ujian Lisensi BAPETEN.
   * **Biaya Investasi:** Rp 4.000.000 per peserta (termasuk biaya ujian lisensi BAPETEN).
   * **Prasyarat Khusus:** Ijazah minimal D3 Eksakta/Teknik, Surat Keterangan Bekerja.
3. **Pelatihan Proteksi dan Keselamatan Radiasi (PKR) Pekerja Radiasi:**
   * Khusus untuk Operator, Petugas Analisis Sampel, Petugas Perawatan, Perawat, dan Dokter di daerah radiasi.

---

### 4. Spesifikasi Kebutuhan Fungsional (Functional Requirements)

#### **A. Modul Pendaftaran & Pembayaran (Registration & Payment Gateway)**
* **F-01 Formulir Pendaftaran Interaktif:** Pemilihan jenis pelatihan (Analisis / Pemindai Bagasi / PKR Pekerja Radiasi) dan jadwal *batch* yang dibuka.
* **F-02 Manajemen Verifikasi Dokumen Prasyarat:** Fitur unggah dan verifikasi dokumen otomatis/manual dengan daftar periksa:
  * Salinan Ijazah (minimal D3 Eksakta / Teknik).
  * Pas foto berwarna terbaru 3x4 latar belakang merah (2 lembar).
  * Salinan KTP & Surat Keterangan Bekerja.
  * Hasil Medical Check-Up (MCU) lengkap (pemeriksaan darah & urine) yang berlaku kurang dari 1 (satu) tahun.
  * Salinan NPWP instansi/perorangan pembiaya.
* **F-03 Verifikasi Pembayaran Transfer Bank:** Rekapitulasi pembayaran dengan pengunggahan bukti transfer ke Rekening Bank Mandiri Cabang Jakarta Pahlawan Revolusi No. 166-00-0733926-0 a.n. CV Hikmat Proteksi ALARA.
* **F-04 Dashboard Approval Administrator:** Panel bagi admin untuk menyetujui (*approve*) atau menolak (*reject* beserta alasan) pendaftaran berdasarkan validitas dokumen dan pembayaran.

#### **B. Modul Learning Management System (LMS) & Presensi**
* **F-05 Modul Digital Berbasis HAKI:** Pembaca modul internal terproteksi (mencegah duplikasi/unduh ilegal) untuk modul pelatihan yang disusun sesuai Peraturan BAPETEN No. 4 Tahun 2024.
* **F-06 Sistem Presensi 3 Hari Pelatihan:** Pencatatan kehadiran digital harian peserta selama 3 hari masa pelatihan.
* **F-07 Bank Soal & Tryout Online:** Portal simulasi ujian teori BAPETEN dengan penilaian otomatis dan analisis kelemahan materi peserta.

#### **C. Modul Praktikum Lapangan & Ujian Lisensi BAPETEN**
* **F-08 Logbook Praktikum Digital:** Pencatatan dan penilaian kegiatan praktikum implementasi program proteksi radiasi bekerja sama dengan pemegang perizinan berusaha (contoh: Menara BCA / fasilitas x-ray bagasi).
* **F-09 Penjadwalan Ujian BAPETEN:** Manajemen jadwal ujian lisensi resmi BAPETEN (mencakup ujian teori, ujian praktik, dan wawancara).
* **F-10 Rekapitulasi Kelulusan & Analytics:** Tracking histori kelulusan peserta per *batch* (contoh: pencatatan statistik kelulusan 89% pada Batch 1 PPR Analisis).

#### **D. Modul Fasilitas & Layanan Peserta**
* **F-11 Tracking Fasilitas Peserta:** Pencatatan distribusi perlengkapan peserta (Kaos seragam ALARA, ATK termasuk kalkulator scientific, dan konsumsi).
* **F-12 Otomasi E-Sertifikat Pelatihan:** Penerbitan sertifikat telah mengikuti pelatihan secara otomatis setelah peserta menyelesaikan seluruh sesi 3 hari pelatihan.

---

### 5. Detail Alur Pengguna (User Flows & Workflows)

#### **A. User Flow 1: Pendaftaran & Unggah Berkas Prasyarat (Peserta)**
1. **Langkah 1 (Kunjungan & Registrasi):** Calon peserta mengunjungi portal web ALARA Training System, memilih tombol *"Daftar Pelatihan"*, dan membuat akun dengan email/no HP aktif.
2. **Langkah 2 (Pilihan Program & Batch):** Peserta memilih salah satu dari 3 kategori program pelatihan (PPR Analisis / PPR Pemindai Bagasi / PKR Pekerja Radiasi) serta memilih jadwal *Batch* yang tersedia.
3. **Langkah 3 (Pengisian Data Profil & Sponsor):**
   * Mengisi data diri lengkap (Nama, NIK KTP, Tempat/Tanggal Lahir, Alamat, Instansi Pekerjaan).
   * Mengisi data sponsor pembiaya (Mandiri/Perusahaan) beserta nomor NPWP untuk kebutuhan penagihan/faktur.
4. **Langkah 4 (Pengunggahan Dokumen Checklist):** Peserta mengunggah berkas persyaratan dalam format PDF/JPG:
   * [ ] Salinan Ijazah (Validasi otomatis: Sistem memverifikasi tingkat pendidikan minimal D3 Eksakta/Teknik).
   * [ ] Hasil Medical Check-Up (MCU) lengkap (Darah & Urine) dengan tanggal pemeriksaan < 1 tahun.
   * [ ] Salinan KTP & Surat Keterangan Bekerja dari Perusahaan.
   * [ ] Pasfoto 3x4 latar belakang merah.
   * [ ] NPWP Perusahaan / Perorangan Pembiaya.
5. **Langkah 5 (Submission & Tagihan):** Peserta mengonfirmasi pendaftaran. Sistem menerbitkan Invoice Tagihan (Rp 7.000.000 untuk PPR Analisis / Rp 4.000.000 untuk PPR Bagasi) serta menampilkan petunjuk pembayaran ke Rekening Bank Mandiri ALARA. Status pendaftaran berubah menjadi `MENUNGGU_PEMBAYARAN`.

---

#### **B. User Flow 2: Pembayaran & Verifikasi Bank Mandiri**
1. **Langkah 1 (Transfer Bank):** Peserta/Sponsor melakukan pembayaran via transfer ke Bank Mandiri No. Rec `166-00-0733926-0` a.n. `CV Hikmat Proteksi ALARA`.
2. **Langkah 2 (Unggah Bukti Transfer):** Peserta masuk ke Dashboard Peserta, memilih menu *"Konfirmasi Pembayaran"*, mengunggah struk/bukti transfer, dan mengisikan tanggal serta nama pemilik rekening pengirim.
3. **Langkah 3 (Verifikasi Admin):** Admin Keuangan ALARA menerima notifikasi pendaftaran baru. Admin mencocokkan mutasi rekening Bank Mandiri dengan unggahan bukti transfer.
4. **Langkah 4 (Update Status):**
   * Jika Valid: Admin mengeklik `Approve Pembayaran`. Status berubah menjadi `PEMBAYARAN_TERVERIFIKASI`.
   * Jika Tidak Valid: Admin mengeklik `Reject Pembayaran` dengan memberikan catatan alasan reject (misal: nominal kurang, bukti buram). Sistem mengirimkan notifikasi revisi ke email peserta.

---

#### **C. User Flow 3: Alur Review & Verifikasi Berkas Administrasi (Admin Sekretariat)**
```
[Calon Peserta] --(Upload MCU, Ijazah, KTP)--> [Sistem / Database]
                                                        │
                                                        ▼
                                           [Dashboard Review Admin]
                                                        │
                                      ┌─────────────────┴─────────────────┐
                                      ▼                                   ▼
                         [Dokumen Lengkap & Valid]         [Dokumen Buram/Tidak Sesuai]
                                      │                                   │
                                      ▼                                   ▼
                           (Approve Administrasi)               (Reject Administrasi)
                                      │                                   │
                                      ▼                                   ▼
                           [Status: SIAP_PELATIHAN]              [Notifikasi Revisi Berkas]
                                      │                                   │
                                      ▼                                   ▼
                          (Peserta Masuk LMS & Kelas)           (Peserta Re-upload Berkas)
```

---

### 6. Struktur Basis Data (Database Entities Schema)

1. **Table: `users`**
   * `id` (PK), `email`, `password_hash`, `full_name`, `nik`, `phone_number`, `role` (`PESERTA`, `ADMIN`, `INSTRUCTOR`, `SPONSOR`), `created_at`.
2. **Table: `trainings`**
   * `id` (PK), `category` (`PPR_ANALISIS`, `PPR_BAGASI`, `PKR_PEKERJA`), `title`, `price` (Decimal), `duration_days` (Int, default 3), `description`.
3. **Table: `training_batches`**
   * `id` (PK), `training_id` (FK), `batch_number`, `start_date`, `end_date`, `quota`, `location`.
4. **Table: `registrations`**
   * `id` (PK), `user_id` (FK), `batch_id` (FK), `registration_status` (`DRAFT`, `MENUNGGU_VERIFIKASI`, `APPROVED`, `REJECTED`), `payment_status` (`UNPAID`, `PENDING_VERIFICATION`, `PAID`), `sponsor_name`, `sponsor_npwp`, `created_at`.
5. **Table: `registration_documents`**
   * `id` (PK), `registration_id` (FK), `doc_type` (`IJAZAH`, `MCU`, `KTP`, `SURAT_KERJA`, `PASFOTO`, `NPWP`), `file_path`, `is_valid` (Boolean), `notes` (Text), `verified_by` (FK), `verified_at`.
6. **Table: `payments`**
   * `id` (PK), `registration_id` (FK), `amount`, `bank_name` (default: `Mandiri`), `proof_file_path`, `payment_date`, `status` (`PENDING`, `VERIFIED`, `REJECTED`).
7. **Table: `attendances`**
   * `id` (PK), `registration_id` (FK), `day_number` (1..3), `session_type` (`MORNING`, `AFTERNOON`), `checkin_time`, `status` (`HADIR`, `IZIN`, `ALPA`).
8. **Table: `exam_results`**
   * `id` (PK), `registration_id` (FK), `tryout_score` (Float), `bapeten_theory_score` (Float), `bapeten_practical_score` (Float), `bapeten_interview_score` (Float), `final_status` (`LULUS`, `TIDAK_LULUS`), `certificate_number`.

9. **Table: `instructors`**
   * `id` (PK), `user_id` (FK), `bapeten_license_no`, `license_expiry_date`, `iaea_certification`, `specialization` (`PPR_ANALISIS`, `PPR_BAGASI`, `PKR`), `bio_summary`, `status` (`ACTIVE`, `INACTIVE`).
10. **Table: `instructor_assignments`**
   * `id` (PK), `batch_id` (FK), `instructor_id` (FK), `session_name`, `teaching_date`, `start_time`, `end_time`, `session_type` (`THEORY`, `PRACTICAL`, `TRYOUT_REVIEW`), `teaching_hours`.
11. **Table: `instructor_evaluations`**
   * `id` (PK), `batch_id` (FK), `instructor_id` (FK), `participant_id` (FK), `rating_score` (Float 1-5), `feedback_notes`, `created_at`.


---

### 7. User Stories & Kriteria Penerimaan (Acceptance Criteria) — Modul Verifikasi

#### **US-VER-01: Verifikasi Kelengkapan & Validitas Ijazah (PPR Prerequisite Check)**
* **User Story:**
  * *As an* Admin Sekretariat ALARA,
  * *I want to* memeriksa, memverifikasi, dan mencocokkan dokumen ijazah calon peserta pelatihan (minimal D3 Eksakta / Teknik),
  * *So that* calon peserta dipastikan memenuhi kualifikasi standar BAPETEN sebelum mengikuti pelatihan PPR Analisis atau PPR Pemindai Bagasi.
* **Acceptance Criteria (AC):**
  1. **AC 1.1 (Document Preview):** Sistem menampilkan *viewer* pratinjau ijazah (format PDF/JPG) langsung di dashboard verifikasi admin tanpa perlu mengunduh file secara manual.
  2. **AC 1.2 (Qualification Validation):** Admin dapat memilih opsi status verifikasi ijazah: `Valid / Sesuai` atau `Tidak Sesuai Kualifikasi`.
  3. **AC 1.3 (Rejection Reason & Notification):** Jika ditolak/tidak sesuai (misal: pendidikan di bawah D3 atau Non-Eksakta), admin wajib memilih/mengisi alasan penolakan. Sistem secara otomatis mengirimkan notifikasi email & WhatsApp ke peserta berisi instruksi perbaikan/klarifikasi.
  4. **AC 1.4 (Audit Trail):** Sistem mencatat timestamp, nama admin pemeriksa, dan catatan verifikasi ke dalam tabel `registration_documents`.

#### **US-VER-02: Verifikasi Masa Berlaku & Kelengkapan Hasil Medical Check-Up (MCU)**
* **User Story:**
  * *As an* Admin Sekretariat ALARA,
  * *I want to* memvalidasi tanggal terbit dan kelengkapan komponen hasil Medical Check-Up (MCU) darah rutin dan urine rutin calon peserta,
  * *So that* peserta dipastikan secara medis sehat dan memenuhi batas waktu keberlakuan MCU (< 1 tahun dari tanggal mulai pelatihan) sesuai regulasi keselamatan BAPETEN.
* **Acceptance Criteria (AC):**
  1. **AC 2.1 (Expiry Date Validation):** Admin memasukkan *Tanggal Terbit MCU* dari dokumen. Jika tanggal terbit MCU > 1 tahun dari tanggal mulai *batch* pelatihan, sistem menampilkan peringatan otomatis `MCU KEDALUWARSA`.
  2. **AC 2.2 (Required Lab Checklist):** Dashboard menyediakan *checkbox* verifikasi untuk dua komponen wajib:
     - [x] Pemeriksaan Darah Lengkap/Rutin
     - [x] Pemeriksaan Urine Lengkap/Rutin
  3. **AC 2.3 (Sensitive Data Encryption & Access Control):** Berkas MCU terenkripsi (AES-256) dan hanya dapat diakses oleh Admin Sekretariat yang memiliki izin hak akses khusus (*role-based access control*).

#### **US-VER-03: Verifikasi Identitas (KTP), Pas Foto Latar Merah, & Surat Keterangan Bekerja**
* **User Story:**
  * *As an* Admin Sekretariat ALARA,
  * *I want to* memeriksa kesesuaian KTP, pas foto 3x4 latar belakang merah, serta Surat Keterangan Bekerja dari perusahaan/instansi peserta,
  * *So that* data pribadi peserta valid untuk penerbitan sertifikat pelatihan dan pendaftaran ujian lisensi resmi BAPETEN.
* **Acceptance Criteria (AC):**
  1. **AC 3.1 (Identity Match):** Admin mencocokkan Nama Lengkap, NIK KTP, dan Tempat/Tanggal Lahir antara form pendaftaran dengan dokumen KTP yang diunggah.
  2. **AC 3.2 (Photo Requirement Check):** Admin memverifikasi spesifikasi pas foto (ukuran 3x4, latar belakang warna merah, wajah tampak jelas). Jika latar foto tidak merah atau buram, admin dapat meminta revisi foto.
  3. **AC 3.3 (Employment Verification):** Admin memverifikasi Surat Keterangan Bekerja/Surat Tugas dari instansi pemanfaat tenaga nuklir/radiasi untuk memastikan peserta adalah pekerja radiasi / calon PPR terdaftar.

#### **US-VER-04: Verifikasi Pembayaran Transfer Bank Mandiri & Pencatatan Tagihan**
* **User Story:**
  * *As an* Admin Keuangan ALARA,
  * *I want to* mencocokkan unggahan bukti transfer dengan mutasi rekening Bank Mandiri CV Hikmat Proteksi ALARA (No. 166-00-0733926-0),
  * *So that* status pembayaran peserta tervalidasi `LUNAS` dan slot kursi pada *batch* pelatihan terkunci secara resmi.
* **Acceptance Criteria (AC):**
  1. **AC 4.1 (Payment Reconciliation):** Admin mengecek nominal transfer (Rp 7.000.000 untuk PPR Analisis / Rp 4.000.000 untuk PPR Bagasi), nama pemilik rekening pengirim, dan tanggal transfer.
  2. **AC 4.2 (Status Update & Seat Lock):** Setelah admin menekan `Konfirmasi Pembayaran`, status pembayaran peserta diubah dari `PENDING_VERIFICATION` menjadi `PAID`, dan sistem secara otomatis mengurangi kuota sisa *batch*.
  3. **AC 4.3 (Invoice & E-Receipt Generation):** Sistem menerbitkan Bukti Kuitansi Pembayaran Resmi ALARA berbentuk PDF dengan nomor kuitansi unik yang dapat diunduh oleh peserta/sponsor.

#### **US-VER-05: Verifikasi Pendaftaran Kolektif Sponsor Perusahaan & NPWP**
* **User Story:**
  * *As an* Admin Keuangan & Sekretariat ALARA,
  * *I want to* melakukan verifikasi massal (*batch verification*) untuk pendaftaran kelompok karyawan yang dibiayai oleh perusahaan sponsor beserta NPWP perusahaan,
  * *So that* penagihan faktur dan verifikasi administrasi grup perusahaan dapat diproses secara efisien dalam satu pintu.
* **Acceptance Criteria (AC):**
  1. **AC 5.1 (Sponsor Dashboard View):** Dashboard menampilkan daftar seluruh peserta yang terhubung dengan NPWP / Nama Perusahaan Sponsor yang sama.
  2. **AC 5.2 (Bulk Verification & Combined Invoice):** Admin dapat melakukan *batch approval* untuk grup peserta sponsor setelah pembayaran kolektif diterima dari perusahaan pengirim.
  3. **AC 5.3 (NPWP Validation):** Admin memvalidasi salinan kartu NPWP perusahaan untuk penerbitan Faktur Pajak / Penagihan Resmi CV Hikmat Proteksi ALARA.

#### **US-VER-06: Notifikasi Real-time Status Verifikasi & Portal Revisi Peserta**
* **User Story:**
  * *As a* Calon Peserta Pelatihan,
  * *I want to* menerima notifikasi perubahan status verifikasi berkas dan akses mengunggah ulang dokumen jika ada perbaikan,
  * *So that* saya dapat segera memperbaiki berkas yang ditolak dan mendapatkan kepastian keikutsertaan sebelum kelas dimulai.
* **Acceptance Criteria (AC):**
  1. **AC 6.1 (Automated Alerts):** Setiap kali status verifikasi berubah (`APPROVED` / `REVISION_NEEDED` / `REJECTED`), sistem mengirimkan Email & WhatsApp Alert otomatis secara instan.
  2. **AC 6.2 (Revision Portal):** Pada Dashboard Peserta, berkas yang membutuhkan revisi ditandai dengan warna merah beserta rincian catatan admin (misal: *"Hasil MCU kedaluwarsa, mohon unggah MCU terbaru"*).
  3. **AC 6.3 (Re-submit Workflow):** Peserta dapat mengunggah ulang file pengganti. Setelah diunggah, status berkas otomatis kembali menjadi `MENUNGGU_VERIFIKASI` di dashboard admin.

---

### 8. Kebutuhan Non-Fungsional (Non-Functional Requirements)
* **Keamanan Data & Privasi (Data Security & Privacy):** Rekam medis MCU dan dokumen identitas (KTP) terenkripsi dengan standar enkripsi data (AES-256) untuk menjaga privasi peserta.
* **Perlindungan Hak Cipta (Intellectual Property Protection):** Modul digital dilengkapi *dynamic watermark* (nama & email peserta) untuk memproteksi modul ber-HAKI karya tim pakar ALARA.
* **Kepatuhan Regulasi (Regulatory Compliance):** Seluruh alur data pelatihan disesuaikan dengan ketentuan standar kompetensi Peraturan BAPETEN No. 4 Tahun 2024 dan keputusan KTUN BAPETEN No. 07998.722.1.040726.
* **Aksesibilitas Multi-Platform:** Aplikasi dapat diakses secara responsif via web browser komputer maupun perangkat *mobile* (smartphone/tablet).

---

### 9. Rencana Tahapan Pelaksanaan (Development Roadmap)
* **Fase 1 (Minggu 1 - 4):** Pengembangan Portal Pendaftaran, Unggah Dokumen Prasyarat (MCU, Ijazah, KTP, NPWP), dan Modul Verifikasi Pembayaran Bank Mandiri.
* **Fase 2 (Minggu 5 - 8):** Pembangunan LMS Modul Ber-HAKI, Sistem Presensi 3 Hari, dan Logbook Praktikum Lapangan.
* **Fase 3 (Minggu 9 - 12):** Pembangunan Engine Tryout Soal BAPETEN, Otomasi Sertifikat, Dashboard Rekap Kelulusan, serta Pengujian Sistem (UAT).


---

### 9. Spesifikasi Detail Modul LMS & Player Modul Ber-HAKI

#### **A. Arsitektur Keamanan & Proteksi HAKI (Digital Rights Management / DRM)**
Mengingat modul pelatihan disusun secara eksklusif oleh Tim Expert ALARA (Eks-Inspektur BAPETEN & Alumni IAEA-Post Graduate) dan dilindungi oleh Hak Kekayaan Intelektual (HAKI) [14, 15, 17, 22], sistem LMS harus menerapkan fitur keamanan ketat:

1. **Dynamic Watermarking Engine:**
   * Setiap halaman modul digital yang dibuka peserta akan di-overlay dengan watermark transparan berulang (diagonal 45°).
   * Watermark memuat: `[Nama Lengkap Peserta] | [NIK KTP] | [IP Address] | [Timestamp Akses]`.
2. **Anti-Download & Anti-Print Enforcement:**
   * Modul tidak disajikan dalam bentuk file PDF mentah/downloadable, melainkan di-render menggunakan *Encrypted Canvas Rendering Engine* (Canvas HTML5).
   * Menonaktifkan fungsi Klik Kanan (*Disable Context Menu*), *Copy-Paste*, *Print Screen*, dan pintasan keyboard (`Ctrl+P`, `Ctrl+S`, `Ctrl+C`, `F12 / DevTools`).
3. **Session Locking & Single Active Device:**
   * Satu akun peserta hanya dapat membuka modul pada 1 (satu) perangkat aktif secara bersamaan.
   * Jika peserta login di perangkat lain, sesi pada perangkat sebelumnya otomatis terputus (*force logout*).
4. **Time-Bound Access Control:**
   * Akses modul HAKI hanya aktif mulai dari H-2 jadwal pelatihan hingga 14 hari setelah pelaksanaan ujian lisensi BAPETEN.

---

#### **B. Spesifikasi Fungsional LMS (Functional Requirements)**

* **LMS-01: Structure & Curriculum Management (Kurikulum 3 Hari):**
  * Pengelompokan materi berdasarkan 3 Kategori Pelatihan utama [10, 11, 12]:
    1. *PPR Analisis Menggunakan Sumber Radiasi Pengion* [12, 17, 24].
    2. *PPR Pemindai Bagasi atau Barang Lainnya* [12, 17, 23].
    3. *Proteksi & Keselamatan Radiasi (PKR) Pekerja Radiasi* [13, 14].
  * Struktur hirarki 3 hari pelatihan: `Hari 1 (Teori Dasar & Regulasi)` -> `Hari 2 (Proteksi Spesifik & Alat Ukur)` -> `Hari 3 (Praktikum Lapangan & Simulasi Ujian)` [10, 19, 22].

* **LMS-02: Interactive Player & Scientific Calculator Widget:**
  * Sidebar navigasi bab/modul dengan *progress indicator* (% penyelesaian).
  * Widget **Kalkulator Scientific Digital** bawaan di dalam player (sesuai fasilitas standar pelatihan ALARA yang memberikan kalkulator scientific) [22] untuk mempermudah perhitungan rumus peluruhan radiasi, *Inverse Square Law*, dan tebal perisai radiasi.

* **LMS-03: Presensi Digital 3 Hari Pelatihan:**
  * Fitur *Selfie Check-in* & Geolocation GPS untuk mencatat kehadiran peserta pada sesi pagi dan sesi siang selama 3 hari pelatihan [10, 19, 22].

* **LMS-04: Digital Logbook Praktikum Lapangan:**
  * Pencatatan hasil praktikum implementasi program proteksi radiasi (contoh: praktikum pemindai x-ray bagasi di Menara BCA) [4, 5, 22].
  * Form input data pengukuran: *Tingkat Laju Dosis Radiasi*, *Kondisi Interlock*, dan *Penggunaan Dosimeter saku/TLD*.
  * Fitur *Digital Sign-off* dari Tim Pengajar Expert ALARA [15, 16, 22].

* **LMS-05: Simulation Engine & Bank Soal Tryout BAPETEN:**
  * Engine simulasi ujian lisensi BAPETEN dengan tipe soal pilihan ganda & studi kasus [10, 19].
  * Fitur *Timer Countdown*, penanda soal (*bookmark/ragu-ragu*), serta pembahasan otomatis dan analisis kelemahan topik peserta setelah tryout selesai.

---

#### **C. Wireframe Layout Interface LMS Player (Desktop & Mobile)**

```
+---------------------------------------------------------------------------------------------------+
| [ALARA LOGO] LMS Proteksi Radiasi - PPR Pemindai Bagasi            [User: Budi Santoso] [Logout]  |
+---------------------------------------------------------------------------------------------------+
| Progress Pelatihan: [=========== 65% ===========]  (Hari 2 dari 3 Hari Pelatihan)                 |
+-------------------------------------------------+-------------------------------------------------+
| [SIDEBAR NAVIGASI MODUL - 30%]                  | [MAIN CANVAS: SECURE MODUL READER - 70%]        |
|                                                 |                                                 |
|  [v] HARI 1: REGULASI & PRINSIP ALARA           |  BAPETEN Perba No. 4/2024 | Hal 14 dari 45        |
|     [x] Modul 1.1 Dasar Fisika Radiasi          |  +-------------------------------------------+  |
|     [x] Modul 1.2 Regulasi BAPETEN Perba 4/2024  |  | WATERMARK: Budi Santoso - NIK 31720912389  |  |
|                                                 |  |                                           |  |
|  [>] HARI 2: PROTEKSI RADIASI BAGASI            |  |  BAB 3: MANAJEMEN PROTEKSI RADIASI        |  |
|     (*) Modul 2.1 Pengoperasian Alat X-Ray [>]  |  |  Prinsip Pembatasan Dosis (Limitasi)      |  |
|     [ ] Modul 2.2 Penentuan Daerah Radiasi     |  |  Nilai Batas Dosis (NBD) Pekerja Radiasi  |  |
|     [ ] Video Praktikum Menara BCA              |  |  adalah 20 mSv/tahun rata-rata...         |  |
|                                                 |  |                                           |  |
|  [ ] HARI 3: PRAKTIKUM & SIMULASI UJIAN         |  +-------------------------------------------+  |
|     [ ] Logbook Praktikum Lapangan              |                                                 |
|     [ ] Tryout Ujian Lisensi BAPETEN            |  [ Toolbar Player: ]                            |
|                                                 |  [ < Halaman Seblm ]  [ 14 / 45 ]  [ Hal Brkt >]|
|  FITUR PENDUKUNG:                               |  [ Button: Buka Kalkulator Scientific ]         |
|  [ Toggle: Kalkulator Scientific ]              |  [ Button: Catatan Pribadi Peserta ]            |
|  [ Toggle: Glosarium Istilah Nuklir ]           |                                                 |
+-------------------------------------------------+-------------------------------------------------+
| FITUR POP-UP: KALKULATOR SCIENTIFIC DIGITAL (FLOATING)                                           |
| +-----------------------------------------------------------------------------------------------+ |
| | [DEG] [RAD]  | Sin | Cos | Tan | Log | Ln | Sqrt | x^y | 1/x | Exp | Pi | ( ) |  [ C ] [ DEL ]  | |
| | Perhitungan Peluruhan Radiasi: N(t) = N0 * e^(-lambda * t)               [ HITUNG DOSIS ]     | |
| +-----------------------------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------------------------+
```


---

### 10. Spesifikasi Detail Engine Tryout Soal BAPETEN (Computer-Based Test Engine)

#### **A. Konsep & Tujuan Engine Tryout BAPETEN**
* **Latar Belakang:** Ujian Lisensi BAPETEN untuk Petugas Proteksi Radiasi (PPR) dan Pekerja Radiasi memerlukan tingkat penguasaan materi yang tinggi, mencakup aspek hukum (Peraturan BAPETEN No. 4 Tahun 2024), fisika radiasi, perhitungan dosis, hingga prosedur penanggulangan keadaan darurat radiasi [10, 19, 22].
* **Tujuan Engine Tryout:**
  1. **Simulasi Realistis:** Memberikan pengalaman ujian CBT yang identik dengan antarmuka dan batasan waktu ujian lisensi BAPETEN [10, 19].
  2. **Pemetaan Kelemahan Kompetensi:** Menyajikan analisis diagnostik instan (*Competency Weakness Diagnostic*) untuk memberitahu peserta bab/materi mana yang memerlukan pendalaman lebih lanjut.
  3. **Peningkatan Ratio Kelulusan:** Menjaga dan meningkatkan persentase kelulusan alumni pelatihan ALARA (target kelulusan > 90%) [17].

---

#### **B. Spesifikasi Fungsional Engine Tryout (CBT Engine Features)**

* **TRY-01: Bank Soal Terkategori & Acak (Randomized Question Bank):**
  * Soal dikategorikan berdasarkan kompetensi Peraturan BAPETEN No. 4/2024 [8, 10, 19]:
    1. *Regulasi Ketenaganukliran* (UU Ketenaganukliran & Perba BAPETEN No. 4/2024).
    2. *Fisika Radiasi & Satuan Dosis* (Aktivitas, Peluruhan, Penerobosan Perisai).
    3. *Efek Biologi Radiasi* (Efek Stokastik & Deterministik).
    4. *Alat Ukur Radiasi & Dosimetri* (Detektor Isian Gas, Sintilasi, Dosimeter TLD/Digital).
    5. *Proteksi & Keselamatan Radiasi Spesifik* (Sumber Analisis / Pemindai Bagasi / Fasilitas Radiologi).
    6. *Prosedur Keadaan Darurat Radiasi*.
  * Pilihan jawaban (A, B, C, D, E) dan urutan soal diacak secara otomatis (*Randomized Sequence*) per sesi pengerjaan.

* **TRY-02: Mekanisme & Fitur Antarmuka Ujian (Exam Mechanics):**
  * **Timer Countdown:** Penghitung waktu mundur yang jelas dengan *warning pop-up* saat waktu tersisa 10 menit dan 2 menit.
  * **Papan Navigasi Soal (Question Grid):** Grid nomor soal interaktif dengan kode warna status:
    * *Hijau:* Soal sudah dijawab.
    * *Kuning:* Soal ditandai "Ragu-ragu".
    * *Abu-abu:* Soal belum dijawab.
  * **Floating Scientific Calculator:** Akses cepat ke kalkulator scientific di dalam antarmuka ujian untuk perhitungan rumus fisika/dosis radiasi [22].
  * **Auto-Submit & Recovery:** Jika koneksi terputus atau waktu habis, jawaban yang telah terpilih otomatis tersimpan di server.

* **TRY-03: Fitur Integritas & Anti-Kecurangan (Proctoring & Anti-Cheating):**
  * **Fullscreen Mode Enforcement:** Peserta wajib mengaktifkan mode *fullscreen*. Jika peserta berpindah tab/layar lebih dari 3 kali, ujian otomatis di-submit secara paksa (*forced submission*).
  * **Block Copy-Paste & Right Click:** Teks soal dan gambar diagram radiasi diproteksi dari tindakan *copy-paste* atau klik kanan.

* **TRY-04: Analisis Hasil Instan & Diagnostic Radar Chart:**
  * Sesaat setelah ujian diselesaikan, sistem langsung menampilkan:
    * **Skor Total & Status Passing Grade:** Nilai Kelulusan Minimal = 70.0 (Status: `LULUS TRYOUT` atau `BELUM LULUS`).
    * **Radar Chart Pemetaan Kompetensi:** Grafik radar yang menunjukkan persentase penguasaan peserta pada 6 kategori materi BAPETEN.
    * **Review Soal & Pembahasan Kunci Jawaban:** Rincian setiap nomor soal dilengkapi pembahasan rumus dan pasal referensi Peraturan BAPETEN No. 4 Tahun 2024 [8, 19].

---

#### **C. Detail User Flow Pengerjaan Tryout Soal BAPETEN**

```
 [Peserta Masuk Menu Tryout]
            │
            ▼
 [Pilih Paket Tryout] ---> (Tryout Mandiri / Simulasi Final Batch)
            │
            ▼
 [Layar Tata Tertib & Konfirmasi Start]
            │
            ▼
 [Sistem Generate Soal Acak & Start Timer]
            │
            ▼
 ┌─────────────────────────────────────────────────────────┐
 │ LAYAR UJIAN CBT                                         │
 │ - Jawab Soal Pilihan Ganda (A/B/C/D/E)                  │
 │ - Pakai Floating Scientific Calculator jika butuh hitung│
 │ - Tandai "Ragu-Ragu" jika belum yakin                   │
 └─────────────────────────────────────────────────────────┘
            │
            ▼
 [Klik "Selesai Ujian" / Timer Habis]
            │
            ▼
 [Sistem Kalkulasi Skor Instan & Simpan ke DB]
            │
            ▼
 ┌─────────────────────────────────────────────────────────┐
 │ DASHBOARD HASIL & ANALYTICS                             │
 │ - Display Nilai Akhir (contoh: 84 / 100) -> [ LULUS ]    │
 │ - Display Diagnostic Radar Chart (Kelemahan Materi)     │
 │ - Buka Menu "Pembahasan Soal & Referensi Perba BAPETEN" │
 └─────────────────────────────────────────────────────────┘
```

---

#### **D. Wireframe Interface Engine Tryout (CBT Exam & Result Diagnostic)**

##### **1. Screen Layout: Antarmuka Pengerjaan Soal (CBT Exam Interface)**
```
+---------------------------------------------------------------------------------------------------+
| [ALARA LOGO] SIMULASI UJIAN LISENSI BAPETEN - PPR ANALISIS           WAKTU TERSISA: [ 00:48:15 ]  |
+---------------------------------------------------------------------------------------------------+
| Peserta: Budi Santoso | No. Reg: REG-202609-012                  [ Toggle Kalkulator Scientific ] |
+-------------------------------------------------+-------------------------------------------------+
| [AREA SOAL & PILIHAN JAWABAN - 75%]             | [PAPAN NAVIGASI SOAL - 25%]                     |
|                                                 |                                                 |
|  SOAL NO. 14 / 60   [ Kategori: Fisika Radiasi ]|  GRID NOMOR SOAL:                               |
|  +-------------------------------------------+  |  [ 01-H ] [ 02-H ] [ 03-H ] [ 04-H ] [ 05-K ]   |
|  | Suatu sumber radiasi Co-60 memiliki      |  |  [ 06-H ] [ 07-H ] [ 08-A ] [ 09-H ] [ 10-H ]   |
|  | aktivitas awal 100 Ci. Jika waktu paruh  |  |  [ 11-H ] [ 12-H ] [ 13-H ] (*14*)  [ 15-A ]   |
|  | Co-60 adalah 5,27 tahun, berapakah       |  |  [ 16-A ] [ 17-A ] [ 18-A ] ...     [ 60-A ]   |
|  | sisa aktivitas sumber tersebut setelah   |  |                                                 |
|  | 10,54 tahun?                              |  |  Keterangan Warna:                              |
|  +-------------------------------------------+  |  [H] Hijau : Terjawab (12)                      |
|                                                 |  [K] Kuning: Ragu-ragu (1)                      |
|  PILIHAN JAWABAN:                               |  [A] Abu   : Belum Dijawab (47)                 |
|  ( ) A. 50 Ci                                   |                                                 |
|  (*) B. 25 Ci                                   |  INFORMASI PERINGATAN:                          |
|  ( ) C. 12,5 Ci                                 |  Peringatan Tab-Switch: 0 / 3                   |
|  ( ) D. 6,25 Ci                                 |                                                 |
|  ( ) E. 10 Ci                                   |                                                 |
|                                                 |                                                 |
|  [ [x] Ragu-Ragu ]                              |                                                 |
|  [ < Soal Sebelumnya ]    [ Soal Selanjutnya > ]|  [ >>> HENTIKAN & SUBMIT UJIAN <<< ]            |
+-------------------------------------------------+-------------------------------------------------+
```

##### **2. Screen Layout: Dashboard Hasil & Diagnostic Radar Chart**
```
+---------------------------------------------------------------------------------------------------+
| HASIL TRYOUT SIMULASI UJIAN BAPETEN - Budi Santoso                                                |
+---------------------------------------------------------------------------------------------------+
| HASIL AKHIR:  SKOR TOTAL: 82.5 / 100   |   PASSING GRADE: 70.0   |   STATUS: [ LULUS TRYOUT ]       |
+-------------------------------------------------+-------------------------------------------------+
| [DIAGNOSTIC RADAR CHART KOMETENSI]              | [RINGKASAN PER KATEGORI MATERI]                 |
|                                                 |                                                 |
|           Regulasi BAPETEN (90%)                | 1. Regulasi BAPETEN        : 9/10 (90%) - SANGAT BAIK|
|                   /\                            | 2. Fisika & Peluruhan      : 8/10 (80%) - BAIK       |
|                  /  \                           | 3. Efek Biologi Radiasi    : 9/10 (90%) - SANGAT BAIK|
|  Darurat (60%)  /    \  Fisika (80%)            | 4. Dosimetri & Alat Ukur   : 8/10 (80%) - BAIK       |
|                <      >                         | 5. Proteksi Sumber Analisis: 9/10 (90%) - SANGAT BAIK|
|                 \    /                          | 6. Keadaan Darurat Radiasi : 6/10 (60%) - [ LEMAH ] |
|                  \  /                           |                                                 |
|             Proteksi Sp. (90%)                  | CATATAN EXPERT ALARA:                           |
|                                                 | "Tingkatkan pemahaman pada prosedur penanganan  |
|                                                 | dekontaminasi & tanggap darurat kebocoran."     |
+-------------------------------------------------+-------------------------------------------------+
| PEMBAHASAN SOAL DETAIL                                                                            |
| [ Soal No. 14 - Kunci: B (Jawaban Anda: B - BENAR) ]                                              |
| Rumus: N(t) = N0 * (1/2)^(t / T1/2)                                                               |
| Perhitungan: N(10.54) = 100 * (1/2)^(10.54 / 5.27) = 100 * (1/2)^2 = 25 Ci.                       |
| Referensi: Buku Modul ALARA Bab 2 Hal 18 & Perba BAPETEN No. 4 Tahun 2024.                        |
+---------------------------------------------------------------------------------------------------+
```


---

### 10. Spesifikasi Detail Modul Otomasi E-Sertifikat & Pelaporan Kelulusan BAPETEN

#### **A. Otomasi Penerbitan E-Sertifikat Pelatihan Internal ALARA**
Mengingat CV. Hikmat Proteksi ALARA adalah Lembaga Pelatihan Ketenaganukliran resmi yang diakui BAPETEN (KTUN No. 07998.722.1.040726), setiap peserta yang menyelesaikan 3 hari pelatihan berhak menerima **Sertifikat Pelatihan Internal ALARA** sebagai prasyarat mengikuti Ujian Lisensi BAPETEN.

1. **Aturan & Pemicu Penerbitan (Trigger Rules):**
   * **Presensi Minimal:** Kehadiran 100% pada seluruh sesi 3 hari pelatihan (Pagi & Siang) terverifikasi via sistem presensi LMS.
   * **Penyelesaian Logbook:** Praktikum lapangan disetujui (*signed-off*) oleh Tim Pengajar Expert ALARA.
   * **Kelulusan Tryout Internal:** Mencapai skor minimal 70.0 pada Tryout Simulasi Ujian BAPETEN.
2. **Standardisasi Template & Komponen Sertifikat:**
   * **Kop & Legalitas:** Mencantumkan Nama Lembaga, Nomor Keputusan KTUN BAPETEN No. 07998.722.1.040726, dan Rujukan Peraturan BAPETEN No. 4 Tahun 2024.
   * **Nomor Sertifikat Unik:** Format `CERT/ALARA/{PROGRAM}/{YEAR}/{BATCH}/{SEQ_NO}` (contoh: `CERT/ALARA/PPR-ANALISIS/2026/B1/008`).
   * **Digital Signature & QR Code Verifikasi Keaslian:**
     - Tanda tangan digital (*e-Sign*) Direktur / Kepala Lembaga Pelatihan ALARA terenkripsi.
     - QR Code dinamis yang dapat dipindai oleh publik/BAPETEN yang mengarah ke URL Verifikasi Keaslian (`https://hikmatproteksialara.com/verify/{cert_number}`).
3. **Format & Proteksi File:**
   * Dihasilkan otomatis dalam format **PDF High-Resolution Print-Ready** (A4 Landscape) dengan proteksi edit (*read-only PDF/A standard*).

---

#### **B. Modul Pelaporan Ujian & Analytics Kelulusan BAPETEN**

1. **Pencatatan Hasil Ujian Lisensi BAPETEN:**
   * Admin Sekretariat memasukkan komponen nilai resmi ujian lisensi yang diselenggarakan BAPETEN:
     - Nilai Ujian Teori (Bobot & Skor)
     - Nilai Ujian Praktik (Bobot & Skor)
     - Nilai Ujian Wawancara (Bobot & Skor)
     - Status Lisensi Resmi BAPETEN (`LULUS` / `REMIDIAL` / `TIDAK_LULUS`).
2. **Dashboard Rekapitulasi Analytics & Pass-Rate Tracking:**
   * Grafik persentase tingkat kelulusan per *batch* pelatihan (contoh: *PPR Analisis Batch 1: 89% Kelulusan*).
   * Pemetaan histori kelulusan berdasarkan instansi sponsor perusahaan pengirim.
3. **Fitur Ekspor Laporan Resmi (Reporting Module):**
   * **Laporan Resmi BAPETEN (PDF/Excel):** Rekap data peserta, daftar nilai, presensi, dan logbook praktikum sesuai format laporan berkala Lembaga Pelatihan ke BAPETEN.
   * **Laporan Sponsor Perusahaan (Corporate Sponsor Report):** Laporan *progress*, kehadiran, dan hasil kelulusan karyawan sponsor yang dapat diunduh oleh perwakilan instansi perusahaan.

---

#### **C. Wireframe Layout E-Sertifikat & Dashboard Laporan**

##### **1. Wireframe Template E-Sertifikat Pelatihan ALARA (PDF Output View)**
```
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|                                    CV. HIKMAT PROTEKSI ALARA                                      |
|                             LEMBAGA PELATIHAN KETENAGANUKLIRAN                                    |
|                      Keputusan KTUN BAPETEN No. 07998.722.1.040726                                |
|                                                                                                   |
|                                    SERTIFIKAT PELATIHAN                                           |
|                               No: CERT/ALARA/PPR-ANALISIS/2026/B1/008                             |
|                                                                                                   |
|   Diberikan kepada:                                                                               |
|                                        BUDI SANTOSO                                               |
|                                      NIK: 3172091238910002                                        |
|                                                                                                   |
|   Atas partisipasi dan keberhasilannya dalam menyelesaikan:                                       |
|     PELATIHAN CALON PETUGAS PROTEKSI RADIASI (PPR) ANALISIS MENGGUNAKAN SUMBER RADIASI PENGION    |
|   yang diselenggarakan pada tanggal 15 - 17 Oktober 2026 sesuai Peraturan BAPETEN No. 4 Thn 2024|
|                                                                                                   |
|   [ QR CODE VERIFIKASI ]                               Jakarta, 17 Oktober 2026               |
|   Scan untuk verifikasi                                CV. HIKMAT PROTEKSI ALARA               |
|   https://hikmatproteksialara.com/verify/                                                                     |
|   CERT-ALARA-PPR-ANALISIS-008                          [ DIGITAL SIGNATURE & CAP STEMPEL ]        |
|                                                        Ir. H. Expert Proteksi, M.Si.              |
|                                                        Kepal Lembaga Pelatihan                    |
+---------------------------------------------------------------------------------------------------+
```

##### **2. Wireframe Dashboard Laporan & Analytics Kelulusan (Admin View)**
```
+---------------------------------------------------------------------------------------------------+
| [ALARA LOGO] Admin Portal - Laporan & Analytics Kelulusan              [Export Excel] [Export PDF]|
+---------------------------------------------------------------------------------------------------+
| FILTER LAPORAN: [ Batch: PPR Analisis - Batch 1 (Okt 2026) v ]  [ Sponsor: Semua Perusahaan v ]   |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  STATISTIK KELULUSAN BATCH 1 PPR ANALISIS                                                         |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+   |
|  | TOTAL PESERTA      |  | LULUS BAPETEN      |  | TINGKAT KELULUSAN  |  | RATA-RATA SKOR     |   |
|  |      18 Peserta    |  |     16 Peserta     |  |       88.9%        |  |       84.5 / 100   |   |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+   |
|                                                                                                   |
|  TABEL REKAPITULASI HASIL UJIAN BAPETEN PER PESERTA                                               |
|  +---+--------------------+--------------------+------------+-------------+------------+--------+ |
|  |No | Nama Peserta       | Perusahaan Sponsor | Nilai Teori| Nilai Prak. | Status     | Cert   | |
|  +---+--------------------+--------------------+------------+-------------+------------+--------+ |
|  | 1 | Budi Santoso       | PT Medika Rad.     | 85.0       | 88.0        | [ LULUS ]  | [View] | |
|  | 2 | Dr. Anita Wijaya   | RS Sehat Sejahtera | 90.0       | 92.0        | [ LULUS ]  | [View] | |
|  | 3 | Eko Prasetyo       | Mandiri (Pribadi)  | 62.0       | 70.0        | [REMIDIAL] | [ - ]  | |
|  +---+--------------------+--------------------+------------+-------------+------------+--------+ |
|                                                                                                   |
|  [ Button: Generasi Laporan Berkala BAPETEN (PDF) ]   [ Button: Kirim Laporan ke Perusahaan Sponsor]|
+---------------------------------------------------------------------------------------------------+
```


---

### 11. Spesifikasi Detail Modul Manajemen Pakar & Instruktur ALARA

#### **A. Latar Belakang & Profil Pakar ALARA**
CV. Hikmat Proteksi ALARA didukung oleh jajaran tim pengajar dan pakar proteksi radiasi berkaliber tinggi yang terdiri dari mantan Inspektur BAPETEN, pakar keselamatan radiasi industri/klinis, serta alumni program internasional *IAEA-Post Graduate Educational Course (IAEA-PGEC)*. Modul Manajemen Pakar ini dibangun untuk mengelola kredensial keahlian, penjadwalan alokasi pengajar pada *batch* pelatihan 3 hari, proses *sign-off* praktikum lapangan, perhitungan honorarium, serta pengawasan evaluasi performa pengajar.

---

#### **B. Spesifikasi Fungsional Modul Manajemen Pakar (Functional Requirements)**

* **EXP-01: Manajemen Profil & Kredensial Pakar (Expert Credential & License Management):**
  * Pengelolaan biodata, riwayat sertifikasi keahlian, nomor Lisensi BAPETEN, dan sertifikat kualifikasi internasional (IAEA).
  * System Alert otomatis yang menginformasikan admin jika Lisensi BAPETEN atau masa berlaku sertifikat pakar mendekati tanggal kadaluwarsa (< 60 hari).

* **EXP-02: Penjadwalan Sesi & Kalender Alokasi Mengajar (Batch Session Assignment):**
  * Alokasi penugasan pakar untuk setiap *batch* pelatihan 3 hari berdasarkan spesifikasi keahlian (PPR Analisis, PPR Pemindai Bagasi, atau Pekerja Radiasi).
  * Kalender interaktif ketersediaan pakar (*Instructor Availability Calendar*) untuk mencegah bentrok jadwal mengajar antarsesi.

* **EXP-03: Digital Sign-off Logbook Praktikum Lapangan:**
  * Portal khusus bagi pakar untuk meninjau, memberikan masukan, dan menandatangani secara digital (*e-Sign*) hasil Logbook Praktikum Lapangan peserta (contoh: praktikum alat pemindai x-ray bagasi di lokasi mitra).
  * Fitur verifikasi nilai kelayakan praktikum sebelum peserta diizinkan mengikuti ujian lisensi BAPETEN.

* **EXP-04: Pencatatan Jam Mengajar & Otomasi Honorarium (Teaching Log & Remuneration):**
  * Pencatatan jam mengajar aktual (*actual teaching hours*) per sesi (Teori, Diskusi Kasus, Praktikum, atau Pembahasan Tryout).
  * Generasi otomatis rekapitulasi honorarium/remunerasi pakar berdasarkan akumulasi jam mengajar per periode/batch.

* **EXP-05: Evaluasi Performa Pengajar oleh Peserta (Instructor Evaluation & Feedback):**
  * Kuesioner evaluasi online yang diisi oleh peserta pada akhir hari ke-3 pelatihan untuk menilai kualitas pengajaran pakar (aspek penguasaan materi, kejelasan penyampaian, dan komunikatif).
  * Dashboard skor rating (skala 1-5) dan kompilasi umpan balik (*feedback*) untuk penjaminan mutu (*Quality Assurance*) Lembaga Pelatihan ALARA.

---

#### **C. Detail User Flow Penugasan & Evaluasi Pakar ALARA**
1. **Langkah 1 (Assignment):** Admin Sekretariat mengalokasikan Pakar A untuk mengampu Sesi Hari ke-2 (Proteksi Radiasi Spesifik & Praktikum) pada Batch 1 PPR Analisis.
2. **Langkah 2 (Notifikasi & Konfirmasi):** Pakar A menerima notifikasi penugasan via email/portal, mengeklik *"Konfirmasi Ketersediaan"*, dan mengakses jadwal serta daftar peserta.
3. **Langkah 3 (Pelaksanaan & Review Logbook):** Pasca-praktikum lapangan, Pakar A membuka menu *"Review Logbook Praktikum"*, memberikan catatan evaluasi, dan menekan *"Digital Sign-off"*.
4. **Langkah 4 (Evaluasi Peserta & Honorarium):** Peserta mengisi survei rating pengajar. Sistem secara otomatis merekap total jam mengajar Pakar A ke dalam modul keuangan untuk penerbitan slip honorarium.

---

#### **D. Wireframe Layout Portal Pakar / Instruktur ALARA**

##### **1. Screen Layout: Dashboard Portal Pakar (Expert Instructor View)**
```
+---------------------------------------------------------------------------------------------------+
| [ALARA LOGO] PORTAL PAKAR & INSTRUKSI ALARA                       [User: Dr. Expert, M.Si. v]     |
+---------------------------------------------------------------------------------------------------+
| LISENSI BAPETEN: PPR-INSP-2024-009 (Status: [ AKTIF ] - Berlaku s/d Dec 2028)                    |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  RINGKASAN AKTIVITAS PENGARAHAN                                                                   |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+   |
|  | JADWAL MENGAJAR    |  | PENDING SIGN-OFF   |  | TOTAL JAM BATCH    |  | RATING EVALUASI    |   |
|  |   Batch 1 (16 Okt) |  |   8 Logbook Mhs    |  |     24 Jam Mengajar|  |   4.92 / 5.00 ⭐   |   |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+   |
|                                                                                                   |
|  JADWAL MENGAJAR MENDATANG                                                                        |
|  +---------------------+-----------------------+---------------------+--------------------------+ |
|  | Tanggal & Sesi      | Program Pelatihan     | Materi Pembelajaran | Aksi                     | |
|  +---------------------+-----------------------+---------------------+--------------------------+ |
|  | 16 Okt 2026 (09:00) | PPR Pemindai Bagasi B1| Pengoperasian X-Ray | [Buka Modul HAKI]        | |
|  | 17 Okt 2026 (13:00) | PPR Pemindai Bagasi B1| Praktikum Lapangan  | [ Review Logbook (8) ]   | |
|  +---------------------+-----------------------+---------------------+--------------------------+ |
|                                                                                                   |
|  PANEL SIGN-OFF LOGBOOK PRAKTIKUM PESERTA                                                        |
|  +----+------------------+---------------------+----------------------+-------------------------+ |
|  | No | Nama Peserta     | Lokasi Praktikum    | Status Pengukuran    | Keputusan Expert        | |
|  +----+------------------+---------------------+----------------------+-------------------------+ |
|  | 1  | Budi Santoso     | Menara BCA (X-Ray)  | Laju Dosis Sesuai    | [ >>> DIGITAL SIGN-OFF]| |
|  | 2  | Dr. Anita Wijaya | Menara BCA (X-Ray)  | Laju Dosis Sesuai    | [ >>> DIGITAL SIGN-OFF]| |
|  +----+------------------+---------------------+----------------------+-------------------------+ |
+---------------------------------------------------------------------------------------------------+
```

##### **2. Screen Layout: Dashboard Performance Rating & Teaching Log (Admin View)**
```
+---------------------------------------------------------------------------------------------------+
| REKAPITULASI EVALUASI PAKAR & JAM MENGAJAR (ADMIN VIEW)                                          |
+---------------------------------------------------------------------------------------------------+
| PERIODE: [ Bulan: Oktober 2026 v ]  [ Kategori: Semua Pakar v ]             [ Export Laporan ]    |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  TABEL REKAPITULASI PENILAIAN & HONORARIUM PAKAR                                                  |
|  +---+-------------------------+--------------------+---------------+-------------+---------------+ |
|  |No | Nama Pakar / Pengajar   | Kualifikasi Utama  | Total Jam Ajar| Rating Avg  | Status Honor  | |
|  +---+-------------------------+--------------------+---------------+-------------+---------------+ |
|  | 1 | Ir. H. Expert Proteksi  | Eks-Inspektur BAPETEN| 18 Jam       | 4.95 / 5.00 | [ TERPROSES ] | |
|  | 2 | Dr. Ahmad Nuklir, M.Si. | IAEA-PGEC Alumni   | 12 Jam        | 4.88 / 5.00 | [ PENDING ]   | |
|  | 3 | Dra. Rina Safetri, M.T. | Konsultan Radiologi| 15 Jam        | 4.90 / 5.00 | [ TERPROSES ] | |
|  +---+-------------------------+--------------------+---------------+-------------+---------------+ |
|                                                                                                   |
|  DETAIL FEEDBACK PESERTA UNTUK PAKAR (SAMPLE):                                                    |
|  - "Penyampaian materi perhitungan dosis radiasi sangat praktis dan mudah dipahami."              |
|  - "Sesi praktikum x-ray sangat rinci dan membantu persiapan ujian BAPETEN."                       |
+---------------------------------------------------------------------------------------------------+
