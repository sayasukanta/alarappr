import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import existsSync from "fs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const registrationIdStr = formData.get("registrationId") as string;
    const file = formData.get("file") as File | null;

    if (!registrationIdStr) {
      return NextResponse.json({ error: "ID pendaftaran wajib diisi" }, { status: 400 });
    }

    const registrationId = parseInt(registrationIdStr, 10);
    if (isNaN(registrationId)) {
      return NextResponse.json({ error: "ID pendaftaran tidak valid" }, { status: 400 });
    }

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Berkas sertifikat wajib diunggah" }, { status: 400 });
    }

    // Validate size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran berkas melebihi batas maksimal 20 MB" }, { status: 400 });
    }

    // Validate extension
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const allowedExts = ["pdf", "jpg", "jpeg", "png"];
    if (!allowedExts.includes(ext)) {
      return NextResponse.json(
        { error: "Format berkas tidak didukung. Harap unggah berkas PDF atau gambar (JPG, PNG)." },
        { status: 400 }
      );
    }

    // Check registration
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        batch: {
          include: {
            training: true,
          },
        },
        examResult: true,
      },
    });

    if (!registration) {
      return NextResponse.json({ error: "Data pendaftaran tidak ditemukan" }, { status: 404 });
    }

    // Save file to public/uploads/certificates
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "certificates");
    await mkdir(uploadsDir, { recursive: true });

    const filename = `signed_cert_${registrationId}_${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    // If existing signed file, delete old file to save space
    if (registration.examResult?.signedCertificateUrl?.startsWith("/uploads/certificates/")) {
      try {
        const oldFile = path.join(process.cwd(), "public", registration.examResult.signedCertificateUrl);
        await unlink(oldFile);
      } catch (err) {
        // ignore if not found
      }
    }

    await writeFile(filePath, buffer);
    const publicPath = `/uploads/certificates/${filename}`;

    // Ensure certificate number exists
    let certNumber = registration.examResult?.certificateNumber;
    if (!certNumber) {
      const year = new Date().getFullYear();
      const code =
        registration.batch.training.category === "PPR_ANALISIS"
          ? "PPRA"
          : registration.batch.training.category === "PPR_BAGASI"
          ? "PPRB"
          : "PKR";
      const batchNum = String(registration.batch.batchNumber).padStart(3, "0");
      const seq = String(registrationId).padStart(3, "0");
      certNumber = `CERT/ALARA/${code}/${year}/B${batchNum}/${seq}`;
    }

    const activeSignatory = await prisma.certificateSignatory.findFirst({
      where: { isActive: true },
    });

    const updatedExamResult = await prisma.examResult.upsert({
      where: { registrationId },
      update: {
        signedCertificateUrl: publicPath,
        signedCertificateName: file.name,
        signedUploadedAt: new Date(),
        finalStatus: "LULUS",
        certificateNumber: certNumber,
        signatoryId: registration.examResult?.signatoryId || activeSignatory?.id || null,
        issuedAt: registration.examResult?.issuedAt || new Date(),
      },
      create: {
        registrationId,
        signedCertificateUrl: publicPath,
        signedCertificateName: file.name,
        signedUploadedAt: new Date(),
        finalStatus: "LULUS",
        certificateNumber: certNumber,
        signatoryId: activeSignatory?.id || null,
        issuedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Berkas sertifikat bertandatangan basah berhasil diunggah.",
      data: {
        registrationId,
        signedCertificateUrl: updatedExamResult.signedCertificateUrl,
        signedCertificateName: updatedExamResult.signedCertificateName,
        signedUploadedAt: updatedExamResult.signedUploadedAt,
        certificateNumber: updatedExamResult.certificateNumber,
      },
    });
  } catch (error) {
    console.error("[UPLOAD_SIGNED_CERT_ERROR]", error);
    return NextResponse.json(
      { error: "Gagal mengunggah berkas sertifikat bertandatangan basah" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const registrationIdStr = searchParams.get("registrationId");
    if (!registrationIdStr) {
      return NextResponse.json({ error: "ID pendaftaran wajib diisi" }, { status: 400 });
    }

    const registrationId = parseInt(registrationIdStr, 10);
    if (isNaN(registrationId)) {
      return NextResponse.json({ error: "ID pendaftaran tidak valid" }, { status: 400 });
    }

    const examResult = await prisma.examResult.findUnique({
      where: { registrationId },
    });

    if (!examResult) {
      return NextResponse.json({ error: "Hasil ujian tidak ditemukan" }, { status: 404 });
    }

    if (examResult.signedCertificateUrl?.startsWith("/uploads/certificates/")) {
      try {
        const filePath = path.join(process.cwd(), "public", examResult.signedCertificateUrl);
        await unlink(filePath);
      } catch (err) {
        // ignore
      }
    }

    await prisma.examResult.update({
      where: { registrationId },
      data: {
        signedCertificateUrl: null,
        signedCertificateName: null,
        signedUploadedAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Berkas sertifikat bertandatangan basah berhasil dihapus.",
    });
  } catch (error) {
    console.error("[DELETE_SIGNED_CERT_ERROR]", error);
    return NextResponse.json(
      { error: "Gagal menghapus berkas sertifikat" },
      { status: 500 }
    );
  }
}
