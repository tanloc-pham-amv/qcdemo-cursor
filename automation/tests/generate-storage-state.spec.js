const { test, expect } = require('@playwright/test');
const { chromium } = require('playwright');

function joinUrl(baseUrl, path) {
  if (!path) return baseUrl;
  const base = baseUrl.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

function env(name) {
  return process.env[name];
}

test('Generate storageState.json after Google SSO (manual once)', async () => {
  const shouldGenerate = String(env('GENERATE_STORAGE_STATE') || '').toLowerCase() === 'true';
  test.skip(!shouldGenerate, 'Set GENERATE_STORAGE_STATE=true to generate storage state.');

  const baseUrl = env('BASE_URL');
  if (!baseUrl) throw new Error('Missing BASE_URL env var.');

  const loginPath = env('LOGIN_PATH') || '/login';
  const loggedInUrlContains = env('LOGGED_IN_URL_CONTAINS') || '/room';
  const storageStatePath = env('PLAYWRIGHT_STORAGE_STATE') || './storageState.json';

  const storageStateResolved = require('path').resolve(process.cwd(), storageStatePath);
  const headless = String(env('HEADLESS') || '').toLowerCase() === 'true';
  const userDataDir = require('path').resolve(process.cwd(), env('PLAYWRIGHT_USER_DATA_DIR') || '.tmp-playwright-user-data');

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless,
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();
  await page.goto(joinUrl(baseUrl, loginPath), { waitUntil: 'domcontentloaded' });

  // Optional: try clicking the Google login button if it exists.
  const googleBtnSelector =
    env('GOOGLE_SSO_BUTTON_SELECTOR') ||
    'a:has-text("Google"), button:has-text("Google"), a:has-text("Googleでログイン"), button:has-text("Googleでログイン")';
  const googleBtn = page.locator(googleBtnSelector).first();
  if (await googleBtn.count().then((c) => c > 0).catch(() => false)) {
    // Some SSO flows open a popup; try to capture it.
    const popupPromise = page.waitForEvent('popup').catch(() => null);
    await googleBtn.click().catch(() => {});
    const popup = await popupPromise;
    if (popup) {
      await popup.bringToFront().catch(() => {});
      // Wait on the popup URL instead of the parent (best effort).
      const timeoutMs = Number(env('SSO_TIMEOUT_MS') || 10 * 60 * 1000);
      await popup.waitForFunction(
        (needle) => window.location.href.includes(needle),
        loggedInUrlContains,
        { timeout: timeoutMs }
      ).catch(() => {});
    }
  }

  // Pause until the app redirects back to the room list.
  // This requires manual SSO completion at least once.
  const timeoutMs = Number(env('SSO_TIMEOUT_MS') || 10 * 60 * 1000);
  await page.waitForFunction(
    (needle) => window.location.href.includes(needle),
    loggedInUrlContains,
    { timeout: timeoutMs }
  );

  // Save cookies/session for the rest of the suite.
  await context.storageState({ path: storageStateResolved });
  await context.close();

  // Simple assertion for confidence.
  expect(page.url()).toContain(loggedInUrlContains);
});

