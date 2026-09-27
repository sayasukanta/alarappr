import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);
    const formData = await request.formData();

    const file = (formData.get("bukti") ||
      formData.get("file") ||
      formData.get("proofFile")) as File | null;
    const namaPengirim = (formData.get("namaPengirim") ||
      formData.get("senderName")) as string | null;
    const tanggalBayar = (formData.get("tanggalBayar") ||
      formData.get("paymentDate")) as string | null;
    const regIdStr = formData.get("registrationId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Bukti pembayaran wajib diunggah" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan JPG, PNG, atau PDF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 10MB" },
        { status: 400 }
      );
    }

    let registration = null;
    if (regIdStr) {
      registration = await prisma.registration.findFirst({
        where: { id: parseInt(regIdStr, 10), userId },
        include: {
          user: true,
          batch: { include: { training: true } },
        },
      });
    }

    if (!registration) {
      registration = await prisma.registration.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          user: true,
          batch: { include: { training: true } },
        },
      });
    }

    if (!registration) {
      return NextResponse.json(
        { error: "Pendaftaran tidak ditemukan" },
        { status: 404 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop() ?? "jpg";
    const timestamp = Date.now();
    const filename = `payment_${registration.id}_${timestamp}.${ext}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "payments");
    const filePath = path.join(uploadsDir, filename);

    let publicPath = `/uploads/payments/${filename}`;
    try {
      await mkdir(uploadsDir, { recursive: true });
      await writeFile(filePath, buffer);
    } catch (fsErr) {
      console.warn("Filesystem read-only (serverless), saving as data URI:", fsErr);
      publicPath = `data:${file.type};base64,${buffer.toString("base64")}`;
    }

    const existingPendingPayment = await prisma.payment.findFirst({
      where: { registrationId: registration.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });

    let payment;
    if (existingPendingPayment) {
      payment = await prisma.payment.update({
        where: { id: existingPendingPayment.id },
        data: {
          proofFilePath: publicPath,
          senderName: namaPengirim || registration.user.fullName,
          paymentDate: tanggalBayar ? new Date(tanggalBayar) : new Date(),
        },
      });
    } else {
      const year = new Date().getFullYear();
      const paymentCount = await prisma.payment.count({
        where: { registrationId: registration.id },
      });
      const invoiceNumber = `INV/ALARA/${year}/${String(registration.id).padStart(4, "0")}/${paymentCount + 1}`;

      payment = await prisma.payment.create({
        data: {
          registrationId: registration.id,
          amount: registration.batch.training.price,
          proofFilePath: publicPath,
          senderName: namaPengirim || registration.user.fullName,
          paymentDate: tanggalBayar ? new Date(tanggalBayar) : new Date(),
          status: "PENDING",
          invoiceNumber,
        },
      });
    }

    await prisma.registration.update({
      where: { id: registration.id },
      data: { paymentStatus: "PENDING_VERIFICATION" },
    });

    return NextResponse.json({ success: true, payment }, { status: 201 });
  } catch (error) {
    console.error("[PEMBAYARAN_BUKTI_POST]", error);
    return NextResponse.json(
      { error: "Gagal mengunggah bukti pembayaran" },
      { status: 500 }
    );
  }
}
