import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TrainingCategory } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as TrainingCategory | null;
    const upcoming = searchParams.get("upcoming") === "true";

    const now = new Date();

    const where: any = {};

    if (upcoming) {
      where.startDate = { gte: now };
    }

    if (category) {
      where.training = { category };
    }

    const batches = await prisma.trainingBatch.findMany({
      where,
      include: {
        training: true,
        _count: {
          select: {
            registrations: {
              where: {
                registrationStatus: { not: "REJECTED" },
              },
            },
          },
        },
        instructorAssignments: {
          include: {
            instructor: {
              include: {
                user: { select: { fullName: true } },
              },
            },
          },
          orderBy: { teachingDate: "asc" },
        },
      },
      orderBy: { startDate: "asc" },
    });

    const today = new Date();

    const batchesWithAvailability = batches.map((batch) => {
      const registeredCount = batch._count.registrations;
      const availableSlots = Math.max(0, batch.quota - registeredCount);
      const isFull = registeredCount >= batch.quota;

      const batchStartDate = new Date(batch.startDate);
      const batchEndDate = new Date(batch.endDate);
      const startOfBatch = new Date(batchStartDate.getFullYear(), batchStartDate.getMonth(), batchStartDate.getDate(), 0, 0, 0, 0);
      const endOfBatch = new Date(batchEndDate.getFullYear(), batchEndDate.getMonth(), batchEndDate.getDate(), 23, 59, 59, 999);

      const isCompleted = today > endOfBatch;
      const isOngoing = !isCompleted && today >= startOfBatch;

      let status: "COMPLETED" | "ONGOING" | "FULL" | "AVAILABLE" = "AVAILABLE";
      let statusLabel = "Tersedia";
      let isSelectable = true;

      if (isCompleted) {
        status = "COMPLETED";
        statusLabel = "Selesai";
        isSelectable = false;
      } else if (isOngoing) {
        status = "ONGOING";
        statusLabel = "Sedang berlangsung";
        isSelectable = false;
      } else if (isFull) {
        status = "FULL";
        statusLabel = "Penuh";
        isSelectable = false;
      } else {
        status = "AVAILABLE";
        statusLabel = "Tersedia";
        isSelectable = true;
      }

      return {
        id: batch.id,
        batchNumber: batch.batchNumber,
        startDate: batch.startDate,
        endDate: batch.endDate,
        quota: batch.quota,
        location: batch.location,
        documentationUrl: batch.documentationUrl,
        documentationTitle: batch.documentationTitle,
        registeredCount,
        availableSlots,
        isFull,
        isOngoing,
        isCompleted,
        status,
        statusLabel,
        isSelectable,
        training: {
          id: batch.training.id,
          title: batch.training.title,
          category: batch.training.category,
          certBadge: batch.training.certBadge || (batch.training.category === "PKR_PEKERJA" ? "Internal" : "BAPETEN"),
          price: batch.training.price,
          durationDays: batch.training.durationDays,
          description: batch.training.description,
        },
      instructors: batch.instructorAssignments
        .map((a: any) => ({
          name: a.instructor.user.fullName,
          sessionName: a.sessionName,
          teachingDate: a.teachingDate,
          sessionType: a.sessionType,
        }))
        .filter(
          (v: any, i: number, arr: any[]) =>
            arr.findIndex((x: any) => x.name === v.name) === i
        ),
    };
  });

    return NextResponse.json(batchesWithAvailability);
  } catch (error) {
    console.error("[BATCHES_GET]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
