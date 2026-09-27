import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "INSTRUCTOR") {
      return NextResponse.json(
        { error: "Hanya instruktur yang dapat menandatangani logbook" },
        { status: 403 }
      );
    }

    const userId = parseInt(session.user.id);
    const { id: idStr } = await params;
    const logbookId = parseInt(idStr);

    if (isNaN(logbookId)) {
      return NextResponse.json({ error: "ID logbook tidak valid" }, { status: 400 });
    }

    // Check logbook exists
    const logbook = await prisma.logbook.findUnique({
      where: { id: logbookId },
    });

    if (!logbook) {
      return NextResponse.json({ error: "Logbook tidak ditemukan" }, { status: 404 });
    }

    if (logbook.signedOffBy !== null) {
      return NextResponse.json(
        { error: "Logbook ini sudah ditandatangani sebelumnya" },
        { status: 409 }
      );
    }

    const updatedLogbook = await prisma.logbook.update({
      where: { id: logbookId },
      data: {
        signedOffBy: userId,
        signedOffAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      logbook: updatedLogbook,
    });
  } catch (error) {
    console.error("[LOGBOOK_SIGNOFF]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
