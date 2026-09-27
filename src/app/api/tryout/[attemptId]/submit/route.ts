import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PASS_SCORE = 70;

interface TopicScore {
  topic: string;
  correct: number;
  total: number;
  score: number;
}

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

    const body = await request.json().catch(() => ({}));
    const timeExpired = body?.timeExpired === true;

    // Load attempt with answers and questions
    const attempt = await prisma.tryoutAttempt.findFirst({
      where: {
        id: attemptId,
        registration: { userId },
        submittedAt: null,
      },
      include: {
        registration: {
          include: { batch: { include: { training: true } } },
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                topic: true,
                questionText: true,
                correctAnswer: true,
                explanation: true,
                optionA: true,
                optionB: true,
                optionC: true,
                optionD: true,
                optionE: true,
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "Sesi tryout tidak ditemukan atau sudah diselesaikan" },
        { status: 404 }
      );
    }

    const totalQuestions = attempt.answers.length;
    if (totalQuestions === 0) {
      return NextResponse.json(
        { error: "Tidak ada soal dalam sesi ini" },
        { status: 422 }
      );
    }

    // Calculate scores per answer
    const gradedAnswers = attempt.answers.map((a) => {
      const isCorrect =
        a.selectedAnswer !== null &&
        a.selectedAnswer === a.question.correctAnswer;
      return { ...a, isCorrect };
    });

    const correctCount = gradedAnswers.filter((a) => a.isCorrect).length;
    const totalScore = Math.round((correctCount / totalQuestions) * 100);
    const passed = totalScore >= PASS_SCORE;

    // Per-topic scores for radar chart
    const topicMap = new Map<string, TopicScore>();
    for (const a of gradedAnswers) {
      const topic = a.question.topic;
      if (!topicMap.has(topic)) {
        topicMap.set(topic, { topic, correct: 0, total: 0, score: 0 });
      }
      const t = topicMap.get(topic)!;
      t.total += 1;
      if (a.isCorrect) t.correct += 1;
    }
    const radarData = Array.from(topicMap.values()).map((t) => ({
      ...t,
      score: t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0,
    }));

    // Update answers with isCorrect
    await prisma.$transaction(
      gradedAnswers.map((a) =>
        prisma.tryoutAnswer.update({
          where: { id: a.id },
          data: { isCorrect: a.isCorrect },
        })
      )
    );

    // Update attempt
    await prisma.tryoutAttempt.update({
      where: { id: attemptId },
      data: {
        submittedAt: new Date(),
        totalScore,
        timeExpired,
        status: passed ? "LULUS_TRYOUT" : "BELUM_LULUS",
      },
    });

    // Update or create ExamResult.tryoutScore if this is better than existing
    const existingResult = await prisma.examResult.findUnique({
      where: { registrationId: attempt.registrationId },
    });

    if (!existingResult) {
      await prisma.examResult.create({
        data: {
          registrationId: attempt.registrationId,
          tryoutScore: totalScore,
        },
      });
    } else if (
      existingResult.tryoutScore === null ||
      totalScore > (existingResult.tryoutScore ?? 0)
    ) {
      await prisma.examResult.update({
        where: { id: existingResult.id },
        data: { tryoutScore: totalScore },
      });
    }

    // Build question review (now safe to return correct answers)
    const questionReview = gradedAnswers.map((a) => ({
      questionId: a.question.id,
      topic: a.question.topic,
      questionText: a.question.questionText,
      optionA: a.question.optionA,
      optionB: a.question.optionB,
      optionC: a.question.optionC,
      optionD: a.question.optionD,
      optionE: a.question.optionE,
      selectedAnswer: a.selectedAnswer,
      correctAnswer: a.question.correctAnswer,
      isCorrect: a.isCorrect,
      explanation: a.question.explanation,
      isMarked: a.isMarked,
    }));

    return NextResponse.json({
      attemptId,
      totalScore,
      correctCount,
      totalQuestions,
      passed,
      status: passed ? "LULUS_TRYOUT" : "BELUM_LULUS",
      passScore: PASS_SCORE,
      submittedAt: new Date().toISOString(),
      radarData,
      questionReview,
    });
  } catch (error) {
    console.error("[TRYOUT_SUBMIT]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
