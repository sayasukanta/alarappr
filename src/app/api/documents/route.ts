import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { DocType } from "@prisma/client";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const VALID_DOC_TYPES = Object.values(DocType);

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get("registrationId");

    // Find all registrations of this user
    const registrations = await prisma.registration.findMany({
      where: session.user.role === "PESERTA" ? { userId } : (registrationId ? { id: parseInt(registrationId) } : {}),
      include: {
        batch: {
          include: {
            training: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (registrations.length === 0) {
      return NextResponse.json({
        data: [],
        registrationId: null,
        activeRegistration: null,
        registrations: [],
      });
    }

    let activeRegistration = registrations[0];
    if (registrationId) {
      const found = registrations.find((r) => r.id === parseInt(registrationId));
      if (found) {
        activeRegistration = found;
      }
    }

    const documents = await prisma.registrationDocument.findMany({
      where: { registrationId: activeRegistration.id },
      include: {
        verifier: {
          select: { fullName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      data: documents,
      registrationId: activeRegistration.id,
      activeRegistration: {
        id: activeRegistration.id,
        registrationStatus: activeRegistration.registrationStatus,
        paymentStatus: activeRegistration.paymentStatus,
        createdAt: activeRegistration.createdAt,
        batch: {
          id: activeRegistration.batch.id,
          batchNumber: activeRegistration.batch.batchNumber,
          startDate: activeRegistration.batch.startDate,
          endDate: activeRegistration.batch.endDate,
          location: activeRegistration.batch.location,
        },
        training: {
          id: activeRegistration.batch.training.id,
          title: activeRegistration.batch.training.title,
          category: activeRegistration.batch.training.category,
          certBadge: activeRegistration.batch.training.certBadge || (activeRegistration.batch.training.category === "PKR_PEKERJA" ? "Internal" : "BAPETEN"),
          durationDays: activeRegistration.batch.training.durationDays,
        },
      },
      registrations: registrations.map((r) => ({
        id: r.id,
        registrationStatus: r.registrationStatus,
        paymentStatus: r.paymentStatus,
        createdAt: r.createdAt,
        batchNumber: r.batch.batchNumber,
        startDate: r.batch.startDate,
        endDate: r.batch.endDate,
        trainingTitle: r.batch.training.title,
        trainingCategory: r.batch.training.category,
        certBadge: r.batch.training.certBadge || (r.batch.training.category === "PKR_PEKERJA" ? "Internal" : "BAPETEN"),
      })),
    });
  } catch (error) {
    console.error("[DOCUMENTS_GET]", error);
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

    const file = formData.get("file") as File | null;
    const docTypeRaw = formData.get("docType") as string | null;
    const registrationIdRaw = formData.get("registrationId") as string | null;
    const mcuIssueDate = (formData.get("mcuIssueDate") || formData.get("mcuDate")) as string | null;
    const hasDarah = formData.get("hasDarah") === "true" || formData.get("mcuDarah") === "true";
    const hasUrine = formData.get("hasUrine") === "true" || formData.get("mcuUrine") === "true";

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }
    if (!docTypeRaw || !VALID_DOC_TYPES.includes(docTypeRaw as DocType)) {
      return NextResponse.json(
        { error: "Tipe dokumen tidak valid" },
        { status: 400 }
      );
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
        { error: "Ukuran file maksimal 5MB" },
        { status: 400 }
      );
    }

    const docType = docTypeRaw as DocType;

    // Resolve registration
    let registration = null;
    if (registrationIdRaw) {
      const regId = parseInt(registrationIdRaw);
      registration = await prisma.registration.findFirst({
        where: { id: regId, ...(session.user.role === "PESERTA" ? { userId } : {}) },
      });
    } else {
      registration = await prisma.registration.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!registration) {
      // Create a draft registration if user doesn't have one yet
      const batch = await prisma.trainingBatch.findFirst({
        orderBy: { startDate: "asc" },
      });
      if (!batch) {
        return NextResponse.json(
          { error: "Belum ada jadwal pelatihan yang aktif." },
          { status: 400 }
        );
      }
      registration = await prisma.registration.create({
        data: {
          userId,
          batchId: batch.id,
          registrationStatus: "DRAFT",
          paymentStatus: "UNPAID",
        },
      });
    }

    const registrationId = registration.id;

    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "documents");
    await mkdir(uploadsDir, { recursive: true });

    const ext = file.name.split(".").pop() ?? "jpg";
    const timestamp = Date.now();
    const filename = `doc_${registrationId}_${docType}_${timestamp}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    await writeFile(filePath, buffer);

    const publicPath = `/uploads/documents/${filename}`;

    // Upsert document record (replace if same docType)
    const existingDoc = await prisma.registrationDocument.findFirst({
      where: { registrationId, docType },
    });

    let document;
    if (existingDoc) {
      document = await prisma.registrationDocument.update({
        where: { id: existingDoc.id },
        data: {
          filePath: publicPath,
          isValid: null, // reset validation to pending review
          notes: null,
          verifiedBy: null,
          verifiedAt: null,
          ...(docType === DocType.MCU && {
            mcuIssueDate: mcuIssueDate ? new Date(mcuIssueDate) : null,
            hasDarah,
            hasUrine,
          }),
        },
      });
    } else {
      document = await prisma.registrationDocument.create({
        data: {
          registrationId,
          docType,
          filePath: publicPath,
          isValid: null,
          ...(docType === DocType.MCU && {
            mcuIssueDate: mcuIssueDate ? new Date(mcuIssueDate) : null,
            hasDarah,
            hasUrine,
          }),
        },
      });
    }

    return NextResponse.json({ success: true, data: document }, { status: 201 });
  } catch (error) {
    console.error("[DOCUMENTS_POST]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
