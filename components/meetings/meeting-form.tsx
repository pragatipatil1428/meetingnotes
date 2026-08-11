"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { X, Plus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface MeetingFormProps {
  onClose: () => void;
  onSuccess: () => void;
  /** When present, the form updates this meeting instead of creating a new one. */
  meetingId?: string;
  /** Lock the date/time field (e.g. while the meeting is in progress). */
  lockTime?: boolean;
  initialData?: {
    title?: string;
    notes?: string;
    meetingAt?: string;
    tags?: string[];
    participants?: { email: string; name?: string }[];
  };
}

/** Format a Date as a local `datetime-local` input value (YYYY-MM-DDTHH:mm). */
export function toLocalDateTimeInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function MeetingForm({ onClose, onSuccess, meetingId, initialData, lockTime }: MeetingFormProps) {
  const isEditing = !!meetingId;
  const [title, setTitle] = useState(initialData?.title || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [meetingAt, setMeetingAt] = useState(
    initialData?.meetingAt || toLocalDateTimeInputValue(new Date(Date.now() + 60_000))
  );
  // Rolling minimum so past times can't be picked (refreshed every 30s)
  const [minDateTime, setMinDateTime] = useState(() =>
    toLocalDateTimeInputValue(new Date())
  );

  // The rolling minimum is only needed when creating — editing keeps its
  // existing time (which may legitimately be in the past).
  useEffect(() => {
    if (isEditing) return;
    const id = setInterval(() => {
      setMinDateTime(toLocalDateTimeInputValue(new Date()));
    }, 30_000);
    return () => clearInterval(id);
  }, [isEditing]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [emailInput, setEmailInput] = useState("");
  const [participants, setParticipants] = useState<{ email: string; name?: string }[]>(
    initialData?.participants || []
  );
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api(isEditing ? `/api/meetings/${meetingId}` : "/api/meetings", {
        method: isEditing ? "PUT" : "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      onSuccess();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const handleAddParticipant = () => {
    const e = emailInput.trim();
    if (e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && !participants.find((p) => p.email === e)) {
      setParticipants([...participants, { email: e }]);
      setEmailInput("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!meetingAt) {
      setError("Meeting date is required");
      return;
    }

    // Past times are only rejected on creation — when editing, the user may
    // need to keep/reschedule an existing meeting time.
    if (!isEditing && new Date(meetingAt).getTime() < Date.now()) {
      setError("Meeting time cannot be in the past");
      return;
    }

    mutation.mutate({
      title: title.trim(),
      notes,
      meetingAt,
      tags,
      participants,
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
        className="w-full max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-modal)]"
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border-light)] px-5 py-4">
          <h2 className="font-display text-lg font-bold text-[var(--color-text-primary)]">
            {isEditing ? "Edit Meeting" : "New Meeting"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--color-text-light)] hover:bg-[var(--color-border-light)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 p-5">
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Weekly Product Sync"
              className="w-full rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-light)] focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
              autoFocus
            />
          </div>

          {/* Meeting Date */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]">
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={meetingAt}
              min={isEditing ? undefined : minDateTime}
              onChange={(e) => setMeetingAt(e.target.value)}
              disabled={lockTime}
              className="w-full rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)] disabled:cursor-not-allowed disabled:opacity-50"
            />
            {lockTime && (
              <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                Time can&apos;t be changed while the meeting is in progress.
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]">
              Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                placeholder="Add a tag..."
                className="flex-1 rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-light)] focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-md bg-[var(--color-brand-50)] px-2 py-1 text-xs font-medium text-[var(--color-brand-700)] dark:bg-[var(--color-brand-900)] dark:text-[var(--color-brand-200)]"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                      className="hover:text-[var(--color-brand-500)]"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Participants */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]">
              Participants
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddParticipant())}
                placeholder="colleague@company.com"
                className="flex-1 rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-light)] focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddParticipant}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {participants.length > 0 && (
              <div className="mt-2 space-y-1">
                {participants.map((p) => (
                  <div
                    key={p.email}
                    className="flex items-center justify-between rounded-lg bg-[var(--color-surface-tertiary)] px-3 py-1.5 text-sm"
                  >
                    <span className="text-[var(--color-text-primary)]">{p.email}</span>
                    <button
                      type="button"
                      onClick={() => setParticipants(participants.filter((x) => x.email !== p.email))}
                      className="text-[var(--color-text-light)] hover:text-red-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Meeting notes, agenda, talking points..."
              className="w-full rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-light)] focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)] resize-none"
            />
          </div>

          {/* Actions — primary action first (left), cancel second (right) */}
          <div className="grid grid-cols-2 gap-3 border-t border-[var(--color-border-light)] pt-4">
            <Button
              type="submit"
              loading={mutation.isPending}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--color-brand-600)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-brand-700)] disabled:opacity-50"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEditing ? "Saving..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Meeting"
              )}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)]"
            >
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
