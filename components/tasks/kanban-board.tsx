"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { TaskCard } from "./task-card";
import { TaskForm } from "./task-form";
import { SkeletonList } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Plus, Search, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { TaskStatus } from "@/lib/types";
import type { Task } from "@/lib/types";

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: TaskStatus.TODO, title: "To Do", color: "border-t-gray-400" },
  { id: TaskStatus.IN_PROGRESS, title: "In Progress", color: "border-t-blue-500" },
  { id: TaskStatus.DONE, title: "Done", color: "border-t-green-500" },
];

export function KanbanBoard() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["tasks", search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      return api(`/api/tasks?${params.toString()}`);
    },
    placeholderData: (previousData) => previousData,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api(`/api/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const getColumnTasks = useCallback(
    (status: TaskStatus): Task[] => {
      return (tasks || []).filter((t) => t.status === status);
    },
    [tasks]
  );

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== targetStatus) {
      updateMutation.mutate({
        id: draggedTask.id,
        data: { status: targetStatus },
      });
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">Tasks</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {tasks?.length || 0} total tasks
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--color-brand-600)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-brand-700)]"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-light)]" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
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
      </div>

      {/* Kanban Columns */}
      {isLoading ? (
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <SkeletonList rows={2} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
        {COLUMNS.map((column) => {
          const columnTasks = getColumnTasks(column.id);
          const isDragOver = dragOverColumn === column.id;

          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
              className={cn(
                "rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] transition-all",
                `border-t-2 ${column.color}`,
                isDragOver && "border-[var(--color-brand-300)] bg-[var(--color-brand-50)]/50 dark:bg-[var(--color-brand-900)]/10"
              )}
            >
              {/* Column header */}
              <div className="flex items-center justify-between border-b border-[var(--color-border-light)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {column.title}
                  </h3>
                  <span className="rounded-full border border-[var(--color-border-input)] bg-[var(--color-surface)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-text-primary)] dark:bg-[var(--color-surface-tertiary)]">
                    {columnTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="rounded-lg p-1 text-[var(--color-text-light)] transition-colors hover:bg-[var(--color-border-light)] hover:text-[var(--color-text-primary)]"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Tasks list — only as tall as its tasks, plus a small drop target */}
              <div className="space-y-2 p-3 min-h-[80px]">
                <AnimatePresence>
                  {columnTasks.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-xs text-[var(--color-text-light)]">No tasks</p>
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task)}
                        className={cn(
                          "cursor-grab active:cursor-grabbing",
                          draggedTask?.id === task.id && "opacity-50"
                        )}
                      >
                        <TaskCard
                          task={task}
                          onClick={() => router.push(`/tasks/${task.id}`)}
                        />
                      </div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Task Form Modal */}
      <AnimatePresence>
        {showForm && (
          <TaskForm
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              queryClient.invalidateQueries({ queryKey: ["tasks"] });
            }}
          />
        )}
      </AnimatePresence>


    </div>
  );
}
