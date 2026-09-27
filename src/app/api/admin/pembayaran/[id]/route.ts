import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const paymentId = parseInt(resolvedParams.id, 10);
    const body = await request.json();
    const { action, rejectionNote } = body;
    const adminId = parseInt((session.user as any)?.id, 10) || null;

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return NextResponse.json({ error: "Data pembayaran tidak ditemukan" }, { status: 404 });
    }

    if (action === "approve") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: "VERIFIED",
            verifiedBy: adminId,
            verifiedAt: new Date(),
            rejectionNote: null,
          },
        }),
        prisma.registration.update({
          where: { id: payment.registrationId },
          data: {
            paymentStatus: "PAID",
          },
        }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: "REJECTED",
            rejectionNote: rejectionNote || "Pembayaran ditolak",
            verifiedBy: adminId,
            verifiedAt: new Date(),
          },
        }),
        prisma.registration.update({
          where: { id: payment.registrationId },
          data: {
            paymentStatus: "UNPAID",
          },
        }),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_PEMBAYARAN_PATCH]", error);
    return NextResponse.json(
      { error: "Gagal memperbarui status pembayaran" },
      { status: 500 }
    );
  }
}
