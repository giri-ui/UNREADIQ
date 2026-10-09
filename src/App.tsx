/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { TelegramHeader } from './components/TelegramHeader';
import { InboxNavigation } from './components/InboxNavigation';
import { AppSourcesBar } from './components/AppSourcesBar';
import { MorningBanner } from './components/MorningBanner';
import { PlanUpdatesSection } from './components/PlanUpdatesSection';
import { TopAttentionCard } from './components/TopAttentionCard';
import { RemindersSection } from './components/RemindersSection';
import { PriorityBriefing } from './components/PriorityBriefing';
import { MentionsSection } from './components/MentionsSection';
import { VipSection } from './components/VipSection';
import { ConversationList } from './components/ConversationList';
import { ConversationDetailModal } from './components/ConversationDetailModal';
import { ProfileModal } from './components/ProfileModal';
import { ImportModal } from './components/ImportModal';
import { PrivacyModal } from './components/PrivacyModal';
import { DEFAULT_USER_PROFILE, INITIAL_CONVERSATIONS } from './data/overnightInbox';
import { generateCatchUpBriefing } from './utils/intelligence';
import { alarmService } from './utils/alarm';
import {
  Conversation,
  InboxFilter,
  SourceApp,
  UserProfile,
  BriefingItem,
  SmartReminder,
  CollegeGroupType,
} from './types';
import { Sparkles, Send, Heart, BellRing, Briefcase, Inbox, ShieldCheck } from 'lucide-react';

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [inboxCategory, setInboxCategory] = useState<InboxFilter>('all');
  const [selectedAppFilter, setSelectedAppFilter] = useState<SourceApp | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [handledItemIds, setHandledItemIds] = useState<Set<string>>(new Set());

  // Smart Reminders state
  const [customReminders, setCustomReminders] = useState<SmartReminder[]>([]);
  const [disabledAlarmIds, setDisabledAlarmIds] = useState<Set<string>>(new Set());
  const [completedReminderIds, setCompletedReminderIds] = useState<Set<string>>(new Set());
  const [deletedReminderIds, setDeletedReminderIds] = useState<Set<string>>(new Set());

  // Modals state
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Filter conversations by category and source app
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      // In college or personal view, strictly filter by category
      if (inboxCategory === 'college' && c.category !== 'college') return false;
      if (inboxCategory === 'personal' && c.category !== 'personal') return false;
      // In app filter, check source app
      if (selectedAppFilter !== 'all' && c.sourceApp !== selectedAppFilter) return false;
      // In search, query conversation name and message text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchMsgs = c.messages.some((m) =>
          m.messageText.toLowerCase().includes(q) || m.senderName.toLowerCase().includes(q)
        );
        if (!matchName && !matchMsgs) return false;
      }
      return true;
    });
  }, [conversations, inboxCategory, selectedAppFilter, searchQuery]);

  // Compute overnight briefing
  const briefing = useMemo(() => {
    const rawBriefing = generateCatchUpBriefing(filteredConversations, userProfile);

    // Apply handled status
    const updateHandled = (items: BriefingItem[]) =>
      items.map((i) => ({
        ...i,
        actionCompleted: handledItemIds.has(i.id),
      }));

    return {
      ...rawBriefing,
      top3AttentionItems: updateHandled(rawBriefing.top3AttentionItems),
      p0Items: updateHandled(rawBriefing.p0Items),
      p1Items: updateHandled(rawBriefing.p1Items),
      p2Items: updateHandled(rawBriefing.p2Items),
      p3Items: updateHandled(rawBriefing.p3Items),
    };
  }, [filteredConversations, userProfile, handledItemIds]);

  // Combine extracted reminders + custom reminders, applying overrides
  const combinedReminders = useMemo(() => {
    const all = [...briefing.smartReminders, ...customReminders];
    return all
      .filter((r) => !deletedReminderIds.has(r.id))
      .map((r) => ({
        ...r,
        alarmEnabled: !disabledAlarmIds.has(r.id),
        completed: completedReminderIds.has(r.id),
      }));
  }, [briefing.smartReminders, customReminders, disabledAlarmIds, completedReminderIds, deletedReminderIds]);

  // Periodic alarm watcher: triggers alarm when meeting or 15m advance time is reached
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      combinedReminders.forEach((rem) => {
        if (rem.alarmEnabled && !rem.completed) {
          const advanceTime = rem.targetTimestamp - rem.alarmOffsetMinutes * 60 * 1000;
          if (now >= advanceTime && now <= advanceTime + 60000 && !rem.alarmTriggered) {
            alarmService.showNotification(
              `🔔 College Reminder: ${rem.title}`,
              `Meeting in ${rem.alarmOffsetMinutes} mins (${rem.location ? rem.location : 'Campus'}). Source: ${rem.sourceConversation}`
            );
            rem.alarmTriggered = true;
          }
        }
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [combinedReminders]);

  // Counts for tabs (Requirement 1: Separate Inbox Pages)
  const categoryCounts = useMemo(() => {
    const all = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
    const college = conversations
      .filter((c) => c.category === 'college')
      .reduce((acc, c) => acc + c.unreadCount, 0);
    const personal = conversations
      .filter((c) => c.category === 'personal')
      .reduce((acc, c) => acc + c.unreadCount, 0);
    const reminders = combinedReminders.filter((r) => !r.completed).length;
    return { all, college, personal, reminders };
  }, [conversations, combinedReminders]);

  // Counts per app
  const appCounts = useMemo(() => {
    const counts: Record<SourceApp, number> = {
      slack: 0,
      telegram: 0,
      email: 0,
      whatsapp: 0,
      teams: 0,
      instagram: 0,
      other: 0,
    };
    conversations.forEach((c) => {
      counts[c.sourceApp] = (counts[c.sourceApp] || 0) + c.unreadCount;
    });
    return counts;
  }, [conversations]);

  // Refresh catch-up
  const handleRefreshCatchUp = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      showToast('College inbox refreshed! ' + briefing.analyzedMessagesCount + ' messages analyzed.');
    }, 200);
  };

  // Toggle Handled / Completed
  const handleToggleHandled = (id: string) => {
    setHandledItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle Alarm for Reminder
  const handleToggleAlarm = (id: string) => {
    setDisabledAlarmIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast('Alarm scheduled (15 mins advance alert enabled)');
      } else {
        next.add(id);
        showToast('Alarm turned off');
      }
      return next;
    });
  };

  // Toggle Reminder completion
  const handleToggleReminderComplete = (id: string) => {
    setCompletedReminderIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        showToast('Reminder marked complete!');
      }
      return next;
    });
  };

  // Delete Reminder
  const handleDeleteReminder = (id: string) => {
    setDeletedReminderIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    showToast('Reminder deleted');
  };

  // Move conversation category
  const handleMoveCategory = (convId: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              category: c.category === 'college' ? 'personal' : 'college',
            }
          : c
      )
    );
    showToast('Conversation moved to ' + (conversations.find((c) => c.id === convId)?.category === 'college' ? 'Family & Personal' : 'Professional / College'));
  };

  // Change College Group Classification (Official / Student / Private DM)
  const handleChangeCollegeGroupType = (convId: string, newType: CollegeGroupType) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId ? { ...c, collegeGroupType: newType } : c
      )
    );
    showToast(`Updated classification to ${newType === 'official' ? 'Official Group' : newType === 'unofficial' ? 'Student Group' : 'Private DM'}`);
  };

  // Import conversation
  const handleImportConversation = (newConv: Conversation) => {
    setConversations((prev) => [newConv, ...prev]);
    showToast(`Imported "${newConv.name}" into your inbox!`);
  };

  // Purge data
  const handlePurge = () => {
    setConversations([]);
    setHandledItemIds(new Set());
    setCustomReminders([]);
    setDeletedReminderIds(new Set());
    setSearchQuery('');
    showToast('Session memory purged. Zero data retained on device.');
  };

  // Open conversation modal by ID
  const handleOpenConversationById = (convId: string) => {
    const found = conversations.find((c) => c.id === convId);
    if (found) {
      setSelectedConversation(found);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1118] text-white flex flex-col font-sans selection:bg-[#2481cc]/30 selection:text-[#50b2ff]">
      {/* 1. Header */}
      <TelegramHeader
        userProfile={userProfile}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onPurge={handlePurge}
      />

      {/* 2. Navigation Tabs (Requirement 1: All, Professional/College, Family & Personal, My Reminders) */}
      <InboxNavigation
        currentCategory={inboxCategory}
        onSelectCategory={setInboxCategory}
        counts={categoryCounts}
      />

      {/* 3. Main Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div
            role="status"
            className="fixed bottom-5 right-5 z-50 bg-[#162738]/95 border border-[#2481cc]/50 text-[#50b2ff] text-xs px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in"
          >
            <div className="w-2 h-2 rounded-full bg-[#2481cc] animate-ping" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Multi-App Sources Bar (WhatsApp, Telegram, Gmail, Teams, Instagram, Slack) */}
        <AppSourcesBar
          selectedApp={selectedAppFilter}
          onSelectApp={setSelectedAppFilter}
          appCounts={appCounts}
          onOpenImport={() => setIsImportOpen(true)}
        />

        {conversations.length === 0 ? (
          <div className="p-12 bg-[#111923] border border-[#1c2a38] rounded-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#2481cc]/15 border border-[#2481cc]/30 flex items-center justify-center text-[#2481cc] mx-auto">
              <Send className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Your College Inbox is Empty</h2>
              <p className="text-xs text-[#708499] max-w-md mx-auto">
                No active conversations stored. Import a WhatsApp chat export (.zip or .txt) or reload the college demo dataset.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setConversations(INITIAL_CONVERSATIONS)}
                className="px-4 py-2 text-xs font-semibold bg-[#2481cc] hover:bg-[#2ea6ff] text-white rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Reload College Dataset (Classes, Fest, Labs)</span>
              </button>
              <button
                onClick={() => setIsImportOpen(true)}
                className="px-4 py-2 text-xs font-semibold bg-[#182535] hover:bg-[#203248] text-[#50b2ff] border border-[#2481cc]/30 rounded-xl transition-colors"
              >
                <span>Import Chat (.ZIP / .TXT)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* VIEW A: ALL INBOX VIEW */}
            {inboxCategory === 'all' && (
              <>
                {/* Morning Overnight Catch-Up Banner */}
                <MorningBanner
                  briefing={briefing}
                  onRefreshCatchUp={handleRefreshCatchUp}
                  isProcessing={isProcessing}
                />

                {/* Changed Plans & Rescheduled Events Alert */}
                {briefing.planUpdates.length > 0 && (
                  <PlanUpdatesSection planUpdates={briefing.planUpdates} />
                )}

                {/* Smart College Reminders & Alarms Section */}
                <RemindersSection
                  reminders={combinedReminders}
                  onToggleAlarm={handleToggleAlarm}
                  onToggleComplete={handleToggleReminderComplete}
                  onDeleteReminder={handleDeleteReminder}
                  onAddCustomReminder={(rem) => setCustomReminders([...customReminders, rem])}
                />

                {/* Top 3 Items Needing Attention */}
                <TopAttentionCard
                  items={briefing.top3AttentionItems}
                  onToggleHandled={handleToggleHandled}
                  onOpenConversation={handleOpenConversationById}
                />

                {/* Priority-Ranked Morning Briefing (P0 Urgent -> P3 FYI) */}
                <PriorityBriefing
                  p0Items={briefing.p0Items}
                  p1Items={briefing.p1Items}
                  p2Items={briefing.p2Items}
                  p3Items={briefing.p3Items}
                  onToggleComplete={handleToggleHandled}
                  onOpenConversation={handleOpenConversationById}
                />

                {/* Personal Mentions & Accountability Tracking */}
                <MentionsSection
                  mentions={briefing.myMentions}
                  onOpenConversation={handleOpenConversationById}
                />

                {/* Important People & Leadership Tracking */}
                <VipSection vipActivities={briefing.vipActivities} />

                {/* Active Channels List (All channels with SourceApp displayed) */}
                <ConversationList
                  conversations={filteredConversations}
                  currentCategory="all"
                  onSelectConversation={setSelectedConversation}
                  onMoveCategory={handleMoveCategory}
                  onChangeCollegeGroupType={handleChangeCollegeGroupType}
                />
              </>
            )}

            {/* VIEW B: PROFESSIONAL / COLLEGE VIEW */}
            {inboxCategory === 'college' && (
              <>
                {/* College Section Header Banner */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-[#111c29] to-[#0d1622] border border-[#2481cc]/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#2481cc]/20 border border-[#2481cc]/40 flex items-center justify-center text-[#50b2ff]">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <span>Professional / College Inbox</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2481cc]/20 text-[#50b2ff] border border-[#2481cc]/40 font-mono">
                          {filteredConversations.length} Academic Channels
                        </span>
                      </h2>
                      <p className="text-xs text-[#9ab0c5]">
                        Exclusively college conversations organized group-wise: Official Groups, Student-Led Groups, and Private DMs.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-[#25d366] bg-[#25d366]/10 border border-[#25d366]/30 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Family & Personal Filtered Out</span>
                    </span>
                  </div>
                </div>

                {/* Changed Plans & Rescheduled Events Alert */}
                {briefing.planUpdates.length > 0 && (
                  <PlanUpdatesSection planUpdates={briefing.planUpdates} />
                )}

                {/* College Smart Reminders */}
                <RemindersSection
                  reminders={combinedReminders}
                  onToggleAlarm={handleToggleAlarm}
                  onToggleComplete={handleToggleReminderComplete}
                  onDeleteReminder={handleDeleteReminder}
                  onAddCustomReminder={(rem) => setCustomReminders([...customReminders, rem])}
                />

                {/* Top College Attention Items */}
                <TopAttentionCard
                  items={briefing.top3AttentionItems}
                  onToggleHandled={handleToggleHandled}
                  onOpenConversation={handleOpenConversationById}
                />

                {/* Priority Briefing for College */}
                <PriorityBriefing
                  p0Items={briefing.p0Items}
                  p1Items={briefing.p1Items}
                  p2Items={briefing.p2Items}
                  p3Items={briefing.p3Items}
                  onToggleComplete={handleToggleHandled}
                  onOpenConversation={handleOpenConversationById}
                />

                {/* College Mentions */}
                <MentionsSection
                  mentions={briefing.myMentions}
                  onOpenConversation={handleOpenConversationById}
                />

                {/* College Leadership Tracking (Principal, Proctor, HOD, Priya Ma'am, CR Rahul) */}
                <VipSection vipActivities={briefing.vipActivities} />

                {/* Requirement 3: Group-Wise Organized College Conversations */}
                <ConversationList
                  conversations={filteredConversations}
                  currentCategory="college"
                  onSelectConversation={setSelectedConversation}
                  onMoveCategory={handleMoveCategory}
                  onChangeCollegeGroupType={handleChangeCollegeGroupType}
                />
              </>
            )}

            {/* VIEW C: FAMILY & PERSONAL VIEW */}
            {inboxCategory === 'personal' && (
              <>
                {/* Family & Personal Header Banner */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1a121f] to-[#120f18] border border-[#e1306c]/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#e1306c]/20 border border-[#e1306c]/40 flex items-center justify-center text-[#ff6ea7]">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <span>Family & Personal Inbox</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e1306c]/20 text-[#ff6ea7] border border-[#e1306c]/40 font-mono">
                          {filteredConversations.length} Personal Channels
                        </span>
                      </h2>
                      <p className="text-xs text-[#d6b8c9]">
                        Family check-ins, hostel discussions, and personal messages. Zero college administrative circulars.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-[#50b2ff] bg-[#2481cc]/10 border border-[#2481cc]/30 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>College Messages Filtered Out</span>
                    </span>
                  </div>
                </div>

                {/* Personal Highlights / Tasks */}
                <div className="p-4 bg-[#141b24] border border-[#223042] rounded-xl space-y-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-[#ff6ea7]" />
                    <span>Personal Reminders & Check-Ins</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#b8cbdc]">
                    <div className="p-3 bg-[#0d141e] border border-[#1b2b3d] rounded-lg">
                      <div className="font-semibold text-white">Call home in evening</div>
                      <p className="text-[11px] text-[#708499] mt-0.5">Amma asked to call after classes finish.</p>
                    </div>
                    <div className="p-3 bg-[#0d141e] border border-[#1b2b3d] rounded-lg">
                      <div className="font-semibold text-white">Semester fee receipt</div>
                      <p className="text-[11px] text-[#708499] mt-0.5">Appa asked to collect receipt from bank counter.</p>
                    </div>
                  </div>
                </div>

                {/* Only Family & Personal Conversations */}
                <ConversationList
                  conversations={filteredConversations}
                  currentCategory="personal"
                  onSelectConversation={setSelectedConversation}
                  onMoveCategory={handleMoveCategory}
                  onChangeCollegeGroupType={handleChangeCollegeGroupType}
                />
              </>
            )}

            {/* VIEW D: MY REMINDERS & ALARMS VIEW */}
            {inboxCategory === 'reminders' && (
              <>
                <div className="p-4 sm:p-5 bg-gradient-to-r from-[#191d12] to-[#121810] border border-[#25d366]/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#25d366]/20 border border-[#25d366]/40 flex items-center justify-center text-[#25d366]">
                      <BellRing className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <span>My College Reminders & Scheduled Alarms</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#25d366]/20 text-[#25d366] border border-[#25d366]/40 font-mono">
                          {combinedReminders.filter((r) => !r.completed).length} Pending
                        </span>
                      </h2>
                      <p className="text-xs text-[#a3c9b1]">
                        Every extracted faculty appointment, class time, seminar hall review, and lab deadline.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Plan Updates Alert if plans changed */}
                {briefing.planUpdates.length > 0 && (
                  <PlanUpdatesSection planUpdates={briefing.planUpdates} />
                )}

                {/* Full Reminders Section with Alarms, Audio Chimes, and Custom Reminder Maker */}
                <RemindersSection
                  reminders={combinedReminders}
                  onToggleAlarm={handleToggleAlarm}
                  onToggleComplete={handleToggleReminderComplete}
                  onDeleteReminder={handleDeleteReminder}
                  onAddCustomReminder={(rem) => setCustomReminders([...customReminders, rem])}
                />
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#141f2b] py-6 text-center text-xs text-[#708499]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong className="text-white">UnreadIQ</strong> · College Communication Intelligence · Wake up. Know what happened. Know what matters.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="text-[#50b2ff] hover:underline"
            >
              100% In-Browser Privacy
            </button>
            <span aria-hidden="true">·</span>
            <span>Zero Remote Storage</span>
          </div>
        </div>
      </footer>

      {/* Conversation Detail Modal */}
      <ConversationDetailModal
        conversation={selectedConversation}
        onClose={() => setSelectedConversation(null)}
        userProfile={userProfile}
      />

      {/* User Profile & VIP Settings Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userProfile={userProfile}
        onSaveProfile={(updated) => {
          setUserProfile(updated);
          showToast('Profile updated! Re-evaluating mentions & VIPs...');
        }}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportConversation={handleImportConversation}
      />

      {/* Privacy Guarantee Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        onPurge={handlePurge}
      />
    </div>
  );
}
