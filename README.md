# PyqRanker: Smart University PYQ Matcher & In-Page Study Companion

[![Manifest V3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/)
[![React 18](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF.svg)](https://vitejs.dev/)
[![Cyber Emerald Theme](https://img.shields.io/badge/Design-Cyber%20Emerald%20%26%20Obsidian-00e599.svg)]()
[![Zero External Keys](https://img.shields.io/badge/Setup-100%25%20Local%20%26%20Self--Contained-emerald.svg)]()

> **PyqRanker** is a futuristic, distraction-free exam intelligence platform and in-page study companion for Computer Science students. It predicts high-probability exam questions, extracts PYQs from question papers, provides 3-bullet model exam answers with diagram tips, and injects an isolated Shadow DOM study sidebar into any webpage (Wikipedia, GeeksforGeeks, MDN, YouTube, etc.) to match past exam questions with the topic being read.

**Live Demo on GitHub Pages:** [https://anything14907-byte.github.io/creative/](https://anything14907-byte.github.io/creative/)

---

## 🎨 Futuristic Design System (Obsidian Titanium & Cyber Emerald)

PyqRanker features a sleek, high-immersion visual language with zero purple or indigo clutter:

| Mode | Theme Name | Background | Primary Accent | Surfaces |
| :--- | :--- | :--- | :--- | :--- |
| 🌙 **Night Mode** (Default) | **Obsidian Titanium** | Deep Carbon Obsidian (`#06090E`) with Electric Emerald glow | Electric Emerald (`#00E599`) & Ice Cyan (`#38BDF8`) | Frosted Titanium Glass (`rgba(15, 23, 34, 0.78)`) with `1px solid rgba(255, 255, 255, 0.08)` borders |
| ☀️ **Day Mode** | **Arctic Studio** | Daylight Alabaster (`#F3F6FA`) | Deep Cyber Teal (`#059669`) & Ocean Cyan (`#0284C7`) | Crisp White Cards (`#FFFFFF`) with subtle Slate borders |

---

## ⚡ Radical UX Simplification: 3-Step Student Flow

PyqRanker removes technical jargon and confusing multi-panel filters, replacing them with a glass top navigation bar offering **3 Simple Modes**:

### Mode 1: "1. Study Top Questions" (Default Home)
- **Hero Subject Selector:** 4 interactive cards (**Operating Systems**, **Database Systems**, **Computer Networks**, **Data Structures**) with live circular mastery progress rings.
- **One-Click Filter Pills:** `All Questions`, `🔥 Most Repeated (Must Study)`, `10-Mark Long Answers`, `2 & 5-Mark Short Answers` + clean topic search bar.
- **Redesigned Question Cards:**
  - **Repeat & Marks Badges:** `Asked 4x (2021, 2022, 2024, 2025)` and `10 Marks`.
  - **📖 Show Ideal Exam Answer:** Expands 3–4 crisp bullet points, key diagram/formula exam tip, and glowing emerald keyword pills.
  - **✍️ Test Yourself:** Instant inline recall sandbox that scores answers out of 10 and highlights missing rubric keywords.
  - **✅ Mark as Mastered:** 1-click toggle with micro-animation that updates the subject circular mastery ring.

### Mode 2: "2. Topic Scanner & PDF Upload"
- **Left Card ("Paste Study Topic or Notes"):** Clean text area with **3 Quick-Try Sample Buttons** (`"Try Sample: OS Deadlock Notes"`, `"Try Sample: DBMS Normalization"`, `"Try Sample: OSI Model"`) for instant 1-click demonstration of real-time matching.
- **Right Card ("Drop Question Paper PDF"):** Futuristic drag-and-drop zone with client-side PDF parsing (`pdfjs-dist`) that extracts questions and adds them to your Question Bank automatically.

### Mode 3: "3. Last-Minute Cheat Sheet"
- A distraction-free **Night-Before-Exam Quick Revision View** listing the top repeated questions with their 3-bullet model answers and must-draw diagrams.
- Includes a **1-click "Print / Save as PDF"** button formatted cleanly for `@media print`.

---

## 📁 Workspace Structure

```
/Users/yogeshkumar/Creative/
├── index.html                       # Production GitHub Pages entry point (served from /)
├── 404.html                         # SPA fallback router for GitHub Pages
├── .nojekyll                        # Prevents Jekyll from ignoring assets
├── assets/                          # Production compiled bundles
│
├── web-dashboard/                   # React + TypeScript + Vite Source Code
│   ├── vite.config.ts               # Base relative path configuration (base: './')
│   ├── tailwind.config.js           # Obsidian Titanium & Cyber Emerald design palette
│   ├── src/
│   │   ├── App.tsx                  # 3-Mode root view orchestrator
│   │   ├── index.css                # Obsidian mesh glow, custom scrollbars & print styles
│   │   ├── components/
│   │   │   ├── Navbar.tsx           # 3-Mode top switcher, Day/Night pill & Extension button
│   │   │   ├── StudyHomeView.tsx    # Hero subject cards, progress rings & filter pills
│   │   │   ├── QuestionCard.tsx     # 3-Bullet model answers, diagram tips & inline test
│   │   │   ├── TopicScannerView.tsx # 3 Quick samples & drag-drop PDF uploader
│   │   │   ├── CheatSheetView.tsx   # Night-before exam revision & 1-click print
│   │   │   ├── ExtensionInstallerModal.tsx # In-app browser extension loader guide
│   │   │   └── Toast.tsx            # Non-intrusive toast messages
│   │   ├── data/
│   │   │   └── pyqData.ts           # University CS questions (2021-2025) with bullet answers
│   │   └── utils/
│   │       ├── rubricEvaluator.ts   # Real-time keyword scoring
│   │       ├── pdfExtractor.ts      # Client-side PDF text extraction
│   │       └── syncBridge.ts        # Broadcast sync with browser extension
│
├── extension/                       # Manifest V3 Browser Extension
│   ├── manifest.json                # V3 manifest with commands & host permissions
│   ├── content.js                   # Shadow DOM sidebar & in-page topic matcher
│   ├── popup.html                   # Extension popup UI
│   ├── popup.js                     # Popup state & scan actions
│   ├── styles.css                   # Cyber Emerald & Ice Cyan extension styling
│   └── data/
│       └── pyqData.js               # Offline dataset bundle
└── README.md
```

---

## 🚀 Running Locally

```bash
# 1. Clone the repository
git clone https://github.com/anything14907-byte/creative.git
cd creative/web-dashboard

# 2. Run local dev server
npm run dev

# App runs at: http://localhost:5173
```

---

## 🧩 Loading the Browser Extension (`/extension`)

1. Open Chrome, Brave, or Edge and go to `chrome://extensions`.
2. Toggle on **"Developer mode"** (top right).
3. Click **"Load unpacked"** and select the `/extension` directory.
4. Pin the extension and press **`Alt + Q`** on any webpage to open the in-page study companion.
