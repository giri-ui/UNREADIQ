import React from 'react';
import { DeadlineEvent } from '../types';
import { Clock, Calendar, ArrowRight } from 'lucide-react';

interface TimelinePanelProps {
  deadlines: DeadlineEvent[];
}

export const TimelinePanel: React.FC<TimelinePanelProps> = ({ deadlines }) => {
  if (deadlines.length === 0) {
    return (
      <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-xl text-center text-xs text-zinc-400">
        No explicit deadlines or target dates mentioned in this conversation.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
        {deadlines.map((dl, idx) => (
          <div key={dl.id} className="relative group">
            {/* Timeline bullet */}
            <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-zinc-900 border-2 border-emerald-400 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-xl p-3.5 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Target: {dl.deadlineString}
                </span>

                <span className="text-zinc-400">
                  via {dl.sender} {dl.timestamp ? `· ${dl.timestamp}` : ''}
                </span>
              </div>

              <p className="mt-1.5 text-xs text-zinc-200 leading-relaxed font-sans">
                {dl.associatedTask || dl.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
