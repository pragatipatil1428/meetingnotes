"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { motion } from "framer-motion";
import {
  Sparkles,
  ListChecks,
  Loader2,
  CheckCircle2,
  X,
  Info,
} from "lucide-react";

interface AiPanelProps {
  meetingId: string;
  notes: string;
  onClose: () => void;
}

interface ExtractResult {
  tasksCreated: number;
  tasks: { id: string; title: string }[];
}

export function AiPanel({ meetingId, notes, onClose }: AiPanelProps) {
  const queryClient = useQueryClient();
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [error, setError] = useState("");

  const extractMutation = useMutation({
    mutationFn: () =>
      api<ExtractResult>(`/api/meetings/${meetingId}/extract-tasks`, {
        method: "POST",
      }),
    onSuccess: (res) => {
      setResult(res);
      setError("");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["meeting", meetingId] });
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const hasNotes = notes.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
    >
      {/* Header */}
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--color-brand-500)]" />
          <h3 className="font-display text-base font-bold text-[var(--color-text-primary)]">
            AI Assistant
          </h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-[var(--color-text-light)] transition-colors hover:bg-[var(--color-border-light)] hover:text-[var(--color-text-primary)]"
          aria-label="Close AI assistant"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="text-xs text-[var(--color-text-muted)]">
        Turn your meeting notes into actionable tasks automatically.
      </p>

      {/* Extract button */}
      <div className="mt-4">
        <button
          onClick={() => extractMutation.mutate()}
          disabled={extractMutation.isPending || !hasNotes}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brand-600)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-brand-700)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {extractMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Extracting tasks…
            </>
          ) : (
            <>
              <ListChecks className="h-4 w-4" />
              Extract Tasks
            </>
          )}
        </button>
      </div>

      {/* No notes hint */}
      {!hasNotes && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-tertiary)] px-3 py-2">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-text-light)]" />
          <p className="text-[11px] leading-relaxed text-[var(--color-text-muted)]">
            Add notes to this meeting first, then extract tasks from them.
          </p>
        </div>
      )}

      {/* Supported formats hint */}
      <div className="mt-3 rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-tertiary)] px-3 py-2">
        <p className="text-[11px] leading-relaxed text-[var(--color-text-muted)]">
          Tasks are picked up from <span className="font-medium text-[var(--color-text-secondary)]">bullet points</span>,{" "}
          <span className="font-medium text-[var(--color-text-secondary)]">checkboxes</span> ({"- [ ]"}),{" "}
          <span className="font-medium text-[var(--color-text-secondary)]">numbered lists</span>, and{" "}
          <span className="font-medium text-[var(--color-text-secondary)]">"Task: …"</span> lines in your notes.
        </p>
      </div>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-lg border border-[var(--color-brand-100)] bg-[var(--color-brand-50)] p-4 dark:border-[var(--color-brand-800)] dark:bg-[var(--color-brand-900)]/20"
        >
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-primary)]">
            <CheckCircle2 className="h-4 w-4 text-[var(--color-brand-500)]" />
            {result.tasksCreated} task{result.tasksCreated === 1 ? "" : "s"} created
          </div>
          <ul className="space-y-1.5">
            {result.tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-start gap-2 text-sm text-[var(--color-text-primary)]"
              >
                <ListChecks className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-brand-500)]" />
                {task.title}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
    </motion.div>
  );
}
