import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id, 10);
    const { id } = await context.params;

    // Support both numeric id or mod string
    let moduleId: number | null = parseInt(id, 10);
    if (isNaN(moduleId)) {
      // try to extract number if format is mod-1-1
      const match = id.match(/\d+/g);
      if (match && match.length > 0) {
        moduleId = parseInt(match[match.length - 1], 10);
      } else {
        return NextResponse.json({ error: "ID modul tidak valid" }, { status: 400 });
      }
    }

    const module = await prisma.lmsModule.findUnique({
      where: { id: moduleId },
      include: {
        training: { select: { id: true, title: true } },
        progressRecords: {
          where: { userId },
        },
      },
    });

    if (!module) {
      return NextResponse.json({ error: "Modul tidak ditemukan" }, { status: 404 });
    }

    // Record last accessed if not completed
    if (module.progressRecords.length === 0) {
      await prisma.lmsProgress.create({
        data: {
          userId,
          moduleId: module.id,
          status: "in_progress",
        },
      });
    } else {
      await prisma.lmsProgress.update({
        where: {
          userId_moduleId: {
            userId,
            moduleId: module.id,
          },
        },
        data: {
          lastAccessedAt: new Date(),
        },
      });
    }

    // Sibling modules for navigation
    const siblings = await prisma.lmsModule.findMany({
      where: {
        trainingCategory: module.trainingCategory,
        isPublished: true,
      },
      orderBy: [
        { dayNumber: "asc" },
        { orderIndex: "asc" },
      ],
      select: {
        id: true,
        title: true,
        dayNumber: true,
        orderIndex: true,
        moduleType: true,
      },
    });

    const userProgresses = await prisma.lmsProgress.findMany({
      where: {
        userId,
        moduleId: { in: siblings.map((s) => s.id) },
      },
    });

    const progressMap = new Map(userProgresses.map((p) => [p.moduleId, p.status]));

    const navItems = siblings.map((s) => ({
      id: s.id.toString(),
      title: s.title,
      type: s.moduleType,
      dayNumber: s.dayNumber,
      status: progressMap.get(s.id) === "completed" ? "completed" : (progressMap.has(s.id) ? "in_progress" : "available"),
    }));

    return NextResponse.json({
      module,
      isCompleted: module.progressRecords[0]?.status === "completed",
      navItems,
    });
  } catch (error) {
    console.error("[LMS_MODULE_DETAIL_GET]", error);
    return NextResponse.json({ error: "Gagal mengambil modul" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id, 10);
    const { id } = await context.params;

    let moduleId: number | null = parseInt(id, 10);
    if (isNaN(moduleId)) {
      const match = id.match(/\d+/g);
      if (match && match.length > 0) {
        moduleId = parseInt(match[match.length - 1], 10);
      } else {
        return NextResponse.json({ error: "ID modul tidak valid" }, { status: 400 });
      }
    }

    const body = await req.json();
    const status = body.status || "completed";

    const progress = await prisma.lmsProgress.upsert({
      where: {
        userId_moduleId: {
          userId,
          moduleId,
        },
      },
      create: {
        userId,
        moduleId,
        status,
        completedAt: status === "completed" ? new Date() : null,
      },
      update: {
        status,
        completedAt: status === "completed" ? new Date() : null,
        lastAccessedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error("[LMS_MODULE_PROGRESS_POST]", error);
    return NextResponse.json({ error: "Gagal memperbarui progres" }, { status: 500 });
  }
}
