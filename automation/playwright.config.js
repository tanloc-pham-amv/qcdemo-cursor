// Playwright configuration for automation tests in this folder.
// Update BASE_URL / ROOM_LIST_PATH and selectors in the spec as needed.
const { defineConfig } = require('@playwright/test');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const storageStatePath = process.env.PLAYWRIGHT_STORAGE_STATE;
const storageStatePathResolved = storageStatePath ? path.resolve(process.cwd(), storageStatePath) : undefined;

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60_000,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'dot' : [['list']],
  use: {
    baseURL: process.env.BASE_URL,
    storageState: storageStatePathResolved && fs.existsSync(storageStatePathResolved) ? storageStatePathResolved : undefined,
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 720 }
  }
});

