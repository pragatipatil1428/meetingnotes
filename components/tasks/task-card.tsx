"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { cn, formatDateShort, formatTime } from "@/lib/utils";
import { PRIORITY_COLORS } from "@/lib/constants";
import { motion } from "framer-motion";
import { Trash2, GripVertical, Calendar, MessageSquare } from "lucide-react";
import type { Task } from "@/lib/types";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => api(`/api/tasks/${task.id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition-all hover:border-[var(--color-brand-300)] hover:shadow-sm"
    >
      <div className="flex items-start gap-2">
        <button
          onClick={() => setIsDeleting(true)}
          className="mt-0.5 rounded p-0.5 text-[var(--color-text-light)] opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>

        <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
          <h4 className="text-sm font-medium text-[var(--color-text-primary)] leading-snug line-clamp-2">
            {task.title}
          </h4>

          {task.description && (
            <p className="mt-1 text-xs text-[var(--color-text-muted)] line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", PRIORITY_COLORS[task.priority])}>
              {task.priority}
            </span>

            {task.labels?.length > 0 && (
              <div className="flex gap-1">
                {task.labels.slice(0, 2).map((label) => (
                  <span
                    key={label}
                    className="rounded bg-[var(--color-surface-tertiary)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-muted)]"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {task.dueDate && (
            <div className="mt-2 flex items-center gap-1 text-[10px] text-[var(--color-text-light)]">
              <Calendar className="h-3 w-3" />
              {formatDateShort(task.dueDate)}
            </div>
          )}

          {task.meeting && (
            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-[var(--color-brand-500)]">
              <MessageSquare className="h-3 w-3" />
              {task.meeting.title}
            </div>
          )}
          <div className="mt-1.5 text-[10px] text-[var(--color-text-light)]">
            Created {formatDateShort(task.createdAt)} at {formatTime(task.createdAt)}
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      {isDeleting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-[var(--color-surface)]/95 backdrop-blur-sm"
        >
          <div className="text-center">
            <p className="mb-2 text-xs font-medium text-[var(--color-text-secondary)]">Delete task?</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  deleteMutation.mutate();
                }}
                className="rounded-md bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => setIsDeleting(false)}
                className="rounded-md bg-[var(--color-border-light)] px-3 py-1 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
