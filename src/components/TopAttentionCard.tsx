import React from 'react';
import { BriefingItem } from '../types';
import { SourceBadge } from './SourceBadge';
import { AlertTriangle, Clock, CheckCircle2, Circle, ArrowUpRight } from 'lucide-react';

interface TopAttentionCardProps {
  items: BriefingItem[];
  onToggleHandled: (id: string) => void;
  onOpenConversation: (convId: string) => void;
}

export const TopAttentionCard: React.FC<TopAttentionCardProps> = ({
  items,
  onToggleHandled,
  onOpenConversation,
}) => {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="top-attention-heading" className="w-full bg-[#111b27] border border-[#1e2f42] rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#e55353]/15 border border-[#e55353]/30 flex items-center justify-center text-[#ff6e6e]">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <h2 id="top-attention-heading" className="text-sm font-bold text-white tracking-tight">
            Top 3 Items Needing Attention
          </h2>
        </div>
        <span className="text-[11px] text-[#708499]">
          Ranked by urgency & required response
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
              item.actionCompleted
                ? 'bg-[#101924]/60 border-[#1a2838] opacity-60'
                : 'bg-[#142130] border-[#22354c] hover:border-[#2481cc]/60 shadow-md'
            }`}
          >
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold px-2 py-0.5 rounded bg-[#e55353]/20 text-[#ff7878] border border-[#e55353]/30">
                    {item.priority}
                  </span>
                  <SourceBadge sourceApp={item.sourceApp} showPrefix={true} />
                </div>
                {item.explicitDeadline && (
                  <span className="text-[#ffb020] font-medium flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {item.explicitDeadline}
                  </span>
                )}
              </div>

              <h3
                className={`text-xs font-semibold text-white leading-snug ${
                  item.actionCompleted ? 'line-through text-[#708499]' : ''
                }`}
              >
                {item.headline}
              </h3>

              <p className="text-[11px] text-[#9ab0c5] leading-relaxed line-clamp-3">
                {item.explanation}
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-[#1d2c3e] flex items-center justify-between text-[11px]">
              <button
                onClick={() => onOpenConversation(item.conversationId)}
                className="text-[#50b2ff] hover:text-white flex items-center gap-0.5"
                title="View full conversation"
              >
                <span>{item.conversationName}</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>

              <button
                onClick={() => onToggleHandled(item.id)}
                className="flex items-center gap-1 text-[#9ab0c5] hover:text-white transition-colors"
              >
                {item.actionCompleted ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#25d366]" />
                    <span className="text-[#25d366]">Handled</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-3.5 h-3.5 text-[#708499]" />
                    <span>Mark Done</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
