import React from 'react';
import { MentionAnalysis } from '../types';
import { SourceBadge } from './SourceBadge';
import { AtSign, MessageSquare, ArrowUpRight, Clock, HelpCircle, CheckSquare, Award } from 'lucide-react';

interface MentionsSectionProps {
  mentions: MentionAnalysis[];
  onOpenConversation: (convId: string) => void;
}

export const MentionsSection: React.FC<MentionsSectionProps> = ({
  mentions,
  onOpenConversation,
}) => {
  if (mentions.length === 0) {
    return (
      <section aria-labelledby="mentions-heading" className="w-full bg-[#111923] border border-[#1c2a38] rounded-2xl p-5 space-y-3">
        <h2 id="mentions-heading" className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <AtSign className="w-4 h-4 text-[#50b2ff]" />
          <span>My Mentions ({mentions.length})</span>
        </h2>
        <div className="p-4 bg-[#0d141e] border border-[#17222f] rounded-xl text-center text-xs text-[#55697d]">
          Your name or aliases were not mentioned in overnight messages.
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="mentions-heading" className="w-full bg-[#111923] border border-[#1c2a38] rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#2481cc]/20 border border-[#2481cc]/40 flex items-center justify-center text-[#50b2ff]">
            <AtSign className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 id="mentions-heading" className="text-base font-bold text-white tracking-tight">
              My Mentions & References ({mentions.length})
            </h2>
            <p className="text-xs text-[#708499]">
              Every group conversation where you were directly cited, questioned, or assigned work
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {mentions.map((m) => {
          const intentBadge =
            m.inferredIntent === 'task_assigned'
              ? { text: 'Task Assigned', color: 'text-[#ff7878] bg-[#e55353]/15 border-[#e55353]/30', icon: <CheckSquare className="w-3 h-3" /> }
              : m.inferredIntent === 'question_asked'
              ? { text: 'Question / Inquiry', color: 'text-[#ffb020] bg-[#ffb020]/15 border-[#ffb020]/30', icon: <HelpCircle className="w-3 h-3" /> }
              : m.inferredIntent === 'praised'
              ? { text: 'Recognition / Praise', color: 'text-[#25d366] bg-[#25d366]/15 border-[#25d366]/30', icon: <Award className="w-3 h-3" /> }
              : { text: 'Referenced', color: 'text-[#9ab0c5] bg-[#1d2b3a] border-[#273a4e]', icon: <MessageSquare className="w-3 h-3" /> };

          return (
            <div
              key={m.id}
              className="p-4 bg-[#14202e] border border-[#203247] hover:border-[#2481cc]/50 rounded-xl space-y-3 transition-colors shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <button
                      onClick={() => onOpenConversation(m.conversationId)}
                      className="text-xs font-semibold text-[#50b2ff] hover:text-white flex items-center gap-1"
                    >
                      <span>{m.conversationName}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                    <SourceBadge sourceApp={m.sourceApp} showPrefix={true} />
                  </div>
                  <div className="text-[11px] text-[#708499]">
                    Topic: <strong className="text-white">{m.topic}</strong>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border flex items-center gap-1 shrink-0 ${intentBadge.color}`}
                >
                  {intentBadge.icon}
                  <span>{intentBadge.text}</span>
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="text-[#d5e4f3] leading-relaxed">
                  <span className="text-white font-medium">{m.mentionedBy}</span>:{' '}
                  {m.discussionSummary}
                </div>

                <div className="p-2 rounded bg-[#0d151f] border border-[#1b2837] text-[11px] space-y-1">
                  <div className="text-[#50b2ff] font-semibold flex items-center gap-1">
                    <span>Action Needed:</span>
                  </div>
                  <div className="text-white">{m.actionNeeded}</div>
                </div>
              </div>

              {/* Evidence box */}
              <div className="p-2.5 bg-[#0b1219] border border-[#182535] rounded-lg text-[11px] space-y-1">
                <div className="text-[#708499] flex items-center justify-between">
                  <span>Exact Message Evidence:</span>
                  <span className="font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {m.timestamp}
                  </span>
                </div>
                <blockquote className="italic text-[#a4b8cc] border-l-2 border-[#2481cc] pl-2 font-sans">
                  "{m.originalSnippet}"
                </blockquote>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
