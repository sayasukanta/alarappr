import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateUnitSchema = z.object({
  sectionCode: z.string().min(1).optional(),
  sectionTitle: z.string().min(1).optional(),
  unitNo: z.string().min(1).optional(),
  mataAjar: z.string().min(1).optional(),
  kode: z.string().min(1).optional(),
  kodeKompetensi: z.string().optional().nullable(),
  jp: z.coerce.number().min(1).optional(),
  orderIndex: z.coerce.number().optional(),
});

interface RouteParams {
  params: Promise<{ id: string; unitId: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, unitId } = await params;
    const trainingId = parseInt(id, 10);
    const uId = parseInt(unitId, 10);
    if (isNaN(trainingId) || isNaN(uId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = updateUnitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await prisma.trainingCompetencyUnit.update({
      where: { id: uId, trainingId },
      data: {
        ...(parsed.data.sectionCode && { sectionCode: parsed.data.sectionCode }),
        ...(parsed.data.sectionTitle && { sectionTitle: parsed.data.sectionTitle }),
        ...(parsed.data.unitNo && { unitNo: parsed.data.unitNo }),
        ...(parsed.data.mataAjar && { mataAjar: parsed.data.mataAjar }),
        ...(parsed.data.kode && { kode: parsed.data.kode }),
        ...(parsed.data.kodeKompetensi !== undefined && { kodeKompetensi: parsed.data.kodeKompetensi }),
        ...(parsed.data.jp !== undefined && { jp: parsed.data.jp }),
        ...(parsed.data.orderIndex !== undefined && { orderIndex: parsed.data.orderIndex }),
      },
    });

    return NextResponse.json({ data: updated, message: "Unit kompetensi berhasil diperbarui" });
  } catch (error) {
    console.error("[ADMIN_UNIT_PUT]", error);
    return NextResponse.json({ error: "Gagal memperbarui unit kompetensi" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, unitId } = await params;
    const trainingId = parseInt(id, 10);
    const uId = parseInt(unitId, 10);
    if (isNaN(trainingId) || isNaN(uId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    await prisma.trainingCompetencyUnit.delete({
      where: { id: uId, trainingId },
    });

    return NextResponse.json({ message: "Unit kompetensi berhasil dihapus" });
  } catch (error) {
    console.error("[ADMIN_UNIT_DELETE]", error);
    return NextResponse.json({ error: "Gagal menghapus unit kompetensi" }, { status: 500 });
  }
}
