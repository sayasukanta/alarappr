import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TrainingCategory } from "@prisma/client";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);

    // Active questions count per category
    const [pprAnalisisCount, pprBagasiCount, pkrPekerjaCount] = await Promise.all([
      prisma.question.count({ where: { category: TrainingCategory.PPR_ANALISIS, isActive: true } }),
      prisma.question.count({ where: { category: TrainingCategory.PPR_BAGASI, isActive: true } }),
      prisma.question.count({ where: { category: TrainingCategory.PKR_PEKERJA, isActive: true } }),
    ]);

    // User's registration info
    const userRegistrations = await prisma.registration.findMany({
      where: { userId },
      include: {
        batch: {
          include: {
            training: true,
          },
        },
      },
    });

    // User's attempt history
    const attempts = await prisma.tryoutAttempt.findMany({
      where: {
        registration: {
          userId,
        },
      },
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
        _count: {
          select: {
            answers: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
      take: 20,
    });

    const activeReg = userRegistrations[0] || null;
    const batchQCount = activeReg?.batch?.tryoutQuestionCount || 20;
    const now = new Date();

    const packages = [
      {
        id: "ppr-analisis",
        title: "Tryout Mandiri – PPR Analisis",
        category: "PPR_ANALISIS",
        categoryLabel: "PPR Analisis",
        description:
          "Latihan soal mencakup regulasi BAPETEN Perba No. 4/2024, fisika radiasi, efek biologi, alat ukur dosimetri, proteksi spesifik, dan kedaruratan.",
        questionCount: Math.min(batchQCount, pprAnalisisCount > 0 ? pprAnalisisCount : batchQCount),
        totalBankQuestions: pprAnalisisCount,
        timeLimitMin: activeReg?.batch?.tryoutDurationMinutes || 30,
        difficulty: "Menengah",
        passingGrade: 70,
        badge: "Rekomendasi",
      },
      {
        id: "ppr-bagasi",
        title: "Tryout Mandiri – PPR Bagasi",
        category: "PPR_BAGASI",
        categoryLabel: "PPR Bagasi",
        description:
          "Latihan soal keselamatan pesawat sinar-X inspeksi bagasi, tirai timbal, batas kebocoran kabinet, safety interlock, dan pemantauan dosis personal.",
        questionCount: Math.min(batchQCount, pprBagasiCount > 0 ? pprBagasiCount : batchQCount),
        totalBankQuestions: pprBagasiCount,
        timeLimitMin: activeReg?.batch?.tryoutDurationMinutes || 30,
        difficulty: "Menengah",
        passingGrade: 70,
        badge: "Populer",
      },
      {
        id: "pkr-pekerja",
        title: "Tryout Mandiri – Pekerja Radiasi (PKR)",
        category: "PKR_PEKERJA",
        categoryLabel: "Pekerja Radiasi",
        description:
          "Pemahaman dasar proteksi radiasi eksterna (waktu, jarak, perisai), Nilai Batas Dosis (NBD), APD apron Pb, simbol bahaya radiasi trefoil, dan daerah kerja.",
        questionCount: Math.min(batchQCount, pkrPekerjaCount > 0 ? pkrPekerjaCount : batchQCount),
        totalBankQuestions: pkrPekerjaCount,
        timeLimitMin: activeReg?.batch?.tryoutDurationMinutes || 30,
        difficulty: "Mudah",
        passingGrade: 70,
      },
    ];

    let tryoutSchedule = {
      isOpen: false,
      startTime: null as string | null,
      endTime: null as string | null,
      durationMinutes: 60,
      questionCount: batchQCount,
      remainingMinutes: 0,
      statusMessage: activeReg
        ? "Sesi ujian tryout saat ini belum dibuka oleh Admin / Pengawas."
        : "Anda belum terdaftar dalam batch pelatihan manapun. Silakan mendaftar batch terlebih dahulu untuk mengikuti sesi tryout.",
      batchName: activeReg ? `Batch ${activeReg.batch.batchNumber} - ${activeReg.batch.training.title}` : null,
    };

    if (activeReg && activeReg.batch) {
      const b = activeReg.batch;
      const isTimeValid =
        b.tryoutOpen &&
        b.tryoutEndTime !== null &&
        now <= b.tryoutEndTime &&
        (!b.tryoutStartTime || now >= b.tryoutStartTime);

      if (isTimeValid) {
        const remainingMs = Math.max(0, b.tryoutEndTime!.getTime() - now.getTime());
        const remMin = Math.max(1, Math.ceil(remainingMs / 60000));
        const qCount = b.tryoutQuestionCount || 20;
        tryoutSchedule = {
          isOpen: true,
          startTime: b.tryoutStartTime?.toISOString() || null,
          endTime: b.tryoutEndTime?.toISOString() || null,
          durationMinutes: b.tryoutDurationMinutes || 60,
          questionCount: qCount,
          remainingMinutes: remMin,
          statusMessage: `Sesi ujian tryout sedang dibuka (${qCount} butir soal acak) hingga pukul ${b.tryoutEndTime!.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB.`,
          batchName: `Batch ${b.batchNumber} - ${b.training.title}`,
        };
      } else if (b.tryoutEndTime && now > b.tryoutEndTime) {
        tryoutSchedule = {
          isOpen: false,
          startTime: b.tryoutStartTime?.toISOString() || null,
          endTime: b.tryoutEndTime?.toISOString() || null,
          durationMinutes: b.tryoutDurationMinutes || 60,
          questionCount: b.tryoutQuestionCount || 20,
          remainingMinutes: 0,
          statusMessage: "Sesi ujian tryout untuk batch Anda telah ditutup (waktu ujian telah berakhir).",
          batchName: `Batch ${b.batchNumber} - ${b.training.title}`,
        };
      }
    }

    return NextResponse.json({
      packages,
      history: attempts.map((a) => ({
        id: a.id,
        packageTitle: `Tryout ${a.registration.batch.training.title}`,
        category: a.registration.batch.training.category,
        score: a.totalScore != null ? Math.round(a.totalScore) : 0,
        status: a.status === "LULUS_TRYOUT" || (a.totalScore != null && a.totalScore >= 70) ? "lulus" : "belum_lulus",
        date: new Date(a.startedAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        duration: `${Math.round(
          a.submittedAt ? (new Date(a.submittedAt).getTime() - new Date(a.startedAt).getTime()) / 60000 : 0
        )} Menit`,
        isSubmitted: a.submittedAt != null,
      })),
      activeRegistration: activeReg
        ? {
            id: activeReg.id,
            trainingTitle: activeReg.batch.training.title,
            category: activeReg.batch.training.category,
          }
        : null,
      tryoutSchedule,
    });
  } catch (error) {
    console.error("Error fetching tryout data:", error);
    return NextResponse.json({ error: "Gagal memuat data tryout" }, { status: 500 });
  }
}
