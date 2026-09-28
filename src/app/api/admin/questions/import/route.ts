import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { TrainingCategory } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File excel (.xlsx) belum dipilih" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let workbook;
    try {
      workbook = XLSX.read(buffer, { type: "buffer" });
    } catch (parseErr) {
      return NextResponse.json(
        { error: "Format berkas tidak valid atau rusak. Pastikan berkas berformat .xlsx" },
        { status: 400 }
      );
    }

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return NextResponse.json({ error: "Lembar kerja (sheet) tidak ditemukan dalam berkas" }, { status: 400 });
    }

    // Pick sheet: first preference "Format Soal", then "Bank Soal", or first sheet
    const targetSheetName =
      workbook.SheetNames.find((s) => s.toLowerCase().includes("format") || s.toLowerCase().includes("soal")) ||
      workbook.SheetNames[0];

    const worksheet = workbook.Sheets[targetSheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: "" });

    if (!rawRows || rawRows.length === 0) {
      return NextResponse.json(
        { error: `Lembar kerja "${targetSheetName}" tidak memiliki baris data soal.` },
        { status: 400 }
      );
    }

    const masterCategories = await prisma.category.findMany({
      where: { isActive: true },
    });

    const validQuestions: any[] = [];
    const errors: string[] = [];

    rawRows.forEach((row, index) => {
      const rowNum = index + 2; // +1 for 0-index, +1 for header row

      // Helper to find value from possible key variations
      const getVal = (...keys: string[]) => {
        for (const k of keys) {
          for (const rowKey of Object.keys(row)) {
            const cleanKey = rowKey.trim().toLowerCase().replace(/[\s_\-]/g, "");
            const cleanTarget = k.toLowerCase().replace(/[\s_\-]/g, "");
            if (cleanKey === cleanTarget) {
              return String(row[rowKey]).trim();
            }
          }
        }
        return "";
      };

      const rawCat = getVal("kategori", "category", "jenis");
      const topic = getVal("topik", "topic", "materi") || "Umum";
      const rawDiff = getVal("tingkat_kesulitan", "tingkatkesulitan", "kesulitan", "difficulty");
      const questionText = getVal("teks_soal", "tekssoal", "soal", "pertanyaan", "question");
      const optionA = getVal("opsi_a", "opsia", "pilihan_a", "pilihana", "a");
      const optionB = getVal("opsi_b", "opsib", "pilihan_b", "pilihanb", "b");
      const optionC = getVal("opsi_c", "opsic", "pilihan_c", "pilihanc", "c");
      const optionD = getVal("opsi_d", "opsid", "pilihan_d", "pilihand", "d");
      const optionE = getVal("opsi_e", "opsie", "pilihan_e", "pilihane", "e");
      const rawAns = getVal("kunci_jawaban", "kuncijawaban", "kunci", "jawaban", "correct_answer", "answer");
      const explanation = getVal("pembahasan", "explanation", "keterangan");

      // Skip empty blank row
      if (!questionText && !optionA && !rawAns) {
        return;
      }

      // 1. Resolve Multi-Categories
      const upperCat = rawCat.toUpperCase().trim();
      let matchedCategories: typeof masterCategories = [];

      if (upperCat === "SEMUA" || upperCat === "ALL" || upperCat === "UMUM" || upperCat === "GENERAL") {
        matchedCategories = [...masterCategories];
      } else {
        const parts = upperCat.split(/[,;|]+/).map((s) => s.trim()).filter(Boolean);
        for (const part of parts) {
          const found = masterCategories.filter((mc) => {
            const code = mc.code.toUpperCase();
            const name = mc.name.toUpperCase();
            return (
              code === part ||
              name === part ||
              code.includes(part) ||
              part.includes(code) ||
              (part.includes("ANALIS") && code.includes("ANALISIS")) ||
              (part.includes("BAGASI") && code.includes("BAGASI")) ||
              ((part.includes("PEKERJA") || part.includes("PKR")) && code.includes("PEKERJA")) ||
              (part.includes("PENYEGARAN") && code.includes("PENYEGARAN")) ||
              (part.includes("EKSPOR") && code.includes("EKSPOR"))
            );
          });
          for (const f of found) {
            if (!matchedCategories.some((mc) => mc.id === f.id)) {
              matchedCategories.push(f);
            }
          }
        }
      }

      if (matchedCategories.length === 0) {
        errors.push(
          `Baris ${rowNum}: Kategori "${rawCat}" tidak dikenali dalam master kategori.`
        );
        return;
      }

      // 2. Validate Question Text
      if (!questionText || questionText.length < 5) {
        errors.push(`Baris ${rowNum}: Teks soal tidak boleh kosong.`);
        return;
      }

      // 3. Validate Options A-D
      if (!optionA || !optionB || !optionC || !optionD) {
        errors.push(`Baris ${rowNum}: Opsi A, B, C, dan D wajib diisi lengkap.`);
        return;
      }

      // 4. Validate Answer
      const upperAns = rawAns.toUpperCase().trim();
      const firstLetterAns = upperAns.charAt(0);
      if (!["A", "B", "C", "D", "E"].includes(firstLetterAns)) {
        errors.push(`Baris ${rowNum}: Kunci jawaban "${rawAns}" tidak valid. Harus berupa huruf A, B, C, D, atau E.`);
        return;
      }

      // 5. Parse Difficulty
      let difficulty = 1;
      if (rawDiff.includes("3") || rawDiff.toLowerCase().includes("sulit") || rawDiff.toLowerCase().includes("hard")) {
        difficulty = 3;
      } else if (
        rawDiff.includes("2") ||
        rawDiff.toLowerCase().includes("menengah") ||
        rawDiff.toLowerCase().includes("sedang") ||
        rawDiff.toLowerCase().includes("medium")
      ) {
        difficulty = 2;
      }

      let primaryCat: TrainingCategory = TrainingCategory.PPR_ANALISIS;
      const firstCode = matchedCategories[0].code;
      if (Object.values(TrainingCategory).includes(firstCode as TrainingCategory)) {
        primaryCat = firstCode as TrainingCategory;
      }

      validQuestions.push({
        data: {
          category: primaryCat,
          topic,
          difficulty,
          questionText,
          optionA,
          optionB,
          optionC,
          optionD,
          optionE: optionE || null,
          correctAnswer: firstLetterAns,
          explanation: explanation || null,
          isActive: true,
          categories: {
            create: matchedCategories.map((c) => ({ categoryId: c.id })),
          },
        },
      });
    });

    if (validQuestions.length === 0) {
      return NextResponse.json(
        {
          error: "Tidak ada baris soal yang memenuhi syarat untuk diimpor.",
          details: errors,
        },
        { status: 400 }
      );
    }

    // Insert into database with multi-category relations
    for (const q of validQuestions) {
      await prisma.question.create(q);
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengimpor ${validQuestions.length} soal ke bank soal dengan kategori terhubung.`,
      importedCount: validQuestions.length,
      errorsCount: errors.length,
      errors: errors.slice(0, 15),
    });
  } catch (error) {
    console.error("Error importing questions:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat memproses file excel" }, { status: 500 });
  }
}
