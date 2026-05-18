// API レスポンスに対応する型定義

export type Priority = "low" | "medium" | "high";
export type Status = "not_started" | "in_progress" | "completed";

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt?: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  dueDate: string | null; // ISO 8601
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiErrorResponse {
  error: unknown;
  currentVersion?: number;
  yourVersion?: number;
  currentTask?: Task;
}
