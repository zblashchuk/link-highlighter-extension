(() => {
  try {
    // Корисно для автотестів/діагностики: покласти ID розширення в DOM
    try {
      document.documentElement.setAttribute('data-link-hl-ext', chrome.runtime.id);
    } catch (_) {}

    // --- 0) Один раз додаємо CSS із високим пріоритетом ---
    function ensureStyle() {
      if (document.getElementById('lh-style')) return;
      const style = document.createElement('style');
      style.id = 'lh-style';
      style.textContent = `
        /* Яскрава підсвітка та контур, важко "перебити" стилями сайту */
        .lh-mark, .lh-mark * {
          background-color: yellow !important;
        }
        .lh-outline {
          outline: 2px solid #FFD400 !important;
          outline-offset: 2px !important;
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    }

    // --- 1) Підсвітити один лінк (та позначити, що вже підсвічено) ---
    function markLink(el) {
      if (!el || el.__lhMarked) return;
      el.classList.add('lh-mark', 'lh-outline');
      el.__lhMarked = true;
    }

    // --- 2) Підсвітити всі лінки у корені (document або shadowRoot) ---
    function paintLinksInRoot(root) {
      const scope = (root instanceof Document || root instanceof ShadowRoot) ? root : document;
      // Підсвічуємо <a> та елементи з роллю "link"
      const links = scope.querySelectorAll('a, [role="link"]');
      links.forEach(markLink);
    }

    // --- 3) Глибокий прохід: відкриті shadowRoot також фарбуємо ---
    function paintDeep(root) {
      paintLinksInRoot(root);
      const walker = document.createTreeWalker(document, NodeFilter.SHOW_ELEMENT);
      let node;
      while ((node = walker.nextNode())) {
        if (node.shadowRoot) paintLinksInRoot(node.shadowRoot);
      }
    }

    // --- 4) Основна дія: підсвітити вже наявні та майбутні лінки ---
    function highlight() {
      ensureStyle();
      paintDeep(document);

      // Слідкуємо за динамічними вставками (SPA, lazy-load)
      if (!window.__lhObserver) {
        window.__lhObserver = new MutationObserver(muts => {
          for (const m of muts) {
            m.addedNodes.forEach(node => {
              if (node.nodeType !== 1) return;

              // Якщо додали сам <a> або "лінкоподібний" елемент
              if (node.matches?.('a, [role="link"]')) markLink(node);

              // Якщо всередині доданого вузла є лінки
              const inner = node.querySelectorAll?.('a, [role="link"]');
              inner?.forEach(markLink);

              // Якщо додали елемент із відкритим shadowRoot
              if (node.shadowRoot) paintLinksInRoot(node.shadowRoot);
            });
          }
        });
        window.__lhObserver.observe(document.documentElement, { childList: true, subtree: true });
      }
    }

    // --- 5) Реальний сценарій: клік по іконці -> background шле повідомлення ---
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg?.type === 'HIGHLIGHT_LINKS') {
        try { highlight(); } catch (e) { console.warn('Highlight error:', e); }
      }
    });

    // --- 6) E2E-режим для автотестів: кнопка з’являється лише при #e2e ---
    if (location.hash.includes('e2e')) {
      let btn = document.querySelector('[data-e2e-hl]');
      if (!btn) {
        btn = document.createElement('button');
        btn.textContent = 'E2E: Highlight links';
        btn.setAttribute('data-e2e-hl', '1');
        Object.assign(btn.style, {
          position: 'fixed',
          zIndex: 2147483647,
          right: '12px',
          bottom: '12px',
          padding: '8px 12px',
          fontSize: '12px',
          cursor: 'pointer'
        });
        btn.onclick = () => { try { highlight(); } catch (e) { console.warn(e); } };
        document.documentElement.appendChild(btn);
      }
    }
  } catch (e) {
    console.warn('Content script init error:', e);
  }
})();
