import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { DocType } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Sesi Anda telah berakhir. Silakan login kembali." },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id, 10);
    const formData = await request.formData();

    const programId = formData.get("programId") as string | null;
    const batchIdRaw = formData.get("batchId") as string | null;
    const nik = formData.get("nik") as string | null;
    const tempatLahir = formData.get("tempatLahir") as string | null;
    const tanggalLahir = formData.get("tanggalLahir") as string | null;
    const alamat = formData.get("alamat") as string | null;
    const instansi = formData.get("instansi") as string | null;
    const namaSponsor = formData.get("namaSponsor") as string | null;
    const npwpSponsor = formData.get("npwpSponsor") as string | null;
    const noHp = formData.get("noHp") as string | null;

    // Resolve target training batch
    let batchId: number | null = null;
    if (batchIdRaw) {
      const parsedNum = parseInt(batchIdRaw, 10);
      if (!isNaN(parsedNum) && parsedNum > 0) {
        batchId = parsedNum;
      }
    }

    if (!batchId && programId) {
      let cat: any = "PPR_ANALISIS";
      if (programId.includes("BAGASI")) cat = "PPR_BAGASI";
      else if (programId.includes("PKR")) cat = "PKR_PEKERJA";

      const foundBatch = await prisma.trainingBatch.findFirst({
        where: { training: { category: cat } },
        orderBy: { startDate: "asc" },
      });
      if (foundBatch) batchId = foundBatch.id;
    }

    if (!batchId) {
      const fallbackBatch = await prisma.trainingBatch.findFirst();
      if (fallbackBatch) batchId = fallbackBatch.id;
    }

    if (!batchId) {
      return NextResponse.json(
        { success: false, message: "Tidak ada jadwal batch pelatihan yang tersedia saat ini." },
        { status: 400 }
      );
    }

    // Verify batch exists and check quota availability
    const targetBatch = await prisma.trainingBatch.findUnique({
      where: { id: batchId },
      include: {
        _count: {
          select: {
            registrations: {
              where: {
                registrationStatus: { not: "REJECTED" },
              },
            },
          },
        },
      },
    });

    if (!targetBatch) {
      return NextResponse.json(
        { success: false, message: "Jadwal batch pelatihan tidak ditemukan." },
        { status: 400 }
      );
    }

    // Check if batch is completed or ongoing
    const today = new Date();
    const batchStartDate = new Date(targetBatch.startDate);
    const batchEndDate = new Date(targetBatch.endDate);
    const startOfBatch = new Date(batchStartDate.getFullYear(), batchStartDate.getMonth(), batchStartDate.getDate(), 0, 0, 0, 0);
    const endOfBatch = new Date(batchEndDate.getFullYear(), batchEndDate.getMonth(), batchEndDate.getDate(), 23, 59, 59, 999);

    if (today > endOfBatch) {
      return NextResponse.json(
        {
          success: false,
          message: `Mohon maaf, jadwal Batch ${targetBatch.batchNumber} sudah selesai dilaksanakan dan tidak dapat dipilih. Silakan pilih jadwal batch berikutnya.`,
        },
        { status: 400 }
      );
    }

    if (today >= startOfBatch) {
      return NextResponse.json(
        {
          success: false,
          message: `Mohon maaf, jadwal Batch ${targetBatch.batchNumber} sedang berlangsung dan pendaftaran telah ditutup. Silakan pilih jadwal batch berikutnya.`,
        },
        { status: 400 }
      );
    }

    // Check if user is already registered for this batch
    let registration = await prisma.registration.findFirst({
      where: { userId, batchId },
    });

    // If this is a new registration, strictly check quota
    if (!registration && targetBatch._count.registrations >= targetBatch.quota) {
      return NextResponse.json(
        {
          success: false,
          message: `Mohon maaf, kuota untuk jadwal Batch ${targetBatch.batchNumber} sudah penuh (${targetBatch._count.registrations}/${targetBatch.quota} peserta). Silakan pilih jadwal batch lain yang masih tersedia.`,
        },
        { status: 400 }
      );
    }

    // Fetch current user data for fallback
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    const effectiveNik = nik || currentUser?.nik || undefined;
    const effectivePhone = noHp || currentUser?.phoneNumber || undefined;
    const effectiveTempatLahir = tempatLahir || currentUser?.tempat_lahir || "Jakarta";
    const effectiveTanggalLahir = tanggalLahir
      ? new Date(tanggalLahir)
      : currentUser?.tanggal_lahir || new Date("1995-01-01");
    const effectiveAlamat = alamat || currentUser?.alamat_domisili || "-";
    const effectiveInstansi = instansi || currentUser?.instansi || "-";

    // Update user profile if info given
    await prisma.user.update({
      where: { id: userId },
      data: {
        nik: effectiveNik,
        phoneNumber: effectivePhone,
        tempat_lahir: tempatLahir || currentUser?.tempat_lahir || undefined,
        tanggal_lahir: tanggalLahir ? new Date(tanggalLahir) : currentUser?.tanggal_lahir || undefined,
        alamat_domisili: alamat || currentUser?.alamat_domisili || undefined,
        instansi: instansi || currentUser?.instansi || undefined,
      },
    });

    if (!registration) {
      registration = await prisma.registration.create({
        data: {
          userId,
          batchId,
          tempat_lahir: effectiveTempatLahir,
          tanggal_lahir: effectiveTanggalLahir,
          alamat: effectiveAlamat,
          instansi: effectiveInstansi,
          sponsorName: namaSponsor || null,
          sponsorNpwp: npwpSponsor || null,
          registrationStatus: "MENUNGGU_VERIFIKASI",
          paymentStatus: "PENDING_VERIFICATION",
        },
      });
    } else {
      registration = await prisma.registration.update({
        where: { id: registration.id },
        data: {
          tempat_lahir: effectiveTempatLahir,
          tanggal_lahir: effectiveTanggalLahir,
          alamat: effectiveAlamat,
          instansi: effectiveInstansi,
          sponsorName: namaSponsor || registration.sponsorName,
          sponsorNpwp: npwpSponsor || registration.sponsorNpwp,
          registrationStatus: "MENUNGGU_VERIFIKASI",
        },
      });
    }

    // Prepare uploads directory
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Handle document file uploads
    const docKeys: { formKey: string; type: DocType }[] = [
      { formKey: "doc_KTP", type: "KTP" },
      { formKey: "doc_IJAZAH", type: "IJAZAH" },
      { formKey: "doc_MCU", type: "MCU" },
      { formKey: "doc_SURAT_KERJA", type: "SURAT_KERJA" },
      { formKey: "doc_PASFOTO", type: "PASFOTO" },
      { formKey: "doc_NPWP", type: "NPWP" },
    ];

    for (const item of docKeys) {
      const file = formData.get(item.formKey) as File | null;
      if (file && typeof file === "object" && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = path.extname(file.name) || ".pdf";
        const filename = `${userId}_${registration.id}_${item.type}_${Date.now()}${ext}`;
        const filePath = path.join(uploadsDir, filename);

        await fs.promises.writeFile(filePath, buffer);

        // Check if document already exists
        const existingDoc = await prisma.registrationDocument.findFirst({
          where: {
            registrationId: registration.id,
            docType: item.type,
          },
        });

        if (existingDoc) {
          await prisma.registrationDocument.update({
            where: { id: existingDoc.id },
            data: {
              filePath: `/uploads/${filename}`,
              isValid: null,
              notes: null,
            },
          });
        } else {
          await prisma.registrationDocument.create({
            data: {
              registrationId: registration.id,
              docType: item.type,
              filePath: `/uploads/${filename}`,
              isValid: null,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Pendaftaran berhasil dikirim! Silakan cek email Anda.",
      registrationId: registration.id,
    });
  } catch (error: any) {
    console.error("[PENDAFTARAN_POST]", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal mengirim pendaftaran.",
      },
      { status: 500 }
    );
  }
}
