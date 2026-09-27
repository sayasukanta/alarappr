import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");

    const where: any = {};
    if (statusParam && ["RENCANA", "PELAKSANAAN", "SELESAI"].includes(statusParam)) {
      where.status = statusParam;
    }

    const batches = await prisma.trainingBatch.findMany({
      where,
      orderBy: { startDate: "desc" },
      include: {
        training: {
          select: {
            title: true,
            category: true,
          },
        },
        _count: {
          select: { registrations: true },
        },
        instructorAssignments: {
          include: {
            instructor: {
              include: {
                user: {
                  select: { fullName: true },
                },
              },
            },
          },
        },
      },
    });

    const data = batches.map((b) => ({
      id: b.id,
      trainingId: b.trainingId,
      batchNumber: b.batchNumber,
      startDate: b.startDate.toISOString(),
      endDate: b.endDate.toISOString(),
      quota: b.quota,
      location: b.location,
      status: b.status,
      documentationUrl: b.documentationUrl,
      documentationTitle: b.documentationTitle,
      training: b.training,
      _count: b._count,
      tryoutOpen: b.tryoutOpen,
      tryoutStartTime: b.tryoutStartTime ? b.tryoutStartTime.toISOString() : null,
      tryoutEndTime: b.tryoutEndTime ? b.tryoutEndTime.toISOString() : null,
      tryoutDurationMinutes: b.tryoutDurationMinutes || 60,
      tryoutQuestionCount: b.tryoutQuestionCount || 20,
      tryoutSelectionMode: b.tryoutSelectionMode || "AUTOMATIC",
      isLiveOpen:
        b.tryoutOpen &&
        b.tryoutEndTime !== null &&
        new Date() <= b.tryoutEndTime &&
        (!b.tryoutStartTime || new Date() >= b.tryoutStartTime),
      instructorAssignments: b.instructorAssignments.map((a) => ({
        id: a.id,
        instructorId: a.instructorId,
        sessionName: a.sessionName,
        instructor: {
          user: {
            fullName: a.instructor?.user?.fullName || "Instruktur",
          },
        },
      })),
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[ADMIN_BATCH_GET]", error);
    return NextResponse.json(
      { error: "Gagal memuat data batch" },
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
    const {
      trainingId,
      batchNumber,
      startDate,
      endDate,
      quota,
      location,
      status,
      documentationUrl,
      documentationTitle,
    } = body;

    const newBatch = await prisma.trainingBatch.create({
      data: {
        trainingId: parseInt(trainingId, 10),
        batchNumber: parseInt(batchNumber, 10),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        quota: parseInt(quota, 10),
        location: location || null,
        status: status && ["RENCANA", "PELAKSANAAN", "SELESAI"].includes(status) ? status : "RENCANA",
        documentationUrl: documentationUrl ? documentationUrl.trim() : null,
        documentationTitle: documentationTitle ? documentationTitle.trim() : null,
      },
    });

    return NextResponse.json({ success: true, data: newBatch }, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_BATCH_POST]", error);
    return NextResponse.json(
      { error: "Gagal membuat batch" },
      { status: 500 }
    );
  }
}
