import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const targetId = parseInt(resolvedParams.id, 10);
    const body = await req.json();
    const adminId = parseInt((session.user as any)?.id, 10) || null;

    // 1. If updating overall registration status
    if (body.registrationStatus) {
      const updatedReg = await prisma.registration.update({
        where: { id: targetId },
        data: {
          registrationStatus: body.registrationStatus,
        },
      });
      return NextResponse.json({ success: true, registration: updatedReg });
    }

    // 2. If updating document (either documentId in body or targetId in url)
    const docId = body.documentId ? parseInt(body.documentId, 10) : targetId;
    if (docId) {
      const updatedDoc = await prisma.registrationDocument.update({
        where: { id: docId },
        data: {
          isValid: body.isValid !== undefined ? Boolean(body.isValid) : undefined,
          notes: body.notes !== undefined ? body.notes : undefined,
          mcuIssueDate: body.mcuIssueDate ? new Date(body.mcuIssueDate) : undefined,
          hasDarah: body.hasDarah !== undefined ? Boolean(body.hasDarah) : undefined,
          hasUrine: body.hasUrine !== undefined ? Boolean(body.hasUrine) : undefined,
          verifiedBy: adminId,
          verifiedAt: new Date(),
        },
      });
      return NextResponse.json({ success: true, document: updatedDoc });
    }

    return NextResponse.json({ error: "Perubahan tidak dikenali" }, { status: 400 });
  } catch (error) {
    console.error("Error updating verification:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui status verifikasi" },
      { status: 500 }
    );
  }
}
