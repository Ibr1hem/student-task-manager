import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Plus,
  GraduationCap,
  Sparkles,
  RotateCcw
} from 'lucide-react';

import { TaskStats } from '../types/task';

interface NavigationProps {
  currentTab: 'dashboard' | 'tasks' | 'form';
  onSelectTab: (tab: 'dashboard' | 'tasks' | 'form') => void;
  onOpenCreate: () => void;
  onResetSampleData: () => void;
  stats: TaskStats;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreate,
  onResetSampleData,
  stats,
}) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-gray-200 bg-white">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo & App Name Header */}
          <div className="flex items-center gap-3 px-6 h-18 border-b border-gray-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">
                Student Task Manager
              </h1>
              <p className="text-xs text-gray-500 font-medium">Academic Workspace</p>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="p-4">
            <button
              type="button"
              onClick={onOpenCreate}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Add New Task</span>
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-3 space-y-1.5">
            <button
              type="button"
              onClick={() => onSelectTab('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                currentTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className={`h-5 w-5 ${currentTab === 'dashboard' ? 'text-blue-600' : 'text-gray-400'}`} />
                <span>Dashboard</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('tasks')}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                currentTab === 'tasks'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckSquare className={`h-5 w-5 ${currentTab === 'tasks' ? 'text-blue-600' : 'text-gray-400'}`} />
                <span>All Tasks</span>
              </div>
              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                currentTab === 'tasks' ? 'bg-blue-200/70 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {stats.total}
              </span>
            </button>
          </nav>

          {/* Storage & Classroom Demo Info Card */}
          <div className="p-4 border-t border-gray-100 space-y-2">
            <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                Local Storage Active
              </div>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                All changes save automatically to your browser.
              </p>
            </div>

            <button
              type="button"
              onClick={onResetSampleData}
              title="Reset sample university tasks"
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Demo Tasks</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-16 border-b border-gray-200 bg-white shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="text-sm font-bold text-gray-900 block leading-tight">
              Student Task Manager
            </span>
            <span className="text-xs text-gray-500">University Tasks</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenCreate}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>New Task</span>
        </button>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur-sm px-4 py-2 flex items-center justify-around shadow-lg">
        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-lg text-xs font-medium transition-colors ${
            currentTab === 'dashboard'
              ? 'text-blue-600 font-semibold'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('tasks')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-lg text-xs font-medium transition-colors relative ${
            currentTab === 'tasks'
              ? 'text-blue-600 font-semibold'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <div className="relative">
            <CheckSquare className="h-5 w-5" />
            {stats.overdue > 0 && (
              <span className="absolute -top-1 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                {stats.overdue}
              </span>
            )}
          </div>
          <span>All Tasks ({stats.total})</span>
        </button>
      </nav>
    </>
  );
};
