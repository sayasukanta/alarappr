import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const moduleId = parseInt(id, 10);
    if (isNaN(moduleId)) {
      return NextResponse.json({ error: "ID modul tidak valid" }, { status: 400 });
    }

    const module = await prisma.lmsModule.findUnique({
      where: { id: moduleId },
      select: { id: true, isPublished: true },
    });

    if (!module) {
      return NextResponse.json({ error: "Modul tidak ditemukan" }, { status: 404 });
    }

    let nextPublishedState = !module.isPublished;
    try {
      const body = await req.json();
      if (body && typeof body.isPublished === "boolean") {
        nextPublishedState = body.isPublished;
      }
    } catch {
      // If no json body, just toggle
    }

    const updated = await prisma.lmsModule.update({
      where: { id: moduleId },
      data: { isPublished: nextPublishedState },
    });

    return NextResponse.json({
      success: true,
      isPublished: updated.isPublished,
      message: `Modul berhasil ${updated.isPublished ? "diterbitkan" : "diubah ke draf"}`,
    });
  } catch (error) {
    console.error("[ADMIN_LMS_PUBLISH_PATCH]", error);
    return NextResponse.json({ error: "Gagal mengubah status publikasi" }, { status: 500 });
  }
}
