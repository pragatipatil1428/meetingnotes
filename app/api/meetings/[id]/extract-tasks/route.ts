import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TaskStatus, Priority } from "@/prisma/generated/prisma/client";
import type { ApiResponse } from "@/lib/types";

export async function POST(
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
      select: { notes: true, ownerId: true },
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

    const taskLines = extractTaskLines(meeting.notes);

    if (taskLines.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          ok: false,
          error:
            "No task items found in the notes. Write bullet points (e.g. \"- Prepare Q3 deck\"), checkbox items (\"- [ ] …\"), or \"Task: …\" lines to extract them as tasks.",
        },
        { status: 400 }
      );
    }

    // Skip items that were already added as tasks for this meeting
    const existing = await prisma.task.findMany({
      where: { meetingId: id },
      select: { title: true },
    });
    const existingTitles = new Set(
      existing.map((t) => t.title.trim().toLowerCase())
    );

    const newTitles = taskLines.filter(
      (title) => !existingTitles.has(title.toLowerCase())
    );

    if (newTitles.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          ok: false,
          error: "All items in the notes have already been added as tasks.",
        },
        { status: 400 }
      );
    }

    // Continue numbering from the last task position in this meeting
    const maxPosTask = await prisma.task.findFirst({
      where: { meetingId: id },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    let nextPosition = (maxPosTask?.position ?? -1) + 1;

    const createdTasks = [];
    for (const title of newTitles) {
      const task = await prisma.task.create({
        data: {
          title,
          description: "Extracted from meeting notes",
          status: TaskStatus.TODO,
          priority: Priority.MEDIUM,
          meetingId: id,
          assigneeId: session.user.id,
          position: nextPosition++,
        },
      });
      createdTasks.push(task);
    }

    return NextResponse.json<ApiResponse>(
      {
        ok: true,
        data: {
          tasksCreated: createdTasks.length,
          tasks: createdTasks,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/meetings/[id]/extract-tasks error:", error);
    return NextResponse.json<ApiResponse>(
      { ok: false, error: "Failed to extract tasks" },
      { status: 500 }
    );
  }
}

/**
 * Pull actionable lines out of meeting notes:
 *  - "- [ ] Title" / "- [x] Title" (checkbox)
 *  - "- Title" / "* Title" / "• Title" (bullet)
 *  - "1. Title" / "1) Title" (numbered)
 *  - "Task: Title" / "TODO - Title" / "Action: Title" (prefixed)
 */
function extractTaskLines(notes: string): string[] {
  const lines: string[] = [];

  for (const rawLine of notes.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    let title: string | null = null;

    const checkbox = line.match(/^[-*•]\s*\[[ xX]\]\s*(.+)$/);
    if (checkbox) {
      title = checkbox[1];
    } else {
      const bullet = line.match(/^[-*•]\s+(.+)$/);
      if (bullet) {
        title = bullet[1];
      } else {
        const numbered = line.match(/^\d+[.)]\s+(.+)$/);
        if (numbered) {
          title = numbered[1];
        } else {
          const prefixed = line.match(/^(?:task|todo|action)\s*[:–\-]\s*(.+)$/i);
          if (prefixed) {
            title = prefixed[1];
          }
        }
      }
    }

    if (title && title.trim().length > 0) {
      lines.push(title.trim());
    }
  }

  return lines;
}
