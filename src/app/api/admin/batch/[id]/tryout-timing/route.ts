import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await params;
    const batchId = parseInt(resolved.id, 10);
    if (isNaN(batchId)) {
      return NextResponse.json({ error: "ID Batch tidak valid" }, { status: 400 });
    }

    const batch = await prisma.trainingBatch.findUnique({
      where: { id: batchId },
      include: {
        training: { select: { title: true, category: true } },
      },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch tidak ditemukan" }, { status: 404 });
    }

    const now = new Date();
    const isLiveOpen =
      batch.tryoutOpen &&
      batch.tryoutEndTime !== null &&
      now <= batch.tryoutEndTime &&
      (batch.tryoutStartTime === null || now >= batch.tryoutStartTime);

    const remainingMs =
      isLiveOpen && batch.tryoutEndTime ? Math.max(0, batch.tryoutEndTime.getTime() - now.getTime()) : 0;
    const remainingMinutes = Math.ceil(remainingMs / 60000);

    const activeQuestionsAvailable = await prisma.question.count({
      where: { category: batch.training.category, isActive: true },
    });

    return NextResponse.json({
      batch: {
        id: batch.id,
        batchNumber: batch.batchNumber,
        trainingTitle: batch.training.title,
        category: batch.training.category,
        tryoutOpen: batch.tryoutOpen,
        tryoutStartTime: batch.tryoutStartTime?.toISOString() || null,
        tryoutEndTime: batch.tryoutEndTime?.toISOString() || null,
        tryoutDurationMinutes: batch.tryoutDurationMinutes || 60,
        tryoutQuestionCount: batch.tryoutQuestionCount || 20,
        tryoutSelectionMode: batch.tryoutSelectionMode || "AUTOMATIC",
        activeQuestionsAvailable,
        isLiveOpen,
        remainingMinutes,
      },
    });
  } catch (error) {
    console.error("Error fetching tryout timing:", error);
    return NextResponse.json({ error: "Gagal memuat jadwal tryout" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await params;
    const batchId = parseInt(resolved.id, 10);
    if (isNaN(batchId)) {
      return NextResponse.json({ error: "ID Batch tidak valid" }, { status: 400 });
    }

    const body = await req.json();
    const { action, durationMinutes, startTime, endTime, questionCount } = body;

    const existing = await prisma.trainingBatch.findUnique({
      where: { id: batchId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Batch tidak ditemukan" }, { status: 404 });
    }

    const now = new Date();
    let updateData: any = {};
    let message = "";

    const parsedQCount = questionCount ? parseInt(String(questionCount), 10) : undefined;
    const validQCount = parsedQCount && !isNaN(parsedQCount) && parsedQCount > 0 ? parsedQCount : undefined;

    if (action === "OPEN_NOW") {
      const dur = durationMinutes ? parseInt(String(durationMinutes), 10) : 60;
      const end = new Date(now.getTime() + dur * 60 * 1000);
      updateData = {
        tryoutOpen: true,
        tryoutStartTime: now,
        tryoutEndTime: end,
        tryoutDurationMinutes: dur,
      };
      if (validQCount) {
        updateData.tryoutQuestionCount = validQCount;
      }
      message = `Sesi ujian tryout Batch ${existing.batchNumber} berhasil dibuka selama ${dur} menit (${validQCount || existing.tryoutQuestionCount || 20} soal acak, hingga pukul ${end.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB).`;
    } else if (action === "CLOSE_NOW") {
      updateData = {
        tryoutOpen: false,
        tryoutEndTime: now, // mark expired
      };
      message = `Sesi ujian tryout Batch ${existing.batchNumber} berhasil ditutup sekarang.`;
    } else if (action === "SCHEDULE") {
      if (!startTime || !endTime) {
        return NextResponse.json(
          { error: "Waktu buka dan waktu tutup wajib diisi lengkap." },
          { status: 400 }
        );
      }
      const startD = new Date(startTime);
      const endD = new Date(endTime);
      if (endD <= startD) {
        return NextResponse.json(
          { error: "Waktu penutupan harus lebih akhir daripada waktu pembukaan." },
          { status: 400 }
        );
      }
      const dur = Math.round((endD.getTime() - startD.getTime()) / 60000);
      const isOpen = now >= startD && now <= endD;

      updateData = {
        tryoutOpen: isOpen,
        tryoutStartTime: startD,
        tryoutEndTime: endD,
        tryoutDurationMinutes: dur,
      };
      if (validQCount) {
        updateData.tryoutQuestionCount = validQCount;
      }
      message = `Jadwal ujian tryout Batch ${existing.batchNumber} berhasil disetel (${startD.toLocaleDateString("id-ID")} ${startD.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} s/d ${endD.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB, ${validQCount || existing.tryoutQuestionCount || 20} soal).`;
    } else {
      // Direct field update if any
      if (body.tryoutOpen !== undefined) updateData.tryoutOpen = Boolean(body.tryoutOpen);
      if (body.tryoutStartTime !== undefined)
        updateData.tryoutStartTime = body.tryoutStartTime ? new Date(body.tryoutStartTime) : null;
      if (body.tryoutEndTime !== undefined)
        updateData.tryoutEndTime = body.tryoutEndTime ? new Date(body.tryoutEndTime) : null;
      if (body.tryoutDurationMinutes !== undefined)
        updateData.tryoutDurationMinutes = parseInt(String(body.tryoutDurationMinutes), 10);
      if (validQCount !== undefined || body.tryoutQuestionCount !== undefined) {
        updateData.tryoutQuestionCount = validQCount || parseInt(String(body.tryoutQuestionCount), 10);
      }
      message = "Pengaturan jadwal & jumlah soal tryout berhasil diperbarui.";
    }

    const updated = await prisma.trainingBatch.update({
      where: { id: batchId },
      data: updateData,
    });

    const isLiveOpen =
      updated.tryoutOpen &&
      updated.tryoutEndTime !== null &&
      now <= updated.tryoutEndTime &&
      (updated.tryoutStartTime === null || now >= updated.tryoutStartTime);

    return NextResponse.json({
      success: true,
      message,
      batch: {
        id: updated.id,
        tryoutOpen: updated.tryoutOpen,
        tryoutStartTime: updated.tryoutStartTime?.toISOString() || null,
        tryoutEndTime: updated.tryoutEndTime?.toISOString() || null,
        tryoutDurationMinutes: updated.tryoutDurationMinutes || 60,
        tryoutQuestionCount: updated.tryoutQuestionCount || 20,
        tryoutSelectionMode: updated.tryoutSelectionMode || "AUTOMATIC",
        isLiveOpen,
      },
    });
  } catch (error) {
    console.error("Error updating tryout timing:", error);
    return NextResponse.json({ error: "Gagal memperbarui pengaturan waktu tryout" }, { status: 500 });
  }
}
