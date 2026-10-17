import React, { useState } from 'react';
import { Task, TaskStep } from '../types/task';
import { formatFriendlyDate, getDueStatusLabel } from '../services/storage';
import {
  Check,
  Calendar,
  BookOpen,
  Pencil,
  Trash2,
  Clock,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plus,
  Loader2,
  RotateCcw,
  X,
  ListOrdered,
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDeleteRequest: (task: Task) => void;
  onUpdateTask?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDeleteRequest,
  onUpdateTask,
}) => {
  const dueInfo = getDueStatusLabel(task.dueDate, task.completed);

  // Expandable steps section state
  const hasSavedSteps = Boolean(task.steps && task.steps.length > 0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // AI Breakdown states
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Reviewing temporary AI suggestions before committing them
  const [suggestedSteps, setSuggestedSteps] = useState<string[] | null>(null);
  const [newSuggestionInput, setNewSuggestionInput] = useState<string>('');

  // Manual step addition for saved steps
  const [manualStepInput, setManualStepInput] = useState<string>('');
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editingStepText, setEditingStepText] = useState<string>('');

  const completedStepsCount = task.steps?.filter((s) => s.completed).length || 0;
  const totalStepsCount = task.steps?.length || 0;
  const stepProgressPercentage = totalStepsCount > 0 ? Math.round((completedStepsCount / totalStepsCount) * 100) : 0;

  // Border & background styling based on Smart Deadline classification
  const getCardStyle = () => {
    if (task.completed) {
      return 'border-gray-200 bg-gray-50/70 opacity-90 border-l-4 border-l-green-500';
    }
    switch (dueInfo.variant) {
      case 'overdue':
        return 'border-red-200 bg-red-50/25 border-l-4 border-l-red-500 shadow-xs';
      case 'today':
        return 'border-amber-200 bg-amber-50/25 border-l-4 border-l-amber-500 shadow-xs';
      case 'upcoming7':
        return 'border-blue-200 bg-blue-50/15 border-l-4 border-l-blue-500 shadow-xs';
      default:
        return 'border-gray-200 bg-white border-l-4 border-l-gray-300';
    }
  };

  // Helper to generate step ID
  const generateStepId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'step-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  };

  // Trigger OpenRouter AI Breakdown endpoint
  const handleFetchAiBreakdown = async () => {
    setIsLoadingAi(true);
    setAiError(null);

    try {
      const response = await fetch('/api/breakdown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: task.title,
          subject: task.subject,
          description: task.description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate study steps.');
      }

      if (Array.isArray(data.steps) && data.steps.length > 0) {
        setSuggestedSteps(data.steps);
        setIsExpanded(true);
      } else {
        throw new Error('AI returned an empty list of steps.');
      }
    } catch (err: any) {
      setAiError(err.message || 'Unable to break down task. Please try again.');
      setIsExpanded(true);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Handle reviewing suggestions: Edit step text
  const handleUpdateSuggestedStep = (index: number, newText: string) => {
    if (!suggestedSteps) return;
    const next = [...suggestedSteps];
    next[index] = newText;
    setSuggestedSteps(next);
  };

  // Handle reviewing suggestions: Remove step
  const handleRemoveSuggestedStep = (index: number) => {
    if (!suggestedSteps) return;
    const next = suggestedSteps.filter((_, i) => i !== index);
    setSuggestedSteps(next);
  };

  // Handle reviewing suggestions: Add extra step
  const handleAddSuggestedStep = () => {
    if (!newSuggestionInput.trim()) return;
    setSuggestedSteps((prev) => [...(prev || []), newSuggestionInput.trim()]);
    setNewSuggestionInput('');
  };

  // Save reviewed AI suggestions to the task
  const handleSaveSuggestedSteps = () => {
    if (!suggestedSteps || suggestedSteps.length === 0) return;

    const formattedSteps: TaskStep[] = suggestedSteps
      .filter((s) => s.trim().length > 0)
      .map((text) => ({
        id: generateStepId(),
        text: text.trim(),
        completed: false,
      }));

    if (onUpdateTask) {
      onUpdateTask({
        ...task,
        steps: formattedSteps,
      });
    }

    setSuggestedSteps(null);
    setAiError(null);
  };

  // Cancel suggestion review
  const handleCancelSuggestions = () => {
    setSuggestedSteps(null);
    setAiError(null);
  };

  // Toggle step completion on saved task
  const handleToggleStepCompleted = (stepId: string) => {
    if (!task.steps || !onUpdateTask) return;

    const updatedSteps = task.steps.map((step) =>
      step.id === stepId ? { ...step, completed: !step.completed } : step
    );

    onUpdateTask({
      ...task,
      steps: updatedSteps,
    });
  };

  // Delete saved step
  const handleDeleteStep = (stepId: string) => {
    if (!task.steps || !onUpdateTask) return;

    const updatedSteps = task.steps.filter((s) => s.id !== stepId);
    onUpdateTask({
      ...task,
      steps: updatedSteps,
    });
  };

  // Start editing a saved step
  const handleStartEditStep = (step: TaskStep) => {
    setEditingStepId(step.id);
    setEditingStepText(step.text);
  };

  // Commit edit of a saved step
  const handleSaveEditStep = (stepId: string) => {
    if (!task.steps || !onUpdateTask) return;
    if (!editingStepText.trim()) return;

    const updatedSteps = task.steps.map((s) =>
      s.id === stepId ? { ...s, text: editingStepText.trim() } : s
    );

    onUpdateTask({
      ...task,
      steps: updatedSteps,
    });

    setEditingStepId(null);
    setEditingStepText('');
  };

  // Add new step manually to saved steps
  const handleAddManualStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualStepInput.trim() || !onUpdateTask) return;

    const newStep: TaskStep = {
      id: generateStepId(),
      text: manualStepInput.trim(),
      completed: false,
    };

    onUpdateTask({
      ...task,
      steps: [...(task.steps || []), newStep],
    });

    setManualStepInput('');
  };

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 transition-all duration-150 hover:shadow-md ${getCardStyle()}`}
    >
      <div className="flex items-start gap-3 sm:gap-3.5">
        {/* Completion Checkbox */}
        <button
          type="button"
          onClick={() => onToggleComplete(task.id)}
          aria-label={task.completed ? 'Mark task as pending' : 'Mark task as completed'}
          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 cursor-pointer ${
            task.completed
              ? 'border-green-600 bg-green-600 hover:bg-green-700'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        >
          {task.completed && <Check className="h-4 w-4 stroke-[2.5]" />}
        </button>

        {/* Task Details */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Subject badge */}
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-100">
              <BookOpen className="h-3 w-3" />
              {task.subject}
            </span>

            {/* Smart Deadline Status Badge */}
            {task.completed ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 border border-green-200">
                <Check className="h-3 w-3" />
                Completed
              </span>
            ) : dueInfo.variant === 'overdue' ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700 border border-red-200">
                <AlertCircle className="h-3 w-3" />
                <span>{dueInfo.label}</span>
              </span>
            ) : dueInfo.variant === 'today' ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-300">
                <Clock className="h-3 w-3" />
                <span>Due Today</span>
              </span>
            ) : dueInfo.variant === 'upcoming7' ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                <Calendar className="h-3 w-3" />
                <span>{dueInfo.label}</span>
                <span className="hidden sm:inline text-blue-500 font-normal">• Next 7 Days</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 border border-gray-200">
                <Clock className="h-3 w-3" />
                <span>{dueInfo.label}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            dir="auto"
            className={`mt-2 text-base font-semibold leading-snug break-words ${
              task.completed ? 'text-gray-500 line-through decoration-gray-400' : 'text-gray-900'
            }`}
          >
            {task.title}
          </h3>

          {/* Optional Description */}
          {task.description && (
            <p
              dir="auto"
              className={`mt-1.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                task.completed ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Due date info row & Action pill */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <span>Due: {formatFriendlyDate(task.dueDate)}</span>
              <span className="text-gray-400">({task.dueDate})</span>
            </div>

            {/* AI Breakdown Button & Steps Toggle */}
            <div className="flex items-center gap-1.5">
              {hasSavedSteps ? (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/80 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                  title="Toggle study steps"
                >
                  <ListOrdered className="h-3.5 w-3.5 text-blue-600" />
                  <span>
                    Steps ({completedStepsCount}/{totalStepsCount})
                  </span>
                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFetchAiBreakdown}
                  disabled={isLoadingAi}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100 disabled:opacity-50 transition-colors cursor-pointer"
                  title="Break down assignment with AI"
                >
                  {isLoadingAi ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-600" />
                      <span>Thinking...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                      <span>Break Down with AI</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Edit & Delete Card Actions */}
        <div className="flex shrink-0 items-center gap-1 pt-0.5">
          <button
            type="button"
            onClick={() => onEdit(task)}
            title="Edit task"
            aria-label="Edit task"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteRequest(task)}
            title="Delete task"
            aria-label="Delete task"
            className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Expandable Section: AI Suggestions Review, Errors, or Saved Steps */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          {/* AI Loading State */}
          {isLoadingAi && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-purple-50/70 p-4 border border-purple-100 text-xs font-medium text-purple-800 animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
              <span>Generating 3 to 6 practical study steps using AI...</span>
            </div>
          )}

          {/* AI Error Alert */}
          {aiError && !isLoadingAi && (
            <div className="rounded-xl bg-red-50 p-3.5 border border-red-200 text-xs text-red-700">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-800">AI Task Breakdown Notice</p>
                  <p className="mt-0.5 leading-relaxed">{aiError}</p>
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFetchAiBreakdown}
                  className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Retry</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAiError(null);
                    // Open empty manual step input if desired
                    if (!task.steps) {
                      onUpdateTask?.({ ...task, steps: [] });
                    }
                  }}
                  className="rounded-md border border-red-300 bg-white px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 cursor-pointer"
                >
                  Dismiss / Add Manually
                </button>
              </div>
            </div>
          )}

          {/* Review AI Suggestions Mode (Before Saving) */}
          {suggestedSteps && !isLoadingAi && (
            <div className="rounded-xl bg-gradient-to-br from-purple-50/60 to-blue-50/40 p-4 border border-purple-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                  <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                  <span>Suggested Study Steps ({suggestedSteps.length})</span>
                </div>
                <span className="text-[11px] text-gray-500">Review & edit before saving</span>
              </div>

              {/* Editable Suggested Steps List */}
              <div className="space-y-2">
                {suggestedSteps.map((stepText, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-white rounded-lg p-2 border border-purple-100 shadow-2xs"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[10px] font-bold text-purple-700">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      dir="auto"
                      value={stepText}
                      onChange={(e) => handleUpdateSuggestedStep(idx, e.target.value)}
                      className="flex-1 bg-transparent text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-purple-400 rounded px-1.5 py-0.5"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSuggestedStep(idx)}
                      title="Remove step"
                      className="text-gray-400 hover:text-red-600 p-1 rounded cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add custom extra step to suggestions */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  dir="auto"
                  placeholder="+ Add another study step..."
                  value={newSuggestionInput}
                  onChange={(e) => setNewSuggestionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSuggestedStep();
                    }
                  }}
                  className="flex-1 rounded-lg border border-purple-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
                <button
                  type="button"
                  onClick={handleAddSuggestedStep}
                  disabled={!newSuggestionInput.trim()}
                  className="rounded-lg bg-white border border-purple-200 px-2.5 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Save or Cancel Suggested Steps */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-100">
                <button
                  type="button"
                  onClick={handleCancelSuggestions}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSuggestedSteps}
                  disabled={suggestedSteps.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-purple-700 disabled:opacity-50 cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Save Study Steps</span>
                </button>
              </div>
            </div>
          )}

          {/* Saved Steps Display & Interactive Checklist */}
          {hasSavedSteps && !suggestedSteps && (
            <div className="space-y-2.5">
              {/* Header with Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                    <ListOrdered className="h-3.5 w-3.5 text-blue-600" />
                    <span>Study Progress:</span>
                    <span className="text-gray-500 font-normal">
                      {completedStepsCount} of {totalStepsCount} completed ({stepProgressPercentage}%)
                    </span>
                  </span>

                  <button
                    type="button"
                    onClick={handleFetchAiBreakdown}
                    disabled={isLoadingAi}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 hover:text-purple-800 hover:underline cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3 text-purple-600" />
                    <span>Re-generate with AI</span>
                  </button>
                </div>

                {/* Progress track */}
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      stepProgressPercentage === 100 ? 'bg-green-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${stepProgressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Step Checklist Items */}
              <div className="space-y-1.5">
                {task.steps?.map((step) => {
                  const isEditingThis = editingStepId === step.id;

                  return (
                    <div
                      key={step.id}
                      className={`flex items-start gap-2.5 rounded-lg border p-2 transition-colors ${
                        step.completed
                          ? 'border-green-100 bg-green-50/40 text-gray-500'
                          : 'border-gray-200 bg-white text-gray-900'
                      }`}
                    >
                      {/* Step Checkbox */}
                      <button
                        type="button"
                        onClick={() => handleToggleStepCompleted(step.id)}
                        aria-label={step.completed ? 'Mark step incomplete' : 'Mark step complete'}
                        className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-colors cursor-pointer ${
                          step.completed
                            ? 'border-green-600 bg-green-600 text-white'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      >
                        {step.completed && <Check className="h-3 w-3 stroke-[2.5]" />}
                      </button>

                      {/* Step text or inline editor */}
                      {isEditingThis ? (
                        <div className="flex-1 flex items-center gap-1.5">
                          <input
                            type="text"
                            dir="auto"
                            value={editingStepText}
                            onChange={(e) => setEditingStepText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveEditStep(step.id);
                              }
                            }}
                            className="flex-1 rounded border border-blue-400 px-2 py-0.5 text-xs text-gray-900 focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditStep(step.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingStepId(null)}
                            className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex-1 min-w-0">
                          <span
                            dir="auto"
                            className={`text-xs leading-relaxed block break-words ${
                              step.completed ? 'line-through text-gray-400' : 'text-gray-800'
                            }`}
                          >
                            {step.text}
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      {!isEditingThis && (
                        <div className="flex items-center gap-1 shrink-0 pt-0.5">
                          <button
                            type="button"
                            onClick={() => handleStartEditStep(step)}
                            title="Edit step"
                            className="p-0.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStep(step.id)}
                            title="Delete step"
                            className="p-0.5 text-gray-400 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add manual step input */}
              <form onSubmit={handleAddManualStep} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  dir="auto"
                  placeholder="+ Add another step manually..."
                  value={manualStepInput}
                  onChange={(e) => setManualStepInput(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!manualStepInput.trim()}
                  className="inline-flex items-center gap-1 rounded-lg bg-gray-100 border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 disabled:opacity-40 cursor-pointer transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
