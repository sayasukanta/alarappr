import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const batchId = parseInt(resolvedParams.id, 10);
    const body = await req.json();
    const { instructorId, sessionName } = body;

    const assignment = await prisma.instructorAssignment.create({
      data: {
        batchId,
        instructorId: parseInt(instructorId, 10),
        sessionName: sessionName || "Materi Pelatihan",
        teachingDate: new Date(),
        startTime: "08:00",
        endTime: "16:00",
        sessionType: "THEORY",
        teachingHours: 4.0,
      },
    });

    return NextResponse.json({ success: true, data: assignment }, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_BATCH_INSTRUCTOR_POST]", error);
    return NextResponse.json(
      { error: "Gagal menugaskan instruktur" },
      { status: 500 }
    );
  }
}
