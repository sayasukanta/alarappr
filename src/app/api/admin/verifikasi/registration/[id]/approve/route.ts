import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const registrationId = parseInt(resolvedParams.id, 10);
    const adminId = parseInt((session.user as any)?.id, 10) || null;

    await prisma.$transaction([
      prisma.registration.update({
        where: { id: registrationId },
        data: {
          registrationStatus: "APPROVED",
        },
      }),
      prisma.registrationDocument.updateMany({
        where: { registrationId },
        data: {
          isValid: true,
          verifiedBy: adminId,
          verifiedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error approving registration:", error);
    return NextResponse.json(
      { error: "Gagal menyetujui pendaftaran" },
      { status: 500 }
    );
  }
}
