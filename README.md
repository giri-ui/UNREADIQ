# UnreadIQ — College Communication Intelligence

> **"Wake up. Know what happened. Know what matters. Know what you need to do."**  
> Indian Engineering College Edition — Catch up on overnight WhatsApp class groups, Proctor summons, HOD notices, and teacher instructions in minutes.

---

## 🎓 The College Problem & Vision

College students receive overwhelming overnight notifications across **WhatsApp class groups, Telegram proctoring channels, Microsoft Teams elective groups, and college emails**. Important announcements get lost in informal banter:
- Meeting instructions from subject teachers (*"Girish, meet me in the seminar hall at 9 AM tomorrow"*).
- Critical attendance notices from proctors (*"Please meet me tomorrow at 11 AM regarding your attendance"*).
- Essential lab requirements from the CR (*"DBMS lab starts at 10 AM. Bring your observation notebook"*).
- Deadlines for cultural fest rosters, internal exams, and mini-project report submissions.

**UnreadIQ** brings calm order to the student's morning, answering three vital questions immediately:
1. **What happened in class channels while I was away?**
2. **What is most important to me?**
3. **What do I need to do next?**

---

## ⏰ Smart College Reminders & Alarms

When a faculty member, proctor, or classmate mentions a personal instruction, meeting, class, or deadline:
- **Automatic Entity Detection**:
  - Detects personal mentions of **Girish**.
  - Identifies the action (e.g. *Meet Priya Ma’am*, *Attendance review with Proctor*).
  - Extracts the campus location (e.g. *Seminar Hall*, *DBMS Lab*, *Proctor Office*).
  - Normalizes natural language dates (*tomorrow at 9 AM*, *11 AM tomorrow*, *by Thursday*).
- **Interactive Alarm Card**:
  - **“Meet Priya Ma’am — Seminar Hall — 9:00 AM tomorrow”**
  - **“Meet Proctor Ravi Kumar — Attendance Review — 11:00 AM tomorrow”**
  - **“DBMS Lab Session — Bring Observation Book — 10:00 AM tomorrow”**
- **Set Alarm**:
  - One-tap alarm toggle scheduling an advance alert **15 minutes before the meeting** and at meeting time.
  - Generates audible dual-tone college chime via **Web Audio API** (`AudioContext` synthesizer).
  - Dispatches browser notifications via system Notification API.
  - Includes a **"Test Alarm Audio"** button for immediate verification.
  - Complete, edit, snooze, or delete reminders.

---

## 🏛 College Roles & Key Contacts (VIPs)

Configured for Indian engineering colleges:
- **Principal (Dr. K.S. Murthy)**: High-level institutional notices (Cultural fest, holidays, circulars).
- **HOD (Dr. Sundaram - CSE)**: Department project reviews, working demo requirements, academic rules.
- **Proctor (Prof. Ravi Kumar)**: Student cell, CIE attendance eligibility, academic counselling.
- **Subject Teacher (Priya Ma’am)**: Elective coursework, seminar synopsis evaluation, syllabus rubrics.
- **Class Representative (CR Rahul)**: Lab schedules, observation notebook alerts, participant rosters.
- **Classmates (Ananya Hegde, Karthik Rao, Arjun Kumar)**: Mini-project documentation, CIE exam timetables, study groups.

---

## 📁 WhatsApp .ZIP & Text Import

- **Drag-and-Drop Drop Zone**: Large dedicated drop space supporting WhatsApp exported `.ZIP` archives (e.g., `WhatsApp Chat with CS7.zip`).
- **In-Browser JSZip Engine**: Unpacks `_chat.txt` or `.txt` logs directly inside client memory without server uploads.
- **Format Ingestion**: Supports WhatsApp, Telegram exports, Microsoft Teams transcripts, and plain text notes.

---

## 🎨 Design System — Telegram-Inspired Blue and Black

- **Canvas**: Deep navy-black (`#0b1118`) with elevated slate-navy panels (`#111923`, `#14202e`).
- **Accent**: Telegram blue (`#2481cc` / `#50b2ff`).
- **Clean Typography**: White primary text (`#ffffff`), muted slate metadata (`#708499` / `#9ab0c5`).
- **Uncluttered & Restrained**: Zero pill clumping, minimal distractions, fast sub-millisecond local processing.

---

## 🔒 Privacy & Architecture

| Property | Status |
| :--- | :--- |
| **Backend Transmission** | **0% Network Calls.** Transcripts, zip archives, and reminders execute locally in browser memory. |
| **Cloud LLMs** | **None.** Uses deterministic NLP heuristics and entity extractors. |
| **Credentials** | **Never requested.** |
| **Storage** | **Ephemeral RAM only.** Instant "Purge Session Memory" button wipes all state. |

---

## 🛠 Setup & Running

```bash
# 1. Install dependencies
npm install

# 2. Run local development server (Port 3000)
npm run dev

# 3. Type-check and lint
npm run lint

# 4. Production build
npm run build
```
