import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Stats
    const [totalPeserta, pendingVerifikasi, pendingPembayaran, batchAktif] = await Promise.all([
      prisma.user.count({
        where: { role: "PESERTA" },
      }),
      prisma.registration.count({
        where: { registrationStatus: "MENUNGGU_VERIFIKASI" },
      }),
      prisma.payment.count({
        where: { status: "PENDING" },
      }),
      prisma.trainingBatch.count({
        where: { endDate: { gte: new Date() } },
      }),
    ]);

    // 2. Recent Registrations
    const registrations = await prisma.registration.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { fullName: true },
        },
        batch: {
          include: {
            training: {
              select: { title: true },
            },
          },
        },
      },
    });

    const recentRegistrations = registrations.map((r) => ({
      id: r.id,
      pesertaName: r.user.fullName,
      program: r.batch.training.title,
      batch: `Batch ${r.batch.batchNumber}`,
      registrationStatus: r.registrationStatus,
      paymentStatus: r.paymentStatus,
      createdAt: r.createdAt.toISOString(),
    }));

    // 3. Pending Payments
    const payments = await prisma.payment.findMany({
      where: { status: "PENDING" },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        registration: {
          include: {
            user: {
              select: { fullName: true },
            },
            batch: {
              include: {
                training: {
                  select: { title: true },
                },
              },
            },
          },
        },
      },
    });

    const pendingPayments = payments.map((p) => ({
      id: p.id,
      pesertaName: p.registration?.user?.fullName || "Peserta",
      program: p.registration?.batch?.training?.title || "Pelatihan",
      amount: Number(p.amount),
      bankName: p.bankName || "Mandiri",
      paymentDate: (p.paymentDate || p.createdAt).toISOString(),
      senderName: p.senderName || "-",
    }));

    // 4. Batch Overview
    const batches = await prisma.trainingBatch.findMany({
      orderBy: { startDate: "desc" },
      take: 5,
      include: {
        training: {
          select: { title: true },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });

    const batchOverview = batches.map((b) => ({
      name: `${b.training.title.slice(0, 16)} B#${b.batchNumber}`,
      enrolled: b._count.registrations,
      quota: b.quota,
    }));

    // 5. Instructor Alerts (licenses expiring within 90 days or expired)
    const instructors = await prisma.instructor.findMany({
      where: {
        licenseExpiryDate: { not: null },
      },
      include: {
        user: {
          select: { fullName: true },
        },
      },
    });

    const now = Date.now();
    const instructorAlerts = instructors
      .map((inst) => {
        const expiryTime = new Date(inst.licenseExpiryDate!).getTime();
        const daysLeft = Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24));
        return {
          id: inst.id,
          name: inst.user.fullName,
          licenseNo: inst.bapetenLicenseNo || "-",
          expiryDate: inst.licenseExpiryDate!.toISOString(),
          daysLeft,
        };
      })
      .filter((a) => a.daysLeft <= 90)
      .sort((a, b) => a.daysLeft - b.daysLeft);

    return NextResponse.json({
      stats: {
        totalPeserta,
        pendingVerifikasi,
        pendingPembayaran,
        batchAktif,
      },
      recentRegistrations,
      pendingPayments,
      batchOverview,
      instructorAlerts,
    });
  } catch (error) {
    console.error("[ADMIN_DASHBOARD_GET]", error);
    return NextResponse.json(
      { error: "Gagal memuat data dashboard" },
      { status: 500 }
    );
  }
}
