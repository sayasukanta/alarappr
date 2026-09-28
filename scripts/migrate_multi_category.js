const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { code: 'PPR_ANALISIS', name: 'PPR Bidang Analisis', description: 'Pelatihan Calon Petugas Proteksi Radiasi bidang analisis dengan SRP (XRF, XRD, dll)', orderIndex: 1 },
  { code: 'PPR_BAGASI', name: 'PPR Pemindai Bagasi', description: 'Pelatihan Calon Petugas Proteksi Radiasi pemindai bagasi / barang (X-ray bandara/fasilitas keamanan)', orderIndex: 2 },
  { code: 'PKR_PEKERJA', name: 'PKR Pekerja Radiasi', description: 'Pelatihan Proteksi dan Keselamatan Radiasi untuk seluruh pekerja dan staf di medan radiasi', orderIndex: 3 },
  { code: 'PPR_PENYEGARAN', name: 'PPR Penyegaran', description: 'Penyegaran kompetensi PPR untuk syarat perpanjangan Surat Izin Bekerja (SIB) BAPETEN', orderIndex: 4 },
  { code: 'PPR_EKSPOR_IMPOR', name: 'PPR Ekspor Impor', description: 'Pelatihan Calon Petugas Proteksi Radiasi untuk instansi importir / distributor SRP', orderIndex: 5 },
  { code: 'PPR_INDUSTRI_1', name: 'PPR Industri Tingkat 1', description: 'Pelatihan Calon PPR Industri Tingkat 1 (Radiografi Industri & Iradiator)', orderIndex: 6 },
  { code: 'PPR_INDUSTRI_2', name: 'PPR Industri Tingkat 2', description: 'Pelatihan Calon PPR Industri Tingkat 2 (Gauging, Logging, dll)', orderIndex: 7 },
  { code: 'PPR_MEDIK_1', name: 'PPR Medik Tingkat 1', description: 'Pelatihan Calon PPR Medik Tingkat 1 (Radioterapi & Kedokteran Nuklir)', orderIndex: 8 },
  { code: 'PPR_MEDIK_2', name: 'PPR Medik Tingkat 2', description: 'Pelatihan Calon PPR Medik Tingkat 2 (Radiologi Diagnostik & Intervensional)', orderIndex: 9 },
];

async function main() {
  console.log('🚀 Menjalankan migrasi skema tabel kategori & relasi bank soal...');

  // 1. Buat tabel training_categories jika belum ada
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`training_categories\` (
      \`id\` INTEGER NOT NULL AUTO_INCREMENT,
      \`code\` VARCHAR(191) NOT NULL,
      \`name\` VARCHAR(191) NOT NULL,
      \`description\` TEXT NULL,
      \`order_index\` INTEGER NOT NULL DEFAULT 1,
      \`is_active\` BOOLEAN NOT NULL DEFAULT true,
      \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      UNIQUE INDEX \`training_categories_code_key\`(\`code\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `);

  // 2. Buat tabel question_categories jika belum ada
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`question_categories\` (
      \`id\` INTEGER NOT NULL AUTO_INCREMENT,
      \`question_id\` INTEGER NOT NULL,
      \`category_id\` INTEGER NOT NULL,
      \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      INDEX \`question_categories_question_id_idx\`(\`question_id\`),
      INDEX \`question_categories_category_id_idx\`(\`category_id\`),
      UNIQUE INDEX \`question_categories_question_id_category_id_key\`(\`question_id\`, \`category_id\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `);

  // 3. Tambahkan kolom category_id ke trainings jika belum ada
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE \`trainings\` ADD COLUMN \`category_id\` INTEGER NULL;
    `);
  } catch (e) {
    // Column might already exist, ignore error
  }

  // 4. Seed master kategori
  console.log('📦 Memasukkan data master kategori pelatihan...');
  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { code: cat.code },
      update: { name: cat.name, description: cat.description, orderIndex: cat.orderIndex },
      create: {
        code: cat.code,
        name: cat.name,
        description: cat.description,
        orderIndex: cat.orderIndex,
        isActive: true,
      },
    });
  }

  // 5. Hubungkan trainings ke category_id
  const allCategories = await prisma.category.findMany();
  const catMap = new Map(allCategories.map(c => [c.code, c.id]));

  const trainings = await prisma.training.findMany();
  for (const t of trainings) {
    const catId = catMap.get(t.category);
    if (catId && t.categoryId !== catId) {
      await prisma.training.update({
        where: { id: t.id },
        data: { categoryId: catId },
      });
      console.log(`🔗 Training "${t.title}" dihubungkan ke kategori ID ${catId} (${t.category})`);
    }
  }

  // 6. Migrasikan soal yang ada ke question_categories
  const questions = await prisma.question.findMany({
    include: { categories: true },
  });

  let linkedCount = 0;
  for (const q of questions) {
    const catId = catMap.get(q.category);
    if (catId) {
      const alreadyLinked = q.categories.some(qc => qc.categoryId === catId);
      if (!alreadyLinked) {
        await prisma.questionCategory.create({
          data: {
            questionId: q.id,
            categoryId: catId,
          },
        });
        linkedCount++;
      }
    }
  }

  console.log(`✅ Berhasil menautkan ${linkedCount} soal ke relasi kategori baru!`);
  console.log('🎉 Migrasi master kategori & relasi bank soal selesai!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
