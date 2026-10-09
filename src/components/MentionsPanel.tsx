import React from 'react';
import { MentionRecord } from '../types';
import { AtSign, CheckSquare, MessageSquare } from 'lucide-react';

interface MentionsPanelProps {
  mentions: MentionRecord[];
  selectedMention: string | null;
  onSelectMention: (handle: string | null) => void;
}

export const MentionsPanel: React.FC<MentionsPanelProps> = ({
  mentions,
  selectedMention,
  onSelectMention,
}) => {
  if (mentions.length === 0) {
    return (
      <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-xl text-center text-xs text-zinc-400">
        No @mentions detected in this conversation.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400">
          Click any handle to filter all tasks and quotes tagged to them:
        </span>
        {selectedMention && (
          <button
            onClick={() => onSelectMention(null)}
            className="text-xs text-emerald-400 hover:text-emerald-300 underline"
          >
            Clear mention filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {mentions.map((record) => {
          const isSelected = selectedMention?.toLowerCase() === record.handle.toLowerCase();

          return (
            <button
              key={record.handle}
              onClick={() => onSelectMention(isSelected ? null : record.handle)}
              className={`text-left p-3.5 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-emerald-950/30 border-emerald-500/50 ring-1 ring-emerald-500/50 shadow-md'
                  : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-emerald-300 flex items-center gap-1">
                  <AtSign className="w-3.5 h-3.5" />
                  {record.handle.replace('@', '')}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  {record.count} {record.count === 1 ? 'tag' : 'tags'}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <span className="flex items-center gap-1">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{record.assignedTasksCount} assigned tasks</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
