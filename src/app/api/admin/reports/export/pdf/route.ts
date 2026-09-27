import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ALARA_LOGO_BASE64 } from "@/lib/logo-base64";

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

    const rowsHtml = registrations
      .map(
        (r, idx) => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${idx + 1}</td>
        <td style="border: 1px solid #ddd; padding: 8px;"><strong>${r.user.fullName}</strong><br><small>NIK: ${r.user.nik || "-"}</small></td>
        <td style="border: 1px solid #ddd; padding: 8px;">${r.instansi || r.user.instansi || "-"}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${r.batch.training.title} (Batch ${r.batch.batchNumber})</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${r.examResult?.bapetenTheoryScore ?? "-"}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${r.examResult?.bapetenPracticalScore ?? "-"}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${r.examResult?.bapetenInterviewScore ?? "-"}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold; color: ${r.examResult?.finalStatus === "LULUS" ? "#16a34a" : "#dc2626"};">${r.examResult?.finalStatus ?? "-"}</td>
        <td style="border: 1px solid #ddd; padding: 8px; font-family: monospace;">${r.examResult?.certificateNumber || "-"}</td>
      </tr>
    `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Rekapitulasi Hasil Pelatihan ALARA & Kelulusan BAPETEN</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 30px; color: #1e293b; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            p { font-size: 13px; color: #64748b; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 20px; }
            th { border: 1px solid #cbd5e1; padding: 8px; background: #f1f5f9; text-align: left; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <img src="${ALARA_LOGO_BASE64}" alt="Logo ALARA" style="width: 56px; height: 56px; object-fit: contain;" />
              <div>
                <h1>LEMBAGA PELATIHAN KETENAGANUKLIRAN ALARA</h1>
                <p>Laporan Rekapitulasi Hasil Ujian BAPETEN dan Sertifikasi Peserta</p>
              </div>
            </div>
            <button onclick="window.print()" style="padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;">Cetak Dokumen</button>
          </div>
          <hr style="border: 0; border-top: 2px solid #0284c7; margin: 15px 0 25px 0;">
          <table>
            <thead>
              <tr>
                <th style="width: 35px; text-align: center;">No</th>
                <th>Nama Peserta</th>
                <th>Instansi</th>
                <th>Pelatihan</th>
                <th style="text-align: center;">Teori</th>
                <th style="text-align: center;">Praktik</th>
                <th style="text-align: center;">Wawancara</th>
                <th style="text-align: center;">Status</th>
                <th>No Sertifikat</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="9" style="text-align: center; padding: 20px;">Tidak ada data</td></tr>'}
            </tbody>
          </table>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("[ADMIN_REPORTS_EXPORT_PDF]", error);
    return new NextResponse("Gagal membuat dokumen", { status: 500 });
  }
}
