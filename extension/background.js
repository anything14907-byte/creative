// PyqRanker Background Service Worker (Manifest V3)

// Import default data if needed or initialize storage
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[PyqRanker] Extension installed/updated:', details.reason);
  
  // Check if questions are already stored
  const data = await chrome.storage.local.get(['pyq_questions', 'pyq_active_subject', 'pyq_theme']);
  
  if (!data.pyq_questions) {
    // If empty, will be initialized from data/pyqData.js via content script or popup
    console.log('[PyqRanker] Storage initialized.');
  }
});

// Keyboard shortcut listener (Alt + Q)
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle_pyq_sidebar') {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab && activeTab.id) {
      chrome.tabs.sendMessage(activeTab.id, { type: 'TOGGLE_SIDEBAR' }).catch(() => {
        // Tab might be chrome:// or restricted
      });
    }
  }
});

// Message listener from popup or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_WEB_DASHBOARD') {
    chrome.tabs.create({ url: message.url || 'http://localhost:5173' });
    sendResponse({ status: 'ok' });
    return true;
  }
  
  if (message.type === 'TRIGGER_PAGE_SCAN') {
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab && tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'SCAN_PAGE_AND_OPEN' });
      }
    });
    sendResponse({ status: 'ok' });
    return true;
  }
});
