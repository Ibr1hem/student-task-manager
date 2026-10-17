import React from 'react';
import { Task } from '../types/task';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  task: Task | null;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  task,
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 id="delete-dialog-title" className="text-lg font-bold text-gray-900">
              Delete Task?
            </h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-gray-900">"{task.title}"</span>? This action cannot be undone.
            </p>
            <div className="mt-3 rounded-lg bg-gray-50 p-2.5 text-xs text-gray-500 border border-gray-100">
              <span className="font-medium text-gray-700">Course:</span> {task.subject} • <span className="font-medium text-gray-700">Due:</span> {task.dueDate}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
};
