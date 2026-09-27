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
    const instructorId = parseInt(resolvedParams.id, 10);
    if (isNaN(instructorId)) {
      return NextResponse.json({ error: "ID instruktur tidak valid" }, { status: 400 });
    }

    const existingInstructor = await prisma.instructor.findUnique({
      where: { id: instructorId },
      include: { user: true },
    });

    if (!existingInstructor) {
      return NextResponse.json({ error: "Data instruktur tidak ditemukan" }, { status: 404 });
    }

    const body = await req.json();
    const {
      fullName,
      email,
      phoneNumber,
      password,
      bapetenLicenseNo,
      licenseExpiryDate,
      iaeaCertification,
      specialization,
      status,
      bioSummary,
    } = body;

    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ error: "Nama lengkap wajib diisi" }, { status: 400 });
    }

    // Check if new email conflicts with another user
    const normalizedEmail = email ? email.toLowerCase().trim() : existingInstructor.user.email;
    if (normalizedEmail !== existingInstructor.user.email) {
      const emailConflict = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (emailConflict && emailConflict.id !== existingInstructor.userId) {
        return NextResponse.json(
          { error: "Email sudah digunakan oleh akun lain" },
          { status: 400 }
        );
      }
    }

    // Update user data
    const userDataToUpdate: any = {
      fullName: fullName.trim(),
      email: normalizedEmail,
      phoneNumber: phoneNumber?.trim() || null,
    };
    if (password && password.trim()) {
      userDataToUpdate.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const [updatedUser, updatedInstructor] = await prisma.$transaction([
      prisma.user.update({
        where: { id: existingInstructor.userId },
        data: userDataToUpdate,
      }),
      prisma.instructor.update({
        where: { id: instructorId },
        data: {
          bapetenLicenseNo: bapetenLicenseNo?.trim() || null,
          licenseExpiryDate: licenseExpiryDate ? new Date(licenseExpiryDate) : null,
          iaeaCertification: Boolean(iaeaCertification),
          specialization: specialization || existingInstructor.specialization,
          status: status || existingInstructor.status,
          bioSummary: bioSummary?.trim() || null,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        id: updatedInstructor.id,
        userId: updatedInstructor.userId,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        bapetenLicenseNo: updatedInstructor.bapetenLicenseNo,
        licenseExpiryDate: updatedInstructor.licenseExpiryDate?.toISOString() || null,
        iaeaCertification: updatedInstructor.iaeaCertification,
        specialization: updatedInstructor.specialization,
        status: updatedInstructor.status,
        bioSummary: updatedInstructor.bioSummary,
      },
    });
  } catch (error) {
    console.error("[ADMIN_INSTRUCTORS_PUT]", error);
    return NextResponse.json({ error: "Gagal memperbarui data instruktur" }, { status: 500 });
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

    const resolvedParams = await params;
    const instructorId = parseInt(resolvedParams.id, 10);
    if (isNaN(instructorId)) {
      return NextResponse.json({ error: "ID instruktur tidak valid" }, { status: 400 });
    }

    const existingInstructor = await prisma.instructor.findUnique({
      where: { id: instructorId },
      include: {
        _count: {
          select: {
            assignments: true,
            evaluations: true,
          },
        },
      },
    });

    if (!existingInstructor) {
      return NextResponse.json({ error: "Data instruktur tidak ditemukan" }, { status: 404 });
    }

    if (existingInstructor._count.assignments > 0) {
      return NextResponse.json(
        {
          error: `Tidak dapat menghapus instruktur ini karena memiliki ${existingInstructor._count.assignments} penugasan sesi pelatihan aktif. Silakan hapus atau alihkan penugasan terlebih dahulu.`,
        },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.instructor.delete({
        where: { id: instructorId },
      }),
      // Set user role back to PESERTA if they no longer instruct
      prisma.user.update({
        where: { id: existingInstructor.userId },
        data: { role: "PESERTA" },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Instruktur berhasil dihapus" });
  } catch (error) {
    console.error("[ADMIN_INSTRUCTORS_DELETE]", error);
    return NextResponse.json({ error: "Gagal menghapus instruktur" }, { status: 500 });
  }
}
