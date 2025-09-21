// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Розширенням потрібне «вікно», тому за замовчуванням headed.
  use: {
    headless: false,
    channel: 'chromium', // стабільно для розширень; у Docker можна headless з цим каналом
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  // за бажанням можна додати таймаути:
  // timeout: 90_000,
  // expect: { timeout: 10_000 },
});

