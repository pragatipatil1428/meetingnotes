"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_NAME, WORKSPACE_NAME, NAV_ITEMS } from "@/lib/constants";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Video,
  CheckSquare,
  Search,
  BarChart3,
  Settings,
  User,
  Sparkles,
  X,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Video,
  CheckSquare,
  Search,
  BarChart3,
  Settings,
  User,
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] transition-transform duration-300 lg:sticky lg:top-0 lg:z-0 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--color-border-light)] px-5">
          <button
            onClick={() => router.push("/overview")}
            className="flex items-center gap-2 font-display text-xl font-bold text-[var(--color-brand-600)]"
          >
            <Sparkles className="h-5 w-5" />
            {APP_NAME}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--color-text-light)] hover:bg-[var(--color-border-light)] lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Workspace */}
        <div className="px-5 pt-5 pb-2">
          <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[var(--color-text-light)]">
            {WORKSPACE_NAME}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item, index) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            const isActive =
              pathname === item.path || pathname.startsWith(`${item.path}/`);

            return (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleNavigate(item.path)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all",
                  isActive
                    ? "bg-[var(--color-brand-100)] text-[var(--color-brand-700)] dark:bg-[var(--color-brand-900)] dark:text-[var(--color-brand-200)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-border-light)] hover:text-[var(--color-text-primary)]"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </motion.button>
            );
          })}
        </nav>

        {/* Upgrade card */}
        <div className="mx-4 mb-6 rounded-xl bg-gradient-to-br from-[var(--color-brand-50)] to-[var(--color-brand-100)] p-4 dark:from-[var(--color-brand-900)] dark:to-[var(--color-surface-tertiary)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-brand-800)] dark:text-[var(--color-brand-200)]">
            <Sparkles className="h-4 w-4" />
            Unlock AI magic
          </div>
          <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
            Supercharge your notes with AI
          </p>
          <button className="mt-3 w-full rounded-lg bg-[var(--color-brand-600)] px-3 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-[var(--color-brand-700)]">
            Upgrade
          </button>
        </div>
      </aside>
    </>
  );
}
