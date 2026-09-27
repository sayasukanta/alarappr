import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { buildSyllabusFromDb } from "@/lib/certificateSyllabus";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id, 10);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        registrations: {
          include: {
            batch: {
              include: {
                training: {
                  include: {
                    competencyUnits: {
                      orderBy: [{ sectionCode: "asc" }, { orderIndex: "asc" }, { id: "asc" }],
                    },
                  },
                },
              },
            },
            examResult: {
              include: {
                signatory: true,
              },
            },
            attendances: true,
            tryoutAttempts: {
              orderBy: { totalScore: "desc" },
              take: 1,
            },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user || user.registrations.length === 0) {
      return NextResponse.json({ isEligible: false, certificateNumber: null });
    }

    const reg = user.registrations[0];
    const attendances = reg.attendances || [];
    const bestTryout = reg.tryoutAttempts[0];
    const tryoutScore = bestTryout?.totalScore || null;

    // Check logbook count
    const logbooks = await prisma.logbook.findMany({
      where: { registrationId: reg.id },
    });
    const logbookApproved = logbooks.some((l) => l.signedOffBy !== null);

    const attendanceComplete = attendances.filter((a) => a.status === "HADIR").length >= 4; // At least 4 of 6 sessions or all
    const tryoutPassed = tryoutScore !== null && tryoutScore >= 70.0;
    const isEligible = attendanceComplete && (logbookApproved || logbooks.length > 0) && tryoutPassed;

    // Ambil penandatangan aktif saat ini untuk fallback atau penerbitan baru
    const activeSignatory = await prisma.certificateSignatory.findFirst({
      where: { isActive: true },
    });

    let certNumber = reg.examResult?.certificateNumber || null;
    let issuedAt = reg.examResult?.issuedAt?.toISOString() || null;
    let signatoryData = reg.examResult?.signatory || activeSignatory || null;

    // If eligible and cert not generated yet, generate one
    if (isEligible && !certNumber) {
      const year = new Date().getFullYear();
      const seq = reg.id;
      const code =
        reg.batch.training.category === "PPR_ANALISIS"
          ? "PPR-ANALISIS"
          : reg.batch.training.category === "PPR_BAGASI"
          ? "PPR-BAGASI"
          : "PKR";
      certNumber = `CERT/ALARA/${code}/${year}/B${reg.batch.batchNumber}/${String(seq).padStart(3, "0")}`;
      issuedAt = new Date().toISOString();

      const createdExam = await prisma.examResult.upsert({
        where: { registrationId: reg.id },
        update: {
          certificateNumber: certNumber,
          issuedAt: new Date(issuedAt),
          finalStatus: "LULUS",
          signatoryId: activeSignatory?.id ?? null,
        },
        create: {
          registrationId: reg.id,
          certificateNumber: certNumber,
          issuedAt: new Date(issuedAt),
          tryoutScore: tryoutScore,
          finalStatus: "LULUS",
          signatoryId: activeSignatory?.id ?? null,
        },
        include: {
          signatory: true,
        },
      });

      signatoryData = createdExam.signatory || activeSignatory;
    }

    return NextResponse.json({
      isEligible,
      certificateNumber: certNumber,
      participantName: user.fullName,
      nik: user.nik || "-",
      trainingTitle: reg.batch.training.title,
      trainingCategory: reg.batch.training.category,
      batchNumber: reg.batch.batchNumber,
      startDate: reg.batch.startDate.toISOString(),
      endDate: reg.batch.endDate.toISOString(),
      issuedAt,
      signatory: {
        name: signatoryData?.name || "Ir. H. Expert Proteksi, M.Si.",
        position: signatoryData?.position || "Kepala Lembaga Pelatihan Ketenaganukliran",
        institution: signatoryData?.institution || "CV. HIKMAT PROTEKSI ALARA",
        nip: signatoryData?.nip || null,
        signatureUrl: signatoryData?.signatureUrl || null,
      },
      customSyllabus: buildSyllabusFromDb(reg.batch.training, reg.batch.training.competencyUnits),
      signedCertificateUrl: reg.examResult?.signedCertificateUrl || null,
      signedCertificateName: reg.examResult?.signedCertificateName || null,
      signedUploadedAt: reg.examResult?.signedUploadedAt?.toISOString() || null,
      criteria: {
        attendanceComplete,
        logbookApproved: logbookApproved || logbooks.length > 0,
        tryoutPassed,
        tryoutScore,
      },
    });
  } catch (error) {
    console.error("Error fetching my certificate:", error);
    return NextResponse.json({ error: "Gagal memuat sertifikat" }, { status: 500 });
  }
}
