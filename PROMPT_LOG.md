# PROMPT LOG — UnreadIQ College Edition

This document logs development prompts and architecture decisions for **UnreadIQ — College Communication Intelligence**.

---

## Turn 1: Initial MVP
- Deterministic transcript parser with basic action item and decision extraction.

---

## Turn 2: Personal Communication Intelligence Upgrade
- Telegram-inspired blue-and-black design system.
- Multi-app message model (Slack, Telegram, Email, WhatsApp, Teams, Instagram).
- P0–P3 priority-ranked briefing and user profile tracking.

---

## Turn 3: Indian Engineering College & Smart Reminders with Alarms Upgrade

**Prompt Summary:**
- Replace the office environment with an **Indian engineering college**.
- Replace corporate titles (CEO/CTO) with **Principal, Proctor, Class Representative (CR), Subject Teachers, HOD, and Classmates**.
- Realistic Indian names: **Rahul, Priya, Arjun, Sneha, Ananya, Karthik, Ravi**. User default: **Girish**.
- Add **Smart College Reminders with Alarms**:
  - Automatically detect personal meetings, instructions, classes, and deadlines (e.g. *Priya Ma’am: "Girish, meet me in the seminar hall at 9 AM tomorrow"*).
  - Extract task, campus location (*Seminar Hall*), and date/time (*tomorrow at 9 AM*).
  - Provide an interactive reminder card with **Set Alarm** toggle, scheduling audio chimes 15 minutes before and at meeting time.
  - Implement a Web Audio API synthesizer for audible alarm chime + system Notification API with "Test Alarm Audio" button.
- Integrate specific required college sample messages:
  - Principal (Cultural fest on Friday, names by Wednesday)
  - Proctor Ravi Kumar ("Girish, please meet me tomorrow at 11 AM regarding your attendance")
  - Priya Ma’am ("Girish, meet me in the seminar hall at 9 AM tomorrow")
  - CR Rahul ("Tomorrow’s DBMS lab starts at 10 AM. Bring your observation notebook")
  - Ananya ("Did you finish the mini-project report? We need to submit it by Thursday")
  - Karthik ("The internal exam timetable has been shared in the class group")
  - HOD ("Project review is scheduled for Monday. Each team must bring a working demo")
- In the chat import tool, allow **.ZIP file upload and drop space** (e.g. exported WhatsApp chats containing `_chat.txt`), unpacking directly in browser via `JSZip`.

### Engineering Actions & Architecture:
1. Installed and configured `jszip` for client-side archive decompression.
2. Built `src/utils/alarm.ts` with Web Audio API multi-tone synthesis and browser Notification API scheduling.
3. Created `src/components/RemindersSection.tsx` with alarm toggles, test audio chime, location detection, and reminder management.
4. Updated `src/utils/intelligence.ts` to detect location cues (*seminar hall, dbms lab, proctor cell*), temporal phrases, and map them to `SmartReminder`.
5. Updated `src/data/overnightInbox.ts` with the 7 realistic college conversations.
6. Updated `src/components/ImportModal.tsx` with dedicated drag-and-drop zone for `.ZIP` and `.TXT` files.
7. Verified with `lint_applet` and `compile_applet`.

---

## Turn 4: College Communication Intelligence Upgrade (Separate Inbox Pages & Group Organization)

**Prompt Summary:**
- Create **3 Separate Inbox Pages**:
  - **All Inbox**: Displays messages from every category (College + Personal).
  - **Professional / College**: Displays *only* college-related conversations. Personal messages are strictly excluded.
  - **Family & Personal**: Displays *only* family and personal conversations. College announcements and administrative messages are strictly excluded.
  - Simple, consistent navigation with clear active tab indicator.
- **Show the Source App for Every Message**:
  - Show the source name (WhatsApp, Telegram, Gmail, Teams, Instagram, Slack) and recognizable icon.
  - Never guess the source. If unknown, display "Imported conversation".
  - Required examples: `Rahul — Class Group` (Source: WhatsApp) and `Priya Ma’am — Project Discussion` (Source: Telegram).
- **Organize Professional Messages Group-Wise**:
  - **A. Official College Groups**: Faculty, HOD, Principal, Proctor, and official circulars.
  - **B. Unofficial / Student-Led Groups**: Hackathons, Study Circles, Fest Committees, Mini-Project.
  - **C. Private 1-on-1 Messages (DMs)**: Proctor DM, Priya Ma'am DM, CR Rahul DM.
- Preserved all existing features: Plan Updates detection with visual comparison diff, Smart College Reminders with audible alarms, P0–P3 briefing, Mentions, and Telegram blue-and-dark aesthetic.

### Engineering Actions & Architecture:
1. Created `src/components/SourceBadge.tsx` for consistent, verified source platform badge display with icons.
2. Updated `src/components/ConversationList.tsx` with group-wise organization (Section A, B, C) and SourceBadge on all conversations.
3. Updated `src/components/PriorityBriefing.tsx`, `TopAttentionCard.tsx`, `MentionsSection.tsx`, `PlanUpdatesSection.tsx`, and `RemindersSection.tsx` to display verified SourceBadges.
4. Upgraded `src/data/overnightInbox.ts` with 11 realistic conversations spanning all categories and source platforms.
5. Upgraded `src/App.tsx` with distinct view states for All, Professional/College, Family/Personal, and My Reminders.
6. Verified with `lint_applet` and `compile_applet` (all passed cleanly).
