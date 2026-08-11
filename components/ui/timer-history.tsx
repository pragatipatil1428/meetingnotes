"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { cn, formatTime } from "@/lib/utils";
import { History, Loader2, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface TimerEvent {
  id: string;
  entityType: string;
  entityId: string;
  action: "START" | "PAUSE" | "RESUME" | "STOP";
  timeSpent: number;
  userId: string;
  createdAt: string;
}

interface TimerHistoryProps {
  entityType: "meetings" | "tasks";
  entityId: string;
}

function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds < 0) return "0s";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0)
    return `${hours}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
  if (minutes > 0)
    return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  return `${seconds}s`;
}

const ACTION_LABEL: Record<TimerEvent["action"], string> = {
  START: "Started",
  PAUSE: "Paused",
  RESUME: "Resumed",
  STOP: "Stopped",
};

const ACTION_DOT: Record<TimerEvent["action"], string> = {
  START: "bg-green-500",
  PAUSE: "bg-amber-500",
  RESUME: "bg-green-500",
  STOP: "bg-red-500",
};

export function TimerHistory({ entityType, entityId }: TimerHistoryProps) {
  const { data, isLoading, error } = useQuery<TimerEvent[]>({
    queryKey: ["timerHistory", entityType, entityId],
    queryFn: () => api(`/api/${entityType}/${entityId}/timer`),
  });

  const events = data || [];
  const pauseCount = events.filter((e) => e.action === "PAUSE").length;
  const lastEvent = events[events.length - 1];
  const lastAction = lastEvent?.action;
  const isRunning = lastAction === "START" || lastAction === "RESUME";

  // For each PAUSE, measure how long the timer stayed paused until the
  // next RESUME or STOP (events are chronological). The Resume row right
  // below already shows the resume time.
  const pauseDurations = new Map<string, number>();
  events.forEach((event, i) => {
    if (event.action !== "PAUSE") return;
    const next = events[i + 1];
    if (!next || (next.action !== "RESUME" && next.action !== "STOP")) return;
    const ms =
      new Date(next.createdAt).getTime() - new Date(event.createdAt).getTime();
    if (ms >= 0) pauseDurations.set(event.id, Math.floor(ms / 1000));
  });

  // Tick once per second while running so the live Total stays in sync
  // with the ticking timer above.
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  // Last event's timeSpent is the accumulated time up to that event.
  // If the timer is still running, add the elapsed time since the last
  // START/RESUME so the Total matches the ticking timer.
  let totalTime = lastEvent?.timeSpent || 0;
  if (isRunning && lastEvent) {
    totalTime += Math.max(
      0,
      Math.floor((Date.now() - new Date(lastEvent.createdAt).getTime()) / 1000)
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[1px] text-[var(--color-text-primary)]">
          <History className="h-3.5 w-3.5 text-[var(--color-brand-500)]" />
          Timer History
        </h3>
        {events.length > 0 && (
          <div className="flex items-center gap-2 text-[11px]">
            <span className="rounded-full bg-[var(--color-surface-tertiary)] px-2 py-0.5 font-medium text-[var(--color-text-secondary)]">
              Total: {formatDuration(totalTime)}
            </span>
            {pauseCount > 0 && (
              <span className="rounded-full bg-[var(--color-surface-tertiary)] px-2 py-0.5 font-medium text-[var(--color-text-secondary)]">
                {pauseCount} pause{pauseCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--color-text-light)]" />
        </div>
      ) : error ? (
        <p className="py-4 text-center text-xs text-[var(--color-text-muted)]">
          Failed to load timer history.
        </p>
      ) : events.length === 0 ? (
        <p className="flex items-center justify-center gap-1.5 py-6 text-xs text-[var(--color-text-muted)]">
          <Clock className="h-3.5 w-3.5" />
          No timer activity yet — start the timer to begin tracking.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--color-border-light)]">
          {events.map((event) => (
            <li
              key={event.id}
              className="flex items-center gap-2.5 py-2 text-sm"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full",
                  ACTION_DOT[event.action]
                )}
              />
              <span className="font-medium text-[var(--color-text-primary)]">
                {ACTION_LABEL[event.action]}
              </span>
              <span className="ml-auto shrink-0 text-xs text-[var(--color-text-light)]">
                {formatTime(event.createdAt)}
              </span>
              {event.action === "PAUSE" &&
                (pauseDurations.has(event.id) ? (
                  <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    Paused for {formatDuration(pauseDurations.get(event.id)!)}
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    Still paused
                  </span>
                ))}
            </li>
          ))}
          {isRunning && (
            <li className="flex items-center gap-2.5 py-2 text-sm">
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-green-500"
              />
              <span className="font-medium text-green-700 dark:text-green-300">
                Running now
              </span>
            </li>
          )}
        </ul>
      )}
    </motion.div>
  );
}
