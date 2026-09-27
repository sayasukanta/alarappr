import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const unitSchema = z.object({
  sectionCode: z.string().min(1).default("A"),
  sectionTitle: z.string().min(1, "Judul seksi/kelompok materi wajib diisi"),
  unitNo: z.string().min(1, "Nomor urut mata ajar wajib diisi"),
  mataAjar: z.string().min(1, "Nama mata ajar wajib diisi"),
  kode: z.string().min(1, "Kode silabus wajib diisi"),
  kodeKompetensi: z.string().optional().nullable(),
  jp: z.coerce.number().min(1, "JP minimal 1"),
  orderIndex: z.coerce.number().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
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

    const training = await prisma.training.findUnique({
      where: { id: trainingId },
      include: {
        competencyUnits: {
          orderBy: [{ sectionCode: "asc" }, { orderIndex: "asc" }, { id: "asc" }],
        },
      },
    });

    if (!training) {
      return NextResponse.json({ error: "Pelatihan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        training: {
          id: training.id,
          title: training.title,
          category: training.category,
          titleEn: training.titleEn,
          certHeaderId: training.certHeaderId,
          certSubtitleId: training.certSubtitleId,
          certHeaderEn: training.certHeaderEn,
        },
        units: training.competencyUnits,
      },
    });
  } catch (error) {
    console.error("[ADMIN_TRAINING_UNITS_GET]", error);
    return NextResponse.json({ error: "Gagal memuat unit kompetensi" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
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
    const parsed = unitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Hitung orderIndex berikutnya jika tidak disertakan
    let orderIndex = parsed.data.orderIndex;
    if (!orderIndex) {
      const lastUnit = await prisma.trainingCompetencyUnit.findFirst({
        where: { trainingId },
        orderBy: { orderIndex: "desc" },
      });
      orderIndex = (lastUnit?.orderIndex || 0) + 1;
    }

    const created = await prisma.trainingCompetencyUnit.create({
      data: {
        trainingId,
        sectionCode: parsed.data.sectionCode,
        sectionTitle: parsed.data.sectionTitle,
        unitNo: parsed.data.unitNo,
        mataAjar: parsed.data.mataAjar,
        kode: parsed.data.kode,
        kodeKompetensi: parsed.data.kodeKompetensi || "-",
        jp: parsed.data.jp,
        orderIndex,
      },
    });

    return NextResponse.json({ data: created, message: "Unit kompetensi berhasil ditambahkan" });
  } catch (error) {
    console.error("[ADMIN_TRAINING_UNITS_POST]", error);
    return NextResponse.json({ error: "Gagal menambahkan unit kompetensi" }, { status: 500 });
  }
}
