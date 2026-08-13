import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with proper conflict resolution.
 * Uses clsx + tailwind-merge for production-grade class merging.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Alias for cn(). Used by legacy components.
 */
export const cx = cn;

/**
 * Format a date to a human-readable string.
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date to a short string (e.g., "Jan 15, 2024").
 */
export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a time (e.g., "10:30 AM").
 */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Derive the effective display status of a meeting from its stored status
 * and scheduled time. A meeting still marked SCHEDULED whose time has
 * passed is shown as "PAST", so the meetings table reflects reality.
 *
 * Explicit statuses (IN_PROGRESS, COMPLETED, CANCELLED) are returned as-is.
 */
export function getEffectiveMeetingStatus(
  status: string,
  meetingAt: Date | string | null | undefined,
  now: Date = new Date()
): string {
  if (status !== "SCHEDULED") return status;
  if (!meetingAt) return status;
  const t = typeof meetingAt === "string" ? new Date(meetingAt) : meetingAt;
  return t.getTime() < now.getTime() ? "PAST" : status;
}


