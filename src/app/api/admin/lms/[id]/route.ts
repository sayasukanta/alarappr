import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TrainingCategory } from "@prisma/client";

export async function GET(
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
      include: {
        training: { select: { id: true, title: true } },
        _count: {
          select: { progressRecords: true },
        },
      },
    });

    if (!module) {
      return NextResponse.json({ error: "Modul tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ module });
  } catch (error) {
    console.error("[ADMIN_LMS_GET_BY_ID]", error);
    return NextResponse.json({ error: "Gagal mengambil data modul" }, { status: 500 });
  }
}

export async function PUT(
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

    const body = await req.json();
    const {
      trainingCategory,
      trainingId,
      dayNumber,
      title,
      description,
      moduleType,
      durationMinutes,
      content,
      contentPath,
      fileUrl,
      fileName,
      fileSize,
      videoUrl,
      pageCount,
      orderIndex,
      isPublished,
    } = body;

    const existing = await prisma.lmsModule.findUnique({
      where: { id: moduleId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Modul tidak ditemukan" }, { status: 404 });
    }

    const updatedModule = await prisma.lmsModule.update({
      where: { id: moduleId },
      data: {
        trainingCategory: (trainingCategory as TrainingCategory) || existing.trainingCategory,
        trainingId: trainingId !== undefined ? (trainingId ? parseInt(trainingId, 10) : null) : existing.trainingId,
        dayNumber: dayNumber !== undefined ? parseInt(dayNumber, 10) : existing.dayNumber,
        title: title !== undefined ? title.trim() : existing.title,
        description: description !== undefined ? description?.trim() || null : existing.description,
        moduleType: moduleType !== undefined ? moduleType : existing.moduleType,
        durationMinutes: durationMinutes !== undefined ? parseInt(durationMinutes, 10) : existing.durationMinutes,
        content: content !== undefined ? content : existing.content,
        contentPath: contentPath !== undefined ? contentPath : existing.contentPath,
        fileUrl: fileUrl !== undefined ? fileUrl : existing.fileUrl,
        fileName: fileName !== undefined ? fileName : existing.fileName,
        fileSize: fileSize !== undefined ? fileSize : existing.fileSize,
        videoUrl: videoUrl !== undefined ? videoUrl : existing.videoUrl,
        pageCount: pageCount !== undefined ? parseInt(pageCount, 10) : existing.pageCount,
        orderIndex: orderIndex !== undefined ? parseInt(orderIndex, 10) : existing.orderIndex,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : existing.isPublished,
      },
    });

    return NextResponse.json({ success: true, module: updatedModule });
  } catch (error) {
    console.error("[ADMIN_LMS_PUT]", error);
    return NextResponse.json({ error: "Gagal memperbarui modul" }, { status: 500 });
  }
}

export async function DELETE(
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

    await prisma.lmsModule.delete({
      where: { id: moduleId },
    });

    return NextResponse.json({ success: true, message: "Modul berhasil dihapus" });
  } catch (error) {
    console.error("[ADMIN_LMS_DELETE]", error);
    return NextResponse.json({ error: "Gagal menghapus modul" }, { status: 500 });
  }
}
