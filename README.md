Link Highlighter (MV3) + Playwright

Chrome-розширення, яке підсвічує всі посилання на активній вкладці після кліку по іконці розширення в тулбарі.
Для автотестів є e2e-гачок: якщо у URL сторінки є #e2e, контент-скрипт показує кнопку “E2E: Highlight links”, яка запускає ту саму логіку, що і клік по іконці.

Вміст

extension/manifest.json — налаштування MV3 (іконка, background, content script).

extension/background.js — слухає клік по іконці та надсилає повідомлення сторінці.

extension/content.js — підсвічує посилання, вміє показувати e2e-кнопку, тримає підсвітку “липкою” для SPA.

extension/icons/ — іконки 16/48/128.

tests/extension.spec.ts — 2 тести Playwright під реальний флоу.

package.json, playwright.config.ts — залежності й конфіг для тестів.

Вимоги

Node.js LTS (рекомендовано 20+; мінімум 18.19 для ESM-конфігів).

npm (йде разом із Node).

Chromium ставиться автоматично через Playwright.

Установка залежностей
npm i
npx playwright install chromium

Як запустити розширення вручну

Відкрий chrome://extensions → увімкни Developer mode (праворуч вгорі).

Натисни Load unpacked → вибери папку extension/.

(Опційно для file:// сторінок) У Details вмикай Allow access to file URLs.

Закріпи іконку (іконка-пазл → Pin).

Відкрий будь-який сайт зі лінками → клікни іконку розширення → посилання підсвітяться.

На chrome://*, у Chrome Web Store, на data:/about: сторінках розширення не працюють (обмеження Chrome).

Як прогнати тести
npm test


Тести роблять два сценарії:

example.com#e2e → клік по кнопці “E2E: Highlight links” → перевірка, що хоча б одна <a> має жовтий фон.

example.com#e2e → спочатку видаляємо всі <a> (імітуємо сторінку без лінків) → клік по кнопці → перевірка, що нічого не зламалося і <a> залишилось 0.

Тести запускаються у вікні (headed), бо розширення не працюють у headless. У конфігу Playwright виставлено headless: false.

Архітектура та події

Користувач: клік по іконці розширення → background.js шле { type: 'HIGHLIGHT_LINKS' } на активну вкладку.

Сторінка: content.js слухає повідомлення → підсвічує <a> та [role="link"], ставить outline і background з !important, обходить shadow DOM, слідкує MutationObserver, аби підсвічувати нові лінки (SPA).

E2E: якщо location.hash містить #e2e, контент-скрипт додає кнопку “E2E: Highlight links”, яка запускає ту саму функцію підсвітки.

Відомі обмеження

Не працює на: chrome://*, Chrome Web Store, data: / about: / частина blob: сторінок.

Для file:// ввімкни Allow access to file URLs в деталях розширення.

У sandbox-iframe без allow-scripts скрипти заборонені — туди не дістатися.

Закритий shadow DOM (closed) недоступний програмно.

Деякі сайти можуть мати агресивні стилі; ми вже використовуємо !important і outline, щоб максимально “пробити” стилі.

Типові проблеми та рішення

Node/ESM помилка (Playwright вимагає 18.19+): онови Node до LTS (рекомендовано 20+).
Тимчасовий варіант — CommonJS конфіг playwright.config.cjs + прибрати "type":"module" з package.json.

“Нічого не підсвічується вручну”: переконайся, що ти клікаєш іконку розширення на сайті з лінками; перезавантаж розширення (Reload) після змін у файлах.

На деяких сайтах не видно ефекту: перевір елемент у DevTools → Styles. Ми додаємо класи .lh-mark, .lh-outline та !important. Якщо фон перекритий, має бути видно хоча б outline.

У тестах не з’являється кнопка: відкривай сторінку з #e2e у URL (наприклад, https://example.com#e2e).

Структура проєкту
<корінь_проєкту>/
├─ extension/
│  ├─ manifest.json
│  ├─ background.js
│  ├─ content.js
│  └─ icons/
│     ├─ icon16.png
│     ├─ icon48.png
│     └─ icon128.png
├─ tests/
│  └─ extension.spec.ts
├─ package.json
├─ playwright.config.ts     # або .cjs, якщо старий Node
├─ .gitignore
└─ README.md


![CI](https://github.com/zblashchuk/link-highlighter-extension/actions/workflows/tests.yml/badge.svg)
![CD](https://github.com/zblashchuk/link-highlighter-extension/actions/workflows/release.yml/badge.svg)
