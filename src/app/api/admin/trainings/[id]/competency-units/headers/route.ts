import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const headersSchema = z.object({
  titleEn: z.string().optional().nullable(),
  certHeaderId: z.string().optional().nullable(),
  certSubtitleId: z.string().optional().nullable(),
  certHeaderEn: z.string().optional().nullable(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const trainingId = parseInt(id, 10);
    if (isNaN(trainingId)) {
      return NextResponse.json({ error: "ID pelatihan tidak valid" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = headersSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await prisma.training.update({
      where: { id: trainingId },
      data: {
        titleEn: parsed.data.titleEn,
        certHeaderId: parsed.data.certHeaderId,
        certSubtitleId: parsed.data.certSubtitleId,
        certHeaderEn: parsed.data.certHeaderEn,
      },
    });

    return NextResponse.json({
      data: updated,
      message: "Header sertifikat berhasil diperbarui",
    });
  } catch (error) {
    console.error("[ADMIN_TRAINING_HEADERS_PUT]", error);
    return NextResponse.json({ error: "Gagal memperbarui header sertifikat" }, { status: 500 });
  }
}
