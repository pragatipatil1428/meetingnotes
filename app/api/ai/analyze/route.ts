import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/lib/types";

type AnalysisType = "summary" | "action_items" | "key_decisions";

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

    if (!type || !["summary", "action_items", "key_decisions"].includes(type)) {
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

      await prisma.meeting.update({
        where: { id: meetingId },
        data: updateData,
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

    default:
      return "Analysis complete.";
  }
}
