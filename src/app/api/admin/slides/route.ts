import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const slides = await prisma.slide.findMany({
      orderBy: [
        { orderIndex: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({
      success: true,
      data: slides,
    });
  } catch (error) {
    console.error("[ADMIN_SLIDES_GET]", error);
    return NextResponse.json(
      { error: "Gagal memuat data slide" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, imageUrl, linkUrl, isTampil, orderIndex } = body;

    if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.trim()) {
      return NextResponse.json(
        { error: "URL gambar slide wajib diisi" },
        { status: 400 }
      );
    }

    // Default isTampil: 1 (tampil), 2 (tidak tampil)
    const validIsTampil = isTampil === 2 ? 2 : 1;

    // Calculate orderIndex if not provided
    let finalOrder = typeof orderIndex === "number" ? orderIndex : parseInt(orderIndex);
    if (isNaN(finalOrder) || finalOrder < 1) {
      const highestOrder = await prisma.slide.aggregate({
        _max: { orderIndex: true },
      });
      finalOrder = (highestOrder._max.orderIndex ?? 0) + 1;
    }

    const slide = await prisma.slide.create({
      data: {
        title: title ? title.trim() : null,
        imageUrl: imageUrl.trim(),
        linkUrl: linkUrl ? linkUrl.trim() : null,
        isTampil: validIsTampil,
        orderIndex: finalOrder,
      },
    });

    revalidatePath("/");
    revalidatePath("/pengaturan/slide");

    return NextResponse.json({
      success: true,
      data: slide,
      message: "Slide berhasil ditambahkan",
    });
  } catch (error) {
    console.error("[ADMIN_SLIDES_POST]", error);
    return NextResponse.json(
      { error: "Gagal menambahkan slide" },
      { status: 500 }
    );
  }
}
