"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import {
  formatDateShort,
  formatTime,
  cn,
  getEffectiveMeetingStatus,
  truncateText,
} from "@/lib/utils";
import { SkeletonList } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { MeetingForm, toLocalDateTimeInputValue } from "./meeting-form";
import { Video, Plus, Search, X, Edit3, Trash2 } from "lucide-react";
import { SortHeader, type SortState } from "@/components/ui/sort-header";
import { motion, AnimatePresence } from "framer-motion";
import type { Meeting } from "@/lib/types";

interface MeetingListResponse {
  items: Meeting[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export function MeetingList() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [deletingMeeting, setDeletingMeeting] = useState<Meeting | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sort, setSort] = useState<SortState>({ key: "createdAt", direction: "desc" });
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<MeetingListResponse>({
    queryKey: ["meetings", search, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      return api(`/api/meetings?${params.toString()}`);
    },
    // Re-evaluate scheduled vs past as meeting times pass while the page is open.
    refetchInterval: 60_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/meetings/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      setDeletingMeeting(null);
    },
  });

  const statusColors: Record<string, string> = {
    SCHEDULED: "bg-[var(--color-brand-50)] text-[var(--color-brand-700)]",
    PAST: "bg-amber-100 text-amber-900",
    IN_PROGRESS: "bg-[var(--color-brand-100)] text-[var(--color-brand-800)]",
    COMPLETED: "bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]",
    CANCELLED: "bg-[var(--color-border-light)] text-[var(--color-text-light)]",
  };

  const invalidateMeetings = () => {
    queryClient.invalidateQueries({ queryKey: ["meetings"] });
  };

  const handleSort = (key: string) => {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: key === "title" || key === "status" ? "asc" : "desc" }
    );
  };

  const sortedMeetings = useMemo(() => {
    if (!data?.items) return [];
    const items = [...data.items];
    const dir = sort.direction === "asc" ? 1 : -1;
    items.sort((a, b) => {
      let cmp = 0;
      switch (sort.key) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "meetingAt":
          cmp = new Date(a.meetingAt).getTime() - new Date(b.meetingAt).getTime();
          break;
        case "createdAt":
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "participants":
          cmp = (a.participants?.length ?? 0) - (b.participants?.length ?? 0);
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return cmp * dir;
    });
    return items;
  }, [data, sort]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
            Meetings
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {data?.total ?? 0} total meetings
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} size="md">
          <Plus className="h-4 w-4" />
          New Meeting
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-light)]" />
          <input
            type="text"
            placeholder="Search meetings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-10 pr-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-light)] transition-all focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-light)] hover:text-[var(--color-text-primary)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {["", "SCHEDULED", "IN_PROGRESS", "COMPLETED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                statusFilter === status
                  ? "bg-[var(--color-brand-100)] text-[var(--color-brand-700)] dark:bg-[var(--color-brand-900)] dark:text-[var(--color-brand-200)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-border-light)]"
              )}
            >
              {status || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <SkeletonList rows={5} />
      ) : error ? (
        <EmptyState
          title="Failed to load meetings"
          description="Something went wrong. Please try again."
          action={{ label: "Retry", onClick: () => invalidateMeetings() }}
        />
      ) : !data?.items.length ? (
        <EmptyState
          icon="📅"
          title="No meetings yet"
          description="Create your first meeting to get started."
          action={{ label: "Create Meeting", onClick: () => setShowForm(true) }}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-tertiary)] text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  <SortHeader label="Meeting" sortKey="title" sort={sort} onSort={handleSort} />
                  <SortHeader label="Date &amp; Time" sortKey="meetingAt" sort={sort} onSort={handleSort} />
                  <SortHeader label="Created" sortKey="createdAt" sort={sort} onSort={handleSort} />
                  <SortHeader label="Participants" sortKey="participants" sort={sort} onSort={handleSort} />
                  <SortHeader label="Status" sortKey="status" sort={sort} onSort={handleSort} />
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {sortedMeetings.map((meeting) => {
                    const displayStatus = getEffectiveMeetingStatus(
                      meeting.status,
                      meeting.meetingAt
                    );
                    return (
                      <motion.tr
                        key={meeting.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => router.push(`/meetings/${meeting.id}`)}
                        className="group cursor-pointer border-b border-[var(--color-border-light)] transition-colors last:border-b-0 hover:bg-[var(--color-surface-tertiary)]/60"
                      >
                        {/* Meeting */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-100)] text-[var(--color-brand-700)] dark:bg-[var(--color-brand-900)] dark:text-[var(--color-brand-200)]">
                              <Video className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p
                                className="font-medium text-[var(--color-text-primary)] truncate"
                                title={meeting.title}
                              >
                                {truncateText(meeting.title, 70)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td className="whitespace-nowrap px-4 py-3.5 text-[var(--color-text-secondary)]">
                          {formatDateShort(meeting.meetingAt)}
                          <span className="block text-[11px] text-[var(--color-text-light)]">
                            {formatTime(meeting.meetingAt)}
                          </span>
                        </td>

                        {/* Created */}
                        <td className="whitespace-nowrap px-4 py-3.5 text-[var(--color-text-secondary)]">
                          {formatDateShort(meeting.createdAt)}
                          <span className="block text-[11px] text-[var(--color-text-light)]">
                            {formatTime(meeting.createdAt)}
                          </span>
                        </td>

                        {/* Participants */}
                        <td className="whitespace-nowrap px-4 py-3.5 text-[var(--color-text-secondary)]">
                          {meeting.participants?.length ?? 0} participant
                          {meeting.participants?.length !== 1 ? "s" : ""}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <span
                            className={cn(
                              "inline-block rounded-full px-2 py-0.5 text-[10px] font-medium",
                              statusColors[displayStatus] || statusColors.SCHEDULED
                            )}
                          >
                            {displayStatus.replace("_", " ")}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div
                            className="flex items-center justify-end gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setEditingMeeting(meeting)}
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => setDeletingMeeting(meeting)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Create Meeting Form Modal */}
      <AnimatePresence>
        {showForm && (
          <MeetingForm
            onClose={() => setShowForm(false)}
            onSuccess={(meeting) => {
              setShowForm(false);
              invalidateMeetings();
              router.push(`/meetings/${meeting.id}`);
            }}
          />
        )}
      </AnimatePresence>

      {/* Edit Meeting Form Modal */}
      <AnimatePresence>
        {editingMeeting && (
          <MeetingForm
            meetingId={editingMeeting.id}
            lockTime={editingMeeting.status === "IN_PROGRESS"}
            initialData={{
              title: editingMeeting.title,
              notes: editingMeeting.notes,
              meetingAt: toLocalDateTimeInputValue(new Date(editingMeeting.meetingAt)),
              tags: editingMeeting.tags,
              participants: editingMeeting.participants?.map((p) => ({
                email: p.email,
                name: p.name || undefined,
              })),
            }}
            onClose={() => setEditingMeeting(null)}
            onSuccess={() => {
              setEditingMeeting(null);
              invalidateMeetings();
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete confirmation dialog */}
      <AnimatePresence>
        {deletingMeeting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setDeletingMeeting(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-modal)]"
            >
              <h3 className="font-display text-lg font-bold text-[var(--color-text-primary)]">
                Delete Meeting
              </h3>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Are you sure you want to delete &ldquo;{deletingMeeting.title}&rdquo;?
                This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setDeletingMeeting(null)}
                  className="rounded-lg px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-border-light)]"
                >
                  Cancel
                </button>
                <Button
                  variant="danger"
                  size="md"
                  onClick={() => deleteMutation.mutate(deletingMeeting.id)}
                  loading={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
