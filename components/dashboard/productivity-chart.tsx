"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { api } from "@/lib/api/client";
import { Loader2, TrendingUp } from "lucide-react";

interface AnalyticsResponse {
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
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 shadow-[var(--shadow-elevated)]">
        <p className="text-xs font-medium text-[var(--color-text-muted)]">
          {label}
        </p>
        <p className="text-sm font-bold text-[var(--color-brand-600)]">
          {payload[0].value} meetings
        </p>
      </div>
    );
  }
  return null;
};

export function ProductivityChart() {
  const { data, isLoading } = useQuery<AnalyticsResponse>({
    queryKey: ["analytics", "week"],
    queryFn: () => api("/api/analytics?range=week"),
  });

  // Transform meetingsOverTime into chart data with day names
  const chartData = (data?.charts?.meetingsOverTime || []).map((d) => {
    const dayName = new Date(d.date).toLocaleDateString("en-US", {
      weekday: "short",
    });
    return { name: dayName, value: d.count };
  });

  // If no data for the week, show empty state
  const hasData = chartData.length > 0;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand-100)] text-[var(--color-brand-700)] dark:bg-[var(--color-brand-900)] dark:text-[var(--color-brand-200)]">
            <TrendingUp className="h-4 w-4" />
          </span>
          <h3 className="font-display text-sm font-bold text-[var(--color-text-primary)]">
            Productivity
          </h3>
        </div>
        <span className="text-xs text-[var(--color-text-muted)]">
          This week
        </span>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--color-text-light)]" />
        </div>
      ) : !hasData ? (
        <div className="flex h-48 items-center justify-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            No activity this week
          </p>
        </div>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
            >
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 11,
                  fill: "var(--color-text-light)",
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 11,
                  fill: "var(--color-text-light)",
                }}
                allowDecimals={false}
                tickFormatter={(v: number) => `${v}`}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "var(--color-border-light)" }}
              />
              <Bar
                dataKey="value"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
                fill="var(--color-brand-600)"
                animationBegin={300}
                animationDuration={800}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
