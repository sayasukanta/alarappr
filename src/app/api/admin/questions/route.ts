import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TrainingCategory } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoryParam = searchParams.get("category");
    const difficultyParam = searchParams.get("difficulty");
    const statusParam = searchParams.get("status");
    const searchParam = searchParams.get("search");
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = parseInt(searchParams.get("limit") || "20", 10);

    const where: any = {};

    if (categoryParam && categoryParam !== "ALL") {
      where.category = categoryParam as TrainingCategory;
    }

    if (difficultyParam && difficultyParam !== "ALL") {
      where.difficulty = parseInt(difficultyParam, 10);
    }

    if (statusParam === "active") {
      where.isActive = true;
    } else if (statusParam === "inactive") {
      where.isActive = false;
    }

    if (searchParam && searchParam.trim().length > 0) {
      const q = searchParam.trim();
      where.OR = [
        { questionText: { contains: q } },
        { topic: { contains: q } },
        { explanation: { contains: q } },
      ];
    }

    // Counts for dashboard metrics
    const [total, activeCount, pprAnalisisCount, pprBagasiCount, pkrPekerjaCount] = await Promise.all([
      prisma.question.count(),
      prisma.question.count({ where: { isActive: true } }),
      prisma.question.count({ where: { category: TrainingCategory.PPR_ANALISIS } }),
      prisma.question.count({ where: { category: TrainingCategory.PPR_BAGASI } }),
      prisma.question.count({ where: { category: TrainingCategory.PKR_PEKERJA } }),
    ]);

    const filteredTotal = await prisma.question.count({ where });

    const questions = await prisma.question.findMany({
      where,
      include: {
        training: { select: { id: true, title: true } },
      },
      orderBy: { id: "desc" },
      skip: limitParam === -1 ? 0 : (pageParam - 1) * limitParam,
      take: limitParam === -1 ? undefined : limitParam,
    });

    return NextResponse.json({
      questions,
      pagination: {
        total: filteredTotal,
        page: pageParam,
        limit: limitParam,
        totalPages: limitParam === -1 ? 1 : Math.ceil(filteredTotal / limitParam),
      },
      metrics: {
        total,
        active: activeCount,
        inactive: total - activeCount,
        byCategory: {
          PPR_ANALISIS: pprAnalisisCount,
          PPR_BAGASI: pprBagasiCount,
          PKR_PEKERJA: pkrPekerjaCount,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json({ error: "Gagal memuat bank soal" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      category,
      trainingId,
      topic,
      difficulty,
      questionText,
      imageUrl,
      optionA,
      optionB,
      optionC,
      optionD,
      optionE,
      correctAnswer,
      explanation,
      isActive,
    } = body;

    if (!category || !topic || !questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
      return NextResponse.json(
        { error: "Mohon lengkapi field wajib: Kategori, Topik, Teks Soal, Opsi A-D, dan Kunci Jawaban." },
        { status: 400 }
      );
    }

    const validAnswers = ["A", "B", "C", "D", "E"];
    const upperAnswer = String(correctAnswer).trim().toUpperCase();
    if (!validAnswers.includes(upperAnswer)) {
      return NextResponse.json(
        { error: "Kunci jawaban harus berupa huruf A, B, C, D, atau E." },
        { status: 400 }
      );
    }

    const question = await prisma.question.create({
      data: {
        category: category as TrainingCategory,
        trainingId: trainingId ? parseInt(String(trainingId), 10) : null,
        topic: String(topic).trim(),
        difficulty: difficulty ? parseInt(String(difficulty), 10) : 1,
        questionText: String(questionText).trim(),
        imageUrl: imageUrl ? String(imageUrl).trim() : null,
        optionA: String(optionA).trim(),
        optionB: String(optionB).trim(),
        optionC: String(optionC).trim(),
        optionD: String(optionD).trim(),
        optionE: optionE ? String(optionE).trim() : null,
        correctAnswer: upperAnswer,
        explanation: explanation ? String(explanation).trim() : null,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ question, message: "Soal berhasil ditambahkan" }, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json({ error: "Gagal menyimpan soal" }, { status: 500 });
  }
}
