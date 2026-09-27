import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createRegistrationSchema = z.object({
  batchId: z.number().int().positive(),
  sponsorName: z.string().optional(),
  sponsorNpwp: z.string().optional(),
  tempatLahir: z.string().min(2, "Tempat lahir wajib diisi"),
  tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  alamat: z.string().min(5, "Alamat wajib diisi"),
  instansi: z.string().min(2, "Instansi wajib diisi"),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const role = session.user.role;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const status = searchParams.get("status");
    const batchId = searchParams.get("batchId");

    const where: Record<string, unknown> = {};

    // PESERTA can only see their own registrations
    if (role === "PESERTA") {
      where.userId = userId;
    } else if (role === "SPONSOR") {
      // Sponsor sees registrations with their sponsor name from the company
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { fullName: true },
      });
      where.sponsorName = user?.fullName;
    }

    if (status) where.registrationStatus = status;
    if (batchId) where.batchId = parseInt(batchId);

    const [registrations, total] = await Promise.all([
      prisma.registration.findMany({
        where,
        include: {
          user: {
            select: { id: true, fullName: true, email: true, nik: true, phoneNumber: true },
          },
          batch: {
            include: { training: true },
          },
          payments: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          examResult: true,
          _count: {
            select: { documents: true, attendances: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.registration.count({ where }),
    ]);

    return NextResponse.json({
      data: registrations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[REGISTRATIONS_GET]", error);
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
    const body = await request.json();

    const parsed = createRegistrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      batchId,
      sponsorName,
      sponsorNpwp,
      tempatLahir,
      tanggalLahir,
      alamat,
      instansi,
    } = parsed.data;

    // Check batch exists and has quota
    const batch = await prisma.trainingBatch.findUnique({
      where: { id: batchId },
      include: {
        _count: { select: { registrations: true } },
      },
    });

    if (!batch) {
      return NextResponse.json(
        { error: "Batch pelatihan tidak ditemukan" },
        { status: 404 }
      );
    }

    if (batch._count.registrations >= batch.quota) {
      return NextResponse.json(
        { error: "Kuota batch sudah penuh" },
        { status: 409 }
      );
    }

    // Check if user already registered for this batch
    const existing = await prisma.registration.findFirst({
      where: { userId, batchId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Anda sudah terdaftar di batch ini" },
        { status: 409 }
      );
    }

    const registration = await prisma.registration.create({
      data: {
        userId,
        batchId,
        sponsorName,
        sponsorNpwp,
        tempat_lahir: tempatLahir,
        tanggal_lahir: new Date(tanggalLahir),
        alamat,
        instansi,
        registrationStatus: "DRAFT",
        paymentStatus: "UNPAID",
      },
      include: {
        batch: { include: { training: true } },
      },
    });

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    console.error("[REGISTRATIONS_POST]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
