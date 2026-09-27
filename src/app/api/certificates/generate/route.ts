import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const generateSchema = z.object({
  registrationId: z.number().int().positive(),
});

const PASS_ATTENDANCE = 100; // percentage
const PASS_TRYOUT = 70;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "INSTRUCTOR"].includes(session.user.role ?? "")) {
      return NextResponse.json(
        { error: "Hanya admin atau instruktur yang dapat menerbitkan sertifikat" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = generateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { registrationId } = parsed.data;

    // Load full registration data
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        user: true,
        batch: {
          include: {
            training: true,
            _count: { select: { registrations: true } },
          },
        },
        attendances: true,
        examResult: true,
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Pendaftaran tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check eligibility
    const eligibilityErrors: string[] = [];

    // 1. Check attendance (100% = all sessions attended)
    const totalSessions = registration.batch.training.durationDays * 2;
    const hadirCount = registration.attendances.filter(
      (a) => a.status === "HADIR"
    ).length;
    const attendanceRate =
      totalSessions > 0
        ? Math.round((hadirCount / totalSessions) * 100)
        : 0;

    if (attendanceRate < PASS_ATTENDANCE) {
      eligibilityErrors.push(
        `Kehadiran hanya ${attendanceRate}% (minimal ${PASS_ATTENDANCE}%)`
      );
    }

    // 2. Check logbook signed
    const logbooks = await prisma.logbook.findMany({
      where: { registrationId },
    });

    const hasLogbook = logbooks.length > 0;
    const allLogbooksSigned = hasLogbook && logbooks.every((l) => l.signedOffBy !== null);

    if (!hasLogbook) {
      eligibilityErrors.push("Logbook praktikum belum ada");
    } else if (!allLogbooksSigned) {
      const unsignedCount = logbooks.filter((l) => !l.signedOffBy).length;
      eligibilityErrors.push(
        `${unsignedCount} entri logbook belum ditandatangani instruktur`
      );
    }

    // 3. Check tryout score
    const tryoutScore = registration.examResult?.tryoutScore ?? null;
    if (tryoutScore === null) {
      eligibilityErrors.push("Belum ada hasil tryout");
    } else if (tryoutScore < PASS_TRYOUT) {
      eligibilityErrors.push(
        `Nilai tryout ${tryoutScore} (minimal ${PASS_TRYOUT})`
      );
    }

    // Return eligibility errors if any
    if (eligibilityErrors.length > 0) {
      return NextResponse.json(
        {
          eligible: false,
          errors: eligibilityErrors,
        },
        { status: 422 }
      );
    }

    // Check if certificate already issued
    if (registration.examResult?.certificateNumber) {
      return NextResponse.json(
        {
          eligible: true,
          alreadyIssued: true,
          certificateNumber: registration.examResult.certificateNumber,
          message: "Sertifikat sudah diterbitkan sebelumnya",
        },
        { status: 200 }
      );
    }

    // Generate certificate number: CERT/ALARA/{PROGRAM}/{YEAR}/B{BATCH}/{SEQ}
    const year = new Date().getFullYear();
    const programCode =
      registration.batch.training.category === "PPR_ANALISIS"
        ? "PPRA"
        : registration.batch.training.category === "PPR_BAGASI"
        ? "PPRB"
        : "PKR";

    const batchNum = String(registration.batch.batchNumber).padStart(3, "0");

    // Count existing certificates for this batch
    const existingCertCount = await prisma.examResult.count({
      where: {
        certificateNumber: { startsWith: `CERT/ALARA/${programCode}/${year}/B${batchNum}/` },
      },
    });

    const seq = String(existingCertCount + 1).padStart(3, "0");
    const certificateNumber = `CERT/ALARA/${programCode}/${year}/B${batchNum}/${seq}`;

    // Ambil penandatangan yang berstatus aktif saat ini
    const activeSignatory = await prisma.certificateSignatory.findFirst({
      where: { isActive: true },
    });

    // Upsert ExamResult with certificate number and active signatory
    let examResult;
    if (registration.examResult) {
      examResult = await prisma.examResult.update({
        where: { id: registration.examResult.id },
        data: {
          certificateNumber,
          issuedAt: new Date(),
          finalStatus: "LULUS",
          signatoryId: activeSignatory?.id ?? null,
        },
      });
    } else {
      examResult = await prisma.examResult.create({
        data: {
          registrationId,
          tryoutScore,
          certificateNumber,
          issuedAt: new Date(),
          finalStatus: "LULUS",
          signatoryId: activeSignatory?.id ?? null,
        },
      });
    }

    return NextResponse.json(
      {
        eligible: true,
        certificateNumber,
        issuedAt: examResult.issuedAt,
        certificate: {
          number: certificateNumber,
          issuedAt: examResult.issuedAt,
          peserta: {
            fullName: registration.user.fullName,
            nik: registration.user.nik,
            instansi: registration.instansi,
          },
          training: {
            title: registration.batch.training.title,
            category: registration.batch.training.category,
          },
          batch: {
            batchNumber: registration.batch.batchNumber,
            startDate: registration.batch.startDate,
            endDate: registration.batch.endDate,
            location: registration.batch.location,
          },
          scores: {
            attendance: attendanceRate,
            tryout: tryoutScore,
            bapetenTheory: registration.examResult?.bapetenTheoryScore ?? null,
            bapetenPractical: registration.examResult?.bapetenPracticalScore ?? null,
          },
          issuer: {
            organization: activeSignatory?.institution ?? "CV Hikmat Proteksi ALARA",
            ktunBapeten: "No. 07998.722.1.040726",
            signatoryName: activeSignatory?.name ?? "Ir. H. Expert Proteksi, M.Si.",
            signatoryPosition: activeSignatory?.position ?? "Kepala Lembaga Pelatihan Ketenaganukliran",
            signatoryNip: activeSignatory?.nip ?? null,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[CERTIFICATE_GENERATE]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
