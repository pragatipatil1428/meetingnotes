"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { formatDate, formatTime, cn, getEffectiveMeetingStatus } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AiPanel } from "./ai-panel";
import { MeetingForm, toLocalDateTimeInputValue } from "./meeting-form";
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
  Loader2,
  Fingerprint,
  ListChecks,
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
  const queryClient = useQueryClient();

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
    PAST: "bg-amber-100 text-amber-900",
    IN_PROGRESS: "bg-[var(--color-brand-100)] text-[var(--color-brand-800)]",
    COMPLETED: "bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]",
    CANCELLED: "bg-[var(--color-border-light)] text-[var(--color-text-light)]",
  };

  const displayStatus = getEffectiveMeetingStatus(meeting.status, meeting.meetingAt);

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

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAiPanel(!showAiPanel)}
            className={showAiPanel ? "border-[var(--color-brand-300)] text-[var(--color-brand-700)] dark:text-[var(--color-brand-200)]" : ""}
          >
            <ListChecks className="h-4 w-4" />
            Extract Tasks
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            loading={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Main content */}
        <div>
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
                          statusColors[displayStatus]
                        )}
                      >
                        {displayStatus.replace("_", " ")}
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
                        availableFrom={meeting.meetingAt instanceof Date ? meeting.meetingAt.toISOString() : String(meeting.meetingAt)}
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
          </motion.div>

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
      </div>

      {/* AI Assistant — extract tasks from notes */}
      {showAiPanel && !isEditing && (
        <AiPanel
          meetingId={meeting.id}
          notes={meeting.notes}
          onClose={() => setShowAiPanel(false)}
        />
      )}

      {/* Edit Meeting modal — same full form used when creating */}
      {isEditing && (
        <MeetingForm
          meetingId={meeting.id}
          lockTime={meeting.status === "IN_PROGRESS"}
          initialData={{
            title: meeting.title,
            notes: meeting.notes,
            meetingAt: toLocalDateTimeInputValue(new Date(meeting.meetingAt)),
            tags: meeting.tags,
            participants: meeting.participants?.map((p) => ({
              email: p.email,
              name: p.name || undefined,
            })),
          }}
          onClose={() => setIsEditing(false)}
          onSuccess={() => {
            setIsEditing(false);
            queryClient.invalidateQueries({ queryKey: ["meetings"] });
            queryClient.invalidateQueries({ queryKey: ["meeting", meeting.id] });
          }}
        />
      )}

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