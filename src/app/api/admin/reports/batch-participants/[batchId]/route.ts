import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ batchId: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { batchId } = await params;
    const parsedBatchId = parseInt(batchId, 10);
    if (isNaN(parsedBatchId)) {
      return NextResponse.json({ error: "Batch ID tidak valid" }, { status: 400 });
    }

    const batch = await prisma.trainingBatch.findUnique({
      where: { id: parsedBatchId },
      include: {
        training: true,
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch tidak ditemukan" }, { status: 404 });
    }

    const registrations = await prisma.registration.findMany({
      where: { batchId: parsedBatchId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            nik: true,
            email: true,
            phoneNumber: true,
            instansi: true,
          },
        },
        examResult: true,
      },
      orderBy: { id: "asc" },
    });

    const participants = registrations.map((r) => ({
      registrationId: r.id,
      fullName: r.user.fullName,
      nik: r.user.nik,
      email: r.user.email,
      phoneNumber: r.user.phoneNumber,
      instansi: r.instansi || r.user.instansi || "-",
      sponsorName: r.sponsorName,
      paymentStatus: r.paymentStatus,
      registrationStatus: r.registrationStatus,
      tryoutScore: r.examResult?.tryoutScore ?? null,
      bapetenTheory: r.examResult?.bapetenTheoryScore ?? null,
      bapetenPractical: r.examResult?.bapetenPracticalScore ?? null,
      bapetenInterview: r.examResult?.bapetenInterviewScore ?? null,
      finalStatus: r.examResult?.finalStatus ?? null,
      certificateNumber: r.examResult?.certificateNumber ?? null,
      examResultId: r.examResult?.id ?? null,
      signedCertificateUrl: r.examResult?.signedCertificateUrl ?? null,
      signedCertificateName: r.examResult?.signedCertificateName ?? null,
      signedUploadedAt: r.examResult?.signedUploadedAt?.toISOString() ?? null,
    }));

    return NextResponse.json({
      batch: {
        id: batch.id,
        batchNumber: batch.batchNumber,
        status: batch.status,
        startDate: batch.startDate.toISOString(),
        endDate: batch.endDate.toISOString(),
        quota: batch.quota,
        location: batch.location,
        training: {
          id: batch.training.id,
          title: batch.training.title,
          category: batch.training.category,
        },
        totalParticipants: batch._count.registrations,
        tryoutOpen: batch.tryoutOpen,
        tryoutStartTime: batch.tryoutStartTime?.toISOString() ?? null,
        tryoutEndTime: batch.tryoutEndTime?.toISOString() ?? null,
        tryoutDurationMinutes: batch.tryoutDurationMinutes ?? 60,
        tryoutQuestionCount: batch.tryoutQuestionCount ?? 20,
        tryoutSelectionMode: batch.tryoutSelectionMode ?? "AUTOMATIC",
        isLiveOpen:
          batch.tryoutOpen &&
          batch.tryoutEndTime !== null &&
          new Date() <= batch.tryoutEndTime &&
          (!batch.tryoutStartTime || new Date() >= batch.tryoutStartTime),
      },
      participants,
    });
  } catch (error) {
    console.error("[BATCH_PARTICIPANTS_GET]", error);
    return NextResponse.json(
      { error: "Gagal memuat daftar peserta batch" },
      { status: 500 }
    );
  }
}
