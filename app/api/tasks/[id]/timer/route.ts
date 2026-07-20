import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/lib/types";

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

    if (action === "start") {
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

      return NextResponse.json<ApiResponse>({ ok: true, data: updated });
    }

    if (action === "stop") {
      if (!task.startedAt) {
        return NextResponse.json<ApiResponse>(
          { ok: false, error: "Timer is not running" },
          { status: 400 }
        );
      }

      const elapsed = Math.floor(
        (Date.now() - new Date(task.startedAt).getTime()) / 1000
      );

      const updated = await prisma.task.update({
        where: { id },
        data: {
          startedAt: null,
          timeSpent: task.timeSpent + elapsed,
          status: "DONE" as any,
        },
        include: {
          meeting: { select: { id: true, title: true } },
        },
      });

      return NextResponse.json<ApiResponse>({ ok: true, data: updated });
    }

    return NextResponse.json<ApiResponse>(
      { ok: false, error: 'Invalid action. Use "start" or "stop".' },
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
