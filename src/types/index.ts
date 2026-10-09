export type SourceApp =
  | 'whatsapp'
  | 'telegram'
  | 'email'
  | 'slack'
  | 'teams'
  | 'instagram'
  | 'other';

export type ConversationCategory = 'college' | 'personal';

export type CollegeGroupType = 'official' | 'unofficial' | 'private';

export type InboxFilter = 'all' | 'college' | 'personal' | 'reminders';

export type PriorityRank = 'P0' | 'P1' | 'P2' | 'P3';

export type PriorityLevel = 'urgent' | 'important' | 'informational';

export type FilterCategory = 'all' | 'urgent' | 'tasks' | 'decisions' | 'mentions';

export interface VipContact {
  id: string;
  name: string;
  role: string; // e.g. Principal, Proctor, HOD, Subject Teacher, CR, Classmate
  aliases: string[];
}

export interface UserProfile {
  fullName: string;
  preferredName: string;
  aliases: string[];
  vipContacts: VipContact[];
}

export interface MessageItem {
  messageId: string;
  sourceApp: SourceApp;
  conversationId: string;
  conversationName: string;
  category: ConversationCategory;
  collegeGroupType?: CollegeGroupType;
  senderId: string;
  senderName: string;
  timestamp: string;
  messageText: string;
  attachments?: string[];
  isSystemMessage?: boolean;
  isSmallTalk?: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  sourceApp: SourceApp;
  category: ConversationCategory;
  collegeGroupType?: CollegeGroupType;
  unreadCount: number;
  latestActivity: string;
  participants: string[];
  messages: MessageItem[];
  isSample?: boolean;
  isImported?: boolean;
}

export interface SmartReminder {
  id: string;
  title: string;
  instructorOrContact: string;
  location: string | null;
  rawDateTimeString: string;
  parsedDate: string;
  targetTimestamp: number;
  alarmEnabled: boolean;
  alarmOffsetMinutes: number; // e.g. 15 mins before
  completed: boolean;
  sourceMessage: string;
  sourceConversation: string;
  channelId: string;
  sourceApp?: SourceApp;
  alarmTriggered?: boolean;
  isPlanUpdated?: boolean;
  updateNote?: string;
}

export interface PlanUpdate {
  id: string;
  eventType: 'location' | 'time' | 'deadline' | 'schedule' | 'general';
  title: string;
  personName: string;
  personRole?: string;
  conversationName: string;
  sourceApp: SourceApp;
  originalValue: string;
  updatedValue: string;
  originalTime: string;
  updatedTime: string;
  originalMessageText: string;
  updatedMessageText: string;
  matchingReminderId?: string;
  isConfirmed: boolean;
  isUncertain?: boolean;
  appliedToReminder: boolean;
}

export interface BriefingItem {
  id: string;
  priority: PriorityRank;
  headline: string;
  explanation: string;
  senderName: string;
  sourceApp: SourceApp;
  conversationId: string;
  conversationName: string;
  timestamp: string;
  priorityReason: string;
  actionIndicator?: 'Response Needed' | 'Action Pending' | 'Review Required' | 'FYI Only';
  actionCompleted?: boolean;
  sourceMessageSnippet: string;
  sourceMessageId: string;
  isDirectMention?: boolean;
  isVipSender?: boolean;
  vipRole?: string;
  explicitDeadline?: string;
  associatedReminder?: SmartReminder;
  associatedPlanUpdate?: PlanUpdate;
}

export interface MentionAnalysis {
  id: string;
  conversationId: string;
  conversationName: string;
  sourceApp: SourceApp;
  topic: string;
  mentionedBy: string;
  discussionSummary: string;
  inferredIntent: 'task_assigned' | 'question_asked' | 'praised' | 'feedback' | 'referenced';
  actionNeeded: string;
  originalSnippet: string;
  timestamp: string;
  sourceMessageId: string;
}

export interface VipActivitySummary {
  contactId: string;
  name: string;
  role: string;
  messageCount: number;
  conversations: string[];
  mainTopics: string[];
  importantDecisions: string[];
  requestsAndAssignments: string[];
  interactionsWithUser: string[];
  pendingFollowUps: string[];
  keyMessageSnippets: Array<{ text: string; conversation: string; timestamp: string }>;
}

export interface ParticipantSummary {
  name: string;
  messageCount: number;
  mostDiscussedTopics: string[];
  decisionsOrTasksContributed: string[];
  importantMessages: Array<{ text: string; timestamp: string }>;
  mentionedUser: boolean;
  isVip: boolean;
  vipRole?: string;
}

export interface CatchUpResult {
  analyzedMessagesCount: number;
  timeSpan: string;
  conversationsCount: number;
  top3AttentionItems: BriefingItem[];
  p0Items: BriefingItem[];
  p1Items: BriefingItem[];
  p2Items: BriefingItem[];
  p3Items: BriefingItem[];
  myMentions: MentionAnalysis[];
  vipActivities: VipActivitySummary[];
  smartReminders: SmartReminder[];
  planUpdates: PlanUpdate[];
  answers: {
    whatHappened: string[];
    whatMatters: string[];
    whatToDoNext: string[];
  };
  processingTimeMs: number;
}

// Backward-compatible types for the individual transcript analysis engine
export interface ChatMessage {
  id: string;
  rawText: string;
  sender: string;
  timestamp?: string;
  text: string;
  mentions: string[];
  lineNumber: number;
}

export interface ActionItem {
  id: string;
  description: string;
  assignee: string | null;
  deadline: string | null;
  priority: PriorityLevel;
  confidenceReason: string;
  completed: boolean;
  sourceMessageId: string;
  sourceSender: string;
  sourceTimestamp?: string;
  originalText: string;
}

export interface Decision {
  id: string;
  title: string;
  decider: string | null;
  context: string;
  priority: PriorityLevel;
  confidenceReason: string;
  sourceMessageId: string;
  sourceSender: string;
  sourceTimestamp?: string;
}

export interface MentionRecord {
  handle: string;
  count: number;
  assignedTasksCount: number;
  messages: Array<{
    id: string;
    sender: string;
    text: string;
    timestamp?: string;
  }>;
}

export interface DeadlineEvent {
  id: string;
  text: string;
  deadlineString: string;
  associatedTask?: string;
  sender: string;
  timestamp?: string;
}

export interface ExtractionResult {
  rawMessageCount: number;
  parsedMessages: ChatMessage[];
  participants: string[];
  timeSpan: {
    start?: string;
    end?: string;
  } | null;
  executiveSummary: string;
  keyTopics: string[];
  actionItems: ActionItem[];
  decisions: Decision[];
  mentions: MentionRecord[];
  deadlines: DeadlineEvent[];
  urgentItemsCount: number;
  processingTimeMs: number;
}

export interface SampleConversation {
  id: string;
  title: string;
  tagline: string;
  category: string;
  content: string;
}
