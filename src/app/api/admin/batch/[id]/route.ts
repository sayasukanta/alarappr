import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const batchId = parseInt(resolvedParams.id, 10);
    const body = await req.json();
    const {
      trainingId,
      batchNumber,
      startDate,
      endDate,
      quota,
      location,
      status,
      documentationUrl,
      documentationTitle,
    } = body;

    const updated = await prisma.trainingBatch.update({
      where: { id: batchId },
      data: {
        trainingId: trainingId ? parseInt(trainingId, 10) : undefined,
        batchNumber: batchNumber ? parseInt(batchNumber, 10) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        quota: quota ? parseInt(quota, 10) : undefined,
        location: location !== undefined ? location : undefined,
        status: status && ["RENCANA", "PELAKSANAAN", "SELESAI"].includes(status) ? status : undefined,
        documentationUrl: documentationUrl !== undefined ? (documentationUrl ? documentationUrl.trim() : null) : undefined,
        documentationTitle: documentationTitle !== undefined ? (documentationTitle ? documentationTitle.trim() : null) : undefined,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[ADMIN_BATCH_PUT]", error);
    return NextResponse.json(
      { error: "Gagal memperbarui batch" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const batchId = parseInt(resolvedParams.id, 10);

    // Check if batch has registrations
    const regCount = await prisma.registration.count({
      where: { batchId },
    });

    if (regCount > 0) {
      return NextResponse.json(
        { error: `Batch tidak dapat dihapus karena sudah memiliki ${regCount} pendaftaran` },
        { status: 400 }
      );
    }

    await prisma.instructorAssignment.deleteMany({
      where: { batchId },
    });

    await prisma.trainingBatch.delete({
      where: { id: batchId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_BATCH_DELETE]", error);
    return NextResponse.json(
      { error: "Gagal menghapus batch" },
      { status: 500 }
    );
  }
}
