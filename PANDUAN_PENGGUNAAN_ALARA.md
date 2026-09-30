# Panduan Penggunaan Aplikasi ALARA Training System
## Sistem Manajemen Pelatihan Proteksi Radiasi Terpadu Berbasis BAPETEN

**Instansi:** CV. Hikmat Proteksi ALARA  
**Izin Resmi Lembaga Pelatihan:** KTUN BAPETEN No. 07998.722.1.040726  
**Landasan Regulasi Utama:** Peraturan BAPETEN No. 4 Tahun 2024  
**Rekening Resmi Pembayaran:** Bank Mandiri No. `166-00-0733926-0` a.n. CV Hikmat Proteksi ALARA  
**Versi Panduan:** 7.0 (Mencakup 4 Role Pengguna, LMS HAKI Canvas, Tryout CBT, Logbook Sign-off, E-Sertifikat & Pelaporan BAPETEN)

---

## DAFTAR ISI

1. [Pendahuluan & Gambaran Umum Sistem](#1-pendahuluan--gambaran-umum-sistem)
   * 1.1 Profil Lembaga & Tujuan Aplikasi
   * 1.2 Matriks 4 Peran Pengguna (User Roles)
   * 1.3 Akses Sistem & Tata Kelola Keamanan Akun
2. [Panduan Role: PESERTA (Calon PPR & Pekerja Radiasi)](#2-panduan-role-peserta-calon-ppr--pekerja-radiasi)
   * 2.1 Registrasi Akun & Login
   * 2.2 Dashboard Utama Peserta
   * 2.3 Formulir Pendaftaran 5 Langkah (`/pendaftaran`)
   * 2.4 Manajemen & Revisi Dokumen Prasyarat (`/dokumen`)
   * 2.5 Pembayaran & Konfirmasi Transfer Bank Mandiri (`/pembayaran`)
   * 2.6 Learning Management System (LMS) & Player Modul Ber-HAKI (`/lms`)
   * 2.7 Presensi Digital 3 Hari Pelatihan (`/presensi`)
   * 2.8 Simulasi Ujian Lisensi BAPETEN / Tryout CBT (`/tryout`)
   * 2.9 Logbook Praktikum Lapangan (`/logbook`)
   * 2.10 E-Sertifikat Pelatihan ALARA & Verifikasi QR (`/sertifikat`)
   * 2.11 Pengaturan Profil Pribadi (`/profil`)
3. [Panduan Role: ADMINISTRATOR & SEKRETARIAT ALARA (Admin)](#3-panduan-role-administrator--sekretariat-alara-admin)
   * 3.1 Dashboard Operasional Admin (`/admin/dashboard`)
   * 3.2 Verifikasi Berkas Administrasi Peserta (`/admin/verifikasi`)
   * 3.3 Verifikasi Pembayaran & Rekonsiliasi Keuangan (`/admin/pembayaran`)
   * 3.4 Manajemen Program Pelatihan & Unit Kompetensi (`/admin/pelatihan`)
   * 3.5 Manajemen Batch & Jadwal Pelatihan (`/admin/batch`)
   * 3.6 Kelola Bank Soal & Engine Tryout CBT (`/admin/tryout`)
   * 3.7 Manajemen Modul Materi LMS Digital (`/admin/lms`)
   * 3.8 Monitoring & Koreksi Presensi Peserta (`/admin/presensi`)
   * 3.9 Laporan Penyelenggaraan & Rekapitulasi Kelulusan BAPETEN (`/admin/laporan`)
   * 3.10 Manajemen Instruktur & Evaluasi Mutu Pengajar (`/admin/instruktur`)
   * 3.11 Manajemen Pejabat Penandatangan Sertifikat (`/admin/penandatangan`)
   * 3.12 Manajemen Akun Pengguna (`/admin/users`)
   * 3.13 Konfigurasi Sistem, Menu, & Landing Page (`/pengaturan`)
4. [Panduan Role: INSTRUCTOR / TIM PAKAR ALARA (Instruktur)](#4-panduan-role-instructor--tim-pakar-alara-instruktur)
   * 4.1 Dashboard Portal Instruktur (`/instructor/dashboard`)
   * 4.2 Konfirmasi Penugasan & Kalender Mengajar
   * 4.3 Digital Sign-off Logbook Praktikum Lapangan
   * 4.4 Akses Modul Materi Pembelajaran Ber-HAKI (`/lms`)
   * 4.5 Monitoring Evaluasi Peserta & Analisis Tryout
   * 4.6 Rekapitulasi Jam Mengajar & Evaluasi Kinerja (Rating)
5. [Panduan Role: SPONSOR (Instansi / Perusahaan Pembiaya)](#5-panduan-role-sponsor-instansi--perusahaan-pembiaya)
   * 5.1 Dashboard Portal Sponsor Perusahaan (`/sponsor/dashboard`)
   * 5.2 Pemantauan Karyawan Peserta Pelatihan
   * 5.3 Penagihan Kolektif & Bukti Pembayaran Perusahaan (`/pembayaran`)
   * 5.4 Unduh Laporan Kinerja & E-Sertifikat Karyawan
6. [Tabel Matriks Hak Akses & Fitur Antar Role](#6-tabel-matriks-hak-akses--fitur-antar-role)
7. [Penanganan Masalah Umum (Troubleshooting) & Layanan Bantuan](#7-penanganan-masalah-umum-troubleshooting--layanan-bantuan)

---

## 1. PENDAHULUAN & GAMBARAN UMUM SISTEM

### 1.1 Profil Lembaga & Tujuan Aplikasi
**CV. Hikmat Proteksi ALARA** adalah Lembaga Pelatihan Ketenaganukliran resmi di Indonesia yang diakui oleh Badan Pengawas Tenaga Nuklir (BAPETEN) berdasarkan Surat Keputusan KTUN No. 07998.722.1.040726.

Aplikasi **ALARA Training System** dirancang untuk mendigitalisasi seluruh rantai operasional pelatihan proteksi radiasi sesuai standar kompetensi **Peraturan BAPETEN No. 4 Tahun 2024**, mencakup:
1. **Pendaftaran & Pembayaran:** Verifikasi berkas administrasi dan pembayaran transfer Bank Mandiri secara transparan dan akuntabel.
2. **Learning Management System (LMS) Berbasis HAKI:** Pembacaan materi terproteksi DRM Canvas dengan watermark dinamis untuk melindungi karya intelektual pakar ALARA.
3. **Presensi Digital & Logbook Praktikum:** Pencatatan kehadiran berbasis kamera selfie/GPS serta validasi hasil praktikum proteksi radiasi lapangan dengan tanda tangan digital instruktur (*Digital Sign-off*).
4. **Computer-Based Test (CBT) Tryout Engine:** Simulasi ujian lisensi BAPETEN berstandar tinggi lengkap dengan kalkulator saintifik terintegrasi dan analisis kelemahan materi berbasis radar chart.
5. **Otomasi E-Sertifikat & Pelaporan Resmi BAPETEN:** Penerbitan sertifikat pelatihan resmi ALARA ber-QR code dan rekapitulasi pelaporan berkala hasil ujian lisensi BAPETEN.

### 1.2 Matriks 4 Peran Pengguna (User Roles)
Sistem memiliki 4 peran utama dengan hak akses terpisah:
* **PESERTA:** Calon Petugas Proteksi Radiasi (PPR Analisis, PPR Pemindai Bagasi) atau Pekerja Radiasi (PKR) yang mengikuti rangkaian program pelatihan hingga ujian.
* **ADMIN:** Staf sekretariat, verifikator berkas, koordinator operasional batch, dan bagian keuangan CV. Hikmat Proteksi ALARA.
* **INSTRUCTOR:** Tenaga pengajar pakar proteksi radiasi, mantan Inspektur BAPETEN, dan alumni IAEA-PGEC yang mengajar, menilai praktikum, dan melakukan *sign-off* logbook.
* **SPONSOR:** Manajemen HRD/HSE instansi pemanfaat tenaga nuklir (Rumah Sakit, Industri, Bandara) yang mendaftarkan dan membiayai peserta pelatihan.

### 1.3 Akses Sistem & Tata Kelola Keamanan Akun
* **Alamat Portal Aplikasi:** `https://hikmatproteksialara.com` (atau tautan server lokal yang ditentukan penyelenggara).
* **Standar Keamanan Berkas:** Dokumen rekam medis (MCU) dan identitas KTP dilindungi hak akses ketat (*Role-Based Access Control*).
* **Proteksi Sesi:** Demi integritas materi ber-HAKI dan ujian CBT, satu akun hanya diperkenankan aktif pada satu perangkat dalam satu waktu (*Single Active Session*).

---

## 2. PANDUAN ROLE: PESERTA (CALON PPR & PEKERJA RADIASI)

Peserta pelatihan proteksi radiasi dapat memanfaatkan seluruh alur mandiri mulai dari registrasi, belajar di kelas LMS, hingga mengunduh sertifikat resmi.

### 2.1 Registrasi Akun & Login
1. Buka laman utama ALARA Training System, lalu klik tombol **"Daftar Akun Baru"** atau masuk ke `/register`.
2. Masukkan data:
   * **Nama Lengkap** (wajib sesuai KTP & ijazah untuk keabsahan sertifikat BAPETEN).
   * **Email Aktif** (digunakan untuk menerima tagihan, revisi berkas, dan notifikasi jadwal).
   * **Nomor Handphone / WhatsApp Aktif** (digunakan untuk koordinasi panitia batch).
   * **Kata Sandi** (minimal 8 karakter kombinasi huruf dan angka).
3. Klik tombol **"Daftar Sekarang"**.
4. Masuk ke laman `/login`, ketikkan email dan kata sandi yang telah didaftarkan, lalu klik **"Masuk ke Dashboard"**.

---

### 2.2 Dashboard Utama Peserta (`/dashboard`)
Setelah login, peserta disajikan ringkasan status pelatihan secara real-time:
* **Status Pendaftaran:** `DRAFT`, `MENUNGGU VERIFIKASI`, `APPROVED` (Disetujui), atau `REJECTED` (Perlu Revisi).
* **Status Pembayaran:** `BELUM BAYAR`, `MENUNGGU VERIFIKASI`, atau `LUNAS`.
* **Program & Jadwal Batch Aktif:** Menampilkan tanggal pelatihan, lokasi pelaksanaan, serta durasi hari.
* **Progres Pelatihan:** Widget persentase penyelesaian modul LMS, riwayat presensi harian, dan skor tryout.
* **Banner Pengumuman & Aksi Cepat:** Tombol jalan pintas menuju pembayaran, modul belajar, dan ujian simulasi.

---

### 2.3 Formulir Pendaftaran 5 Langkah (`/pendaftaran`)
Pendaftaran pelatihan dilakukan melalui wizard formulir interaktif 5 langkah:

#### **Langkah 1: Pilih Program & Batch Pelatihan**
1. Pilih salah satu kategori program pelatihan yang dibuka:
   * **PPR Analisis Menggunakan Sumber Radiasi Pengion:** Pelatihan Petugas Proteksi Radiasi Tingkat Analisis (biaya investasi standar Rp 7.000.000, durasi 3-5 hari, kualifikasi ijazah minimal D3 Eksakta/Teknik).
   * **PPR Pemindai Bagasi atau Barang Lainnya:** Pelatihan PPR industri/keamanan pemindai x-ray bagasi (biaya investasi standar Rp 4.000.000, durasi 3 hari, kualifikasi ijazah minimal D3 Eksakta/Teknik).
   * **PKR Pekerja Radiasi:** Pelatihan Proteksi dan Keselamatan Radiasi bagi operator, teknisi, analis sampel, perawat, atau dokter (biaya investasi standar Rp 3.500.000, durasi 2 hari).
   * **PPR Penyegaran:** Program resertifikasi/perpanjangan masa berlaku lisensi PPR BAPETEN.
2. Pilih nomor **Batch Pelatihan** yang berstatus `AVAILABLE` (tersedia kuota) beserta tanggal dan lokasi kegiatan.
3. Klik **"Lanjut ke Data Diri"**.

#### **Langkah 2: Kelengkapan Profil & Data Pribadi**
1. Lengkapi formulir identitas:
   * **Nomor Induk Kependudukan (NIK KTP):** Wajib 16 digit valid.
   * **Tempat & Tanggal Lahir:** Sesuai data resmi kependudukan.
   * **Alamat Domisili Lengkap:** Alamat tempat tinggal saat ini.
   * **Nama Instansi / Perusahaan Tempat Bekerja:** Nama fasilitas radiasi / instansi pemohon.
   * **Jabatan / Bagian Kerja:** Misal: *Operator Gauging*, *Radiografer*, *Teknisi Bagasi*.
   * **Nomor Handphone / WhatsApp:** Nomor aktif untuk koordinasi darurat dan informasi batch.
2. Klik **"Lanjut ke Data Pembiayaan"**.

#### **Langkah 3: Penentuan Skema Pembiayaan (Sponsor / Mandiri)**
1. Tentukan sumber pembiayaan pelatihan:
   * **Pembiayaan Mandiri (Pribadi):** Centang opsi mandiri jika biaya ditanggung sendiri oleh peserta.
   * **Ditanggung Instansi / Perusahaan Sponsor:** Isi nama instansi sponsor, Nomor Pokok Wajib Pajak (**NPWP**) perusahaan (untuk penerbitan faktur pajak/invoice resmi), alamat perusahaan, serta email kontak bagian keuangan/HRD instansi sponsor.
2. Klik **"Lanjut ke Unggah Dokumen"**.

#### **Langkah 4: Unggah Dokumen Prasyarat**
Unggah berkas dokumen persyaratan resmi sesuai checklist regulasi BAPETEN:
* [x] **Salinan KTP / Kartu Identitas:** Format JPG/PNG/PDF, tampak jelas, tidak terpotong.
* [x] **Salinan Ijazah Terakhir:** Ijazah legalisir (minimal D3 Eksakta/Teknik untuk calon PPR Analisis dan Bagasi).
* [x] **Surat Hasil Medical Check-Up (MCU):**
  > **Kriteria Wajib:** Tanggal pemeriksaan **kurang dari 1 tahun** (direkomendasikan < 6 bulan) dari jadwal pelatihan, serta memuat hasil **pemeriksaan laboratorium darah lengkap/rutin dan urine lengkap/rutin**.
* [x] **Surat Keterangan Bekerja / Surat Tugas:** Surat resmi dari instansi pemanfaat tenaga nuklir tempat peserta bekerja.
* [x] **Pasfoto Berwarna 3x4:** Latar belakang warna **MERAH**, pakaian formal/berkerah, format gambar jernih (JPG/PNG).
* [ ] **Salinan NPWP (Opsional):** Kartu NPWP pribadi atau perusahaan penjamin.
* Format file yang didukung: PDF, JPG, PNG (maksimal 5 MB per berkas).
3. Klik **"Lanjut ke Konfirmasi"**.

#### **Langkah 5: Review & Submit Pendaftaran**
1. Periksa kembali seluruh data dan dokumen yang telah dimasukkan.
2. Centang persetujuan keabsahan dokumen dan pakta integritas pelatihan.
3. Klik tombol **"Kirim Pendaftaran"**.
4. Sistem menerbitkan **Nomor Registrasi Unik** dan **Invoice Tagihan Resmi** ke Rekening Bank Mandiri CV Hikmat Proteksi ALARA. Status pendaftaran berubah menjadi `MENUNGGU_PEMBAYARAN`.

---

### 2.4 Manajemen & Revisi Dokumen Prasyarat (`/dokumen`)
Jika panitia verifikator administrasi menemukan berkas yang belum memenuhi kriteria, peserta dapat memperbaikinya tanpa mengulang pendaftaran dari awal:
1. Masuk ke menu **"Dokumen"** pada bilah navigasi kiri.
2. Perhatikan indikator status pada tiap item berkas:
   * **Disetujui (Warna Hijau):** Dokumen telah divalidasi dan memenuhi kualifikasi.
   * **Perlu Revisi (Warna Merah / Kuning):** Dokumen ditolak disertai kotak catatan instruksi perbaikan (contoh: *"Hasil MCU kedaluwarsa lebih dari 1 tahun, mohon unggah surat MCU baru dengan uji darah dan urine"* atau *"Pasfoto wajib berlatar belakang merah"*).
   * **Menunggu Verifikasi (Warna Biru):** Dokumen sedang dalam antrean pemeriksaan admin.
3. Untuk mengunggah berkas perbaikan, klik tombol **"Unggah Ulang"**, pilih file baru yang telah diperbaiki, lalu klik **"Simpan & Ajukan Verifikasi Ulang"**.

---

### 2.5 Pembayaran & Konfirmasi Transfer Bank Mandiri (`/pembayaran`)
1. Buka menu **"Pembayaran"**.
2. Periksa detail rincian tagihan:
   * Nomor Invoice Resmi ALARA (contoh: `INV/ALARA/2026/09/0012`).
   * Program & Batch yang didaftarkan.
   * Total Nominal Pembayaran (contoh: `Rp 7.000.000` untuk PPR Analisis / `Rp 4.000.000` untuk PPR Bagasi).
3. Lakukan pembayaran via transfer ke rekening resmi satu pintu CV. Hikmat Proteksi ALARA:
   * **Nama Bank:** Bank Mandiri
   * **Nomor Rekening:** `166-00-0733926-0`
   * **Atas Nama:** CV Hikmat Proteksi ALARA
4. Setelah melakukan transfer, isi formulir konfirmasi pada bagian bawah laman:
   * **Nama Pemilik Rekening Pengirim** (nama yang tertera pada struk/m-banking).
   * **Tanggal & Waktu Transfer**.
   * **Unggah Bukti Struk / Screenshot Transfer** (format JPG/PNG/PDF).
5. Klik **"Kirim Konfirmasi Pembayaran"**.
6. Status akan berubah menjadi `MENUNGGU_VERIFIKASI`. Setelah disetujui staf keuangan, status berubah menjadi `LUNAS` dan tombol **"Unduh Kuitansi PDF"** akan aktif untuk bukti pembayaran sah.

---

### 2.6 Learning Management System (LMS) & Player Modul Ber-HAKI (`/lms`)
Setelah berkas dan pembayaran disetujui, hak akses materi pembelajaran digital akan dibuka secara penuh.

1. Buka menu **"LMS / Modul"**.
2. **Struktur Kurikulum 3 Hari Pelatihan:**
   * **Hari ke-1 (Dasar Regulasi & Proteksi Radiasi):** Dasar Fisika Radiasi, Satuan & Besaran Dosimetri, Efek Biologi Radiasi, serta Kerangka Regulasi UU Ketenaganukliran & Peraturan BAPETEN No. 4 Tahun 2024.
   * **Hari ke-2 (Proteksi Spesifik & Alat Ukur):** Pengoperasian Alat Ukur & Dosimetri Personal, Proteksi Radiasi Spesifik (Analisis Difraksi/Fluoresensi atau Pemindai X-Ray Bagasi), Batas Laju Dosis, serta Prosedur Kesiapsiagaan Keadaan Darurat Radiasi.
   * **Hari ke-3 (Praktikum Lapangan & Simulasi Ujian):** Implementasi Program Proteksi Radiasi di fasilitas kerja, Pengisian Logbook Praktikum, dan Pembahasan Tryout BAPETEN.
3. **Fitur Secure Canvas Player (Proteksi HAKI DRM):**
   * Modul ALARA dilindungi Hak Cipta resmi karya Tim Pakar ALARA (Eks-Inspektur BAPETEN & Alumni IAEA).
   * Seluruh lembar materi dilengkapi **Watermark Dinamis Transparan** yang mencantumkan: `[Nama Anda] | [NIK KTP Anda] | [Alamat IP] | [Timestamp Waktu Baca]`.
   * Sistem mematikan fungsi klik kanan, *copy-paste*, pintasan `Ctrl+P`, dan tangkapan layar untuk mencegah pembajakan materi.
4. **Widget Kalkulator Saintifik Digital Bawaan:**
   * Pada bilah atas/samping modul terdapat tombol **"Kalkulator Saintifik"**.
   * Klik tombol untuk memunculkan kalkulator pop-up terapung (*floating calculator*) yang siap digunakan untuk menghitung rumus peluruhan radiasi ($N(t) = N_0 \cdot e^{-\lambda t}$), perhitungan *Half-Value Layer* (HVL/tebal perisai), dan *Inverse Square Law* jarak radiasi ($I_1 \cdot r_1^2 = I_2 \cdot r_2^2$).
5. **Pelacakan Kemajuan Belajar:**
   * Saat peserta selesai membaca setiap modul, klik tombol **"Tandai Selesai"** di akhir halaman agar persentase progres pelatihan tercatat di dashboard.

---

### 2.7 Presensi Digital 3 Hari Pelatihan (`/presensi`)
Syarat mutlak mengikuti Ujian Lisensi BAPETEN dan memperoleh sertifikat ALARA adalah **kehadiran 100%** selama 3 hari masa pelatihan.

1. Buka menu **"Presensi"** di pagi dan siang hari saat kelas berlangsung:
   * **Sesi Pagi (Morning Session):** Jam 08.00 – 09.30 WIB.
   * **Sesi Siang (Afternoon Session):** Jam 13.00 – 14.00 WIB.
2. Izinkan peramban (browser) untuk mengakses kamera dan lokasi GPS perangkat Anda.
3. Ambil **Foto Swafoto (Selfie Check-in)** langsung di depan layar laptop/smartphone.
4. Pastikan koordinat Geolocation GPS terdeteksi normal.
5. Klik **"Kirim Presensi"**.
6. Sistem akan menampilkan status **HADIR** lengkap dengan rekaman waktu dan stempel koordinat lokasi.

---

### 2.8 Simulasi Ujian Lisensi BAPETEN / Tryout CBT (`/tryout`)
Simulasi ujian Computer-Based Test (CBT) disiapkan persis menyerupai standar Ujian Teori Lisensi BAPETEN.

1. Buka menu **"Tryout"**.
2. Pilih paket tryout yang tersedia:
   * **Tryout Mandiri:** Latihan soal bertahap 60 butir soal (durasi 90 menit).
   * **Simulasi Final Lisensi BAPETEN:** Simulasi penuh 100 butir soal acak (durasi 150 menit) dengan standar *passing grade* **70.0**.
3. Baca tata tertib ujian, pastikan koneksi internet stabil, lalu klik **"Mulai Ujian CBT"**.
4. **Mekanisme Pengerjaan Ujian:**
   * **Timer Mundur (Countdown):** Menampilkan sisa waktu di sudut kanan atas. Pop-up peringatan akan muncul pada sisa waktu 10 menit dan 2 menit.
   * **Papan Navigasi Soal:**
     * Warna **Hijau:** Soal telah dijawab.
     * Warna **Kuning:** Soal ditandai *"Ragu-Ragu"*.
     * Warna **Abu-Abu:** Soal belum dijawab.
   * **Floating Scientific Calculator:** Dapat dibuka kapan saja untuk perhitungan fisika radiasi tanpa meninggalkan antarmuka soal.
   * **Proteksi Anti-Curang (Tab-Switch Detector):** Peserta dilarang membuka tab lain atau meminimalisir layar ujian. Peringatan akan dicatat, dan jika berpindah layar melebihi 3 kali, ujian akan dihentikan dan disubmit secara paksa oleh sistem.
5. Jika telah selesai, klik tombol **"Submit & Selesaikan Ujian"**.
6. **Layar Hasil & Analisis Diagnostik Instan (`/tryout/[attemptId]/hasil`):**
   * **Nilai Akhir:** Nilai total dan status kelulusan (`LULUS TRYOUT` jika $\ge 70.0$ atau `BELUM LULUS`).
   * **Diagnostic Radar Chart:** Grafik laba-laba yang memetakan persentase penguasaan Anda pada 6 bidang materi:
     1. Regulasi Ketenaganukliran & Perba BAPETEN No. 4/2024
     2. Fisika Radiasi & Satuan Dosis
     3. Efek Biologi Radiasi
     4. Dosimetri & Alat Ukur Radiasi
     5. Proteksi Radiasi Spesifik
     6. Kesiapsiagaan & Penanggulangan Keadaan Darurat Radiasi
   * **Pembahasan Soal Detail:** Rincian kunci jawaban, rumus kalkulasi, serta kutipan bab/pasal referensi modul ALARA.

---

### 2.9 Logbook Praktikum Lapangan (`/logbook`)
Peserta wajib mendokumentasikan kegiatan praktikum proteksi radiasi lapangan (misalnya di fasilitas x-ray bagasi Menara BCA atau mitra industri):
1. Buka menu **"Logbook"**.
2. Klik tombol **"+ Isi Logbook Baru"**.
3. Lengkapi formulir laporan praktikum:
   * **Tanggal & Waktu Praktikum**.
   * **Lokasi Praktikum:** Misal: *Fasilitas Pemindai X-Ray Bagasi Menara BCA*.
   * **Nilai Pengukuran Laju Dosis Radiasi:** (contoh: `0.12` $\mu$Sv/jam pada jarak 1 meter dari permukaan alat).
   * **Kondisi Sistem Interlock Keselamatan:** Uraikan fungsi tombol darurat (*emergency stop*) dan pemutus radiasi otomatis saat pintu pelindung dibuka.
   * **Dosimeter Personal yang Digunakan:** Misal: *TLD Badge No. TLD-8891 & Dosimeter Saku Digital EPD*.
   * **Catatan & Temuan Lapangan:** Ringkasan hasil pemantauan daerah kerja radiasi.
4. Klik **"Simpan & Ajukan ke Instruktur"**.
5. Logbook Anda akan masuk ke antrean verifikasi Pakar ALARA. Setelah ditinjau dan disetujui, status akan berubah menjadi **SIGNED-OFF** bertanda tangan digital instruktur.

---

### 2.10 E-Sertifikat Pelatihan ALARA & Verifikasi QR (`/sertifikat`)
Setelah seluruh tahapan pelatihan tuntas, sistem menerbitkan Sertifikat Pelatihan Resmi ALARA secara otomatis.

1. Buka menu **"Sertifikat"**.
2. Periksa **Checklist Kriteria Kelulusan**:
   * [x] Presensi Kehadiran Lengkap 3 Hari (100%)
   * [x] Logbook Praktikum Disetujui Instruktur (*Signed-Off*)
   * [x] Lulus Tryout Ujian BAPETEN (Nilai $\ge 70.0$)
3. Jika ketiga indikator telah hijau, sertifikat Anda resmi terbit.
4. **Struktur Sertifikat Resmi ALARA:**
   * **Halaman 1 (Sertifikat Kelulusan Utama):**
     * Kop Resmi Lembaga Pelatihan Ketenaganukliran CV. Hikmat Proteksi ALARA.
     * Legalitas Izin BAPETEN No. 07998.722.1.040726.
     * Nomor Sertifikat Unik (format: `CERT/ALARA/{KATEGORI}/{TAHUN}/{BATCH}/{NOMOR}`).
     * Nama Peserta & NIK KTP.
     * Tanda tangan digital Direktur Lembaga Pelatihan ALARA.
     * **QR Code Verifikasi Keaslian Berlogo ALARA:** Dilengkapi logo resmi ALARA di bagian tengah (menggunakan koreksi kesalahan tingkat tinggi Level H) yang dapat dipindai publik/inspektur BAPETEN untuk memvalidasi keaslian dokumen pada URL `https://hikmatproteksialara.com/verify/[NomorSertifikat]`.
   * **Halaman 2 (Transkrip Rincian Unit Kompetensi & Mata Ajar):**
     * Daftar kode unit kompetensi, mata ajar pelatihan, dan jam pelajaran (JPL) sesuai standar kurikulum BAPETEN.
5. Klik **"Cetak / Unduh PDF"** untuk menyimpan dokumen sertifikat beresolusi tinggi (format A4 siap cetak).

---

### 2.11 Pengaturan Profil Pribadi (`/profil`)
1. Buka menu dropdown nama pengguna di pojok kanan atas, pilih **"Profil Saya"** atau kunjungi `/profil`.
2. Anda dapat memperbarui foto profil, mengganti kata sandi, serta memeriksa nomor kontak dan email terdaftar.

---

## 3. PANDUAN ROLE: ADMINISTRATOR & SEKRETARIAT ALARA (ADMIN)

Administrator memegang kendali operasional pelatihan secara menyeluruh, mulai dari verifikasi calon peserta, validasi keuangan, pengaturan batch, bank soal, hingga pelaporan resmi ke instansi pengawas BAPETEN.

### 3.1 Dashboard Operasional Admin (`/admin/dashboard`)
Dashboard admin menyajikan ringkasan metrik pelatihan secara menyeluruh:
* **Statistik Utama:**
  * *Total Peserta Terdaftar*
  * *Berkas Pending Verifikasi* (jumlah berkas baru yang butuh review segera)
  * *Pembayaran Pending* (jumlah mutasi transfer yang perlu pencocokan)
  * *Jumlah Batch Pelatihan Aktif*
* **Grafik Pendaftaran & Distribusi Peserta:** Tren penambahan peserta per minggu/bulan.
* **Antrean Pendaftaran Terbaru:** Daftar registrasi masuk lengkap dengan status berkas dan pembayaran.
* **Alert Masa Berlaku Lisensi Instruktur:** Peringatan otomatis jika lisensi BAPETEN pengajar ALARA tersisa kurang dari 60 hari menuju tanggal kedaluwarsa.

---

### 3.2 Verifikasi Berkas Administrasi Peserta (`/admin/verifikasi`)
Verifikasi berkas merupakan gerbang penjaminan mutu agar seluruh peserta memenuhi kualifikasi Peraturan BAPETEN No. 4 Tahun 2024.

1. Buka menu **"Verifikasi Berkas"** (`/admin/verifikasi`).
2. Gunakan filter tab: **Semua**, **Menunggu Verifikasi**, **Disetujui**, atau **Perlu Revisi**, serta kotak pencarian Nama/NIK/Instansi.
3. Klik nama peserta untuk membuka **Panel Review Verifikasi Berkas**:
   * **Salinan Ijazah:**
     * Buka pratinjau dokumen via viewer terintegrasi (tanpa perlu mengunduh).
     * Pastikan ijazah minimal **D3 Bidang Eksakta / Teknik** untuk program PPR Analisis dan PPR Bagasi.
     * Pilih status: `Valid / Sesuai` atau `Tidak Sesuai`.
   * **Hasil Medical Check-Up (MCU):**
     * Masukkan *Tanggal Pemeriksaan MCU* pada kolom tanggal.
     * Sistem otomatis memvalidasi apakah tanggal pemeriksaan masih berlaku ($< 1$ tahun dari jadwal pelatihan). Jika lebih dari 1 tahun, sistem menampilkan peringatan merah `MCU KEDALUWARSA`.
     * Periksa dan centang dua komponen wajib:
       - [x] *Pemeriksaan Darah Lengkap/Rutin*
       - [x] *Pemeriksaan Urine Lengkap/Rutin*
   * **KTP & Identitas Pribadi:** Cocokkan Nama Lengkap, NIK 16 digit, dan Tempat/Tanggal Lahir antara formulir sistem dengan dokumen fisik KTP.
   * **Pasfoto 3x4:** Pastikan latar belakang foto berwarna **MERAH**, pencahayaan terang, dan wajah menghadap lurus ke depan.
   * **Surat Keterangan Bekerja:** Pastikan dikeluarkan resmi oleh badan hukum / instansi tempat pekerja bernaung.
4. **Keputusan Verifikasi:**
   * **Jika Dokumen Lengkap & Benar:** Klik **"Setujui Seluruh Berkas (Approve)"**. Status registrasi berubah menjadi `APPROVED`.
   * **Jika Ada Dokumen Yang Tidak Sesuai:** Klik ikon silang/tolak pada dokumen terkait, pilih atau ketikkan alasan penolakan secara jelas (misal: *"Foto terpotong dan berlatar belakang biru, mohon unggah pasfoto latar merah ukuran 3x4"*), lalu klik **"Kirim Permintaan Revisi"**. Sistem otomatis mengirimkan notifikasi ke email & dashboard peserta.

---

### 3.3 Verifikasi Pembayaran & Rekonsiliasi Keuangan (`/admin/pembayaran`)
1. Buka menu **"Verifikasi Pembayaran"** (`/admin/pembayaran`).
2. Tinjau antrean pembayaran yang berstatus `PENDING_VERIFICATION`.
3. Klik tombol **"Tinjau Pembayaran"**:
   * Cocokkan nominal transfer dengan tagihan (misal Rp 7.000.000 untuk PPR Analisis).
   * Periksa nama pemilik rekening pengirim dan tanggal transaksi pada file bukti transfer.
   * Bandingkan dengan mutasi rekening Bank Mandiri No. `166-00-0733926-0` CV Hikmat Proteksi ALARA.
4. **Tindakan Staf Keuangan:**
   * **Setujui (Approve):** Klik tombol **"Konfirmasi Pembayaran Lunas"**. Status pembayaran peserta berubah menjadi `PAID` / `LUNAS`. Kuota kursi batch resmi terpotong dan peserta mendapatkan akses penuh ke ruang kelas LMS.
   * **Tolak (Reject):** Klik tombol **"Tolak Pembayaran"**, masukkan alasan penolakan (misal: nominal kurang, bukti transfer buram/duplikat), lalu kirim notifikasi penolakan ke peserta.
5. Tombol **"Cetak Kuitansi"** dapat digunakan untuk menerbitkan salinan kwitansi resmi berstempel digital ALARA.

---

### 3.4 Manajemen Program Pelatihan & Unit Kompetensi (`/admin/pelatihan`)
1. Buka menu **"Jenis Pelatihan"** (`/admin/pelatihan`).
2. Di menu ini admin dapat:
   * Menambah atau mengedit kategori pelatihan (PPR Analisis, PPR Bagasi, PKR Pekerja Radiasi, Penyegaran).
   * Mengatur harga investasi resmi pelatihan.
   * Mengatur jumlah hari pelatihan dan alokasi Jam Pelajaran (JPL).
   * Mengatur kop teks sertifikat bahasa Indonesia & bahasa Inggris.
3. **Pengaturan Unit Kompetensi Sertifikat (Halaman 2 Sertifikat):**
   * Klik tombol **"Kelola Unit Kompetensi"** pada baris program pelatihan.
   * Tambah mata ajar, nomor unit (contoh: *1. Dasar-dasar Proteksi Radiasi*), kode unit SKKNI/BAPETEN, dan jumlah JPL per mata ajar. Rincian ini otomatis tercetak pada halaman belakang sertifikat peserta.

---

### 3.5 Manajemen Batch & Jadwal Pelatihan (`/admin/batch`)
1. Buka menu **"Kelola Batch"** (`/admin/batch`).
2. Klik tombol **"+ Buat Batch Baru"**:
   * Pilih Program Pelatihan.
   * Tentukan Nomor Batch (contoh: Batch 1 Tahun 2026).
   * Masukkan Tanggal Mulai dan Tanggal Selesai pelatihan.
   * Tentukan Kuota Maksimal Peserta (misal 20 orang).
   * Masukkan Lokasi Kegiatan (misal: *Hotel Luminor Jakarta & Laboratorium Praktikum Menara BCA* atau *Daring / Hybrid*).
   * Masukkan Tautan Dokumentasi Kegiatan (link Google Drive galeri foto atau video YouTube).
3. **Konfigurasi Ujian Tryout Batch:**
   * Di dalam panel batch, atur parameter ujian tryout:
     * *Toggle Buka/Tutup Tryout:* Buka akses hanya pada waktu ujian ditentukan.
     * *Durasi Ujian:* Misal 60 menit atau 90 menit.
     * *Jumlah Soal:* Misal 20 butir, 60 butir, atau 100 butir.
     * *Mode Pemilihan Soal:* **Otomatis** (soal diacak otomatis oleh sistem) atau **Manual** (admin memilih nomor soal tertentu dari bank soal).
4. **Penugasan Instruktur Sesi:**
   * Alokasikan instruktur untuk mengampu Sesi Hari 1 (Teori), Sesi Hari 2 (Spesifik), dan Sesi Hari 3 (Praktikum & Review).

---

### 3.6 Kelola Bank Soal & Engine Tryout CBT (`/admin/tryout`)
Admin dapat mengelola ribuan bank soal berkualitas tinggi sesuai kisi-kisi ujian lisensi BAPETEN:
1. Buka menu **"Kelola Soal Tryout"** (`/admin/tryout`).
2. **Tambah Soal Secara Interaktif:**
   * Klik **"+ Tambah Soal"**.
   * Pilih Kategori Pelatihan (PPR Analisis, PPR Bagasi, atau PKR).
   * Pilih Topik Kompetensi (Regulasi, Fisika Radiasi, Efek Biologi, Dosimetri, Proteksi Spesifik, atau Keadaan Darurat).
   * Masukkan teks pertanyaan. Jika membutuhkan ilustrasi bagan/diagram radiasi, unggah file gambar pendukung.
   * Masukkan pilihan jawaban A, B, C, D, dan E.
   * Tentukan Kunci Jawaban Benar.
   * Tuliskan **Pembahasan Soal Lengkap** (rumus matematis peluruhan/dosis serta pasal rujukan Peraturan BAPETEN No. 4 Tahun 2024).
   * Tentukan tingkat kesulitan (Mudah, Sedang, Sulit).
3. **Import & Export Soal Massal:**
   * Klik tombol **"Unduh Template Excel"**.
   * Isi ratusan soal pada file template spreadsheet yang tersedia.
   * Klik tombol **"Import Excel/CSV"** untuk mengunggah soal sekaligus dalam hitungan detik.

---

### 3.7 Manajemen Modul Materi LMS Digital (`/admin/lms`)
1. Buka menu **"Kelola LMS / Modul"** (`/admin/lms`).
2. Pilih Kategori Pelatihan yang ingin dikelola.
3. Klik **"+ Tambah Modul Materi"**:
   * Tentukan Alokasi Hari Pelatihan (Hari 1, Hari 2, atau Hari 3).
   * Masukkan Judul Bab & Deskripsi Singkat Materi.
   * Tentukan Tipe Modul: *Reading (Pembacaan Ber-HAKI Canvas)*, *Video Pembelajaran*, atau *Kuis Harian*.
   * Masukkan konten teks panjang atau unggah file dokumen modul berformat terenkripsi.
   * Atur estimasi waktu baca (menit) dan urutan tampilan (*order index*).
   * Atur status publikasi: Centang **"Publikasikan Modul"** agar modul dapat dibaca oleh peserta.

---

### 3.8 Monitoring & Koreksi Presensi Peserta (`/admin/presensi`)
1. Buka menu **"Presensi Peserta"** (`/admin/presensi`).
2. Pilih Batch Pelatihan dan Hari Pelatihan yang sedang berjalan.
3. Admin dapat melihat tabel kehadiran seluruh peserta: foto swafoto, titik koordinat GPS, stempel jam check-in, dan status (Hadir/Belum Hadir).
4. **Fasilitas Override Kehadiran:** Jika ada peserta yang mengalami kendala teknis kamera/GPS di lokasi pelatihan namun hadir secara fisik, admin memiliki hak khusus untuk mengubah status secara manual menjadi **HADIR** dengan menyertakan catatan dispensasi resmi.

---

### 3.9 Laporan Penyelenggaraan & Rekapitulasi Kelulusan BAPETEN (`/admin/laporan`)
Modul pelaporan menyediakan rekapitulasi data komprehensif untuk audit BAPETEN dan pelaporan ke instansi sponsor.

1. Buka menu **"Laporan & Rekap"** (`/admin/laporan`).
2. Pilih Batch Pelatihan yang telah menyelesaikan ujian.
3. **Pencatatan Hasil Ujian Lisensi Resmi BAPETEN:**
   * Masukkan nilai hasil ujian yang diselenggarakan oleh BAPETEN untuk setiap peserta:
     * *Nilai Ujian Teori*
     * *Nilai Ujian Praktik*
     * *Nilai Ujian Wawancara (bila ada)*
     * *Status Lisensi:* Pilih `LULUS`, `REMIDIAL`, atau `TIDAK LULUS`.
4. **Analisis Statistik Kelulusan:**
   * Sistem otomatis menghitung total peserta, jumlah lulus, rata-rata skor batch, dan **Tingkat Kelulusan (Pass Rate)** (contoh: *88.9% Lulus*).
5. **Generasi Laporan Resmi:**
   * **Laporan Berkala Lembaga Pelatihan ke BAPETEN (PDF & Excel):** Laporan resmi komprehensif memuat biodata peserta, rekap presensi 3 hari, lembar pengesahan praktikum, dan daftar nilai ujian sesuai format yang disyaratkan BAPETEN.
   * **Laporan Instansi Sponsor:** Rekapitulasi perkembangan dan hasil kelulusan khusus bagi karyawan yang dikirim oleh perusahaan sponsor tertentu.

---

### 3.10 Manajemen Instruktur & Evaluasi Mutu Pengajar (`/admin/instruktur`)
1. Buka menu **"Kelola Instruktur"** (`/admin/instruktur`).
2. Di menu ini admin dapat:
   * Mendaftarkan instruktur baru dan mengaitkannya dengan akun user instruktur.
   * Menginput Nomor Lisensi BAPETEN, masa berlaku lisensi, sertifikasi internasional (IAEA), dan spesifikasi keahlian.
   * Memantau akumulasi total jam mengajar aktual per periode.
   * Memproses status pencairan honorarium/remunerasi mengajar instruktur.
   * Memeriksa rata-rata **Rating Kualitas Pengajaran** (bintang 1.0 – 5.0) serta kompilasi kuesioner masukan dari peserta untuk menjaga jaminan mutu (*Quality Assurance*).

---

### 3.11 Manajemen Pejabat Penandatangan Sertifikat (`/admin/penandatangan`)
1. Buka menu **"Penandatangan Sertifikat"** (`/admin/penandatangan`).
2. Daftarkan atau perbarui data pejabat resmi yang menandatangani e-sertifikat:
   * Nama Lengkap beserta Gelar (misal: *Fransiskus Asisi Sanyata Putra, ST*).
   * Jabatan Resmi (misal: *Direktur CV. Hikmat Proteksi ALARA*).
   * NIP / Nomor Identitas Pegawai (jika ada).
   * Unggah file gambar Tanda Tangan Digital transparan (PNG) dan Stempel Resmi Lembaga.
3. Tentukan pejabat penandatangan aktif default. Tanda tangan ini akan otomatis tertera pada seluruh sertifikat peserta yang diterbitkan.

---

### 3.12 Manajemen Akun Pengguna (`/admin/users`)
1. Buka menu **"Kelola User"** (`/admin/users`).
2. Admin dapat melihat seluruh daftar pengguna, menyaring berdasarkan role (PESERTA, ADMIN, INSTRUCTOR, SPONSOR), membuat akun baru secara manual, melakukan reset kata sandi jika peserta lupa sandi, atau menonaktifkan akun yang melanggar aturan.

---

### 3.13 Konfigurasi Sistem, Menu, & Landing Page (`/pengaturan`)
Admin dapat melakukan kustomisasi antarmuka dan legalitas melalui submenu Pengaturan:
* **Kelola Menu Pengguna (`/admin/menu-pengguna`):** Menampilkan atau menyembunyikan menu tertentu di bilah navigasi serta mengatur urutan item menu.
* **Pengaturan Slide Laman Depan (`/pengaturan/slide`):** Mengunggah gambar banner promosi dan pengumuman batch yang tampil di carousel beranda portal.
* **Pengaturan Footer & Kontak Legalitas (`/pengaturan/footer`):** Memperbarui nomor kontak WhatsApp, email resmi, alamat sekretariat, nomor KTUN BAPETEN, nomor rekening Mandiri, dan teks hak cipta.
* **Tema Aplikasi (`/pengaturan/tema`):** Menyesuaikan preferensi palet warna tampilan antarmuka.

---

## 4. PANDUAN ROLE: INSTRUCTOR / TIM PAKAR ALARA (INSTRUKTUR)

Role Instruktur ditujukan bagi jajaran pakar keselamatan radiasi CV. Hikmat Proteksi ALARA untuk mengelola jadwal sesi, meninjau logbook praktikum peserta, memantau hasil tryout, serta memeriksa evaluasi mengajar.

### 4.1 Dashboard Portal Instruktur (`/instructor/dashboard`)
Setelah login menggunakan akun ber-role `INSTRUCTOR`, sistem otomatis mengarahkan ke dashboard khusus:
* **Kartu Status Lisensi Pengajar:** Menampilkan nomor lisensi BAPETEN aktif, status lisensi, dan masa berlaku sertifikat IAEA.
* **Metrik Aktivitas Mengajar:**
  * *Jadwal Mengajar Terdekat* (batch dan tanggal sesi berikutnya).
  * *Pending Sign-Off Logbook* (jumlah logbook praktikum peserta yang menunggu tanda tangan instruktur).
  * *Total Jam Mengajar Batch Aktif* (akumulasi jam ajar).
  * *Rating Evaluasi Mutu* (skor kepuasan peserta berskala 1 sampai 5 bintang).

---

### 4.2 Konfirmasi Penugasan & Kalender Mengajar
1. Pada dashboard instruktur, buka tab **"Jadwal Mengajar"**.
2. Tinjau jadwal penugasan dari sekretariat:
   * Tanggal & Jam Sesi (Pagi/Siang).
   * Kategori Pelatihan & Nomor Batch.
   * Topik Pembelajaran: *Teori*, *Praktikum Lapangan*, atau *Review Tryout*.
   * Lokasi Pelatihan atau Tautan Kelas Daring.
3. Klik tombol **"Konfirmasi Ketersediaan"** untuk memberitahukan panitia admin bahwa Anda siap mengajar pada jadwal tersebut.

---

### 4.3 Digital Sign-off Logbook Praktikum Lapangan
Praktikum proteksi radiasi lapangan membutuhkan pengesahan resmi dari tenaga ahli berlisensi sebelum peserta diperbolehkan maju ke ujian BAPETEN.

1. Buka tab **"Pending Logbook Sign-Off"** pada dashboard atau masuk ke menu **"Logbook"** (`/logbook`).
2. Klik nama peserta untuk membuka rincian logbook praktikum:
   * Periksa **Tanggal & Lokasi Praktikum** (misal: *Pemindai X-Ray Bagasi Menara BCA*).
   * Periksa **Nilai Laju Dosis Radiasi** yang diukur peserta (pastikan dalam batas toleransi aman $< 1\ \mu\text{Sv/jam}$ di luar batas permukaan pelindung).
   * Periksa **Fungsi Interlock & Emergency Stop** yang dicatat peserta.
   * Periksa **Jenis Dosimeter Personal** yang digunakan.
   * Baca catatan temuan dan kesimpulan peserta.
3. **Pemberian Catatan & Pengesahan Digital:**
   * Masukkan masukan teknis atau catatan koreksi pada kolom *Catatan Instruktur*.
   * Klik tombol **"Beri Pengesahan (Digital Sign-Off)"**.
4. Status logbook peserta seketika berubah menjadi **APPROVED & SIGNED-OFF**, melengkapi salah satu syarat terbitnya sertifikat pelatihan.

---

### 4.4 Akses Modul Materi Pembelajaran Ber-HAKI (`/lms`)
1. Instruktur memiliki akses tanpa batas untuk membuka seluruh modul materi pelatihan ber-HAKI di menu **"LMS / Modul"**.
2. Instruktur dapat menggunakan viewer ini sebagai panduan bahan ajar saat memberikan materi kuliah di kelas atau sebagai rujukan dalam membahas soal studi kasus.

---

### 4.5 Monitoring Evaluasi Peserta & Analisis Tryout (`/tryout`, `/presensi`)
1. Buka menu **"Tryout"** untuk melihat ringkasan performa ujian simulasi peserta kelas yang diampu.
2. Identifikasi topik materi mana yang memiliki nilai rata-rata terendah (misal: *banyak peserta yang lemah di bab Perhitungan Tebal Perisai HVL atau Regulasi Darurat BAPETEN*).
3. Gunakan temuan diagnostik ini untuk memfokuskan pendalaman materi pada sesi **Review Tryout BAPETEN**.
4. Buka menu **"Presensi"** untuk memantau kehadiran mahasiswa sebelum memulai sesi perkuliahan.

---

### 4.6 Rekapitulasi Jam Mengajar & Evaluasi Kinerja (Rating)
1. Buka tab **"Jam Mengajar & Honorarium"** untuk melihat transparansi rekapitulasi sesi yang telah diajarkan beserta total jam kerja yang akan dikonversi menjadi slip honorarium resmi.
2. Buka tab **"Rating & Evaluasi Peserta"** untuk membaca umpan balik kualitatif dan saran peserta demi pengembangan metode pengajaran di masa depan.

---

## 5. PANDUAN ROLE: SPONSOR (INSTANSI / PERUSAHAAN PEMBIAYA)

Role Sponsor disediakan khusus bagi perusahaan pemanfaat tenaga nuklir (Rumah Sakit, Perusahaan Industri Manufaktur/Gauging, Pengelola Fasilitas Kargo/Bandara) yang membiayai pendaftaran pegawainya secara kolektif.

### 5.1 Dashboard Portal Sponsor Perusahaan (`/sponsor/dashboard`)
1. Login menggunakan akun penanggung jawab perusahaan (HRD / HSE Manager).
2. Dashboard langsung menampilkan identitas nama instansi/perusahaan sponsor Anda beserta metrik ringkas:
   * **Total Karyawan Terdaftar:** Jumlah seluruh pegawai perusahaan yang diikutsertakan.
   * **Dokumen Terverifikasi:** Jumlah pegawai yang berkas administrasinya telah valid.
   * **Status Tagihan Perusahaan:** Status pembayaran kolektif instansi (`LUNAS` / `PENDING`).
   * **Tingkat Kelulusan Karyawan:** Persentase kelulusan ujian lisensi BAPETEN bagi pegawai perusahaan Anda.

---

### 5.2 Pemantauan Karyawan Peserta Pelatihan
Pada tabel utama **Monitoring Peserta Perusahaan**, sponsor dapat melacak status individual tiap karyawan:
* **Nama Pegawai & NIK KTP**
* **Program Pelatihan & Batch** yang diikuti
* **Status Verifikasi Berkas:** Mengetahui apakah ada karyawan yang berkas MCU-nya ditolak atau perlu direvisi.
* **Progres Presensi 3 Hari:** Jumlah hari kehadiran karyawan di kelas (Hari 1, Hari 2, Hari 3).
* **Nilai Ujian Lisensi BAPETEN:** Skor resmi yang diraih karyawan pada ujian BAPETEN.
* **Status Kelulusan Akhir:** Keterangan apakah pegawai dinyatakan `LULUS`, `REMIDIAL`, atau `TIDAK LULUS`.
* **Nomor Sertifikat Pelatihan:** Nomor sertifikat resmi ALARA yang diterbitkan bagi pegawai yang lulus.

---

### 5.3 Penagihan Kolektif & Bukti Pembayaran Perusahaan (`/pembayaran`)
1. Buka menu **"Pembayaran"**.
2. Sistem menyajikan **Faktur Tagihan Kolektif (Combined Corporate Invoice)** yang menggabungkan seluruh biaya peserta di bawah nama instansi Anda.
3. Lakukan pembayaran perusahaan melalui transfer rekening giro/bank:
   * **Bank Mandiri No. `166-00-0733926-0` a.n. CV Hikmat Proteksi ALARA**
4. Unggah bukti pembayaran transfer perusahaan dan cantumkan nomor NPWP perusahaan untuk penerbitan bukti potong / faktur pajak resmi.
5. Unduh kwitansi resmi perusahaan berstempel sah setelah staf keuangan ALARA memverifikasi pembayaran.

---

### 5.4 Unduh Laporan Kinerja & E-Sertifikat Karyawan
1. Pada baris tabel karyawan yang telah lulus, klik tombol **"Lihat / Unduh Sertifikat"** untuk menyimpan salinan sertifikat resmi ber-QR code karyawan Anda.
2. Buka menu **"Laporan"** (`/admin/laporan`) untuk mengunduh **Corporate Sponsor Report (PDF & Excel)**. Laporan ini dapat langsung digunakan sebagai lampiran kepatuhan keselamatan radiasi dan audit perizinan fasilitas ke pihak BAPETEN.

---

## 6. TABEL MATRIKS HAK AKSES & FITUR ANTAR ROLE

| Modul / Fitur Aplikasi | PESERTA | ADMIN | INSTRUCTOR | SPONSOR |
| :--- | :---: | :---: | :---: | :---: |
| **Registrasi Mandiri & Pemilihan Batch** | ✅ (Milik Sendiri) | ✅ (Dapat Input Manual) | ❌ | ❌ (Input per Pegawai) |
| **Pengunggahan Dokumen (Ijazah, MCU, KTP)** | ✅ (Milik Sendiri) | ❌ | ❌ | ❌ |
| **Verifikasi Berkas Administrasi Peserta** | ❌ (Hanya Lihat Status) | ✅ Penuh (Approve/Reject) | ❌ | ❌ (Pantau Status Pegawai) |
| **Konfirmasi Pembayaran Mandiri / Grup** | ✅ (Kirim Bukti Bayar) | ❌ | ❌ | ✅ (Kirim Bukti Bayar Grup) |
| **Verifikasi & Rekonsiliasi Bank Mandiri** | ❌ | ✅ Penuh (Approval/Kwitansi) | ❌ | ❌ |
| **Akses Modul LMS Terproteksi DRM HAKI** | ✅ (Aktif saat Batch Mulai) | ✅ (Akses Monitoring) | ✅ Penuh (Bahan Ajar) | ❌ |
| **Kalkulator Saintifik Digital Bawaan** | ✅ | ✅ | ✅ | ❌ |
| **Presensi Digital (Selfie & Geolocation)** | ✅ (Check-in Harian) | ✅ (Override/Koreksi) | ✅ (Pantau Kehadiran) | ❌ (Lihat Rekap Pegawai) |
| **Pengerjaan Tryout CBT BAPETEN** | ✅ (Mengerjakan Soal) | ❌ | ❌ | ❌ |
| **Kelola Bank Soal CBT & Import Excel** | ❌ | ✅ Penuh | ❌ | ❌ |
| **Pengisian Logbook Praktikum Lapangan** | ✅ (Mengisi Laporan) | ✅ (Melihat Data) | ❌ | ❌ |
| **Digital Sign-off Logbook Praktikum** | ❌ | ❌ | ✅ Penuh (Pengesahan Ahli) | ❌ |
| **Unduh E-Sertifikat Resmi Ber-QR Code** | ✅ (Jika Memenuhi Syarat) | ✅ (Cetak Massal) | ❌ | ✅ (Unduh Milik Pegawai) |
| **Kelola Penandatangan Sertifikat & Stempel** | ❌ | ✅ Penuh | ❌ | ❌ |
| **Input Nilai Resmi & Status Ujian BAPETEN** | ❌ | ✅ Penuh | ❌ | ❌ |
| **Ekspor Laporan Resmi Penyelenggaraan BAPETEN** | ❌ | ✅ Penuh (PDF & Excel) | ❌ | ❌ |
| **Ekspor Laporan Perusahaan Sponsor** | ❌ | ✅ Penuh | ❌ | ✅ (Unduh Laporan Tim) |
| **Kelola Jadwal Batch & Jam Mengajar Instruktur**| ❌ | ✅ Penuh | ✅ (Konfirmasi Ketersediaan) | ❌ |
| **Kelola Akun Pengguna & Pengaturan Sistem** | ❌ | ✅ Penuh | ❌ | ❌ |

---

## 7. PENANGANAN MASALAH UMUM (TROUBLESHOOTING) & LAYANAN BANTUAN

### 1. Dokumen MCU Ditolak karena Kedaluwarsa
* **Penyebab:** Tanggal terbit surat keterangan pemeriksaan MCU telah melampaui batas 1 tahun dari tanggal mulai batch pelatihan yang dipilih.
* **Solusi:** Lakukan pemeriksaan MCU ulang (pastikan mencakup tes darah lengkap dan tes urine lengkap), lalu unggah surat hasil pemeriksaan terbaru melalui menu `/dokumen`.

### 2. Modul LMS Tidak Dapat Dibuka atau Tertutup
* **Penyebab:** Berkas pendaftaran belum disetujui (`APPROVED`), pembayaran belum lunas (`PAID`), atau jadwal batch belum memasuki tanggal aktif (H-2 pelaksanaan).
* **Solusi:** Periksa status pendaftaran di dashboard Anda. Jika status masih menunggu, hubungi staf admin untuk percepatan verifikasi bukti transfer Anda.

### 3. Kamera atau Geolocation Presensi Gagal
* **Penyebab:** Izin akses kamera atau lokasi pada peramban (browser) di perangkat Anda diblokir (*Blocked Permission*).
* **Solusi:** Klik ikon gembok / pengaturan di sebelah kiri bilah alamat URL peramban Anda, pilih **Site Settings**, lalu ubah izin **Camera** dan **Location** menjadi **Allow (Izinkan)**. Muat ulang (*refresh*) halaman presensi.

### 4. Ujian Tryout Ter-submit Otomatis Sebelum Waktu Habis
* **Penyebab:** Sistem mendeteksi aktivitas perpindahan jendela atau tab peramban lebih dari 3 kali (*Tab-Switch Violation*).
* **Solusi:** Selalu kerjakan ujian dalam mode layar penuh (*Fullscreen*) dan jangan membuka aplikasi lain hingga seluruh soal selesai disubmit.

### 5. Tombol Unduh Sertifikat Belum Muncul
* **Penyebab:** Salah satu dari 3 syarat kelulusan belum terpenuhi (Kehadiran belum 100%, Logbook belum ditandatangani instruktur, atau nilai tryout di bawah 70.0).
* **Solusi:** Buka menu `/sertifikat` dan periksa kriteria mana yang masih bertanda silang abu-abu/kuning untuk diselesaikan terlebih dahulu.

---

### KONTROL BANTUAN & SEKRETARIAT RESMI ALARA
Bila Anda menemui kendala teknis atau memiliki pertanyaan terkait jadwal pelatihan dan verifikasi ujian BAPETEN, hubungi layanan bantuan resmi:

* **Sekretariat Pelatihan:** CV. Hikmat Proteksi ALARA
* **Pengakuan Resmi BAPETEN:** KTUN No. 07998.722.1.040726
* **Layanan WhatsApp Admin & Verifikasi:** `+62 812-3456-7890` (Jam Kerja 08.00 – 17.00 WIB)
* **Email Dukungan Sistem:** `info@hikmatproteksi.com` / `admin@alara.co.id`
* **Alamat Kantor:** Jakarta, Indonesia
* **Portal Verifikasi Publik Sertifikat:** `https://hikmatproteksialara.com/verify`
