import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ orderIndex: "asc" }, { id: "asc" }],
      include: {
        _count: {
          select: {
            questions: true,
            trainings: true,
          },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET /api/admin/categories error:", error);
    return NextResponse.json(
      { error: "Gagal memuat master kategori pelatihan" },
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
    const { code, name, description, orderIndex, isActive } = body;

    if (!code || !name) {
      return NextResponse.json(
        { error: "Kode dan Nama kategori wajib diisi" },
        { status: 400 }
      );
    }

    const normalizedCode = code.trim().toUpperCase().replace(/[\s-]+/g, "_");

    const existing = await prisma.category.findUnique({
      where: { code: normalizedCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Kategori dengan kode "${normalizedCode}" sudah ada` },
        { status: 409 }
      );
    }

    const newCategory = await prisma.category.create({
      data: {
        code: normalizedCode,
        name: name.trim(),
        description: description?.trim() || null,
        orderIndex: typeof orderIndex === "number" ? orderIndex : 10,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/categories error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan kategori baru" },
      { status: 500 }
    );
  }
}
