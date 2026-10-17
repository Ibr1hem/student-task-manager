import React, { useState } from 'react';
import { Task, TaskFilter, DeadlineSortOption } from '../types/task';
import { TaskCard } from './TaskCard';
import {
  sortTasks,
  isTaskOverdue,
  isTaskDueToday,
  isTaskUpcomingNext7Days,
} from '../services/storage';
import {
  Search,
  Plus,
  CheckCircle2,
  Clock,
  ListFilter,
  Calendar,
  AlertCircle,
  Inbox,
  ArrowDownUp,
  Sparkles,
} from 'lucide-react';

interface AllTasksViewProps {
  tasks: Task[];
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  onOpenCreate: () => void;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDeleteRequest: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
}

export const AllTasksView: React.FC<AllTasksViewProps> = ({
  tasks,
  filter,
  onFilterChange,
  onOpenCreate,
  onToggleComplete,
  onEdit,
  onDeleteRequest,
  onUpdateTask,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<DeadlineSortOption>('nearest');

  // 1. Filter by Smart Deadlines & Completion Status
  const statusFiltered = tasks.filter((task) => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    if (filter === 'overdue') return isTaskOverdue(task);
    if (filter === 'today') return isTaskDueToday(task);
    if (filter === 'upcoming7') return isTaskUpcomingNext7Days(task);
    return true; // 'all'
  });

  // 2. Filter by search query (title, subject, or description)
  const queryFiltered = statusFiltered.filter((task) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(q) ||
      task.subject.toLowerCase().includes(q) ||
      task.description.toLowerCase().includes(q)
    );
  });

  // 3. Sort tasks according to chosen deadline/sort order
  const sortedTasks = sortTasks(queryFiltered, sortOption);

  // Counts for each filter tab
  const allCount = tasks.length;
  const overdueCount = tasks.filter((t) => isTaskOverdue(t)).length;
  const dueTodayCount = tasks.filter((t) => isTaskDueToday(t)).length;
  const upcoming7Count = tasks.filter((t) => isTaskUpcomingNext7Days(t)).length;
  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            All Academic Tasks
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your university course tasks, homework, and exam preparations.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>New Task</span>
        </button>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
        {/* Top row: Search and Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, courses (e.g. MATH 101), or notes..."
              className="w-full rounded-lg border border-gray-300 pl-9 pr-12 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 shrink-0">
            <ArrowDownUp className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <label htmlFor="alltasks-sort" className="text-gray-500 font-medium">
              Sort by:
            </label>
            <select
              id="alltasks-sort"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as DeadlineSortOption)}
              className="bg-transparent font-semibold text-gray-900 focus:outline-none cursor-pointer"
            >
              <option value="nearest">Nearest Deadline First</option>
              <option value="furthest">Furthest Deadline First</option>
              <option value="subject">Course / Subject (A-Z)</option>
              <option value="title">Task Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Tabs: Smart Deadlines + General status */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          {/* All */}
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            <ListFilter className="h-3.5 w-3.5" />
            <span>All Tasks</span>
            <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              filter === 'all' ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {allCount}
            </span>
          </button>

          {/* Overdue */}
          <button
            type="button"
            onClick={() => onFilterChange('overdue')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filter === 'overdue'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-50 text-red-700 border border-red-100 hover:bg-red-100'
            }`}
          >
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Overdue</span>
            <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
              filter === 'overdue' ? 'bg-red-700 text-white' : 'bg-red-200 text-red-800'
            }`}>
              {overdueCount}
            </span>
          </button>

          {/* Due Today */}
          <button
            type="button"
            onClick={() => onFilterChange('today')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filter === 'today'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Due Today</span>
            <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
              filter === 'today' ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-900'
            }`}>
              {dueTodayCount}
            </span>
          </button>

          {/* Next 7 Days */}
          <button
            type="button"
            onClick={() => onFilterChange('upcoming7')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filter === 'upcoming7'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Next 7 Days</span>
            <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
              filter === 'upcoming7' ? 'bg-indigo-700 text-white' : 'bg-indigo-200 text-indigo-900'
            }`}>
              {upcoming7Count}
            </span>
          </button>

          {/* Pending */}
          <button
            type="button"
            onClick={() => onFilterChange('pending')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filter === 'pending'
                ? 'bg-gray-800 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>All Pending</span>
            <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              filter === 'pending' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {pendingCount}
            </span>
          </button>

          {/* Completed */}
          <button
            type="button"
            onClick={() => onFilterChange('completed')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filter === 'completed'
                ? 'bg-green-600 text-white shadow-xs'
                : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Completed</span>
            <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              filter === 'completed' ? 'bg-green-700 text-white' : 'bg-green-200 text-green-800'
            }`}>
              {completedCount}
            </span>
          </button>
        </div>
      </div>

      {/* Sorting & Filter status info */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <span className="flex items-center gap-1.5 font-medium">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          {sortOption === 'nearest'
            ? 'Sorted by nearest deadline first'
            : sortOption === 'furthest'
            ? 'Sorted by furthest deadline first'
            : sortOption === 'subject'
            ? 'Sorted alphabetically by course/subject'
            : 'Sorted alphabetically by task title'}
        </span>
        <span>
          Showing {sortedTasks.length} of {tasks.length} total tasks
        </span>
      </div>

      {/* Task List */}
      {sortedTasks.length > 0 ? (
        <div className="space-y-3">
          {sortedTasks.map((task) => (
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
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 sm:p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4">
            {filter === 'overdue' ? (
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            ) : filter === 'today' ? (
              <Sparkles className="h-7 w-7 text-amber-600" />
            ) : (
              <Inbox className="h-7 w-7" />
            )}
          </div>
          <h3 className="text-base font-bold text-gray-900">
            {searchQuery
              ? 'No matching tasks found'
              : filter === 'overdue'
              ? 'No Overdue Tasks! 🎉'
              : filter === 'today'
              ? 'No Tasks Due Today!'
              : filter === 'upcoming7'
              ? 'No Tasks Due in Next 7 Days'
              : filter === 'completed'
              ? 'No Completed Tasks Yet'
              : filter === 'pending'
              ? 'No Pending Tasks'
              : 'No Tasks Found'}
          </h3>
          <p className="mt-1.5 text-sm text-gray-500 max-w-sm mx-auto">
            {searchQuery
              ? `No assignments match "${searchQuery}". Try a different keyword or clear search.`
              : filter === 'overdue'
              ? 'Awesome job! You have submitted all your past coursework on time.'
              : filter === 'today'
              ? 'You have zero deadlines for today. Use the time to prepare for future classes or relax.'
              : filter === 'upcoming7'
              ? 'Your schedule is clear for the next 7 days. Add any new homework assignments as you receive them.'
              : filter === 'completed'
              ? 'Click the checkbox on any task to mark it as completed.'
              : filter === 'pending'
              ? 'Great job! You have completed all your pending tasks.'
              : 'Get started by creating your first university assignment or study task.'}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenCreate}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Create a Task</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
