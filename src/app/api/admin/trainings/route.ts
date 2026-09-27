import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trainings = await prisma.training.findMany({
      include: {
        _count: {
          select: { batches: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = trainings.map((t) => ({
      id: t.id,
      category: t.category,
      title: t.title,
      certBadge: t.certBadge || (t.category === "PKR_PEKERJA" ? "Internal" : "BAPETEN"),
      price: Number(t.price),
      durationDays: t.durationDays,
      description: t.description,
      createdAt: t.createdAt.toISOString(),
      batchesCount: t._count.batches,
    }));

    return NextResponse.json({ data: formatted });
  } catch (error) {
    console.error("[ADMIN_TRAININGS_GET]", error);
    return NextResponse.json(
      { error: "Gagal memuat data program pelatihan" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const newTraining = await prisma.training.create({
      data: {
        title: title.trim(),
        category,
        certBadge: certBadge?.trim() || (category === "PKR_PEKERJA" ? "Internal" : "BAPETEN"),
        price: parsedPrice,
        durationDays: parsedDuration,
        description: description?.trim() || null,
      },
    });

    revalidatePath("/");

    return NextResponse.json(
      {
        success: true,
        data: {
          ...newTraining,
          price: Number(newTraining.price),
          batchesCount: 0,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ADMIN_TRAININGS_POST]", error);
    return NextResponse.json({ error: "Gagal membuat jenis pelatihan baru" }, { status: 500 });
  }
}
