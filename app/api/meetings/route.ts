import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMeetingSchema } from "@/lib/validations/meeting";
import { getEffectiveMeetingStatus } from "@/lib/utils";
import type { ApiResponse } from "@/lib/types";

const ALLOWED_SORTS = ["title", "meetingAt", "createdAt", "participants", "status"] as const;

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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
    const requestedSize = parseInt(searchParams.get("pageSize") || "10");
    const pageSize = Math.min(Math.max(1, requestedSize || 10), 1000);
    const sortByRaw = searchParams.get("sortBy");
    const sortBy = ALLOWED_SORTS.includes(sortByRaw as any)
      ? (sortByRaw as string)
      : "createdAt";
    const sortDir = searchParams.get("sortDir") === "asc" ? "asc" : "desc";

    const where: Record<string, unknown> = {
      ownerId: session.user.id,
      deletedAt: null,
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

    // Build server-side orderBy (allows correct sorting across all pages).
    let orderBy: any;
    switch (sortBy) {
      case "title":
        orderBy = [{ title: sortDir }, { createdAt: "desc" }];
        break;
      case "meetingAt":
        orderBy = [{ meetingAt: sortDir }, { createdAt: "desc" }];
        break;
      case "participants":
        orderBy = [{ participants: { _count: sortDir } }, { createdAt: "desc" }];
        break;
      case "status": {
        // The status column displays the *effective* status (a SCHEDULED
        // meeting whose time has passed is shown as PAST), so sort
        // alphabetically by that effective status: order the matching ids
        // first, then fetch just the current page in that order.
        const matches = await prisma.meeting.findMany({
          where: where as any,
          select: { id: true, status: true, meetingAt: true },
        });
        const dir = sortDir === "asc" ? 1 : -1;
        const sortedIds = matches
          .map((m) => ({
            id: m.id,
            status: getEffectiveMeetingStatus(m.status, m.meetingAt),
            meetingAt: m.meetingAt,
          }))
          .sort((a, b) => {
            const byStatus = a.status.localeCompare(b.status) * dir;
            return byStatus !== 0
              ? byStatus
              : b.meetingAt.getTime() - a.meetingAt.getTime();
          })
          .map((m) => m.id);

        const pageIds = sortedIds.slice((page - 1) * pageSize, page * pageSize);
        const meetings = await prisma.meeting.findMany({
          where: { id: { in: pageIds } } as any,
          include: {
            participants: true,
            _count: { select: { tasks: true } },
          },
        });
        const order = new Map(pageIds.map((id, i) => [id, i]));
        meetings.sort((a, b) => order.get(a.id)! - order.get(b.id)!);
        const total = await prisma.meeting.count({ where: where as any });

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
      }
      default:
        orderBy = [{ createdAt: sortDir }, { meetingAt: "desc" }];
    }

    const [meetings, total] = await Promise.all([
      prisma.meeting.findMany({
        where: where as any,
        include: {
          participants: true,
          _count: { select: { tasks: true } },
        },
        orderBy,
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
