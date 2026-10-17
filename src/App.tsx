import React, { useState, useEffect } from 'react';
import { Task, TaskFilter, TaskFormData } from './types/task';
import {
  loadTasksFromStorage,
  saveTasksToStorage,
  computeTaskStats,
  getDefaultSampleTasks,
} from './services/storage';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { AllTasksView } from './components/AllTasksView';
import { TaskFormModal } from './components/TaskFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage());
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'tasks' | 'form'>('dashboard');
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('all');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Delete confirmation modal state
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Notification / toast feedback for students
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification((prev) => (prev === message ? null : prev));
    }, 3000);
  };

  // Sync to local storage whenever tasks state changes
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  // Compute live statistics
  const stats = computeTaskStats(tasks);

  // Helper to generate a unique task ID
  const generateTaskId = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
  };

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  // Save Task (Create or Update)
  const handleSaveTask = (data: TaskFormData) => {
    if (editingTask) {
      // Editing existing task
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? {
                ...t,
                title: data.title,
                subject: data.subject,
                dueDate: data.dueDate,
                description: data.description,
              }
            : t
        )
      );
      showToast('Task updated successfully.');
    } else {
      // Creating new task - marked as Pending (completed: false) by default
      const newTask: Task = {
        id: generateTaskId(),
        title: data.title,
        subject: data.subject,
        dueDate: data.dueDate,
        description: data.description,
        completed: false,
      };
      setTasks((prev) => [newTask, ...prev]);
      showToast('New task added successfully.');
    }

    setIsFormOpen(false);
    setEditingTask(null);
  };

  // Toggle Complete / Pending
  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          showToast(
            nextCompleted
              ? `"${t.title}" marked as Completed!`
              : `"${t.title}" changed back to Pending.`
          );
          return { ...t, completed: nextCompleted };
        }
        return t;
      })
    );
  };

  // Delete Request (Show confirmation modal)
  const handleDeleteRequest = (task: Task) => {
    setDeletingTask(task);
    setIsDeleteOpen(true);
  };

  // Delete Confirm
  const handleConfirmDelete = () => {
    if (deletingTask) {
      setTasks((prev) => prev.filter((t) => t.id !== deletingTask.id));
      showToast(`Task "${deletingTask.title}" was deleted.`);
    }
    setIsDeleteOpen(false);
    setDeletingTask(null);
  };

  // Cancel Delete
  const handleCancelDelete = () => {
    setIsDeleteOpen(false);
    setDeletingTask(null);
  };

  // Update Task (e.g. AI steps added, toggled, or edited)
  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  // Reset to default sample demo tasks
  const handleResetSampleData = () => {
    const sample = getDefaultSampleTasks();
    setTasks(sample);
    saveTasksToStorage(sample);
    showToast('Reset to university demo assignments.');
  };

  // Navigate to All Tasks with pre-set filter
  const handleNavigateToTasks = (filter: TaskFilter = 'all') => {
    setTaskFilter(filter);
    setCurrentTab('tasks');
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111827]">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-xl animate-in slide-in-from-top duration-200">
          <span className="h-2 w-2 rounded-full bg-green-400"></span>
          <span>{notification}</span>
        </div>
      )}

      {/* Navigation Layout */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenCreate={handleOpenCreate}
        onResetSampleData={handleResetSampleData}
        stats={stats}
      />

      {/* Main Content Area */}
      <main className="md:pl-64 flex flex-col min-h-screen pb-24 md:pb-12">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              tasks={tasks}
              stats={stats}
              onOpenCreate={handleOpenCreate}
              onNavigateToTasks={handleNavigateToTasks}
              onToggleComplete={handleToggleComplete}
              onEdit={handleOpenEdit}
              onDeleteRequest={handleDeleteRequest}
              onUpdateTask={handleUpdateTask}
            />
          )}

          {currentTab === 'tasks' && (
            <AllTasksView
              tasks={tasks}
              filter={taskFilter}
              onFilterChange={setTaskFilter}
              onOpenCreate={handleOpenCreate}
              onToggleComplete={handleToggleComplete}
              onEdit={handleOpenEdit}
              onDeleteRequest={handleDeleteRequest}
              onUpdateTask={handleUpdateTask}
            />
          )}
        </div>
      </main>

      {/* Add / Edit Task Modal */}
      <TaskFormModal
        isOpen={isFormOpen}
        editingTask={editingTask}
        onSave={handleSaveTask}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        task={deletingTask}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
