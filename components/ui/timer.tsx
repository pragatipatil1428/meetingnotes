"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { Play, Square, Clock, Loader2 } from "lucide-react";
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
  // Use local state that we control — no sync useEffect back to props
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const startedRef = useRef<string | null>(null);
  const queryClient = useQueryClient();

  // Initialize once from props on mount
  useEffect(() => {
    if (!initialized) {
      setIsRunning(!!startedAt);
      setElapsed(timeSpent || 0);
      startedRef.current = startedAt;
      setInitialized(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Tick every second when running
  useEffect(() => {
    if (!isRunning || !startedRef.current) return;

    const startedMs = new Date(startedRef.current).getTime();
    const interval = setInterval(() => {
      setElapsed(timeSpent + Math.floor((Date.now() - startedMs) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeSpent]);

  const timerMutation = useMutation({
    mutationFn: (action: "start" | "stop") =>
      api(`/api/${entityType}/${entityId}/timer`, {
        method: "POST",
        body: JSON.stringify({ action }),
      }),
    onSuccess: (data: any) => {
      // Update from server response
      if (data?.startedAt) {
        startedRef.current = data.startedAt;
        setIsRunning(true);
      } else {
        startedRef.current = null;
        setIsRunning(false);
        setElapsed(data?.timeSpent ?? elapsed);
      }

      queryClient.invalidateQueries({ queryKey: [entityType] });
      if (onUpdate) onUpdate();
    },
    onError: () => {
      // Revert on error
      setIsRunning(!!startedRef.current);
    },
  });

  const handleStart = () => {
    setIsRunning(true);
    timerMutation.mutate("start");
  };

  const handleStop = () => {
    setIsRunning(false);
    timerMutation.mutate("stop");
  };

  const isCompleted = status === "COMPLETED" || status === "DONE" || status === "CANCELLED";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex items-center gap-3 rounded-lg border px-3 py-2 transition-all",
        isRunning
          ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
          : "border-[var(--color-border-light)] bg-[var(--color-surface-tertiary)]",
        size === "sm" && "px-2 py-1.5 gap-2"
      )}
    >
      <Clock
        className={cn(
          "shrink-0",
          isRunning ? "text-green-500 animate-pulse" : "text-[var(--color-text-light)]",
          size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"
        )}
      />

      <span
        className={cn(
          "font-mono font-medium tabular-nums",
          isRunning ? "text-green-700 dark:text-green-300" : "text-[var(--color-text-primary)]",
          size === "sm" ? "text-xs" : "text-sm"
        )}
      >
        {formatDuration(elapsed)}
      </span>

      {!isCompleted && (
        <>
          {isRunning ? (
            <button
              onClick={handleStop}
              disabled={timerMutation.isPending}
              className="ml-auto flex items-center gap-1 rounded-md bg-red-500 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
            >
              {timerMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Square className="h-3 w-3" />
              )}
              Stop
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={timerMutation.isPending}
              className="ml-auto flex items-center gap-1 rounded-md bg-green-500 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-50"
            >
              {timerMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Play className="h-3 w-3" />
              )}
              Start
            </button>
          )}
        </>
      )}
    </motion.div>
  );
}
