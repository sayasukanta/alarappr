import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);

    const registration = await prisma.registration.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        batch: {
          include: { training: true },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Belum ada pendaftaran aktif" },
        { status: 404 }
      );
    }

    const latestPayment = registration.payments[0] ?? null;
    const year = new Date().getFullYear();
    const invoiceNo =
      latestPayment?.invoiceNumber ||
      `INV/ALARA/${year}/${String(registration.id).padStart(4, "0")}/1`;

    let paymentStatus: "BELUM_BAYAR" | "MENUNGGU_VERIFIKASI" | "LUNAS" | "DITOLAK" =
      "BELUM_BAYAR";

    if (
      registration.paymentStatus === "PAID" ||
      latestPayment?.status === "VERIFIED"
    ) {
      paymentStatus = "LUNAS";
    } else if (
      latestPayment?.proofFilePath &&
      (registration.paymentStatus === "PENDING_VERIFICATION" ||
        latestPayment?.status === "PENDING")
    ) {
      paymentStatus = "MENUNGGU_VERIFIKASI";
    } else if (latestPayment?.status === "REJECTED") {
      paymentStatus = "DITOLAK";
    } else {
      paymentStatus = "BELUM_BAYAR";
    }

    // Due date: 7 days after registration created or batch start date
    const regDate = new Date(registration.createdAt);
    const dueDate = new Date(regDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const amount = latestPayment
      ? Number(latestPayment.amount)
      : Number(registration.batch.training.price);

    return NextResponse.json({
      invoiceNo,
      program: registration.batch.training.title,
      batch: `Batch ${registration.batch.batchNumber}`,
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
      pesertaName: registration.user.fullName,
      pesertaNik: registration.user.nik || "-",
      instansi: registration.instansi || registration.user.instansi || "-",
    });
  } catch (error) {
    console.error("[PEMBAYARAN_GET]", error);
    return NextResponse.json(
      { error: "Gagal memuat data pembayaran" },
      { status: 500 }
    );
  }
}
