import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { supabaseId, email, name, role, phone } = body;

    if (!supabaseId || !email) {
      return NextResponse.json(
        { error: "supabaseId and email are required to sync user profile." },
        { status: 400 }
      );
    }

    const assignedRole =
      role && Object.values(Role).includes(role as Role)
        ? (role as Role)
        : Role.TECHNICIAN;


    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    let userRecord;

    if (existingUser) {

      userRecord = await prisma.user.update({
        where: { email },
        data: {
          supabaseId,
          role: assignedRole,
          name: name || existingUser.name,
          phone: phone || existingUser.phone,
        },
      });
    } else {

      userRecord = await prisma.user.create({
        data: {
          id: supabaseId,
          supabaseId,
          email,
          name: name || email.split("@")[0],
          role: assignedRole,
          phone: phone || null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "User profile successfully synced to United Scale relational ERP database.",
      user: {
        id: userRecord.id,
        supabaseId: userRecord.supabaseId,
        email: userRecord.email,
        name: userRecord.name,
        role: userRecord.role,
      },
    });
  } catch (error: unknown) {
    console.error("Error syncing Supabase user to Prisma:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to sync user profile",
      },
      { status: 500 }
    );
  }
}

