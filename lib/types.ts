/** Core domain types for the Meeting Notes application */

/* ── Enums ─────────────────────────────────────────── */

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export enum MeetingStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

/* ── Domain Models ─────────────────────────────────── */

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Meeting {
  id: string;
  title: string;
  notes: string;
  summary: string | null;
  keyDecisions: string[];
  actionItems: string[];
  meetingAt: Date;
  status: MeetingStatus;
  tags: string[];
  startedAt: Date | null;
  timeSpent: number;
  ownerId: string;
  owner?: User;
  participants: Participant[];
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Participant {
  id: string;
  email: string;
  name: string | null;
  meetingId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: Date | null;
  labels: string[];
  position: number;
  startedAt: Date | null;
  timeSpent: number;
  meetingId: string | null;
  meeting?: Meeting;
  assigneeId: string | null;
  assignee?: User;
  createdAt: Date;
  updatedAt: Date;
}

/* ── API Types ─────────────────────────────────────── */

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface MeetingInsightResult {
  type: string;
  notes: string;
  result: string;
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  items: TaskItem[];
}

export interface TaskItem {
  id: number;
  title: string;
  priority: Priority | string;
}

/* ── Dashboard Types ───────────────────────────────── */

export interface DashboardCard {
  label: string;
  value: string;
  trend?: string;
}

export interface MeetingSchedule {
  title: string;
  time: string;
  category: string;
  description: string;
}

/* ── Store Types ───────────────────────────────────── */

export interface ThemeState {
  mode: "light" | "dark";
  toggle: () => void;
  setMode: (mode: "light" | "dark") => void;
}

/* ── UI Types ──────────────────────────────────────── */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";
export type InputVariant = "default" | "error" | "success";

export interface NavItem {
  label: string;
  path?: string;
  icon?: string;
}
