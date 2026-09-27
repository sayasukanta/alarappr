import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_USER_MENUS = [
  {
    menuKey: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    iconName: "LayoutDashboard",
    isVisible: true,
    orderIndex: 1,
    description: "Ringkasan status pendaftaran, pelatihan aktif, pengumuman, dan pintasan utama peserta.",
  },
  {
    menuKey: "pendaftaran",
    label: "Pendaftaran",
    href: "/pendaftaran",
    iconName: "ClipboardList",
    isVisible: true,
    orderIndex: 2,
    description: "Formulir pendaftaran pelatihan baru, pemilihan jadwal angkatan, dan biodata peserta.",
  },
  {
    menuKey: "dokumen",
    label: "Dokumen",
    href: "/dokumen",
    iconName: "FileText",
    isVisible: true,
    orderIndex: 3,
    description: "Unggah dan verifikasi berkas persyaratan (Ijazah, Surat Kerja, MCU Bebas Narkoba, Pasfoto, KTP).",
  },
  {
    menuKey: "pembayaran",
    label: "Pembayaran",
    href: "/pembayaran",
    iconName: "CreditCard",
    isVisible: true,
    orderIndex: 4,
    description: "Informasi rekening tagihan, unggah bukti transfer pembayaran pelatihan, dan status verifikasi bendahara.",
  },
  {
    menuKey: "lms",
    label: "LMS / Modul",
    href: "/lms",
    iconName: "BookOpen",
    isVisible: true,
    orderIndex: 5,
    description: "Materi pembelajaran harian, silabus BAPETEN, modul bacaan, video tutorial, dan unduhan bahan ajar.",
  },
  {
    menuKey: "presensi",
    label: "Presensi",
    href: "/presensi",
    iconName: "CalendarCheck",
    isVisible: true,
    orderIndex: 6,
    description: "Absensi kehadiran harian sesi pagi dan siang disertai verifikasi swafoto (selfie) dan lokasi GPS.",
  },
  {
    menuKey: "tryout",
    label: "Tryout",
    href: "/tryout",
    iconName: "MonitorCheck",
    isVisible: true,
    orderIndex: 7,
    description: "Simulasi ujian daring dengan sistem batas waktu otomatis dan bank soal standar evaluasi BAPETEN.",
  },
  {
    menuKey: "logbook",
    label: "Logbook",
    href: "/logbook",
    iconName: "BookMarked",
    isVisible: true,
    orderIndex: 8,
    description: "Pencatatan aktivitas praktikum lapangan, pemantauan laju dosis radiasi, dan persetujuan instruktur.",
  },
  {
    menuKey: "sertifikat",
    label: "Sertifikat",
    href: "/sertifikat",
    iconName: "Award",
    isVisible: true,
    orderIndex: 9,
    description: "Penerbitan dan pengunduhan sertifikat resmi pelatihan, transkrip unit kompetensi, dan verifikasi QR code.",
  },
];

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let menus = await prisma.userMenuSetting.findMany({
      orderBy: { orderIndex: "asc" },
    });

    // If empty or missing some default keys, ensure all default keys exist
    if (menus.length === 0) {
      for (const item of DEFAULT_USER_MENUS) {
        await prisma.userMenuSetting.create({
          data: item,
        });
      }
      menus = await prisma.userMenuSetting.findMany({
        orderBy: { orderIndex: "asc" },
      });
    } else if (menus.length < DEFAULT_USER_MENUS.length) {
      const existingKeys = new Set(menus.map((m) => m.menuKey));
      for (const item of DEFAULT_USER_MENUS) {
        if (!existingKeys.has(item.menuKey)) {
          await prisma.userMenuSetting.create({
            data: item,
          });
        }
      }
      menus = await prisma.userMenuSetting.findMany({
        orderBy: { orderIndex: "asc" },
      });
    }

    const totalCount = menus.length;
    const visibleCount = menus.filter((m) => m.isVisible).length;
    const hiddenCount = totalCount - visibleCount;

    return NextResponse.json({
      menus,
      metrics: {
        totalCount,
        visibleCount,
        hiddenCount,
      },
    });
  } catch (error) {
    console.error("[ADMIN_MENU_SETTINGS_GET]", error);
    return NextResponse.json({ error: "Gagal mengambil pengaturan menu pengguna" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Action 1: Reset All to Visible (Default)
    if (body.action === "reset_all") {
      await prisma.userMenuSetting.updateMany({
        data: { isVisible: true },
      });

      const updated = await prisma.userMenuSetting.findMany({
        orderBy: { orderIndex: "asc" },
      });

      return NextResponse.json({
        success: true,
        message: "Semua menu pengguna berhasil diatur tampil (default)",
        menus: updated,
      });
    }

    // Action 2: Update single menu
    if (body.menuKey && typeof body.isVisible === "boolean") {
      const updated = await prisma.userMenuSetting.update({
        where: { menuKey: body.menuKey },
        data: { isVisible: body.isVisible },
      });

      return NextResponse.json({
        success: true,
        message: `Menu "${updated.label}" berhasil ${updated.isVisible ? "ditampilkan" : "disembunyikan"}`,
        menu: updated,
      });
    }

    // Action 3: Batch update by array of items
    if (Array.isArray(body.items)) {
      for (const item of body.items) {
        if (item.menuKey && typeof item.isVisible === "boolean") {
          await prisma.userMenuSetting.update({
            where: { menuKey: item.menuKey },
            data: { isVisible: item.isVisible },
          });
        }
      }

      const updated = await prisma.userMenuSetting.findMany({
        orderBy: { orderIndex: "asc" },
      });

      return NextResponse.json({
        success: true,
        message: "Pengaturan menu berhasil disimpan",
        menus: updated,
      });
    }

    return NextResponse.json({ error: "Format permintaan tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("[ADMIN_MENU_SETTINGS_PUT]", error);
    return NextResponse.json({ error: "Gagal memperbarui pengaturan menu" }, { status: 500 });
  }
}
