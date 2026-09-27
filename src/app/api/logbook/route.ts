import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getUserBatchScheduleStatus } from "@/lib/batch-schedule";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id, 10);
    const userRole = (session.user as any).role;

    // If admin or instructor, show all logbooks
    if (userRole === "ADMIN" || userRole === "INSTRUCTOR") {
      const allLogbooks = await prisma.logbook.findMany({
        orderBy: { practiceDate: "desc" },
      });
      return NextResponse.json({
        logbooks: allLogbooks,
        schedule: {
          hasRegistration: true,
          registrationStatus: "APPROVED",
          isOpen: true,
          isLocked: false,
          startTime: null,
          endTime: null,
          remainingMinutes: 0,
          statusMessage: "Mode Instruktur / Admin: Akses penuh untuk pemantauan dan digital sign-off logbook.",
          batchName: null,
        },
        isLocked: false,
      });
    }

    // Check user's batch and schedule status
    const scheduleStatus = await getUserBatchScheduleStatus(userId);

    if (!scheduleStatus.hasRegistration || !scheduleStatus.registrationId) {
      return NextResponse.json({
        logbooks: [],
        schedule: scheduleStatus,
        isLocked: true,
      });
    }

    const logbooks = await prisma.logbook.findMany({
      where: { registrationId: scheduleStatus.registrationId },
      orderBy: { practiceDate: "desc" },
    });

    return NextResponse.json({
      logbooks,
      schedule: scheduleStatus,
      isLocked: scheduleStatus.isLocked,
    });
  } catch (error) {
    console.error("Error fetching logbooks:", error);
    return NextResponse.json({ error: "Gagal mengambil data logbook" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id, 10);
    const userRole = (session.user as any).role;

    let registrationId: number | null = null;

    if (userRole === "ADMIN" || userRole === "INSTRUCTOR") {
      const reg = await prisma.registration.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }) || await prisma.registration.findFirst({
        orderBy: { id: "desc" },
      });

      if (!reg) {
        return NextResponse.json(
          { error: "Belum ada registrasi batch dalam sistem untuk menghubungkan logbook." },
          { status: 400 }
        );
      }
      registrationId = reg.id;
    } else {
      // Validate registration and schedule for regular participants
      const scheduleStatus = await getUserBatchScheduleStatus(userId);

      if (!scheduleStatus.hasRegistration || !scheduleStatus.registrationId) {
        return NextResponse.json(
          {
            error: scheduleStatus.statusMessage || "Anda belum terdaftar dalam batch pelatihan manapun. Silakan mendaftar batch terlebih dahulu.",
          },
          { status: 403 }
        );
      }

      if (scheduleStatus.isLocked || !scheduleStatus.isOpen) {
        return NextResponse.json(
          {
            error: scheduleStatus.statusMessage || "Pengisian logbook praktikum saat ini terkunci.",
          },
          { status: 403 }
        );
      }

      registrationId = scheduleStatus.registrationId;
    }

    const body = await req.json();

    // Safely parse dosisLaju
    let parsedDosis: number | null = null;
    if (body.dosisLaju !== undefined && body.dosisLaju !== null && body.dosisLaju !== "") {
      const num = typeof body.dosisLaju === "number" ? body.dosisLaju : parseFloat(body.dosisLaju);
      if (!isNaN(num)) {
        parsedDosis = num;
      }
    }

    // Safely parse practiceDate
    let practiceDate = new Date();
    if (body.practiceDate) {
      const parsedDate = new Date(body.practiceDate);
      if (!isNaN(parsedDate.getTime())) {
        practiceDate = parsedDate;
      }
    }

    const isAuthorizedInstructorOrAdmin = userRole === "ADMIN" || userRole === "INSTRUCTOR";

    const newLogbook = await prisma.logbook.create({
      data: {
        registrationId,
        location: body.location?.trim() || "Fasilitas Radiasi",
        practiceDate,
        dosisLaju: parsedDosis,
        kondisiInterlock: body.kondisiInterlock?.trim() || null,
        penggunaanDosimeter: body.penggunaanDosimeter?.trim() || null,
        notes: body.notes?.trim() || null,
        signedOffBy: isAuthorizedInstructorOrAdmin ? userId : null,
        signedOffAt: isAuthorizedInstructorOrAdmin ? new Date() : null,
      },
    });

    return NextResponse.json(newLogbook, { status: 201 });
  } catch (error) {
    console.error("Error creating logbook:", error);
    return NextResponse.json({ error: "Gagal menyimpan logbook: Terjadi kesalahan server" }, { status: 500 });
  }
}
