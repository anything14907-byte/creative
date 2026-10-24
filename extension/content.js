// PyqRanker In-Page Study Companion & Content Script (Manifest V3)
(function() {
  // Prevent duplicate injection
  if (window.__PYQ_RANKER_INJECTED__) return;
  window.__PYQ_RANKER_INJECTED__ = true;

  // State
  let currentQuestions = [];
  let currentSubjects = [];
  let activeSubjectId = 'os';
  let activeTheme = 'dark';
  let matchedPyqs = [];
  let isSidebarOpen = false;
  let activeQuestionForRecall = null;
  let lastEvaluations = {};

  // Initialize data from chrome.storage or fallback to global dataset from data/pyqData.js
  async function initData() {
    try {
      const stored = await chrome.storage.local.get([
        'pyq_questions', 
        'pyq_subjects', 
        'pyq_active_subject', 
        'pyq_theme'
      ]);

      if (stored.pyq_questions && Array.isArray(stored.pyq_questions) && stored.pyq_questions.length > 0) {
        currentQuestions = stored.pyq_questions;
      } else if (typeof INITIAL_QUESTIONS !== 'undefined') {
        currentQuestions = INITIAL_QUESTIONS;
        chrome.storage.local.set({ pyq_questions: INITIAL_QUESTIONS });
      }

      if (stored.pyq_subjects && Array.isArray(stored.pyq_subjects)) {
        currentSubjects = stored.pyq_subjects;
      } else if (typeof INITIAL_SUBJECTS !== 'undefined') {
        currentSubjects = INITIAL_SUBJECTS;
      }

      if (stored.pyq_active_subject) {
        activeSubjectId = stored.pyq_active_subject;
      }

      if (stored.pyq_theme) {
        activeTheme = stored.pyq_theme;
      }
    } catch (e) {
      console.warn('[PyqRanker] Storage read fallback:', e);
      if (typeof INITIAL_QUESTIONS !== 'undefined') currentQuestions = INITIAL_QUESTIONS;
      if (typeof INITIAL_SUBJECTS !== 'undefined') currentSubjects = INITIAL_SUBJECTS;
    }

    // Run Initial Scan on current page
    scanPageContent();
  }

  // ==========================================
  // TF-IDF / CONTENT SIMILARITY ENGINE
  // ==========================================
  const STOPWORDS = new Set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
    'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can',
    'can\'t', 'cannot', 'could', 'did', 'do', 'does', 'doing', 'don\'t', 'down', 'during', 'each', 'few',
    'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him',
    'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'let\'s', 'me', 'more',
    'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought',
    'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than',
    'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those',
    'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where',
    'which', 'while', 'who', 'whom', 'why', 'with', 'won\'t', 'would', 'you', 'your', 'yours', 'yourself'
  ]);

  function tokenize(text) {
    if (!text) return [];
    return text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOPWORDS.has(w));
  }

  function extractPageText() {
    // 1. Gather high-weight elements: Title, H1, H2, H3, Meta Description
    const title = document.title || '';
    const metaDesc = document.querySelector('meta[name="description"]')?.content || '';
    const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
      .map(h => h.innerText || '')
      .join(' ');

    // 2. Sample first 15 main paragraphs to stay fast and avoid comments/footers
    const paragraphs = Array.from(document.querySelectorAll('article p, main p, p'))
      .slice(0, 15)
      .map(p => p.innerText || '')
      .join(' ');

    return `${title} ${title} ${headings} ${headings} ${metaDesc} ${paragraphs}`;
  }

  function scoreQuestionAgainstPage(question, pageTokens, pageTokenFreq) {
    // Collect question tokens from text, keywords, and unit title
    const qTokens = tokenize(question.question);
    const kwTokens = question.expectedKeywords.flatMap(kw => tokenize(kw));
    const unitTokens = tokenize(question.unitTitle);

    let matchCount = 0;
    let keywordHits = 0;

    for (const token of qTokens) {
      if (pageTokenFreq[token]) {
        matchCount += Math.min(pageTokenFreq[token], 3);
      }
    }

    for (const token of kwTokens) {
      if (pageTokenFreq[token]) {
        keywordHits += Math.min(pageTokenFreq[token], 4);
      }
    }

    for (const token of unitTokens) {
      if (pageTokenFreq[token]) {
        matchCount += 1.5;
      }
    }

    // Weight keywords higher than general tokens
    const rawScore = (matchCount * 1.5) + (keywordHits * 3.5);
    return rawScore;
  }

  function scanPageContent(overrideText = null) {
    const textToScan = overrideText || extractPageText();
    const tokens = tokenize(textToScan);
    
    // Frequency map
    const tokenFreq = {};
    for (const t of tokens) {
      tokenFreq[t] = (tokenFreq[t] || 0) + 1;
    }

    // Score all questions in question bank
    const scored = currentQuestions.map(q => {
      const score = scoreQuestionAgainstPage(q, tokens, tokenFreq);
      return { question: q, score };
    });

    // Filter to relevant matches and sort descending
    const filtered = scored
      .filter(item => item.score > 4.5 || (item.question.isHighProbability && item.score > 2.0))
      .sort((a, b) => b.score - a.score);

    matchedPyqs = filtered.map(item => item.question);

    // If no specific match on page (e.g. blank page or general site), provide top high-probability questions
    if (matchedPyqs.length === 0) {
      matchedPyqs = currentQuestions
        .filter(q => q.subjectId === activeSubjectId)
        .slice(0, 5);
    }

    // Update Launcher & Sidebar UI
    updateLauncherPill();
    if (isSidebarOpen) {
      renderSidebarContent();
    }
  }

  // ==========================================
  // RUBRIC GRADER IN EXTENSION
  // ==========================================
  function evaluateInPageAnswer(question, answerText) {
    const trimmed = (answerText || '').trim();
    if (!trimmed) {
      return { score: 0, matchedKeywords: [], missingKeywords: [...question.expectedKeywords], wordCount: 0 };
    }

    const words = trimmed.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const lower = trimmed.toLowerCase();

    const matchedKeywords = [];
    const missingKeywords = [];

    for (const kw of question.expectedKeywords) {
      const clean = kw.toLowerCase().trim();
      if (lower.includes(clean)) {
        matchedKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    }

    const minWords = question.rubricGuide?.recommendedWordCount?.min || 50;
    const kwRatio = question.expectedKeywords.length > 0 
      ? matchedKeywords.length / question.expectedKeywords.length 
      : 1;
    
    let score = Math.round((kwRatio * 6.5 + Math.min(2.5, (wordCount / minWords) * 2.5) + (/[•\-*\d]/.test(trimmed) ? 1.0 : 0)) * 10) / 10;
    score = Math.min(10, score);

    return {
      score,
      matchedKeywords,
      missingKeywords,
      wordCount
    };
  }

  // ==========================================
  // SHADOW DOM INJECTION & ISOLATION
  // ==========================================
  const hostElement = document.createElement('div');
  hostElement.id = 'pyq-ranker-shadow-host';
  hostElement.style.cssText = 'all: initial; position: absolute; z-index: 2147483647;';
  document.body.appendChild(hostElement);

  const shadow = hostElement.attachShadow({ mode: 'open' });

  // Stylesheet inside Shadow DOM
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }

    /* Floating Launcher Pill */
    .pyq-launcher-pill {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 9999px;
      background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
      color: #FFFFFF;
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4), 0 8px 10px -6px rgba(79, 70, 229, 0.2);
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
    }
    .pyq-launcher-pill:hover {
      transform: translateY(-2px) scale(1.03);
      box-shadow: 0 15px 30px -5px rgba(79, 70, 229, 0.5);
    }
    .pyq-launcher-pill:active {
      transform: scale(0.97);
    }
    .pyq-flame-icon {
      display: inline-block;
      animation: flamePulse 1.8s ease-in-out infinite;
    }
    @keyframes flamePulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }

    /* Slide-over Sidebar Container */
    .pyq-sidebar-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(2px);
      z-index: 2147483646;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    .pyq-sidebar-overlay.open {
      opacity: 1;
      pointer-events: auto;
    }

    .pyq-sidebar {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 440px;
      max-width: 95vw;
      z-index: 2147483647;
      transform: translateX(105%);
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      box-shadow: -10px 0 35px rgba(0, 0, 0, 0.25);
    }
    .pyq-sidebar.open {
      transform: translateX(0);
    }

    /* THEMES */
    /* Solar Paper (Light Mode) */
    .theme-light {
      background: #F8FAFC;
      color: #0F172A;
      border-left: 1px solid #E2E8F0;
    }
    .theme-light .pyq-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      color: #0F172A;
    }
    .theme-light .pyq-header {
      background: rgba(255, 255, 255, 0.95);
      border-bottom: 1px solid #E2E8F0;
    }
    .theme-light .pyq-subtext {
      color: #64748B;
    }
    .theme-light .pyq-chip {
      background: #EEF2FF;
      color: #4338CA;
      border: 1px solid #C7D2FE;
    }
    .theme-light .pyq-textarea {
      background: #F1F5F9;
      color: #0F172A;
      border: 1px solid #CBD5E1;
    }

    /* Obsidian Focus (Night Mode) */
    .theme-dark {
      background: #090D16;
      color: #F8FAFC;
      border-left: 1px solid #1E293B;
    }
    .theme-dark .pyq-card {
      background: #0F172A;
      border: 1px solid #1E293B;
      color: #F8FAFC;
    }
    .theme-dark .pyq-header {
      background: rgba(15, 23, 42, 0.95);
      border-bottom: 1px solid #1E293B;
    }
    .theme-dark .pyq-subtext {
      color: #94A3B8;
    }
    .theme-dark .pyq-chip {
      background: rgba(99, 102, 241, 0.15);
      color: #A5B4FC;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    .theme-dark .pyq-textarea {
      background: #090D16;
      color: #F8FAFC;
      border: 1px solid #334155;
    }

    /* Header */
    .pyq-header {
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      backdrop-filter: blur(8px);
      flex-shrink: 0;
    }
    .pyq-brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .pyq-brand-title {
      font-size: 15px;
      font-weight: 800;
      background: linear-gradient(135deg, #6366F1, #06B6D4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .pyq-header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .pyq-btn-icon {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      color: inherit;
      opacity: 0.75;
      font-size: 15px;
      transition: all 0.2s;
    }
    .pyq-btn-icon:hover {
      opacity: 1;
      background: rgba(148, 163, 184, 0.15);
    }

    /* Quick Action Toolbar */
    .pyq-toolbar {
      padding: 10px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.15);
      font-size: 11px;
      font-weight: 600;
    }
    .pyq-btn-tool {
      padding: 5px 10px;
      border-radius: 6px;
      background: #4F46E5;
      color: white;
      border: none;
      cursor: pointer;
      font-size: 11px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .pyq-btn-tool:hover {
      background: #4338CA;
    }

    /* Body List */
    .pyq-body {
      padding: 16px 20px;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* Cards */
    .pyq-card {
      border-radius: 12px;
      padding: 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      transition: border-color 0.2s;
    }
    .pyq-card:hover {
      border-color: #6366F1;
    }
    .pyq-card-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 11px;
    }
    .pyq-badge-marks {
      padding: 2px 6px;
      border-radius: 6px;
      font-weight: 700;
      background: rgba(79, 70, 229, 0.15);
      color: #6366F1;
    }
    .pyq-badge-repeat {
      padding: 2px 6px;
      border-radius: 6px;
      font-weight: 700;
      background: rgba(244, 63, 94, 0.15);
      color: #F43F5E;
    }
    .pyq-qtext {
      font-size: 13px;
      font-weight: 600;
      line-height: 1.45;
      margin-bottom: 8px;
    }

    /* Rubric Chips */
    .pyq-chips-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-bottom: 10px;
    }
    .pyq-chip {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }

    /* Recall Box */
    .pyq-recall-box {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid rgba(148, 163, 184, 0.15);
    }
    .pyq-textarea {
      width: 100%;
      min-height: 80px;
      padding: 8px;
      border-radius: 8px;
      font-size: 12px;
      outline: none;
      resize: vertical;
      margin-bottom: 6px;
    }
    .pyq-score-banner {
      padding: 8px 10px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      margin-top: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .score-green { background: rgba(16, 185, 129, 0.15); color: #10B981; }
    .score-amber { background: rgba(245, 158, 11, 0.15); color: #F59E0B; }
    .score-red { background: rgba(244, 63, 94, 0.15); color: #F43F5E; }

    /* Footer */
    .pyq-footer {
      padding: 12px 20px;
      border-top: 1px solid rgba(148, 163, 184, 0.15);
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
  `;
  shadow.appendChild(styleTag);

  // Floating Launcher Pill Button
  const launcherPill = document.createElement('div');
  launcherPill.className = 'pyq-launcher-pill';
  launcherPill.innerHTML = `
    <span class="pyq-flame-icon">🔥</span>
    <span id="pyq-pill-text">0 PYQs Match This Page</span>
  `;
  launcherPill.addEventListener('click', toggleSidebar);
  shadow.appendChild(launcherPill);

  // Overlay
  const overlay = document.createElement('div');
  overlay.className = 'pyq-sidebar-overlay';
  overlay.addEventListener('click', toggleSidebar);
  shadow.appendChild(overlay);

  // Slide-over Sidebar
  const sidebar = document.createElement('div');
  sidebar.className = `pyq-sidebar theme-${activeTheme}`;
  shadow.appendChild(sidebar);

  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
    if (isSidebarOpen) {
      overlay.classList.add('open');
      sidebar.classList.add('open');
      renderSidebarContent();
    } else {
      overlay.classList.remove('open');
      sidebar.classList.remove('open');
    }
  }

  function updateLauncherPill() {
    const textSpan = shadow.getElementById('pyq-pill-text');
    if (textSpan) {
      const count = matchedPyqs.length;
      textSpan.textContent = count > 0 
        ? `${count} PYQs Match This Page` 
        : `Active Recall (Alt+Q)`;
    }
  }

  function renderSidebarContent() {
    sidebar.className = `pyq-sidebar theme-${activeTheme}`;
    
    sidebar.innerHTML = `
      <!-- Header -->
      <div class="pyq-header">
        <div class="pyq-brand">
          <span style="font-size: 18px;">⚡</span>
          <div>
            <div class="pyq-brand-title">PyqRanker Companion</div>
            <div class="pyq-subtext" style="font-size: 10px;">In-Page TF-IDF Syllabus Matcher</div>
          </div>
        </div>

        <div class="pyq-header-actions">
          <button class="pyq-btn-icon" id="pyq-theme-toggle" title="Toggle Day/Night Theme">
            ${activeTheme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button class="pyq-btn-icon" id="pyq-close-btn" title="Close Sidebar">
            ✕
          </button>
        </div>
      </div>

      <!-- Quick Action Toolbar -->
      <div class="pyq-toolbar">
        <div>
          <span class="pyq-subtext">Subject:</span>
          <strong>${activeSubjectId.toUpperCase()}</strong>
          <span class="pyq-subtext">(${matchedPyqs.length} matched)</span>
        </div>

        <div style="display: flex; gap: 4px;">
          <button class="pyq-btn-tool" id="pyq-scan-selection" title="Scan Highlighted Selection">
            🔍 Scan Selection
          </button>
          <button class="pyq-btn-tool" id="pyq-open-dashboard" style="background: #06B6D4;" title="Open Web Dashboard">
            🚀 Dashboard
          </button>
        </div>
      </div>

      <!-- Matched Questions List -->
      <div class="pyq-body" id="pyq-body-list">
        ${matchedPyqs.length === 0 ? `
          <div style="text-align: center; padding: 40px 10px;" class="pyq-subtext">
            <div>🔍 No relevant past questions found for this specific page.</div>
            <div style="font-size: 11px; margin-top: 8px;">Try highlighting key study text or switch subjects.</div>
          </div>
        ` : matchedPyqs.map(q => {
          const evalResult = lastEvaluations[q.id];
          return `
            <div class="pyq-card" data-qid="${q.id}">
              <div class="pyq-card-meta">
                <span class="pyq-badge-marks">${q.marks} Marks • U${q.unit}</span>
                ${q.repeatCount >= 3 ? `<span class="pyq-badge-repeat">🔥 Asked ${q.repeatCount}x</span>` : `<span class="pyq-subtext">Asked ${q.repeatCount}x</span>`}
              </div>

              <div class="pyq-qtext">${q.question}</div>

              <!-- Rubric Chips -->
              <div class="pyq-chips-wrap">
                ${q.expectedKeywords.map(k => `<span class="pyq-chip">${k}</span>`).join('')}
              </div>

              <!-- Active Recall Box -->
              <div class="pyq-recall-box">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; font-size: 11px;">
                  <span class="pyq-subtext">Test Active Recall:</span>
                  <button class="pyq-btn-tool" style="padding: 2px 6px; font-size: 10px; background: transparent; border: 1px solid rgba(148,163,184,0.4); color: inherit;" data-action="pin-highlight" data-qid="${q.id}">
                    📌 Attach Selection as Note
                  </button>
                </div>

                <textarea class="pyq-textarea" placeholder="Type brief answer bullets here to grade yourself against rubric keywords..." id="textarea-${q.id}">${q.lastAttemptAnswer || ''}</textarea>

                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <button class="pyq-btn-tool" data-action="check-rubric" data-qid="${q.id}">
                    ✓ Check Rubric
                  </button>
                  <button class="pyq-btn-icon" style="font-size: 11px; text-decoration: underline;" data-action="show-model" data-qid="${q.id}">
                    Show Model Key
                  </button>
                </div>

                ${evalResult ? `
                  <div class="pyq-score-banner ${evalResult.score >= 7.5 ? 'score-green' : evalResult.score >= 5 ? 'score-amber' : 'score-red'}">
                    <span>Score: ${evalResult.score}/10 (${evalResult.wordCount} words)</span>
                    <span>${evalResult.matchedKeywords.length}/${q.expectedKeywords.length} Keywords Hit</span>
                  </div>
                ` : ''}

                <div id="model-${q.id}" style="display: none; margin-top: 8px; padding: 8px; border-radius: 6px; font-size: 11px; line-height: 1.4; background: rgba(79, 70, 229, 0.1);">
                  <strong>Model Key:</strong> ${q.modelAnswerSummary}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Footer -->
      <div class="pyq-footer">
        <span class="pyq-subtext">Keyboard Shortcut: <code style="font-weight: 700;">Alt + Q</code></span>
        <span style="color: #10B981; font-weight: 600;">● Sync Live</span>
      </div>
    `;

    // Attach Event Listeners
    shadow.getElementById('pyq-close-btn')?.addEventListener('click', toggleSidebar);
    shadow.getElementById('pyq-theme-toggle')?.addEventListener('click', () => {
      activeTheme = activeTheme === 'dark' ? 'light' : 'dark';
      chrome.storage.local.set({ pyq_theme: activeTheme });
      renderSidebarContent();
    });

    shadow.getElementById('pyq-open-dashboard')?.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'OPEN_WEB_DASHBOARD', url: 'http://localhost:5173' });
    });

    shadow.getElementById('pyq-scan-selection')?.addEventListener('click', () => {
      const selected = window.getSelection()?.toString() || '';
      if (selected.trim().length > 5) {
        scanPageContent(selected);
      } else {
        alert('Please select or highlight text on the web page first to scan!');
      }
    });

    // Check Rubric Buttons
    shadow.querySelectorAll('[data-action="check-rubric"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const qid = e.target.getAttribute('data-qid');
        const textarea = shadow.getElementById(`textarea-${qid}`);
        const q = currentQuestions.find(item => item.id === qid);
        if (q && textarea) {
          const evalResult = evaluateInPageAnswer(q, textarea.value);
          lastEvaluations[qid] = evalResult;
          q.lastAttemptAnswer = textarea.value;
          q.lastAttemptScore = evalResult.score;
          // Save to chrome storage
          chrome.storage.local.set({ pyq_questions: currentQuestions });
          renderSidebarContent();
        }
      });
    });

    // Show Model Key Buttons
    shadow.querySelectorAll('[data-action="show-model"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const qid = e.target.getAttribute('data-qid');
        const box = shadow.getElementById(`model-${qid}`);
        if (box) {
          box.style.display = box.style.display === 'none' ? 'block' : 'none';
        }
      });
    });

    // Pin Highlight as Note Buttons
    shadow.querySelectorAll('[data-action="pin-highlight"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const qid = e.target.getAttribute('data-qid');
        const selected = window.getSelection()?.toString() || '';
        if (!selected.trim()) {
          alert('Highlight some text on this webpage first to pin as a study note!');
          return;
        }

        const q = currentQuestions.find(item => item.id === qid);
        if (q) {
          q.userNotes = q.userNotes ? `${q.userNotes}\n\n[Web Clip]: ${selected}` : `[Web Clip]: ${selected}`;
          chrome.storage.local.set({ pyq_questions: currentQuestions });
          // Dispatch to localhost dashboard if open
          window.postMessage({ type: 'PYQ_PIN_NOTE', payload: { questionId: qid, note: selected } }, '*');
          alert(`Pinned text snippet to "${q.question.slice(0, 30)}..."!`);
        }
      });
    });
  }

  // ==========================================
  // SEAMLESS WEB-TO-EXTENSION SYNC BRIDGE
  // ==========================================
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PYQ_SYNC_DATA') {
      const payload = event.data.payload;
      if (payload && Array.isArray(payload.questions)) {
        currentQuestions = payload.questions;
        activeSubjectId = payload.activeSubjectId || activeSubjectId;
        activeTheme = payload.theme || activeTheme;

        // Persist to chrome.storage.local
        chrome.storage.local.set({
          pyq_questions: currentQuestions,
          pyq_active_subject: activeSubjectId,
          pyq_theme: activeTheme,
          pyq_last_synced: Date.now()
        }, () => {
          // Acknowledge back to web dashboard
          window.postMessage({ type: 'PYQ_EXTENSION_ACK', timestamp: Date.now() }, '*');
        });

        // Re-scan with newly synchronized questions
        scanPageContent();
      }
    }
  });

  // Listen for messages from background.js
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'TOGGLE_SIDEBAR') {
      toggleSidebar();
      sendResponse({ status: 'ok' });
    }
    if (msg.type === 'SCAN_PAGE_AND_OPEN') {
      scanPageContent();
      if (!isSidebarOpen) toggleSidebar();
      sendResponse({ status: 'ok' });
    }
  });

  // Start initialization
  initData();

})();
