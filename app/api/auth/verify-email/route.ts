import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "Missing token or email" },
        { status: 400 }
      );
    }

    // Find valid verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    if (verificationToken.identifier !== email) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "Token does not match the provided email" },
        { status: 400 }
      );
    }

    if (verificationToken.expires < new Date()) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: { token },
      });
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "Verification token has expired" },
        { status: 400 }
      );
    }

    // Mark email as verified
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    // Clean up used token
    await prisma.verificationToken.delete({
      where: { token },
    });

    // Redirect to login with success message
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    return NextResponse.redirect(
      new URL("/login?verified=true", baseUrl)
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json<ApiResponse>(
      { ok: false, error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
