"use client";

import { motion } from "framer-motion";
import { Video, MoreHorizontal } from "lucide-react";
import { RECENT_MEETINGS } from "@/lib/constants";

export function RecentMeetings() {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-[var(--color-text-primary)]">
          Upcoming meetings
        </h3>
        <button className="text-xs font-medium text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)]">
          View all
        </button>
      </div>

      <div className="space-y-1">
        {RECENT_MEETINGS.map((meeting, index) => (
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
                {meeting.time}
              </span>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="inline-block rounded bg-[var(--color-brand-100)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--color-brand-700)] dark:bg-[var(--color-brand-900)] dark:text-[var(--color-brand-200)]">
                  {meeting.category}
                </span>
              </div>
              <p className="mt-0.5 text-sm font-medium text-[var(--color-text-primary)]">
                {meeting.title}
              </p>
              <p className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                <Video className="h-3 w-3" />
                {meeting.participants} participants
              </p>
            </div>

            {/* Actions */}
            <button className="rounded-lg p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
              <MoreHorizontal className="h-4 w-4 text-[var(--color-text-light)]" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
