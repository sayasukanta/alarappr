import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const batchId = parseInt(resolved.id, 10);
    if (isNaN(batchId)) {
      return NextResponse.json({ error: "ID Batch tidak valid" }, { status: 400 });
    }

    const batch = await prisma.trainingBatch.findUnique({
      where: { id: batchId },
      include: {
        training: { select: { id: true, title: true, category: true } },
      },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch tidak ditemukan" }, { status: 404 });
    }

    // Ambil seluruh soal aktif untuk kategori pelatihan ini (mendukung multi-kategori)
    const allQuestions = await prisma.question.findMany({
      where: {
        isActive: true,
        OR: [
          {
            categories: {
              some: {
                category: {
                  code: batch.training.category,
                },
              },
            },
          },
          { category: batch.training.category },
        ],
      },
      select: {
        id: true,
        topic: true,
        questionText: true,
        difficulty: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true,
        optionE: true,
        correctAnswer: true,
        explanation: true,
        imageUrl: true,
      },
      orderBy: { id: "asc" },
    });

    // Ambil butir soal yang saat ini dipilih manual untuk batch ini
    const selectedQuestions = await prisma.batchTryoutQuestion.findMany({
      where: { batchId },
      orderBy: { orderIndex: "asc" },
      select: { questionId: true, orderIndex: true },
    });

    const selectedQuestionIds = selectedQuestions.map((sq) => sq.questionId);

    return NextResponse.json({
      batch: {
        id: batch.id,
        batchNumber: batch.batchNumber,
        trainingTitle: batch.training.title,
        category: batch.training.category,
        tryoutSelectionMode: batch.tryoutSelectionMode || "AUTOMATIC",
        tryoutQuestionCount: batch.tryoutQuestionCount || 20,
      },
      selectedQuestionIds,
      questions: allQuestions,
      totalAvailable: allQuestions.length,
    });
  } catch (error) {
    console.error("[ADMIN_TRYOUT_QUESTIONS_GET]", error);
    return NextResponse.json(
      { error: "Gagal memuat bank soal untuk batch ini" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await params;
    const batchId = parseInt(resolved.id, 10);
    if (isNaN(batchId)) {
      return NextResponse.json({ error: "ID Batch tidak valid" }, { status: 400 });
    }

    const body = await req.json();
    const { mode, questionIds } = body;

    const batch = await prisma.trainingBatch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch tidak ditemukan" }, { status: 404 });
    }

    const targetMode = mode === "MANUAL" ? "MANUAL" : "AUTOMATIC";
    const ids: number[] = Array.isArray(questionIds)
      ? questionIds.map((id: any) => parseInt(id, 10)).filter((n: number) => !isNaN(n))
      : [];

    if (targetMode === "MANUAL" && ids.length === 0) {
      return NextResponse.json(
        { error: "Pilih minimal 1 butir soal untuk mode manual." },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Update batch selection mode & question count
      await tx.trainingBatch.update({
        where: { id: batchId },
        data: {
          tryoutSelectionMode: targetMode,
          tryoutQuestionCount: targetMode === "MANUAL" ? ids.length : batch.tryoutQuestionCount || 20,
        },
      });

      // Clear existing manual selections
      await tx.batchTryoutQuestion.deleteMany({
        where: { batchId },
      });

      // If manual mode, insert new selections
      if (targetMode === "MANUAL" && ids.length > 0) {
        await tx.batchTryoutQuestion.createMany({
          data: ids.map((qId, idx) => ({
            batchId,
            questionId: qId,
            orderIndex: idx + 1,
          })),
        });
      }
    });

    return NextResponse.json({
      success: true,
      message:
        targetMode === "MANUAL"
          ? `Berhasil menetapkan ${ids.length} butir soal pilihan untuk Batch ${batch.batchNumber}.`
          : `Mode penentuan soal Batch ${batch.batchNumber} diubah ke Otomatis (Acak Kuota Soal).`,
      mode: targetMode,
      selectedCount: ids.length,
    });
  } catch (error) {
    console.error("[ADMIN_TRYOUT_QUESTIONS_POST]", error);
    return NextResponse.json(
      { error: "Gagal menyimpan pilihan butir soal" },
      { status: 500 }
    );
  }
}
