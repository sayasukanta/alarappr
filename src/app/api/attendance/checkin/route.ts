import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id, 10);
    const registration = await prisma.registration.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!registration) {
      return NextResponse.json({ error: "Registrasi tidak ditemukan" }, { status: 404 });
    }

    const body = await req.json();
    const { dayNumber, sessionType, latitude, longitude } = body;

    const attendance = await prisma.attendance.upsert({
      where: {
        registrationId_dayNumber_sessionType: {
          registrationId: registration.id,
          dayNumber: parseInt(dayNumber, 10),
          sessionType: sessionType,
        },
      },
      update: {
        checkinTime: new Date(),
        status: "HADIR",
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      },
      create: {
        registrationId: registration.id,
        dayNumber: parseInt(dayNumber, 10),
        sessionType: sessionType,
        checkinTime: new Date(),
        status: "HADIR",
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      },
    });

    return NextResponse.json({ success: true, attendance });
  } catch (error) {
    console.error("Error checkin attendance:", error);
    return NextResponse.json({ error: "Gagal check-in presensi" }, { status: 500 });
  }
}
