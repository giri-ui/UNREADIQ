import React from 'react';
import { ExtractionResult } from '../types';
import {
  MessageSquare,
  Users,
  CheckSquare,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';

interface OverviewMetricsProps {
  result: ExtractionResult;
  onCopySummary: () => void;
  isCopied: boolean;
  onOpenOriginalModal: () => void;
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({
  result,
  onCopySummary,
  isCopied,
  onOpenOriginalModal,
}) => {
  const completedTasks = result.actionItems.filter((t) => t.completed).length;
  const totalTasks = result.actionItems.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <section aria-labelledby="insights-summary-heading" className="w-full space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Messages */}
        <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs font-medium">Messages</span>
            <MessageSquare className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-zinc-100">{result.rawMessageCount}</span>
            <span className="text-[11px] text-zinc-400">{result.processingTimeMs}ms parse</span>
          </div>
        </div>

        {/* Participants */}
        <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs font-medium">Participants</span>
            <Users className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-zinc-100">{result.participants.length}</span>
            <span className="text-[11px] text-zinc-400">speakers</span>
          </div>
        </div>

        {/* Action Items */}
        <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs font-medium">Action Items</span>
            <CheckSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-emerald-400">
              {completedTasks}/{totalTasks}
            </span>
            <span className="text-[11px] text-zinc-400">{progressPercent}% done</span>
          </div>
        </div>

        {/* Decisions */}
        <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs font-medium">Decisions</span>
            <Lightbulb className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-zinc-100">{result.decisions.length}</span>
            <span className="text-[11px] text-zinc-400">ratified</span>
          </div>
        </div>

        {/* Urgent Items */}
        <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs font-medium">Urgent Items</span>
            <AlertTriangle
              className={`w-4 h-4 ${result.urgentItemsCount > 0 ? 'text-rose-400' : 'text-zinc-400'}`}
            />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-xl font-bold ${
                result.urgentItemsCount > 0 ? 'text-rose-400' : 'text-zinc-100'
              }`}
            >
              {result.urgentItemsCount}
            </span>
            <span className="text-[11px] text-zinc-400">
              {result.urgentItemsCount > 0 ? 'attention' : 'clear'}
            </span>
          </div>
        </div>
      </div>

      {/* Executive Summary Card */}
      <div className="p-5 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800/90 rounded-xl shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 id="insights-summary-heading" className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Executive Summary & Context
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenOriginalModal}
              className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded hover:bg-zinc-800 transition-colors"
            >
              View Source Messages ({result.rawMessageCount})
            </button>
            <button
              onClick={onCopySummary}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md border border-zinc-700 transition-colors"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy Report</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Synthesis Text */}
        <p className="text-sm text-zinc-300 leading-relaxed font-sans">
          {result.executiveSummary}
        </p>

        {/* Key topics & details bar */}
        <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-zinc-400">
          {result.timeSpan?.start && (
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>
                Window: {result.timeSpan.start} → {result.timeSpan.end}
              </span>
            </div>
          )}

          {result.keyTopics.length > 0 && (
            <div className="flex items-center gap-1.5 text-zinc-400">
              <span className="text-zinc-400 font-medium">Topics:</span>
              <span>{result.keyTopics.join(' · ')}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-zinc-400 ml-auto">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Deterministic Local NLP Engine</span>
          </div>
        </div>
      </div>
    </section>
  );
};
