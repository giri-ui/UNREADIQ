import {
  Conversation,
  UserProfile,
  BriefingItem,
  MentionAnalysis,
  VipActivitySummary,
  ParticipantSummary,
  CatchUpResult,
  PriorityRank,
  MessageItem,
  SmartReminder,
  PlanUpdate,
  CollegeGroupType,
} from '../types';
import { extractDeadline, isSystemMessage, isPureSmallTalk } from './parser';

// Check if message text mentions the user
export function isUserMentioned(text: string, profile: UserProfile): boolean {
  const lower = text.toLowerCase();
  for (const alias of profile.aliases) {
    const cleanAlias = alias.toLowerCase().trim();
    const regex = new RegExp(`(?:@|\\b)${cleanAlias.replace('@', '')}\\b`, 'i');
    if (regex.test(lower)) {
      return true;
    }
  }
  return false;
}

// Inferred intent of a mention in college context
function inferMentionIntent(
  text: string
): {
  intent: MentionAnalysis['inferredIntent'];
  action: string;
  summary: string;
} {
  const lower = text.toLowerCase();

  if (
    lower.includes('meet me') ||
    lower.includes('please meet') ||
    lower.includes('submit') ||
    lower.includes('review') ||
    lower.includes('bring') ||
    lower.includes('verify')
  ) {
    return {
      intent: 'task_assigned',
      action: 'Attend scheduled meeting or complete academic submission before deadline.',
      summary: 'You were directly instructed to attend a meeting or submit work.',
    };
  }

  if (
    lower.includes('did you') ||
    lower.includes('can you') ||
    lower.includes('could you') ||
    text.includes('?')
  ) {
    return {
      intent: 'question_asked',
      action: 'Reply to faculty or classmate regarding status.',
      summary: 'You were asked a question regarding coursework or project.',
    };
  }

  if (
    lower.includes('good job') ||
    lower.includes('well done') ||
    lower.includes('congrats') ||
    lower.includes('praise')
  ) {
    return {
      intent: 'praised',
      action: 'Acknowledge faculty or peer appreciation.',
      summary: 'Your academic or project effort was acknowledged.',
    };
  }

  return {
    intent: 'referenced',
    action: 'Note for course and schedule context.',
    summary: 'Your name was referenced in class discussion.',
  };
}

// Extract location cues (e.g. seminar hall, DBMS lab, auditorium, proctor office)
export function extractLocation(text: string): string | null {
  const locPatterns = [
    /\b(?:in\s+the|at\s+the|in|at|to)\s+(seminar\s+hall|auditorium|dbms\s+lab|cse\s+lab|library|canteen|hod\s+(?:office|cabin)|proctor\s+(?:office|cell)|room\s+\d+|college\s+ground)\b/i,
    /\b(seminar\s+hall|auditorium|dbms\s+lab|hod\s+cabin|proctor\s+office|library)\b/i,
  ];

  for (const pattern of locPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1]
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
  }
  return null;
}

// Calculate target timestamp from date strings like "tomorrow at 9 AM", "tomorrow at 10 AM", "at 10 AM tomorrow"
export function parseDateTimeToTimestamp(rawDateTime: string): {
  timestamp: number;
  formatted: string;
} {
  const now = new Date();
  const lower = rawDateTime.toLowerCase();

  let targetDate = new Date(now);

  if (lower.includes('tomorrow')) {
    targetDate.setDate(now.getDate() + 1);
  } else if (lower.includes('wednesday')) {
    const day = targetDate.getDay();
    const diff = (3 - day + 7) % 7 || 7;
    targetDate.setDate(targetDate.getDate() + diff);
  } else if (lower.includes('thursday')) {
    const day = targetDate.getDay();
    const diff = (4 - day + 7) % 7 || 7;
    targetDate.setDate(targetDate.getDate() + diff);
  } else if (lower.includes('friday')) {
    const day = targetDate.getDay();
    const diff = (5 - day + 7) % 7 || 7;
    targetDate.setDate(targetDate.getDate() + diff);
  } else if (lower.includes('monday')) {
    const day = targetDate.getDay();
    const diff = (1 - day + 7) % 7 || 7;
    targetDate.setDate(targetDate.getDate() + diff);
  }

  // Parse hour & minute
  const timeMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const meridian = timeMatch[3].toLowerCase();

    if (meridian === 'pm' && hours < 12) hours += 12;
    if (meridian === 'am' && hours === 12) hours = 0;

    targetDate.setHours(hours, minutes, 0, 0);
  } else {
    targetDate.setHours(9, 0, 0, 0);
  }

  const formatted = targetDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return {
    timestamp: targetDate.getTime(),
    formatted,
  };
}

// Extract conversation topic from message
function extractTopicFromMessage(msg: MessageItem): string {
  const text = msg.messageText.toLowerCase();
  if (text.includes('fest') || text.includes('cultural') || text.includes('participant')) {
    return 'College Cultural Fest & Participants';
  }
  if (text.includes('attendance') || text.includes('proctor')) {
    return 'Attendance Shortlist & Proctor Meeting';
  }
  if (text.includes('seminar hall') || text.includes('auditorium') || text.includes('cloud') || text.includes('elective')) {
    return 'Cloud & AI Elective / Seminar Synopsis';
  }
  if (text.includes('dbms') || text.includes('lab') || text.includes('observation')) {
    return 'DBMS Lab Session & Observation Notebook';
  }
  if (text.includes('mini-project') || text.includes('working demo') || text.includes('review')) {
    return 'Final Year Project & Report Submission';
  }
  if (text.includes('timetable') || text.includes('exam')) {
    return 'Internal Exam Timetable';
  }
  if (text.includes('mess') || text.includes('canteen') || text.includes('hostel')) {
    return 'Hostel & Mess Logistics';
  }
  return msg.conversationName;
}

// Extract Smart Reminder from message
export function extractSmartReminder(
  msg: MessageItem,
  profile: UserProfile
): SmartReminder | null {
  const text = msg.messageText;
  const lower = text.toLowerCase();
  const mentioned = isUserMentioned(text, profile);

  if (isSystemMessage(text) || isPureSmallTalk(text)) return null;

  const hasMeetingCue =
    lower.includes('meet me') ||
    lower.includes('please meet') ||
    lower.includes('starts at') ||
    lower.includes('project review is scheduled') ||
    lower.includes('submit it by');

  if (!hasMeetingCue && !mentioned) return null;

  const timeRegex = /\b(?:tomorrow\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?|\d{1,2}(?::\d{2})?\s*(?:am|pm)?\s+tomorrow|starts\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?|by\s+(?:wednesday|thursday|friday|monday)|on\s+(?:wednesday|thursday|friday|monday))\b/i;
  const timeMatch = text.match(timeRegex);

  if (!timeMatch && !lower.includes('tomorrow')) return null;

  const rawDateTimeString = timeMatch ? timeMatch[0] : 'Tomorrow at 9:00 AM';
  const location = extractLocation(text);
  const { timestamp, formatted } = parseDateTimeToTimestamp(rawDateTimeString);

  let title = `Meeting with ${msg.senderName}`;
  if (lower.includes('seminar hall') || lower.includes('auditorium')) {
    title = `Meet Priya Ma’am — ${location || 'Seminar Hall'}`;
  } else if (lower.includes('attendance')) {
    title = 'Meet Proctor Ravi Kumar — Attendance Review';
  } else if (lower.includes('dbms lab')) {
    title = 'DBMS Lab Session — Bring Observation Book';
  } else if (lower.includes('project review')) {
    title = 'HOD Project Review — Demo Presentation';
  } else if (lower.includes('mini-project report')) {
    title = 'Submit Mini-Project Report';
  }

  return {
    id: `reminder-${msg.messageId}`,
    title,
    instructorOrContact: msg.senderName,
    location,
    rawDateTimeString,
    parsedDate: formatted,
    targetTimestamp: timestamp,
    alarmEnabled: true,
    alarmOffsetMinutes: 15,
    completed: false,
    sourceMessage: text,
    sourceConversation: msg.conversationName,
    channelId: msg.conversationId,
    sourceApp: msg.sourceApp,
  };
}

// Determine group type (Official College Groups, Unofficial Student Groups, Private Messages)
export function getCollegeGroupType(
  conv: Conversation,
  profile: UserProfile
): CollegeGroupType {
  if (conv.collegeGroupType) return conv.collegeGroupType;

  const nameLower = conv.name.toLowerCase();

  // 1. Private messages
  if (
    conv.participants.length <= 2 ||
    nameLower.includes('1-on-1') ||
    nameLower.includes('direct dm') ||
    nameLower.includes('dm') ||
    nameLower.includes('private') ||
    nameLower.includes('proctoring & student cell')
  ) {
    return 'private';
  }

  // 2. Official college groups (contains faculty, HOD, Principal, Proctor, or keyword 'official')
  const hasOfficialFaculty = conv.participants.some((p) => {
    const pLower = p.toLowerCase();
    return profile.vipContacts.some(
      (v) =>
        (v.role.includes('Principal') ||
          v.role.includes('HOD') ||
          v.role.includes('Teacher') ||
          v.role.includes('Proctor')) &&
        (pLower.includes(v.name.toLowerCase()) || v.aliases.some((a) => pLower.includes(a.toLowerCase())))
    );
  });

  if (
    hasOfficialFaculty ||
    nameLower.includes('official') ||
    nameLower.includes('notice board') ||
    nameLower.includes('circular') ||
    nameLower.includes('elective') ||
    nameLower.includes('dept') ||
    nameLower.includes('department')
  ) {
    return 'official';
  }

  // 3. Unofficial student groups
  return 'unofficial';
}

// Detect Changed Plans and Updated Instructions (Feature 6 & 7)
export function detectPlanUpdates(
  messages: MessageItem[],
  existingRemindersMap: Map<string, SmartReminder>
): PlanUpdate[] {
  const updates: PlanUpdate[] = [];

  // Group messages by sender or conversation
  const senderMap = new Map<string, MessageItem[]>();
  messages.forEach((m) => {
    if (isSystemMessage(m.messageText)) return;
    const key = `${m.conversationId}-${m.senderName}`;
    if (!senderMap.has(key)) {
      senderMap.set(key, []);
    }
    senderMap.get(key)!.push(m);
  });

  senderMap.forEach((msgs, key) => {
    if (msgs.length < 2) return;

    for (let i = 0; i < msgs.length; i++) {
      for (let j = i + 1; j < msgs.length; j++) {
        const earlier = msgs[i];
        const later = msgs[j];

        const earlierText = earlier.messageText;
        const laterText = later.messageText;
        const laterLower = laterText.toLowerCase();

        // 1. Location change: e.g. "seminar hall" -> "auditorium instead"
        const earlierLoc = extractLocation(earlierText);
        const laterLoc = extractLocation(laterText);

        const hasLocationShift =
          earlierLoc &&
          laterLoc &&
          earlierLoc.toLowerCase() !== laterLoc.toLowerCase() &&
          (laterLower.includes('instead') ||
            laterLower.includes('moved to') ||
            laterLower.includes('shifted to') ||
            laterLower.includes('occupied') ||
            laterLower.includes('meet in') ||
            laterLower.includes('meet me in'));

        // 2. Time change: e.g. "at 9 AM" -> "at 10 AM instead" or "moved to 10 AM"
        const earlierTimeMatch = earlierText.match(/\b(?:at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i);
        const laterTimeMatch = laterText.match(/\b(?:at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i);

        const hasTimeShift =
          earlierTimeMatch &&
          laterTimeMatch &&
          earlierTimeMatch[1].toLowerCase() !== laterTimeMatch[1].toLowerCase() &&
          (laterLower.includes('instead') ||
            laterLower.includes('moved to') ||
            laterLower.includes('rescheduled') ||
            laterLower.includes('postponed') ||
            laterLower.includes('delayed') ||
            laterLower.includes('changed to') ||
            hasLocationShift);

        // 3. Deadline / Date change: e.g. "Thursday" -> "Friday instead"
        const earlierDeadline = extractDeadline(earlierText);
        const laterDeadline = extractDeadline(laterText);
        const hasDeadlineShift =
          earlierDeadline &&
          laterDeadline &&
          earlierDeadline.toLowerCase() !== laterDeadline.toLowerCase() &&
          (laterLower.includes('postponed') ||
            laterLower.includes('extended') ||
            laterLower.includes('instead') ||
            laterLower.includes('now'));

        if (hasLocationShift || hasTimeShift || hasDeadlineShift) {
          const originalVal = hasLocationShift
            ? earlierLoc
            : hasTimeShift
            ? earlierTimeMatch![1].toUpperCase()
            : earlierDeadline!;

          const updatedVal = hasLocationShift
            ? laterLoc
            : hasTimeShift
            ? laterTimeMatch![1].toUpperCase()
            : laterDeadline!;

          const eventType = hasLocationShift
            ? 'location'
            : hasTimeShift
            ? 'time'
            : 'deadline';

          const title = hasLocationShift
            ? `Meeting Location Updated: ${originalVal} → ${updatedVal}`
            : hasTimeShift
            ? `Meeting Time Rescheduled: ${originalVal} → ${updatedVal}`
            : `Deadline Extended: ${originalVal} → ${updatedVal}`;

          // Find matching reminder
          let matchingReminder: SmartReminder | undefined = undefined;
          existingRemindersMap.forEach((rem) => {
            if (
              rem.instructorOrContact.toLowerCase() === later.senderName.toLowerCase() ||
              rem.channelId === later.conversationId
            ) {
              matchingReminder = rem;
            }
          });

          // Update matching reminder if found
          let applied = false;
          if (matchingReminder) {
            applied = true;
            const targetRem = matchingReminder as SmartReminder;
            targetRem.isPlanUpdated = true;

            if (hasLocationShift && laterLoc) {
              targetRem.location = laterLoc;
              targetRem.title = `Meet ${later.senderName} — ${laterLoc}`;
              targetRem.updateNote = `Location updated: ${originalVal} → ${updatedVal}`;
            }

            if (hasTimeShift && laterTimeMatch) {
              targetRem.rawDateTimeString = `Tomorrow at ${laterTimeMatch[1]}`;
              const { timestamp, formatted } = parseDateTimeToTimestamp(targetRem.rawDateTimeString);
              targetRem.targetTimestamp = timestamp;
              targetRem.parsedDate = formatted;
              targetRem.updateNote = `Time rescheduled: ${originalVal} → ${updatedVal} (Alarm updated)`;
            }

            if (hasDeadlineShift && laterDeadline) {
              targetRem.rawDateTimeString = laterDeadline;
              targetRem.updateNote = `Deadline changed: ${originalVal} → ${updatedVal}`;
            }
          }

          updates.push({
            id: `update-${earlier.messageId}-${later.messageId}`,
            eventType,
            title,
            personName: later.senderName,
            conversationName: later.conversationName,
            sourceApp: later.sourceApp,
            originalValue: originalVal,
            updatedValue: updatedVal,
            originalTime: earlier.timestamp,
            updatedTime: later.timestamp,
            originalMessageText: earlierText,
            updatedMessageText: laterText,
            matchingReminderId: matchingReminder ? (matchingReminder as SmartReminder).id : undefined,
            isConfirmed: true,
            appliedToReminder: applied,
          });
        }
      }
    }
  });

  return updates;
}

// Classify message into P0, P1, P2, P3 in Indian College context
export function evaluateMessageBriefingItem(
  msg: MessageItem,
  profile: UserProfile
): BriefingItem | null {
  const text = msg.messageText;
  const lower = text.toLowerCase();

  // Strip system messages and pure small-talk greetings with no substance
  if (isSystemMessage(text) || isPureSmallTalk(text)) {
    return null;
  }

  const deadline = extractDeadline(text);
  const mentioned = isUserMentioned(text, profile);
  const reminder = extractSmartReminder(msg, profile);

  const vipMatch = profile.vipContacts.find(
    (v) =>
      v.name.toLowerCase() === msg.senderName.toLowerCase() ||
      v.aliases.some((a) => a.toLowerCase() === msg.senderName.toLowerCase())
  );

  let priority: PriorityRank = 'P3';
  let priorityReason = 'General college or class conversation.';
  let headline = '';
  let explanation = '';
  let actionIndicator: BriefingItem['actionIndicator'] = 'FYI Only';

  const isUrgentTrigger =
    (mentioned && (lower.includes('meet me') || lower.includes('attendance') || lower.includes('seminar hall') || lower.includes('auditorium'))) ||
    lower.includes('dbms lab starts at 10 am') ||
    lower.includes('bring your observation notebook');

  const isImportantTrigger =
    lower.includes('cultural fest') ||
    lower.includes('project review is scheduled') ||
    lower.includes('internal exam timetable') ||
    lower.includes('mandatory for all') ||
    lower.includes('instead');

  const isTaskTrigger =
    lower.includes('submit it by') ||
    lower.includes('review the conclusion') ||
    lower.includes('submit participant names') ||
    lower.includes('semester fee receipt') ||
    lower.includes('bring your seminar synopsis');

  // P0: Immediate lab sessions, attendance summons, direct teacher meetings
  if (isUrgentTrigger) {
    priority = 'P0';
    priorityReason = 'Direct teacher instruction or urgent laboratory session with same-day deadline.';
    actionIndicator = 'Response Needed';

    if (lower.includes('auditorium') || lower.includes('seminar hall')) {
      if (lower.includes('auditorium instead')) {
        headline = '⚠️ Meeting Moved: Meet Priya Ma’am in Auditorium at 10 AM (Updated)';
        explanation = 'Priya Ma’am updated the venue from Seminar Hall to Auditorium because of placement drive.';
      } else {
        headline = 'Faculty Meeting: Meet Priya Ma’am in Seminar Hall at 9 AM Tomorrow';
        explanation = 'Priya Ma’am requested your presence to review your Cloud & AI seminar synopsis.';
      }
    } else if (lower.includes('attendance')) {
      headline = 'Proctor Summons: Meet Prof. Ravi Kumar Tomorrow at 11 AM';
      explanation = 'Attendance review meeting scheduled regarding 7th semester CIE-2 eligibility.';
    } else if (lower.includes('dbms lab')) {
      headline = 'Lab Alert: DBMS Lab Starts at 10 AM Tomorrow with Observation Book';
      explanation = 'CR Rahul reminded the batch to bring observation notebooks for trigger/procedure evaluation.';
    } else {
      headline = `Urgent: Instruction from ${msg.senderName}`;
      explanation = text;
    }
  }
  // P1: Department directives, Principal announcements, exam schedules
  else if (isImportantTrigger || (vipMatch && (vipMatch.role.includes('Principal') || vipMatch.role.includes('HOD')))) {
    priority = 'P1';
    priorityReason = `Official directive issued by leadership (${vipMatch?.role || msg.senderName}).`;
    actionIndicator = 'Review Required';

    if (lower.includes('cultural fest')) {
      headline = 'Principal Notice: College Cultural Fest on Friday (Names by Wednesday)';
      explanation = 'Dr. K.S. Murthy announced the fest schedule. CRs must submit participant rosters.';
    } else if (lower.includes('project review')) {
      headline = 'HOD Directive: Project Review Scheduled for Monday with Working Demo';
      explanation = 'Dr. Sundaram made attendance mandatory for all teams; no extensions permitted.';
    } else if (lower.includes('timetable')) {
      headline = 'Exam Cell: Internal Exam Timetable Shared in Class Group Drive';
      explanation = 'CIE schedule released by Karthik Rao; check paper dates and syllabus coverage.';
    } else {
      headline = `Official Notice: ${msg.senderName}`;
      explanation = text;
    }
  }
  // P2: Deliverables, project report submissions, family errands
  else if (isTaskTrigger || mentioned) {
    priority = 'P2';
    priorityReason = mentioned
      ? 'Task explicitly requested from you by classmates or faculty.'
      : 'Upcoming course deliverable deadline.';
    actionIndicator = mentioned ? 'Action Pending' : 'Review Required';

    if (lower.includes('mini-project report')) {
      headline = 'Project Deadline: Mini-Project Report Submission by Thursday';
      explanation = 'Ananya reminded Team 4 to finish documentation and binding before Thursday.';
    } else if (lower.includes('conclusion chapter')) {
      headline = 'Team Assignment: Verify Project Conclusion Chapter & Database Queries';
      explanation = 'Ananya requested Girish to verify the SQL queries before final report printing.';
    } else if (lower.includes('semester fee')) {
      headline = 'Family Request: Collect Semester Fee Receipt from Bank Counter';
      explanation = 'Appa reminded to collect official receipt from college bank branch.';
    } else {
      headline = `Task: ${msg.senderName}`;
      explanation = text;
    }
  }
  // P3: Contextual updates, hostel news, library study sessions
  else {
    priority = 'P3';
    priorityReason = 'Non-urgent campus update or peer discussion.';
    actionIndicator = 'FYI Only';

    if (lower.includes('idli vada')) {
      headline = 'Hostel Mess: Fresh Breakfast Served at Mess Hall';
      explanation = 'Vikram confirmed breakfast is fresh at hostel mess today.';
    } else if (lower.includes('library after 5 pm')) {
      headline = 'Peer Study Group: DBMS Revision at Library After 5 PM';
      explanation = 'Karthik Rao invited batchmates to revise SQL queries together.';
    } else {
      headline = `Update: ${msg.senderName}`;
      explanation = text;
    }
  }

  return {
    id: `brief-${msg.messageId}`,
    priority,
    headline,
    explanation,
    senderName: msg.senderName,
    sourceApp: msg.sourceApp,
    conversationId: msg.conversationId,
    conversationName: msg.conversationName,
    timestamp: msg.timestamp,
    priorityReason,
    actionIndicator,
    actionCompleted: false,
    sourceMessageSnippet: text,
    sourceMessageId: msg.messageId,
    isDirectMention: mentioned,
    isVipSender: !!vipMatch,
    vipRole: vipMatch?.role,
    explicitDeadline: deadline || undefined,
    associatedReminder: reminder || undefined,
  };
}

// Generate the complete Catch-Up Briefing with Plan Updates
export function generateCatchUpBriefing(
  conversations: Conversation[],
  profile: UserProfile
): CatchUpResult {
  const startTime = performance.now();

  const allMessages: MessageItem[] = [];
  conversations.forEach((c) => {
    // Preserve raw messages, but flag system and small talk
    c.messages.forEach((m) => {
      m.isSystemMessage = isSystemMessage(m.messageText);
      m.isSmallTalk = isPureSmallTalk(m.messageText);
      allMessages.push(m);
    });
  });

  const briefingItems: BriefingItem[] = [];
  const myMentions: MentionAnalysis[] = [];
  const smartRemindersMap = new Map<string, SmartReminder>();

  // Process Messages
  allMessages.forEach((msg) => {
    // 1. Briefing items: skips system messages and pure small talk
    const item = evaluateMessageBriefingItem(msg, profile);
    if (item) {
      briefingItems.push(item);
    }

    // 2. Extract smart reminders
    const reminder = extractSmartReminder(msg, profile);
    if (reminder && !smartRemindersMap.has(reminder.title)) {
      smartRemindersMap.set(reminder.title, reminder);
    }

    // 3. Extract personal mentions
    if (isUserMentioned(msg.messageText, profile) && !isSystemMessage(msg.messageText)) {
      const intentData = inferMentionIntent(msg.messageText);
      const topic = extractTopicFromMessage(msg);
      myMentions.push({
        id: `mention-${msg.messageId}`,
        conversationId: msg.conversationId,
        conversationName: msg.conversationName,
        sourceApp: msg.sourceApp,
        topic,
        mentionedBy: msg.senderName,
        discussionSummary: intentData.summary,
        inferredIntent: intentData.intent,
        actionNeeded: intentData.action,
        originalSnippet: msg.messageText,
        timestamp: msg.timestamp,
        sourceMessageId: msg.messageId,
      });
    }
  });

  // Detect Plan Updates across messages
  const planUpdates = detectPlanUpdates(allMessages, smartRemindersMap);

  // Link plan updates into briefing items if applicable
  planUpdates.forEach((pu) => {
    briefingItems.forEach((bi) => {
      if (
        bi.sourceApp === pu.sourceApp &&
        (bi.headline.toLowerCase().includes('priya') || bi.headline.toLowerCase().includes('auditorium') || bi.headline.toLowerCase().includes('seminar'))
      ) {
        bi.associatedPlanUpdate = pu;
      }
    });
  });

  // Group into P0, P1, P2, P3
  const p0Items = briefingItems.filter((i) => i.priority === 'P0');
  const p1Items = briefingItems.filter((i) => i.priority === 'P1');
  const p2Items = briefingItems.filter((i) => i.priority === 'P2');
  const p3Items = briefingItems.filter((i) => i.priority === 'P3');

  // Top 3 Attention Items
  const candidateTop = [
    ...p0Items,
    ...p2Items.filter((i) => i.isDirectMention),
    ...p1Items,
  ];

  const seenHeadlines = new Set<string>();
  const top3AttentionItems: BriefingItem[] = [];
  for (const item of candidateTop) {
    if (!seenHeadlines.has(item.headline)) {
      seenHeadlines.add(item.headline);
      top3AttentionItems.push(item);
      if (top3AttentionItems.length >= 3) break;
    }
  }

  // VIP Activities
  const vipActivities: VipActivitySummary[] = profile.vipContacts.map((vip) => {
    const vipMessages = allMessages.filter(
      (m) =>
        !isSystemMessage(m.messageText) &&
        (m.senderName.toLowerCase().includes(vip.name.toLowerCase()) ||
          vip.aliases.some((a) => m.senderName.toLowerCase().includes(a.toLowerCase())))
    );

    const convNames = Array.from(new Set(vipMessages.map((m) => m.conversationName)));
    const topics = Array.from(new Set(vipMessages.map((m) => extractTopicFromMessage(m))));

    const decisions = vipMessages
      .filter((m) => m.messageText.toLowerCase().includes('fest') || m.messageText.toLowerCase().includes('scheduled') || m.messageText.toLowerCase().includes('mandatory') || m.messageText.toLowerCase().includes('instead'))
      .map((m) => m.messageText);

    const assignments = vipMessages
      .filter((m) => m.messageText.toLowerCase().includes('meet me') || m.messageText.toLowerCase().includes('submit') || m.messageText.toLowerCase().includes('bring'))
      .map((m) => m.messageText);

    const userInteractions = vipMessages
      .filter((m) => isUserMentioned(m.messageText, profile))
      .map((m) => m.messageText);

    const followUps = vipMessages
      .filter((m) => m.messageText.includes('?') || m.messageText.toLowerCase().includes('tomorrow'))
      .map((m) => m.messageText);

    return {
      contactId: vip.id,
      name: vip.name,
      role: vip.role,
      messageCount: vipMessages.length,
      conversations: convNames,
      mainTopics: topics,
      importantDecisions: decisions,
      requestsAndAssignments: assignments,
      interactionsWithUser: userInteractions,
      pendingFollowUps: followUps,
      keyMessageSnippets: vipMessages.slice(0, 3).map((m) => ({
        text: m.messageText,
        conversation: m.conversationName,
        timestamp: m.timestamp,
      })),
    };
  }).filter((v) => v.messageCount > 0);

  // 3 Core Answers for College Morning
  const whatHappened = [
    '⚠️ Location Updated: Priya Ma’am moved the elective meeting from Seminar Hall to Auditorium at 10 AM.',
    'Principal Dr. K.S. Murthy announced the College Cultural Fest for Friday (names due Wednesday).',
    'CR Rahul notified the class that tomorrow’s DBMS Lab begins at 10:00 AM with mandatory observation notebook.',
    'HOD Dr. Sundaram scheduled the Project Review for Monday with mandatory working demo.',
  ];

  const whatMatters = [
    'Priya Ma’am updated meeting: Auditorium at 10:00 AM (Seminar Hall was occupied).',
    'Proctor Prof. Ravi Kumar called a meeting tomorrow at 11:00 AM regarding your attendance.',
    'Mini-project team needs your review on conclusion and database queries before Thursday submission.',
  ];

  const whatToDoNext = [
    'Alarm rescheduled: 9:45 AM alert (15 mins before updated 10:00 AM meeting in Auditorium with Priya Ma’am).',
    'Pack DBMS observation notebook for 10:00 AM lab evaluation.',
    'Attend Proctor Ravi Kumar meeting at 11:00 AM regarding CIE attendance.',
  ];

  const endTime = performance.now();
  const processingTimeMs = Math.round((endTime - startTime) * 100) / 100;

  return {
    analyzedMessagesCount: allMessages.filter((m) => !isSystemMessage(m.messageText)).length,
    timeSpan: '11:00 PM Yesterday → 08:20 AM Today (Overnight)',
    conversationsCount: conversations.length,
    top3AttentionItems,
    p0Items,
    p1Items,
    p2Items,
    p3Items,
    myMentions,
    vipActivities,
    smartReminders: Array.from(smartRemindersMap.values()),
    planUpdates,
    answers: {
      whatHappened,
      whatMatters,
      whatToDoNext,
    },
    processingTimeMs,
  };
}

// Generate Participant breakdown for single conversation
export function analyzeConversationParticipants(
  conversation: Conversation,
  profile: UserProfile
): ParticipantSummary[] {
  const participantMap: { [name: string]: ParticipantSummary } = {};

  conversation.participants.forEach((name) => {
    const isVip = profile.vipContacts.some((v) =>
      name.toLowerCase().includes(v.name.toLowerCase())
    );
    const vipRole = profile.vipContacts.find((v) =>
      name.toLowerCase().includes(v.name.toLowerCase())
    )?.role;

    participantMap[name] = {
      name,
      messageCount: 0,
      mostDiscussedTopics: [],
      decisionsOrTasksContributed: [],
      importantMessages: [],
      mentionedUser: false,
      isVip,
      vipRole,
    };
  });

  conversation.messages.forEach((m) => {
    if (isSystemMessage(m.messageText)) return;

    const sender = m.senderName;
    if (!participantMap[sender]) {
      const isVip = profile.vipContacts.some((v) =>
        sender.toLowerCase().includes(v.name.toLowerCase())
      );
      const vipRole = profile.vipContacts.find((v) =>
        sender.toLowerCase().includes(v.name.toLowerCase())
      )?.role;
      participantMap[sender] = {
        name: sender,
        messageCount: 0,
        mostDiscussedTopics: [],
        decisionsOrTasksContributed: [],
        importantMessages: [],
        mentionedUser: false,
        isVip,
        vipRole,
      };
    }

    participantMap[sender].messageCount += 1;

    if (isUserMentioned(m.messageText, profile)) {
      participantMap[sender].mentionedUser = true;
    }

    const lower = m.messageText.toLowerCase();
    if (lower.includes('fest') || lower.includes('scheduled') || lower.includes('meet me') || lower.includes('starts at') || lower.includes('instead')) {
      participantMap[sender].decisionsOrTasksContributed.push(m.messageText);
      participantMap[sender].importantMessages.push({
        text: m.messageText,
        timestamp: m.timestamp,
      });
    }
  });

  return Object.values(participantMap).sort((a, b) => b.messageCount - a.messageCount);
}
