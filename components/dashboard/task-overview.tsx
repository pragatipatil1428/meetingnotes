"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, CheckSquare } from "lucide-react";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Task, PaginatedList } from "@/lib/types";

export function TaskOverview() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<PaginatedList<Task>>({
    queryKey: ["tasks", "dashboard"],
    queryFn: () => api("/api/tasks?pageSize=1000"),
  });

  const tasks = data?.items;

  const toggleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return api(`/api/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: status === "DONE" ? "TODO" : "DONE" }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const taskList = tasks || [];

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand-100)] text-[var(--color-brand-700)] dark:bg-[var(--color-brand-900)] dark:text-[var(--color-brand-200)]">
            <CheckSquare className="h-4 w-4" />
          </span>
          <h3 className="font-display text-sm font-bold text-[var(--color-text-primary)]">
            My tasks
          </h3>
        </div>
        <Link
          href="/tasks"
          className="text-xs font-medium text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)]"
        >
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--color-text-light)]" />
        </div>
      ) : taskList.length === 0 ? (
        <p className="py-4 text-center text-sm text-[var(--color-text-muted)]">
          No tasks yet
        </p>
      ) : (
        <div className="space-y-1">
          {taskList.slice(0, 5).map((task, index) => {
            const isDone = task.status === "DONE";
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className={cn(
                  "flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-[var(--color-surface-tertiary)]",
                  isDone && "opacity-60"
                )}
              >
                <button
                  onClick={() =>
                    toggleMutation.mutate({ id: task.id, status: task.status })
                  }
                  disabled={toggleMutation.isPending}
                  className={cn(
                    "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all",
                    isDone
                      ? "border-[var(--color-brand-600)] bg-[var(--color-brand-600)]"
                      : "border-[var(--color-border-input)] hover:border-[var(--color-brand-400)]"
                  )}
                  aria-label={`Mark "${task.title}" as ${isDone ? "incomplete" : "complete"}`}
                >
                  {isDone && (
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
                      isDone
                        ? "text-[var(--color-text-light)] line-through"
                        : "text-[var(--color-text-primary)]"
                    )}
                  >
                    {task.title}
                  </p>
                  <span
                    className={cn(
                      "mt-0.5 inline-block text-[10px] font-semibold uppercase tracking-wider",
                      task.priority
                        ? "text-[var(--color-text-muted)]"
                        : "text-[var(--color-text-light)]"
                    )}
                  >
                    {task.priority} priority
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
