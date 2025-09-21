chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { type: 'HIGHLIGHT_LINKS' });
  } catch (e) {
    console.warn('Could not send highlight message:', e);
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('Link Highlighter installed');
});
