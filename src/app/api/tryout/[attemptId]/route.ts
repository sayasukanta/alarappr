import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const attemptId = parseInt(resolvedParams.attemptId, 10);

    const attempt = await prisma.tryoutAttempt.findUnique({
      where: { id: attemptId },
      include: {
        registration: {
          include: {
            batch: {
              include: {
                training: true,
              },
            },
          },
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                category: true,
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
          orderBy: { id: "asc" },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Sesi tryout tidak ditemukan" }, { status: 404 });
    }

    const questions = attempt.answers
      .filter((a) => a.question !== null)
      .map((a) => a.question);

    const answersMap: Record<number, string> = {};
    const markedMap: Record<number, boolean> = {};

    attempt.answers.forEach((ans) => {
      if (ans.selectedAnswer) answersMap[ans.questionId] = ans.selectedAnswer;
      if (ans.isMarked) markedMap[ans.questionId] = ans.isMarked;
    });

    return NextResponse.json({
      id: attempt.id,
      startedAt: attempt.startedAt,
      durationMinutes: 60,
      tabSwitchCount: attempt.tabSwitchCount,
      questions,
      answers: answersMap,
      marked: markedMap,
    });
  } catch (error) {
    console.error("Error fetching attempt details:", error);
    return NextResponse.json({ error: "Gagal memuat tryout" }, { status: 500 });
  }
}
