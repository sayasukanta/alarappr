import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { TrainingCategory } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const isTemplate = searchParams.get("template") === "true";
    const categoryParam = searchParams.get("category");

    const workbook = XLSX.utils.book_new();

    if (isTemplate) {
      // 1. Template Soal
      const templateData = [
        {
          kategori: "PPR_ANALISIS",
          topik: "Fisika Radiasi",
          tingkat_kesulitan: 2,
          teks_soal: "Berapa lama waktu yang dibutuhkan agar aktivitas isotop berkurang menjadi 25% jika waktu paruh adalah 6 jam?",
          opsi_a: "6 jam",
          opsi_b: "12 jam",
          opsi_c: "18 jam",
          opsi_d: "24 jam",
          opsi_e: "30 jam",
          kunci_jawaban: "B",
          pembahasan: "25% aktivitas adalah 2 waktu paruh: 2 x 6 jam = 12 jam.",
        },
        {
          kategori: "PPR_BAGASI",
          topik: "Sistem Keselamatan",
          tingkat_kesulitan: 1,
          teks_soal: "Tirai timbal pada mesin sinar-X bagasi berfungsi untuk...",
          opsi_a: "Menahan radiasi hambur agar tidak keluar terowongan",
          opsi_b: "Mencegah koper lecet",
          opsi_c: "Mengukur berat bagasi",
          opsi_d: "Mendeteksi cairan berbahaya",
          opsi_e: "Penyaring debu conveyor",
          kunci_jawaban: "A",
          pembahasan: "Tirai timbal mengandung proteksi Pb untuk menahan hamburan sinar-X keluar dari kabinet.",
        },
        {
          kategori: "PKR_PEKERJA",
          topik: "Regulasi BAPETEN",
          tingkat_kesulitan: 1,
          teks_soal: "NBD dosis efektif rata-rata untuk pekerja radiasi dalam 5 tahun berturut-turut adalah...",
          opsi_a: "10 mSv/tahun",
          opsi_b: "20 mSv/tahun",
          opsi_c: "50 mSv/tahun",
          opsi_d: "100 mSv/tahun",
          opsi_e: "1 mSv/tahun",
          kunci_jawaban: "B",
          pembahasan: "NBD efektif pekerja radiasi rata-rata 20 mSv/tahun selama 5 tahun (maks 50 mSv dalam 1 tahun).",
        },
      ];

      const wsFormat = XLSX.utils.json_to_sheet(templateData);

      // Set column widths
      wsFormat["!cols"] = [
        { wch: 15 }, // kategori
        { wch: 22 }, // topik
        { wch: 16 }, // tingkat_kesulitan
        { wch: 55 }, // teks_soal
        { wch: 30 }, // opsi_a
        { wch: 30 }, // opsi_b
        { wch: 30 }, // opsi_c
        { wch: 30 }, // opsi_d
        { wch: 30 }, // opsi_e
        { wch: 15 }, // kunci_jawaban
        { wch: 45 }, // pembahasan
      ];

      XLSX.utils.book_append_sheet(workbook, wsFormat, "Format Soal");

      // 2. Petunjuk Pengisian Sheet
      const instructions = [
        {
          Kolom: "kategori",
          Aturan: "Wajib diisi persis salah satu: PPR_ANALISIS, PPR_BAGASI, atau PKR_PEKERJA",
        },
        {
          Kolom: "topik",
          Aturan: "Contoh: Regulasi BAPETEN, Fisika Radiasi, Efek Biologi Radiasi, Proteksi Radiasi, dll.",
        },
        {
          Kolom: "tingkat_kesulitan",
          Aturan: "Isi angka: 1 (Mudah), 2 (Menengah), atau 3 (Sulit)",
        },
        {
          Kolom: "teks_soal",
          Aturan: "Pertanyaan atau narasi soal. Wajib diisi.",
        },
        {
          Kolom: "opsi_a s/d opsi_d",
          Aturan: "Pilihan jawaban A, B, C, D wajib terisi teksnya.",
        },
        {
          Kolom: "opsi_e",
          Aturan: "Pilihan jawaban E bersifat opsional (boleh dikosongkan jika pilihan ganda 4 opsi).",
        },
        {
          Kolom: "kunci_jawaban",
          Aturan: "Wajib diisi satu huruf kapital: A, B, C, D, atau E",
        },
        {
          Kolom: "pembahasan",
          Aturan: "Penjelasan atau uraian pembahasan jawaban benar (opsional tapi disarankan).",
        },
      ];

      const wsGuide = XLSX.utils.json_to_sheet(instructions);
      wsGuide["!cols"] = [{ wch: 20 }, { wch: 70 }];
      XLSX.utils.book_append_sheet(workbook, wsGuide, "Petunjuk Pengisian");

      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="template_soal_tryout_alara.xlsx"',
        },
      });
    }

    // Export real questions
    const where: any = {};
    if (categoryParam && categoryParam !== "ALL") {
      where.category = categoryParam as TrainingCategory;
    }

    const questions = await prisma.question.findMany({
      where,
      orderBy: { id: "asc" },
    });

    const exportRows = questions.map((q, idx) => ({
      no: idx + 1,
      id: q.id,
      kategori: q.category,
      topik: q.topic,
      tingkat_kesulitan: q.difficulty === 1 ? "1 - Mudah" : q.difficulty === 2 ? "2 - Menengah" : "3 - Sulit",
      teks_soal: q.questionText,
      opsi_a: q.optionA,
      opsi_b: q.optionB,
      opsi_c: q.optionC,
      opsi_d: q.optionD,
      opsi_e: q.optionE || "",
      kunci_jawaban: q.correctAnswer,
      pembahasan: q.explanation || "",
      status: q.isActive ? "Aktif" : "Non-Aktif",
    }));

    const wsData = XLSX.utils.json_to_sheet(exportRows);
    wsData["!cols"] = [
      { wch: 6 },
      { wch: 8 },
      { wch: 15 },
      { wch: 22 },
      { wch: 15 },
      { wch: 55 },
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
      { wch: 15 },
      { wch: 45 },
      { wch: 12 },
    ];

    XLSX.utils.book_append_sheet(workbook, wsData, "Bank Soal");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="bank_soal_alara_${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error exporting questions:", error);
    return NextResponse.json({ error: "Gagal mengekspor bank soal" }, { status: 500 });
  }
}
