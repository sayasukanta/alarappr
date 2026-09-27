import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Berkas materi wajib dipilih" }, { status: 400 });
    }

    // Limit to 50MB
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran berkas melebihi batas maksimal 50 MB" },
        { status: 400 }
      );
    }

    const allowedExts = [
      "pdf", "pptx", "ppt", "docx", "doc", "xlsx", "xls",
      "zip", "mp4", "webm", "png", "jpg", "jpeg", "webp"
    ];
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!allowedExts.includes(ext)) {
      return NextResponse.json(
        {
          error: `Format berkas .${ext} tidak didukung. Format yang diizinkan: PDF, PPTX, DOCX, XLSX, ZIP, MP4, atau Gambar.`,
        },
        { status: 400 }
      );
    }

    // Prepare upload directory
    const uploadDir = path.join(process.cwd(), "public", "uploads", "lms");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique safe file name
    const timestamp = Date.now();
    const sanitizedBase = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 50);
    const uniqueFileName = `${timestamp}_${sanitizedBase}.${ext}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Format human readable file size
    const formatBytes = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const fileUrl = `/uploads/lms/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
      fileSize: formatBytes(file.size),
      ext,
    });
  } catch (error) {
    console.error("[ADMIN_LMS_UPLOAD_POST]", error);
    return NextResponse.json({ error: "Gagal mengunggah berkas materi" }, { status: 500 });
  }
}
