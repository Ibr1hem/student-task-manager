import { Task, TaskStats, DeadlineSortOption } from '../types/task';

const STORAGE_KEY = 'student_task_manager_data';

/**
 * Returns the current local calendar date as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns a date string shifted by relative days from today (e.g., -2, 0, +2)
 */
export function getRelativeDateString(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates the exact difference in calendar days between a target date and a base date.
 * Uses 12:00:00 (local noon) to prevent any Daylight Saving Time / midnight edge-cases.
 * Target date and base date are expected in YYYY-MM-DD format.
 * Returns:
 *   negative: target date is in the past (e.g. -2 = 2 days ago / overdue)
 *   0: target date is today
 *   positive: target date is in the future (e.g. 1 = tomorrow, 5 = 5 days away)
 */
export function getCalendarDayDiff(targetDateStr: string, baseDateStr = getTodayDateString()): number {
  if (!targetDateStr) return 0;
  const [tY, tM, tD] = targetDateStr.split('-').map(Number);
  const [bY, bM, bD] = baseDateStr.split('-').map(Number);
  if (!tY || !tM || !tD || !bY || !bM || !bD) return 0;

  const targetDate = new Date(tY, tM - 1, tD, 12, 0, 0);
  const baseDate = new Date(bY, bM - 1, bD, 12, 0, 0);

  const diffTime = targetDate.getTime() - baseDate.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Smart Deadlines: Overdue logic
 * A task is Overdue when:
 * - It is NOT completed.
 * - Its due date is earlier than the device's current calendar date.
 * Completed tasks must never count as overdue.
 */
export function isTaskOverdue(task: { dueDate: string; completed: boolean }, today = getTodayDateString()): boolean {
  if (task.completed) {
    return false;
  }
  return getCalendarDayDiff(task.dueDate, today) < 0;
}

/**
 * Smart Deadlines: Due Today logic
 * A task is Due Today when:
 * - It is NOT completed.
 * - Its due date is exactly equal to the device's current calendar date.
 */
export function isTaskDueToday(task: { dueDate: string; completed: boolean }, today = getTodayDateString()): boolean {
  if (task.completed) {
    return false;
  }
  return getCalendarDayDiff(task.dueDate, today) === 0;
}

/**
 * Smart Deadlines: Next 7 Days logic
 * A task is coming up in the next 7 days when:
 * - It is NOT completed.
 * - Its due date is between tomorrow (1 day) and 7 days from today.
 */
export function isTaskUpcomingNext7Days(task: { dueDate: string; completed: boolean }, today = getTodayDateString()): boolean {
  if (task.completed) {
    return false;
  }
  const diff = getCalendarDayDiff(task.dueDate, today);
  return diff >= 1 && diff <= 7;
}

/**
 * Calculate dashboard and smart deadline statistics from tasks
 */
export function computeTaskStats(tasks: Task[]): TaskStats {
  const today = getTodayDateString();
  let completed = 0;
  let pending = 0;
  let overdue = 0;
  let dueToday = 0;
  let upcomingNext7Days = 0;

  for (const task of tasks) {
    if (task.completed) {
      completed++;
    } else {
      pending++;
      const diff = getCalendarDayDiff(task.dueDate, today);
      if (diff < 0) {
        overdue++;
      } else if (diff === 0) {
        dueToday++;
      } else if (diff <= 7) {
        upcomingNext7Days++;
      }
    }
  }

  return {
    total: tasks.length,
    completed,
    pending,
    overdue,
    dueToday,
    upcomingNext7Days,
  };
}

/**
 * Sorts tasks by various criteria (defaults to 'nearest' deadline first)
 */
export function sortTasks(tasks: Task[], sortOption: DeadlineSortOption = 'nearest'): Task[] {
  return [...tasks].sort((a, b) => {
    if (sortOption === 'nearest') {
      // Ascending: Earliest deadline first
      if (a.dueDate !== b.dueDate) {
        return a.dueDate.localeCompare(b.dueDate);
      }
      return a.title.localeCompare(b.title);
    }
    if (sortOption === 'furthest') {
      // Descending: Furthest deadline first
      if (a.dueDate !== b.dueDate) {
        return b.dueDate.localeCompare(a.dueDate);
      }
      return a.title.localeCompare(b.title);
    }
    if (sortOption === 'subject') {
      if (a.subject !== b.subject) {
        return a.subject.localeCompare(b.subject);
      }
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (sortOption === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });
}

/**
 * Backward compatibility alias for sorting tasks by nearest deadline
 */
export function sortTasksByDueDate(tasks: Task[]): Task[] {
  return sortTasks(tasks, 'nearest');
}

/**
 * Generates initial demo tasks for university classroom demonstration
 */
export function getDefaultSampleTasks(): Task[] {
  return [
    {
      id: 'demo-1',
      title: 'Calculus Problem Set 4',
      subject: 'MATH 101',
      description: 'Complete exercises 12 through 28 on limits, continuity, and derivatives from Chapter 3.',
      dueDate: getRelativeDateString(2), // 2 days in the future (Next 7 Days)
      completed: false,
    },
    {
      id: 'demo-2',
      title: 'Physics Lab Report Submission',
      subject: 'PHYS 150',
      description: 'Submit the final PDF report with uncertainty calculations for the projectile motion experiment.',
      dueDate: getTodayDateString(), // Due today
      completed: false,
    },
    {
      id: 'demo-3',
      title: 'Literature Review First Draft',
      subject: 'ENG 202',
      description: 'Draft 4 pages analyzing historical context in post-colonial literature with at least 5 academic citations.',
      dueDate: getRelativeDateString(-2), // Overdue by 2 days
      completed: false,
    },
    {
      id: 'demo-4',
      title: 'Data Structures Quiz 1',
      subject: 'CS 201',
      description: 'Reviewed arrays, linked lists, and time complexity in Big-O notation.',
      dueDate: getRelativeDateString(-5), // In the past, but completed (NOT overdue!)
      completed: true,
    },
    {
      id: 'demo-5',
      title: 'Computer Architecture Term Project Plan',
      subject: 'CS 320',
      description: 'Submit preliminary microprocessor cache simulation topic and group partner names.',
      dueDate: getRelativeDateString(12), // 12 days in the future (Later upcoming)
      completed: false,
    },
  ];
}

/**
 * Loads tasks from Local Storage, seeded if empty
 */
export function loadTasksFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaultTasks = getDefaultSampleTasks();
      saveTasksToStorage(defaultTasks);
      return defaultTasks;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return getDefaultSampleTasks();
  } catch (error) {
    console.error('Error loading tasks from localStorage:', error);
    return getDefaultSampleTasks();
  }
}

/**
 * Saves tasks to Local Storage
 */
export function saveTasksToStorage(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks to localStorage:', error);
  }
}

/**
 * Format date for friendly human reading (e.g. "Oct 18, 2026")
 */
export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  
  const date = new Date(year, month - 1, day, 12, 0, 0);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Smart Deadlines: Generates clear, easy-to-understand badge information
 */
export function getDueStatusLabel(dueDate: string, completed: boolean): {
  label: string;
  badgeTag: string;
  variant: 'completed' | 'overdue' | 'today' | 'upcoming7' | 'upcoming-later';
  diffDays: number;
} {
  if (completed) {
    return {
      label: 'Completed',
      badgeTag: 'Finished',
      variant: 'completed',
      diffDays: 0,
    };
  }

  const diffDays = getCalendarDayDiff(dueDate);

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return {
      label: absDays === 1 ? 'Overdue by 1 day' : `Overdue by ${absDays} days`,
      badgeTag: 'Overdue',
      variant: 'overdue',
      diffDays,
    };
  }

  if (diffDays === 0) {
    return {
      label: 'Due Today',
      badgeTag: 'Due Today',
      variant: 'today',
      diffDays,
    };
  }

  if (diffDays === 1) {
    return {
      label: 'Due Tomorrow',
      badgeTag: 'Next 7 Days',
      variant: 'upcoming7',
      diffDays,
    };
  }

  if (diffDays <= 7) {
    return {
      label: `Due in ${diffDays} days`,
      badgeTag: 'Next 7 Days',
      variant: 'upcoming7',
      diffDays,
    };
  }

  return {
    label: `Due in ${diffDays} days`,
    badgeTag: 'Upcoming',
    variant: 'upcoming-later',
    diffDays,
  };
}
