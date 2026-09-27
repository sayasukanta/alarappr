import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const batchIdParam = searchParams.get("batchId");

    if (!batchIdParam) {
      return NextResponse.json({ data: [] });
    }

    const batchId = parseInt(batchIdParam, 10);

    const registrations = await prisma.registration.findMany({
      where: {
        batchId,
        registrationStatus: "APPROVED",
      },
      include: {
        user: {
          select: { fullName: true, instansi: true },
        },
        attendances: true,
      },
      orderBy: { id: "asc" },
    });

    const data = registrations.map((r) => {
      const attendanceMap: Record<string, string | null> = {};
      r.attendances.forEach((a) => {
        attendanceMap[`${a.dayNumber}_${a.sessionType}`] = a.status;
      });

      return {
        registrationId: r.id,
        name: r.user.fullName,
        instansi: r.instansi || r.user.instansi || "-",
        attendance: attendanceMap,
      };
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[ADMIN_PRESENSI_GET]", error);
    return NextResponse.json(
      { error: "Gagal memuat data presensi" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { registrationId, dayNumber, sessionType, status } = body;

    if (!registrationId || !dayNumber || !sessionType) {
      return NextResponse.json({ error: "Data presensi tidak lengkap" }, { status: 400 });
    }

    if (!status) {
      // If null, delete the attendance record
      await prisma.attendance.deleteMany({
        where: {
          registrationId: parseInt(registrationId, 10),
          dayNumber: parseInt(dayNumber, 10),
          sessionType,
        },
      });
      return NextResponse.json({ success: true, deleted: true });
    }

    // Upsert attendance
    const attendance = await prisma.attendance.upsert({
      where: {
        registrationId_dayNumber_sessionType: {
          registrationId: parseInt(registrationId, 10),
          dayNumber: parseInt(dayNumber, 10),
          sessionType,
        },
      },
      update: {
        status,
        checkinTime: new Date(),
      },
      create: {
        registrationId: parseInt(registrationId, 10),
        dayNumber: parseInt(dayNumber, 10),
        sessionType,
        status,
        checkinTime: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: attendance });
  } catch (error) {
    console.error("[ADMIN_PRESENSI_POST]", error);
    return NextResponse.json(
      { error: "Gagal memperbarui presensi" },
      { status: 500 }
    );
  }
}
