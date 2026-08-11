"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { Play, Pause, Square, Clock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface TimerProps {
  entityType: "meetings" | "tasks";
  entityId: string;
  startedAt: string | null;
  timeSpent: number;
  status: string;
  onUpdate?: () => void;
  size?: "sm" | "md";
}

function formatDuration(totalSeconds: number): string {
  // Safety check for NaN or undefined
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds < 0) {
    return "0s";
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  }
  return `${seconds}s`;
}

export function Timer({
  entityType,
  entityId,
  startedAt,
  timeSpent,
  status,
  onUpdate,
  size = "md",
}: TimerProps) {
  // Local state we control. startedAt lives in state (not a ref) so the
  // tick effect re-runs once the server confirms the timer started.
  const [startedAtState, setStartedAtState] = useState<string | null>(startedAt);
  const [isRunning, setIsRunning] = useState(() => !!startedAt);
  const [isPaused, setIsPaused] = useState(
    () => !startedAt && status === "IN_PROGRESS" && (timeSpent || 0) > 0
  );
  const [isFinished, setIsFinished] = useState(
    () =>
      status === "COMPLETED" ||
      status === "DONE" ||
      status === "CANCELLED"
  );
  const [elapsed, setElapsed] = useState(timeSpent || 0);
  // Accumulated seconds from the last server response (updated on pause/stop)
  const baseRef = useRef(timeSpent || 0);
  const queryClient = useQueryClient();

  // Tick every second when running
  useEffect(() => {
    if (!isRunning || !startedAtState) return;

    const startedMs = new Date(startedAtState).getTime();
    const interval = setInterval(() => {
      setElapsed(baseRef.current + Math.floor((Date.now() - startedMs) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, startedAtState]);

  /** Merge the server response into cached detail + list queries. */
  const applyCacheUpdate = (data: any) => {
    if (!data) return;
    // Detail queries: ["meeting", id] / ["task", id]
    const detailKey =
      entityType === "meetings" ? ["meeting", entityId] : ["task", entityId];
    queryClient.setQueryData(detailKey, (old: any) =>
      old ? { ...old, ...data } : old
    );
    // List queries: any key starting with ["meetings"] / ["tasks"]
    queryClient.setQueriesData({ queryKey: [entityType] }, (old: any) => {
      if (!old || !Array.isArray(old.items)) return old;
      return {
        ...old,
        items: old.items.map((item: any) =>
          item?.id === entityId ? { ...item, ...data } : item
        ),
      };
    });
  };

  const timerMutation = useMutation({
    mutationFn: (action: "start" | "pause" | "resume" | "stop") =>
      api(`/api/${entityType}/${entityId}/timer`, {
        method: "POST",
        body: JSON.stringify({ action }),
      }),
    onSuccess: (data: any) => {
      if (data?.startedAt) {
        // start / resume — keep accumulated time, begin ticking from server time
        baseRef.current = data.timeSpent ?? baseRef.current;
        setStartedAtState(data.startedAt);
        setIsRunning(true);
        setIsPaused(false);
      } else {
        // pause / stop — freeze at accumulated server time
        baseRef.current = data?.timeSpent ?? elapsed;
        setStartedAtState(null);
        setIsRunning(false);
        const finished =
          data?.status === "COMPLETED" ||
          data?.status === "DONE" ||
          data?.status === "CANCELLED";
        setIsPaused(!finished);
        setIsFinished(finished);
        setElapsed(baseRef.current);
      }

      // Optimistically update the cache so the status badge and list rows
      // reflect the change immediately — no manual refresh needed.
      applyCacheUpdate(data);
      queryClient.invalidateQueries({ queryKey: [entityType] });
      if (onUpdate) onUpdate();
    },
    onError: () => {
      // Revert to last server-confirmed state
      setIsRunning(!!startedAtState);
      setIsPaused(!startedAtState && baseRef.current > 0);
    },
  });

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    timerMutation.mutate("start");
  };

  const handleResume = () => {
    setIsRunning(true);
    setIsPaused(false);
    timerMutation.mutate("resume");
  };

  const handlePause = () => {
    setIsRunning(false);
    setIsPaused(true);
    timerMutation.mutate("pause");
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    timerMutation.mutate("stop");
  };

  const showControls = !isFinished;
  const showStop = isRunning || isPaused;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex items-center gap-3 rounded-lg border px-3 py-2 transition-all",
        isRunning
          ? "border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-900/20"
          : "border-[var(--color-border-light)] bg-[var(--color-surface-tertiary)]",
        size === "sm" && "px-2 py-1.5 gap-2"
      )}
    >
      <Clock
        className={cn(
          "shrink-0",
          isRunning ? "text-[var(--color-text-secondary)] animate-pulse" : "text-[var(--color-text-light)]",
          size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"
        )}
      />

      <span
        className={cn(
          "font-mono font-medium tabular-nums",
          isRunning
            ? "font-semibold text-[var(--color-text-primary)]"
            : "text-[var(--color-text-primary)]",
          size === "sm" ? "text-xs" : "text-sm"
        )}
      >
        {formatDuration(elapsed)}
      </span>

      {showControls && (
        <>
          {isRunning ? (
            <>
              <button
                onClick={handlePause}
                disabled={timerMutation.isPending}
                className="ml-auto flex items-center gap-1 rounded-md bg-amber-500 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
              >
                {timerMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Pause className="h-3 w-3" />
                )}
                Pause
              </button>
              <button
                onClick={handleStop}
                disabled={timerMutation.isPending}
                className="flex items-center gap-1 rounded-md bg-red-500 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {timerMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Square className="h-3 w-3" />
                )}
                Stop
              </button>
            </>
          ) : (
            <>
              <button
                onClick={isPaused ? handleResume : handleStart}
                disabled={timerMutation.isPending}
                className="ml-auto flex items-center gap-1 rounded-md bg-green-500 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-50"
              >
                {timerMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
                {isPaused ? "Resume" : "Start"}
              </button>
              {showStop && (
                <button
                  onClick={handleStop}
                  disabled={timerMutation.isPending}
                  className="flex items-center gap-1 rounded-md bg-red-500 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                >
                  {timerMutation.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Square className="h-3 w-3" />
                  )}
                  Stop
                </button>
              )}
            </>
          )}
        </>
      )}
    </motion.div>
  );
}
