import React, { useState } from 'react';
import { VipActivitySummary } from '../types';
import { Shield, User, ChevronDown, ChevronUp, MessageSquare, CheckSquare, Lightbulb, Clock, X } from 'lucide-react';

interface VipSectionProps {
  vipActivities: VipActivitySummary[];
  onOpenConversationByName?: (convName: string) => void;
}

export const VipSection: React.FC<VipSectionProps> = ({ vipActivities }) => {
  const [selectedVipId, setSelectedVipId] = useState<string | null>(null);

  if (vipActivities.length === 0) return null;

  const selectedVip = vipActivities.find((v) => v.contactId === selectedVipId);

  return (
    <section aria-labelledby="vip-heading" className="w-full bg-[#111923] border border-[#1c2a38] rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#ffb020]/15 border border-[#ffb020]/30 flex items-center justify-center text-[#ffb020]">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 id="vip-heading" className="text-base font-bold text-white tracking-tight">
              Important People & Leadership Activity
            </h2>
            <p className="text-xs text-[#708499]">
              Track leadership decisions, assignments, and questions from designated VIP contacts
            </p>
          </div>
        </div>
      </div>

      {/* Grid of VIP summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {vipActivities.map((vip) => {
          const isSelected = selectedVipId === vip.contactId;

          return (
            <button
              key={vip.contactId}
              onClick={() => setSelectedVipId(isSelected ? null : vip.contactId)}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#182738] border-[#2481cc] ring-1 ring-[#2481cc]/40 shadow-lg'
                  : 'bg-[#14202e] border-[#1e3044] hover:border-[#2481cc]/40 hover:bg-[#162332]'
              }`}
            >
              <div className="space-y-1.5 w-full">
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#50b2ff]" />
                      <span>{vip.name}</span>
                    </h3>
                    <span className="text-[11px] font-medium text-[#ffb020]">
                      {vip.role}
                    </span>
                  </div>

                  <span className="text-[10px] bg-[#0c141e] text-[#9ab0c5] border border-[#1c2a38] px-2 py-0.5 rounded font-mono">
                    {vip.messageCount} msgs
                  </span>
                </div>

                <div className="text-xs text-[#9ab0c5] line-clamp-1 pt-1">
                  Active in: {vip.conversations.join(', ')}
                </div>

                {vip.importantDecisions.length > 0 && (
                  <div className="text-[11px] text-[#25d366] flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 shrink-0" />
                    <span className="truncate">{vip.importantDecisions.length} leadership decisions</span>
                  </div>
                )}

                {vip.interactionsWithUser.length > 0 && (
                  <div className="text-[11px] text-[#50b2ff] flex items-center gap-1">
                    <CheckSquare className="w-3 h-3 shrink-0" />
                    <span>{vip.interactionsWithUser.length} requests directed to you</span>
                  </div>
                )}
              </div>

              <div className="pt-2 mt-2 border-t border-[#1e2f42] flex items-center justify-between text-[11px] text-[#50b2ff] w-full">
                <span>{isSelected ? 'Close summary' : 'View full breakdown'}</span>
                {isSelected ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Individual VIP Activity Modal / Drawer */}
      {selectedVip && (
        <div className="p-5 bg-[#0e1622] border border-[#2481cc]/40 rounded-xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#1c2c3e]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#2481cc]/20 border border-[#2481cc]/40 flex items-center justify-center text-[#50b2ff] font-bold">
                {selectedVip.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{selectedVip.name}</span>
                  <span className="text-xs font-medium text-[#ffb020] bg-[#ffb020]/10 border border-[#ffb020]/20 px-2 py-0.2 rounded">
                    {selectedVip.role}
                  </span>
                </h3>
                <p className="text-xs text-[#708499]">
                  {selectedVip.messageCount} messages across {selectedVip.conversations.join(', ')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedVipId(null)}
              className="p-1 text-[#708499] hover:text-white rounded hover:bg-[#172332]"
              aria-label="Close VIP breakdown"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 1. Main Topics Discussed */}
            <div className="p-3 bg-[#131f2d] border border-[#1e2f42] rounded-lg space-y-1.5">
              <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
                <span>1. Main Topics Discussed</span>
              </span>
              <ul className="space-y-1 text-[#b5c7d8] pl-2">
                {selectedVip.mainTopics.map((t, idx) => (
                  <li key={idx}>• {t}</li>
                ))}
              </ul>
            </div>

            {/* 2. Important Updates & Decisions */}
            <div className="p-3 bg-[#131f2d] border border-[#1e2f42] rounded-lg space-y-1.5">
              <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
                <span>2. Important Updates or Decisions</span>
              </span>
              {selectedVip.importantDecisions.length > 0 ? (
                <ul className="space-y-1 text-[#25d366] pl-2">
                  {selectedVip.importantDecisions.map((d, idx) => (
                    <li key={idx}>✓ {d}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-[#708499] italic">No formal decisions ratified in this period.</span>
              )}
            </div>

            {/* 3. Requests and Assignments */}
            <div className="p-3 bg-[#131f2d] border border-[#1e2f42] rounded-lg space-y-1.5">
              <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
                <span>3. Requests & Assignments</span>
              </span>
              {selectedVip.requestsAndAssignments.length > 0 ? (
                <ul className="space-y-1 text-[#ff7878] pl-2">
                  {selectedVip.requestsAndAssignments.map((r, idx) => (
                    <li key={idx}>⚠ {r}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-[#708499] italic">No active assignments made.</span>
              )}
            </div>

            {/* 4. Interactions with You */}
            <div className="p-3 bg-[#131f2d] border border-[#1e2f42] rounded-lg space-y-1.5">
              <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
                <span>4. Direct Interactions with You</span>
              </span>
              {selectedVip.interactionsWithUser.length > 0 ? (
                <ul className="space-y-1 text-[#50b2ff] pl-2">
                  {selectedVip.interactionsWithUser.map((u, idx) => (
                    <li key={idx}>→ {u}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-[#708499] italic">No direct mentions or queries to you.</span>
              )}
            </div>
          </div>

          {/* 5. Key Message Snippets */}
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-semibold text-[#9ab0c5]">
              Original Message Snippets from {selectedVip.name}:
            </span>
            <div className="space-y-1.5">
              {selectedVip.keyMessageSnippets.map((s, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-[#0b1219] border border-[#182637] rounded-lg text-xs space-y-0.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-[#708499]">
                    <span>{s.conversation}</span>
                    <span className="font-mono">{s.timestamp}</span>
                  </div>
                  <p className="italic text-[#d0dfed]">"{s.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
