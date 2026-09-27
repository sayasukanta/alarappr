import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [payments, totalPending, totalVerified, totalRejected] = await Promise.all([
      prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          registration: {
            include: {
              user: { select: { fullName: true } },
              batch: {
                include: {
                  training: { select: { title: true } },
                },
              },
            },
          },
        },
      }),
      prisma.payment.count({ where: { status: "PENDING" } }),
      prisma.payment.count({ where: { status: "VERIFIED" } }),
      prisma.payment.count({ where: { status: "REJECTED" } }),
    ]);

    const data = payments.map((p) => ({
      id: p.id,
      pesertaName: p.registration?.user?.fullName || "Peserta",
      program: p.registration?.batch?.training?.title || "Pelatihan",
      amount: Number(p.amount),
      bankName: p.bankName || "Mandiri",
      paymentDate: (p.paymentDate || p.createdAt).toISOString(),
      senderName: p.senderName || "-",
      proofFilePath: p.proofFilePath,
      invoiceNumber: p.invoiceNumber,
      status: p.status,
      rejectionNote: p.rejectionNote,
      createdAt: p.createdAt.toISOString(),
    }));

    return NextResponse.json({
      data,
      stats: {
        totalPending,
        totalVerified,
        totalRejected,
      },
    });
  } catch (error) {
    console.error("[ADMIN_PEMBAYARAN_GET]", error);
    return NextResponse.json(
      { error: "Gagal memuat data pembayaran" },
      { status: 500 }
    );
  }
}
