import { test, expect, chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const extensionPath = path.join(process.cwd(), 'extension');
test.setTimeout(90_000);

test.beforeAll(() => {
  const manifest = path.join(extensionPath, 'manifest.json');
  if (!fs.existsSync(manifest)) {
    throw new Error('extension/manifest.json не найден — проверь структуру проекта.');
  }
});

// Проверка, что контент-скрипт активен
async function ensureContentActive(page) {
  const extId = await page.evaluate(() => document.documentElement.getAttribute('data-link-hl-ext'));
  if (!extId) throw new Error('Нет data-link-hl-ext — content.js не подключился. Проверь manifest.content_scripts.');
  return extId;
}

/// --- Test 1: simulate user flow via on-page button (same logic as toolbar click)
test('Simulate user: clicking the on-page button highlights links', async () => {
  const context = await chromium.launchPersistentContext('./.tmp-e2e-1', {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ]
  });

  try {
    const page = await context.newPage();
    await page.goto('https://example.com#e2e');
    await ensureContentActive(page);

    // Click the E2E button (invokes the same highlight() logic as toolbar click)
    await page.getByRole('button', { name: /E2E: Highlight links/i }).click();

    // At least one <a> should be highlighted (yellow background)
    await page.waitForFunction(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links.some(a => getComputedStyle(a).backgroundColor === 'rgb(255, 255, 0)');
    });
  } finally {
    await context.close();
  }
});

// --- Test 2: page without links stays intact after click
test('Page without links stays intact on click', async () => {
  const context = await chromium.launchPersistentContext('./.tmp-e2e-2', {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ]
  });

  try {
    const page = await context.newPage();
    await page.goto('https://example.com#e2e');
    await ensureContentActive(page);

    // Remove all links to simulate "no links" page
    await page.evaluate(() => {
      document.querySelectorAll('a').forEach(a => a.remove());
    });

    // Sanity check: there are 0 links
    let count = await page.$$eval('a', links => links.length);
    expect(count).toBe(0);

    // Click E2E button — should not break anything
    await page.getByRole('button', { name: /E2E: Highlight links/i }).click();

    // Still 0 links and no crash
    count = await page.$$eval('a', links => links.length);
    expect(count).toBe(0);
  } finally {
    await context.close();
  }
});