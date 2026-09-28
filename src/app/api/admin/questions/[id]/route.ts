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

    // Check if question has answers in attempts
    const answerCount = await prisma.tryoutAnswer.count({
      where: { questionId },
    });

    if (answerCount > 0) {
      // Question has been attempted by participants. Soft-deactivate to preserve historical test integrity!
      await prisma.question.update({
        where: { id: questionId },
        data: { isActive: false },
      });
      return NextResponse.json({
        message: "Soal telah pernah dikerjakan oleh peserta dalam riwayat tryout, sehingga statusnya dialihkan menjadi Non-Aktif (diarsipkan).",
        deactivated: true,
      });
    }

    await prisma.question.delete({
      where: { id: questionId },
    });

    return NextResponse.json({ message: "Soal berhasil dihapus", deleted: true });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json({ error: "Gagal menghapus soal" }, { status: 500 });
  }
}
