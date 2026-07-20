import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateMeetingSchema } from "@/lib/validations/meeting";
import type { ApiResponse } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        participants: true,
        owner: { select: { id: true, name: true, email: true, image: true } },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!meeting) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "Meeting not found" },
        { status: 404 }
      );
    }

    if (meeting.ownerId !== session.user.id) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json<ApiResponse>({ ok: true, data: meeting });
  } catch (error) {
    console.error("GET /api/meetings/[id] error:", error);
    return NextResponse.json<ApiResponse>(
      { ok: false, error: "Failed to fetch meeting" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existing = await prisma.meeting.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "Meeting not found" },
        { status: 404 }
      );
    }

    if (existing.ownerId !== session.user.id) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = updateMeetingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
    if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;
    if (parsed.data.summary !== undefined) updateData.summary = parsed.data.summary;
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
    if (parsed.data.keyDecisions !== undefined) updateData.keyDecisions = parsed.data.keyDecisions;
    if (parsed.data.actionItems !== undefined) updateData.actionItems = parsed.data.actionItems;
    if (parsed.data.tags !== undefined) updateData.tags = parsed.data.tags;
    if (parsed.data.meetingAt !== undefined) updateData.meetingAt = new Date(parsed.data.meetingAt);
    if (parsed.data.startedAt !== undefined) updateData.startedAt = parsed.data.startedAt ? new Date(parsed.data.startedAt) : null;
    if (parsed.data.timeSpent !== undefined) updateData.timeSpent = parsed.data.timeSpent;

    const meeting = await prisma.meeting.update({
      where: { id },
      data: updateData,
      include: { participants: true },
    });

    return NextResponse.json<ApiResponse>({ ok: true, data: meeting });
  } catch (error) {
    console.error("PUT /api/meetings/[id] error:", error);
    return NextResponse.json<ApiResponse>(
      { ok: false, error: "Failed to update meeting" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existing = await prisma.meeting.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "Meeting not found" },
        { status: 404 }
      );
    }

    if (existing.ownerId !== session.user.id) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    await prisma.meeting.delete({ where: { id } });

    return NextResponse.json<ApiResponse>({ ok: true, data: null });
  } catch (error) {
    console.error("DELETE /api/meetings/[id] error:", error);
    return NextResponse.json<ApiResponse>(
      { ok: false, error: "Failed to delete meeting" },
      { status: 500 }
    );
  }
}
