import { ExtractionResult } from '../types';

export function formatExecutiveReportMarkdown(result: ExtractionResult): string {
  const lines: string[] = [];

  lines.push(`# UnreadIQ — Executive Chat Intelligence Report`);
  lines.push(`Generated: ${new Date().toLocaleString()} (100% Local In-Browser Analysis)`);
  lines.push(`Analyzed: ${result.rawMessageCount} messages in ${result.processingTimeMs}ms`);
  lines.push(``);
  lines.push(`## 📌 Executive Summary`);
  lines.push(result.executiveSummary);
  lines.push(``);

  if (result.participants.length > 0) {
    lines.push(`**Participants:** ${result.participants.join(', ')}`);
    lines.push(``);
  }

  if (result.keyTopics.length > 0) {
    lines.push(`**Key Topics:** ${result.keyTopics.join(' · ')}`);
    lines.push(``);
  }

  lines.push(`## ⚡ Key Decisions (${result.decisions.length})`);
  if (result.decisions.length === 0) {
    lines.push(`*No explicit decisions detected.*`);
  } else {
    result.decisions.forEach((d, idx) => {
      lines.push(`${idx + 1}. **${d.title}**`);
      if (d.decider) lines.push(`   - Confirmed by: ${d.decider}`);
      lines.push(`   - Context: "${d.context}"`);
    });
  }
  lines.push(``);

  lines.push(`## ✅ Action Items & Tasks (${result.actionItems.length})`);
  if (result.actionItems.length === 0) {
    lines.push(`*No action items detected.*`);
  } else {
    result.actionItems.forEach((t) => {
      const status = t.completed ? '[x]' : '[ ]';
      const assigneeStr = t.assignee ? ` (@${t.assignee.replace('@', '')})` : '';
      const deadlineStr = t.deadline ? ` — ⏰ Due: ${t.deadline}` : '';
      const priorityStr = t.priority === 'urgent' ? ' [URGENT]' : '';
      lines.push(`- ${status}${priorityStr} ${t.description}${assigneeStr}${deadlineStr}`);
    });
  }
  lines.push(``);

  if (result.deadlines.length > 0) {
    lines.push(`## ⏱ Deadlines & Milestones (${result.deadlines.length})`);
    result.deadlines.forEach((dl) => {
      lines.push(`- **${dl.deadlineString}**: ${dl.text} (mentioned by ${dl.sender})`);
    });
    lines.push(``);
  }

  if (result.mentions.length > 0) {
    lines.push(`## 👥 Mentions Breakdown`);
    result.mentions.forEach((m) => {
      lines.push(`- **${m.handle}**: ${m.count} mention(s), ${m.assignedTasksCount} task(s) assigned`);
    });
    lines.push(``);
  }

  lines.push(`---`);
  lines.push(`*Generated privately via UnreadIQ — Zero cloud transmission, zero server storage.*`);

  return lines.join('\n');
}
