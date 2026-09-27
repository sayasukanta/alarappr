import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "ID pengguna tidak valid" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { instructor: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    const body = await req.json();
    const {
      fullName,
      email,
      password,
      role,
      nik,
      phoneNumber,
      instansi,
      alamatDomisili,
      tempatLahir,
      tanggalLahir,
    } = body;

    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ error: "Nama lengkap wajib diisi" }, { status: 400 });
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate email
    if (normalizedEmail !== existingUser.email) {
      const emailConflict = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (emailConflict && emailConflict.id !== userId) {
        return NextResponse.json({ error: "Email sudah digunakan oleh akun lain" }, { status: 400 });
      }
    }

    // Check duplicate NIK if provided
    const trimmedNik = nik?.trim() || null;
    if (trimmedNik && trimmedNik !== existingUser.nik) {
      const nikConflict = await prisma.user.findUnique({
        where: { nik: trimmedNik },
      });
      if (nikConflict && nikConflict.id !== userId) {
        return NextResponse.json({ error: "NIK sudah terdaftar pada akun lain" }, { status: 400 });
      }
    }

    const updateData: any = {
      fullName: fullName.trim(),
      email: normalizedEmail,
      role: role || existingUser.role,
      nik: trimmedNik,
      phoneNumber: phoneNumber?.trim() || null,
      instansi: instansi?.trim() || null,
      alamat_domisili: alamatDomisili?.trim() || null,
      tempat_lahir: tempatLahir?.trim() || null,
      tanggal_lahir: tanggalLahir ? new Date(tanggalLahir) : null,
    };

    if (password && password.trim()) {
      updateData.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    // Handle role change to INSTRUCTOR
    if (updateData.role === "INSTRUCTOR" && !existingUser.instructor) {
      await prisma.instructor.create({
        data: {
          userId,
          specialization: "PPR_ANALISIS",
          status: "ACTIVE",
        },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        nik: updatedUser.nik,
        phoneNumber: updatedUser.phoneNumber,
        instansi: updatedUser.instansi,
        role: updatedUser.role,
        updatedAt: updatedUser.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[ADMIN_USERS_PUT]", error);
    return NextResponse.json({ error: "Gagal memperbarui data pengguna" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentAdminId = parseInt((session.user as any).id, 10);
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "ID pengguna tidak valid" }, { status: 400 });
    }

    // Prevent self-deletion
    if (userId === currentAdminId) {
      return NextResponse.json(
        { error: "Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            registrations: true,
            verifiedDocuments: true,
          },
        },
        instructor: {
          include: {
            _count: {
              select: {
                assignments: true,
              },
            },
          },
        },
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    if (existingUser._count.registrations > 0) {
      return NextResponse.json(
        {
          error: `Pengguna ini memiliki ${existingUser._count.registrations} riwayat pendaftaran pelatihan. Hapus data pendaftaran terlebih dahulu.`,
        },
        { status: 400 }
      );
    }

    if (existingUser.instructor && existingUser.instructor._count.assignments > 0) {
      return NextResponse.json(
        {
          error: `Pengguna ini memiliki ${existingUser.instructor._count.assignments} penugasan mengajar aktif. Alihkan penugasan instruktur terlebih dahulu.`,
        },
        { status: 400 }
      );
    }

    // Clean up instructor profile if any before deleting user
    if (existingUser.instructor) {
      await prisma.instructor.delete({
        where: { id: existingUser.instructor.id },
      });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true, message: "Pengguna berhasil dihapus" });
  } catch (error) {
    console.error("[ADMIN_USERS_DELETE]", error);
    return NextResponse.json({ error: "Gagal menghapus pengguna" }, { status: 500 });
  }
}
