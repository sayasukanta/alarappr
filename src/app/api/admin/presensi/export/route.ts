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
      return new NextResponse("Batch ID required", { status: 400 });
    }

    const batchId = parseInt(batchIdParam, 10);

    const registrations = await prisma.registration.findMany({
      where: {
        batchId,
        registrationStatus: "APPROVED",
      },
      include: {
        user: { select: { fullName: true, instansi: true } },
        attendances: true,
      },
      orderBy: { id: "asc" },
    });

    const headers = [
      "No",
      "Nama Peserta",
      "Instansi",
      "H1 Pagi",
      "H1 Siang",
      "H2 Pagi",
      "H2 Siang",
      "H3 Pagi",
      "H3 Siang",
    ];

    const rows = registrations.map((r, idx) => {
      const aMap: Record<string, string> = {};
      r.attendances.forEach((a) => {
        aMap[`${a.dayNumber}_${a.sessionType}`] = a.status;
      });

      return [
        idx + 1,
        `"${r.user.fullName.replace(/"/g, '""')}"`,
        `"${(r.instansi || r.user.instansi || "-").replace(/"/g, '""')}"`,
        aMap["1_MORNING"] || "-",
        aMap["1_AFTERNOON"] || "-",
        aMap["2_MORNING"] || "-",
        aMap["2_AFTERNOON"] || "-",
        aMap["3_MORNING"] || "-",
        aMap["3_AFTERNOON"] || "-",
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="presensi-batch-${batchId}.csv"`,
      },
    });
  } catch (error) {
    console.error("[ADMIN_PRESENSI_EXPORT]", error);
    return new NextResponse("Gagal export presensi", { status: 500 });
  }
}
