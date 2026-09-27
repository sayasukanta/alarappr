import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const registrationId = parseInt(resolvedParams.id, 10);
    const body = await req.json();
    const { bapetenTheory, bapetenPractical, bapetenInterview, finalStatus } = body;

    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        batch: {
          include: {
            training: true,
          },
        },
        examResult: true,
      },
    });

    if (!registration) {
      return NextResponse.json({ error: "Data pendaftaran tidak ditemukan" }, { status: 404 });
    }

    const activeSignatory = await prisma.certificateSignatory.findFirst({
      where: { isActive: true },
    });

    let certificateNumber = registration.examResult?.certificateNumber || undefined;

    if (finalStatus === "LULUS" && !certificateNumber) {
      const year = new Date().getFullYear();
      const code =
        registration.batch.training.category === "PPR_ANALISIS"
          ? "PPRA"
          : registration.batch.training.category === "PPR_BAGASI"
          ? "PPRB"
          : "PKR";
      const batchNum = String(registration.batch.batchNumber).padStart(3, "0");
      const seq = String(registrationId).padStart(3, "0");
      certificateNumber = `CERT/ALARA/${code}/${year}/B${batchNum}/${seq}`;
    }

    const examResult = await prisma.examResult.upsert({
      where: { registrationId },
      update: {
        bapetenTheoryScore: bapetenTheory !== null ? parseFloat(bapetenTheory) : null,
        bapetenPracticalScore: bapetenPractical !== null ? parseFloat(bapetenPractical) : null,
        bapetenInterviewScore: bapetenInterview !== null ? parseFloat(bapetenInterview) : null,
        finalStatus: finalStatus || undefined,
        certificateNumber: certificateNumber || undefined,
        signatoryId: activeSignatory?.id ?? undefined,
        issuedAt: finalStatus === "LULUS" ? new Date() : undefined,
      },
      create: {
        registrationId,
        bapetenTheoryScore: bapetenTheory !== null ? parseFloat(bapetenTheory) : null,
        bapetenPracticalScore: bapetenPractical !== null ? parseFloat(bapetenPractical) : null,
        bapetenInterviewScore: bapetenInterview !== null ? parseFloat(bapetenInterview) : null,
        finalStatus: finalStatus || undefined,
        certificateNumber: certificateNumber || undefined,
        signatoryId: activeSignatory?.id ?? undefined,
        issuedAt: finalStatus === "LULUS" ? new Date() : undefined,
      },
    });

    return NextResponse.json({ success: true, data: examResult });
  } catch (error) {
    console.error("[ADMIN_EXAM_RESULTS_PATCH]", error);
    return NextResponse.json(
      { error: "Gagal menyimpan nilai ujian" },
      { status: 500 }
    );
  }
}
