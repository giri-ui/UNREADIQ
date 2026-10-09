import {
  ChatMessage,
  ActionItem,
  Decision,
  MentionRecord,
  DeadlineEvent,
  ExtractionResult,
  PriorityLevel,
} from '../types';

// Helper to sanitize and trim text
function cleanString(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

// Extract @mentions from text
export function extractMentions(text: string): string[] {
  const mentionRegex = /@([a-zA-Z0-9_\-\.]+)/g;
  const matches = text.match(mentionRegex);
  if (!matches) return [];
  return Array.from(new Set(matches.map((m) => m.toLowerCase())));
}

// Extract explicit deadlines
export function extractDeadline(text: string): string | null {
  const deadlinePatterns = [
    /\b(?:by|before|due(?:\s+by)?|until|deadline(?:\s+is)?(?:\s*:)?)\s+((?:today|tonight|tomorrow|eod|cob|end of day|end of week|next week|noon|midnight|(?:mon|tues|wednes|thurs|fri|satur|sun)(?:day)?|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|\d{1,2}(?:\/|-|\.)\d{1,2}(?:\/|-|\.)?\d{0,4}|\d{1,2}(?::\d{2})?\s*(?:am|pm)?)(?:\s+(?:at\s+)?\d{1,2}(?::\d{2})?\s*(?:am|pm)?)?)/i,
    /\b(?:eta|due date|target date)(?:\s*:|\s+is)\s+([a-zA-Z0-9\s,\/\-\.:]{3,30})/i,
    /\b(?:in\s+\d+\s+(?:minutes?|hours?|days?|weeks?))\b/i,
  ];

  for (const pattern of deadlinePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const captured = cleanString(match[1]);
      if (captured.length > 1 && captured.length < 45) {
        return captured;
      }
    } else if (match && match[0]) {
      return cleanString(match[0]);
    }
  }
  return null;
}

// Evaluate priority deterministically
export function evaluatePriority(
  text: string,
  isTask: boolean,
  hasDeadline: boolean
): { priority: PriorityLevel; reason: string } {
  const lower = text.toLowerCase();

  const urgentTriggers = [
    'urgent',
    'asap',
    'immediately',
    'critical',
    'emergency',
    'blocker',
    'blocking',
    'outage',
    'broken',
    'p0',
    'p1',
    'sev-1',
    'sev1',
    'high priority',
    'down in prod',
    'production down',
    'stop the line',
    'eod today',
    'right now',
  ];

  for (const trigger of urgentTriggers) {
    if (lower.includes(trigger)) {
      return {
        priority: 'urgent',
        reason: `Urgency keyword detected: "${trigger}"`,
      };
    }
  }

  // If there's an explicit near deadline or directive requirement
  if (hasDeadline) {
    return {
      priority: 'important',
      reason: 'Contains explicit time-sensitive deadline',
    };
  }

  const importantTriggers = [
    'important',
    'must',
    'required',
    'decision',
    'approved',
    'agreed',
    'architecture',
    'sign-off',
    'release blocker',
    'security',
    'deadline',
    'action item',
  ];

  for (const trigger of importantTriggers) {
    if (lower.includes(trigger)) {
      return {
        priority: 'important',
        reason: `Key operational indicator: "${trigger}"`,
      };
    }
  }

  if (isTask) {
    return {
      priority: 'important',
      reason: 'Direct task commitment or assignment',
    };
  }

  return {
    priority: 'informational',
    reason: 'Standard contextual message or general update',
  };
}

// Detect WhatsApp / Telegram system-generated membership and service events
export function isSystemMessage(text: string): boolean {
  const lower = text.toLowerCase().trim();
  const systemPatterns = [
    /\bjoined using this link\b/i,
    /\badded\s+[\w\s@\+\d]+\b/i,
    /\bleft the group\b/i,
    /\bchanged the group (?:description|icon|subject|settings)\b/i,
    /\bcreated group\b/i,
    /\bsecurity code changed\b/i,
    /\bmessages and calls are end-to-end encrypted\b/i,
    /\bwaiting for this message\b/i,
    /\bthis message was deleted\b/i,
    /\byou deleted this message\b/i,
    /\bmissed (?:voice|video) call\b/i,
  ];

  for (const p of systemPatterns) {
    if (p.test(lower)) return true;
  }
  return false;
}

// Detect low-value small-talk messages (greetings/reactions without actionable content)
export function isPureSmallTalk(text: string): boolean {
  const clean = text.toLowerCase().trim().replace(/[.,!?:;~^_\-*#@\(\)\[\]"']/g, ' ').trim();
  if (!clean) return true;

  // Exact solitary words or simple two-word greetings
  const smallTalkWords = new Set([
    'hi', 'hello', 'hlo', 'hey', 'heyy', 'good morning', 'gm', 'good night', 'gn',
    'thanks', 'thank you', 'thx', 'ok', 'okay', 'k', 'kk', 'bye', 'tc', 'yes', 'yeah',
    'yep', 'nope', 'no', 'hmmm', 'hmm', 'cool', 'nice', 'sure', 'fine', 'great'
  ]);

  if (smallTalkWords.has(clean)) {
    return true;
  }

  // Check if it's only an emoji or punctuation
  const withoutEmojis = clean.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();
  if (withoutEmojis.length === 0) {
    return true;
  }

  // If message contains substantive keywords, it's NOT small talk!
  const substantiveKeywords = [
    'exam', 'lab', 'meet', 'seminar', 'hall', 'auditorium', 'room', 'attendance',
    'proctor', 'hod', 'principal', 'submit', 'report', 'project', 'deadline',
    'postponed', 'moved', 'instead', 'tomorrow', 'today', 'monday', 'wednesday',
    'thursday', 'friday', 'starts', 'time', 'am', 'pm', 'observation', 'notebook',
    'fest', 'marks', 'cie', 'fees', 'receipt', 'demo', 'presentation'
  ];

  for (const word of substantiveKeywords) {
    if (clean.includes(word)) {
      return false;
    }
  }

  // If words count <= 2 and matches a greeting pattern
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length <= 2) {
    const isAllSmall = words.every((w) => smallTalkWords.has(w));
    if (isAllSmall) return true;
  }

  return false;
}

// Parse line into ChatMessage (excluding system messages)
export function parseRawTranscript(transcript: string): ChatMessage[] {
  const lines = transcript
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const messages: ChatMessage[] = [];

  // Common Chat Regex Patterns:
  // 1. [10:30 AM] Sarah: message OR [2025-10-12 10:30] Sarah: message
  const bracketTimestampRegex = /^\[([^\]]+)\]\s+([^:]+):\s*(.*)$/;
  // 2. Sarah [10:30 AM]: message
  const nameBracketTimestampRegex = /^([^\[:]+)\[([^\]]+)\]:\s*(.*)$/;
  // 3. 10/12/25, 10:30 AM - Sarah: message (WhatsApp standard)
  const whatsAppRegex = /^([\d\/\.\-,]+\s+[\d:APMapm\s]+)\s*-\s*([^:]+):\s*(.*)$/;
  // 4. Sarah: message (Standard simplified)
  const standardColonRegex = /^([A-Z0-9a-z\s\.\-_@]+):\s*(.*)$/;
  // 5. Sarah at 10:30 AM: message
  const atTimeRegex = /^([^\s:]+)\s+at\s+([0-9:APMapm\s]+):\s*(.*)$/i;

  let currentMsg: ChatMessage | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Filter out standalone system events like "12345 joined using this link" or encryption notices
    if (isSystemMessage(line)) {
      continue;
    }

    let match = line.match(bracketTimestampRegex);
    if (match) {
      if (currentMsg) {
        if (!isSystemMessage(currentMsg.text)) messages.push(currentMsg);
      }
      const timestamp = match[1].trim();
      const sender = match[2].trim();
      const text = match[3].trim();
      if (!isSystemMessage(text)) {
        currentMsg = {
          id: `msg-${messages.length + 1}`,
          rawText: line,
          sender,
          timestamp,
          text,
          mentions: extractMentions(text),
          lineNumber: i + 1,
        };
      }
      continue;
    }

    match = line.match(nameBracketTimestampRegex);
    if (match) {
      if (currentMsg) {
        if (!isSystemMessage(currentMsg.text)) messages.push(currentMsg);
      }
      const sender = match[1].trim();
      const timestamp = match[2].trim();
      const text = match[3].trim();
      if (!isSystemMessage(text)) {
        currentMsg = {
          id: `msg-${messages.length + 1}`,
          rawText: line,
          sender,
          timestamp,
          text,
          mentions: extractMentions(text),
          lineNumber: i + 1,
        };
      }
      continue;
    }

    match = line.match(whatsAppRegex);
    if (match) {
      if (currentMsg) {
        if (!isSystemMessage(currentMsg.text)) messages.push(currentMsg);
      }
      const timestamp = match[1].trim();
      const sender = match[2].trim();
      const text = match[3].trim();
      if (!isSystemMessage(text)) {
        currentMsg = {
          id: `msg-${messages.length + 1}`,
          rawText: line,
          sender,
          timestamp,
          text,
          mentions: extractMentions(text),
          lineNumber: i + 1,
        };
      }
      continue;
    }

    match = line.match(atTimeRegex);
    if (match) {
      if (currentMsg) {
        if (!isSystemMessage(currentMsg.text)) messages.push(currentMsg);
      }
      const sender = match[1].trim();
      const timestamp = match[2].trim();
      const text = match[3].trim();
      if (!isSystemMessage(text)) {
        currentMsg = {
          id: `msg-${messages.length + 1}`,
          rawText: line,
          sender,
          timestamp,
          text,
          mentions: extractMentions(text),
          lineNumber: i + 1,
        };
      }
      continue;
    }

    match = line.match(standardColonRegex);
    if (match && match[1].length < 35 && !match[1].toLowerCase().startsWith('http')) {
      if (currentMsg) {
        if (!isSystemMessage(currentMsg.text)) messages.push(currentMsg);
      }
      const sender = match[1].trim();
      const text = match[2].trim();
      if (!isSystemMessage(text)) {
        currentMsg = {
          id: `msg-${messages.length + 1}`,
          rawText: line,
          sender,
          text,
          mentions: extractMentions(text),
          lineNumber: i + 1,
        };
      }
      continue;
    }

    // Continuation line
    if (currentMsg && !isSystemMessage(line)) {
      currentMsg.text += ` ${line}`;
      currentMsg.rawText += `\n${line}`;
      const newMentions = extractMentions(line);
      currentMsg.mentions = Array.from(new Set([...currentMsg.mentions, ...newMentions]));
    } else if (!isSystemMessage(line)) {
      currentMsg = {
        id: `msg-${messages.length + 1}`,
        rawText: line,
        sender: 'Participant',
        text: line,
        mentions: extractMentions(line),
        lineNumber: i + 1,
      };
    }
  }

  if (currentMsg && !isSystemMessage(currentMsg.text)) {
    messages.push(currentMsg);
  }

  return messages;
}

// Action Item Heuristics
export function extractActionItems(messages: ChatMessage[]): ActionItem[] {
  const actionItems: ActionItem[] = [];

  const taskPatterns = [
    // Imperatives & requests
    {
      regex: /(?:please|plz|kindly|could you|can you|can someone)\s+(.+?)(?:\.|$|!|\?)/i,
      type: 'Direct Request',
    },
    // Explicit keywords
    {
      regex: /(?:todo|to-do|action item|task|assigned to)\s*:?\s*(.+?)(?:\.|$|!)/i,
      type: 'Explicit Task Keyword',
    },
    // Commitments ("I will", "I'll", "I can take care of")
    {
      regex: /(?:i will|i'll|i can|i am going to|i'm going to|taking this|handling this|taking ownership of)\s+(.+?)(?:\.|$|!)/i,
      type: 'Self-Commitment',
    },
    // Team requirements ("We need to", "We have to", "Someone needs to")
    {
      regex: /(?:we need to|we have to|we must|someone needs to|someone should)\s+(.+?)(?:\.|$|!)/i,
      type: 'Team Requirement',
    },
    // Direct mentions with actions: "@Alex can you check..."
    {
      regex: /@([a-zA-Z0-9_\-\.]+)\s+(?:please|can you|could you|will you|take over|fix|investigate|prepare)\s+(.+?)(?:\.|$|!|\?)/i,
      type: 'Mentioned Assignment',
    },
  ];

  messages.forEach((msg) => {
    const text = msg.text;

    // Check each pattern
    for (const p of taskPatterns) {
      const match = text.match(p.regex);
      if (match) {
        let taskBody = '';
        let detectedAssignee: string | null = null;

        if (p.type === 'Mentioned Assignment' && match[1] && match[2]) {
          detectedAssignee = `@${match[1]}`;
          taskBody = match[2];
        } else if (p.type === 'Self-Commitment') {
          detectedAssignee = msg.sender;
          taskBody = match[1];
        } else {
          taskBody = match[1];
          // Check if message has @mentions to assign to
          if (msg.mentions.length > 0) {
            detectedAssignee = msg.mentions[0];
          }
        }

        // Clean up task text
        taskBody = cleanString(taskBody);
        if (taskBody.length < 5) continue;

        // Extract deadline if present
        const deadline = extractDeadline(text);
        const { priority, reason } = evaluatePriority(text, true, !!deadline);

        // Avoid exact duplicate tasks
        const isDuplicate = actionItems.some(
          (item) => item.description.toLowerCase() === taskBody.toLowerCase()
        );

        if (!isDuplicate) {
          actionItems.push({
            id: `task-${actionItems.length + 1}`,
            description: taskBody.charAt(0).toUpperCase() + taskBody.slice(1),
            assignee: detectedAssignee,
            deadline,
            priority,
            confidenceReason: `${p.type} (${reason})`,
            completed: false,
            sourceMessageId: msg.id,
            sourceSender: msg.sender,
            sourceTimestamp: msg.timestamp,
            originalText: text,
          });
        }
        break; // Match first strong pattern per message
      }
    }
  });

  return actionItems;
}

// Decision Heuristics
export function extractDecisions(messages: ChatMessage[]): Decision[] {
  const decisions: Decision[] = [];

  const decisionPatterns = [
    {
      regex: /(?:we decided|decided to|decision\s*:|we have agreed to|agreed that|agreed on)\s+(.+?)(?:\.|$|!)/i,
      reason: 'Consensus keyword: "decided/agreed"',
    },
    {
      regex: /(?:approved\s*:?|sign(?:ed)?-off on|greenlit|moving forward with|let's go with)\s+(.+?)(?:\.|$|!)/i,
      reason: 'Approval directive: "approved/moving forward"',
    },
    {
      regex: /(?:the final call is|conclusion is|resolution\s*:?)\s+(.+?)(?:\.|$|!)/i,
      reason: 'Explicit resolution syntax',
    },
    {
      regex: /(?:we will stick with|settled on|going with option)\s+(.+?)(?:\.|$|!)/i,
      reason: 'Option selection consensus',
    },
  ];

  messages.forEach((msg) => {
    for (const p of decisionPatterns) {
      const match = msg.text.match(p.regex);
      if (match && match[1]) {
        let decTitle = cleanString(match[1]);
        if (decTitle.length >= 8) {
          const { priority, reason } = evaluatePriority(msg.text, false, false);

          const isDuplicate = decisions.some(
            (d) => d.title.toLowerCase() === decTitle.toLowerCase()
          );

          if (!isDuplicate) {
            decisions.push({
              id: `dec-${decisions.length + 1}`,
              title: decTitle.charAt(0).toUpperCase() + decTitle.slice(1),
              decider: msg.sender,
              context: msg.text,
              priority: priority === 'informational' ? 'important' : priority,
              confidenceReason: `${p.reason} · ${reason}`,
              sourceMessageId: msg.id,
              sourceSender: msg.sender,
              sourceTimestamp: msg.timestamp,
            });
          }
          break;
        }
      }
    }
  });

  return decisions;
}

// Extract Mentions Breakdown
export function extractMentionsBreakdown(
  messages: ChatMessage[],
  actionItems: ActionItem[]
): MentionRecord[] {
  const recordMap: { [handle: string]: MentionRecord } = {};

  messages.forEach((msg) => {
    msg.mentions.forEach((handle) => {
      if (!recordMap[handle]) {
        recordMap[handle] = {
          handle,
          count: 0,
          assignedTasksCount: 0,
          messages: [],
        };
      }
      recordMap[handle].count += 1;
      recordMap[handle].messages.push({
        id: msg.id,
        sender: msg.sender,
        text: msg.text,
        timestamp: msg.timestamp,
      });
    });
  });

  // Count assigned tasks for each handle
  actionItems.forEach((task) => {
    if (task.assignee) {
      const cleanAssignee = task.assignee.toLowerCase();
      // Match exact handle or name
      Object.keys(recordMap).forEach((handle) => {
        if (
          cleanAssignee === handle ||
          cleanAssignee.replace('@', '') === handle.replace('@', '')
        ) {
          recordMap[handle].assignedTasksCount += 1;
        }
      });
    }
  });

  return Object.values(recordMap).sort((a, b) => b.count - a.count);
}

// Extract Deadlines & Timeline
export function extractDeadlinesList(
  messages: ChatMessage[],
  actionItems: ActionItem[]
): DeadlineEvent[] {
  const events: DeadlineEvent[] = [];

  // First collect from action items
  actionItems.forEach((task) => {
    if (task.deadline) {
      events.push({
        id: `deadline-task-${task.id}`,
        text: task.description,
        deadlineString: task.deadline,
        associatedTask: task.description,
        sender: task.sourceSender,
        timestamp: task.sourceTimestamp,
      });
    }
  });

  // Also check messages that had explicit deadlines but weren't tasks
  messages.forEach((msg) => {
    const dl = extractDeadline(msg.text);
    if (dl) {
      const alreadyHas = events.some(
        (e) => e.deadlineString.toLowerCase() === dl.toLowerCase() && e.sender === msg.sender
      );
      if (!alreadyHas) {
        events.push({
          id: `deadline-msg-${msg.id}`,
          text: msg.text,
          deadlineString: dl,
          sender: msg.sender,
          timestamp: msg.timestamp,
        });
      }
    }
  });

  return events;
}

// Extract Frequent Key Discussion Topics
export function extractKeyTopics(messages: ChatMessage[]): string[] {
  const stopWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it',
    'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
    'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
    'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
    'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
    'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
    'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come',
    'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how',
    'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because',
    'any', 'these', 'give', 'day', 'most', 'us', 'hey', 'yeah', 'yes', 'ok',
    'okay', 'sure', 'thanks', 'team', 'please', 'hello', 'hi', 'everyone'
  ]);

  const wordCounts: { [word: string]: number } = {};

  messages.forEach((msg) => {
    const words = msg.text
      .toLowerCase()
      .replace(/[^a-z0-9\-_]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.has(w) && !w.startsWith('@'));

    words.forEach((w) => {
      wordCounts[w] = (wordCounts[w] || 0) + 1;
    });
  });

  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([w, count]) => `${w} (${count})`);
}

// Synthesize Concise Executive Summary
export function generateExecutiveSummary(
  messages: ChatMessage[],
  participants: string[],
  actionItems: ActionItem[],
  decisions: Decision[],
  urgentCount: number
): string {
  const parts: string[] = [];

  const timeFrame =
    messages.length > 0 && messages[0].timestamp && messages[messages.length - 1].timestamp
      ? `spanning from ${messages[0].timestamp} to ${messages[messages.length - 1].timestamp}`
      : `comprising ${messages.length} messages`;

  parts.push(
    `Conversation across ${participants.length} participants (${participants.slice(0, 4).join(', ')}${participants.length > 4 ? ` +${participants.length - 4} others` : ''}) ${timeFrame}.`
  );

  if (urgentCount > 0) {
    parts.push(
      `⚠️ Identified ${urgentCount} urgent/critical item(s) requiring immediate attention.`
    );
  }

  if (decisions.length > 0) {
    const topDecisions = decisions.slice(0, 2).map((d) => `"${d.title}"`).join(' and ');
    parts.push(`Key decision(s) agreed: ${topDecisions}.`);
  } else {
    parts.push(`No formal agreements or decisions ratified during this exchange.`);
  }

  if (actionItems.length > 0) {
    const assignedCount = actionItems.filter((a) => a.assignee).length;
    parts.push(
      `Generated ${actionItems.length} action item(s) (${assignedCount} explicitly assigned, ${actionItems.filter((a) => a.deadline).length} with stated deadlines).`
    );
  } else {
    parts.push(`No direct tasks or action items were extracted.`);
  }

  return parts.join(' ');
}

// Master Deterministic Analyzer
export function analyzeConversation(transcript: string): ExtractionResult {
  const startTime = performance.now();

  const parsedMessages = parseRawTranscript(transcript);

  const participantSet = new Set<string>();
  parsedMessages.forEach((m) => {
    if (m.sender && m.sender !== 'Participant') {
      participantSet.add(m.sender);
    }
  });
  const participants = Array.from(participantSet);

  const actionItems = extractActionItems(parsedMessages);
  const decisions = extractDecisions(parsedMessages);
  const mentions = extractMentionsBreakdown(parsedMessages, actionItems);
  const deadlines = extractDeadlinesList(parsedMessages, actionItems);
  const keyTopics = extractKeyTopics(parsedMessages);

  const urgentTasksCount = actionItems.filter((a) => a.priority === 'urgent').length;
  const urgentDecisionsCount = decisions.filter((d) => d.priority === 'urgent').length;
  const urgentMessagesCount = parsedMessages.filter(
    (m) => evaluatePriority(m.text, false, false).priority === 'urgent'
  ).length;

  const urgentItemsCount = Math.max(urgentTasksCount + urgentDecisionsCount, urgentMessagesCount);

  let timeSpan: { start?: string; end?: string } | null = null;
  if (parsedMessages.length > 0) {
    const firstWithTime = parsedMessages.find((m) => m.timestamp);
    const lastWithTime = [...parsedMessages].reverse().find((m) => m.timestamp);
    if (firstWithTime?.timestamp || lastWithTime?.timestamp) {
      timeSpan = {
        start: firstWithTime?.timestamp,
        end: lastWithTime?.timestamp,
      };
    }
  }

  const executiveSummary = generateExecutiveSummary(
    parsedMessages,
    participants,
    actionItems,
    decisions,
    urgentItemsCount
  );

  const endTime = performance.now();
  const processingTimeMs = Math.round((endTime - startTime) * 100) / 100;

  return {
    rawMessageCount: parsedMessages.length,
    parsedMessages,
    participants,
    timeSpan,
    executiveSummary,
    keyTopics,
    actionItems,
    decisions,
    mentions,
    deadlines,
    urgentItemsCount,
    processingTimeMs,
  };
}
