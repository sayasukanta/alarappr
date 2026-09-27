import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const slideId = parseInt(id);
    if (isNaN(slideId)) {
      return NextResponse.json({ error: "ID slide tidak valid" }, { status: 400 });
    }

    const body = await req.json();
    const { title, imageUrl, linkUrl, isTampil, orderIndex } = body;

    const existing = await prisma.slide.findUnique({
      where: { id: slideId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Slide tidak ditemukan" }, { status: 404 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title ? title.trim() : null;
    if (imageUrl !== undefined) {
      if (!imageUrl || !imageUrl.trim()) {
        return NextResponse.json({ error: "URL gambar wajib diisi" }, { status: 400 });
      }
      updateData.imageUrl = imageUrl.trim();
    }
    if (linkUrl !== undefined) updateData.linkUrl = linkUrl ? linkUrl.trim() : null;
    if (isTampil !== undefined) {
      updateData.isTampil = isTampil === 2 ? 2 : 1;
    }
    if (orderIndex !== undefined) {
      const parsedOrder = typeof orderIndex === "number" ? orderIndex : parseInt(orderIndex);
      if (!isNaN(parsedOrder) && parsedOrder >= 1) {
        updateData.orderIndex = parsedOrder;
      }
    }

    const updated = await prisma.slide.update({
      where: { id: slideId },
      data: updateData,
    });

    revalidatePath("/");
    revalidatePath("/pengaturan/slide");

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Slide berhasil diperbarui",
    });
  } catch (error) {
    console.error("[ADMIN_SLIDE_PUT]", error);
    return NextResponse.json(
      { error: "Gagal memperbarui slide" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const slideId = parseInt(id);
    if (isNaN(slideId)) {
      return NextResponse.json({ error: "ID slide tidak valid" }, { status: 400 });
    }

    await prisma.slide.delete({
      where: { id: slideId },
    });

    revalidatePath("/");
    revalidatePath("/pengaturan/slide");

    return NextResponse.json({
      success: true,
      message: "Slide berhasil dihapus",
    });
  } catch (error) {
    console.error("[ADMIN_SLIDE_DELETE]", error);
    return NextResponse.json(
      { error: "Gagal menghapus slide" },
      { status: 500 }
    );
  }
}
