"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/layout/shell";
import { SkeletonCard } from "@/components/ui/skeleton";
import { Timer } from "@/components/ui/timer";
import { TimerHistory } from "@/components/ui/timer-history";
import { motion } from "framer-motion";
import { api } from "@/lib/api/client";
import { cn, formatDateShort } from "@/lib/utils";
import { PRIORITY_COLORS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { TaskForm } from "@/components/tasks/task-form";
import {
  ArrowLeft,
  Calendar,
  Edit3,
  Fingerprint,
  Loader2,
  Trash2,
  MessageSquare,
  Tag,
  CheckSquare,
} from "lucide-react";
import type { Task } from "@/lib/types";

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const {
    data: task,
    isLoading,
    error,
  } = useQuery<Task>({
    queryKey: ["task", id],
    queryFn: () => api(`/api/tasks/${id}`),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => api(`/api/tasks/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      router.push("/tasks");
    },
  });

  if (isLoading) {
    return (
      <Shell>
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <SkeletonCard />
        </div>
      </Shell>
    );
  }

  if (error || !task) {
    return (
      <Shell>
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20"
          >
            <p className="text-sm text-red-600 dark:text-red-400">
              {error instanceof Error ? error.message : "Task not found"}
            </p>
            <button
              onClick={() => router.push("/tasks")}
              className="mt-4 rounded-lg bg-[var(--color-brand-600)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-700)]"
            >
              Back to tasks
            </button>
          </motion.div>
        </div>
      </Shell>
    );
  }

  const isDone = task.status === "DONE";

  return (
    <Shell>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Back button & actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/tasks")}
              className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to tasks
            </button>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowEdit(true)}
              >
                <Edit3 className="mr-1.5 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                loading={deleteMutation.isPending}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          {/* Task Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
          >
            {/* ID badge */}
            <div className="mb-4 flex items-center gap-1.5">
              <Fingerprint className="h-3.5 w-3.5 text-[var(--color-text-light)]" />
              <span className="text-[11px] font-mono text-[var(--color-text-light)]">
                ID: {task.id.slice(0, 8)}...
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(task.id)}
                className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-brand-500)] transition-colors"
                title="Copy full ID"
              >
                Copy
              </button>
            </div>

            {/* Title & Status */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <CheckSquare className="h-5 w-5 text-[var(--color-brand-500)] shrink-0" />
                  <h2 className="font-display text-xl font-bold text-[var(--color-text-primary)]">
                    {task.title}
                  </h2>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                      isDone
                        ? "bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]"
                        : task.status === "IN_PROGRESS"
                        ? "bg-[var(--color-brand-100)] text-[var(--color-brand-800)]"
                        : "bg-[var(--color-brand-50)] text-[var(--color-brand-700)]"
                    )}
                  >
                    {task.status === "IN_PROGRESS" ? "In Progress" : task.status}
                  </span>
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-medium",
                      PRIORITY_COLORS[task.priority]
                    )}
                  >
                    {task.priority}
                  </span>
                  {task.dueDate && (
                    <span className="flex items-center gap-1 text-xs text-[var(--color-text-light)]">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDateShort(task.dueDate)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <div className="mt-5">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-[1px] text-[var(--color-text-light)]">
                  Description
                </h3>
                <p className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            )}

            {/* Labels */}
            {task.labels?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {task.labels.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 rounded-md bg-[var(--color-surface-tertiary)] px-2 py-1 text-[11px] font-medium text-[var(--color-text-muted)]"
                  >
                    <Tag className="h-3 w-3" />
                    {label}
                  </span>
                ))}
              </div>
            )}

            {/* Meeting link */}
            {task.meeting && (
              <div className="mt-4 flex items-center gap-1.5 text-xs text-[var(--color-brand-500)]">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>From meeting: {task.meeting.title}</span>
              </div>
            )}

            {/* Timer */}
            {!isDone && (
              <div className="mt-5">
                <Timer
                  entityType="tasks"
                  entityId={task.id}
                  startedAt={task.startedAt ? (task.startedAt instanceof Date ? task.startedAt.toISOString() : String(task.startedAt)) : null}
                  timeSpent={task.timeSpent}
                  status={task.status}
                  onUpdate={() => {
                    queryClient.invalidateQueries({ queryKey: ["timerHistory", "tasks", task.id] });
                  }}
                />
              </div>
            )}

            {isDone && task.timeSpent > 0 && (
              <div className="mt-5">
                <Timer
                  entityType="tasks"
                  entityId={task.id}
                  startedAt={null}
                  timeSpent={task.timeSpent}
                  status={task.status}
                />
              </div>
            )}

            {/* Timer History */}
            <TimerHistory entityType="tasks" entityId={task.id} />
          </motion.div>
        </motion.div>
      </div>

      {/* Edit Task modal — same full form used when creating */}
      {showEdit && task && (
        <TaskForm
          taskId={task.id}
          initialData={{
            title: task.title,
            description: task.description || "",
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "",
            labels: task.labels,
          }}
          lockTime={task.status === "IN_PROGRESS"}
          onClose={() => setShowEdit(false)}
          onSuccess={() => {
            setShowEdit(false);
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["task", id] });
          }}
        />
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-modal)]"
          >
            <h3 className="font-display text-lg font-bold text-[var(--color-text-primary)]">
              Delete Task
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Are you sure you want to delete &ldquo;{task.title}&rdquo;? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-border-light)]"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
              >
                {deleteMutation.isPending ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </Shell>
  );
}
