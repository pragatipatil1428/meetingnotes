"use client";

import { motion } from "framer-motion";
import {
  Video,
  FileText,
  CheckSquare,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { DASHBOARD_STATS } from "@/lib/constants";

const iconMap: Record<string, LucideIcon> = {
  Video,
  FileText,
  CheckSquare,
  Clock,
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export function StatCards() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
    >
      {DASHBOARD_STATS.map((stat) => {
        const Icon = iconMap[stat.icon] || Clock;

        return (
          <motion.div
            key={stat.label}
            variants={item}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-elevated)]"
          >
            {/* Icon */}
            <div className="absolute right-4 top-4 opacity-20 transition-opacity group-hover:opacity-40">
              <Icon className="h-6 w-6 text-[var(--color-brand-600)]" />
            </div>

            {/* Content */}
            <p className="text-xs font-medium text-[var(--color-text-muted)]">
              {stat.label}
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-[var(--color-text-primary)]">
              {stat.value}
            </p>
            {stat.trend && (
              <p className="mt-1 text-xs font-medium text-[var(--color-success)]">
                {stat.trend}
              </p>
            )}

            {/* Hover gradient */}
            <div className="absolute inset-0 -translate-x-full rounded-xl bg-gradient-to-r from-transparent via-[var(--color-brand-50)] to-transparent opacity-0 transition-all duration-700 group-hover:translate-x-full group-hover:opacity-100 dark:via-[var(--color-brand-900)]" />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
