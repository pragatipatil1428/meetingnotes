export const APP_NAME = "Minutely";
export const APP_TAGLINE = "Turn conversations into momentum";
export const APP_DESCRIPTION =
  "Minutely helps teams capture meeting notes, track tasks, and leverage AI to extract insights from every conversation.";

export const WORKSPACE_NAME = "ACME STUDIO";

export const NAV_ITEMS = [
  { label: "Overview", path: "/", icon: "LayoutDashboard" },
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
  LOW: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  HIGH: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  URGENT: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export const STATUS_COLORS: Record<string, string> = {
  TODO: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  IN_PROGRESS: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  DONE: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
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
