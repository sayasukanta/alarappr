import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DocType } from "@prisma/client";

const REQUIRED_DOCS: DocType[] = [
  DocType.KTP,
  DocType.IJAZAH,
  DocType.MCU,
  DocType.SURAT_KERJA,
  DocType.PASFOTO,
  DocType.NPWP,
];

const DOC_LABELS: Record<DocType, string> = {
  KTP: "KTP / Kartu Identitas",
  IJAZAH: "Ijazah Terakhir",
  MCU: "Hasil MCU (Medical Check Up)",
  SURAT_KERJA: "Surat Keterangan Kerja",
  PASFOTO: "Pas Foto 3x4",
  NPWP: "NPWP (Jika Ada)",
};

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { nik: true, phoneNumber: true },
    });
    const isProfileComplete = !!(user?.nik && user?.phoneNumber);

    // Get the most recent active registration
    const registration = await prisma.registration.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        batch: {
          include: { training: true },
        },
        documents: true,
        attendances: true,
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        examResult: true,
        tryoutAttempts: {
          orderBy: { startedAt: "desc" },
          take: 5,
        },
      },
    });

    if (!registration) {
      return NextResponse.json({
        isProfileComplete,
        hasRegistration: false,
        message: "Belum ada pendaftaran aktif",
        registration: null,
        payment: null,
        attendance: { hadir: 0, totalHari: 0 },
        documents: REQUIRED_DOCS.map((docType) => ({
          type: docType,
          label: DOC_LABELS[docType],
          status: "PENDING" as const,
        })),
        activities: [
          {
            id: "welcome",
            title: "Selamat Datang di ALARA",
            description: "Akun Anda telah berhasil dibuat. Silakan mulai pendaftaran pelatihan.",
            timestamp: new Date().toISOString(),
            type: "info" as const,
          },
        ],
        documentChecklist: [],
        docsProgress: {
          uploaded: 0,
          total: REQUIRED_DOCS.length,
          allValid: false,
        },
        attendanceSummary: {
          totalSessions: 0,
          recorded: 0,
          hadir: 0,
          izin: 0,
          alpa: 0,
          attendanceRate: 0,
        },
        tryout: {
          attempts: [],
          bestScore: 0,
          passed: false,
          examResult: null,
        },
      });
    }

    // Build document checklist & mapped documents
    const uploadedDocs = registration.documents.reduce(
      (acc, doc) => {
        acc[doc.docType] = doc;
        return acc;
      },
      {} as Record<string, (typeof registration.documents)[0]>
    );

    const documentChecklist = REQUIRED_DOCS.map((docType) => {
      const uploaded = uploadedDocs[docType];
      return {
        docType,
        label: DOC_LABELS[docType],
        uploaded: !!uploaded,
        isValid: uploaded?.isValid ?? null,
        notes: uploaded?.notes ?? null,
        filePath: uploaded?.filePath ?? null,
        uploadedAt: uploaded?.createdAt ?? null,
      };
    });

    const documents = REQUIRED_DOCS.map((docType) => {
      const uploaded = uploadedDocs[docType];
      let status: "PENDING" | "UPLOADED" | "APPROVED" | "REJECTED" = "PENDING";
      if (uploaded) {
        if (uploaded.isValid === true) status = "APPROVED";
        else if (uploaded.isValid === false) status = "REJECTED";
        else status = "UPLOADED";
      }
      return {
        type: docType,
        label: DOC_LABELS[docType],
        status,
        fileName: uploaded?.filePath ? uploaded.filePath.split("/").pop() : undefined,
        notes: uploaded?.notes ?? undefined,
      };
    });

    // Attendance summary
    const durationDays = registration.batch.training.durationDays || 3;
    const totalSessions = durationDays * 2; // morning + afternoon
    const hadirCount = registration.attendances.filter(
      (a) => a.status === "HADIR"
    ).length;
    const izinCount = registration.attendances.filter(
      (a) => a.status === "IZIN"
    ).length;
    const alpaCount = registration.attendances.filter(
      (a) => a.status === "ALPA"
    ).length;

    const attendanceSummary = {
      totalSessions,
      recorded: registration.attendances.length,
      hadir: hadirCount,
      izin: izinCount,
      alpa: alpaCount,
      attendanceRate:
        totalSessions > 0
          ? Math.round((hadirCount / totalSessions) * 100)
          : 0,
    };

    const attendance = {
      hadir: Math.min(Math.ceil(hadirCount / 2), durationDays),
      totalHari: durationDays,
    };

    // Tryout scores
    const tryoutSummary = registration.tryoutAttempts.map((attempt) => ({
      id: attempt.id,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      totalScore: attempt.totalScore,
      status: attempt.status,
    }));

    const bestScore = registration.tryoutAttempts.reduce(
      (best, attempt) =>
        (attempt.totalScore ?? 0) > best ? attempt.totalScore ?? 0 : best,
      0
    );

    // Payment mapping
    const latestPayment = registration.payments[0] ?? null;
    let paymentStatus: "BELUM_BAYAR" | "MENUNGGU_VERIFIKASI" | "LUNAS" = "BELUM_BAYAR";
    if (registration.paymentStatus === "PAID" || latestPayment?.status === "VERIFIED") {
      paymentStatus = "LUNAS";
    } else if (registration.paymentStatus === "PENDING_VERIFICATION" || latestPayment?.status === "PENDING") {
      paymentStatus = "MENUNGGU_VERIFIKASI";
    }

    const payment = {
      status: paymentStatus,
      amount: latestPayment ? Number(latestPayment.amount) : Number(registration.batch.training.price),
      paidAt: latestPayment?.paymentDate?.toISOString() ?? undefined,
    };

    // Build timeline activities
    const activities: Array<{
      id: string;
      title: string;
      description: string;
      timestamp: string;
      type: "info" | "success" | "warning" | "error";
    }> = [];

    activities.push({
      id: `reg-${registration.id}`,
      title: "Pendaftaran Berhasil Dibuat",
      description: `Pendaftaran ${registration.batch.training.title} (Batch ${registration.batch.batchNumber}) telah tercatat.`,
      timestamp: registration.createdAt.toISOString(),
      type: "info",
    });

    registration.documents.forEach((doc) => {
      const docLabel = DOC_LABELS[doc.docType] || doc.docType;
      if (doc.isValid === true) {
        activities.push({
          id: `doc-${doc.id}-approved`,
          title: `Dokumen ${docLabel} Disetujui`,
          description: `Dokumen ${docLabel} Anda telah diverifikasi dan disetujui.`,
          timestamp: (doc.verifiedAt || doc.createdAt).toISOString(),
          type: "success",
        });
      } else if (doc.isValid === false) {
        activities.push({
          id: `doc-${doc.id}-rejected`,
          title: `Dokumen ${docLabel} Ditolak`,
          description: doc.notes || `Dokumen ${docLabel} ditolak. Harap upload dokumen perbaikan.`,
          timestamp: (doc.verifiedAt || doc.createdAt).toISOString(),
          type: "error",
        });
      } else {
        activities.push({
          id: `doc-${doc.id}-uploaded`,
          title: `Dokumen ${docLabel} Diupload`,
          description: `Menunggu verifikasi admin untuk dokumen ${docLabel}.`,
          timestamp: doc.createdAt.toISOString(),
          type: "info",
        });
      }
    });

    registration.payments.forEach((p) => {
      if (p.status === "VERIFIED") {
        activities.push({
          id: `pay-${p.id}-verified`,
          title: "Pembayaran Terverifikasi",
          description: "Pembayaran pelatihan telah berhasil diverifikasi oleh admin.",
          timestamp: (p.verifiedAt || p.createdAt).toISOString(),
          type: "success",
        });
      } else if (p.status === "REJECTED") {
        activities.push({
          id: `pay-${p.id}-rejected`,
          title: "Bukti Pembayaran Ditolak",
          description: p.rejectionNote || "Bukti transfer tidak valid atau belum sesuai.",
          timestamp: (p.verifiedAt || p.createdAt).toISOString(),
          type: "error",
        });
      } else {
        activities.push({
          id: `pay-${p.id}-uploaded`,
          title: "Bukti Transfer Diupload",
          description: "Menunggu verifikasi tim finance untuk bukti transfer.",
          timestamp: p.createdAt.toISOString(),
          type: "info",
        });
      }
    });

    // Sort newest first
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      isProfileComplete,
      hasRegistration: true,
      registration: {
        id: String(registration.id),
        status: registration.registrationStatus,
        paymentStatus: registration.paymentStatus,
        program: registration.batch.training.title,
        batchName: `Batch ${registration.batch.batchNumber}`,
        batchStartDate: registration.batch.startDate.toISOString(),
        batchEndDate: registration.batch.endDate.toISOString(),
        documentationUrl: registration.batch.documentationUrl,
        documentationTitle: registration.batch.documentationTitle,
        createdAt: registration.createdAt.toISOString(),
        instansi: registration.instansi,
      },
      batch: {
        id: registration.batch.id,
        batchNumber: registration.batch.batchNumber,
        startDate: registration.batch.startDate.toISOString(),
        endDate: registration.batch.endDate.toISOString(),
        location: registration.batch.location,
        documentationUrl: registration.batch.documentationUrl,
        documentationTitle: registration.batch.documentationTitle,
        training: {
          title: registration.batch.training.title,
          category: registration.batch.training.category,
          durationDays: registration.batch.training.durationDays,
        },
      },
      payment,
      attendance,
      documents,
      activities: activities.slice(0, 5),
      documentChecklist,
      docsProgress: {
        uploaded: documentChecklist.filter((d) => d.uploaded).length,
        total: REQUIRED_DOCS.length,
        allValid: documentChecklist.every((d) => d.isValid === true),
      },
      attendanceSummary,
      tryout: {
        attempts: tryoutSummary,
        bestScore,
        passed: bestScore >= 70,
        examResult: registration.examResult,
      },
    });
  } catch (error) {
    console.error("[DASHBOARD_SUMMARY]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
