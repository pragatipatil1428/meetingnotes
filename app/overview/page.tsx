"use client";

import { useSession } from "next-auth/react";
import { Shell } from "@/components/layout/shell";
import { StatCards } from "@/components/dashboard/stat-cards";
import { RecentMeetings } from "@/components/dashboard/recent-meetings";
import { TaskOverview } from "@/components/dashboard/task-overview";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ProductivityChart } from "@/components/dashboard/productivity-chart";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";

export default function OverviewPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "there";
  const today = formatDate(new Date()).toUpperCase();

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[1.5px] text-[var(--color-text-light)]">
            {today}
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold text-[var(--color-text-primary)]">
            Good morning, {userName} ✦
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Here&apos;s what&apos;s happening with your team today.
          </p>
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
    </Shell>
  );
}
