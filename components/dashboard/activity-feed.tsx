"use client";

import { motion } from "framer-motion";
import { FileText, CheckSquare, Sparkles, Bell } from "lucide-react";
import { ACTIVITY_FEED } from "@/lib/constants";

const typeIcons = {
  meeting: FileText,
  task: CheckSquare,
  ai: Sparkles,
  system: Bell,
};

const typeColors = {
  meeting: "text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30",
  task: "text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/30",
  ai: "text-purple-600 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/30",
  system: "text-amber-600 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30",
};

export function ActivityFeed() {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
      <h3 className="font-display mb-4 text-sm font-bold text-[var(--color-text-primary)]">
        Team activity
      </h3>

      <div className="space-y-0">
        {ACTIVITY_FEED.map((activity, index) => {
          const Icon = typeIcons[activity.type];

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="group flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-[var(--color-surface-tertiary)]"
            >
              {/* Icon */}
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${typeColors[activity.type]}`}
              >
                <Icon className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="text-sm text-[var(--color-text-primary)]">
                  <span className="font-semibold">{activity.user}</span>{" "}
                  {activity.action}
                </p>
              </div>

              {/* Time */}
              <span className="flex-shrink-0 text-xs text-[var(--color-text-light)]">
                {activity.time}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
