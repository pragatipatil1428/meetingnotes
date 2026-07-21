import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import type { ApiResponse } from "@/lib/types";

export async function POST() {
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
      select: { id: true, email: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "Email is already verified" },
        { status: 400 }
      );
    }

    // Remove any existing tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: user.email },
    });

    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store new token in database
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires,
      },
    });

    // In production, send an email with the verification link.
    // For now, return the verification URL so it can be shown/used.
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`;

    console.log(`[DEV] Verification link for ${user.email}: ${verifyUrl}`);

    return NextResponse.json<ApiResponse>({
      ok: true,
      data: { verifyUrl },
      message: "Verification email sent. Check your inbox.",
    });
  } catch (error) {
    console.error("Send verification error:", error);
    return NextResponse.json<ApiResponse>(
      { ok: false, error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
