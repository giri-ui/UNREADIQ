import React from 'react';
import { FilterCategory } from '../types';
import { Search, Filter, AlertTriangle, CheckSquare, Lightbulb, AtSign, Users } from 'lucide-react';

interface FilterBarProps {
  currentFilter: FilterCategory;
  onFilterChange: (cat: FilterCategory) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  participants: string[];
  selectedSpeaker: string | null;
  onSelectSpeaker: (speaker: string | null) => void;
  urgentCount: number;
  tasksCount: number;
  decisionsCount: number;
  mentionsCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  currentFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  participants,
  selectedSpeaker,
  onSelectSpeaker,
  urgentCount,
  tasksCount,
  decisionsCount,
  mentionsCount,
}) => {
  return (
    <div className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Segmented Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-950/80 rounded-lg border border-zinc-800/80 overflow-x-auto scrollbar-none">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentFilter === 'all'
                ? 'bg-zinc-800 text-emerald-400 shadow-sm border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>All Items</span>
          </button>

          <button
            onClick={() => onFilterChange('urgent')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentFilter === 'urgent'
                ? 'bg-rose-950/40 text-rose-300 shadow-sm border border-rose-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Urgent</span>
            {urgentCount > 0 && (
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-mono">
                {urgentCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onFilterChange('tasks')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentFilter === 'tasks'
                ? 'bg-emerald-950/40 text-emerald-300 shadow-sm border border-emerald-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks</span>
            <span className="text-[10px] text-zinc-400 font-mono">({tasksCount})</span>
          </button>

          <button
            onClick={() => onFilterChange('decisions')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentFilter === 'decisions'
                ? 'bg-amber-950/40 text-amber-300 shadow-sm border border-amber-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Decisions</span>
            <span className="text-[10px] text-zinc-400 font-mono">({decisionsCount})</span>
          </button>

          <button
            onClick={() => onFilterChange('mentions')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentFilter === 'mentions'
                ? 'bg-zinc-800 text-zinc-200 shadow-sm border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <AtSign className="w-3.5 h-3.5" />
            <span>Mentions</span>
            <span className="text-[10px] text-zinc-400 font-mono">({mentionsCount})</span>
          </button>
        </div>

        {/* Search & Speaker Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* Speaker Dropdown */}
          {participants.length > 0 && (
            <div className="relative w-full sm:w-auto">
              <select
                value={selectedSpeaker || ''}
                onChange={(e) => onSelectSpeaker(e.target.value ? e.target.value : null)}
                className="w-full sm:w-44 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/60 appearance-none pr-8 cursor-pointer"
                aria-label="Filter by participant speaker"
              >
                <option value="">All Speakers ({participants.length})</option>
                {participants.map((speaker) => (
                  <option key={speaker} value={speaker}>
                    {speaker}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-2.5 text-zinc-400">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
          )}

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tasks, decisions..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-200 text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
