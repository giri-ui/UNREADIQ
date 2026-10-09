import React, { useState } from 'react';
import { ActionItem } from '../types';
import {
  Calendar,
  User,
  CheckCircle2,
  Circle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ActionItemCardProps {
  item: ActionItem;
  onToggleComplete: (id: string) => void;
}

export const ActionItemCard: React.FC<ActionItemCardProps> = ({
  item,
  onToggleComplete,
}) => {
  const [showContext, setShowContext] = useState(false);

  // Priority color styling for indicator border/dot
  const priorityColor =
    item.priority === 'urgent'
      ? 'border-rose-500/40 bg-rose-950/20 text-rose-300'
      : item.priority === 'important'
      ? 'border-amber-500/30 bg-amber-950/20 text-amber-300'
      : 'border-zinc-700/60 bg-zinc-900 text-zinc-300';

  return (
    <div
      className={`border rounded-xl p-4 transition-all ${
        item.completed
          ? 'bg-zinc-950/40 border-zinc-800/60 opacity-65'
          : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Completion checkbox button */}
        <button
          onClick={() => onToggleComplete(item.id)}
          className="mt-0.5 shrink-0 text-zinc-400 hover:text-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded transition-colors"
          aria-label={item.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
        >
          {item.completed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <Circle className="w-5 h-5 text-zinc-400 hover:text-emerald-400" />
          )}
        </button>

        {/* Content body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={`text-sm font-medium text-zinc-100 leading-snug break-words ${
                item.completed ? 'line-through text-zinc-400' : ''
              }`}
            >
              {item.description}
            </h4>

            {/* Priority Indicator */}
            <span
              className={`text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded border shrink-0 ${priorityColor}`}
              title={item.confidenceReason}
            >
              {item.priority}
            </span>
          </div>

          {/* Unboxed Metadata Row */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
            {/* Assignee */}
            {item.assignee && (
              <div className="flex items-center gap-1 text-emerald-300/90 font-medium">
                <User className="w-3.5 h-3.5" />
                <span>{item.assignee}</span>
              </div>
            )}

            {/* Deadline */}
            {item.deadline ? (
              <>
                <span aria-hidden="true" className="text-zinc-700">·</span>
                <div className="flex items-center gap-1 text-amber-300 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Due: {item.deadline}</span>
                </div>
              </>
            ) : null}

            {/* Source Sender */}
            <span aria-hidden="true" className="text-zinc-700">·</span>
            <span className="text-zinc-400">
              via {item.sourceSender}
              {item.sourceTimestamp ? ` (${item.sourceTimestamp})` : ''}
            </span>

            {/* Toggle context button */}
            <button
              onClick={() => setShowContext(!showContext)}
              className="ml-auto text-[11px] text-zinc-400 hover:text-zinc-300 flex items-center gap-0.5 focus:outline-none"
            >
              <span>{showContext ? 'Hide context' : 'Context'}</span>
              {showContext ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Context Expandable Box */}
          {showContext && (
            <div className="mt-3 p-3 bg-zinc-950/80 border border-zinc-800 rounded-lg text-xs space-y-1.5">
              <div className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Extraction reason: {item.confidenceReason}</span>
              </div>
              <blockquote className="italic text-zinc-300 border-l-2 border-emerald-500/40 pl-2">
                "{item.originalText}"
              </blockquote>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
