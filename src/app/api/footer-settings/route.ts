import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_FOOTER_SETTINGS } from "@/lib/footer-constants";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let setting = await prisma.footerSetting.findFirst();

    if (!setting) {
      setting = await prisma.footerSetting.create({
        data: DEFAULT_FOOTER_SETTINGS,
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: setting,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("[FOOTER_SETTINGS_GET]", error);
    return NextResponse.json({
      success: true,
      data: DEFAULT_FOOTER_SETTINGS,
    });
  }
}
