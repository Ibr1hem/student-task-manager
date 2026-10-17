/**
 * Data Model for Student Task Manager
 */

export interface TaskStep {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string; // YYYY-MM-DD format
  completed: boolean;
  steps?: TaskStep[]; // Optional AI or student study breakdown steps
}

export type TaskFilter = 'all' | 'pending' | 'completed' | 'overdue' | 'today' | 'upcoming7';

export type DeadlineSortOption = 'nearest' | 'furthest' | 'subject' | 'title';

export interface TaskFormData {
  title: string;
  subject: string;
  dueDate: string;
  description: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  dueToday: number;
  upcomingNext7Days: number;
}

