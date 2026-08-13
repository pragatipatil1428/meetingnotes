"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { motion } from "framer-motion";
import {
  Video,
  FileText,
  CheckSquare,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { SkeletonCard } from "@/components/ui/skeleton";

interface AnalyticsSummary {
  totalMeetings: number;
  completedMeetings: number;
  totalTasks: number;
  completedTasks: number;
  meetingCompletionRate: number;
  taskCompletionRate: number;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
}

const iconMap: Record<string, LucideIcon> = {
  Video,
  FileText,
  CheckSquare,
  Clock,
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export function StatCards() {
  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["analytics", "month"],
    queryFn: () => api("/api/analytics?range=month"),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: "Meetings",
      value: data?.summary.totalMeetings.toString() || "0",
      trend: data ? `${data.summary.completedMeetings} completed` : undefined,
      icon: "Video",
    },
    {
      label: "Tasks completed",
      value: data ? `${data.summary.completedTasks}/${data.summary.totalTasks}` : "0/0",
      trend: data ? `${data.summary.taskCompletionRate}%` : undefined,
      icon: "CheckSquare",
    },
    {
      label: "Meeting rate",
      value: data ? `${data.summary.meetingCompletionRate}%` : "0%",
      trend: "completion rate",
      icon: "Clock",
    },
    {
      label: "Task rate",
      value: data ? `${data.summary.taskCompletionRate}%` : "0%",
      trend: "completion rate",
      icon: "FileText",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
    >
      {stats.map((stat) => {
        const Icon = iconMap[stat.icon] || Clock;

        return (
          <motion.div
            key={stat.label}
            variants={item}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-elevated)]"
          >
            {/* Icon */}
            <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-brand-50)] text-[var(--color-brand-600)] dark:bg-[var(--color-brand-900)]/40 dark:text-[var(--color-brand-300)]">
              <Icon className="h-4 w-4" />
            </div>

            {/* Content */}
            <p className="text-xs font-medium text-[var(--color-text-muted)]">
              {stat.label}
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-[var(--color-text-primary)]">
              {stat.value}
            </p>
            {stat.trend && (
              <p className="mt-1 text-xs font-medium text-[var(--color-success)]">
                {stat.trend}
              </p>
            )}

            {/* Hover gradient */}
            <div className="absolute inset-0 -translate-x-full rounded-xl bg-gradient-to-r from-transparent via-[var(--color-brand-50)] to-transparent opacity-0 transition-all duration-700 group-hover:translate-x-full group-hover:opacity-100 dark:via-[var(--color-brand-900)]" />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
