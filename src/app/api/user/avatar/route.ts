import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");
    let userId: number | null = null;

    if (idParam) {
      userId = parseInt(idParam, 10);
    } else {
      const session = await auth();
      if (session?.user?.id) {
        userId = parseInt(session.user.id, 10);
      }
    }

    if (!userId || isNaN(userId)) {
      return new NextResponse("User ID tidak valid", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });

    if (!user || !user.image) {
      return new NextResponse("Foto profil tidak ditemukan", { status: 404 });
    }

    // Jika tersimpan sebagai Base64 Data URL (serverless fallback)
    if (user.image.startsWith("data:")) {
      const match = user.image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const buffer = Buffer.from(match[2], "base64");
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": mimeType,
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
          },
        });
      }
    }

    // Jika berupa URL eksternal (misal Google photo) atau path lokal
    return NextResponse.redirect(new URL(user.image, request.url));
  } catch (error) {
    console.error("[USER_AVATAR_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "File foto tidak ditemukan" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan JPG atau PNG." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file foto maksimal 4MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let storedValue = "";
    let returnUrl = "";

    try {
      // 1. Coba simpan ke filesystem lokal (berjalan saat local development)
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
      await mkdir(uploadsDir, { recursive: true });

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filename = `avatar-${userId}-${Date.now()}.${ext}`;
      const filePath = path.join(uploadsDir, filename);

      await writeFile(filePath, buffer);
      storedValue = `/uploads/avatars/${filename}`;
      returnUrl = storedValue;
    } catch (fsErr) {
      // 2. Fallback untuk serverless / read-only filesystem (misal di Vercel)
      console.warn("[USER_AVATAR] Filesystem read-only, using base64 DB storage:", (fsErr as any)?.message);
      const mime = file.type || "image/jpeg";
      storedValue = `data:${mime};base64,${buffer.toString("base64")}`;
      returnUrl = `/api/user/avatar?id=${userId}&t=${Date.now()}`;
    }

    // Update user image in database
    await prisma.user.update({
      where: { id: userId },
      data: { image: storedValue },
    });

    return NextResponse.json({
      success: true,
      image: returnUrl,
      message: "Foto profil resmi berhasil diperbarui",
    });
  } catch (error) {
    console.error("[USER_AVATAR_POST]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat mengunggah foto" },
      { status: 500 }
    );
  }
}
