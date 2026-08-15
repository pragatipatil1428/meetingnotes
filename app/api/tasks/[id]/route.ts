import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateTaskSchema } from "@/lib/validations/task";
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

    const task = await prisma.task.findUnique({
      where: { id, deletedAt: null },
      include: {
        meeting: { select: { id: true, title: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

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

    return NextResponse.json<ApiResponse>({ ok: true, data: task });
  } catch (error) {
    console.error("GET /api/tasks/[id] error:", error);
    return NextResponse.json<ApiResponse>(
      { ok: false, error: "Failed to fetch task" },
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

    const existing = await prisma.task.findUnique({ where: { id, deletedAt: null } });
    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "Task not found" },
        { status: 404 }
      );
    }

    if (existing.assigneeId !== session.user.id) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // The due date can't be changed while the task is in progress (only
    // rejected when the value actually differs).
    if (parsed.data.dueDate !== undefined && existing.status === "IN_PROGRESS") {
      const newTime = parsed.data.dueDate ? new Date(parsed.data.dueDate).getTime() : null;
      const oldTime = existing.dueDate ? new Date(existing.dueDate).getTime() : null;
      if (newTime !== oldTime) {
        return NextResponse.json<ApiResponse>(
          { ok: false, error: "Cannot change the due date while the task is in progress." },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
    if (parsed.data.priority !== undefined) updateData.priority = parsed.data.priority;
    if (parsed.data.position !== undefined) updateData.position = parsed.data.position;
    if (parsed.data.labels !== undefined) updateData.labels = parsed.data.labels;
    if (parsed.data.dueDate !== undefined) {
      updateData.dueDate = parsed.data.dueDate ? new Date(parsed.data.dueDate) : null;
    }
    if (parsed.data.meetingId !== undefined) updateData.meetingId = parsed.data.meetingId || null;
    if (parsed.data.assigneeId !== undefined) updateData.assigneeId = parsed.data.assigneeId || null;
    if (parsed.data.startedAt !== undefined) updateData.startedAt = parsed.data.startedAt ? new Date(parsed.data.startedAt) : null;
    if (parsed.data.timeSpent !== undefined) updateData.timeSpent = parsed.data.timeSpent;

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        meeting: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json<ApiResponse>({ ok: true, data: task });
  } catch (error) {
    console.error("PUT /api/tasks/[id] error:", error);
    return NextResponse.json<ApiResponse>(
      { ok: false, error: "Failed to update task" },
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

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "Task not found" },
        { status: 404 }
      );
    }

    if (existing.assigneeId !== session.user.id) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Soft delete: keep the row so history (timer events, meeting links)
    // stays intact; every read query filters on deletedAt = null.
    const task = await prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json<ApiResponse>({ ok: true, data: task });
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);
    return NextResponse.json<ApiResponse>(
      { ok: false, error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
