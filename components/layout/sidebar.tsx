"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_NAME, NAV_ITEMS } from "@/lib/constants";
import { Logo } from "@/components/ui/logo";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Video,
  CheckSquare,
  BarChart3,
  Settings,
  X,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Video,
  CheckSquare,
  BarChart3,
  Settings,
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
            className="flex items-center gap-2.5"
          >
            <Logo className="h-9 w-9 rounded-xl shadow-[var(--shadow-elevated)]" />
            <span className="font-display text-lg font-bold tracking-tight text-[var(--color-text-primary)]">
              {APP_NAME}
            </span>
          </button>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--color-text-light)] hover:bg-[var(--color-border-light)] lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 pt-10 pb-2">
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
                  "relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all",
                  isActive
                    ? "bg-[var(--color-brand-100)] font-semibold text-[var(--color-brand-700)] dark:bg-[var(--color-brand-900)] dark:text-[var(--color-brand-200)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-border-light)] hover:text-[var(--color-text-primary)]"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[var(--color-brand-600)]" />
                )}
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive && "text-[var(--color-brand-600)] dark:text-[var(--color-brand-300)]"
                  )}
                />
                {item.label}
              </motion.button>
            );
          })}
        </nav>

      </aside>
    </>
  );
}
