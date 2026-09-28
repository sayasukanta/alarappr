import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TrainingCategory } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await params;
    const questionId = parseInt(resolved.id, 10);
    if (isNaN(questionId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        training: { select: { id: true, title: true } },
        categories: {
          include: {
            category: { select: { id: true, code: true, name: true } },
          },
        },
        _count: { select: { tryoutAnswers: true } },
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Soal tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ question });
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json({ error: "Gagal memuat detail soal" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await params;
    const questionId = parseInt(resolved.id, 10);
    if (isNaN(questionId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
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

    const existing = await prisma.question.findUnique({ where: { id: questionId } });
    if (!existing) {
      return NextResponse.json({ error: "Soal tidak ditemukan" }, { status: 404 });
    }

    const updateData: any = {};
    if (category) updateData.category = category as TrainingCategory;
    if (trainingId !== undefined) {
      updateData.trainingId = trainingId ? parseInt(String(trainingId), 10) : null;
    }
    if (topic !== undefined) updateData.topic = String(topic).trim();
    if (difficulty !== undefined) updateData.difficulty = parseInt(String(difficulty), 10);
    if (questionText !== undefined) updateData.questionText = String(questionText).trim();
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl ? String(imageUrl).trim() : null;
    if (optionA !== undefined) updateData.optionA = String(optionA).trim();
    if (optionB !== undefined) updateData.optionB = String(optionB).trim();
    if (optionC !== undefined) updateData.optionC = String(optionC).trim();
    if (optionD !== undefined) updateData.optionD = String(optionD).trim();
    if (optionE !== undefined) updateData.optionE = optionE ? String(optionE).trim() : null;
    if (correctAnswer !== undefined) {
      const upper = String(correctAnswer).trim().toUpperCase();
      if (!["A", "B", "C", "D", "E"].includes(upper)) {
        return NextResponse.json({ error: "Kunci jawaban harus A, B, C, D, atau E." }, { status: 400 });
      }
      updateData.correctAnswer = upper;
    }
    if (explanation !== undefined) updateData.explanation = explanation ? String(explanation).trim() : null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    // Sync multi-category relations
    if (Array.isArray(categoryIds)) {
      const ids = categoryIds.map((id: any) => parseInt(String(id), 10)).filter((id: number) => !isNaN(id));
      await prisma.questionCategory.deleteMany({ where: { questionId } });
      if (ids.length > 0) {
        await prisma.questionCategory.createMany({
          data: ids.map((cid: number) => ({ questionId, categoryId: cid })),
        });
        const firstCat = await prisma.category.findUnique({ where: { id: ids[0] } });
        if (firstCat && Object.values(TrainingCategory).includes(firstCat.code as TrainingCategory)) {
          updateData.category = firstCat.code as TrainingCategory;
        }
      }
    } else if (Array.isArray(categoryCodes) && categoryCodes.length > 0) {
      const found = await prisma.category.findMany({ where: { code: { in: categoryCodes } } });
      await prisma.questionCategory.deleteMany({ where: { questionId } });
      if (found.length > 0) {
        await prisma.questionCategory.createMany({
          data: found.map((f) => ({ questionId, categoryId: f.id })),
        });
      }
    }

    const question = await prisma.question.update({
      where: { id: questionId },
      data: updateData,
      include: {
        categories: {
          include: { category: true },
        },
      },
    });

    return NextResponse.json({ question, message: "Soal berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json({ error: "Gagal memperbarui soal" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await params;
    const questionId = parseInt(resolved.id, 10);
    if (isNaN(questionId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const body = await req.json();
    const { isActive } = body;

    if (isActive === undefined) {
      return NextResponse.json({ error: "Status isActive wajib disertakan" }, { status: 400 });
    }

    const question = await prisma.question.update({
      where: { id: questionId },
      data: { isActive: Boolean(isActive) },
    });

    return NextResponse.json({
      success: true,
      message: question.isActive
        ? "Status soal berhasil diaktifkan."
        : "Status soal berhasil dinonaktifkan.",
      question,
    });
  } catch (error) {
    console.error("Error toggling question status:", error);
    return NextResponse.json({ error: "Gagal memperbarui status soal" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await params;
    const questionId = parseInt(resolved.id, 10);
    if (isNaN(questionId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    // Ambil data soal beserta relasi penggunaan pada batch pelatihan & jawaban tryout
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        _count: {
          select: {
            batchSelections: true,
            tryoutAnswers: true,
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Soal tidak ditemukan" }, { status: 404 });
    }

    const batchUsageCount = question._count.batchSelections;
    const answerUsageCount = question._count.tryoutAnswers;
    const isUsedInBatch = batchUsageCount > 0 || answerUsageCount > 0;

    // Aturan bisnis:
    // Jika soal sudah terkait atau digunakan pada batch pelatihan, HANYA dinonaktifkan (isActive = false)
    if (isUsedInBatch) {
      await prisma.question.update({
        where: { id: questionId },
        data: { isActive: false },
      });

      let detailReason = "Soal telah digunakan pada batch pelatihan/tryout";
      if (batchUsageCount > 0 && answerUsageCount > 0) {
        detailReason = `Soal sudah terkait dengan ${batchUsageCount} batch pelatihan dan memiliki ${answerUsageCount} riwayat jawaban peserta`;
      } else if (batchUsageCount > 0) {
        detailReason = `Soal sudah terdaftar/dipilih pada ${batchUsageCount} batch pelatihan`;
      } else {
        detailReason = `Soal telah memiliki ${answerUsageCount} riwayat jawaban tryout peserta`;
      }

      return NextResponse.json({
        success: true,
        action: "deactivated",
        message: `${detailReason}, sehingga status soal dialihkan menjadi Non-Aktif (diarsipkan) dan tidak dihapus permanen.`,
        questionId,
      });
    }

    // Jika belum pernah terkait atau digunakan pada batch manapun: hapus permanen
    await prisma.questionCategory.deleteMany({
      where: { questionId },
    });

    await prisma.question.delete({
      where: { id: questionId },
    });

    return NextResponse.json({
      success: true,
      action: "deleted",
      message: "Soal belum terkait pada batch pelatihan manapun dan berhasil dihapus permanen.",
      questionId,
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json({ error: "Gagal memproses penghapusan soal" }, { status: 500 });
  }
}
