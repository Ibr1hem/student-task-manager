import React from 'react';
import { Task, TaskFormData } from '../types/task';
import { TaskForm } from './TaskForm';
import { X, PlusCircle, Pencil } from 'lucide-react';

interface TaskFormModalProps {
  isOpen: boolean;
  editingTask: Task | null;
  onSave: (data: TaskFormData) => void;
  onClose: () => void;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  editingTask,
  onSave,
  onClose,
}) => {
  if (!isOpen) return null;

  const isEditing = Boolean(editingTask);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              {isEditing ? <Pencil className="h-4 w-4" /> : <PlusCircle className="h-5 w-5" />}
            </div>
            <div>
              <h2 id="task-form-title" className="text-base font-bold text-gray-900">
                {isEditing ? 'Edit Assignment / Task' : 'Add New Academic Task'}
              </h2>
              <p className="text-xs text-gray-500">
                {isEditing
                  ? 'Update coursework details, subject or deadline'
                  : 'Track a university assignment, reading, or exam'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <TaskForm
            initialTask={editingTask}
            onSave={onSave}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};
