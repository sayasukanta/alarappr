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

    const instructors = await prisma.instructor.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            role: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            assignments: true,
            evaluations: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = instructors.map((i) => ({
      id: i.id,
      userId: i.userId,
      fullName: i.user.fullName,
      email: i.user.email,
      phoneNumber: i.user.phoneNumber,
      bapetenLicenseNo: i.bapetenLicenseNo,
      licenseExpiryDate: i.licenseExpiryDate ? i.licenseExpiryDate.toISOString() : null,
      iaeaCertification: i.iaeaCertification,
      specialization: i.specialization,
      status: i.status,
      bioSummary: i.bioSummary,
      createdAt: i.createdAt.toISOString(),
      assignmentsCount: i._count.assignments,
      evaluationsCount: i._count.evaluations,
      // Backward compatibility for components expecting i.user.fullName
      user: {
        id: i.user.id,
        fullName: i.user.fullName,
        email: i.user.email,
      },
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[ADMIN_INSTRUCTORS_GET]", error);
    return NextResponse.json(
      { error: "Gagal memuat data instruktur" },
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
      return NextResponse.json({ error: "Nama lengkap instruktur wajib diisi" }, { status: 400 });
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email instruktur wajib diisi" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check existing user
    let existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { instructor: true },
    });

    if (existingUser?.instructor) {
      return NextResponse.json(
        { error: "Email ini sudah terdaftar sebagai instruktur aktif" },
        { status: 400 }
      );
    }

    let userId: number;

    if (existingUser) {
      userId = existingUser.id;
      await prisma.user.update({
        where: { id: userId },
        data: {
          fullName: fullName.trim(),
          phoneNumber: phoneNumber?.trim() || existingUser.phoneNumber,
          role: "INSTRUCTOR",
        },
      });
    } else {
      const defaultPassword = password?.trim() || "InstrukturALARA2026!";
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      const newUser = await prisma.user.create({
        data: {
          fullName: fullName.trim(),
          email: normalizedEmail,
          phoneNumber: phoneNumber?.trim() || null,
          passwordHash: hashedPassword,
          role: "INSTRUCTOR",
        },
      });
      userId = newUser.id;
    }

    const newInstructor = await prisma.instructor.create({
      data: {
        userId,
        bapetenLicenseNo: bapetenLicenseNo?.trim() || null,
        licenseExpiryDate: licenseExpiryDate ? new Date(licenseExpiryDate) : null,
        iaeaCertification: Boolean(iaeaCertification),
        specialization: specialization || "PPR_ANALISIS",
        status: status || "ACTIVE",
        bioSummary: bioSummary?.trim() || null,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: newInstructor.id,
          userId: newInstructor.userId,
          fullName: newInstructor.user.fullName,
          email: newInstructor.user.email,
          phoneNumber: newInstructor.user.phoneNumber,
          bapetenLicenseNo: newInstructor.bapetenLicenseNo,
          licenseExpiryDate: newInstructor.licenseExpiryDate?.toISOString() || null,
          iaeaCertification: newInstructor.iaeaCertification,
          specialization: newInstructor.specialization,
          status: newInstructor.status,
          bioSummary: newInstructor.bioSummary,
          createdAt: newInstructor.createdAt.toISOString(),
          assignmentsCount: 0,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ADMIN_INSTRUCTORS_POST]", error);
    return NextResponse.json({ error: "Gagal menambahkan instruktur" }, { status: 500 });
  }
}
