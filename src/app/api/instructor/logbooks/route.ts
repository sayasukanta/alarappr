import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const signed = searchParams.get("signed");

    const whereClause: any = {};
    if (signed === "false") {
      whereClause.signedOffBy = null;
    } else if (signed === "true") {
      whereClause.signedOffBy = { not: null };
    }

    const logbooks = await prisma.logbook.findMany({
      where: whereClause,
      orderBy: { practiceDate: "desc" },
    });

    const regIds = Array.from(new Set(logbooks.map((l) => l.registrationId)));
    const regs = await prisma.registration.findMany({
      where: { id: { in: regIds } },
      include: { user: { select: { fullName: true } } },
    });
    const regMap = new Map(regs.map((r) => [r.id, r.user.fullName]));

    const data = logbooks.map((l) => ({
      id: l.id,
      practiceDate: l.practiceDate.toISOString(),
      location: l.location,
      notes: l.notes,
      signedOffAt: l.signedOffAt?.toISOString() || null,
      registrationId: l.registrationId,
      participantName: regMap.get(l.registrationId) || "Peserta ALARA",
      dosisLaju: l.dosisLaju,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching instructor logbooks:", error);
    return NextResponse.json({ error: "Gagal mengambil data logbook" }, { status: 500 });
  }
}
