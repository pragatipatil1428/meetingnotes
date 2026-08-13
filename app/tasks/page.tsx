"use client";

import { useState } from "react";
import { Shell } from "@/components/layout/shell";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { TaskTable } from "@/components/tasks/task-table";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Table2, Kanban } from "lucide-react";

type View = "table" | "kanban";

export default function TasksPage() {
  const [view, setView] = useState<View>("table");

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* View toggle */}
          <div className="flex justify-end">
            <div className="flex gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
              <button
                onClick={() => setView("table")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                  view === "table"
                    ? "bg-[var(--color-brand-100)] text-[var(--color-brand-700)] dark:bg-[var(--color-brand-900)] dark:text-[var(--color-brand-200)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                )}
              >
                <Table2 className="h-3.5 w-3.5" />
                Table
              </button>
              <button
                onClick={() => setView("kanban")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                  view === "kanban"
                    ? "bg-[var(--color-brand-100)] text-[var(--color-brand-700)] dark:bg-[var(--color-brand-900)] dark:text-[var(--color-brand-200)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                )}
              >
                <Kanban className="h-3.5 w-3.5" />
                Kanban
              </button>
            </div>
          </div>

          {view === "table" ? <TaskTable /> : <KanbanBoard />}
        </motion.div>
      </div>
    </Shell>
  );
}
