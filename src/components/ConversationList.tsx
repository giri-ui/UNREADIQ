import React, { useState } from 'react';
import { Conversation, CollegeGroupType, InboxFilter } from '../types';
import { SourceBadge } from './SourceBadge';
import {
  ArrowRightLeft,
  ChevronRight,
  Clock,
  Shield,
  Users,
  User,
  GraduationCap,
  MessageCircle,
  Building2,
  Heart,
  Inbox,
  Filter,
} from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  currentCategory: InboxFilter;
  onSelectConversation: (conv: Conversation) => void;
  onMoveCategory: (convId: string) => void;
  onChangeCollegeGroupType?: (convId: string, newType: CollegeGroupType) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentCategory,
  onSelectConversation,
  onMoveCategory,
  onChangeCollegeGroupType,
}) => {
  const [collegeGroupFilter, setCollegeGroupFilter] = useState<'all' | CollegeGroupType>('all');

  // Filter conversations
  const displayedConversations = conversations.filter((c) => {
    if (currentCategory === 'college' && collegeGroupFilter !== 'all') {
      return (c.collegeGroupType || 'official') === collegeGroupFilter;
    }
    return true;
  });

  // Category counts for college view
  const officialConvs = conversations.filter((c) => (c.collegeGroupType || 'official') === 'official');
  const unofficialConvs = conversations.filter((c) => c.collegeGroupType === 'unofficial');
  const privateConvs = conversations.filter((c) => c.collegeGroupType === 'private');

  const renderConversationCard = (conv: Conversation) => {
    // Latest meaningful message (not system and not lone small talk)
    const meaningfulMsgs = conv.messages.filter((m) => !m.isSystemMessage && !m.isSmallTalk);
    const latestMsg = meaningfulMsgs.length > 0 ? meaningfulMsgs[meaningfulMsgs.length - 1] : conv.messages[conv.messages.length - 1];

    const groupTypeBadge =
      conv.collegeGroupType === 'private'
        ? { text: 'Private 1-on-1 DM', color: 'bg-[#25d366]/15 text-[#25d366] border-[#25d366]/30', icon: <User className="w-3 h-3 text-[#25d366]" /> }
        : conv.collegeGroupType === 'unofficial'
        ? { text: 'Student-Led Group', color: 'bg-[#50b2ff]/15 text-[#50b2ff] border-[#50b2ff]/30', icon: <Users className="w-3 h-3 text-[#50b2ff]" /> }
        : { text: 'Official College Group', color: 'bg-[#ffb020]/15 text-[#ffb020] border-[#ffb020]/30', icon: <Shield className="w-3 h-3 text-[#ffb020]" /> };

    return (
      <div
        key={conv.id}
        className="p-3.5 sm:p-4 bg-[#14202e] border border-[#1e2f42] hover:border-[#2481cc]/60 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-sm"
      >
        {/* Conversation clickable content */}
        <div
          className="flex items-start sm:items-center gap-3 cursor-pointer flex-1 min-w-0"
          onClick={() => onSelectConversation(conv)}
        >
          <div className="w-10 h-10 rounded-xl bg-[#0e1622] border border-[#1e2f42] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 shadow-inner">
            {conv.category === 'personal' ? (
              <Heart className="w-4 h-4 text-[#e1306c]" />
            ) : conv.collegeGroupType === 'official' ? (
              <Building2 className="w-4 h-4 text-[#ffb020]" />
            ) : conv.collegeGroupType === 'private' ? (
              <MessageCircle className="w-4 h-4 text-[#25d366]" />
            ) : (
              <Users className="w-4 h-4 text-[#50b2ff]" />
            )}
          </div>

          <div className="min-w-0 space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#50b2ff] transition-colors truncate">
                {conv.name}
              </h3>

              {/* Requirement 2: Show the Source App for Every Message / Conversation */}
              <SourceBadge sourceApp={conv.sourceApp} showPrefix={true} />

              {/* College Group Type Badge (A, B, C) */}
              {conv.category === 'college' && (
                <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium flex items-center gap-1 ${groupTypeBadge.color}`}>
                  {groupTypeBadge.icon}
                  <span>{groupTypeBadge.text}</span>
                </span>
              )}

              {/* Unread badge */}
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-[#2481cc]/15 text-[#50b2ff] border border-[#2481cc]/30">
                {conv.unreadCount} unread
              </span>
            </div>

            {/* Latest meaningful message preview */}
            {latestMsg && (
              <p className="text-xs text-[#b8cbdc] truncate font-sans">
                <span className="text-white font-semibold">{latestMsg.senderName}:</span>{' '}
                <span className="italic text-[#d0dfed]">“{latestMsg.messageText}”</span>
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-[#708499]">
              <span>{conv.participants.length} participants</span>
              <span aria-hidden="true" className="text-[#30445a]">·</span>
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-[#50b2ff]" />
                <span>{conv.latestActivity}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1c2c3e]">
          {conv.category === 'college' && onChangeCollegeGroupType && (
            <select
              value={conv.collegeGroupType || 'official'}
              onChange={(e) => onChangeCollegeGroupType(conv.id, e.target.value as CollegeGroupType)}
              className="bg-[#0e1722] border border-[#1d2d3e] text-[11px] text-[#9ab0c5] hover:text-white rounded-lg px-2 py-1 focus:outline-none focus:border-[#2481cc] cursor-pointer"
              title="Change College Group Classification"
            >
              <option value="official">A. Official Group</option>
              <option value="unofficial">B. Student-Led</option>
              <option value="private">C. Private DM</option>
            </select>
          )}

          <button
            onClick={() => onMoveCategory(conv.id)}
            className="px-2.5 py-1 text-[11px] font-medium text-[#9ab0c5] hover:text-white bg-[#0e1722] hover:bg-[#182637] border border-[#1d2d3e] rounded-lg transition-colors flex items-center gap-1"
            title={`Move to ${conv.category === 'college' ? 'Family & Personal' : 'College & Academics'}`}
          >
            <ArrowRightLeft className="w-3 h-3 text-[#50b2ff]" />
            <span>
              {conv.category === 'college' ? 'To Personal' : 'To College'}
            </span>
          </button>

          <button
            onClick={() => onSelectConversation(conv)}
            className="px-3 py-1 text-xs font-semibold text-white bg-[#1b2b3c] hover:bg-[#2481cc] rounded-lg transition-colors flex items-center gap-1"
          >
            <span>Open Detail</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <section aria-labelledby="inbox-channels-heading" className="w-full bg-[#111923] border border-[#1c2a38] rounded-2xl p-5 sm:p-6 space-y-5 shadow-lg">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1c2a38]">
        <div>
          <h2 id="inbox-channels-heading" className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>
              {currentCategory === 'college'
                ? 'Professional / College Inbox'
                : currentCategory === 'personal'
                ? 'Family & Personal Inbox'
                : 'All Conversations Inbox'}
            </span>
            <span className="text-xs text-[#708499] font-normal font-mono">
              ({displayedConversations.length})
            </span>
          </h2>
          <p className="text-xs text-[#708499]">
            {currentCategory === 'college'
              ? 'Organized group-wise: Official Groups, Student-Led Groups, and Private DMs. Zero personal messages.'
              : currentCategory === 'personal'
              ? 'Family check-ins, hostel life, and non-academic personal chats. Zero college circulars.'
              : 'Every connected channel across WhatsApp, Telegram, Gmail, Teams, and Instagram.'}
          </p>
        </div>

        {/* Group-Wise Filter Tabs for College View */}
        {currentCategory === 'college' && (
          <div className="flex items-center gap-1 bg-[#0c141d] p-1 rounded-lg border border-[#1b2837] overflow-x-auto scrollbar-none">
            <button
              onClick={() => setCollegeGroupFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                collegeGroupFilter === 'all'
                  ? 'bg-[#2481cc] text-white shadow-sm'
                  : 'text-[#9ab0c5] hover:text-white'
              }`}
            >
              All College ({conversations.length})
            </button>

            <button
              onClick={() => setCollegeGroupFilter('official')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                collegeGroupFilter === 'official'
                  ? 'bg-[#1c2c3e] text-white border border-[#2b415a]'
                  : 'text-[#9ab0c5] hover:text-white'
              }`}
            >
              <Shield className="w-3 h-3 text-[#ffb020]" />
              <span>A. Official ({officialConvs.length})</span>
            </button>

            <button
              onClick={() => setCollegeGroupFilter('unofficial')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                collegeGroupFilter === 'unofficial'
                  ? 'bg-[#1c2c3e] text-white border border-[#2b415a]'
                  : 'text-[#9ab0c5] hover:text-white'
              }`}
            >
              <Users className="w-3 h-3 text-[#50b2ff]" />
              <span>B. Student-Led ({unofficialConvs.length})</span>
            </button>

            <button
              onClick={() => setCollegeGroupFilter('private')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                collegeGroupFilter === 'private'
                  ? 'bg-[#1c2c3e] text-white border border-[#2b415a]'
                  : 'text-[#9ab0c5] hover:text-white'
              }`}
            >
              <User className="w-3 h-3 text-[#25d366]" />
              <span>C. Private DMs ({privateConvs.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* College View: Group-Wise Organized Layout */}
      {currentCategory === 'college' && collegeGroupFilter === 'all' ? (
        <div className="space-y-6">
          {/* Section A: Official College Groups */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-[#182635]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#ffb020]/20 border border-[#ffb020]/40 flex items-center justify-center text-[#ffb020]">
                  <Shield className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span>A. Official College Groups</span>
                    <span className="text-[10px] text-[#ffb020] bg-[#ffb020]/10 px-2 py-0.2 rounded-full font-mono">
                      {officialConvs.length} Channels
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#708499]">
                    Groups with Teachers, HOD, Principal, Proctors, and Official Circulars
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {officialConvs.map((conv) => renderConversationCard(conv))}
              {officialConvs.length === 0 && (
                <div className="p-4 bg-[#0c141e] border border-[#182434] rounded-xl text-center text-xs text-[#55697d]">
                  No official college groups.
                </div>
              )}
            </div>
          </div>

          {/* Section B: Unofficial / Student-Led Groups */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-[#182635]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#2481cc]/20 border border-[#2481cc]/40 flex items-center justify-center text-[#50b2ff]">
                  <Users className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span>B. Unofficial / Student-Led Groups</span>
                    <span className="text-[10px] text-[#50b2ff] bg-[#2481cc]/10 px-2 py-0.2 rounded-full font-mono">
                      {unofficialConvs.length} Channels
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#708499]">
                    Student circles: Hackathons, Mini-Project Teams, and Cultural Fest Committees
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {unofficialConvs.map((conv) => renderConversationCard(conv))}
              {unofficialConvs.length === 0 && (
                <div className="p-4 bg-[#0c141e] border border-[#182434] rounded-xl text-center text-xs text-[#55697d]">
                  No student-led groups.
                </div>
              )}
            </div>
          </div>

          {/* Section C: Private 1-on-1 Messages (DMs) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-[#182635]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#25d366]/20 border border-[#25d366]/40 flex items-center justify-center text-[#25d366]">
                  <User className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span>C. Private 1-on-1 Academic Messages (DMs)</span>
                    <span className="text-[10px] text-[#25d366] bg-[#25d366]/10 px-2 py-0.2 rounded-full font-mono">
                      {privateConvs.length} Channels
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#708499]">
                    Direct academic messages with Proctor, Teachers, and Class Representatives
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {privateConvs.map((conv) => renderConversationCard(conv))}
              {privateConvs.length === 0 && (
                <div className="p-4 bg-[#0c141e] border border-[#182434] rounded-xl text-center text-xs text-[#55697d]">
                  No private 1-on-1 messages.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Regular list when filtered or for All / Personal views */
        <div className="space-y-2.5">
          {displayedConversations.map((conv) => renderConversationCard(conv))}

          {displayedConversations.length === 0 && (
            <div className="p-8 bg-[#0c141e] border border-[#182434] rounded-xl text-center text-xs text-[#55697d]">
              No conversations found for the selected view.
            </div>
          )}
        </div>
      )}
    </section>
  );
};
