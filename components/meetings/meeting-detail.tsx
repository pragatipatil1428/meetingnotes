"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { formatDate, formatTime, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AiPanel } from "./ai-panel";
import type { Meeting } from "@/lib/types";
import {
  Video,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Tag,
  Edit3,
  Trash2,
  Sparkles,
  CheckCircle,
  Circle,
  Loader2,
  Fingerprint,
} from "lucide-react";
import { motion } from "framer-motion";
import { Timer } from "@/components/ui/timer";
import { TimerHistory } from "@/components/ui/timer-history";

interface MeetingDetailProps {
  meeting: Meeting;
  onBack: () => void;
  onDelete: (id: string) => void;
}

export function MeetingDetail({ meeting, onBack, onDelete }: MeetingDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editTitle, setEditTitle] = useState(meeting.title);
  const [editNotes, setEditNotes] = useState(meeting.notes);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api(`/api/meetings/${meeting.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meeting", meeting.id] });
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api(`/api/meetings/${meeting.id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meeting", meeting.id] });
      onBack();
      onDelete(meeting.id);
    },
  });

  const statusColors: Record<string, string> = {
    SCHEDULED: "bg-[var(--color-brand-50)] text-[var(--color-brand-700)]",
    IN_PROGRESS: "bg-[var(--color-brand-100)] text-[var(--color-brand-800)]",
    COMPLETED: "bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]",
    CANCELLED: "bg-[var(--color-border-light)] text-[var(--color-text-light)]",
  };

  return (
    <div className="space-y-6">
      {/* Back button & actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to meetings
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAiPanel(!showAiPanel)}
          >
            <Sparkles className={cn("mr-1.5 h-4 w-4", showAiPanel && "text-[var(--color-brand-500)]")} />
            AI
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit3 className="mr-1.5 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            loading={deleteMutation.isPending}
            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Meeting header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
          >
            {/* Meeting ID badge */}
            <div className="mb-4 flex items-center gap-1.5">
              <Fingerprint className="h-3.5 w-3.5 text-[var(--color-text-light)]" />
              <span className="text-[11px] font-mono text-[var(--color-text-light)]">
                ID: {meeting.id.slice(0, 8)}...
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(meeting.id)}
                className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-brand-500)] transition-colors"
                title="Copy full ID"
              >
                Copy
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface)] px-3 py-2 text-lg font-semibold text-[var(--color-text-primary)] focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
                />
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={8}
                  className="w-full rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)] resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      updateMutation.mutate({ title: editTitle, notes: editNotes })
                    }
                    loading={updateMutation.isPending}
                  >
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-[var(--color-brand-500)]" />
                      <h2 className="font-display text-xl font-bold text-[var(--color-text-primary)]">
                        {meeting.title}
                      </h2>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[var(--color-text-secondary)]">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(meeting.meetingAt)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(meeting.meetingAt)}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium",
                          statusColors[meeting.status]
                        )}
                      >
                        {meeting.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Timer */}
                  {meeting.status !== "CANCELLED" && (
                    <div className="mt-4">
                      <Timer
                        entityType="meetings"
                        entityId={meeting.id}
                        startedAt={meeting.startedAt ? (meeting.startedAt instanceof Date ? meeting.startedAt.toISOString() : String(meeting.startedAt)) : null}
                        timeSpent={meeting.timeSpent}
                        status={meeting.status}
                        onUpdate={() => {
                          queryClient.invalidateQueries({ queryKey: ["meetings"] });
                          queryClient.invalidateQueries({ queryKey: ["meeting", meeting.id] });
                          queryClient.invalidateQueries({ queryKey: ["timerHistory", "meetings", meeting.id] });
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Tags */}
                {meeting.tags && meeting.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {meeting.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-md bg-[var(--color-surface-tertiary)] px-2 py-1 text-[11px] font-medium text-[var(--color-text-muted)]"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes */}
                <div className="mt-5">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-[1px] text-[var(--color-text-light)]">
                    Notes
                  </h3>
                  <div className="prose prose-sm max-w-none text-[var(--color-text-primary)] whitespace-pre-wrap">
                    {meeting.notes || (
                      <span className="text-[var(--color-text-light)] italic">No notes recorded.</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* AI Summary */}
          {meeting.summary && !isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
                <Sparkles className="h-4 w-4 text-[var(--color-brand-500)]" />
                AI Summary
              </div>
              <p className="mt-2 text-sm text-[var(--color-text-primary)]">{meeting.summary}</p>
            </motion.div>
          )}

          {/* Key Decisions & Action Items */}
          {!isEditing && (meeting.keyDecisions?.length > 0 || meeting.actionItems?.length > 0) && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {meeting.keyDecisions?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
                >
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-[1px] text-[var(--color-text-primary)]">
                    Key Decisions
                  </h3>
                  <ul className="space-y-2">
                    {meeting.keyDecisions.map((decision, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-primary)]">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-500)]" />
                        {decision}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {meeting.actionItems?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
                >
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-[1px] text-[var(--color-text-primary)]">
                    Action Items
                  </h3>
                  <ul className="space-y-2">
                    {meeting.actionItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-primary)]">
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-500)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
          )}

          {/* Participants */}
          {meeting.participants?.length > 0 && !isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
            >
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[1px] text-[var(--color-text-light)]">
                Participants ({meeting.participants.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {meeting.participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 rounded-lg bg-[var(--color-surface-tertiary)] px-3 py-1.5 text-sm"
                  >
                    <User className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                    <span className="text-[var(--color-text-primary)]">{p.email}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Timer History */}
          {!isEditing && (
            <TimerHistory entityType="meetings" entityId={meeting.id} />
          )}
        </div>

        {/* AI Panel Sidebar */}
        <div className="lg:col-span-1">
          {showAiPanel && (
            <AiPanel
              meetingId={meeting.id}
              notes={meeting.notes}
              onMeetingUpdated={() => {
                queryClient.invalidateQueries({ queryKey: ["meetings"] });
                queryClient.invalidateQueries({ queryKey: ["meeting", meeting.id] });
              }}
            />
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
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
              Delete Meeting
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Are you sure you want to delete &ldquo;{meeting.title}&rdquo;? This action cannot be undone.
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
    </div>
  );
}