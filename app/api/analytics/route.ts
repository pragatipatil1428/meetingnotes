import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
    const range = searchParams.get("range") || "month";

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (range) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case "quarter":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case "year":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }

    const userId = session.user.id;

    // Run all analytics queries in parallel
    const [
      totalMeetings,
      completedMeetings,
      totalTasks,
      completedTasks,
      meetingsByDay,
      tasksByStatus,
      tasksByPriority,
      recentMeetings,
      tagsUsage,
    ] = await Promise.all([
      prisma.meeting.count({
        where: { ownerId: userId, createdAt: { gte: startDate } },
      }),
      prisma.meeting.count({
        where: {
          ownerId: userId,
          status: "COMPLETED",
          createdAt: { gte: startDate },
        },
      }),
      prisma.task.count({
        where: { assigneeId: userId, createdAt: { gte: startDate } },
      }),
      prisma.task.count({
        where: {
          assigneeId: userId,
          status: "DONE",
          createdAt: { gte: startDate },
        },
      }),
      // Meetings per day for chart
      prisma.meeting.findMany({
        where: { ownerId: userId, createdAt: { gte: startDate } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      // Tasks by status
      prisma.task.groupBy({
        by: ["status"],
        where: { assigneeId: userId, createdAt: { gte: startDate } },
        _count: true,
      }),
      // Tasks by priority
      prisma.task.groupBy({
        by: ["priority"],
        where: { assigneeId: userId, createdAt: { gte: startDate } },
        _count: true,
      }),
      // Recent meetings
      prisma.meeting.findMany({
        where: { ownerId: userId, createdAt: { gte: startDate } },
        select: { id: true, title: true, status: true, meetingAt: true, tags: true },
        orderBy: [{ createdAt: "desc" }, { meetingAt: "desc" }],
        take: 5,
      }),
      // Tags usage
      prisma.meeting.findMany({
        where: { ownerId: userId, createdAt: { gte: startDate } },
        select: { tags: true },
      }),
    ]);

    // Aggregate meetings by day for chart
    const meetingsByDayMap = new Map<string, number>();
    meetingsByDay.forEach((m) => {
      const day = m.createdAt.toISOString().split("T")[0];
      meetingsByDayMap.set(day, (meetingsByDayMap.get(day) || 0) + 1);
    });

    const meetingChartData = Array.from(meetingsByDayMap.entries()).map(
      ([date, count]) => ({
        date,
        count,
      })
    );

    // Aggregate tags
    const tagCountMap = new Map<string, number>();
    tagsUsage.forEach((m) => {
      m.tags.forEach((tag) => {
        tagCountMap.set(tag, (tagCountMap.get(tag) || 0) + 1);
      });
    });

    const topTags = Array.from(tagCountMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return NextResponse.json<ApiResponse>({
      ok: true,
      data: {
        range,
        summary: {
          totalMeetings,
          completedMeetings,
          totalTasks,
          completedTasks,
          meetingCompletionRate: totalMeetings
            ? Math.round((completedMeetings / totalMeetings) * 100)
            : 0,
          taskCompletionRate: totalTasks
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0,
        },
        charts: {
          meetingsOverTime: meetingChartData,
          tasksByStatus: tasksByStatus.map((s) => ({
            status: s.status,
            count: s._count,
          })),
          tasksByPriority: tasksByPriority.map((p) => ({
            priority: p.priority,
            count: p._count,
          })),
        },
        recentMeetings,
        topTags,
      },
    });
  } catch (error) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json<ApiResponse>(
      { ok: false, error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
