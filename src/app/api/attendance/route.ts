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
    const registration = await prisma.registration.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!registration) {
      return NextResponse.json([]);
    }

    const attendances = await prisma.attendance.findMany({
      where: { registrationId: registration.id },
      orderBy: [{ dayNumber: "asc" }, { sessionType: "asc" }],
    });

    return NextResponse.json(attendances);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json({ error: "Gagal mengambil data presensi" }, { status: 500 });
  }
}
