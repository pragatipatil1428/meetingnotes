import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { ApiResponse } from "@/lib/types";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({ ok: true, data: user });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json<ApiResponse>(
      { ok: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, currentPassword, newPassword } = body;

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    // Handle password change
    if (currentPassword && newPassword) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { passwordHash: true },
      });

      if (!user?.passwordHash) {
        return NextResponse.json<ApiResponse>(
          { ok: false, error: "Cannot change password for OAuth accounts" },
          { status: 400 }
        );
      }

      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return NextResponse.json<ApiResponse>(
          { ok: false, error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json<ApiResponse>(
          { ok: false, error: "New password must be at least 8 characters" },
          { status: 400 }
        );
      }

      updateData.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
      },
    });

    return NextResponse.json<ApiResponse>({ ok: true, data: updatedUser });
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json<ApiResponse>(
      { ok: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
