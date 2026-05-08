# spec-kit-tiny

A [Spec Kit](https://github.com/github/spec-kit) extension that adds a lightweight single-file workflow for small tasks — skip the heavy multi-step SDD process when all you need is a quick spec and implementation.

> **Note**: this fork has been customized for teams using [cc-spex](https://github.com/rhuss/cc-spex) and [spec-kit-branch-convention](https://github.com/Quratulain-bilal/spec-kit-branch-convention) alongside spec-kit. See [Integration](#integration-with-cc-spex--branch-convention) for details.

## Problem

Spec Kit's standard workflow (specify → plan → tasks → implement) is powerful for complex features, but overkill for small changes:

- Adding a simple button generates 30+ files with < 20 lines of actual code
- The 4-step process creates 4 lines of documentation for every 1 line of code
- Small bug fixes get 35 tasks across 3 phases when they need ~5
- Token costs and time add up fast for frequent small changes
- Developers skip spec-kit entirely for small tasks, losing traceability

## Solution

The TinySpec extension adds three commands for lightweight specification:

| Command | Purpose | Modifies Files? |
|---------|---------|-----------------|
| `/speckit-tiny-classify` | Classify task complexity (**Small / Medium / Large**) and recommend tinyspec or full SDD workflow | No — read-only |
| `/speckit-tiny-specify` | Generate a single lightweight spec file with context, plan, tasks, and explicit out-of-scope boundaries for small changes | Yes — creates one spec file |
| `/speckit-tiny-implement` | Implement a small change directly from its tinyspec file, honoring spec boundaries | Yes — modifies source files, updates tinyspec |

## Installation

```bash
specify extension add --from https://github.com/Quratulain-bilal/spec-kit-tinyspec/archive/refs/tags/v1.0.0.zip
```

## How It Works

### Full SDD vs TinySpec

```
Full SDD (complex features):           TinySpec (small changes):
  /speckit-specify    → spec.md          /speckit-tiny-specify           → one file
  /speckit-plan       → plan.md          /speckit-tiny-implement → done
  /speckit-tasks      → tasks.md
  /speckit-implement  → code

  4 commands, 3+ files, 100+ lines       2 commands, 1 file, <80 lines
```

### Storage Format

Tinyspec files live **flat in `specs/`** with a `.tiny.md` suffix (distinguishes them from full-SDD `spec.md` files in `specs/{feature}/`):

- With `spec-kit-branch-convention` configured → use the configured pattern:
  `specs/PROJ-142-logout-button.tiny.md` (ticket preset)
- Without branch-convention → fallback to kebab-case:
  `specs/logout-button.tiny.md`

### The TinySpec Format

```markdown
# TinySpec: Add Logout Button to Navbar

**Branch**: feat/PROJ-142-logout-button
**Backlog**: PROJ-142
**Date**: 2026-04-20
**Status**: draft
**Complexity**: small

## What

Add a logout button to the navigation bar that calls the existing
auth hook and redirects to the login page.

## Context

| File | Role |
|------|------|
| `src/components/Navbar.tsx` | Will be modified — add logout button |
| `src/hooks/useAuth.ts` | Context — provides logout function |
| `src/components/Navbar.test.tsx` | Will be modified — add test |

## Requirements

1. Logout button visible when user is authenticated
2. Clicking logout calls useAuth().logout()
3. After logout, redirect to /login

## Out of Scope

- Auth flow refactor — separate ticket
- Mobile menu redesign

## Plan

1. Import useAuth hook in Navbar.tsx
2. Add conditional logout button after nav links
3. Add onClick handler that calls logout and navigates to /login
4. Add test for logout button visibility and click behavior

## Tasks

- [ ] Add logout button to Navbar component
- [ ] Wire up useAuth().logout() on click
- [ ] Add redirect to /login after logout
- [ ] Add unit test for logout button

## Done When

- [ ] All tasks checked off
- [ ] Tests pass
- [ ] No lint errors
```

Notes:
- `**Backlog**` captures the ticket ID (or `N/A`) for end-to-end traceability.
- `## Out of Scope` is **optional** — include only when explicit boundaries help; omit entirely for very small tasks.
- `**Status**` follows a 4-state lifecycle (see [Status Lifecycle](#status-lifecycle)).

### Complexity Classification

The classify command acts as an intelligent router with three tiers:

| Complexity | Files | Tasks | Workflow |
|-----------|-------|-------|----------|
| **Small** | 1-5 | 1-8 | `/speckit-tiny-specify` |
| **Medium** | 5-15 | 8-20 | `/speckit-specify` (full SDD, no brainstorm) |
| **Large** | 15+ | 20+ | `/speckit-spex-brainstorm` → `/speckit-specify` |

The Medium tier was added to avoid forcing every non-trivial task through brainstorming. See the classify skill for detailed signal tables and the key differentiators (Small↔Medium, Medium↔Large).

## Workflow

```
Describe your task
       │
       ▼
/speckit-tiny-classify           ← Is this small or complex?
       │
       ├── Small  ──→ /speckit-tiny-specify
       │                    │
       │                    ▼
       │             Human Verify Spec (review the tinyspec file)
       │                    │
       │                    ▼
       │             /speckit-tiny-implement
       │
       ├── Medium ──→ /speckit-specify      (full SDD)
       │
       └── Large  ──→ /speckit-spex-brainstorm → /speckit-specify
```

If description is vague, `/speckit-tiny-specify` soft-suggests `/speckit-spex-brainstorm` first.

## Status Lifecycle

The `**Status**` field in a tinyspec flows through:

```
draft        ← created by /speckit-tiny-specify, waiting for human review
  │
  ▼
in-progress  ← flipped on entry to /speckit-tiny-implement
  │
  ├── blocked ← stopped by Out of Scope violation, ambiguity, or scope creep.
  │             Appends **Blocked reason**: {description}. Requires user input.
  │
  ▼
done         ← all tasks [x], verification passed, set at end of implement
```

`blocked` exists so drift/stuck states are **explicit**, not silent — consistent with SDD's transparency principle.

## When to Use TinySpec

**Good fit:**
- Add/remove a UI component
- Fix a known bug
- Update validation rules
- Change configuration
- Add a simple API endpoint
- Update copy/text/styling

**Use full SDD instead:**
- New feature with multiple user stories
- Database schema changes
- Architectural refactoring
- New service or integration
- Cross-cutting concerns (logging, auth, caching)

## Scope Guards

Tinyspec has quantitative and qualitative guards against scope creep:

**Quantitative** (hard limits, tracked by both skills):
- Files actually modified exceeds **5** → warn + recommend abort to full SDD.
- Task count expands beyond **10** → same.
- Out of Scope stops triggered more than **2** times → task was under-classified.

**Qualitative** (enforced by `/speckit-tiny-implement`):
- `## Out of Scope` items must be respected. If execution requires touching one → **STOP** and ask the user to:
  (a) relax the boundary (update tinyspec), (b) split into a separate ticket, or (c) upgrade to full SDD.

Silent scope expansion violates SDD. Stopping is the right answer.

## Integration with cc-spex & branch-convention

When installed alongside [cc-spex](https://github.com/rhuss/cc-spex) and/or [spec-kit-branch-convention](https://github.com/Quratulain-bilal/spec-kit-branch-convention), tinyspec detects and respects their configuration:

### Branch-convention

- `/speckit-tiny-specify` reads `.specify/branch-convention.yml` and applies the configured pattern to the file name (uses the same tokens: `{seq}`, `{kebab}`, `{ticket}`, `{date}`, `{type}`).
- Example: `ticket` preset + `PROJ-142` + `logout-button` → `specs/PROJ-142-logout-button.tiny.md`.
- Without config, falls back to `specs/{kebab}.tiny.md`.

### `before_tiny` hook (custom hook system)

Spec-kit core only fires standard hooks (`before_specify`, etc.) automatically. `/speckit-tiny-specify` adds its own hook dispatcher that scans `.specify/extensions/*/extension.yml` for a `hooks.before_tiny` entry and fires matching commands before file generation.

Example — `spec-kit-branch-convention` registers:

```yaml
hooks:
  before_tiny:
    command: speckit.branch-convention.validate
    optional: true
    prompt: "Validate branch naming convention before creating new tinyspec?"
```

→ When `/speckit-tiny-specify` runs, naming compliance is audited first (same UX as `before_specify`). Any extension can register for `before_tiny` the same way.

### cc-spex integration

cc-spex v5 replaced its trait system with spec-kit native extensions. When cc-spex is installed alongside, tinyspec reports always include optional next-step hints:

- `/speckit-tiny-specify` Next Steps suggests `/speckit-spex-gates-review-spec` to validate spec quality.
- `/speckit-tiny-implement` Next Steps suggests `/speckit-spex-gates-review-code` for spec compliance (triggers the 5-agent pipeline when `spex-deep-review` extension is enabled).

These are user-driven hints — tinyspec itself never auto-invokes cc-spex commands. For spec drift discovered during implement, tinyspec stops and recommends `/speckit-spex-evolve`.

### `/speckit-spex-evolve` for drift

`/speckit-tiny-implement` **never self-edits the spec**. If execution reveals a genuine spec/code drift (a requirement is wrong or missing, not a scope question), the skill stops and recommends `/speckit-spex-evolve` to reconcile drift through the proper workflow.

## Hooks

The extension registers an optional hook:

- **before_specify**: Offers to classify task complexity before starting the full SDD workflow.

## Design Decisions

- **Single file** — one spec file replaces three (spec.md + plan.md + tasks.md).
- **Under 80 lines** — if the spec grows beyond 80 lines, the task is probably too complex for tinyspec.
- **Flat storage + suffix** — `specs/{pattern}.tiny.md` unifies with full-SDD folder layout and integrates naturally with branch-convention naming.
- **Concrete file references** — always lists actual files to modify, not abstract descriptions.
- **Out of Scope as explicit boundary** — enforced, not cosmetic; violations stop execution.
- **Scope guard** — both quantitative (5 files / 10 tasks / 2 OoS stops) and qualitative (Out of Scope).
- **Batch task-marking** — `/speckit-tiny-implement` only checks `[x]` after verification passes, preventing false "done" state on partial runs.
- **Resume via `git diff`** — partial runs are detected from the working tree, not a checkpoint file; user always confirms before continuing.
- **Non-blocking classifier** — `/speckit-tiny-classify` is a recommendation, not a gate.
- **4-state status lifecycle** — `draft → in-progress → blocked → done` makes stuck states visible.
- **Never self-edit spec** — spec drift is reconciled through `/speckit-spex-evolve`, not silent rewrites.

## Requirements

- Spec Kit >= 0.4.0
- Git >= 2.0.0

**Recommended companions:**
- [spec-kit-branch-convention](https://github.com/Quratulain-bilal/spec-kit-branch-convention) — for configurable naming that tinyspec picks up automatically.
- [cc-spex](https://github.com/rhuss/cc-spex) — bundled extensions for quality gates (`spex-gates`), multi-agent review (`spex-deep-review`), worktree isolation (`spex-worktrees`), and PR collaboration (`spex-collab`).

## Related

- Issue [#1174](https://github.com/github/spec-kit/issues/1174) — speckit.tinySpec: a lightweight workflow for small tasks (22+ reactions)

## License

MIT
