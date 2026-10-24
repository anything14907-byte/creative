// PyqRanker Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  const themeToggle = document.getElementById('theme-toggle');
  const subjectSelect = document.getElementById('subject-select');
  const totalPyqsEl = document.getElementById('total-pyqs');
  const hotPyqsEl = document.getElementById('hot-pyqs');
  const scanBtn = document.getElementById('scan-tab-btn');
  const openDashboardBtn = document.getElementById('open-dashboard-btn');
  const exportBtn = document.getElementById('export-btn');
  const importBtn = document.getElementById('import-btn');
  const fileInput = document.getElementById('file-input');

  let questions = [];
  let currentTheme = 'dark';
  let currentSubject = 'os';

  // Load from chrome.storage
  try {
    const data = await chrome.storage.local.get([
      'pyq_questions', 
      'pyq_active_subject', 
      'pyq_theme'
    ]);

    if (data.pyq_questions && Array.isArray(data.pyq_questions) && data.pyq_questions.length > 0) {
      questions = data.pyq_questions;
    } else if (typeof INITIAL_QUESTIONS !== 'undefined') {
      questions = INITIAL_QUESTIONS;
      chrome.storage.local.set({ pyq_questions: INITIAL_QUESTIONS });
    }

    if (data.pyq_active_subject) {
      currentSubject = data.pyq_active_subject;
    }
    if (data.pyq_theme) {
      currentTheme = data.pyq_theme;
    }
  } catch (e) {
    if (typeof INITIAL_QUESTIONS !== 'undefined') questions = INITIAL_QUESTIONS;
  }

  // Update theme
  applyTheme(currentTheme);

  // Update UI stats
  updateStats();

  // Subject selector listener
  subjectSelect.value = currentSubject;
  subjectSelect.addEventListener('change', () => {
    currentSubject = subjectSelect.value;
    chrome.storage.local.set({ pyq_active_subject: currentSubject });
    updateStats();
  });

  // Theme toggle listener
  themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
    chrome.storage.local.set({ pyq_theme: currentTheme });
  });

  function applyTheme(theme) {
    document.body.className = `theme-${theme}`;
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  function updateStats() {
    const subjectQuestions = questions.filter(q => q.subjectId === currentSubject);
    const hotCount = subjectQuestions.filter(q => q.isHighProbability || q.repeatCount >= 3).length;

    totalPyqsEl.textContent = subjectQuestions.length;
    hotPyqsEl.textContent = hotCount;
  }

  // Scan current page
  scanBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'TRIGGER_PAGE_SCAN' });
    window.close();
  });

  // Open Dashboard
  openDashboardBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_WEB_DASHBOARD', url: 'http://localhost:5173' });
    window.close();
  });

  // Export JSON Snapshot
  exportBtn.addEventListener('click', () => {
    const snapshot = {
      exportedAt: new Date().toISOString(),
      appName: 'PyqRanker Extension',
      version: '1.0.0',
      activeSubjectId: currentSubject,
      questionsCount: questions.length,
      questions
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PyqRanker_Extension_Backup_${currentSubject.toUpperCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Import JSON Snapshot
  importBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        const imported = Array.isArray(parsed) ? parsed : (parsed.questions || []);
        if (imported.length > 0) {
          questions = imported;
          chrome.storage.local.set({ pyq_questions: imported });
          updateStats();
          alert(`Imported ${imported.length} questions successfully!`);
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  });

});
