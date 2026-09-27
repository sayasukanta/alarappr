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

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get("registrationId");

    const registrationWhere: Record<string, unknown> = {};
    if (registrationId) {
      registrationWhere.id = parseInt(registrationId);
    }
    if (session.user.role === "PESERTA") {
      registrationWhere.userId = userId;
    }

    const registration = await prisma.registration.findFirst({
      where: registrationWhere,
      select: { id: true },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Pendaftaran tidak ditemukan" },
        { status: 404 }
      );
    }

    const payments = await prisma.payment.findMany({
      where: { registrationId: registration.id },
      orderBy: { createdAt: "desc" },
    });

    // Bank info for reference
    const bankInfo = {
      bankName: "Bank Mandiri",
      accountNumber: "166-00-0733926-0",
      accountName: "CV Hikmat Proteksi ALARA",
    };

    return NextResponse.json({ data: payments, bankInfo });
  } catch (error) {
    console.error("[PAYMENTS_GET]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const formData = await request.formData();

    const file = formData.get("proofFile") as File | null;
    const registrationIdRaw = formData.get("registrationId") as string | null;
    const amount = formData.get("amount") as string | null;
    const senderName = formData.get("senderName") as string | null;
    const paymentDate = formData.get("paymentDate") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Bukti pembayaran wajib diunggah" },
        { status: 400 }
      );
    }
    if (!registrationIdRaw) {
      return NextResponse.json(
        { error: "ID pendaftaran wajib diisi" },
        { status: 400 }
      );
    }
    if (!amount || isNaN(parseFloat(amount))) {
      return NextResponse.json({ error: "Jumlah pembayaran tidak valid" }, { status: 400 });
    }

    // Validate file
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

    const registrationId = parseInt(registrationIdRaw);

    // Verify registration ownership
    const registration = await prisma.registration.findFirst({
      where: { id: registrationId, userId },
      include: { batch: { include: { training: true } } },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Pendaftaran tidak ditemukan atau akses ditolak" },
        { status: 404 }
      );
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "payments");
    await mkdir(uploadsDir, { recursive: true });

    const ext = file.name.split(".").pop() ?? "jpg";
    const timestamp = Date.now();
    const filename = `payment_${registrationId}_${timestamp}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    await writeFile(filePath, buffer);
    const publicPath = `/uploads/payments/${filename}`;

    // Generate invoice number
    const year = new Date().getFullYear();
    const paymentCount = await prisma.payment.count({
      where: { registrationId },
    });
    const invoiceNumber = `INV/ALARA/${year}/${String(registrationId).padStart(4, "0")}/${paymentCount + 1}`;

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        registrationId,
        amount: parseFloat(amount),
        proofFilePath: publicPath,
        senderName,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        status: "PENDING",
        invoiceNumber,
      },
    });

    // Update registration payment status to pending verification
    await prisma.registration.update({
      where: { id: registrationId },
      data: { paymentStatus: "PENDING_VERIFICATION" },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("[PAYMENTS_POST]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
