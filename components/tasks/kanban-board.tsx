"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { TaskCard } from "./task-card";
import { TaskForm } from "./task-form";
import { SkeletonList } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TaskStatus } from "@/lib/types";
import type { Task } from "@/lib/types";

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: TaskStatus.TODO, title: "To Do", color: "border-t-gray-400" },
  { id: TaskStatus.IN_PROGRESS, title: "In Progress", color: "border-t-blue-500" },
  { id: TaskStatus.DONE, title: "Done", color: "border-t-green-500" },
];

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (data: Record<string, unknown>) => void;
  isUpdating: boolean;
}

function TaskDetailModal({ task, onClose, onUpdate, isUpdating }: TaskDetailModalProps) {
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || "");
  const [editStatus, setEditStatus] = useState(task.status);
  const [editPriority, setEditPriority] = useState(task.priority);

  const handleSave = () => {
    onUpdate({
      title: editTitle,
      description: editDescription,
      status: editStatus,
      priority: editPriority,
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-modal)]"
      >
        <h3 className="mb-4 font-display text-lg font-bold text-[var(--color-text-primary)]">
          Edit Task
        </h3>

        <div className="space-y-4">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)] resize-none"
          />
          <div className="grid grid-cols-2 gap-4">
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
              className="rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as Task["priority"])}
              className="rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-border-light)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="rounded-lg bg-[var(--color-brand-600)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-700)] disabled:opacity-50"
          >
            {isUpdating ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function KanbanBoard() {
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: () => api("/api/tasks"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api(`/api/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setSelectedTask(null);
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {COLUMNS.map((col) => (
          <div key={col.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <SkeletonList rows={2} />
          </div>
        ))}
      </div>
    );
  }

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

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
                "rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-all",
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
                  <span className="rounded-full bg-[var(--color-surface-tertiary)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)]">
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

              {/* Tasks list */}
              <div className="space-y-2 p-3 min-h-[120px]">
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
                          onClick={() => setSelectedTask(task)}
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

      {/* Task Detail/Edit Modal */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={(data) =>
              updateMutation.mutate({ id: selectedTask.id, data })
            }
            isUpdating={updateMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
