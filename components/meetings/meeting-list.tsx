"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { formatDate, formatTime, formatDateShort, cn, getEffectiveMeetingStatus } from "@/lib/utils";
import { SkeletonList } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { MeetingForm } from "./meeting-form";
import { Video, Calendar, Clock, Plus, Search, Tag, X, Trash2 } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
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
    mutationFn: (id: string) =>
      api(`/api/meetings/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
  });

  const statusColors: Record<string, string> = {
    SCHEDULED: "bg-[var(--color-brand-50)] text-[var(--color-brand-700)]",
    PAST: "bg-amber-100 text-amber-900",
    IN_PROGRESS: "bg-[var(--color-brand-100)] text-[var(--color-brand-800)]",
    COMPLETED: "bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]",
    CANCELLED: "bg-[var(--color-border-light)] text-[var(--color-text-light)]",
  };

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
          <Plus className="mr-1.5 h-4 w-4" />
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
          action={{ label: "Retry", onClick: () => queryClient.invalidateQueries({ queryKey: ["meetings"] }) }}
        />
      ) : !data?.items.length ? (
        <EmptyState
          icon="📅"
          title="No meetings yet"
          description="Create your first meeting to get started."
          action={{ label: "Create Meeting", onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {data.items.map((meeting, i) => {
              const displayStatus = getEffectiveMeetingStatus(
                meeting.status,
                meeting.meetingAt
              );
              return (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => router.push(`/meetings/${meeting.id}`)}
                className="group cursor-pointer rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-all hover:border-[var(--color-brand-300)] hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-[var(--color-brand-500)] shrink-0" />
                      <h3 className="font-semibold text-[var(--color-text-primary)] truncate">
                        {meeting.title}
                      </h3>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0",
                          statusColors[displayStatus] || statusColors.SCHEDULED
                        )}
                      >
                        {displayStatus.replace("_", " ")}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-secondary)]">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(meeting.meetingAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(meeting.meetingAt)}
                      </span>
                      {meeting.participants?.length > 0 && (
                        <span>
                          {meeting.participants.length} participant
                          {meeting.participants.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 text-[10px] text-[var(--color-text-light)]">
                      Created {formatDateShort(meeting.createdAt)} at {formatTime(meeting.createdAt)}
                    </div>

                    {meeting.tags && meeting.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {meeting.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-md bg-[var(--color-surface-tertiary)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)]"
                          >
                            <Tag className="h-3 w-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {meeting.summary && (
                      <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-tertiary)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-secondary)]">
                        AI Summary
                      </span>
                    )}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const confirm = window.confirm(`Delete "${meeting.title}"? This cannot be undone.`);
                          if (confirm) {
                            deleteMutation.mutate(meeting.id);
                          }
                        }}
                        className="rounded-lg p-1.5 text-[var(--color-text-light)] opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                        title="Delete meeting"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create Meeting Form Modal */}
      <AnimatePresence>
        {showForm && (
          <MeetingForm
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              queryClient.invalidateQueries({ queryKey: ["meetings"] });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
