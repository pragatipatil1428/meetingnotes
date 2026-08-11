"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Video, MoreHorizontal, Loader2 } from "lucide-react";
import { api } from "@/lib/api/client";
import Link from "next/link";

interface Meeting {
  id: string;
  title: string;
  meetingAt: string;
  status: string;
  tags: string[];
  participants: { id: string; name: string | null; email: string }[];
  _count: { tasks: number };
}

interface MeetingsResponse {
  items: Meeting[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export function RecentMeetings() {
  const { data, isLoading } = useQuery<MeetingsResponse>({
    queryKey: ["meetings", "dashboard"],
    queryFn: () =>
      api("/api/meetings?pageSize=5&status=SCHEDULED,IN_PROGRESS"),
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-sm font-bold text-[var(--color-text-primary)]">
            Upcoming meetings
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--color-text-light)]" />
        </div>
      </div>
    );
  }

  const meetings = data?.items || [];

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-[var(--color-text-primary)]">
          Upcoming meetings
        </h3>
        <Link
          href="/meetings"
          className="text-xs font-medium text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)]"
        >
          View all
        </Link>
      </div>

      {meetings.length === 0 ? (
        <p className="py-4 text-center text-sm text-[var(--color-text-muted)]">
          No meetings yet
        </p>
      ) : (
        <div className="space-y-1">
          {meetings.map((meeting, index) => {
            const meetingDate = new Date(meeting.meetingAt);
            const timeStr = meetingDate.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });

            return (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-[var(--color-surface-tertiary)]"
              >
                {/* Time */}
                <div className="flex w-14 flex-shrink-0 flex-col items-center">
                  <span className="text-[10px] font-semibold text-[var(--color-text-light)]">
                    {timeStr}
                  </span>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {meeting.tags?.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="inline-block rounded bg-[var(--color-brand-100)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--color-brand-700)] dark:bg-[var(--color-brand-900)] dark:text-[var(--color-brand-200)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="mt-0.5 text-sm font-medium text-[var(--color-text-primary)]">
                    {meeting.title}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                    <Video className="h-3 w-3" />
                    {meeting.participants?.length || 0} participants
                    {meeting._count?.tasks > 0 && ` · ${meeting._count.tasks} tasks`}
                  </p>
                </div>

                {/* Actions */}
                <button className="rounded-lg p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4 text-[var(--color-text-light)]" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
