import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const attemptId = parseInt(resolvedParams.attemptId, 10);
    const body = await req.json();

    const updated = await prisma.tryoutAttempt.update({
      where: { id: attemptId },
      data: {
        tabSwitchCount: body.count || { increment: 1 },
      },
    });

    return NextResponse.json({ success: true, count: updated.tabSwitchCount });
  } catch (error) {
    console.error("Error updating tab switch:", error);
    return NextResponse.json({ error: "Gagal mencatat perpindahan tab" }, { status: 500 });
  }
}
