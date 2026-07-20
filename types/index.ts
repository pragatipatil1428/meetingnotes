/* ═══════════════════════════════════════════════════════
   Domain Types — AI Meeting Notes & Task Manager
   ═══════════════════════════════════════════════════════ */

/* ── Enums ─────────────────────────────────────────── */

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum MeetingStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

/* ── Core Models ───────────────────────────────────── */

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
  meeting?: Meeting;
  createdAt: Date;
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

/* ── API / DTO Types ───────────────────────────────── */

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface MeetingFormData {
  title: string;
  notes?: string;
  meetingAt: string;
  tags?: string[];
  participants?: string[];
}

export interface TaskFormData {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  labels?: string[];
  meetingId?: string;
}

/* ── Zustand Store Types ───────────────────────────── */

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export interface ThemeState {
  mode: "light" | "dark";
  toggle: () => void;
  setMode: (mode: "light" | "dark") => void;
}

export interface MeetingState {
  meetings: Meeting[];
  selectedMeeting: Meeting | null;
  isLoading: boolean;
  fetchMeetings: () => Promise<void>;
  setSelectedMeeting: (meeting: Meeting | null) => void;
}

export interface TaskState {
  tasks: Task[];
  kanbanColumns: Record<string, Task[]>;
  isLoading: boolean;
  fetchTasks: () => Promise<void>;
  moveTask: (taskId: string, fromStatus: string, toStatus: string) => void;
}

/* ── Dashboard Types ───────────────────────────────── */

export interface StatCard {
  label: string;
  value: string;
  trend?: string;
  icon: string;
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  timestamp: Date;
  type: "meeting" | "task" | "ai" | "system";
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}
