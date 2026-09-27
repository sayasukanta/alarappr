import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);
    const { searchParams } = new URL(request.url);
    const regIdParam = searchParams.get("registrationId");

    // Fetch official footer/bank settings & all active training types from database
    const [footer, dbTrainings, registrations] = await Promise.all([
      prisma.footerSetting.findFirst(),
      prisma.training.findMany({
        orderBy: { id: "asc" },
        select: {
          id: true,
          category: true,
          title: true,
          price: true,
          durationDays: true,
          certBadge: true,
        },
      }),
      prisma.registration.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          user: true,
          batch: {
            include: { training: true },
          },
          payments: {
            orderBy: { createdAt: "desc" },
          },
        },
      }),
    ]);

    // Parse bank details from footer settings
    let bankName = "Bank Mandiri";
    let bankAccountNumber = "166-00-0733926-0";
    if (footer?.bankName) {
      const match = footer.bankName.match(/(.*?)(?:No\.?|\s+No\.?)\s*([0-9\-\.]+)/i);
      if (match) {
        bankName = match[1].trim() || "Bank Mandiri";
        bankAccountNumber = match[2].trim() || "166-00-0733926-0";
      } else {
        bankName = footer.bankName;
      }
    }

    const bankInfo = {
      bankName,
      bankAccountNumber,
      bankAccountName: footer?.bankAccountName || "CV Hikmat Proteksi ALARA",
      institutionName: footer?.institutionName || "CV. Hikmat Proteksi ALARA",
      ktunNumber: footer?.ktunNumber || "No. 07998.722.1.040726",
    };

    const formattedTrainings = dbTrainings.map((t) => ({
      id: t.id,
      category: t.category,
      title: t.title,
      price: Number(t.price),
      durationDays: t.durationDays,
      certBadge: t.certBadge,
    }));

    if (registrations.length === 0) {
      return NextResponse.json({
        hasRegistration: false,
        allRegistrations: [],
        payment: null,
        bankInfo,
        trainings: formattedTrainings,
      });
    }

    let selectedReg = registrations[0];
    if (regIdParam) {
      const found = registrations.find((r) => r.id === parseInt(regIdParam, 10));
      if (found) selectedReg = found;
    }

    const latestPayment = selectedReg.payments[0] ?? null;
    const year = new Date().getFullYear();
    const invoiceNo =
      latestPayment?.invoiceNumber ||
      `INV/ALARA/${year}/${String(selectedReg.id).padStart(4, "0")}/1`;

    let paymentStatus: "BELUM_BAYAR" | "MENUNGGU_VERIFIKASI" | "LUNAS" | "DITOLAK" =
      "BELUM_BAYAR";

    if (
      selectedReg.paymentStatus === "PAID" ||
      latestPayment?.status === "VERIFIED"
    ) {
      paymentStatus = "LUNAS";
    } else if (
      latestPayment?.proofFilePath &&
      (selectedReg.paymentStatus === "PENDING_VERIFICATION" ||
        latestPayment?.status === "PENDING")
    ) {
      paymentStatus = "MENUNGGU_VERIFIKASI";
    } else if (latestPayment?.status === "REJECTED") {
      paymentStatus = "DITOLAK";
    } else {
      paymentStatus = "BELUM_BAYAR";
    }

    // Due date: 7 days after registration created or batch start date
    const regDate = new Date(selectedReg.createdAt);
    const dueDate = new Date(regDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const amount = latestPayment
      ? Number(latestPayment.amount)
      : Number(selectedReg.batch.training.price);

    const allRegistrations = registrations.map((r) => ({
      id: r.id,
      batchNumber: r.batch.batchNumber,
      trainingId: r.batch.training.id,
      trainingTitle: r.batch.training.title,
      category: r.batch.training.category,
      price: Number(r.batch.training.price),
      paymentStatus: r.paymentStatus,
      startDate: r.batch.startDate.toISOString(),
      endDate: r.batch.endDate.toISOString(),
    }));

    return NextResponse.json({
      hasRegistration: true,
      registrationId: selectedReg.id,
      allRegistrations,
      invoiceNo,
      program: selectedReg.batch.training.title,
      category: selectedReg.batch.training.category,
      batch: `Batch ${selectedReg.batch.batchNumber}`,
      amount,
      dueDate: dueDate.toISOString().split("T")[0],
      paymentStatus,
      buktiFileName: latestPayment?.proofFilePath
        ? latestPayment.proofFilePath.split("/").pop()
        : undefined,
      buktiUploadedAt: latestPayment?.createdAt?.toISOString(),
      verifiedAt: latestPayment?.verifiedAt?.toISOString(),
      rejectedReason: latestPayment?.rejectionNote ?? undefined,
      paidAt: latestPayment?.paymentDate
        ? latestPayment.paymentDate.toISOString().split("T")[0]
        : undefined,
      paidBy: latestPayment?.senderName ?? undefined,
      pesertaName: selectedReg.user.fullName,
      pesertaNik: selectedReg.user.nik || "-",
      instansi: selectedReg.instansi || selectedReg.user.instansi || "-",
      bankInfo,
      trainings: formattedTrainings,
    });
  } catch (error) {
    console.error("[PEMBAYARAN_GET]", error);
    return NextResponse.json(
      { error: "Gagal memuat data pembayaran" },
      { status: 500 }
    );
  }
}
