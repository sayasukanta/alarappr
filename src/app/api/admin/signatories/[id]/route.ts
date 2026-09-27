import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSignatorySchema = z.object({
  name: z.string().min(2, "Nama lengkap penandatangan minimal 2 karakter").optional(),
  position: z.string().min(2, "Jabatan minimal 2 karakter").optional(),
  institution: z.string().optional(),
  nip: z.string().optional().nullable(),
  signatureUrl: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const signatoryId = parseInt(id, 10);
    if (isNaN(signatoryId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = updateSignatorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.certificateSignatory.findUnique({
      where: { id: signatoryId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Data penandatangan tidak ditemukan" },
        { status: 404 }
      );
    }

    const { name, position, institution, nip, signatureUrl, isActive } = parsed.data;

    // Jika diubah menjadi aktif, nonaktifkan penandatangan lain agar hanya 1 yang aktif utama
    if (isActive === true) {
      await prisma.certificateSignatory.updateMany({
        where: {
          id: { not: signatoryId },
          isActive: true,
        },
        data: { isActive: false },
      });
    }

    const updated = await prisma.certificateSignatory.update({
      where: { id: signatoryId },
      data: {
        ...(name !== undefined && { name }),
        ...(position !== undefined && { position }),
        ...(institution !== undefined && { institution }),
        ...(nip !== undefined && { nip: nip || null }),
        ...(signatureUrl !== undefined && { signatureUrl: signatureUrl || null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[SIGNATORY_UPDATE]", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data penandatangan" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const signatoryId = parseInt(id, 10);
    if (isNaN(signatoryId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const existing = await prisma.certificateSignatory.findUnique({
      where: { id: signatoryId },
      include: {
        _count: {
          select: { examResults: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Data penandatangan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Jika sudah pernah menandatangani sertifikat yang diterbitkan, tolak penghapusan langsung
    if (existing._count.examResults > 0) {
      return NextResponse.json(
        {
          error: `Penandatangan ini telah terkait dengan ${existing._count.examResults} sertifikat resmi yang diterbitkan. Untuk menjaga integritas riwayat dokumen, data tidak boleh dihapus melainkan cukup dinonaktifkan (Ubah status ke Nonaktif).`,
        },
        { status: 422 }
      );
    }

    await prisma.certificateSignatory.delete({
      where: { id: signatoryId },
    });

    return NextResponse.json({ message: "Data penandatangan berhasil dihapus" });
  } catch (error) {
    console.error("[SIGNATORY_DELETE]", error);
    return NextResponse.json(
      { error: "Gagal menghapus data penandatangan" },
      { status: 500 }
    );
  }
}
