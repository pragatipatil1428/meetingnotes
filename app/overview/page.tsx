"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/layout/shell";
import { StatCards } from "@/components/dashboard/stat-cards";
import { RecentMeetings } from "@/components/dashboard/recent-meetings";
import { TaskOverview } from "@/components/dashboard/task-overview";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ProductivityChart } from "@/components/dashboard/productivity-chart";
import { Button } from "@/components/ui/button";
import { MeetingForm } from "@/components/meetings/meeting-form";
import { TaskForm } from "@/components/tasks/task-form";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/lib/utils";
import { Plus, CheckSquare, CalendarDays } from "lucide-react";

export default function OverviewPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const userName = session?.user?.name || "there";
  const today = formatDate(new Date()).toUpperCase();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

  const refreshDashboard = () => {
    queryClient.invalidateQueries({ queryKey: ["meetings"] });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["analytics"] });
  };

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative mb-8 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)] sm:p-8"
        >
          {/* Ambient glows */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--color-brand-100)] opacity-70 blur-3xl dark:bg-[var(--color-brand-900)]/50" />
          <div className="pointer-events-none absolute -bottom-32 -left-16 h-56 w-56 rounded-full bg-[var(--color-brand-50)] opacity-80 blur-3xl dark:bg-[var(--color-brand-900)]/30" />

          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.5px] text-[var(--color-brand-600)] dark:text-[var(--color-brand-300)]">
              <CalendarDays className="h-3.5 w-3.5" />
              {today}
            </div>
            <h1 className="font-display mt-2 text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
              Good {greeting}, {userName} 👋
            </h1>
            <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
              Here&apos;s what&apos;s happening with your workspace today.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="md" onClick={() => setShowMeetingForm(true)}>
                <Plus className="h-4 w-4" />
                New Meeting
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setShowTaskForm(true)}
              >
                <CheckSquare className="h-4 w-4" />
                New Task
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stat cards */}
        <StatCards />

        {/* Two-column layout */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <RecentMeetings />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <TaskOverview />
          </motion.div>
        </div>

        {/* Second row */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <ActivityFeed />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <ProductivityChart />
          </motion.div>
        </div>
      </div>

      {/* New Meeting / New Task modals — same forms as in their sections */}
      <AnimatePresence>
        {showMeetingForm && (
          <MeetingForm
            onClose={() => setShowMeetingForm(false)}
            onSuccess={(meeting) => {
              setShowMeetingForm(false);
              refreshDashboard();
              router.push(`/meetings/${meeting.id}`);
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showTaskForm && (
          <TaskForm
            onClose={() => setShowTaskForm(false)}
            onSuccess={(task) => {
              setShowTaskForm(false);
              refreshDashboard();
              router.push(`/tasks/${task.id}`);
            }}
          />
        )}
      </AnimatePresence>
    </Shell>
  );
}
