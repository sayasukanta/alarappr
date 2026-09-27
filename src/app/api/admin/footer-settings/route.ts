import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_FOOTER_SETTINGS } from "@/lib/footer-constants";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let setting = await prisma.footerSetting.findFirst();
    if (!setting) {
      setting = await prisma.footerSetting.create({
        data: DEFAULT_FOOTER_SETTINGS,
      });
    }

    return NextResponse.json({
      success: true,
      data: setting,
    });
  } catch (error) {
    console.error("[ADMIN_FOOTER_SETTINGS_GET]", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pengaturan footer" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    let setting = await prisma.footerSetting.findFirst();

    // Reset to defaults
    if (body.action === "reset_default") {
      if (setting) {
        setting = await prisma.footerSetting.update({
          where: { id: setting.id },
          data: {
            ...DEFAULT_FOOTER_SETTINGS,
            updatedAt: new Date(),
          },
        });
      } else {
        setting = await prisma.footerSetting.create({
          data: DEFAULT_FOOTER_SETTINGS,
        });
      }

      revalidatePath("/");
      revalidatePath("/pengaturan/footer");

      return NextResponse.json({
        success: true,
        message: "Pengaturan footer berhasil direset ke standar sistem.",
        data: setting,
      });
    }

    // Normal update
    const updateData = {
      phone: typeof body.phone === "string" ? body.phone.trim() : undefined,
      email: typeof body.email === "string" ? body.email.trim() : undefined,
      address: typeof body.address === "string" ? body.address.trim() : undefined,
      mapUrl: typeof body.mapUrl === "string" ? body.mapUrl.trim() : null,

      brandTitle: typeof body.brandTitle === "string" ? body.brandTitle.trim() : undefined,
      brandSubtitle: typeof body.brandSubtitle === "string" ? body.brandSubtitle.trim() : undefined,
      brandDescription: typeof body.brandDescription === "string" ? body.brandDescription.trim() : undefined,

      institutionName: typeof body.institutionName === "string" ? body.institutionName.trim() : undefined,
      ktunNumber: typeof body.ktunNumber === "string" ? body.ktunNumber.trim() : undefined,
      bankName: typeof body.bankName === "string" ? body.bankName.trim() : undefined,
      bankAccountName: typeof body.bankAccountName === "string" ? body.bankAccountName.trim() : undefined,

      copyrightText: typeof body.copyrightText === "string" ? body.copyrightText.trim() : undefined,
      footerKtunText: typeof body.footerKtunText === "string" ? body.footerKtunText.trim() : undefined,
    };

    if (setting) {
      setting = await prisma.footerSetting.update({
        where: { id: setting.id },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });
    } else {
      setting = await prisma.footerSetting.create({
        data: {
          ...DEFAULT_FOOTER_SETTINGS,
          ...updateData,
        },
      });
    }

    revalidatePath("/");
    revalidatePath("/pengaturan/footer");

    return NextResponse.json({
      success: true,
      message: "Pengaturan footer dan informasi kontak berhasil diperbarui.",
      data: setting,
    });
  } catch (error) {
    console.error("[ADMIN_FOOTER_SETTINGS_PUT]", error);
    return NextResponse.json(
      { error: "Gagal memperbarui pengaturan footer" },
      { status: 500 }
    );
  }
}
