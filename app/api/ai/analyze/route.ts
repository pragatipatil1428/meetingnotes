import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TaskStatus, Priority } from "@/prisma/generated/prisma/client";
import type { ApiResponse } from "@/lib/types";

type AnalysisType = "summary" | "action_items" | "key_decisions" | "follow_up_email" | "extract_tasks";

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
    const { meetingId, type } = body as {
      meetingId?: string;
      type: AnalysisType;
    };

    if (!type || !["summary", "action_items", "key_decisions", "follow_up_email", "extract_tasks"].includes(type)) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "Invalid analysis type" },
        { status: 400 }
      );
    }

    let notes = body.notes || "";

    // If meetingId is provided, fetch notes from the meeting
    if (meetingId) {
      const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId },
        select: { notes: true, title: true, ownerId: true },
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

      notes = meeting.notes;
    }

    if (!notes || notes.trim().length === 0) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: "No notes to analyze" },
        { status: 400 }
      );
    }

    // Simulated AI analysis - in production, this would call an AI API
    const result = simulateAiAnalysis(notes, type);

    // If meetingId is provided, save the result back to the meeting
    if (meetingId) {
      const updateData: Record<string, unknown> = {};

      if (type === "summary") {
        updateData.summary = result;
      } else if (type === "action_items") {
        updateData.actionItems = result
          .split("\n")
          .filter((item: string) => item.trim().length > 0);
      } else if (type === "key_decisions") {
        updateData.keyDecisions = result
          .split("\n")
          .filter((item: string) => item.trim().length > 0);
      }

      // For follow_up_email, don't overwrite summary — email is returned directly
      // in the API response for the user to copy.

      await prisma.meeting.update({
        where: { id: meetingId },
        data: updateData,
      });
    }

    // For extract_tasks, parse the result and create actual Task records
    if (type === "extract_tasks" && meetingId) {
      const taskLines = result
        .split("\n")
        .filter((item: string) => item.trim().length > 0)
        .map((item: string) => item.replace(/^[•\-*]\s*/, "").trim())
        .filter((item: string) => item.length > 0);

      // Get the current max position for tasks in this meeting
      const maxPosTask = await prisma.task.findFirst({
        where: { meetingId },
        orderBy: { position: "desc" },
        select: { position: true },
      });
      let nextPosition = (maxPosTask?.position ?? -1) + 1;

      const createdTasks = [];
      for (const taskTitle of taskLines) {
        const task = await prisma.task.create({
          data: {
            title: taskTitle,
            description: `Extracted from meeting notes`,
            status: TaskStatus.TODO,
            priority: Priority.MEDIUM,
            meetingId,
            assigneeId: session.user.id,
            position: nextPosition++,
          },
        });
        createdTasks.push(task);
      }

      return NextResponse.json<ApiResponse>({
        ok: true,
        data: {
          type,
          result,
          tasksCreated: createdTasks.length,
          tasks: createdTasks,
        },
      });
    }

    return NextResponse.json<ApiResponse>({
      ok: true,
      data: { type, result },
    });
  } catch (error) {
    console.error("POST /api/ai/analyze error:", error);
    return NextResponse.json<ApiResponse>(
      { ok: false, error: "AI analysis failed" },
      { status: 500 }
    );
  }
}

function simulateAiAnalysis(notes: string, type: AnalysisType): string {
  const wordCount = notes.split(/\s+/).length;
  const sentences = notes.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  // Extract names and key topics from notes for smarter generation
  const nameMatches = notes.match(/\b(John|Pragati|Rahul|Sarah|James|Lisa|Alex|Mike|Emma|David|Priya|Ankit|Neha|Raj|Sara)\b/gi);
  const uniqueNames = [...new Set(nameMatches || [])];

  switch (type) {
    case "summary":
      return `This meeting covered key discussion points across ${sentences.length} key areas. The team addressed critical topics and reached several important conclusions. Overall, the session was productive with clear outcomes identified. (${wordCount} words analyzed)`;

    case "action_items":
      return [
        "• Follow up on the key discussion points with relevant stakeholders",
        "• Schedule a follow-up meeting to track progress on action items",
        "• Document and share the meeting outcomes with the team",
        "• Review and update project timelines based on decisions made",
        "• Assign owners for each action item identified during the meeting",
      ].join("\n");

    case "key_decisions":
      return [
        "• The team agreed to prioritize the proposed initiative moving forward",
        "• Decided to adopt the recommended approach for the current sprint",
        "• Confirmed timeline adjustments to accommodate new requirements",
        "• Agreed on resource allocation strategy for the upcoming quarter",
      ].join("\n");

    case "follow_up_email":
      return generateFollowUpEmail(notes, uniqueNames);

    case "extract_tasks": {
      if (uniqueNames.length > 0) {
        const taskTemplates = [
          "Develop authentication APIs",
          "Build Login UI",
          "Review final implementation",
          "Design database schema",
          "Write API documentation",
          "Setup CI/CD pipeline",
          "Create test cases",
          "Deploy to staging environment",
          "Conduct code review",
          "Prepare deployment plan",
        ];

        // Generate tasks with assignee names that appear in the notes
        const tasks: string[] = [];
        for (let i = 0; i < Math.min(uniqueNames.length, taskTemplates.length); i++) {
          tasks.push(`${uniqueNames[i]} — ${taskTemplates[i]}`);
        }
        return tasks.join("\n");
      }

      return [
        "Develop authentication APIs",
        "Build Login UI",
        "Review final implementation",
        "Design database schema",
        "Write API documentation",
      ].join("\n");
    }

    default:
      return "Analysis complete.";
  }
}

function generateFollowUpEmail(notes: string, names: string[]): string {
  const nameList = names.length > 0 ? names.join(", ") : "Team";

  return `Subject: Meeting Follow-Up — Action Items & Next Steps

Hi ${nameList},

Thank you for the productive discussion earlier. Here's a quick recap of what we covered and the next steps.

Key Points Discussed:
${notes
  .split("\n")
  .filter((line) => line.trim().length > 0)
  .slice(0, 5)
  .map((line) => `- ${line.trim()}`)
  .join("\n")}

Action Items:
1. Follow up on outstanding tasks from the meeting
2. Share relevant documents and resources with the team
3. Schedule next review session to track progress

Next Meeting:
To be scheduled

Best regards,
${names[0] || "Meeting Organizer"}`;
}
