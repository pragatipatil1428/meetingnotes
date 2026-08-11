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
      entityType: "task",
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

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "Task not found" },
        { status: 404 }
      );
    }

    if (task.assigneeId !== session.user.id) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const events = await prisma.timerEvent.findMany({
      where: { entityType: "task", entityId: id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json<ApiResponse>({ ok: true, data: events });
  } catch (error) {
    console.error("GET /api/tasks/[id]/timer error:", error);
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

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "Task not found" },
        { status: 404 }
      );
    }

    if (task.assigneeId !== session.user.id) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action } = body;

    if (action === "start" || action === "resume") {
      const updated = await prisma.task.update({
        where: { id },
        data: {
          startedAt: new Date(),
          status: "IN_PROGRESS" as any,
        },
        include: {
          meeting: { select: { id: true, title: true } },
        },
      });

      await recordEvent({
        entityId: id,
        action: action === "resume" ? "RESUME" : "START",
        timeSpent: task.timeSpent,
        userId: session.user.id,
      });

      return NextResponse.json<ApiResponse>({ ok: true, data: updated });
    }

    if (action === "pause") {
      if (!task.startedAt) {
        return NextResponse.json<ApiResponse>(
          { ok: false, error: "Timer is not running" },
          { status: 400 }
        );
      }

      const elapsed = Math.floor(
        (Date.now() - new Date(task.startedAt).getTime()) / 1000
      );

      const newTimeSpent = task.timeSpent + elapsed;

      // Save elapsed time but keep the task in progress so it can be resumed
      const updated = await prisma.task.update({
        where: { id },
        data: {
          startedAt: null,
          timeSpent: newTimeSpent,
        },
        include: {
          meeting: { select: { id: true, title: true } },
        },
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
      // Allow completing a paused task (startedAt may be null)
      const elapsed = task.startedAt
        ? Math.floor((Date.now() - new Date(task.startedAt).getTime()) / 1000)
        : 0;

      const newTimeSpent = task.timeSpent + elapsed;

      const updated = await prisma.task.update({
        where: { id },
        data: {
          startedAt: null,
          timeSpent: newTimeSpent,
          status: "DONE" as any,
        },
        include: {
          meeting: { select: { id: true, title: true } },
        },
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
    console.error("POST /api/tasks/[id]/timer error:", error);
    return NextResponse.json<ApiResponse>(
      { ok: false, error: "Failed to update timer" },
      { status: 500 }
    );
  }
}
