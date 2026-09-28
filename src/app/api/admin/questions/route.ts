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
      where.OR = [
        { categories: { some: { category: { code: categoryParam } } } },
        { category: categoryParam as any },
      ];
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
      const searchConditions = [
        { questionText: { contains: q } },
        { topic: { contains: q } },
        { explanation: { contains: q } },
      ];
      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          { OR: searchConditions }
        ];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    // Dynamic counts by category from master categories
    const masterCategories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: "asc" },
    });

    const [total, activeCount] = await Promise.all([
      prisma.question.count(),
      prisma.question.count({ where: { isActive: true } }),
    ]);

    const byCategory: Record<string, number> = {};
    await Promise.all(
      masterCategories.map(async (cat) => {
        const count = await prisma.question.count({
          where: {
            isActive: true,
            OR: [
              { categories: { some: { categoryId: cat.id } } },
              { category: cat.code as any },
            ],
          },
        });
        byCategory[cat.code] = count;
      })
    );

    const filteredTotal = await prisma.question.count({ where });

    const questions = await prisma.question.findMany({
      where,
      include: {
        training: { select: { id: true, title: true } },
        categories: {
          include: {
            category: { select: { id: true, code: true, name: true } },
          },
        },
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
        byCategory,
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
      categoryIds,
      categoryCodes,
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

    // Resolve target category IDs
    let resolvedCategoryIds: number[] = [];
    if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      resolvedCategoryIds = categoryIds.map((id: any) => parseInt(String(id), 10)).filter((id: number) => !isNaN(id));
    } else if (Array.isArray(categoryCodes) && categoryCodes.length > 0) {
      const found = await prisma.category.findMany({
        where: { code: { in: categoryCodes } },
        select: { id: true },
      });
      resolvedCategoryIds = found.map((f) => f.id);
    } else if (category) {
      const found = await prisma.category.findUnique({
        where: { code: String(category) },
        select: { id: true },
      });
      if (found) resolvedCategoryIds = [found.id];
    }

    if (resolvedCategoryIds.length === 0 && !category) {
      return NextResponse.json(
        { error: "Mohon pilih minimal satu kategori pelatihan untuk soal ini." },
        { status: 400 }
      );
    }

    if (!topic || !questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
      return NextResponse.json(
        { error: "Mohon lengkapi field wajib: Topik, Teks Soal, Opsi A-D, dan Kunci Jawaban." },
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

    // Determine primary category for legacy enum column
    let primaryCategory: TrainingCategory = TrainingCategory.PPR_ANALISIS;
    if (category && Object.values(TrainingCategory).includes(category as TrainingCategory)) {
      primaryCategory = category as TrainingCategory;
    } else if (resolvedCategoryIds.length > 0) {
      const firstCat = await prisma.category.findUnique({ where: { id: resolvedCategoryIds[0] } });
      if (firstCat && Object.values(TrainingCategory).includes(firstCat.code as TrainingCategory)) {
        primaryCategory = firstCat.code as TrainingCategory;
      }
    }

    const question = await prisma.question.create({
      data: {
        category: primaryCategory,
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
        categories: {
          create: resolvedCategoryIds.map((catId) => ({
            categoryId: catId,
          })),
        },
      },
      include: {
        categories: {
          include: { category: true },
        },
      },
    });

    return NextResponse.json({ question, message: "Soal berhasil ditambahkan" }, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json({ error: "Gagal menyimpan soal" }, { status: 500 });
  }
}
