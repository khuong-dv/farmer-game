# Quickstart: Project Skeleton Scaffold

**Branch**: `001-project-skeleton` | **Phase**: 1 | **Date**: 2026-05-15

The developer experience this skeleton must deliver. Every step here maps to an acceptance scenario or measurable outcome in the spec — finishing this file in under 5 minutes from a clean clone is the bar (SC-001).

---

## Prerequisites

- Node.js (current LTS) and `npm` available on `PATH`.
- A current-generation desktop browser (Chrome / Firefox / Safari / Edge, latest 2 stable).

That's the whole list. No global tools.

## First-time setup (one command)

```bash
git clone <repo-url> farmer-game
cd farmer-game
npm install
```

`npm install` MUST run the husky pre-commit installation as a `prepare` script, so hooks are live immediately.

## Daily loop

```bash
npm run dev            # Starts Vite. Open the printed URL.
npm run typecheck      # tsc --noEmit
npm run lint           # eslint .
npm run test           # vitest run
npm run build          # vite build → dist/
```

## Acceptance walkthrough (maps directly to spec)

### US1 — Engine-alive smoke scene

1. `npm run dev` → open the printed local URL.
2. **Verify**: a Phaser scene renders the text `🌾 Farmer Game — engine alive` and an FPS counter that updates each frame. *(US1 Acceptance Scenario 1)*
3. Edit the smoke text in `src/scenes/MainScene.ts`, save the file.
4. **Verify**: the browser reflects the change without a manual rebuild (Vite HMR). *(US1 Acceptance Scenario 2)*
5. `npm run build`, then serve `dist/` (e.g. `npx http-server dist`) and open it in a browser.
6. **Verify**: the same smoke scene renders from the built bundle. *(US1 Acceptance Scenario 3)*

### US2 — Persistent state via auto-save

1. From DevTools console while the dev server is open: `(window as any).__state?.setState({ playerName: "Alice" })` (or whatever debug hook the implementation exposes). Trigger a scene transition to fire auto-save. *(US2 Acceptance Scenario 2)*
2. Reload the page.
3. **Verify**: `getState().playerName === "Alice"` and `launchCount` has incremented. *(US2 Acceptance Scenario 3 + SC-004)*
4. From DevTools: `localStorage.setItem("farmer-game:save", "{not valid json")`. Reload.
5. **Verify**: the game loads cleanly into default state; no uncaught error in the console. *(US2 Acceptance Scenario 4 + SC-005)*
6. From DevTools: `localStorage.setItem("farmer-game:save", JSON.stringify({ version: 99, data: {} }))`. Reload.
7. **Verify**: same — default state, no error. *(US2 Acceptance Scenario 5)*

### US3 — Quality gates

1. Run `npm run typecheck && npm run lint && npm run test && npm run build`. *(US3 Acceptance Scenario 1 + SC-002: full sequence under 60s)*
2. **Verify**: all four exit zero. The full wall time should be well under 60 seconds.
3. Introduce a deliberate type error (e.g. assign a `string` to a `number` field). Stage and `git commit`.
4. **Verify**: the pre-commit hook fails the commit with a typecheck error. *(US3 Acceptance Scenario 2 + SC-003)*
5. Revert. Push the branch and observe the GitHub Actions run.
6. **Verify**: CI runs `install → typecheck → lint → test → build` and either reports green or fails on whichever step is broken. *(US3 Acceptance Scenario 3 + SC-006: CI under 5 min)*

## File layout sanity check

After install + first dev run, the layer directories under `src/` should look like:

```
src/
├── main.ts
├── scenes/{BootScene.ts, MainScene.ts}
├── systems/SaveSystem.ts
├── state/gameState.ts
├── data/saveSchema.ts
├── entities/.gitkeep
├── ui/.gitkeep
├── types/.gitkeep
└── utils/.gitkeep
```

Adding a new scene at `src/scenes/MyScene.ts` and registering it in `main.ts` MUST require zero config changes (SC-007). If you find yourself editing `tsconfig.json`, `vite.config.ts`, `.eslintrc`, or `vitest.config.ts` to make a new layer-resident file work, that is a skeleton bug.
