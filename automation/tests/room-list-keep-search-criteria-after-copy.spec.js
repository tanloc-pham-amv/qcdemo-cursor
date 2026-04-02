const { test, expect } = require('@playwright/test');

function joinUrl(baseUrl, path) {
  if (!path) return baseUrl;
  const base = baseUrl.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

function env(name) {
  return process.env[name];
}

async function waitForRoomListToRender(page) {
  // Generic "something rendered" wait. Update selectors if your DOM differs.
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  const rows = page.locator('table tbody tr, [role="row"]');
  await expect(rows.first()).toBeVisible({ timeout: 15000 });
}

function getInputSelector(fallbacks) {
  // Allow overriding each selector with a specific env var:
  // e.g. PROPERTY_CODE_INPUT_SELECTOR to avoid having to touch the code.
  // Provide only one env override per test run.
  return env(fallbacks.envName) || fallbacks.selector;
}

async function fillAndSearch(page, inputLocator, value) {
  await inputLocator.fill('');
  await inputLocator.fill(value);

  // After entering search conditions, click 検索 / Search (or fallback to Enter).
  // You can override this selector via SEARCH_BUTTON_SELECTOR if needed.
  const searchButtonSelector =
    env('SEARCH_BUTTON_SELECTOR') ||
    'button:has-text("検索"), button:has-text("Search"), input[type="submit"]:has-text("検索"), input[type="submit"]:has-text("Search")';

  const btn = page.locator(searchButtonSelector).first();
  if ((await btn.count()) > 0) {
    await btn.click();
  } else {
    await inputLocator.press('Enter');
  }
}

async function waitForListUpdate(page) {
  const rows = page.locator('table tbody tr, [role="row"]');
  // Wait until there is at least one row. This is intentionally minimal to avoid brittle assumptions.
  await expect(rows.first()).toBeVisible({ timeout: 15000 });
}

async function findFirstRow(page) {
  const rows = page.locator('table tbody tr, [role="row"]');
  await expect(rows.first()).toBeVisible({ timeout: 15000 });
  return rows.first();
}

async function clickCopyForFirstVisibleRow(page) {
  const copyButtonSelector = env('COPY_BUTTON_SELECTOR');
  if (copyButtonSelector) {
    const btn = page.locator(copyButtonSelector).first();
    await btn.click();
    return;
  }

  const row = await findFirstRow(page);
  const copyBtn = row.locator('button, [role="button"]').filter({ hasText: /コピー|Copy/i }).first();
  await expect(copyBtn).toBeVisible({ timeout: 5000 });
  await copyBtn.click();
}

async function handlePossibleCopyDialog(page) {
  const dialog = page.locator('[role="dialog"], .modal').first();
  if (!(await dialog.isVisible().catch(() => false))) return;

  // Confirm/cancel button names vary by product. Click the most likely "OK/Copy/Yes/確定".
  const candidates = [
    /OK/i,
    /Yes/i,
    /Copy/i,
    /コピー/i,
    /はい/i,
    /確定/i,
    /実行/i,
  ];

  const btns = dialog.locator('button, [role="button"]');
  const count = await btns.count();
  for (let i = 0; i < count; i++) {
    const b = btns.nth(i);
    const text = (await b.innerText().catch(() => '')).trim();
    if (!text) continue;
    if (candidates.some((re) => re.test(text))) {
      await b.click();
      break;
    }
  }

  // Let UI settle; dialog may close or the app may navigate.
  await page.waitForTimeout(800);
}

async function reloadAndWait(page) {
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForRoomListToRender(page);
}

async function expectInputValue(page, selector, expected) {
  const input = page.locator(selector).first();
  await expect(input).toBeVisible({ timeout: 15000 });
  await expect(input).toHaveValue(expected);
}

async function expectAnyRowContains(page, expectedText) {
  const rows = page.locator('table tbody tr, [role="row"]');
  const rowCount = await rows.count();
  expect(rowCount).toBeGreaterThan(0);

  const maxScan = Math.min(20, rowCount);
  const lowerNeedle = String(expectedText).toLowerCase();
  for (let i = 0; i < maxScan; i++) {
    const t = (await rows.nth(i).innerText().catch(() => '')).toLowerCase();
    if (t.includes(lowerNeedle)) return;
  }

  throw new Error(`No visible row contained text "${expectedText}" (scanned ${maxScan} rows).`);
}

async function expectAnyRowContainsAll(page, expectedTexts) {
  const rows = page.locator('table tbody tr, [role="row"]');
  const rowCount = await rows.count();
  expect(rowCount).toBeGreaterThan(0);

  const maxScan = Math.min(20, rowCount);
  const needles = expectedTexts.map((t) => String(t).toLowerCase());
  for (let i = 0; i < maxScan; i++) {
    const t = (await rows.nth(i).innerText().catch(() => '')).toLowerCase();
    if (needles.every((n) => t.includes(n))) return;
  }

  throw new Error(`No visible row contained all: ${needles.join(', ')} (scanned ${maxScan} rows).`);
}

test.describe('Room list - Keep search criteria after Copy', () => {
  const baseUrl = env('BASE_URL');
  if (!baseUrl) throw new Error('Missing BASE_URL env var (e.g. http://localhost:3000).');

  const roomListPath = env('ROOM_LIST_PATH') || '/room-list';
  const roomListUrl = joinUrl(baseUrl, roomListPath);

  const loginPath = env('LOGIN_PATH') || '/login';

  const propertyCode = env('TEST_PROPERTY_CODE');
  const propertyName = env('TEST_PROPERTY_NAME');
  const propertyNameKana = env('TEST_PROPERTY_NAME_KANA');

  const propertyCodeInputSelector = getInputSelector({
    envName: 'PROPERTY_CODE_INPUT_SELECTOR',
    selector:
      'input[name*="propertyCode" i], input[id="propertyCode" i], input[placeholder*="物件コード" i], input[aria-label*="物件コード" i]'
  });
  const propertyNameInputSelector = getInputSelector({
    envName: 'PROPERTY_NAME_INPUT_SELECTOR',
    selector:
      'input[name*="propertyName" i], input[id="propertyName" i], input[placeholder*="物件名" i]:not([placeholder*="物件名カナ" i]), input[aria-label*="物件名" i]:not([aria-label*="物件名カナ" i])'
  });
  const propertyNameKanaInputSelector = getInputSelector({
    envName: 'PROPERTY_NAME_KANA_INPUT_SELECTOR',
    selector:
      'input[name*="propertyNameKana" i], input[id="propertyNameKana" i], input[placeholder*="物件名カナ" i], input[aria-label*="物件名カナ" i]'
  });

  test.beforeEach(async ({ page }, testInfo) => {
    await page.goto(roomListUrl);
    // If cookies/session are missing or expired, Google SSO flow may land you back on /login.
    if (page.url().includes(loginPath)) {
      const title = testInfo.title || '';
      const isTC1 = title.includes('TC-1');
      const isTC2 = title.includes('TC-2');
      const isTC3 = title.includes('TC-3');
      const isTC4 = title.includes('TC-4');
      const isTC5 = title.includes('TC-5');
      const isTC6 = title.includes('TC-6');

      // If this specific TC would be skipped anyway due to missing search data,
      // avoid failing it for authentication reasons.
      const missingRequiredData =
        (isTC1 && !propertyCode) ||
        (isTC2 && !propertyName) ||
        (isTC3 && !propertyNameKana) ||
        (isTC4 && (!propertyCode || !propertyName)) ||
        (isTC6 && !propertyName);

      if (missingRequiredData) {
        testInfo.skip('Not logged in, but this TC is skipped due to missing TEST_PROPERTY_* values.');
        return;
      }

      throw new Error(
        `Not logged in (redirected to ${loginPath}). ` +
          `Run the generator once: set GENERATE_STORAGE_STATE=true, then execute ` +
          `'tests/generate-storage-state.spec.js' to create ${process.env.PLAYWRIGHT_STORAGE_STATE || './storageState.json'}.`
      );
    }
    await waitForRoomListToRender(page);
  });

  test('TC-1: Property code is retained after Copy', async ({ page }) => {
    test.skip(!propertyCode, 'Set TEST_PROPERTY_CODE to a real value existing in your dataset.');

    const codeInput = page.locator(propertyCodeInputSelector).first();
    await fillAndSearch(page, codeInput, propertyCode);
    await waitForListUpdate(page);
    await expectAnyRowContains(page, propertyCode);

    await clickCopyForFirstVisibleRow(page);
    await handlePossibleCopyDialog(page);
    await reloadAndWait(page);

    await expectInputValue(page, propertyCodeInputSelector, propertyCode);
    await expectAnyRowContains(page, propertyCode);
  });

  test('TC-2: Property name is retained after Copy', async ({ page }) => {
    test.skip(!propertyName, 'Set TEST_PROPERTY_NAME to a real value existing in your dataset.');

    const nameInput = page.locator(propertyNameInputSelector).first();
    await fillAndSearch(page, nameInput, propertyName);
    await waitForListUpdate(page);
    await expectAnyRowContains(page, propertyName);

    await clickCopyForFirstVisibleRow(page);
    await handlePossibleCopyDialog(page);
    await reloadAndWait(page);

    await expectInputValue(page, propertyNameInputSelector, propertyName);
    await expectAnyRowContains(page, propertyName);
  });

  test('TC-3: Property name Kana is retained after Copy', async ({ page }) => {
    test.skip(!propertyNameKana, 'Set TEST_PROPERTY_NAME_KANA to a real value existing in your dataset.');

    const kanaInput = page.locator(propertyNameKanaInputSelector).first();
    await fillAndSearch(page, kanaInput, propertyNameKana);
    await waitForListUpdate(page);
    await expectAnyRowContains(page, propertyNameKana);

    await clickCopyForFirstVisibleRow(page);
    await handlePossibleCopyDialog(page);
    await reloadAndWait(page);

    await expectInputValue(page, propertyNameKanaInputSelector, propertyNameKana);
    await expectAnyRowContains(page, propertyNameKana);
  });

  test('TC-4: Search with multiple conditions is retained after Copy', async ({ page }) => {
    test.skip(!propertyCode || !propertyName, 'Set TEST_PROPERTY_CODE and TEST_PROPERTY_NAME.');

    const codeInput = page.locator(propertyCodeInputSelector).first();
    const nameInput = page.locator(propertyNameInputSelector).first();
    await codeInput.fill('');
    await codeInput.fill(propertyCode);
    await nameInput.fill('');
    await nameInput.fill(propertyName);

    // Use the same "検索 / Search" behavior as other TCs.
    const searchButtonSelector =
      env('SEARCH_BUTTON_SELECTOR') ||
      'button:has-text("検索"), button:has-text("Search"), input[type="submit"]:has-text("検索"), input[type="submit"]:has-text("Search")';
    const btn = page.locator(searchButtonSelector).first();
    if ((await btn.count()) > 0) await btn.click();
    else await nameInput.press('Enter');
    await waitForListUpdate(page);
    await expectAnyRowContainsAll(page, [propertyCode, propertyName]);

    await clickCopyForFirstVisibleRow(page);
    await handlePossibleCopyDialog(page);
    await reloadAndWait(page);

    await expectInputValue(page, propertyCodeInputSelector, propertyCode);
    await expectInputValue(page, propertyNameInputSelector, propertyName);
    await expectAnyRowContainsAll(page, [propertyCode, propertyName]);
  });

  test('TC-5: No search conditions is retained after Copy', async ({ page }) => {
    // Preconditions: inputs empty.
    await page.locator(propertyCodeInputSelector).first().fill('');
    await page.locator(propertyNameInputSelector).first().fill('');
    await page.locator(propertyNameKanaInputSelector).first().fill('');

    // Click 検索 / Search with empty conditions (should show all records).
    const searchBtnSel =
      env('SEARCH_BUTTON_SELECTOR') ||
      'button:has-text("検索"), button:has-text("Search"), input[type="submit"]:has-text("検索"), input[type="submit"]:has-text("Search")';
    const btn = page.locator(searchBtnSel).first();
    if ((await btn.count()) > 0) await btn.click();
    else await page.locator(propertyNameInputSelector).first().press('Enter').catch(() => {});

    await waitForListUpdate(page);
    await clickCopyForFirstVisibleRow(page);
    await handlePossibleCopyDialog(page);
    await reloadAndWait(page);

    await expectInputValue(page, propertyCodeInputSelector, '');
    await expectInputValue(page, propertyNameInputSelector, '');
    await expectInputValue(page, propertyNameKanaInputSelector, '');
  });

  test('TC-6: Copy performed twice keeps search conditions after each Copy', async ({ page }) => {
    test.skip(!propertyName, 'Set TEST_PROPERTY_NAME to a real value existing in your dataset.');

    const nameInput = page.locator(propertyNameInputSelector).first();
    await fillAndSearch(page, nameInput, propertyName);
    await waitForListUpdate(page);
    await expectAnyRowContains(page, propertyName);

    // Copy #1
    await clickCopyForFirstVisibleRow(page);
    await handlePossibleCopyDialog(page);
    await reloadAndWait(page);

    await expectInputValue(page, propertyNameInputSelector, propertyName);
    await expectAnyRowContains(page, propertyName);

    // Copy #2 (on the still-filtered page)
    await clickCopyForFirstVisibleRow(page);
    await handlePossibleCopyDialog(page);
    await reloadAndWait(page);

    await expectInputValue(page, propertyNameInputSelector, propertyName);
    await expectAnyRowContains(page, propertyName);
  });
});

