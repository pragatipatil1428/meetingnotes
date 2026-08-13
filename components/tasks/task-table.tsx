"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { cn, formatDateShort, formatTime, truncateText } from "@/lib/utils";
import { SkeletonTable } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { TaskForm } from "./task-form";
import { PRIORITY_COLORS, STATUS_COLORS } from "@/lib/constants";
import { Plus, Search, X, Edit3, Trash2, CheckSquare, Calendar, MessageSquare } from "lucide-react";
import { SortHeader, type SortState } from "@/components/ui/sort-header";
import { motion, AnimatePresence } from "framer-motion";
import type { Task, PaginatedList } from "@/lib/types";

const STATUS_LABELS: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export function TaskTable() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<SortState>({ key: "createdAt", direction: "desc" });
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
  } = useQuery<PaginatedList<Task>>({
    queryKey: ["tasks", search, page, pageSize, sort.key, sort.direction],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      params.set("sortBy", sort.key);
      params.set("sortDir", sort.direction);
      return api(`/api/tasks?${params.toString()}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/tasks/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setDeletingTask(null);
    },
  });

  const invalidateTasks = () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  const handleSort = (key: string) => {
    setPage(1);
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: key === "title" || key === "status" ? "asc" : "desc" }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {data?.total ?? 0} total tasks
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} size="md">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-light)]" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
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

      {/* Content */}
      {isLoading ? (
        <SkeletonTable rows={5} columns={8} />
      ) : error ? (
        <EmptyState
          title="Failed to load tasks"
          description="Something went wrong. Please try again."
          action={{ label: "Retry", onClick: () => invalidateTasks() }}
        />
      ) : !data?.items?.length ? (
        <EmptyState
          icon="✅"
          title="No tasks yet"
          description="Create your first task to get started."
          action={{ label: "Create Task", onClick: () => setShowForm(true) }}
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
                  <th className="w-12 px-4 py-3">Sr No</th>
                  <SortHeader label="Task" sortKey="title" sort={sort} onSort={handleSort} />
                  <SortHeader label="Status" sortKey="status" sort={sort} onSort={handleSort} />
                  <SortHeader label="Priority" sortKey="priority" sort={sort} onSort={handleSort} />
                  <SortHeader label="Due Date" sortKey="dueDate" sort={sort} onSort={handleSort} />
                  <SortHeader label="Meeting" sortKey="meeting" sort={sort} onSort={handleSort} />
                  <SortHeader label="Created" sortKey="createdAt" sort={sort} onSort={handleSort} />
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {data.items.map((task, index) => (
                    <motion.tr
                      key={task.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => router.push(`/tasks/${task.id}`)}
                      className="group cursor-pointer border-b border-[var(--color-border-light)] transition-colors last:border-b-0 hover:bg-[var(--color-surface-tertiary)]/60"
                    >
                      {/* Sr No */}
                      <td className="w-12 px-4 py-3.5 text-[var(--color-text-light)]">
                        {(page - 1) * pageSize + index + 1}
                      </td>

                      {/* Task */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                              task.status === "DONE"
                                ? "bg-[var(--color-surface-tertiary)] text-[var(--color-text-light)]"
                                : "bg-[var(--color-brand-100)] text-[var(--color-brand-700)] dark:bg-[var(--color-brand-900)] dark:text-[var(--color-brand-200)]"
                            )}
                          >
                            <CheckSquare className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p
                              className="font-medium text-[var(--color-text-primary)] truncate"
                              title={task.title}
                            >
                              {truncateText(task.title, 70)}
                            </p>
                            {task.description && (
                              <p
                                className="mt-0.5 max-w-[280px] truncate text-[11px] text-[var(--color-text-light)]"
                                title={task.description}
                              >
                                {truncateText(task.description, 70)}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-block rounded-full px-2 py-0.5 text-[10px] font-medium",
                            STATUS_COLORS[task.status] || STATUS_COLORS.TODO
                          )}
                        >
                          {STATUS_LABELS[task.status] || task.status}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-block rounded px-1.5 py-0.5 text-[10px] font-medium",
                            PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM
                          )}
                        >
                          {task.priority}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="whitespace-nowrap px-4 py-3.5 text-[var(--color-text-secondary)]">
                        {task.dueDate ? (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-[var(--color-text-light)]" />
                            {new Date(task.dueDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        ) : (
                          <span className="text-[var(--color-text-light)]">—</span>
                        )}
                      </td>

                      {/* Meeting */}
                      <td className="max-w-[200px] truncate px-4 py-3.5">
                        {task.meeting ? (
                          <span className="flex items-center gap-1.5 text-xs text-[var(--color-brand-500)]">
                            <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{task.meeting.title}</span>
                          </span>
                        ) : (
                          <span className="text-[var(--color-text-light)]">—</span>
                        )}
                      </td>

                      {/* Created */}
                      <td className="whitespace-nowrap px-4 py-3.5 text-[var(--color-text-secondary)]">
                        {formatDateShort(task.createdAt)}
                        <span className="block text-[11px] text-[var(--color-text-light)]">
                          {formatTime(task.createdAt)}
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
                            onClick={() => setEditingTask(task)}
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeletingTask(task)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            page={page}
            pageSize={pageSize}
            total={data.total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </motion.div>
      )}

      {/* Create Task Form Modal */}
      <AnimatePresence>
        {showForm && (
          <TaskForm
            onClose={() => setShowForm(false)}
            onSuccess={(task) => {
              setShowForm(false);
              invalidateTasks();
              router.push(`/tasks/${task.id}`);
            }}
          />
        )}
      </AnimatePresence>

      {/* Edit Task Form Modal */}
      <AnimatePresence>
        {editingTask && (
          <TaskForm
            taskId={editingTask.id}
            lockTime={editingTask.status === "IN_PROGRESS"}
            initialData={{
              title: editingTask.title,
              description: editingTask.description || "",
              status: editingTask.status,
              priority: editingTask.priority,
              dueDate: editingTask.dueDate
                ? new Date(editingTask.dueDate).toISOString().slice(0, 10)
                : "",
              labels: editingTask.labels,
            }}
            onClose={() => setEditingTask(null)}
            onSuccess={() => {
              setEditingTask(null);
              invalidateTasks();
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete confirmation dialog */}
      <AnimatePresence>
        {deletingTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setDeletingTask(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-modal)]"
            >
              <h3 className="font-display text-lg font-bold text-[var(--color-text-primary)]">
                Delete Task
              </h3>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Are you sure you want to delete &ldquo;{deletingTask.title}&rdquo;?
                This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setDeletingTask(null)}
                  className="rounded-lg px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-border-light)]"
                >
                  Cancel
                </button>
                <Button
                  variant="danger"
                  size="md"
                  onClick={() => deleteMutation.mutate(deletingTask.id)}
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
