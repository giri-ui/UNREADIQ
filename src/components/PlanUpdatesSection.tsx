import React from 'react';
import { PlanUpdate } from '../types';
import { SourceBadge } from './SourceBadge';
import { AlertTriangle, Clock, ArrowRight, User, CheckCircle2, MapPin, Calendar } from 'lucide-react';

interface PlanUpdatesSectionProps {
  planUpdates: PlanUpdate[];
  onOpenConversationByName?: (convName: string) => void;
}

export const PlanUpdatesSection: React.FC<PlanUpdatesSectionProps> = ({
  planUpdates,
}) => {
  if (planUpdates.length === 0) return null;

  return (
    <section
      aria-labelledby="plan-updates-heading"
      className="w-full bg-[#171f2b] border-2 border-[#ffb020]/50 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#ffb020]/20 border border-[#ffb020]/40 flex items-center justify-center text-[#ffb020]">
            <AlertTriangle className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <h2 id="plan-updates-heading" className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>⚠️ Changed Plans & Updated Instructions ({planUpdates.length})</span>
              <span className="text-[10px] bg-[#ffb020]/20 text-[#ffb020] border border-[#ffb020]/30 px-2 py-0.5 rounded-full font-bold">
                Action Required
              </span>
            </h2>
            <p className="text-xs text-[#9ab0c5]">
              Faculty or classmates updated previous times, venues, or submission dates
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {planUpdates.map((update) => (
          <div
            key={update.id}
            className="p-4 bg-[#111923] border border-[#ffb020]/40 rounded-xl space-y-3 shadow-md"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#ffb020]/20 text-[#ffb020] border border-[#ffb020]/40">
                  {update.eventType === 'location'
                    ? 'Venue Changed'
                    : update.eventType === 'time'
                    ? 'Time Rescheduled'
                    : 'Deadline Extended'}
                </span>
                <h3 className="text-sm font-bold text-white mt-1">
                  {update.title}
                </h3>
              </div>

              <span className="text-[11px] text-[#708499] font-mono">
                {update.updatedTime}
              </span>
            </div>

            {/* Clear Visual Diff Comparison: Previous → New */}
            <div className="p-3 bg-[#0d141e] border border-[#22354a] rounded-lg space-y-2">
              <div className="text-[11px] text-[#708499] flex items-center justify-between">
                <span>Plan Comparison:</span>
                <span className="text-[#ffb020]">Updated by {update.personName}</span>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2.5 py-1 bg-[#1a2330] text-[#ff7878] line-through rounded border border-[#2b3a4c]">
                  {update.originalValue}
                </span>
                <ArrowRight className="w-4 h-4 text-[#50b2ff] shrink-0" />
                <span className="px-2.5 py-1 bg-[#152a22] text-[#25d366] font-bold rounded border border-[#25d366]/40">
                  {update.updatedValue}
                </span>
              </div>
            </div>

            {/* Metadata & Reminder sync notice */}
            <div className="space-y-1.5 text-xs">
              <div className="flex flex-wrap items-center gap-2 text-[#9ab0c5] text-[11px]">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#50b2ff]" />
                  <span>Updated by: <strong className="text-white">{update.personName}</strong></span>
                </span>
                <span aria-hidden="true" className="text-[#3b4f65]">·</span>
                <SourceBadge sourceApp={update.sourceApp} showPrefix={true} />
                <span aria-hidden="true" className="text-[#3b4f65]">·</span>
                <span>In: {update.conversationName}</span>
              </div>

              {update.appliedToReminder && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#25d366] bg-[#14291f] p-2 rounded border border-[#25d366]/30">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Smart Reminder updated and alarm rescheduled automatically.
                  </span>
                </div>
              )}
            </div>

            {/* Verbatim message evidence */}
            <div className="pt-1 text-[11px] space-y-1 text-[#708499]">
              <div>Latest Message Snippet:</div>
              <blockquote className="p-2 bg-[#091017] border-l-2 border-[#ffb020] rounded italic text-[#d4e4f4]">
                "{update.updatedMessageText}"
              </blockquote>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
