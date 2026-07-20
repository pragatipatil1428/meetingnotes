"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { X, Loader2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { TaskStatus, Priority } from "@/lib/types";

interface TaskFormProps {
  onClose: () => void;
  onSuccess: () => void;
  defaultStatus?: TaskStatus;
  meetingId?: string;
}

export function TaskForm({ onClose, onSuccess, defaultStatus = TaskStatus.TODO, meetingId }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [dueDate, setDueDate] = useState("");
  const [labelInput, setLabelInput] = useState("");
  const [labels, setLabels] = useState<string[]>([]);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api("/api/tasks", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => onSuccess(),
    onError: (err: Error) => setError(err.message),
  });

  const handleAddLabel = () => {
    const l = labelInput.trim();
    if (l && !labels.includes(l)) {
      setLabels([...labels, l]);
      setLabelInput("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    mutation.mutate({
      title: title.trim(),
      description,
      status,
      priority,
      dueDate: dueDate || null,
      labels,
      meetingId: meetingId || null,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-modal)]"
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border-light)] px-5 py-4">
          <h2 className="font-display text-lg font-bold text-[var(--color-text-primary)]">
            New Task
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[var(--color-text-light)] hover:bg-[var(--color-border-light)]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-light)] focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add more details..."
              className="w-full rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-light)] focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)] resize-none"
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
            />
          </div>

          {/* Labels */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]">Labels</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLabel())}
                placeholder="Add label..."
                className="flex-1 rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-light)] focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddLabel}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {labels.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {labels.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 rounded-md bg-[var(--color-surface-tertiary)] px-2 py-1 text-xs font-medium text-[var(--color-text-muted)]"
                  >
                    {label}
                    <button type="button" onClick={() => setLabels(labels.filter((l) => l !== label))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-[var(--color-border-light)] pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={mutation.isPending}>
              Create Task
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
