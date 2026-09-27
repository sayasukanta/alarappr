import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TrainingCategory } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoryParam = searchParams.get("category");
    const dayParam = searchParams.get("day");
    const typeParam = searchParams.get("type");
    const statusParam = searchParams.get("status");
    const searchParam = searchParams.get("search");

    const where: any = {};

    if (categoryParam && categoryParam !== "ALL") {
      where.trainingCategory = categoryParam as TrainingCategory;
    }

    if (dayParam && dayParam !== "ALL") {
      where.dayNumber = parseInt(dayParam, 10);
    }

    if (typeParam && typeParam !== "ALL") {
      where.moduleType = typeParam;
    }

    if (statusParam === "published") {
      where.isPublished = true;
    } else if (statusParam === "draft") {
      where.isPublished = false;
    }

    if (searchParam && searchParam.trim().length > 0) {
      const q = searchParam.trim();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { content: { contains: q } },
      ];
    }

    // Calculate metrics
    const [
      totalModules,
      publishedCount,
      draftCount,
      pprAnalisisCount,
      pprBagasiCount,
      pkrPekerjaCount,
      allModulesForDuration,
    ] = await Promise.all([
      prisma.lmsModule.count(),
      prisma.lmsModule.count({ where: { isPublished: true } }),
      prisma.lmsModule.count({ where: { isPublished: false } }),
      prisma.lmsModule.count({ where: { trainingCategory: TrainingCategory.PPR_ANALISIS } }),
      prisma.lmsModule.count({ where: { trainingCategory: TrainingCategory.PPR_BAGASI } }),
      prisma.lmsModule.count({ where: { trainingCategory: TrainingCategory.PKR_PEKERJA } }),
      prisma.lmsModule.findMany({ select: { durationMinutes: true } }),
    ]);

    const totalMinutes = allModulesForDuration.reduce((acc, m) => acc + (m.durationMinutes || 0), 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    const modules = await prisma.lmsModule.findMany({
      where,
      orderBy: [
        { trainingCategory: "asc" },
        { dayNumber: "asc" },
        { orderIndex: "asc" },
        { createdAt: "desc" },
      ],
      include: {
        training: { select: { id: true, title: true } },
        _count: {
          select: { progressRecords: true },
        },
      },
    });

    return NextResponse.json({
      modules,
      metrics: {
        totalModules,
        publishedCount,
        draftCount,
        totalHours,
        totalMinutes,
        byCategory: {
          PPR_ANALISIS: pprAnalisisCount,
          PPR_BAGASI: pprBagasiCount,
          PKR_PEKERJA: pkrPekerjaCount,
        },
      },
    });
  } catch (error) {
    console.error("[ADMIN_LMS_GET]", error);
    return NextResponse.json({ error: "Gagal mengambil daftar modul LMS" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    if (!trainingCategory || !title) {
      return NextResponse.json(
        { error: "Kategori pelatihan dan judul modul wajib diisi" },
        { status: 400 }
      );
    }

    // Determine default orderIndex if not given
    let calculatedOrder = parseInt(orderIndex, 10);
    if (isNaN(calculatedOrder) || calculatedOrder < 1) {
      const maxOrder = await prisma.lmsModule.findFirst({
        where: {
          trainingCategory: trainingCategory as TrainingCategory,
          dayNumber: parseInt(dayNumber || "1", 10),
        },
        orderBy: { orderIndex: "desc" },
        select: { orderIndex: true },
      });
      calculatedOrder = (maxOrder?.orderIndex || 0) + 1;
    }

    const newModule = await prisma.lmsModule.create({
      data: {
        trainingCategory: trainingCategory as TrainingCategory,
        trainingId: trainingId ? parseInt(trainingId, 10) : null,
        dayNumber: parseInt(dayNumber || "1", 10),
        title: title.trim(),
        description: description?.trim() || null,
        moduleType: moduleType || "reading",
        durationMinutes: parseInt(durationMinutes || "45", 10),
        content: content || null,
        contentPath: contentPath || null,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileSize: fileSize || null,
        videoUrl: videoUrl || null,
        pageCount: pageCount ? parseInt(pageCount, 10) : 1,
        orderIndex: calculatedOrder,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      },
    });

    return NextResponse.json({ success: true, module: newModule });
  } catch (error) {
    console.error("[ADMIN_LMS_POST]", error);
    return NextResponse.json({ error: "Gagal membuat modul LMS" }, { status: 500 });
  }
}
