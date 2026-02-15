import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

interface RegisterBody {
  name: string;
  email: string;
  password: string;
  role: "STUDENT" | "ADMIN" | "TECHNICIAN";
  studentId?: string;
  department?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: RegisterBody = await req.json();

    if (!body.name || !body.email || !body.password || !body.role) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const newUser = await db.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: body.role,
        studentId: body.role === "STUDENT" ? body.studentId : null,
        department: body.department || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studentId: true,
        department: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "User registered successfully", user: newUser },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
