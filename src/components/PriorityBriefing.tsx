import React, { useState } from 'react';
import { BriefingItem, PriorityRank } from '../types';
import { SourceBadge } from './SourceBadge';
import {
  AlertTriangle,
  Lightbulb,
  CheckSquare,
  Info,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  ArrowUpRight,
  CheckCircle2,
  Circle,
} from 'lucide-react';

interface PriorityBriefingProps {
  p0Items: BriefingItem[];
  p1Items: BriefingItem[];
  p2Items: BriefingItem[];
  p3Items: BriefingItem[];
  onToggleComplete: (id: string) => void;
  onOpenConversation: (convId: string) => void;
}

export const PriorityBriefing: React.FC<PriorityBriefingProps> = ({
  p0Items,
  p1Items,
  p2Items,
  p3Items,
  onToggleComplete,
  onOpenConversation,
}) => {
  const [activeTab, setActiveTab] = useState<PriorityRank | 'ALL'>('ALL');
  const [expandedSnippetId, setExpandedSnippetId] = useState<string | null>(null);

  const totalCount = p0Items.length + p1Items.length + p2Items.length + p3Items.length;

  const sections: Array<{
    rank: PriorityRank;
    label: string;
    sublabel: string;
    items: BriefingItem[];
    badgeBg: string;
    badgeText: string;
    icon: React.ReactNode;
  }> = [
    {
      rank: 'P0',
      label: 'P0 — Urgent',
      sublabel: 'Immediate deadlines, critical blockers & outages',
      items: p0Items,
      badgeBg: 'bg-[#e55353]/15 border-[#e55353]/30',
      badgeText: 'text-[#ff7878]',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-[#ff7878]" />,
    },
    {
      rank: 'P1',
      label: 'P1 — Important',
      sublabel: 'Major project decisions, leadership approvals & architecture',
      items: p1Items,
      badgeBg: 'bg-[#ffb020]/15 border-[#ffb020]/30',
      badgeText: 'text-[#ffb020]',
      icon: <Lightbulb className="w-3.5 h-3.5 text-[#ffb020]" />,
    },
    {
      rank: 'P2',
      label: 'P2 — Action Required',
      sublabel: 'Tasks assigned to you, pending replies & commitments',
      items: p2Items,
      badgeBg: 'bg-[#2481cc]/15 border-[#2481cc]/30',
      badgeText: 'text-[#50b2ff]',
      icon: <CheckSquare className="w-3.5 h-3.5 text-[#50b2ff]" />,
    },
    {
      rank: 'P3',
      label: 'P3 — FYI',
      sublabel: 'Useful updates, team context & non-urgent information',
      items: p3Items,
      badgeBg: 'bg-[#1e2f42] border-[#293d54]',
      badgeText: 'text-[#9ab0c5]',
      icon: <Info className="w-3.5 h-3.5 text-[#9ab0c5]" />,
    },
  ];

  const displayedSections =
    activeTab === 'ALL'
      ? sections
      : sections.filter((s) => s.rank === activeTab);

  return (
    <section aria-labelledby="briefing-heading" className="w-full bg-[#111923] border border-[#1c2a38] rounded-2xl p-5 sm:p-6 space-y-5">
      {/* Header and Priority Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1c2a38]">
        <div>
          <h2 id="briefing-heading" className="text-base font-bold text-white tracking-tight">
            Priority-Ranked Morning Briefing
          </h2>
          <p className="text-xs text-[#708499]">
            Organized in strict priority order (P0 Urgent → P3 FYI)
          </p>
        </div>

        {/* Priority Tabs */}
        <div className="flex items-center gap-1 bg-[#0c141d] p-1 rounded-lg border border-[#1b2837] overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'ALL'
                ? 'bg-[#2481cc] text-white shadow-sm'
                : 'text-[#9ab0c5] hover:text-white'
            }`}
          >
            All ({totalCount})
          </button>
          {sections.map((s) => (
            <button
              key={s.rank}
              onClick={() => setActiveTab(s.rank)}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                activeTab === s.rank
                  ? 'bg-[#1c2c3e] text-white border border-[#2b415a]'
                  : 'text-[#9ab0c5] hover:text-white'
              }`}
            >
              <span>{s.rank}</span>
              <span className="text-[10px] opacity-70">({s.items.length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-6">
        {displayedSections.map((sec) => (
          <div key={sec.rank} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-xs font-bold ${sec.badgeBg} ${sec.badgeText}`}
                >
                  {sec.icon}
                  <span>{sec.label}</span>
                </span>
                <span className="text-xs text-[#708499] hidden sm:inline">
                  {sec.sublabel}
                </span>
              </div>
              <span className="text-xs text-[#708499] font-mono">
                {sec.items.length} {sec.items.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {sec.items.length === 0 ? (
              <div className="p-4 bg-[#0d151f]/60 border border-[#17222f] rounded-xl text-center text-xs text-[#55697d]">
                No items in this category.
              </div>
            ) : (
              <div className="space-y-2.5">
                {sec.items.map((item) => {
                  const isExpanded = expandedSnippetId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all ${
                        item.actionCompleted
                          ? 'bg-[#0d141e]/50 border-[#15202c] opacity-60'
                          : 'bg-[#14202e] border-[#1f3044] hover:border-[#2481cc]/50 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox button */}
                        <button
                          onClick={() => onToggleComplete(item.id)}
                          className="mt-0.5 shrink-0 text-[#708499] hover:text-[#50b2ff] transition-colors focus:outline-none"
                          aria-label={item.actionCompleted ? 'Mark incomplete' : 'Mark completed'}
                        >
                          {item.actionCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-[#25d366]" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#708499] hover:text-[#50b2ff]" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                            <h3
                              className={`text-xs sm:text-sm font-semibold text-white leading-snug ${
                                item.actionCompleted ? 'line-through text-[#708499]' : ''
                              }`}
                            >
                              {item.headline}
                            </h3>

                            {/* Action indicator tag */}
                            {item.actionIndicator && (
                              <span
                                className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border self-start sm:self-auto shrink-0 ${
                                  item.actionIndicator === 'Response Needed'
                                    ? 'bg-[#e55353]/15 border-[#e55353]/30 text-[#ff7878]'
                                    : item.actionIndicator === 'Action Pending'
                                    ? 'bg-[#ffb020]/15 border-[#ffb020]/30 text-[#ffb020]'
                                    : item.actionIndicator === 'Review Required'
                                    ? 'bg-[#2481cc]/15 border-[#2481cc]/30 text-[#50b2ff]'
                                    : 'bg-[#1a2636] border-[#23354a] text-[#708499]'
                                }`}
                              >
                                {item.actionIndicator}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[#b0c4d8] leading-relaxed">
                            {item.explanation}
                          </p>

                          {/* Metadata row */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[11px] text-[#708499]">
                            <span className="flex items-center gap-1 text-white">
                              <User className="w-3 h-3 text-[#50b2ff]" />
                              <span>{item.senderName}</span>
                              {item.vipRole && (
                                <span className="text-[10px] text-[#ffb020] bg-[#ffb020]/10 px-1 rounded">
                                  {item.vipRole}
                                </span>
                              )}
                            </span>

                            <SourceBadge sourceApp={item.sourceApp} showPrefix={true} />

                            <span aria-hidden="true" className="text-[#3b4f65]">·</span>
                            <button
                              onClick={() => onOpenConversation(item.conversationId)}
                              className="text-[#50b2ff] hover:text-white flex items-center gap-0.5"
                            >
                              <span>{item.conversationName}</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>

                            {item.timestamp && (
                              <>
                                <span aria-hidden="true" className="text-[#3b4f65]">·</span>
                                <span className="flex items-center gap-1 font-mono">
                                  <Clock className="w-3 h-3" />
                                  <span>{item.timestamp}</span>
                                </span>
                              </>
                            )}

                            {item.explicitDeadline && (
                              <>
                                <span aria-hidden="true" className="text-[#3b4f65]">·</span>
                                <span className="text-[#ffb020] font-medium">
                                  Deadline: {item.explicitDeadline}
                                </span>
                              </>
                            )}

                            <button
                              onClick={() =>
                                setExpandedSnippetId(isExpanded ? null : item.id)
                              }
                              className="ml-auto text-[11px] text-[#50b2ff] hover:text-white flex items-center gap-0.5"
                            >
                              <span>{isExpanded ? 'Hide Evidence' : 'Show Snippet'}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </div>

                          {/* Original Evidence Snippet */}
                          {isExpanded && (
                            <div className="mt-2.5 p-3 bg-[#0c141e] border border-[#1b2938] rounded-lg text-xs space-y-1">
                              <div className="text-[10px] text-[#708499] font-medium flex items-center justify-between">
                                <span>Signal Basis: {item.priorityReason}</span>
                                <span>Verbatim Evidence</span>
                              </div>
                              <blockquote className="italic text-[#d0dfed] border-l-2 border-[#2481cc] pl-2.5 py-0.5 font-sans">
                                "{item.sourceMessageSnippet}"
                              </blockquote>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
