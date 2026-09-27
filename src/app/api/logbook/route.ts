import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id, 10);
    const userRole = (session.user as any).role;

    const registration = await prisma.registration.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // If admin or instructor, show all logbooks
    if (userRole === "ADMIN" || userRole === "INSTRUCTOR") {
      const allLogbooks = await prisma.logbook.findMany({
        orderBy: { practiceDate: "desc" },
      });
      return NextResponse.json(allLogbooks);
    }

    if (!registration) {
      return NextResponse.json([]);
    }

    const logbooks = await prisma.logbook.findMany({
      where: { registrationId: registration.id },
      orderBy: { practiceDate: "desc" },
    });

    return NextResponse.json(logbooks);
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

    let registration = await prisma.registration.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // If user has no registration yet:
    if (!registration) {
      // 1. If admin or instructor, link to the latest existing registration
      if (userRole === "ADMIN" || userRole === "INSTRUCTOR") {
        registration = await prisma.registration.findFirst({
          orderBy: { id: "desc" },
        });
      }

      // 2. If still no registration (participant without batch or empty system), auto-assign to active batch
      if (!registration) {
        const defaultBatch = await prisma.trainingBatch.findFirst({
          orderBy: { id: "asc" },
        });
        if (defaultBatch) {
          registration = await prisma.registration.create({
            data: {
              userId,
              batchId: defaultBatch.id,
              registrationStatus: "APPROVED",
              paymentStatus: "PAID",
            },
          });
        }
      }
    }

    if (!registration) {
      return NextResponse.json(
        { error: "Pendaftaran pelatihan tidak ditemukan. Silakan pilih batch pelatihan terlebih dahulu." },
        { status: 400 }
      );
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
        registrationId: registration.id,
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
