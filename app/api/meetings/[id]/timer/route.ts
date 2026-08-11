import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/lib/types";

/** Record a timer event into the pause/resume history. */
async function recordEvent(params: {
  entityId: string;
  action: "START" | "PAUSE" | "RESUME" | "STOP";
  timeSpent: number;
  userId: string;
}) {
  return prisma.timerEvent.create({
    data: {
      entityType: "meeting",
      entityId: params.entityId,
      action: params.action,
      timeSpent: params.timeSpent,
      userId: params.userId,
    },
  });
}

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

    const meeting = await prisma.meeting.findUnique({ where: { id } });
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

    const events = await prisma.timerEvent.findMany({
      where: { entityType: "meeting", entityId: id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json<ApiResponse>({ ok: true, data: events });
  } catch (error) {
    console.error("GET /api/meetings/[id]/timer error:", error);
    return NextResponse.json<ApiResponse>(
      { ok: false, error: "Failed to fetch timer history" },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const meeting = await prisma.meeting.findUnique({ where: { id } });
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

    const body = await req.json();
    const { action } = body;

    if (action === "start" || action === "resume") {
      const updated = await prisma.meeting.update({
        where: { id },
        data: {
          startedAt: new Date(),
          status: "IN_PROGRESS" as any,
        },
        include: { participants: true },
      });

      await recordEvent({
        entityId: id,
        action: action === "resume" ? "RESUME" : "START",
        timeSpent: meeting.timeSpent,
        userId: session.user.id,
      });

      return NextResponse.json<ApiResponse>({ ok: true, data: updated });
    }

    if (action === "pause") {
      if (!meeting.startedAt) {
        return NextResponse.json<ApiResponse>(
          { ok: false, error: "Timer is not running" },
          { status: 400 }
        );
      }

      const elapsed = Math.floor(
        (Date.now() - new Date(meeting.startedAt).getTime()) / 1000
      );

      const newTimeSpent = meeting.timeSpent + elapsed;

      // Save elapsed time but keep the meeting in progress so it can be resumed
      const updated = await prisma.meeting.update({
        where: { id },
        data: {
          startedAt: null,
          timeSpent: newTimeSpent,
        },
        include: { participants: true },
      });

      await recordEvent({
        entityId: id,
        action: "PAUSE",
        timeSpent: newTimeSpent,
        userId: session.user.id,
      });

      return NextResponse.json<ApiResponse>({ ok: true, data: updated });
    }

    if (action === "stop") {
      // Allow completing a paused meeting (startedAt may be null)
      const elapsed = meeting.startedAt
        ? Math.floor((Date.now() - new Date(meeting.startedAt).getTime()) / 1000)
        : 0;

      const newTimeSpent = meeting.timeSpent + elapsed;

      const updated = await prisma.meeting.update({
        where: { id },
        data: {
          startedAt: null,
          timeSpent: newTimeSpent,
          status: "COMPLETED" as any,
        },
        include: { participants: true },
      });

      await recordEvent({
        entityId: id,
        action: "STOP",
        timeSpent: newTimeSpent,
        userId: session.user.id,
      });

      return NextResponse.json<ApiResponse>({ ok: true, data: updated });
    }

    return NextResponse.json<ApiResponse>(
      { ok: false, error: 'Invalid action. Use "start", "pause", "resume", or "stop".' },
      { status: 400 }
    );
  } catch (error) {
    console.error("POST /api/meetings/[id]/timer error:", error);
    return NextResponse.json<ApiResponse>(
      { ok: false, error: "Failed to update timer" },
      { status: 500 }
    );
  }
}
