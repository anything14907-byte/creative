# PyqRanker: Smart University PYQ Matcher & In-Page Study Companion

[![Manifest V3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/)
[![React 18](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Zero External Keys](https://img.shields.io/badge/Setup-100%25%20Local%20%26%20Self--Contained-emerald.svg)]()

> **PyqRanker** is an academic exam intelligence platform and in-page study companion for Computer Science students. It predicts high-probability exam questions, extracts PYQs from university exam papers, evaluates answers in real-time against grading rubrics, and injects a Shadow DOM study sidebar into any webpage (Wikipedia, GeeksforGeeks, MDN, YouTube, etc.) to match past exam questions with the topic being read.

---

## 📁 Monorepo Workspace Structure

```
/Users/yogeshkumar/Creative/
├── web-dashboard/                   # React + TypeScript + Vite + Tailwind CSS SPA
│   ├── index.html                   # HTML entry point with Inter & JetBrains Mono fonts
│   ├── vite.config.ts               # Vite configuration
│   ├── tailwind.config.js           # Solar Paper & Obsidian Focus custom design palette
│   ├── postcss.config.js            # PostCSS configuration
│   ├── package.json                 # Dashboard dependencies & scripts
│   ├── tsconfig.json                # TypeScript compiler configuration
│   └── src/
│       ├── main.tsx                 # Root React DOM mounter
│       ├── App.tsx                  # Core app container & reactive state coordinator
│       ├── index.css                # Tailwind directives & @media print styles
│       ├── types.ts                 # Full TypeScript schemas for questions, rubrics & sync
│       ├── data/
│       │   └── pyqData.ts           # Pre-loaded 2021–2025 Computer Science PYQ dataset
│       ├── components/
│       │   ├── Navbar.tsx           # Subject switcher, theme toggle & snapshot actions
│       │   ├── SidebarNav.tsx       # Navigation tabs, countdown & hot PYQ counter
│       │   ├── AnalyticsHeatmap.tsx # Exam ROI, 5-year unit yield matrix & top 5 repeat list
│       │   ├── QuestionCard.tsx     # Frequency badges, rubric preview, status & notes
│       │   ├── QuestionBankExplorer.tsx # Real-time multi-filter & search engine
│       │   ├── RubricGraderSandbox.tsx # Countdown timer, keyword match & live rubric grader
│       │   ├── PdfParserModal.tsx   # PDF.js text extraction & heuristic paper parser
│       │   ├── CheatSheetModal.tsx  # 1-Click print-optimized night-before cram sheet
│       │   └── Toast.tsx            # Non-intrusive feedback toast notifications
│       ├── utils/
│       │   ├── rubricEvaluator.ts   # Real-time keyword scoring & structural checker
│       │   ├── pdfExtractor.ts      # PDF.js worker & regex university paper parser
│       │   └── syncBridge.ts        # LocalStorage & window.postMessage extension sync
│       └── contexts/
│           └── ThemeContext.tsx     # Dual Day/Night theme provider (Solar Paper & Obsidian)
│
├── extension/                       # Manifest V3 Chrome / Edge / Brave Extension
│   ├── manifest.json                # Manifest V3 configuration with content scripts & commands
│   ├── background.js                # Service worker managing tabs, shortcuts & storage
│   ├── content.js                   # Isolated Shadow DOM in-page sidebar & TF-IDF page matcher
│   ├── popup.html                   # Extension popup UI with quick stats & subject selector
│   ├── popup.js                     # Popup script handling scans, dashboard launch & backups
│   ├── styles.css                   # Dual-themed popup stylesheet
│   ├── data/
│   │   └── pyqData.js               # Standalone dataset bundle for offline extension use
│   └── icons/                       # High-resolution extension icons (16, 32, 48, 128px)
│
└── README.md                        # Documentation & setup instructions
```

---

## 🚀 Quick Start Guide

### 1. Launch the Web Dashboard

The web dashboard runs 100% locally with zero external configuration or database setup.

```bash
# Navigate to web dashboard
cd web-dashboard

# Install dependencies (already installed)
npm install

# Start local dev server
npm run dev
```

The application will immediately be accessible at **`http://localhost:5173`**.

To verify type safety and build output:
```bash
npm run build
```

---

### 2. Load the Manifest V3 Browser Extension

The `/extension` directory is completely pre-packaged and ready to load as an unpacked extension into any Chromium browser (**Google Chrome, Brave, Microsoft Edge, Arc, Opera**):

1. Open your browser and navigate to the Extensions page:
   - **Chrome:** `chrome://extensions`
   - **Brave:** `brave://extensions`
   - **Edge:** `edge://extensions`
2. Enable **"Developer mode"** (toggle in the top-right corner).
3. Click the **"Load unpacked"** button in the top-left toolbar.
4. Select the folder:
   ```
   /Users/yogeshkumar/Creative/extension
   ```
5. You will see **"PyqRanker: University PYQ Matcher & Study Companion"** appear with version `1.0.0` and its active icon!
6. Pin the extension to your browser toolbar for quick access.

---

## 🎨 Dual Theme Engine: Day & Night System

PyqRanker implements a custom design system inspired by **Linear**, **Raycast**, and **Notion**:

| Mode | Theme Name | Background | Primary Palette | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| ☀️ **Day Mode** | **Solar Paper** | `#F8FAFC` (Warm Alabaster) | Slate cards (`#FFFFFF`), Ink typography (`#0F172A`), Royal Indigo accents (`#4F46E5`) | Clean, high-contrast readability for daylight study sessions. |
| 🌙 **Night Mode** | **Obsidian Focus** | `#090D16` (Deep Space Slate) | Frosted glass cards (`rgba(15, 23, 42, 0.75)`), Glowing Cyan (`#06B6D4`) & Indigo (`#6366F1`) | Zero eye strain, high immersion for late-night exam cramming. |

*Theme preferences toggle via the sun/moon icon in the header and synchronize seamlessly between the Web Dashboard and the In-Page Browser Extension.*

---

## 📚 Pre-Loaded University Computer Science Dataset (2021–2025)

The system is pre-populated with realistic university exam papers across four core subjects:
1. **Operating Systems (`CS301`):**
   - Unit 1: Process Management & CPU Scheduling (FCFS, SJF, Round Robin, PCB)
   - Unit 2: Process Synchronization & Deadlocks (Banker's Algorithm, Semaphores, Coffman Conditions)
   - Unit 3: Memory Management & Virtual Memory (Paging, TLB & EMAT derivation, Belady's Anomaly, LRU)
   - Unit 4: Storage & Disk Scheduling (SCAN vs C-SCAN, SSTF, Inodes)
   - Unit 5: Protection & Security (Access control matrix, buffer overflows)
2. **Database Management Systems (`CS302`):**
   - Unit 1: Relational Model & Algebra (Selection, Projection, Cartesian Product, Natural Join)
   - Unit 2: SQL & Normalization (1NF, 2NF, 3NF, BCNF, Lossless Decomposition)
   - Unit 3: Transaction Processing & Concurrency (ACID, Conflict Serializability, Precedence Graphs, 2PL, Dirty Reads)
   - Unit 4: Indexing & B+ Trees (B+ Tree structure, range scans, node splitting)
3. **Computer Networks (`CS303`):**
   - Unit 1: OSI vs TCP/IP Models, Switching architectures
   - Unit 2: Data Link Layer (Sliding Window, Go-Back-N vs Selective Repeat, CRC)
   - Unit 3: Network Layer & Routing (Distance Vector, Bellman-Ford, Count-to-Infinity, Split Horizon, CIDR)
   - Unit 4: Transport Layer (TCP Congestion Control: AIMD, Slow Start, 3 Duplicate ACKs; TCP 3-Way Handshake)
   - Unit 5: DNS Hierarchy & Recursive queries
4. **Data Structures & Algorithms (`CS304`):**
   - Unit 1: Asymptotic Analysis & Master Theorem cases
   - Unit 2: Trees & Balanced Search Trees (AVL Rotations: LL, RR, LR, RL)
   - Unit 3: Heaps & Priority Queues (HeapSort, O(N) Heapify)
   - Unit 4: Graph Algorithms (Dijkstra's Shortest Path, Min-Heap complexity, Negative weight limitation)
   - Unit 5: Dynamic Programming (0/1 Knapsack recurrence relation & DP table)

---

## 🔍 Key Feature Walkthrough

### 1. Interactive Analytics & Exam ROI Heatmap
- **Target Exam Countdown:** Real-time countdown in days and hours.
- **Top 5 "Must-Revise" Questions:** Immediate highlight of guaranteed repeat questions.
- **5-Year Topic Yield Matrix:** Visual gauge displaying which syllabus units produce the highest cumulative marks in university papers, guiding study time allocation.
- **Mastery Tracker:** Tracks questions marked *Mastered* vs *Needs Revision* vs *Pending*.

### 2. Smart PYQ & Syllabus PDF Parser
- **Client-Side PDF Parsing:** Uses `pdfjs-dist` to extract raw text directly in your browser.
- **Regex & NLP Heuristics:**
  - Detects question boundaries (`Q1.`, `Question 2:`, `1(a)`)
  - Identifies mark weightages (`[2 Marks]`, `[5M]`, `[10 Marks]`)
  - Maps to syllabus units via domain keyword matching
  - Extracts 4–6 core technical keywords per question
- **Instant Demo Presets:** Includes "2025 OS Final Exam Paper" and "2024 DBMS Midterm Paper" presets for 1-click testing.

### 3. Question Bank Explorer & Frequency Badge System
- Filter by Subject, Unit (1–5), Marks (2M, 5M, 10M), and Repeat Frequency ("Asked 3+ Times").
- Search across question text, units, and expected keywords.
- Bookmark questions and pin personal revision notes.

### 4. Smart Rubric Practice Sandbox
- Interactive answer editor with mark-weighted countdown timer (3 mins for 2M, 8 mins for 5M, 15 mins for 10M).
- **Instant Rubric Grader:**
  - Evaluates keyword coverage with emerald hit badges and rose missing badges
  - Analyzes word count (too brief, optimal, lengthy)
  - Evaluates structural elements (bullet points, formulas, algorithms)
  - Scores answers out of 10 with celebration confetti when hitting 8.5+/10!
- **Active Recall Check:** Toggle official model answer key at any time.

### 5. 1-Click "Night-Before Exam" Cheat Sheet Generator
- Automatically filters all questions asked 3+ times in the past 5 years.
- Formats core rubric keywords and model answers into a clean, compact layout.
- Optimized for `@media print`: click **"Print / Save PDF"** to create a physical cheat sheet with zero header or sidebar clutter.

### 6. Manifest V3 In-Page Study Sidebar & TF-IDF Matcher
- **In-Page Floating Pill:** Injects a non-intrusive pill button (`Alt + Q`) showing matching questions for the current page (e.g., `"🔥 4 PYQs Match This Page"`).
- **Shadow DOM Isolation:** Styles are 100% isolated inside an open Shadow Root—no CSS clashes with Wikipedia, GeeksforGeeks, MDN, or any host website.
- **Local TF-IDF Scanner:** Analyzes page title, headings (`h1`–`h3`), and content paragraphs to rank matching past exam questions.
- **In-Sidebar Active Recall:** Type answers directly inside the sidebar, check rubric scores, and view model keys without switching tabs.
- **Web Snippet Pinning:** Highlight any definition on a webpage and click "Attach Selection as Note" to save it directly into that PYQ's study notes.

---

## ⚡ Web-to-Extension Synchronization Bridge

1. When the Web Dashboard is open on `localhost`, it automatically broadcasts state updates:
   ```javascript
   window.postMessage({ type: 'PYQ_SYNC_DATA', payload }, '*');
   ```
2. The extension's `content.js` listens, persists the updated questions and theme into `chrome.storage.local`, and replies with:
   ```javascript
   window.postMessage({ type: 'PYQ_EXTENSION_ACK', timestamp }, '*');
   ```
3. The dashboard detects the acknowledgement and displays the glowing **"Extension Synced"** status pill in the top navbar.
4. **Offline / Standalone Portability:** Both the Web Dashboard and the Extension feature **"Export JSON Snapshot"** and **"Import JSON Snapshot"** buttons, allowing study data to be backed up or transferred anywhere.

---

## 🛠️ Verification & Development Commands

```bash
# Verify TypeScript and bundle build
cd /Users/yogeshkumar/Creative/web-dashboard
npm run build

# Start development server
npm run dev

# Inspect extension files
ls -la /Users/yogeshkumar/Creative/extension
```

---

## 🎓 Summary of Included Subjects & Questions

| Subject Code | Name | Indexed PYQs | Guaranteed Repeats (3+ Times) |
| :--- | :--- | :---: | :---: |
| **CS301** | Operating Systems | 8 | 6 |
| **CS302** | Database Management Systems | 6 | 5 |
| **CS303** | Computer Networks | 6 | 4 |
| **CS304** | Data Structures & Algorithms | 5 | 5 |
| **Total** | **Computer Science Core** | **25+ Curated PYQs** | **20 High-Yield Repeats** |

*All questions include full mark allocations (2M, 5M, 10M), official grading keys, model summaries, and repeat years from 2021 through 2025.*
