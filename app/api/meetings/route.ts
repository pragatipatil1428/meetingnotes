import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMeetingSchema } from "@/lib/validations/meeting";
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
    const search = searchParams.get("search");
    const tag = searchParams.get("tag");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const where: Record<string, unknown> = {
      ownerId: session.user.id,
    };

    if (status) {
      const statuses = status.split(",").map((s) => s.trim()).filter(Boolean);
      where.status = statuses.length > 1 ? { in: statuses } : statuses[0];
    }
    if (tag) where.tags = { has: tag };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    const [meetings, total] = await Promise.all([
      prisma.meeting.findMany({
        where: where as any,
        include: {
          participants: true,
          _count: { select: { tasks: true } },
        },
        orderBy: { meetingAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.meeting.count({ where: where as any }),
    ]);

    return NextResponse.json<ApiResponse>({
      ok: true,
      data: {
        items: meetings,
        total,
        page,
        pageSize,
        hasMore: page * pageSize < total,
      },
    });
  } catch (error) {
    console.error("GET /api/meetings error:", error);
    return NextResponse.json<ApiResponse>(
      { ok: false, error: "Failed to fetch meetings" },
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
    const parsed = createMeetingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Reject past meeting times
    if (new Date(parsed.data.meetingAt).getTime() < Date.now()) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "Meeting time cannot be in the past" },
        { status: 400 }
      );
    }

    const meeting = await prisma.meeting.create({
      data: {
        title: parsed.data.title,
        notes: parsed.data.notes,
        meetingAt: new Date(parsed.data.meetingAt),
        tags: parsed.data.tags,
        ownerId: session.user.id,
        participants: {
          create: parsed.data.participants.map((p) => ({
            email: p.email,
            name: p.name || null,
          })),
        },
      },
      include: {
        participants: true,
      },
    });

    return NextResponse.json<ApiResponse>({ ok: true, data: meeting }, { status: 201 });
  } catch (error) {
    console.error("POST /api/meetings error:", error);
    return NextResponse.json<ApiResponse>(
      { ok: false, error: "Failed to create meeting" },
      { status: 500 }
    );
  }
}
