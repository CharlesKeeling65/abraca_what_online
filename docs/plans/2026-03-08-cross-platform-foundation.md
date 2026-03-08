# Cross-Platform Foundation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a real web delivery pipeline, immersive tabletop UI foundation, server static hosting compatibility, and shared asset conventions that desktop and Android clients can reuse.

**Architecture:** Keep `packages/shared` as the single source of truth for protocol, rules, and asset naming. Use Vite to build the web client into `dist/web`, let the server serve that output when present, and make desktop/mobile wrappers consume the same asset contract and scene model.

**Tech Stack:** TypeScript, Node.js built-in test runner, Vite, WebSocket, CSS

### Task 1: Shared asset naming contract

**Files:**
- Create: `packages/shared/src/assets/assetManifest.ts`
- Modify: `packages/shared/src/index.ts`
- Test: `tests/shared/asset-manifest.test.ts`

**Step 1: Write the failing test**

Already written in `tests/shared/asset-manifest.test.ts`.

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL because `assetManifest` module does not exist.

**Step 3: Write minimal implementation**

Add:
- background asset path mapping
- spell stone filename contract
- exported shared asset prefix

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS for asset-manifest tests.

### Task 2: Table scene view-model

**Files:**
- Create: `apps/web/src/app/tableScene.ts`
- Test: `tests/web/table-scene.test.ts`

**Step 1: Write the failing test**

Already written in `tests/web/table-scene.test.ts`.

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL because `tableScene` module does not exist.

**Step 3: Write minimal implementation**

Add:
- placeholder snapshot helper
- scene model builder for local player and opponents
- spell stat projection for rendering

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS for table scene tests.

### Task 3: Web build pipeline and immersive UI

**Files:**
- Create: `apps/web/index.html`
- Create: `apps/web/src/styles.css`
- Create: `apps/web/vite.config.mjs`
- Modify: `apps/web/src/main.ts`
- Modify: `apps/web/src/app/App.ts`
- Modify: `apps/web/src/network/client.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

**Step 1: Write the failing test / expectation**

Expectation:
- `npm run build:web` produces `dist/web`
- UI uses the scene model and shared asset contract
- page renders a tabletop layout rather than plain placeholder panels

**Step 2: Run command to verify the gap**

Run: `npm run build:web`
Expected: FAIL because no Vite build exists yet.

**Step 3: Write minimal implementation**

Add:
- Vite-based web build
- modern HTML entrypoint
- responsive tabletop UI with asset labels
- mock and real WebSocket support

**Step 4: Run build to verify it passes**

Run: `npm run build:web`
Expected: PASS with output in `dist/web`.

### Task 4: Server static hosting compatibility

**Files:**
- Modify: `apps/server/src/net/createServerApp.ts`

**Step 1: Write failing expectation**

Expectation:
- `GET /` serves `dist/web/index.html` when web build output exists
- otherwise keeps a safe fallback response

**Step 2: Verify the gap**

Run: `node dist/apps/server/src/index.js`
Expected: current root route does not serve a built web app.

**Step 3: Write minimal implementation**

Add:
- static file detection for `dist/web`
- content-type mapping for built assets
- fallback JSON when web build is absent

**Step 4: Run verification**

Run: `npm run verify`
Expected: server tests still pass and build remains green.

### Task 5: Desktop/mobile reuse and asset documentation

**Files:**
- Create: `apps/mobile/README.md`
- Modify: `apps/desktop/src/README.md`
- Modify: `docs/UI_ASSET_SPECS.md`
- Modify: `README.md`

**Step 1: Write failing expectation**

Expectation:
- docs explain how desktop and Android clients reuse the web scene and asset contract
- asset spec lists exact folder locations and filenames for one-click art replacement

**Step 2: Implement minimal documentation**

Add:
- wrapper strategy for Tauri and Expo/React Native Android
- exact asset file tree and naming examples
- which UI zone each asset replaces

**Step 3: Verify manually**

Run: `sed -n '1,260p' docs/UI_ASSET_SPECS.md`
Expected: asset placement and naming are explicit enough for artists/devs to drop in files directly.
