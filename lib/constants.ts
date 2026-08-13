export const APP_NAME = "Minutely";
export const APP_DESCRIPTION =
  "Minutely helps teams capture meeting notes, track tasks, and leverage AI to extract insights from every conversation.";

export const NAV_ITEMS = [
  { label: "Overview", path: "/overview", icon: "LayoutDashboard" },
  { label: "Meetings", path: "/meetings", icon: "Video" },
  { label: "Tasks", path: "/tasks", icon: "CheckSquare" },
  { label: "Analytics", path: "/analytics", icon: "BarChart3" },
  { label: "Settings", path: "/settings", icon: "Settings" },
] as const;

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-[var(--color-brand-50)] text-[var(--color-brand-600)]",
  MEDIUM: "bg-[var(--color-brand-100)] text-[var(--color-brand-700)]",
  HIGH: "bg-[var(--color-brand-200)] text-[var(--color-brand-800)]",
  URGENT: "bg-[var(--color-brand-300)] text-[var(--color-brand-900)]",
};

export const STATUS_COLORS: Record<string, string> = {
  TODO: "bg-[var(--color-brand-50)] text-[var(--color-brand-700)]",
  IN_PROGRESS: "bg-[var(--color-brand-100)] text-[var(--color-brand-800)]",
  DONE: "bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]",
};


