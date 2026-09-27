import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
    const trainingId = parseInt(resolvedParams.id, 10);
    if (isNaN(trainingId)) {
      return NextResponse.json({ error: "ID pelatihan tidak valid" }, { status: 400 });
    }

    const existing = await prisma.training.findUnique({
      where: { id: trainingId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Data jenis pelatihan tidak ditemukan" }, { status: 404 });
    }

    const body = await req.json();
    const { title, category, price, durationDays, description, certBadge } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Judul/Nama program pelatihan wajib diisi" }, { status: 400 });
    }

    if (!category || !["PPR_ANALISIS", "PPR_BAGASI", "PKR_PEKERJA", "PPR_PENYEGARAN"].includes(category)) {
      return NextResponse.json({ error: "Kategori pelatihan tidak valid" }, { status: 400 });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ error: "Biaya pelatihan harus berupa angka valid" }, { status: 400 });
    }

    const parsedDuration = parseInt(durationDays, 10);
    if (isNaN(parsedDuration) || parsedDuration < 1) {
      return NextResponse.json({ error: "Durasi pelatihan minimal 1 hari" }, { status: 400 });
    }

    const updatedTraining = await prisma.training.update({
      where: { id: trainingId },
      data: {
        title: title.trim(),
        category,
        certBadge: certBadge !== undefined ? (certBadge?.trim() || null) : undefined,
        price: parsedPrice,
        durationDays: parsedDuration,
        description: description?.trim() || null,
      },
    });

    revalidatePath("/");

    return NextResponse.json({
      success: true,
      data: {
        ...updatedTraining,
        price: Number(updatedTraining.price),
      },
    });
  } catch (error) {
    console.error("[ADMIN_TRAININGS_PUT]", error);
    return NextResponse.json({ error: "Gagal memperbarui data pelatihan" }, { status: 500 });
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
    const trainingId = parseInt(resolvedParams.id, 10);
    if (isNaN(trainingId)) {
      return NextResponse.json({ error: "ID pelatihan tidak valid" }, { status: 400 });
    }

    const existing = await prisma.training.findUnique({
      where: { id: trainingId },
      include: {
        _count: {
          select: { batches: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Data jenis pelatihan tidak ditemukan" }, { status: 404 });
    }

    if (existing._count.batches > 0) {
      return NextResponse.json(
        {
          error: `Tidak dapat menghapus jenis pelatihan ini karena memiliki ${existing._count.batches} batch pelatihan terkait.`,
        },
        { status: 400 }
      );
    }

    await prisma.training.delete({
      where: { id: trainingId },
    });

    revalidatePath("/");

    return NextResponse.json({ success: true, message: "Jenis pelatihan berhasil dihapus" });
  } catch (error) {
    console.error("[ADMIN_TRAININGS_DELETE]", error);
    return NextResponse.json({ error: "Gagal menghapus jenis pelatihan" }, { status: 500 });
  }
}
