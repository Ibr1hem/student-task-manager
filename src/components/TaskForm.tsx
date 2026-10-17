import React, { useState, useEffect } from 'react';
import { Task, TaskFormData } from '../types/task';
import { getTodayDateString } from '../services/storage';
import { BookOpen, Calendar, AlignLeft, Check, X, AlertCircle } from 'lucide-react';

interface TaskFormProps {
  initialTask?: Task | null;
  onSave: (data: TaskFormData) => void;
  onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  initialTask,
  onSave,
  onCancel,
}) => {
  const isEditing = Boolean(initialTask);

  const [formData, setFormData] = useState<TaskFormData>({
    title: initialTask?.title || '',
    subject: initialTask?.subject || '',
    dueDate: initialTask?.dueDate || getTodayDateString(),
    description: initialTask?.description || '',
  });

  const [errors, setErrors] = useState<{
    title?: string;
    subject?: string;
    dueDate?: string;
  }>({});

  const [touched, setTouched] = useState<{
    title?: boolean;
    subject?: boolean;
    dueDate?: boolean;
  }>({});

  useEffect(() => {
    if (initialTask) {
      setFormData({
        title: initialTask.title,
        subject: initialTask.subject,
        dueDate: initialTask.dueDate,
        description: initialTask.description,
      });
    }
  }, [initialTask]);

  const validate = (): boolean => {
    const newErrors: { title?: string; subject?: string; dueDate?: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required.';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject name is required.';
    }

    if (!formData.dueDate.trim()) {
      newErrors.dueDate = 'Due date is required.';
    } else {
      // Validate format YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.dueDate) || isNaN(Date.parse(formData.dueDate))) {
        newErrors.dueDate = 'Please enter a valid date (YYYY-MM-DD).';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ title: true, subject: true, dueDate: true });

    if (validate()) {
      onSave({
        title: formData.title.trim(),
        subject: formData.subject.trim(),
        dueDate: formData.dueDate.trim(),
        description: formData.description.trim(),
      });
    }
  };

  const handleFieldChange = (field: keyof TaskFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const popularSubjects = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Literature',
    'History',
    'Economics',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="task-title" className="block text-sm font-semibold text-gray-900 mb-1">
          Task Title <span className="text-red-500">*</span>
        </label>
        <input
          id="task-title"
          type="text"
          value={formData.title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
          placeholder="e.g. Chapter 4 Problem Set or Midterm Research Paper"
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
            errors.title
              ? 'border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-300 focus:border-blue-600 focus:ring-blue-100'
          }`}
          autoFocus
        />
        {errors.title && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {errors.title}
          </p>
        )}
      </div>

      {/* Subject */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="task-subject" className="block text-sm font-semibold text-gray-900">
            Subject Name <span className="text-red-500">*</span>
          </label>
          <span className="text-xs text-gray-400 font-normal">e.g. course code or topic</span>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <BookOpen className="h-4 w-4 text-gray-400" />
          </div>
          <input
            id="task-subject"
            type="text"
            value={formData.subject}
            onChange={(e) => handleFieldChange('subject', e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, subject: true }))}
            placeholder="e.g. CS 101 or Calculus I"
            className={`w-full rounded-lg border pl-9 pr-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
              errors.subject
                ? 'border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-blue-600 focus:ring-blue-100'
            }`}
          />
        </div>
        {/* Quick subject suggestions */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-400">Suggestions:</span>
          {popularSubjects.slice(0, 5).map((subj) => (
            <button
              key={subj}
              type="button"
              onClick={() => handleFieldChange('subject', subj)}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-200 transition-colors"
            >
              {subj}
            </button>
          ))}
        </div>
        {errors.subject && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {errors.subject}
          </p>
        )}
      </div>

      {/* Due Date */}
      <div>
        <label htmlFor="task-dueDate" className="block text-sm font-semibold text-gray-900 mb-1">
          Due Date <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Calendar className="h-4 w-4 text-gray-400" />
          </div>
          <input
            id="task-dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleFieldChange('dueDate', e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, dueDate: true }))}
            className={`w-full rounded-lg border pl-9 pr-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 ${
              errors.dueDate
                ? 'border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-blue-600 focus:ring-blue-100'
            }`}
          />
        </div>
        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleFieldChange('dueDate', getTodayDateString())}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Today
          </button>
          <span className="text-gray-300">•</span>
          <button
            type="button"
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() + 1);
              const year = d.getFullYear();
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const day = String(d.getDate()).padStart(2, '0');
              handleFieldChange('dueDate', `${year}-${month}-${day}`);
            }}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Tomorrow
          </button>
          <span className="text-gray-300">•</span>
          <button
            type="button"
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() + 7);
              const year = d.getFullYear();
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const day = String(d.getDate()).padStart(2, '0');
              handleFieldChange('dueDate', `${year}-${month}-${day}`);
            }}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Next Week
          </button>
        </div>
        {errors.dueDate && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {errors.dueDate}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="task-description" className="block text-sm font-semibold text-gray-900">
            Description <span className="text-xs text-gray-400 font-normal">(optional)</span>
          </label>
        </div>
        <div className="relative">
          <textarea
            id="task-description"
            rows={3}
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Add assignment details, submission links, page limits, or study notes..."
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Check className="h-4 w-4" />
          {isEditing ? 'Save Changes' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};
