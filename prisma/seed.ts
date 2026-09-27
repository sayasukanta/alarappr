import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database ALARA Training System...");

  // Create Admin User
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@alara.co.id" },
    update: {},
    create: {
      email: "admin@alara.co.id",
      passwordHash: adminPassword,
      fullName: "Admin ALARA",
      role: "ADMIN",
      phoneNumber: "08123456789",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create Instructor User
  const instrPassword = await bcrypt.hash("instructor123", 12);
  const instrUser = await prisma.user.upsert({
    where: { email: "instructor@alara.co.id" },
    update: {},
    create: {
      email: "instructor@alara.co.id",
      passwordHash: instrPassword,
      fullName: "Ir. H. Expert Proteksi, M.Si.",
      role: "INSTRUCTOR",
      phoneNumber: "08198765432",
    },
  });

  // Create Instructor profile
  const instructor = await prisma.instructor.upsert({
    where: { userId: instrUser.id },
    update: {},
    create: {
      userId: instrUser.id,
      bapetenLicenseNo: "PPR-INSP-2024-009",
      licenseExpiryDate: new Date("2028-12-31"),
      iaeaCertification: true,
      specialization: "PPR_ANALISIS",
      bioSummary:
        "Mantan Inspektur BAPETEN dengan pengalaman 20+ tahun di bidang proteksi radiasi dan keselamatan nuklir. Alumni IAEA Post-Graduate Educational Course.",
      status: "ACTIVE",
    },
  });
  console.log("✅ Instructor created:", instrUser.email);

  // Create Test Participant
  const pesertaPassword = await bcrypt.hash("peserta123", 12);
  const peserta = await prisma.user.upsert({
    where: { email: "peserta@alara.co.id" },
    update: {},
    create: {
      email: "peserta@alara.co.id",
      passwordHash: pesertaPassword,
      fullName: "Budi Santoso",
      nik: "3172091238910001",
      role: "PESERTA",
      phoneNumber: "08112345678",
    },
  });
  console.log("✅ Test participant created:", peserta.email);

  // Create Sponsor User
  const sponsorPassword = await bcrypt.hash("sponsor123", 12);
  const sponsor = await prisma.user.upsert({
    where: { email: "sponsor@alara.co.id" },
    update: {},
    create: {
      email: "sponsor@alara.co.id",
      passwordHash: sponsorPassword,
      fullName: "PT Medika Radiasi",
      role: "SPONSOR",
      phoneNumber: "02112345678",
    },
  });
  console.log("✅ Sponsor user created:", sponsor.email);

  // Create Training Programs
  const pprAnalisis = await prisma.training.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      category: "PPR_ANALISIS",
      title:
        "Pelatihan Calon PPR Analisis Menggunakan Sumber Radiasi Pengion",
      price: 7000000,
      durationDays: 3,
      description:
        "Pelatihan untuk calon Petugas Proteksi Radiasi (PPR) bidang analisis menggunakan sumber radiasi pengion. Mencakup teori fisika radiasi, regulasi BAPETEN, prosedur proteksi radiasi, dan praktikum lapangan. Prasyarat: Ijazah minimal D3 Eksakta/Teknik.",
    },
  });

  const pprBagasi = await prisma.training.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      category: "PPR_BAGASI",
      title:
        "Pelatihan Calon PPR Pemindai Bagasi atau Barang Lainnya Menggunakan Sumber Radiasi Pengion",
      price: 4000000,
      durationDays: 3,
      description:
        "Pelatihan untuk calon Petugas Proteksi Radiasi (PPR) bidang pemindai bagasi dan barang menggunakan sumber radiasi pengion. Ditujukan untuk teknisi X-ray bagasi di bandara, pelabuhan, atau fasilitas keamanan.",
    },
  });

  const pkrPekerja = await prisma.training.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      category: "PKR_PEKERJA",
      title: "Pelatihan Proteksi dan Keselamatan Radiasi (PKR) Pekerja Radiasi",
      price: 3500000,
      durationDays: 3,
      description:
        "Pelatihan proteksi dan keselamatan radiasi untuk pekerja radiasi: operator, petugas analisis sampel, petugas perawatan, perawat, dan dokter di daerah/fasilitas radiasi.",
    },
  });
  console.log("✅ Training programs created");

  // Create Training Batches
  const batch1 = await prisma.trainingBatch.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      trainingId: pprAnalisis.id,
      batchNumber: 1,
      startDate: new Date("2026-10-15"),
      endDate: new Date("2026-10-17"),
      quota: 20,
      location: "CV. Hikmat Proteksi ALARA, Jakarta",
    },
  });

  const batch2 = await prisma.trainingBatch.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      trainingId: pprBagasi.id,
      batchNumber: 1,
      startDate: new Date("2026-10-22"),
      endDate: new Date("2026-10-24"),
      quota: 25,
      location: "Menara BCA, Jakarta Pusat",
    },
  });

  const batch3 = await prisma.trainingBatch.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      trainingId: pkrPekerja.id,
      batchNumber: 1,
      startDate: new Date("2026-11-05"),
      endDate: new Date("2026-11-07"),
      quota: 30,
      location: "CV. Hikmat Proteksi ALARA, Jakarta",
    },
  });
  console.log("✅ Training batches created");

  // Create Sample LMS Modules
  const modules = [
    { category: "PPR_ANALISIS", dayNumber: 1, title: "Modul 1.1 - Dasar Fisika Radiasi", orderIndex: 1 },
    { category: "PPR_ANALISIS", dayNumber: 1, title: "Modul 1.2 - Regulasi BAPETEN Perba No. 4/2024", orderIndex: 2 },
    { category: "PPR_ANALISIS", dayNumber: 2, title: "Modul 2.1 - Proteksi Radiasi Spesifik", orderIndex: 3 },
    { category: "PPR_ANALISIS", dayNumber: 2, title: "Modul 2.2 - Alat Ukur Radiasi & Dosimetri", orderIndex: 4 },
    { category: "PPR_ANALISIS", dayNumber: 3, title: "Modul 3.1 - Logbook Praktikum Lapangan", orderIndex: 5 },
    { category: "PPR_ANALISIS", dayNumber: 3, title: "Modul 3.2 - Simulasi Ujian BAPETEN", orderIndex: 6 },
    { category: "PPR_BAGASI", dayNumber: 1, title: "Modul 1.1 - Dasar Fisika Radiasi & Regulasi", orderIndex: 1 },
    { category: "PPR_BAGASI", dayNumber: 2, title: "Modul 2.1 - Pengoperasian Alat X-Ray Bagasi", orderIndex: 2 },
    { category: "PPR_BAGASI", dayNumber: 3, title: "Modul 3.1 - Praktikum & Simulasi Ujian", orderIndex: 3 },
  ];

  for (const mod of modules) {
    await prisma.lmsModule.create({
      data: {
        trainingCategory: mod.category as any,
        dayNumber: mod.dayNumber,
        title: mod.title,
        orderIndex: mod.orderIndex,
        isPublished: true,
      },
    });
  }
  console.log("✅ LMS Modules created");

  // Create Sample Questions for Tryout Bank
  const questions = [
    {
      category: "PPR_ANALISIS",
      topic: "Regulasi BAPETEN",
      questionText: "Berdasarkan Peraturan BAPETEN No. 4 Tahun 2024, Nilai Batas Dosis (NBD) efektif untuk pekerja radiasi adalah...",
      optionA: "10 mSv per tahun",
      optionB: "20 mSv per tahun rata-rata dalam 5 tahun",
      optionC: "50 mSv per tahun",
      optionD: "100 mSv dalam 5 tahun",
      optionE: "5 mSv per tahun",
      correctAnswer: "B",
      explanation: "Berdasarkan Perba BAPETEN No. 4 Tahun 2024, NBD efektif untuk pekerja radiasi adalah 20 mSv per tahun rata-rata dalam 5 tahun berturut-turut, dengan nilai maksimum 50 mSv dalam satu tahun.",
      difficulty: 1,
    },
    {
      category: "PPR_ANALISIS",
      topic: "Fisika Radiasi",
      questionText: "Suatu sumber radiasi Co-60 memiliki aktivitas awal 100 Ci. Jika waktu paruh Co-60 adalah 5,27 tahun, berapakah sisa aktivitas sumber tersebut setelah 10,54 tahun?",
      optionA: "50 Ci",
      optionB: "25 Ci",
      optionC: "12,5 Ci",
      optionD: "6,25 Ci",
      optionE: "10 Ci",
      correctAnswer: "B",
      explanation: "Menggunakan rumus peluruhan radioaktif: N(t) = N0 × (1/2)^(t/T½) = 100 × (1/2)^(10,54/5,27) = 100 × (1/2)^2 = 100 × 0,25 = 25 Ci",
      difficulty: 2,
    },
    {
      category: "PPR_ANALISIS",
      topic: "Efek Biologi Radiasi",
      questionText: "Efek stokastik dari radiasi pengion ditandai dengan...",
      optionA: "Ada nilai ambang dosis yang jelas",
      optionB: "Keparahan efek bergantung pada dosis",
      optionC: "Probabilitas terjadinya efek bergantung pada dosis, tanpa nilai ambang",
      optionD: "Efek langsung terlihat dalam waktu singkat",
      optionE: "Hanya terjadi pada dosis tinggi",
      correctAnswer: "C",
      explanation: "Efek stokastik (seperti kanker dan efek genetik) tidak memiliki nilai ambang dosis. Probabilitas terjadinya efek meningkat seiring peningkatan dosis, namun keparahan efek tidak bergantung pada dosis.",
      difficulty: 1,
    },
    {
      category: "PPR_ANALISIS",
      topic: "Alat Ukur Radiasi",
      questionText: "Detektor yang paling sesuai untuk mengukur laju dosis gamma di lapangan dengan respons yang cepat adalah...",
      optionA: "Dosimeter TLD",
      optionB: "Film badge",
      optionC: "Ionization chamber (kamar ionisasi)",
      optionD: "Bubble detector",
      optionE: "Etched track detector",
      correctAnswer: "C",
      explanation: "Ionization chamber (kamar ionisasi) memberikan respons real-time dan akurat untuk pengukuran laju dosis gamma di lapangan. TLD dan film badge digunakan untuk pemantauan dosis personal jangka panjang.",
      difficulty: 2,
    },
    {
      category: "PPR_ANALISIS",
      topic: "Proteksi Spesifik",
      questionText: "Prinsip ALARA dalam proteksi radiasi merupakan singkatan dari...",
      optionA: "Always Low And Radiation Achievable",
      optionB: "As Low As Reasonably Achievable",
      optionC: "Applied Limit And Radiation Acceptable",
      optionD: "Authorized Level And Radiation Allowance",
      optionE: "Achieved Limit As Radiation Allows",
      correctAnswer: "B",
      explanation: "ALARA merupakan singkatan dari 'As Low As Reasonably Achievable', yaitu prinsip optimisasi proteksi radiasi yang mengharuskan semua pihak untuk meminimalkan dosis radiasi serendah yang dapat dicapai secara wajar.",
      difficulty: 1,
    },
    {
      category: "PPR_ANALISIS",
      topic: "Keadaan Darurat Radiasi",
      questionText: "Langkah pertama yang harus dilakukan jika terjadi kebocoran sumber radioaktif di laboratorium adalah...",
      optionA: "Segera menutup sumber dengan tangan",
      optionB: "Mengumpulkan semua bahan radioaktif di satu tempat",
      optionC: "Mengevakuasi area, memberikan peringatan, dan melapor ke PPR",
      optionD: "Membersihkan kontaminasi sendiri dengan kain basah",
      optionE: "Menunggu situasi mereda sebelum bertindak",
      correctAnswer: "C",
      explanation: "Prosedur tanggap darurat radiasi yang benar: 1) Evakuasi semua personil dari area terdampak, 2) Pasang tanda peringatan/isolasi area, 3) Segera laporkan kejadian kepada PPR, 4) PPR akan mengkoordinasikan respons lebih lanjut termasuk dekontaminasi.",
      difficulty: 2,
    },
    {
      category: "PPR_BAGASI",
      topic: "Regulasi BAPETEN",
      questionText: "Pekerja yang mengoperasikan pesawat sinar X pemindai bagasi dikategorikan sebagai...",
      optionA: "Pekerja tidak terpapar radiasi",
      optionB: "Masyarakat umum",
      optionC: "Pekerja Radiasi yang harus dipantau dosisnya",
      optionD: "Petugas Proteksi Radiasi",
      optionE: "Pasien yang menjalani prosedur medis",
      correctAnswer: "C",
      explanation: "Operator pesawat sinar X pemindai bagasi dikategorikan sebagai Pekerja Radiasi berdasarkan Perba BAPETEN No. 4 Tahun 2024, sehingga wajib dipantau dosisnya menggunakan dosimeter personal.",
      difficulty: 1,
    },
  ];

  for (const q of questions) {
    await prisma.question.create({
      data: {
        category: q.category as any,
        topic: q.topic,
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        optionE: q.optionE,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        isActive: true,
      },
    });
  }
  console.log("✅ Sample questions seeded");

  // Create sample registration for test participant
  const reg = await prisma.registration.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      userId: peserta.id,
      batchId: batch1.id,
      registrationStatus: "MENUNGGU_VERIFIKASI",
      paymentStatus: "PENDING_VERIFICATION",
      sponsorName: "PT Medika Radiasi",
      sponsorNpwp: "01.234.567.8-901.000",
      instansi: "PT Medika Radiasi",
      alamat: "Jl. Radiasi No. 10, Jakarta Selatan",
      tempat_lahir: "Jakarta",
      tanggal_lahir: new Date("1990-09-12"),
    },
  });
  console.log("✅ Sample registration created");

  console.log("\n🎉 Seeding completed!\n");
  console.log("📋 Test Accounts:");
  console.log("   Admin    : admin@alara.co.id / admin123");
  console.log("   Instruktur: instructor@alara.co.id / instructor123");
  console.log("   Peserta  : peserta@alara.co.id / peserta123");
  console.log("   Sponsor  : sponsor@alara.co.id / sponsor123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
