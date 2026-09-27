import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { TrainingCategory } from "@prisma/client";

const startSchema = z.object({
  registrationId: z.number().int().positive().optional(),
  category: z.string().optional(),
  questionCount: z.number().int().positive().optional(),
  durationMinutes: z.number().int().positive().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);
    const body = await request.json().catch(() => ({}));

    const parsed = startSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    let { registrationId, category: requestedCat, questionCount, durationMinutes } = parsed.data;

    let registration = null;
    if (registrationId) {
      registration = await prisma.registration.findFirst({
        where: { id: registrationId, userId },
        include: {
          batch: { include: { training: true } },
          tryoutAttempts: {
            where: { submittedAt: null },
          },
        },
      });
    } else {
      // Find latest registration of user
      registration = await prisma.registration.findFirst({
        where: { userId },
        include: {
          batch: { include: { training: true } },
          tryoutAttempts: {
            where: { submittedAt: null },
          },
        },
        orderBy: { id: "desc" },
      });
    }

    // Check for ongoing attempt
    if (registration && registration.tryoutAttempts.length > 0) {
      const ongoingAttempt = registration.tryoutAttempts[0];
      return NextResponse.json(
        {
          error: "Anda memiliki sesi tryout yang belum selesai",
          attemptId: ongoingAttempt.id,
        },
        { status: 409 }
      );
    }

    const userRole = (session.user as any)?.role;
    const now = new Date();

    // Check tryout window for regular participants
    if (registration && userRole !== "ADMIN") {
      const b = registration.batch;
      const isTimeValid =
        b.tryoutOpen &&
        b.tryoutEndTime !== null &&
        now <= b.tryoutEndTime &&
        (!b.tryoutStartTime || now >= b.tryoutStartTime);

      if (!isTimeValid) {
        if (b.tryoutEndTime && now > b.tryoutEndTime) {
          return NextResponse.json(
            {
              error: "Sesi ujian tryout untuk batch Anda telah berakhir dan ditutup secara otomatis oleh sistem.",
            },
            { status: 403 }
          );
        }
        return NextResponse.json(
          {
            error: "Sesi ujian tryout untuk batch Anda saat ini belum dibuka oleh Admin / Pengawas.",
          },
          { status: 403 }
        );
      }
    }

    // Determine category
    let category: TrainingCategory = TrainingCategory.PPR_ANALISIS;
    if (requestedCat) {
      const upper = requestedCat.toUpperCase();
      if (upper.includes("BAGASI")) category = TrainingCategory.PPR_BAGASI;
      else if (upper.includes("PEKERJA") || upper.includes("PKR")) category = TrainingCategory.PKR_PEKERJA;
      else category = TrainingCategory.PPR_ANALISIS;
    } else if (registration) {
      category = registration.batch.training.category;
    }

    // If user has no registration yet, create/find a practice registration
    if (!registration) {
      // Find a batch for this category or default
      const defaultBatch = await prisma.trainingBatch.findFirst({
        where: { training: { category } },
        orderBy: { id: "desc" },
      });

      if (!defaultBatch) {
        return NextResponse.json(
          { error: "Batch pelatihan untuk kategori ini belum tersedia." },
          { status: 404 }
        );
      }

      registration = await prisma.registration.create({
        data: {
          userId,
          batchId: defaultBatch.id,
          registrationStatus: "APPROVED",
        },
        include: {
          batch: { include: { training: true } },
          tryoutAttempts: true,
        },
      });
    }

    let selectedQuestions: any[] = [];

    // Check if batch is configured with manual question selection
    if (registration?.batch?.id && registration?.batch?.tryoutSelectionMode === "MANUAL") {
      const manualSelections = await prisma.batchTryoutQuestion.findMany({
        where: { batchId: registration.batch.id },
        include: {
          question: {
            select: {
              id: true,
              topic: true,
              questionText: true,
              imageUrl: true,
              optionA: true,
              optionB: true,
              optionC: true,
              optionD: true,
              optionE: true,
              difficulty: true,
            },
          },
        },
        orderBy: { orderIndex: "asc" },
      });

      if (manualSelections.length > 0) {
        selectedQuestions = manualSelections.map((ms) => ms.question);
      }
    }

    // Fallback or AUTOMATIC mode: random sampling from active questions
    if (selectedQuestions.length === 0) {
      const allQuestions = await prisma.question.findMany({
        where: { category, isActive: true },
        select: {
          id: true,
          topic: true,
          questionText: true,
          imageUrl: true,
          optionA: true,
          optionB: true,
          optionC: true,
          optionD: true,
          optionE: true,
          difficulty: true,
        },
      });

      if (allQuestions.length === 0) {
        return NextResponse.json(
          {
            error: `Belum ada soal aktif yang tersedia untuk kategori ${category}. Silakan hubungi admin.`,
          },
          { status: 422 }
        );
      }

      const targetCount =
        registration?.batch?.tryoutQuestionCount || questionCount || 20;
      const finalCount = Math.min(allQuestions.length, targetCount);

      // Fisher-Yates shuffle and take finalCount questions
      const shuffled = [...allQuestions];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      selectedQuestions = shuffled.slice(0, finalCount);
    }

    const finalCount = selectedQuestions.length;

    // Create attempt
    const attempt = await prisma.tryoutAttempt.create({
      data: {
        registrationId: registration.id,
        tabSwitchCount: 0,
        timeExpired: false,
      },
    });

    // Pre-create answer placeholders
    await prisma.tryoutAnswer.createMany({
      data: selectedQuestions.map((q) => ({
        attemptId: attempt.id,
        questionId: q.id,
        selectedAnswer: null,
        isMarked: false,
      })),
    });

    let finalDuration =
      durationMinutes || registration?.batch?.tryoutDurationMinutes || (finalCount <= 20 ? 30 : finalCount <= 40 ? 60 : 90);
    if (registration?.batch?.tryoutEndTime && userRole !== "ADMIN") {
      const remainingMinutesUntilClose = Math.ceil(
        (new Date(registration.batch.tryoutEndTime).getTime() - now.getTime()) / 60000
      );
      finalDuration = Math.min(finalDuration, Math.max(1, remainingMinutesUntilClose));
    }

    return NextResponse.json(
      {
        attemptId: attempt.id,
        startedAt: attempt.startedAt,
        durationMinutes: finalDuration,
        totalQuestions: finalCount,
        questions: selectedQuestions.map((q, index) => ({
          index: index + 1,
          id: q.id,
          topic: q.topic,
          questionText: q.questionText,
          imageUrl: q.imageUrl,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          optionE: q.optionE,
          difficulty: q.difficulty,
        })),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[TRYOUT_START]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat memulai sesi tryout" },
      { status: 500 }
    );
  }
}
