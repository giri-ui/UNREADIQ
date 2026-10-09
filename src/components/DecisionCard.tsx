import React, { useState } from 'react';
import { Decision } from '../types';
import { Check, User, ChevronDown, ChevronUp, Sparkles, Scale } from 'lucide-react';

interface DecisionCardProps {
  decision: Decision;
}

export const DecisionCard: React.FC<DecisionCardProps> = ({ decision }) => {
  const [showContext, setShowContext] = useState(false);

  return (
    <div className="bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 transition-all">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
          <Scale className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-zinc-100 leading-snug break-words">
              {decision.title}
            </h4>

            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 rounded shrink-0">
              Ratified
            </span>
          </div>

          {/* Unboxed Metadata */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
            {decision.decider && (
              <div className="flex items-center gap-1 text-zinc-300">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                <span>Confirmed by {decision.decider}</span>
              </div>
            )}

            {decision.sourceTimestamp && (
              <>
                <span aria-hidden="true" className="text-zinc-700">·</span>
                <span className="text-zinc-400">{decision.sourceTimestamp}</span>
              </>
            )}

            <button
              onClick={() => setShowContext(!showContext)}
              className="ml-auto text-[11px] text-zinc-400 hover:text-zinc-300 flex items-center gap-0.5 focus:outline-none"
            >
              <span>{showContext ? 'Hide context' : 'Context'}</span>
              {showContext ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {showContext && (
            <div className="mt-3 p-3 bg-zinc-950/80 border border-zinc-800 rounded-lg text-xs space-y-1.5">
              <div className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Signal: {decision.confidenceReason}</span>
              </div>
              <blockquote className="italic text-zinc-300 border-l-2 border-amber-500/40 pl-2">
                "{decision.context}"
              </blockquote>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
