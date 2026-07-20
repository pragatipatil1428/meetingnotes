import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        participants: true,
        owner: { select: { id: true, name: true, email: true, image: true } },
        tasks: {
          orderBy: { createdAt: "desc" },
          include: {
            assignee: { select: { id: true, name: true, email: true, image: true } },
          },
        },
      },
    });

    if (!meeting || meeting.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: meeting });
  } catch (error) {
    console.error("Error fetching meeting:", error);
    return NextResponse.json(
      { error: "Failed to fetch meeting" },
      { status: 500 }
    );
  }
}
