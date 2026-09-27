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

    const where: any = {};
    if (batchIdParam && batchIdParam !== "all") {
      where.batchId = parseInt(batchIdParam, 10);
    }

    const registrations = await prisma.registration.findMany({
      where,
      include: {
        user: { select: { fullName: true, nik: true, instansi: true } },
        batch: { include: { training: true } },
        examResult: true,
      },
      orderBy: { id: "asc" },
    });

    const headers = [
      "No",
      "Nama Peserta",
      "NIK",
      "Instansi",
      "Program",
      "Batch",
      "Teori BAPETEN",
      "Praktik BAPETEN",
      "Wawancara",
      "Status Akhir",
      "No Sertifikat",
    ];

    const rows = registrations.map((r, idx) => [
      idx + 1,
      `"${r.user.fullName.replace(/"/g, '""')}"`,
      `"${r.user.nik || "-"}"`,
      `"${(r.instansi || r.user.instansi || "-").replace(/"/g, '""')}"`,
      `"${r.batch.training.title.replace(/"/g, '""')}"`,
      `"Batch ${r.batch.batchNumber}"`,
      r.examResult?.bapetenTheoryScore ?? "-",
      r.examResult?.bapetenPracticalScore ?? "-",
      r.examResult?.bapetenInterviewScore ?? "-",
      r.examResult?.finalStatus ?? "MENUNGGU",
      `"${r.examResult?.certificateNumber || "-"}"`,
    ].join(","));

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="rekap-kelulusan-alara.csv"',
      },
    });
  } catch (error) {
    console.error("[ADMIN_REPORTS_EXPORT_EXCEL]", error);
    return new NextResponse("Gagal export excel", { status: 500 });
  }
}
