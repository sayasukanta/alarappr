import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------
const RegisterSchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter').max(100),
  email: z.string().email('Format email tidak valid'),
  phoneNumber: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() !== '' ? val.trim() : null)),
  nik: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() !== '' ? val.trim() : null)),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  batchId: z.any().optional().nullable(),
  programId: z.any().optional().nullable(),
});

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Normalize field names
    const dataToValidate = {
      fullName: (body.fullName || body.name || '').trim(),
      email: (body.email || '').trim().toLowerCase(),
      phoneNumber: body.phoneNumber || body.phone || null,
      nik: body.nik || null,
      password: body.password || '',
      batchId: body.batchId || null,
      programId: body.programId || null,
    };

    const parseResult = RegisterSchema.safeParse(dataToValidate);

    if (!parseResult.success) {
      const errors = parseResult.error.flatten().fieldErrors;
      const firstErrorMessage =
        Object.values(errors).flat()[0] || 'Validasi data registrasi gagal.';
      return NextResponse.json(
        {
          success: false,
          error: firstErrorMessage,
          message: firstErrorMessage,
          details: errors,
        },
        { status: 422 }
      );
    }

    const { fullName, email, phoneNumber, nik, password, batchId, programId } =
      parseResult.data;

    // Check email uniqueness
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.',
          message: 'Email sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.',
        },
        { status: 409 }
      );
    }

    // Check NIK uniqueness if provided
    if (nik) {
      const existingNik = await prisma.user.findUnique({
        where: { nik },
      });
      if (existingNik) {
        return NextResponse.json(
          {
            success: false,
            error: 'NIK KTP ini sudah terdaftar dalam sistem ALARA.',
            message: 'NIK KTP ini sudah terdaftar dalam sistem ALARA.',
          },
          { status: 409 }
        );
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Resolve target batch if specified
    let targetBatchId: number | null = null;

    if (batchId) {
      const numericBatch = parseInt(String(batchId), 10);
      if (!isNaN(numericBatch) && numericBatch > 0) {
        const found = await prisma.trainingBatch.findUnique({
          where: { id: numericBatch },
        });
        if (found) targetBatchId = found.id;
      }
    }

    // Fallback: if programId provided but batchId was string like 'batch-001' or 'ppr-analisis'
    if (!targetBatchId && programId) {
      const progStr = String(programId).toUpperCase();
      let categoryMatch: any = null;
      if (progStr.includes('ANALISIS')) categoryMatch = 'PPR_ANALISIS';
      else if (progStr.includes('BAGASI')) categoryMatch = 'PPR_BAGASI';
      else if (progStr.includes('PKR') || progStr.includes('PEKERJA'))
        categoryMatch = 'PKR_PEKERJA';

      if (categoryMatch) {
        const batch = await prisma.trainingBatch.findFirst({
          where: { training: { category: categoryMatch } },
          orderBy: { startDate: 'asc' },
        });
        if (batch) targetBatchId = batch.id;
      }
    }

    // If still no batch found but batchId was requested, pick batch 1 as default
    if (!targetBatchId && batchId) {
      const firstBatch = await prisma.trainingBatch.findFirst();
      if (firstBatch) targetBatchId = firstBatch.id;
    }

    // Create user and registration in transaction
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          fullName,
          email,
          phoneNumber,
          nik,
          passwordHash,
          role: 'PESERTA',
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      if (targetBatchId) {
        await tx.registration.create({
          data: {
            userId: newUser.id,
            batchId: targetBatchId,
            registrationStatus: 'DRAFT',
            paymentStatus: 'UNPAID',
          },
        });
      }

      return newUser;
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Registrasi berhasil. Akun Anda telah aktif.',
        user: result,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[REGISTER_ERROR]', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          error: 'Email atau NIK sudah terdaftar.',
          message: 'Email atau NIK sudah terdaftar.',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Terjadi kesalahan pada server. Silakan coba lagi.',
        message: error.message || 'Terjadi kesalahan pada server. Silakan coba lagi.',
      },
      { status: 500 }
    );
  }
}
