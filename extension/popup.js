async function highlight() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true }, // захватываем ссылки и во фреймах
      func: () => {
        try {
          const paint = (root) => {
            // подсветка ссылок в документе/теневых корнях
            const links = (root instanceof Document || root instanceof ShadowRoot)
              ? root.querySelectorAll('a')
              : [];
            links.forEach(a => {
              a.style.background = 'yellow';
              a.style.padding = '2px 4px';
            });

            // обойти shadow DOM
            const walker = document.createTreeWalker(document, NodeFilter.SHOW_ELEMENT);
            let node;
            while ((node = walker.nextNode())) {
              if (node.shadowRoot) paint(node.shadowRoot);
            }
          };
          paint(document);
        } catch (e) {
          console.warn('Highlight error:', e);
        }
      }
    });

    // По желанию можно закрывать попап сразу после действия:
    // window.close();
  } catch (e) {
    console.warn('Popup highlight error:', e);
  }
}

document.getElementById('highlight').addEventListener('click', highlight);
