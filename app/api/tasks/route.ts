import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTaskSchema } from "@/lib/validations/task";
import type { ApiResponse } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const meetingId = searchParams.get("meetingId");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {
      assigneeId: session.user.id,
    };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (meetingId) where.meetingId = meetingId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where: where as any,
      include: {
        meeting: { select: { id: true, title: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ createdAt: "desc" }, { position: "asc" }],
    });

    return NextResponse.json<ApiResponse>({ ok: true, data: tasks });
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json<ApiResponse>(
      { ok: false, error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Get the max position for ordering
    const maxPosTask = await prisma.task.findFirst({
      where: { status: parsed.data.status as any },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const task = await prisma.task.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description || "",
        status: parsed.data.status as any,
        priority: parsed.data.priority as any,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        labels: parsed.data.labels,
        meetingId: parsed.data.meetingId || null,
        assigneeId: session.user.id,
        position: (maxPosTask?.position ?? -1) + 1,
      },
      include: {
        meeting: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json<ApiResponse>({ ok: true, data: task }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json<ApiResponse>(
      { ok: false, error: "Failed to create task" },
      { status: 500 }
    );
  }
}
