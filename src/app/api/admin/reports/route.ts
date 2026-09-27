import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const batchIdParam = searchParams.get("batchId");
    const sponsorParam = searchParams.get("sponsor");

    const where: any = {};
    if (batchIdParam && batchIdParam !== "all") {
      where.batchId = parseInt(batchIdParam, 10);
    }
    if (sponsorParam) {
      where.sponsorName = { contains: sponsorParam };
    }

    const registrations = await prisma.registration.findMany({
      where,
      include: {
        user: {
          select: {
            fullName: true,
            nik: true,
            instansi: true,
          },
        },
        batch: {
          include: {
            training: { select: { title: true } },
          },
        },
        examResult: true,
        tryoutAttempts: {
          orderBy: { totalScore: "desc" },
          take: 1,
        },
      },
      orderBy: { id: "desc" },
    });

    const results = registrations.map((r) => {
      const bestTryout = r.tryoutAttempts[0]?.totalScore ?? null;
      return {
        registrationId: r.id,
        fullName: r.user.fullName,
        nik: r.user.nik,
        instansi: r.instansi || r.user.instansi,
        sponsorName: r.sponsorName,
        bapetenTheory: r.examResult?.bapetenTheoryScore ?? null,
        bapetenPractical: r.examResult?.bapetenPracticalScore ?? null,
        bapetenInterview: r.examResult?.bapetenInterviewScore ?? null,
        tryoutScore: r.examResult?.tryoutScore ?? bestTryout,
        finalStatus: r.examResult?.finalStatus ?? null,
        certificateNumber: r.examResult?.certificateNumber ?? null,
      };
    });

    const totalPeserta = results.length;
    const lulusBapeten = results.filter((r) => r.finalStatus === "LULUS").length;
    const tingkatKelulusan = totalPeserta > 0 ? Math.round((lulusBapeten / totalPeserta) * 100) : 0;

    const scores = results
      .map((r) => {
        const parts = [r.bapetenTheory, r.bapetenPractical, r.bapetenInterview].filter(
          (s): s is number => s !== null
        );
        if (parts.length === 0) return null;
        return parts.reduce((a, b) => a + b, 0) / parts.length;
      })
      .filter((s): s is number => s !== null);

    const rataRataSkor =
      scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null;

    // Batch pass rates for chart
    const batches = await prisma.trainingBatch.findMany({
      take: 6,
      orderBy: { startDate: "desc" },
      include: {
        training: { select: { title: true } },
        registrations: {
          include: { examResult: true },
        },
      },
    });

    const batchPassRates = batches.map((b) => {
      const total = b.registrations.length;
      const passed = b.registrations.filter((r) => r.examResult?.finalStatus === "LULUS").length;
      const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
      return {
        batchLabel: `B#${b.batchNumber} ${b.training.title.slice(0, 10)}`,
        passRate,
        total,
      };
    });

    return NextResponse.json({
      stats: {
        totalPeserta,
        lulusBapeten,
        tingkatKelulusan,
        rataRataSkor,
      },
      results,
      batchPassRates,
    });
  } catch (error) {
    console.error("[ADMIN_REPORTS_GET]", error);
    return NextResponse.json(
      { error: "Gagal memuat data laporan" },
      { status: 500 }
    );
  }
}
