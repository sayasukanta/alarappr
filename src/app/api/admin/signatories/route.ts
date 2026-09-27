import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSignatorySchema = z.object({
  name: z.string().min(2, "Nama lengkap penandatangan minimal 2 karakter"),
  position: z.string().min(2, "Jabatan minimal 2 karakter"),
  institution: z.string().default("CV. HIKMAT PROTEKSI ALARA"),
  nip: z.string().optional().nullable(),
  signatureUrl: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const signatories = await prisma.certificateSignatory.findMany({
      include: {
        _count: {
          select: { examResults: true },
        },
      },
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(signatories);
  } catch (error) {
    console.error("[SIGNATORIES_GET]", error);
    return NextResponse.json(
      { error: "Gagal memuat data penandatangan" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createSignatorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, position, institution, nip, signatureUrl, isActive } = parsed.data;

    // Jika yang baru dibuat di-set aktif, nonaktifkan penandatangan lainnya
    if (isActive) {
      await prisma.certificateSignatory.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    const newSignatory = await prisma.certificateSignatory.create({
      data: {
        name,
        position,
        institution: institution || "CV. HIKMAT PROTEKSI ALARA",
        nip: nip || null,
        signatureUrl: signatureUrl || null,
        isActive,
      },
    });

    return NextResponse.json(newSignatory, { status: 201 });
  } catch (error) {
    console.error("[SIGNATORIES_POST]", error);
    return NextResponse.json(
      { error: "Gagal menyimpan penandatangan baru" },
      { status: 500 }
    );
  }
}
