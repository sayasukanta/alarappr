const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SYLLABUS_DATA = {
  PPR_BAGASI: {
    trainingTitleId: "Pemindai Bagasi atau Barang Lainnya Menggunakan Sumber Radiasi Pengion",
    trainingTitleEn: "RPO Baggage Scanners or Other Items Using Ionizing Radiation Sources",
    titleHeaderId: "DAFTAR UNIT KOMPETENSI PELATIHAN PETUGAS PPR",
    trainingSubtitleId: "PEMINDAI BAGASI ATAU BARANG LAINNYA MENGGUNAKAN SRP",
    titleHeaderEn: "LIST OF COMPETENCY UNITS FOR TRAINING OF RADIATION PROTECTION OFFICER IN BAGGAGE SCANNER USING IONIZING RADIATION",
    sections: [
      {
        code: "A",
        title: "MATERI PELATIHAN KOMPETENSI DASAR",
        units: [
          {
            no: "1.",
            mataAjar: "Fundamental Radioaktivitas: Peluruhan, Sifat & Dosimetri (Ukuran/ Besaran Radiasi)",
            kode: "SI-PPR-PEMINDAI-HP-ALARA-01",
            kodeKompetensi: "-",
            jp: 2,
          },
          {
            no: "2.",
            mataAjar: "Efek Radiasi Terhadap Manusia",
            kode: "SI-PPR-PEMINDAI-HP-ALARA-02",
            kodeKompetensi: "-",
            jp: 2,
          },
        ],
      },
      {
        code: "B",
        title: "MATERI PELATIHAN UTAMA: KOMPETENSI INTI",
        units: [
          {
            no: "1.",
            mataAjar: "Peralatan Pemindai Bagasi atau Barang Lainnya Menggunakan SRP: Manfaat, Prinsip Kerja & Potensi Bahayanya",
            kode: "SI-PPR-PEMINDAI-HP-ALARA-03",
            kodeKompetensi: "C.26PPR00.035.1\nC.26PPR00.001.1",
            jp: 2,
          },
          {
            no: "2.",
            mataAjar: "Prinsip Dasar & Tujuan Proteksi Radiasi",
            kode: "SI-PPR-PEMINDAI-HP-ALARA-04",
            kodeKompetensi: "C.26PPR00.030.1",
            jp: 2,
          },
          {
            no: "3.",
            mataAjar: "Pengendalian Paparan Kerja dlm Pemanfaatan Tenaga Nuklir Peralatan Pemindai Bagasi atau Barang lainnya menggunakan SRP Melalui Program Proteksi Radiasi",
            kode: "SI-PPR-PEMINDAI-HP-ALARA-05",
            kodeKompetensi: "C.26PPR00.030.1",
            jp: 2,
          },
          {
            no: "4.",
            mataAjar: "Implementasi Program Proteksi Radiasi",
            kode: "SI-PPR-PEMINDAI-HP-ALARA-07",
            kodeKompetensi: "C.26PPR00.003.1; C.26PPR00.004.1\nC.26PPR00.033.1; C.26PPR00.034.1\nC.26PPR00.036.1; C.26PPR00.037.1\nC.26PPR00.046.1; C.26PPR00.053.1\nC.26PPR00.040.1; C.26PPR00.044.1\nC.26PPR00.049.1; C.26PPR00.052.1",
            jp: 4,
          },
          {
            no: "5.",
            mataAjar: "Kesiapsiagaan & Tanggap Darurat Radiologi",
            kode: "SI-PPR-PEMINDAI-HP-ALARA-08",
            kodeKompetensi: "C.26PPR00.050.1; C.26PPR00.051.1",
            jp: 2,
          },
          {
            no: "6.",
            mataAjar: "Sistem Manajemen dan Budaya Keselamatan",
            kode: "SI-PPR-PEMINDAI-HP-ALARA-09",
            kodeKompetensi: "-",
            jp: 2,
          },
        ],
      },
      {
        code: "C",
        title: "MATERI PELATIHAN UTAMA: KOMPETENSI PILIHAN",
        units: [
          {
            no: "1.",
            mataAjar: "Peraturan Perundang-Undangan (PUU) Ketenaganukliran dlm Pemanfaatan Pemindai Bagasi atau Barang Lainnya menggunakan SRP",
            kode: "SI-PPR-PEMINDAI-HP-ALARA-06",
            kodeKompetensi: "C.26PPR00.023.1\nC.26PPR00.010.1",
            jp: 2,
          },
        ],
      },
      {
        code: "D",
        title: "MATERI PENDUKUNG",
        units: [
          {
            no: "1.",
            mataAjar: "Kapita Selekta",
            kode: "SI-PPR-PEMINDAI-HP-ALARA-10",
            kodeKompetensi: "-",
            jp: 2,
          },
        ],
      },
    ],
  },

  PPR_ANALISIS: {
    trainingTitleId: "Analisis Menggunakan Sumber Radiasi Pengion",
    trainingTitleEn: "RPO Analysis Using Ionizing Radiation Sources",
    titleHeaderId: "DAFTAR UNIT KOMPETENSI PELATIHAN PETUGAS PPR",
    trainingSubtitleId: "ANALISIS MENGGUNAKAN SUMBER RADIASI PENGION",
    titleHeaderEn: "LIST OF COMPETENCY UNITS FOR TRAINING OF RADIATION PROTECTION OFFICER IN ANALYSIS USING IONIZING RADIATION",
    sections: [
      {
        code: "A",
        title: "MATERI PELATIHAN KOMPETENSI DASAR",
        units: [
          {
            no: "1.",
            mataAjar: "Fundamental Radioaktivitas & Dosimetri Radiasi Analisis",
            kode: "SI-PPR-ANALISIS-HP-ALARA-01",
            kodeKompetensi: "-",
            jp: 2,
          },
          {
            no: "2.",
            mataAjar: "Efek Biologi Radiasi Pengion pada Tubuh",
            kode: "SI-PPR-ANALISIS-HP-ALARA-02",
            kodeKompetensi: "-",
            jp: 2,
          },
        ],
      },
      {
        code: "B",
        title: "MATERI PELATIHAN UTAMA: KOMPETENSI INTI",
        units: [
          {
            no: "1.",
            mataAjar: "Peralatan Analisis Radiasi (XRF, XRD, Gauging) & Potensi Bahaya",
            kode: "SI-PPR-ANALISIS-HP-ALARA-03",
            kodeKompetensi: "C.26PPR00.035.1",
            jp: 2,
          },
          {
            no: "2.",
            mataAjar: "Prinsip Dasar & Tujuan Proteksi Radiasi pada Fasilitas Analisis",
            kode: "SI-PPR-ANALISIS-HP-ALARA-04",
            kodeKompetensi: "C.26PPR00.030.1",
            jp: 2,
          },
          {
            no: "3.",
            mataAjar: "Pengendalian Paparan dan Pemantauan Daerah Kerja Analisis",
            kode: "SI-PPR-ANALISIS-HP-ALARA-05",
            kodeKompetensi: "C.26PPR00.031.1",
            jp: 2,
          },
          {
            no: "4.",
            mataAjar: "Implementasi & Audit Program Proteksi Radiasi Fasilitas",
            kode: "SI-PPR-ANALISIS-HP-ALARA-07",
            kodeKompetensi: "C.26PPR00.003.1\nC.26PPR00.046.1",
            jp: 4,
          },
          {
            no: "5.",
            mataAjar: "Penanganan Kedaruratan Radiasi dan Kontaminasi",
            kode: "SI-PPR-ANALISIS-HP-ALARA-08",
            kodeKompetensi: "C.26PPR00.050.1",
            jp: 2,
          },
          {
            no: "6.",
            mataAjar: "Budaya Keselamatan & Sistem Manajemen Fasilitas Radiasi",
            kode: "SI-PPR-ANALISIS-HP-ALARA-09",
            kodeKompetensi: "-",
            jp: 2,
          },
        ],
      },
      {
        code: "C",
        title: "MATERI PELATIHAN UTAMA: KOMPETENSI PILIHAN",
        units: [
          {
            no: "1.",
            mataAjar: "Peraturan Perundang-Undangan Terkait Pemanfaatan SRP Analisis",
            kode: "SI-PPR-ANALISIS-HP-ALARA-06",
            kodeKompetensi: "C.26PPR00.023.1",
            jp: 2,
          },
        ],
      },
      {
        code: "D",
        title: "MATERI PENDUKUNG",
        units: [
          {
            no: "1.",
            mataAjar: "Kapita Selekta Pemanfaatan Radiasi Pengion Bidang Analisis",
            kode: "SI-PPR-ANALISIS-HP-ALARA-10",
            kodeKompetensi: "-",
            jp: 2,
          },
        ],
      },
    ],
  },

  PKR_PEKERJA: {
    trainingTitleId: "Proteksi dan Keselamatan Radiasi Pekerja Radiasi",
    trainingTitleEn: "Radiation Protection and Safety for Radiation Workers",
    titleHeaderId: "DAFTAR UNIT KOMPETENSI PELATIHAN PROTEKSI & KESELAMATAN RADIASI",
    trainingSubtitleId: "PEKERJA RADIASI (OPERATOR & PETUGAS FASILITAS)",
    titleHeaderEn: "LIST OF COMPETENCY UNITS FOR TRAINING OF RADIATION PROTECTION AND SAFETY FOR RADIATION WORKERS",
    sections: [
      {
        code: "A",
        title: "MATERI PELATIHAN KOMPETENSI DASAR",
        units: [
          {
            no: "1.",
            mataAjar: "Dasar-Dasar Radiasi Pengion & Satuan Dosis",
            kode: "SI-PKR-PEKERJA-HP-ALARA-01",
            kodeKompetensi: "-",
            jp: 2,
          },
          {
            no: "2.",
            mataAjar: "Biologi Radiasi & Nilai Batas Dosis (NBD)",
            kode: "SI-PKR-PEKERJA-HP-ALARA-02",
            kodeKompetensi: "-",
            jp: 2,
          },
        ],
      },
      {
        code: "B",
        title: "MATERI PELATIHAN UTAMA: KOMPETENSI INTI",
        units: [
          {
            no: "1.",
            mataAjar: "Alat Pelindung Diri (APD) dan Dosimetri Personal (TLD/Film Badge)",
            kode: "SI-PKR-PEKERJA-HP-ALARA-03",
            kodeKompetensi: "C.26PKR00.010.1",
            jp: 2,
          },
          {
            no: "2.",
            mataAjar: "SOP Keselamatan Radiasi di Lingkungan Kerja",
            kode: "SI-PKR-PEKERJA-HP-ALARA-04",
            kodeKompetensi: "C.26PKR00.012.1",
            jp: 2,
          },
          {
            no: "3.",
            mataAjar: "Praktik Proteksi Radiasi: Jarak, Waktu, dan Penahan Radiasi (Shielding)",
            kode: "SI-PKR-PEKERJA-HP-ALARA-05",
            kodeKompetensi: "C.26PKR00.015.1",
            jp: 4,
          },
          {
            no: "4.",
            mataAjar: "Tindakan Awal Tanggap Darurat di Tempat Kerja",
            kode: "SI-PKR-PEKERJA-HP-ALARA-06",
            kodeKompetensi: "C.26PKR00.018.1",
            jp: 2,
          },
        ],
      },
      {
        code: "C",
        title: "MATERI PELATIHAN UTAMA: KOMPETENSI PILIHAN",
        units: [
          {
            no: "1.",
            mataAjar: "Hak dan Kewajiban Pekerja Radiasi Berdasarkan Regulasi BAPETEN",
            kode: "SI-PKR-PEKERJA-HP-ALARA-07",
            kodeKompetensi: "C.26PKR00.005.1",
            jp: 2,
          },
        ],
      },
      {
        code: "D",
        title: "MATERI PENDUKUNG",
        units: [
          {
            no: "1.",
            mataAjar: "Kapita Selekta & Evaluasi Pembelajaran Pekerja Radiasi",
            kode: "SI-PKR-PEKERJA-HP-ALARA-08",
            kodeKompetensi: "-",
            jp: 2,
          },
        ],
      },
    ],
  },
};

async function main() {
  console.log('🌱 Seeding training competency units...');

  const trainings = await prisma.training.findMany();
  console.log(`Found ${trainings.length} trainings in database.`);

  for (const t of trainings) {
    const syllabus = SYLLABUS_DATA[t.category];
    if (!syllabus) {
      console.log(`⚠️ No preset syllabus for category ${t.category}`);
      continue;
    }

    await prisma.training.update({
      where: { id: t.id },
      data: {
        titleEn: syllabus.trainingTitleEn,
        certHeaderId: syllabus.titleHeaderId,
        certSubtitleId: syllabus.trainingSubtitleId,
        certHeaderEn: syllabus.titleHeaderEn,
      },
    });

    await prisma.trainingCompetencyUnit.deleteMany({
      where: { trainingId: t.id },
    });

    let orderIndex = 1;
    for (const section of syllabus.sections) {
      for (const unit of section.units) {
        await prisma.trainingCompetencyUnit.create({
          data: {
            trainingId: t.id,
            sectionCode: section.code,
            sectionTitle: section.title,
            unitNo: unit.no,
            mataAjar: unit.mataAjar,
            kode: unit.kode,
            kodeKompetensi: unit.kodeKompetensi,
            jp: unit.jp,
            orderIndex: orderIndex++,
          },
        });
      }
    }
    console.log(`✅ Seeded ${orderIndex - 1} competency units for Training #${t.id} (${t.title})`);
  }

  console.log('🎉 Seeding competency units completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
