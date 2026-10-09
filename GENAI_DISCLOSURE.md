# GENAI DISCLOSURE — UnreadIQ College Edition

In compliance with hackathon transparency guidelines, this document discloses all Generative AI tools used during the design, development, and execution of **UnreadIQ — College Communication Intelligence**.

---

## 1. Runtime Services Disclosure

| Category | Disclosure | Details |
| :--- | :--- | :--- |
| **Runtime GenAI / LLM Calls** | **NONE (0%)** | UnreadIQ does **NOT** call any remote LLM APIs or cloud AI models at runtime. |
| **Data Transmission** | **NONE** | All transcripts, zip archives, and reminders are processed strictly in browser memory. |
| **Alarm & Notification Audio** | **Web Audio API** | Real audio synth using `AudioContext` oscillators (no external audio files or remote streams needed). |
| **Archive Unpacking** | **JSZip (Client-Side)** | Unpacks `.zip` exports directly in JavaScript inside the browser tab. |
| **Analysis Engine** | **Deterministic Local Intelligence** | Implemented in `src/utils/intelligence.ts` using rule-based tokenizers, campus entity matchers, and deadline extractors. |

---

## 2. Development-Time GenAI Disclosure

| Phase | Tool Used | Purpose |
| :--- | :--- | :--- |
| **Design & Scaffolding** | Google AI Studio Build (Gemini 3.8 Flash) | Assisted in translating the college problem brief into the Telegram-inspired blue-and-black component hierarchy, TypeScript types, and Tailwind styles. |
| **College Dataset Formulation** | Google AI Studio Build (Gemini 3.8 Flash) | Assisted in authoring the anonymized Indian engineering college sample conversations (cultural fest, proctor attendance, DBMS lab, mini-project, and elective seminars). |

---

## 3. Transparency & Integrity Commitments

- **Clear Source Distinction**: The UI clearly denotes whether a conversation is imported or part of the preloaded demo dataset.
- **Traceable Evidence**: Every summary bullet point, reminder, and assigned task in the briefing links directly to verbatim message text with timestamps.
- **Zero Hallucination Guarantee**: UnreadIQ never invents nonexistent deadlines or fabricated decisions.
