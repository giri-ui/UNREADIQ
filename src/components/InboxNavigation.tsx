import React from 'react';
import { InboxFilter } from '../types';
import { Briefcase, Heart, Inbox } from 'lucide-react';

interface InboxNavigationProps {
  currentCategory: InboxFilter;
  onSelectCategory: (cat: InboxFilter) => void;
  counts: {
    all: number;
    college: number;
    personal: number;
    reminders: number;
  };
}

export const InboxNavigation: React.FC<InboxNavigationProps> = ({
  currentCategory,
  onSelectCategory,
  counts,
}) => {
  return (
    <div className="w-full border-b border-[#1c2a38] bg-[#0e1622]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto scrollbar-none py-2">
        <button
          onClick={() => onSelectCategory('all')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all border ${
            currentCategory === 'all'
              ? 'bg-[#2481cc] text-white border-[#2481cc] shadow-md shadow-[#2481cc]/20'
              : 'bg-[#131d28] text-[#9ab0c5] border-[#1d2a3a] hover:text-white hover:bg-[#182433]'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>All Inbox</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              currentCategory === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-[#0d151f] text-[#50b2ff]'
            }`}
          >
            {counts.all}
          </span>
        </button>

        <button
          onClick={() => onSelectCategory('college')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all border ${
            currentCategory === 'college'
              ? 'bg-[#2481cc] text-white border-[#2481cc] shadow-md shadow-[#2481cc]/20'
              : 'bg-[#131d28] text-[#9ab0c5] border-[#1d2a3a] hover:text-white hover:bg-[#182433]'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Professional / College</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              currentCategory === 'college'
                ? 'bg-white/20 text-white'
                : 'bg-[#0d151f] text-[#50b2ff]'
            }`}
          >
            {counts.college}
          </span>
        </button>

        <button
          onClick={() => onSelectCategory('personal')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all border ${
            currentCategory === 'personal'
              ? 'bg-[#2481cc] text-white border-[#2481cc] shadow-md shadow-[#2481cc]/20'
              : 'bg-[#131d28] text-[#9ab0c5] border-[#1d2a3a] hover:text-white hover:bg-[#182433]'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Family & Personal</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              currentCategory === 'personal'
                ? 'bg-white/20 text-white'
                : 'bg-[#0d151f] text-[#50b2ff]'
            }`}
          >
            {counts.personal}
          </span>
        </button>

        <button
          onClick={() => onSelectCategory('reminders')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all border ${
            currentCategory === 'reminders'
              ? 'bg-[#2481cc] text-white border-[#2481cc] shadow-md shadow-[#2481cc]/20'
              : 'bg-[#131d28] text-[#9ab0c5] border-[#1d2a3a] hover:text-white hover:bg-[#182433]'
          }`}
        >
          <Briefcase className="hidden" />
          <span>My Reminders</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              currentCategory === 'reminders'
                ? 'bg-white/20 text-white'
                : 'bg-[#0d151f] text-[#ffb020]'
            }`}
          >
            {counts.reminders}
          </span>
        </button>
      </div>
    </div>
  );
};
