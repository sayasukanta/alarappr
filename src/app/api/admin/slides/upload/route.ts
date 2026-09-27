import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Berkas gambar slide wajib dipilih" }, { status: 400 });
    }

    // Limit to 20MB
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran berkas gambar melebihi batas maksimal 20 MB" },
        { status: 400 }
      );
    }

    const allowedExts = ["png", "jpg", "jpeg", "webp", "gif", "svg"];
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!allowedExts.includes(ext)) {
      return NextResponse.json(
        {
          error: `Format berkas .${ext} tidak didukung. Format yang diizinkan: PNG, JPG, JPEG, WEBP, GIF, SVG.`,
        },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", "slides");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique safe file name
    const timestamp = Date.now();
    const sanitizedBase = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);
    const uniqueFileName = `slide_${timestamp}_${sanitizedBase}.${ext}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/slides/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
      ext,
    });
  } catch (error) {
    console.error("[ADMIN_SLIDE_UPLOAD_POST]", error);
    return NextResponse.json({ error: "Gagal mengunggah berkas gambar slide" }, { status: 500 });
  }
}
