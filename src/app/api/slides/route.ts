import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const slides = await prisma.slide.findMany({
      where: {
        isTampil: 1,
      },
      orderBy: [
        { orderIndex: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({
      success: true,
      data: slides,
    });
  } catch (error) {
    console.error("[PUBLIC_SLIDES_GET]", error);
    return NextResponse.json(
      { error: "Gagal memuat data slide" },
      { status: 500 }
    );
  }
}
