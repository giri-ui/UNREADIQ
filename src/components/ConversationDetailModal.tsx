import React, { useState, useMemo } from 'react';
import { Conversation, UserProfile } from '../types';
import { analyzeConversationParticipants } from '../utils/intelligence';
import { SourceBadge } from './SourceBadge';
import {
  X,
  FileText,
  Lightbulb,
  CheckSquare,
  AtSign,
  Users,
  MessageSquare,
  Search,
  Clock,
  Shield,
  CheckCircle2,
} from 'lucide-react';

interface ConversationDetailModalProps {
  conversation: Conversation | null;
  onClose: () => void;
  userProfile: UserProfile;
}

type DetailTab = 'summary' | 'decisions' | 'tasks' | 'mentions' | 'people' | 'messages';

export const ConversationDetailModal: React.FC<ConversationDetailModalProps> = ({
  conversation,
  onClose,
  userProfile,
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('summary');
  const [messageSearch, setMessageSearch] = useState('');

  if (!conversation) return null;

  // Compute participants analysis
  const people = useMemo(() => {
    return analyzeConversationParticipants(conversation, userProfile);
  }, [conversation, userProfile]);

  // Extract decisions from this conversation's messages
  const decisions = conversation.messages.filter((m) => {
    const text = m.messageText.toLowerCase();
    return (
      text.includes('decision') ||
      text.includes('approved:') ||
      text.includes('agreed') ||
      text.includes('rollback') ||
      text.includes('freeze')
    );
  });

  // Extract tasks from this conversation
  const tasks = conversation.messages.filter((m) => {
    const text = m.messageText.toLowerCase();
    return (
      text.includes('action item') ||
      text.includes('needs to') ||
      text.includes('please') ||
      text.includes('sign off') ||
      text.includes('i will')
    );
  });

  // Extract mentions from this conversation
  const mentions = conversation.messages.filter((m) => {
    const text = m.messageText.toLowerCase();
    return userProfile.aliases.some((a) =>
      text.includes(a.toLowerCase().replace('@', ''))
    );
  });

  // Filtered raw messages
  const filteredMessages = conversation.messages.filter((m) => {
    if (!messageSearch) return true;
    const q = messageSearch.toLowerCase();
    return (
      m.messageText.toLowerCase().includes(q) ||
      m.senderName.toLowerCase().includes(q)
    );
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="conversation-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#0f1722] border border-[#203247] rounded-2xl shadow-2xl p-5 sm:p-6 text-white overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1c2c3e] shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="conversation-detail-title" className="text-base sm:text-lg font-bold text-white">
                {conversation.name}
              </h2>
              <SourceBadge sourceApp={conversation.sourceApp} showPrefix={true} />
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#2481cc]/20 text-[#50b2ff] border border-[#2481cc]/30 capitalize">
                {conversation.category === 'college' ? 'College' : 'Family & Personal'}
              </span>
            </div>
            <p className="text-xs text-[#708499]">
              {conversation.messages.length} messages · Latest: {conversation.latestActivity}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#708499] hover:text-white rounded-lg hover:bg-[#1a2839] transition-colors"
            aria-label="Close conversation detail"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 py-3 border-b border-[#1c2c3e] overflow-x-auto scrollbar-none shrink-0 text-xs font-medium">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'summary'
                ? 'bg-[#2481cc] text-white shadow-sm'
                : 'text-[#9ab0c5] hover:text-white hover:bg-[#182637]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('decisions')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'decisions'
                ? 'bg-[#2481cc] text-white shadow-sm'
                : 'text-[#9ab0c5] hover:text-white hover:bg-[#182637]'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Decisions ({decisions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'tasks'
                ? 'bg-[#2481cc] text-white shadow-sm'
                : 'text-[#9ab0c5] hover:text-white hover:bg-[#182637]'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>My Tasks ({tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('mentions')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'mentions'
                ? 'bg-[#2481cc] text-white shadow-sm'
                : 'text-[#9ab0c5] hover:text-white hover:bg-[#182637]'
            }`}
          >
            <AtSign className="w-3.5 h-3.5" />
            <span>Mentions ({mentions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('people')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'people'
                ? 'bg-[#2481cc] text-white shadow-sm'
                : 'text-[#9ab0c5] hover:text-white hover:bg-[#182637]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>People ({people.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'messages'
                ? 'bg-[#2481cc] text-white shadow-sm'
                : 'text-[#9ab0c5] hover:text-white hover:bg-[#182637]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Original Messages</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs">
          {/* 1. Summary Tab */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#14202e] border border-[#203247] rounded-xl space-y-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider text-[#50b2ff]">
                  Overnight Discussion Summary
                </h3>
                <p className="text-sm text-[#d4e4f4] leading-relaxed">
                  Active exchange in {conversation.name} involving {conversation.participants.join(', ')}.
                  Identified {decisions.length} ratified decisions, {tasks.length} task commitments, and {mentions.length} direct mentions of you.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#111923] border border-[#1b2837] rounded-lg">
                  <span className="text-[11px] text-[#708499]">Total Messages</span>
                  <div className="text-lg font-bold text-white">{conversation.messages.length}</div>
                </div>
                <div className="p-3 bg-[#111923] border border-[#1b2837] rounded-lg">
                  <span className="text-[11px] text-[#708499]">Decisions Ratified</span>
                  <div className="text-lg font-bold text-[#ffb020]">{decisions.length}</div>
                </div>
                <div className="p-3 bg-[#111923] border border-[#1b2837] rounded-lg">
                  <span className="text-[11px] text-[#708499]">Tasks Identified</span>
                  <div className="text-lg font-bold text-[#25d366]">{tasks.length}</div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Decisions Tab */}
          {activeTab === 'decisions' && (
            <div className="space-y-2.5">
              {decisions.length === 0 ? (
                <div className="p-6 text-center text-[#708499]">
                  No formal decisions ratified in this channel.
                </div>
              ) : (
                decisions.map((d) => (
                  <div
                    key={d.messageId}
                    className="p-3.5 bg-[#14202e] border border-[#203247] rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#ffb020]">
                      <span className="font-bold">Ratified by {d.senderName}</span>
                      <span className="font-mono text-[#708499]">{d.timestamp}</span>
                    </div>
                    <p className="text-white text-xs leading-relaxed font-medium">
                      "{d.messageText}"
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 3. My Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-2.5">
              {tasks.length === 0 ? (
                <div className="p-6 text-center text-[#708499]">
                  No action items found in this channel.
                </div>
              ) : (
                tasks.map((t) => (
                  <div
                    key={t.messageId}
                    className="p-3.5 bg-[#14202e] border border-[#203247] rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#50b2ff]">
                      <span className="font-bold">{t.senderName}</span>
                      <span className="font-mono text-[#708499]">{t.timestamp}</span>
                    </div>
                    <p className="text-white text-xs leading-relaxed">
                      "{t.messageText}"
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 4. Mentions Tab */}
          {activeTab === 'mentions' && (
            <div className="space-y-2.5">
              {mentions.length === 0 ? (
                <div className="p-6 text-center text-[#708499]">
                  No direct mentions of you in this channel.
                </div>
              ) : (
                mentions.map((m) => (
                  <div
                    key={m.messageId}
                    className="p-3.5 bg-[#14202e] border border-[#2481cc]/40 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#50b2ff]">
                        {m.senderName} referenced you
                      </span>
                      <span className="font-mono text-[#708499]">{m.timestamp}</span>
                    </div>
                    <p className="text-white text-xs leading-relaxed italic bg-[#0c131a] p-2.5 rounded border border-[#1b2837]">
                      "{m.messageText}"
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 5. People Tab (People Who Chatted) */}
          {activeTab === 'people' && (
            <div className="space-y-3">
              <div className="text-xs text-[#708499]">
                Sorted by message activity. Shows individual participant contributions and leadership status:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {people.map((person) => (
                  <div
                    key={person.name}
                    className="p-3.5 bg-[#14202e] border border-[#203247] rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{person.name}</span>
                        {person.vipRole && (
                          <span className="text-[10px] text-[#ffb020] bg-[#ffb020]/10 px-1.5 py-0.2 rounded font-medium">
                            {person.vipRole}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] bg-[#0c141d] text-[#9ab0c5] px-2 py-0.5 rounded font-mono">
                        {person.messageCount} msgs
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-[#9ab0c5]">
                      {person.mentionedUser && (
                        <div className="text-[#50b2ff] font-medium flex items-center gap-1">
                          <AtSign className="w-3 h-3" />
                          <span>Mentioned you directly in chat</span>
                        </div>
                      )}

                      {person.decisionsOrTasksContributed.length > 0 && (
                        <div className="text-[#25d366]">
                          Contributed to {person.decisionsOrTasksContributed.length} decisions/tasks
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Original Messages Tab */}
          {activeTab === 'messages' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#708499] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={messageSearch}
                  onChange={(e) => setMessageSearch(e.target.value)}
                  placeholder="Filter messages in this channel..."
                  className="w-full bg-[#111923] border border-[#1b2837] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-[#55697d] focus:outline-none focus:border-[#2481cc]"
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {filteredMessages.map((msg) => (
                  <div
                    key={msg.messageId}
                    className="p-3 bg-[#111923] border border-[#182535] rounded-xl space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-white">{msg.senderName}</span>
                      <span className="font-mono text-[#708499]">{msg.timestamp}</span>
                    </div>
                    <p className="text-[#c8d8e8] text-xs leading-relaxed font-sans">
                      {msg.messageText}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#1c2c3e] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-[#1a2839] hover:bg-[#22354a] text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
