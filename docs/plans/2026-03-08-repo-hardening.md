# Repository Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Audit the repository, close the highest-value gaps in runtime and testing, and document build/release/development workflows clearly.

**Architecture:** Keep the existing monorepo structure (`shared` rule core + `server` runtime + `web/mobile/desktop` clients), but make the server actually host an HTTP/WebSocket entrypoint and a static web client. Add low-friction Node-based tests so CI can validate gameplay and transport behavior without introducing a heavy test runner.

**Tech Stack:** TypeScript, Node.js built-in test runner, `ws`, GitHub Actions, Docker

### Task 1: Audit and status baseline

**Files:**
- Create: `docs/PROJECT_STATUS.md`
- Modify: `README.md`

**Step 1: Write the failing doc expectation**

Expectation:
- Repository status doc explains implemented parts, gaps, and recommended next milestones.
- README links to the status doc and summarizes the current product maturity honestly.

**Step 2: Verify gap**

Run: `sed -n '1,240p' README.md`
Expected: README is brief and does not explain incomplete areas, CI/CD workflow, or release/development process in detail.

**Step 3: Write minimal documentation**

Add:
- a repository status audit
- an explicit "implemented vs pending" matrix
- links from README

**Step 4: Verify docs cover the gap**

Run: `sed -n '1,260p' docs/PROJECT_STATUS.md`
Expected: document explains architecture state, missing runtime pieces, and next work.

### Task 2: Add test harness and failing tests

**Files:**
- Create: `tests/shared/game-flow.test.ts`
- Create: `tests/server/http-ws.test.ts`
- Modify: `package.json`
- Modify: `tsconfig.json`

**Step 1: Write the failing tests**

Test targets:
- room/game flow still works through the gateway
- HTTP health endpoint responds
- WebSocket transport can create a room and return a snapshot

**Step 2: Run tests to verify failure**

Run: `npm test`
Expected: FAIL because no test script / no runtime HTTP+WS server exists yet.

**Step 3: Write minimal harness**

Add:
- Node test script
- Node type support
- compiled test output path

**Step 4: Re-run targeted tests**

Run: `npm test`
Expected: tests compile and server transport test still fails until runtime is implemented.

### Task 3: Implement real server runtime

**Files:**
- Create: `apps/server/src/net/createServerApp.ts`
- Modify: `apps/server/src/index.ts`

**Step 1: Write/keep failing transport test**

Behavior:
- HTTP `GET /health` returns JSON
- WebSocket clients connect on `/ws`
- client messages are routed through `WsGateway`

**Step 2: Implement minimal server**

Add:
- Node HTTP server
- `ws` server attached to upgrade requests
- session bootstrap and message forwarding
- static serving for the web client entry

**Step 3: Verify tests pass**

Run: `npm test -- --test-name-pattern=\"health|websocket|gateway\"`
Expected: PASS

### Task 4: Improve scripts and delivery workflow

**Files:**
- Modify: `package.json`
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/release.yml`
- Modify: `infra/docker/Dockerfile.server`
- Modify: `infra/docker/docker-compose.yml`

**Step 1: Write failing workflow expectation**

Expectation:
- local scripts cover install, build, test, smoke, and start
- CI runs tests before smoke/build
- release artifacts and Docker instructions match actual runtime

**Step 2: Implement minimal workflow cleanup**

Add:
- `test`, `verify`, and server start scripts
- CI step ordering update
- release packaging aligned with built web/server output
- Docker build using `npm ci`

**Step 3: Verify locally**

Run: `npm run verify`
Expected: all checks pass.

### Task 5: Final documentation and branch cleanup

**Files:**
- Modify: `README.md`

**Step 1: Write the failing documentation expectation**

Expectation:
- README explains architecture, run/test commands, web access URL, CI/CD, Docker deployment, GitHub release flow, and future development workflow.

**Step 2: Implement detailed README**

Include:
- repository goals and current status
- architecture breakdown
- local run/test instructions
- browser/WebSocket usage
- Docker usage
- GitHub Actions CI/CD and release steps
- suggested next development roadmap

**Step 3: Verify manually**

Run: `sed -n '1,320p' README.md`
Expected: README is sufficient for a new engineer to run and extend the project.
