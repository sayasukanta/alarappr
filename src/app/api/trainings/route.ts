import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const trainings = await prisma.training.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        category: true,
        title: true,
        description: true,
        price: true,
        durationDays: true,
        certBadge: true,
      },
    });

    const formatted = trainings.map((t) => {
      let label = t.title;
      let shortId: string = t.category;
      if (t.category === "PPR_ANALISIS") {
        label = "PPR Analisis";
        shortId = "PPR_ANALISIS";
      } else if (t.category === "PPR_BAGASI") {
        label = "PPR Bagasi";
        shortId = "PPR_BAGASI";
      } else if (t.category === "PKR_PEKERJA") {
        label = "PKR Pekerja Radiasi";
        shortId = "PKR";
      } else if (t.category === "PPR_PENYEGARAN") {
        label = "PPR Penyegaran";
        shortId = "PPR_PENYEGARAN";
      }

      return {
        id: shortId,
        category: t.category,
        dbId: t.id,
        label,
        title: t.title,
        price: Number(t.price),
        description: t.description || t.title,
        duration: `${t.durationDays} hari (${t.durationDays * 8} JPL)`,
        durationDays: t.durationDays,
        badge: t.certBadge || (t.category === "PKR_PEKERJA" ? "Internal" : "BAPETEN"),
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("[TRAININGS_PUBLIC_GET]", error);
    return NextResponse.json({ error: "Gagal memuat data program pelatihan" }, { status: 500 });
  }
}
