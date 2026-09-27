import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
        instructor: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = users.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      nik: u.nik,
      phoneNumber: u.phoneNumber,
      instansi: u.instansi,
      alamatInstansi: u.alamat_instansi,
      tempatLahir: u.tempat_lahir,
      tanggalLahir: u.tanggal_lahir ? u.tanggal_lahir.toISOString() : null,
      alamatDomisili: u.alamat_domisili,
      role: u.role,
      image: u.image,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
      registrationsCount: u._count.registrations,
      hasInstructorProfile: !!u.instructor,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[ADMIN_USERS_GET]", error);
    return NextResponse.json(
      { error: "Gagal memuat data pengguna" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      return NextResponse.json({ error: "Nama lengkap pengguna wajib diisi" }, { status: 400 });
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email pengguna wajib diisi" }, { status: 400 });
    }

    if (!password || !password.trim()) {
      return NextResponse.json({ error: "Password akun wajib diisi" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate email
    const existingEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingEmail) {
      return NextResponse.json({ error: "Email sudah digunakan oleh akun lain" }, { status: 400 });
    }

    // Check duplicate NIK if provided
    const trimmedNik = nik?.trim() || null;
    if (trimmedNik) {
      const existingNik = await prisma.user.findUnique({
        where: { nik: trimmedNik },
      });
      if (existingNik) {
        return NextResponse.json({ error: "NIK sudah terdaftar pada akun lain" }, { status: 400 });
      }
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const newUser = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        passwordHash: hashedPassword,
        role: role || "PESERTA",
        nik: trimmedNik,
        phoneNumber: phoneNumber?.trim() || null,
        instansi: instansi?.trim() || null,
        alamat_domisili: alamatDomisili?.trim() || null,
        tempat_lahir: tempatLahir?.trim() || null,
        tanggal_lahir: tanggalLahir ? new Date(tanggalLahir) : null,
      },
    });

    // If role is INSTRUCTOR, create empty/default instructor profile if none exists
    if (newUser.role === "INSTRUCTOR") {
      await prisma.instructor.create({
        data: {
          userId: newUser.id,
          specialization: "PPR_ANALISIS",
          status: "ACTIVE",
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          nik: newUser.nik,
          phoneNumber: newUser.phoneNumber,
          instansi: newUser.instansi,
          role: newUser.role,
          createdAt: newUser.createdAt.toISOString(),
          registrationsCount: 0,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ADMIN_USERS_POST]", error);
    return NextResponse.json({ error: "Gagal membuat pengguna baru" }, { status: 500 });
  }
}
