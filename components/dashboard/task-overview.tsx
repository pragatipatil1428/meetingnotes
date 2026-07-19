"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DASHBOARD_TASKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function TaskOverview() {
  const [tasks, setTasks] = useState(
    DASHBOARD_TASKS.map((t) => ({ ...t }))
  );

  const toggle = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-[var(--color-text-primary)]">
          My tasks
        </h3>
        <span className="text-xs text-[var(--color-text-muted)]">
          {tasks.filter((t) => t.done).length}/{tasks.length} done
        </span>
      </div>

      <div className="space-y-1">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className={cn(
              "flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-[var(--color-surface-tertiary)]",
              task.done && "opacity-60"
            )}
          >
            <button
              onClick={() => toggle(task.id)}
              className={cn(
                "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all",
                task.done
                  ? "border-[var(--color-brand-600)] bg-[var(--color-brand-600)]"
                  : "border-[var(--color-border-input)] hover:border-[var(--color-brand-400)]"
              )}
              aria-label={`Mark "${task.title}" as ${task.done ? "incomplete" : "complete"}`}
            >
              {task.done && (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="h-3 w-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </motion.svg>
              )}
            </button>

            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm font-medium transition-all",
                  task.done
                    ? "text-[var(--color-text-light)] line-through"
                    : "text-[var(--color-text-primary)]"
                )}
              >
                {task.title}
              </p>
              <span
                className={cn(
                  "mt-0.5 inline-block text-[10px] font-semibold uppercase tracking-wider",
                  task.priority === "High"
                    ? "text-amber-600"
                    : "text-[var(--color-text-muted)]"
                )}
              >
                {task.priority} priority
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
