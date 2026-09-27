import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id, 10);
    const { searchParams } = new URL(request.url);
    const regIdParam = searchParams.get("registrationId");

    // Fetch all registrations for this user with batch & training info
    const registrations = await prisma.registration.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        batch: {
          include: {
            training: true,
          },
        },
      },
    });

    if (registrations.length === 0) {
      return NextResponse.json({
        hasRegistration: false,
        registrations: [],
        activeRegistration: null,
        attendances: [],
      });
    }

    let activeReg = registrations[0];
    if (regIdParam) {
      const found = registrations.find((r) => r.id === parseInt(regIdParam, 10));
      if (found) activeReg = found;
    } else {
      // Prefer latest APPROVED registration
      const approved = registrations.find((r) => r.registrationStatus === "APPROVED");
      if (approved) activeReg = approved;
    }

    const attendances = await prisma.attendance.findMany({
      where: { registrationId: activeReg.id },
      orderBy: [{ dayNumber: "asc" }, { sessionType: "asc" }],
    });

    const formattedRegistrations = registrations.map((r) => ({
      id: r.id,
      batchId: r.batchId,
      batchNumber: r.batch.batchNumber,
      trainingTitle: r.batch.training.title,
      category: r.batch.training.category,
      startDate: r.batch.startDate.toISOString(),
      endDate: r.batch.endDate.toISOString(),
      location: r.batch.location || "Fasilitas Pelatihan ALARA",
      durationDays: r.batch.training.durationDays || 3,
      registrationStatus: r.registrationStatus,
      paymentStatus: r.paymentStatus,
    }));

    const formattedActive = {
      id: activeReg.id,
      batchId: activeReg.batchId,
      batchNumber: activeReg.batch.batchNumber,
      trainingTitle: activeReg.batch.training.title,
      category: activeReg.batch.training.category,
      startDate: activeReg.batch.startDate.toISOString(),
      endDate: activeReg.batch.endDate.toISOString(),
      location: activeReg.batch.location || "Fasilitas Pelatihan ALARA",
      durationDays: activeReg.batch.training.durationDays || 3,
      registrationStatus: activeReg.registrationStatus,
      paymentStatus: activeReg.paymentStatus,
    };

    return NextResponse.json({
      hasRegistration: true,
      registrations: formattedRegistrations,
      activeRegistration: formattedActive,
      attendances,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json({ error: "Gagal mengambil data presensi" }, { status: 500 });
  }
}
