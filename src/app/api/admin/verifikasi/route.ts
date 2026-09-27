import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "ALL") {
      where.registrationStatus = status;
    }

    const registrations = await prisma.registration.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            nik: true,
            instansi: true,
          },
        },
        batch: {
          include: {
            training: true,
          },
        },
        documents: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const data = registrations.map((r) => ({
      id: r.id,
      pesertaName: r.user.fullName,
      email: r.user.email,
      nik: r.user.nik || "-",
      instansi: r.instansi || r.user.instansi || "-",
      program: r.batch.training.title,
      batch: `Batch ${r.batch.batchNumber}`,
      batchId: r.batchId,
      registrationStatus: r.registrationStatus,
      paymentStatus: r.paymentStatus,
      createdAt: r.createdAt.toISOString(),
      sponsorName: r.sponsorName,
      documents: r.documents.map((d) => ({
        id: d.id,
        docType: d.docType,
        filePath: d.filePath,
        isValid: d.isValid,
        notes: d.notes,
        verifiedAt: d.verifiedAt ? d.verifiedAt.toISOString() : null,
        mcuIssueDate: d.mcuIssueDate ? d.mcuIssueDate.toISOString() : null,
        hasDarah: d.hasDarah,
        hasUrine: d.hasUrine,
      })),
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching registrations for verification:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pendaftaran" },
      { status: 500 }
    );
  }
}
