# Room list automation (TC-134)

This folder contains Playwright automation for:
`test-cases/testcase-134-room-list-keep-search-criteria-after-copy.md`

## Prerequisites
- Install browsers once:
  - `npx playwright install`
- Ensure you have a logged-in state (recommended):
  - set `PLAYWRIGHT_STORAGE_STATE` to a path to `storageState.json`
  - generate it once via Google SSO (manual):
    - set `GENERATE_STORAGE_STATE=true`
    - run `npx playwright test tests/generate-storage-state.spec.js --headed`

## Configure
1. Copy `.env.example` to `.env`
2. Update:
   - `BASE_URL`, `ROOM_LIST_PATH`
   - `TEST_PROPERTY_CODE`, `TEST_PROPERTY_NAME`, `TEST_PROPERTY_NAME_KANA`
3. If selectors don’t match your UI, set:
   - `PROPERTY_CODE_INPUT_SELECTOR`, `PROPERTY_NAME_INPUT_SELECTOR`, `PROPERTY_NAME_KANA_INPUT_SELECTOR`
   - `COPY_BUTTON_SELECTOR` (optional)

## Run
- Run all:
  - `npm test`
- Run headed:
  - `npm run test:headed`

## Google SSO (first time only)
The TC tests expect authentication cookies in `PLAYWRIGHT_STORAGE_STATE`.
1. Set `GENERATE_STORAGE_STATE=true` in `.env`
2. Run `npx playwright test tests/generate-storage-state.spec.js --headed`
3. Complete Google login in the opened browser window until it reaches the Room list (`/room`)
4. After it saves `storageState.json`, set `GENERATE_STORAGE_STATE=false` (or remove it) and run `npm test`.

