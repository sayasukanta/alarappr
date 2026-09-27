import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const menus = await prisma.userMenuSetting.findMany({
      select: {
        menuKey: true,
        href: true,
        isVisible: true,
      },
    });

    const visibilityMap: Record<string, boolean> = {};
    for (const m of menus) {
      visibilityMap[m.href] = m.isVisible;
    }

    return NextResponse.json({
      visibilityMap,
      menus,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("[MENU_SETTINGS_GET]", error);
    // Fallback: empty map which means all visible by default
    return NextResponse.json({ visibilityMap: {}, menus: [] });
  }
}
