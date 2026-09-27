import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const answerSchema = z.object({
  questionId: z.number().int().positive(),
  selectedAnswer: z.enum(["A", "B", "C", "D", "E"]).nullable(),
  isMarked: z.boolean().optional().default(false),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { attemptId: attemptIdStr } = await params;
    const attemptId = parseInt(attemptIdStr);

    if (isNaN(attemptId)) {
      return NextResponse.json({ error: "ID sesi tidak valid" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = answerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { questionId, selectedAnswer, isMarked } = parsed.data;

    // Verify attempt belongs to user and is not submitted
    const attempt = await prisma.tryoutAttempt.findFirst({
      where: {
        id: attemptId,
        registration: { userId },
        submittedAt: null,
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "Sesi tryout tidak ditemukan atau sudah selesai" },
        { status: 404 }
      );
    }

    // Upsert answer
    const answer = await prisma.tryoutAnswer.upsert({
      where: {
        attemptId_questionId: { attemptId, questionId },
      },
      update: {
        selectedAnswer,
        isMarked,
      },
      create: {
        attemptId,
        questionId,
        selectedAnswer,
        isMarked: isMarked ?? false,
      },
    });

    return NextResponse.json({
      success: true,
      answer: {
        id: answer.id,
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isMarked: answer.isMarked,
      },
    });
  } catch (error) {
    console.error("[TRYOUT_ANSWER]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
