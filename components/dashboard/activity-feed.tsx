"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FileText, CheckSquare, Sparkles, Loader2, Activity } from "lucide-react";
import { api } from "@/lib/api/client";
import type { Task, PaginatedList } from "@/lib/types";

interface Meeting {
  id: string;
  title: string;
  status: string;
  createdAt?: string;
  meetingAt: string;
}

interface MeetingsResponse {
  items: Meeting[];
  total: number;
}

interface ActivityItem {
  id: string;
  type: "meeting" | "task" | "ai";
  title: string;
  action: string;
  time: string;
}

const typeIcons = {
  meeting: FileText,
  task: CheckSquare,
  ai: Sparkles,
};

const typeColors: Record<string, string> = {
  meeting:
    "text-[var(--color-brand-700)] bg-[var(--color-brand-100)] dark:bg-[var(--color-brand-900)] dark:text-[var(--color-brand-200)]",
  task:
    "text-[var(--color-brand-700)] bg-[var(--color-brand-100)] dark:bg-[var(--color-brand-900)] dark:text-[var(--color-brand-200)]",
  ai:
    "text-[var(--color-brand-700)] bg-[var(--color-brand-100)] dark:bg-[var(--color-brand-900)] dark:text-[var(--color-brand-200)]",
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function ActivityFeed() {
  const { data: meetingsData, isLoading: meetingsLoading } =
    useQuery<MeetingsResponse>({
      queryKey: ["meetings", "dashboard"],
      queryFn: () => api("/api/meetings?pageSize=10"),
    });

  const { data: tasksData, isLoading: tasksLoading } = useQuery<
    PaginatedList<Task>
  >({
    queryKey: ["tasks", "dashboard"],
    queryFn: () => api("/api/tasks?pageSize=1000"),
  });

  const isLoading = meetingsLoading || tasksLoading;

  const activities: ActivityItem[] = [];

  // Add recent meetings as activity
  (meetingsData?.items || []).forEach((m) => {
    const dateStr = m.meetingAt || m.createdAt;
    if (dateStr) {
      activities.push({
        id: `meeting-${m.id}`,
        type: "meeting",
        title: m.title,
        action: m.status === "COMPLETED" ? "completed meeting" : "created meeting",
        time: timeAgo(dateStr),
      });
    }
  });

  // Add recent tasks as activity
  (tasksData?.items || []).forEach((t) => {
    if (t.createdAt) {
      const action =
        t.status === "DONE"
          ? "completed task"
          : t.status === "IN_PROGRESS"
            ? "started working on task"
            : "created task";
      activities.push({
        id: `task-${t.id}`,
        type: "task",
        title: t.title,
        action,
        time: timeAgo(
          t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt)
        ),
      });
    }
  });

  // Sort by time (most recent first) and take top 8
  activities.sort((a, b) => {
    // Simple sort - items with "ago" numbers
    const aNum = parseInt(a.time);
    const bNum = parseInt(b.time);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    return 0;
  });

  const recentActivities = activities.slice(0, 8);

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand-100)] text-[var(--color-brand-700)] dark:bg-[var(--color-brand-900)] dark:text-[var(--color-brand-200)]">
          <Activity className="h-4 w-4" />
        </span>
        <h3 className="font-display text-sm font-bold text-[var(--color-text-primary)]">
          Recent activity
        </h3>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--color-text-light)]" />
        </div>
      ) : recentActivities.length === 0 ? (
        <p className="py-4 text-center text-sm text-[var(--color-text-muted)]">
          No recent activity
        </p>
      ) : (
        <div className="space-y-0">
          {recentActivities.map((activity, index) => {
            const Icon = typeIcons[activity.type];

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-[var(--color-surface-tertiary)]"
              >
                {/* Icon */}
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${typeColors[activity.type]}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[var(--color-text-primary)]">
                    <span className="font-semibold">{activity.title}</span>{" "}
                    {activity.action}
                  </p>
                </div>

                {/* Time */}
                <span className="flex-shrink-0 text-xs text-[var(--color-text-light)]">
                  {activity.time}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
