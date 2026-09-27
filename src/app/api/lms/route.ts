import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TrainingCategory } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id, 10);
    const userRole = (session.user as any).role;

    const { searchParams } = new URL(req.url);
    const categoryParam = searchParams.get("category");

    // Determine category:
    // If participant, find active registration category, or fallback to PPR_ANALISIS
    let targetCategory: TrainingCategory = TrainingCategory.PPR_ANALISIS;

    if (categoryParam && Object.values(TrainingCategory).includes(categoryParam as TrainingCategory)) {
      targetCategory = categoryParam as TrainingCategory;
    } else {
      // Find user's latest registration
      const latestReg = await prisma.registration.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          batch: {
            include: {
              training: { select: { category: true } },
            },
          },
        },
      });

      if (latestReg?.batch?.training?.category) {
        targetCategory = latestReg.batch.training.category;
      }
    }

    // Fetch published modules for this category
    const modules = await prisma.lmsModule.findMany({
      where: {
        trainingCategory: targetCategory,
        // Admins can see drafts, participants see only published
        ...(userRole === "ADMIN" ? {} : { isPublished: true }),
      },
      orderBy: [
        { dayNumber: "asc" },
        { orderIndex: "asc" },
      ],
      include: {
        progressRecords: {
          where: { userId },
          select: { status: true, completedAt: true, lastAccessedAt: true },
        },
      },
    });

    // Group modules by day
    const daysMap = new Map<number, any[]>();
    for (const mod of modules) {
      const day = mod.dayNumber || 1;
      if (!daysMap.has(day)) {
        daysMap.set(day, []);
      }
      const progress = mod.progressRecords[0];
      daysMap.get(day)!.push({
        id: mod.id.toString(),
        dbId: mod.id,
        title: mod.title,
        description: mod.description || "",
        durationMin: mod.durationMinutes,
        type: mod.moduleType as "video" | "reading" | "quiz" | "file",
        status: progress?.status === "completed" ? "completed" : (progress ? "in_progress" : "available"),
        pageCount: mod.pageCount,
        fileUrl: mod.fileUrl,
        fileName: mod.fileName,
        fileSize: mod.fileSize,
        videoUrl: mod.videoUrl,
        orderIndex: mod.orderIndex,
        isPublished: mod.isPublished,
      });
    }

    // Format into sections
    const dayLabels: Record<number, string> = {
      1: "Hari 1",
      2: "Hari 2",
      3: "Hari 3",
      4: "Hari 4",
      5: "Hari 5",
    };

    const sections = Array.from(daysMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([day, mods]) => ({
        day,
        label: dayLabels[day] || `Hari ${day}`,
        modules: mods,
      }));

    // Calculate overall statistics
    const totalModules = modules.length;
    const completedCount = modules.filter(
      (m) => m.progressRecords[0]?.status === "completed"
    ).length;
    const progressPct = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

    return NextResponse.json({
      category: targetCategory,
      sections,
      stats: {
        total: totalModules,
        completed: completedCount,
        pct: progressPct,
      },
    });
  } catch (error) {
    console.error("[LMS_PARTICIPANT_GET]", error);
    return NextResponse.json({ error: "Gagal mengambil materi LMS" }, { status: 500 });
  }
}
