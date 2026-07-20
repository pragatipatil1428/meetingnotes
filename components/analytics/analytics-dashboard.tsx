"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  Target,
  CheckCircle2,
  Hash,
  Tag,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import { motion } from "framer-motion";

interface AnalyticsData {
  range: string;
  summary: {
    totalMeetings: number;
    completedMeetings: number;
    totalTasks: number;
    completedTasks: number;
    meetingCompletionRate: number;
    taskCompletionRate: number;
  };
  charts: {
    meetingsOverTime: { date: string; count: number }[];
    tasksByStatus: { status: string; count: number }[];
    tasksByPriority: { priority: string; count: number }[];
  };
  recentMeetings: { id: string; title: string; status: string; meetingAt: string; tags: string[] }[];
  topTags: { tag: string; count: number }[];
}

const COLORS = ["#8b5cf6", "#37a474", "#d06e45", "#4f8ed4", "#d14545"];
const PIE_COLORS = ["#8b5cf6", "#37a474", "#d06e45"];
const STATUS_LABELS: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};
const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#4f8ed4",
  MEDIUM: "#8b5cf6",
  HIGH: "#d06e45",
  URGENT: "#d14545",
};

const RANGE_OPTIONS = [
  { value: "week", label: "7 days" },
  { value: "month", label: "30 days" },
  { value: "quarter", label: "90 days" },
  { value: "year", label: "1 year" },
];

export function AnalyticsDashboard() {
  const [range, setRange] = useState("month");

  const { data, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["analytics", range],
    queryFn: () => api(`/api/analytics?range=${range}`),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <EmptyState
        icon="📊"
        title="Failed to load analytics"
        description="Something went wrong. Please try again."
        action={{ label: "Retry", onClick: () => window.location.reload() }}
      />
    );
  }

  const { summary, charts, topTags } = data;

  const statCards = [
    {
      label: "Total Meetings",
      value: summary.totalMeetings.toString(),
      trend: `${summary.completedMeetings} completed`,
      icon: Calendar,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Meeting Rate",
      value: `${summary.meetingCompletionRate}%`,
      trend: "completion rate",
      icon: Target,
      color: "text-[var(--color-brand-500)]",
      bg: "bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)]/20",
    },
    {
      label: "Total Tasks",
      value: summary.totalTasks.toString(),
      trend: `${summary.completedTasks} completed`,
      icon: CheckCircle2,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Task Rate",
      value: `${summary.taskCompletionRate}%`,
      trend: "completion rate",
      icon: TrendingUp,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Insights into your meeting and task activity
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                range === opt.value
                  ? "bg-[var(--color-brand-100)] text-[var(--color-brand-700)] dark:bg-[var(--color-brand-900)] dark:text-[var(--color-brand-200)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">{card.label}</p>
                <p className="mt-1 font-display text-2xl font-bold text-[var(--color-text-primary)]">
                  {card.value}
                </p>
                <p className="mt-1 text-[11px] text-[var(--color-text-light)]">{card.trend}</p>
              </div>
              <div className={cn("rounded-lg p-2.5", card.bg)}>
                <card.icon className={cn("h-5 w-5", card.color)} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Meetings Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-[var(--color-brand-500)]" />
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Meetings Over Time</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.meetingsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Tasks by Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="h-4 w-4 text-[var(--color-brand-500)]" />
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Tasks by Status</h3>
          </div>
          <div className="h-64 flex items-center justify-center">
            {charts.tasksByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.tasksByStatus.map((s) => ({
                      name: STATUS_LABELS[s.status] || s.status,
                      value: s.count,
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {charts.tasksByStatus.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-[var(--color-text-light)]">No task data</p>
            )}
          </div>
          {/* Legend */}
          <div className="flex justify-center gap-4 mt-2">
            {charts.tasksByStatus.map((s, i) => (
              <div key={s.status} className="flex items-center gap-1.5">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                <span className="text-[11px] text-[var(--color-text-muted)]">
                  {STATUS_LABELS[s.status] || s.status} ({s.count})
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tasks by Priority */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Hash className="h-4 w-4 text-[var(--color-brand-500)]" />
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Tasks by Priority</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts.tasksByPriority.map((p) => ({
                  name: p.priority,
                  count: p.count,
                }))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {charts.tasksByPriority.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={PRIORITY_COLORS[entry.priority] || "#8b5cf6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Tags */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-4 w-4 text-[var(--color-brand-500)]" />
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Top Tags</h3>
          </div>
          {topTags.length > 0 ? (
            <div className="space-y-3">
              {topTags.map((t, i) => (
                <div key={t.tag} className="flex items-center gap-3">
                  <span className="text-xs text-[var(--color-text-muted)] w-5">{i + 1}.</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[var(--color-text-primary)]">{t.tag}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">{t.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--color-surface-tertiary)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--color-brand-500)] transition-all"
                        style={{
                          width: `${Math.min((t.count / Math.max(...topTags.map((x) => x.count))) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--color-text-light)]">No tags used yet</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
