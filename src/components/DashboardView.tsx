import React, { useState } from 'react';
import { Task, TaskStats, TaskFilter, DeadlineSortOption } from '../types/task';
import { StatCard } from './StatCard';
import { TaskCard } from './TaskCard';
import {
  sortTasks,
  isTaskOverdue,
  isTaskDueToday,
  isTaskUpcomingNext7Days,
} from '../services/storage';
import {
  ListChecks,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Plus,
  ArrowRight,
  Sparkles,
  CalendarDays,
  Calendar,
  Clock,
  ArrowDownUp,
  Flame,
} from 'lucide-react';

interface DashboardViewProps {
  tasks: Task[];
  stats: TaskStats;
  onOpenCreate: () => void;
  onNavigateToTasks: (filter?: TaskFilter) => void;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDeleteRequest: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  stats,
  onOpenCreate,
  onNavigateToTasks,
  onToggleComplete,
  onEdit,
  onDeleteRequest,
  onUpdateTask,
}) => {
  // Local sub-filter for the dashboard unfinished tasks list
  const [dashboardSubFilter, setDashboardSubFilter] = useState<'all' | 'today' | 'upcoming7' | 'overdue'>('all');
  const [sortOption, setSortOption] = useState<DeadlineSortOption>('nearest');

  // Filter incomplete tasks
  const incompleteTasks = tasks.filter((t) => !t.completed);

  // Apply dashboard sub-filter
  const filteredIncomplete = incompleteTasks.filter((task) => {
    if (dashboardSubFilter === 'today') return isTaskDueToday(task);
    if (dashboardSubFilter === 'upcoming7') return isTaskUpcomingNext7Days(task);
    if (dashboardSubFilter === 'overdue') return isTaskOverdue(task);
    return true; // 'all'
  });

  // Sort unfinished tasks by deadline (or chosen order)
  const sortedIncomplete = sortTasks(filteredIncomplete, sortOption);

  // Take top tasks for dashboard view (up to 5)
  const displayedTasks = sortedIncomplete.slice(0, 5);

  const todayFormatted = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <CalendarDays className="h-4 w-4" />
            <span>{todayFormatted}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            Welcome to Student Task Manager
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">
            Stay on top of university assignments, exams, and upcoming deadlines.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 sm:px-5 sm:py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Smart Deadlines Focus Bar */}
      <section aria-labelledby="smart-deadlines-heading" className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 sm:p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-200 border border-blue-400/30 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-blue-300" />
              <span>Smart Deadlines</span>
            </div>
            <h3 id="smart-deadlines-heading" className="text-lg sm:text-xl font-bold tracking-tight">
              Deadline Priority Center
            </h3>
            <p className="text-xs sm:text-sm text-blue-200/90 mt-0.5">
              Instant breakdown of coursework requiring your immediate attention.
            </p>
          </div>

          {/* Quick Smart Deadline Counters */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {/* Overdue */}
            <button
              type="button"
              onClick={() => onNavigateToTasks('overdue')}
              className="flex flex-col items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 p-2.5 sm:p-3 text-center border border-white/10 transition-all cursor-pointer group"
              title="View overdue tasks"
            >
              <div className="flex items-center gap-1 text-red-300 text-xs font-semibold mb-0.5">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">Overdue</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-red-200 group-hover:scale-105 transition-transform">
                {stats.overdue}
              </span>
              <span className="text-[10px] sm:text-xs text-red-300 sm:hidden">Overdue</span>
            </button>

            {/* Due Today */}
            <button
              type="button"
              onClick={() => onNavigateToTasks('today')}
              className="flex flex-col items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 p-2.5 sm:p-3 text-center border border-white/10 transition-all cursor-pointer group"
              title="View tasks due today"
            >
              <div className="flex items-center gap-1 text-amber-300 text-xs font-semibold mb-0.5">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">Due Today</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-amber-200 group-hover:scale-105 transition-transform">
                {stats.dueToday}
              </span>
              <span className="text-[10px] sm:text-xs text-amber-300 sm:hidden">Today</span>
            </button>

            {/* Next 7 Days */}
            <button
              type="button"
              onClick={() => onNavigateToTasks('upcoming7')}
              className="flex flex-col items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 p-2.5 sm:p-3 text-center border border-white/10 transition-all cursor-pointer group"
              title="View tasks due in next 7 days"
            >
              <div className="flex items-center gap-1 text-blue-300 text-xs font-semibold mb-0.5">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">Next 7 Days</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-blue-200 group-hover:scale-105 transition-transform">
                {stats.upcomingNext7Days}
              </span>
              <span className="text-[10px] sm:text-xs text-blue-300 sm:hidden">7 Days</span>
            </button>
          </div>
        </div>

        {/* Insight message based on deadlines */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-blue-200">
          <div className="flex items-center gap-2">
            {stats.overdue > 0 ? (
              <span className="flex items-center gap-1.5 text-red-300 font-medium">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                You have {stats.overdue} overdue assignment{stats.overdue > 1 ? 's' : ''}. Prioritize these first!
              </span>
            ) : stats.dueToday > 0 ? (
              <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                <Clock className="h-4 w-4 shrink-0" />
                You have {stats.dueToday} assignment{stats.dueToday > 1 ? 's' : ''} due today!
              </span>
            ) : stats.upcomingNext7Days > 0 ? (
              <span className="flex items-center gap-1.5 text-blue-200 font-medium">
                <Flame className="h-4 w-4 text-amber-400 shrink-0" />
                Great shape! {stats.upcomingNext7Days} task{stats.upcomingNext7Days > 1 ? 's' : ''} due over the next 7 days.
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-green-300 font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                All caught up! No urgent assignments in the next 7 days.
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTasks('pending')}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-blue-300 hover:text-white transition-colors cursor-pointer"
          >
            <span>Review All Unfinished</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      {/* 4 Overview Statistics Cards */}
      <section aria-labelledby="stats-heading">
        <h3 id="stats-heading" className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          Overview Statistics
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Total Tasks"
            value={stats.total}
            icon={ListChecks}
            variant="blue"
            description="assignments"
            onClick={() => onNavigateToTasks('all')}
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            variant="green"
            description="finished"
            onClick={() => onNavigateToTasks('completed')}
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={Clock3}
            variant="amber"
            description="in progress"
            onClick={() => onNavigateToTasks('pending')}
          />
          <StatCard
            title="Overdue"
            value={stats.overdue}
            icon={AlertTriangle}
            variant="red"
            description={stats.overdue === 1 ? 'needs attention' : 'need attention'}
            onClick={() => onNavigateToTasks('overdue')}
          />
        </div>
      </section>

      {/* Unfinished Coursework & Deadline Sorting */}
      <section aria-labelledby="upcoming-heading" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 id="upcoming-heading" className="text-lg font-bold text-gray-900">
              Unfinished Assignments
            </h3>
            <p className="text-xs text-gray-500">
              Sorted by deadline urgency to help you focus on what's due first
            </p>
          </div>

          {/* Controls: Deadline Sorting & View All */}
          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 shadow-xs">
              <ArrowDownUp className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <label htmlFor="dashboard-sort" className="text-gray-500 font-medium sr-only sm:not-sr-only sm:inline">
                Sort:
              </label>
              <select
                id="dashboard-sort"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as DeadlineSortOption)}
                className="bg-transparent font-semibold text-gray-900 focus:outline-none cursor-pointer"
              >
                <option value="nearest">Nearest Deadline (Earliest)</option>
                <option value="furthest">Furthest Deadline (Latest)</option>
                <option value="subject">By Course / Subject</option>
                <option value="title">By Title (A-Z)</option>
              </select>
            </div>

            {incompleteTasks.length > 0 && (
              <button
                type="button"
                onClick={() => onNavigateToTasks('pending')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline px-2 py-1.5 cursor-pointer shrink-0"
              >
                <span>View all ({incompleteTasks.length})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Dashboard Smart Deadline Sub-filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setDashboardSubFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              dashboardSubFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All Incomplete ({incompleteTasks.length})
          </button>

          <button
            type="button"
            onClick={() => setDashboardSubFilter('overdue')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              dashboardSubFilter === 'overdue'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-red-700'
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            <span>Overdue ({stats.overdue})</span>
          </button>

          <button
            type="button"
            onClick={() => setDashboardSubFilter('today')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              dashboardSubFilter === 'today'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-amber-50 hover:text-amber-700'
            }`}
          >
            <Clock className="h-3 w-3" />
            <span>Due Today ({stats.dueToday})</span>
          </button>

          <button
            type="button"
            onClick={() => setDashboardSubFilter('upcoming7')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              dashboardSubFilter === 'upcoming7'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-indigo-50 hover:text-indigo-700'
            }`}
          >
            <Calendar className="h-3 w-3" />
            <span>Next 7 Days ({stats.upcomingNext7Days})</span>
          </button>
        </div>

        {/* Task Cards List */}
        {displayedTasks.length > 0 ? (
          <div className="space-y-3">
            {displayedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDeleteRequest={onDeleteRequest}
                onUpdateTask={onUpdateTask}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <h4 className="text-base font-semibold text-gray-900">
              {dashboardSubFilter === 'overdue'
                ? 'No Overdue Tasks!'
                : dashboardSubFilter === 'today'
                ? 'No Tasks Due Today!'
                : dashboardSubFilter === 'upcoming7'
                ? 'No Tasks in Next 7 Days!'
                : 'No Pending Deadlines!'}
            </h4>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
              {dashboardSubFilter === 'overdue'
                ? 'You are all caught up on your past deadlines. Great job maintaining your coursework schedule.'
                : dashboardSubFilter === 'today'
                ? 'You have no assignments due today. Enjoy your study time or get ahead on upcoming tasks.'
                : dashboardSubFilter === 'upcoming7'
                ? 'Nothing due in the upcoming week.'
                : 'You are all caught up with your university assignments. Click "Add Task" whenever you receive new coursework.'}
            </p>
            <button
              type="button"
              onClick={onOpenCreate}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add a Task
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
