export const APP_NAME = "Minutely";
export const APP_TAGLINE = "Turn conversations into momentum";
export const APP_DESCRIPTION =
  "Minutely helps teams capture meeting notes, track tasks, and leverage AI to extract insights from every conversation.";

export const WORKSPACE_NAME = "ACME STUDIO";

export const NAV_ITEMS = [
  { label: "Overview", path: "/overview", icon: "LayoutDashboard" },
  { label: "Meetings", path: "/meetings", icon: "Video" },
  { label: "Tasks", path: "/tasks", icon: "CheckSquare" },
  { label: "Search", path: "/search", icon: "Search" },
  { label: "Analytics", path: "/analytics", icon: "BarChart3" },
  { label: "Settings", path: "/settings", icon: "Settings" },
  { label: "Profile", path: "/profile", icon: "User" },
] as const;

export const AI_ACTIONS = [
  "Generate summary",
  "Extract action items",
  "Key decisions",
  "Follow-up email",
  "Generate title",
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

/* ── Dashboard ─────────────────────────────────────── */

export const DASHBOARD_STATS = [
  { label: "Meetings", value: "24", trend: "↗ 12%", icon: "Video" },
  { label: "Notes created", value: "18", trend: "↗ 8%", icon: "FileText" },
  { label: "Tasks completed", value: "14/18", trend: "78%", icon: "CheckSquare" },
  { label: "Focus time", value: "18.5h", trend: "↗ 5%", icon: "Clock" },
];

export const RECENT_MEETINGS = [
  {
    id: "1",
    title: "Weekly Product Sync",
    time: "10:00 AM",
    category: "Product",
    participants: 4,
  },
  {
    id: "2",
    title: "Customer Insights Review",
    time: "1:30 PM",
    category: "Research",
    participants: 3,
  },
  {
    id: "3",
    title: "Campaign Planning",
    time: "3:30 PM",
    category: "Marketing",
    participants: 3,
  },
];

export const DASHBOARD_TASKS = [
  { id: "1", title: "Review product positioning", priority: "High", done: false },
  { id: "2", title: "Send Q3 roadmap recap", priority: "Medium", done: false },
  { id: "3", title: "Prepare customer interview guide", priority: "Medium", done: false },
];

export const CHART_DATA = [
  { name: "Mon", value: 44 },
  { name: "Tue", value: 68 },
  { name: "Wed", value: 52 },
  { name: "Thu", value: 82 },
  { name: "Fri", value: 61 },
  { name: "Sat", value: 88 },
  { name: "Sun", value: 73 },
];

export const ACTIVITY_FEED = [
  { id: "1", user: "Sarah", action: "created meeting notes", type: "meeting" as const, time: "2h ago" },
  { id: "2", user: "James", action: "completed marketing brief", type: "task" as const, time: "4h ago" },
  { id: "3", user: "Lisa", action: "tagged you in research", type: "system" as const, time: "6h ago" },
  { id: "4", user: "AI", action: "generated meeting summary", type: "ai" as const, time: "1d ago" },
];
