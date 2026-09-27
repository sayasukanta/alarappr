import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const CompleteProfileSchema = z.object({
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter").max(100),
  phoneNumber: z
    .string()
    .min(9, "Nomor telepon/WA minimal 9 digit")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "Nomor telepon tidak valid"),
  nik: z
    .string()
    .length(16, "NIK harus tepat 16 digit")
    .regex(/^[0-9]+$/, "NIK harus berupa angka"),
  tempat_lahir: z.string().max(191).optional().nullable(),
  tanggal_lahir: z.string().optional().nullable(),
  alamat_domisili: z.string().max(500).optional().nullable(),
  instansi: z.string().max(191).optional().nullable(),
  alamat_instansi: z.string().max(500).optional().nullable(),
  batchId: z.any().optional().nullable(),
  password: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || val.length >= 6, {
      message: "Password minimal 6 karakter",
    }),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        nik: true,
        tempat_lahir: true,
        tanggal_lahir: true,
        alamat_domisili: true,
        instansi: true,
        alamat_instansi: true,
        image: true,
        role: true,
        passwordHash: true,
        registrations: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            batch: {
              include: {
                training: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        nik: user.nik,
        tempat_lahir: user.tempat_lahir,
        tanggal_lahir: user.tanggal_lahir ? user.tanggal_lahir.toISOString() : null,
        alamat_domisili: user.alamat_domisili,
        instansi: user.instansi,
        alamat_instansi: user.alamat_instansi,
        image: user.image,
        role: user.role,
        hasPassword: !!user.passwordHash,
        isProfileComplete: !!(user.nik && user.phoneNumber),
        registrations: user.registrations,
      },
    });
  } catch (error) {
    console.error("[GET_COMPLETE_PROFILE]", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const body = await req.json();

    const parseResult = CompleteProfileSchema.safeParse(body);
    if (!parseResult.success) {
      const errors = parseResult.error.flatten().fieldErrors;
      const firstError = Object.values(errors).flat()[0] || "Data tidak valid";
      return NextResponse.json(
        { success: false, error: firstError, details: errors },
        { status: 422 }
      );
    }

    const {
      fullName,
      phoneNumber,
      nik,
      tempat_lahir,
      tanggal_lahir,
      alamat_domisili,
      instansi,
      alamat_instansi,
      batchId,
      password,
    } = parseResult.data;

    // Check if NIK already used by someone else
    const existingNik = await prisma.user.findFirst({
      where: {
        nik,
        id: { not: userId },
      },
    });

    if (existingNik) {
      return NextResponse.json(
        {
          success: false,
          error: "NIK KTP ini sudah terdaftar oleh pengguna lain.",
        },
        { status: 409 }
      );
    }

    // Hash password if provided
    let passwordHashToUpdate: string | undefined = undefined;
    if (password && password.trim().length >= 6) {
      passwordHashToUpdate = await bcrypt.hash(password.trim(), 12);
    }

    // Resolve target batch if specified
    let targetBatchId: number | null = null;
    if (batchId) {
      const numBatch = parseInt(String(batchId), 10);
      if (!isNaN(numBatch) && numBatch > 0) {
        const batch = await prisma.trainingBatch.findUnique({
          where: { id: numBatch },
        });
        if (batch) {
          targetBatchId = batch.id;
        }
      }
    }

    const parsedTanggalLahir = tanggal_lahir ? new Date(tanggal_lahir) : null;

    // Update user profile in transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim(),
          nik: nik.trim(),
          tempat_lahir: tempat_lahir?.trim() || null,
          tanggal_lahir: parsedTanggalLahir,
          alamat_domisili: alamat_domisili?.trim() || null,
          instansi: instansi?.trim() || null,
          alamat_instansi: alamat_instansi?.trim() || null,
          ...(passwordHashToUpdate ? { passwordHash: passwordHashToUpdate } : {}),
        },
      });

      // Update latest registration if exists or create if batch specified
      const existingReg = await tx.registration.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      if (existingReg) {
        await tx.registration.update({
          where: { id: existingReg.id },
          data: {
            ...(targetBatchId ? { batchId: targetBatchId } : {}),
            instansi: instansi?.trim() || existingReg.instansi,
            tempat_lahir: tempat_lahir?.trim() || existingReg.tempat_lahir,
            tanggal_lahir: parsedTanggalLahir || existingReg.tanggal_lahir,
            alamat: alamat_domisili?.trim() || existingReg.alamat,
          },
        });
      } else if (targetBatchId) {
        await tx.registration.create({
          data: {
            userId,
            batchId: targetBatchId,
            registrationStatus: "DRAFT",
            paymentStatus: "UNPAID",
            instansi: instansi?.trim() || null,
            tempat_lahir: tempat_lahir?.trim() || null,
            tanggal_lahir: parsedTanggalLahir,
            alamat: alamat_domisili?.trim() || null,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Profil peserta berhasil disimpan",
      redirectUrl: "/dashboard",
    });
  } catch (error) {
    console.error("[POST_COMPLETE_PROFILE]", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server saat menyimpan profil" },
      { status: 500 }
    );
  }
}
