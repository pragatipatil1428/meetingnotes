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
