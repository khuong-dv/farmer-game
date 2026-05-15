---
name: speckit-tiny-implement
description: Implement a small change directly from its tinyspec file
compatibility: Requires spec-kit project structure with .specify/ directory
metadata:
  author: github-spec-kit
  source: tiny:commands/speckit.tiny.implement.md
---

# TinySpec Implement

Implement a small change by following the plan and tasks in its tinyspec file. Works like `/speckit-implement` but optimized for single-file specs — reads one document, executes the tasks, and marks them complete.

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty). The user may specify which tinyspec to implement (e.g., "logout-button") or a path to the tinyspec file.

## Pre-Execution Checks

**Check for extension hooks (before tinyspec implementation)**:
- Check if `.specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.before_tiny_implement` key
- If the YAML cannot be parsed or is invalid, skip hook checking silently and continue normally
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
- For each executable hook, output the following based on its `optional` flag:
  - **Optional hook** (`optional: true`):
    ```
    ## Extension Hooks

    **Optional Pre-Hook**: {extension}
    Command: `/{command}`
    Description: {description}

    Prompt: {prompt}
    To execute: `/{command}`
    ```
  - **Mandatory hook** (`optional: false`):
    ```
    ## Extension Hooks

    **Automatic Pre-Hook**: {extension}
    Executing: `/{command}`
    EXECUTE_COMMAND: {command}

    Wait for the result of the hook command before proceeding to the Outline.
    ```
- If no hooks are registered or `.specify/extensions.yml` does not exist, skip silently

## Prerequisites

1. Verify a spec-kit project exists by checking for `.specify/` directory
2. Verify git is available and the project is a git repository
3. Locate the tinyspec file (new flat storage format `specs/*.tiny.md`):
   - If user specifies a name or pattern fragment → match with glob `specs/*{name}*.tiny.md`.
   - **If no input → derive from current git branch name**. Git extension (if configured) generates branch names that share the same tokens as the tinyspec filename (e.g. branch `feat/PROJ-142-logout` ↔ file `PROJ-142-logout.tiny.md`). Extract the matching tokens (ticket key, kebab slug) from the branch name and glob the matching file under `specs/`.
   - If still unresolved (no matching file, or not on a feature branch) → list all `specs/*.tiny.md` with `Status: draft` and prompt the user to pick.
   - If no `*.tiny.md` files exist at all, suggest running `/speckit-tiny-specify` first.

## Outline

1. **Read the tinyspec**: Parse the tinyspec file to extract:
   - **Metadata**: `Branch`, `Backlog` (ticket key), `Date`, `Status`, `Complexity` from the header block
   - **Context files**: Files listed in the Context table
   - **Requirements**: The numbered requirements list
   - **Out of Scope**: Items from the `## Out of Scope` section (if present) — these are explicit boundaries
   - **Plan**: The ordered implementation steps
   - **Tasks**: The checkbox task list
   - **Done When**: The completion criteria

2. **Read context files**: Load all files listed in the Context table to understand:
   - **IF EXISTS**: Read .specify/memory/constitution.md for governance constraints
   - Current code structure and patterns
   - Existing imports and dependencies
   - Test patterns and conventions

   **Resume detection (partial completion)**: Before executing, check if the working tree already contains changes relevant to this tinyspec:
   - Run `git status` and `git diff` to inspect uncommitted changes on the current branch.
   - Cross-reference changed files against the tinyspec's Context table and Plan steps.
   - If partial progress is detected → present a resume plan to the user: list tasks already reflected in the diff vs. tasks still pending, and ask `continue from task {N}?` or `restart (discard changes)?`.
   - Never silently overwrite uncommitted work. If the user chooses restart, require them to `git reset`/`git stash` manually — do not run destructive git commands automatically.

3. **Execute tasks**: Work through the task list in order:
   - **Before starting the first task**, flip `**Status**: draft` → `**Status**: in-progress` in the tinyspec file. This makes the ongoing work visible to the team.
   - For each task, follow the corresponding plan step.
   - Implement the change in the identified file.
   - Follow existing code patterns and conventions from context files.
   - **Do NOT mark tasks as `[x]` during execution** — batch-marking happens in step 5 after all verification passes.
   - If stopped by an Out of Scope violation, spec ambiguity, or scope creep threshold → flip `**Status**: in-progress` → `**Status**: blocked` and append a short block reason under the header (e.g. `**Blocked reason**: {description}`). Halt and ask the user.

4. **Run verification**: After all tasks are complete:
   - Check that all "Done When" criteria are met
   - Verify tests pass (if test tasks were included)
   - Verify no lint errors (if linting is configured)

5. **Update tinyspec** (batch mark after verification passes):
   - Change `**Status**: in-progress` → `**Status**: done`.
   - Mark all task checkboxes as `[x]` in one batch write.
   - Mark all "Done When" checkboxes as `[x]`.
   - If verification failed → leave Status as `in-progress` and do NOT mark checkboxes. Append a short failure note and instruct user to fix and re-run.
   - Status field lifecycle: `draft` (created) → `in-progress` (execution started) → `blocked` (stuck, needs user input) → back to `in-progress` (resumed) → `done` (implemented + verified).

6. **Report**:

   ```markdown
   # TinySpec Complete: {Title}

   | Field | Value |
   |-------|-------|
   | **Backlog** | {TICKET-KEY or N/A} |
   | **Tasks completed** | {N}/{N} |
   | **Files modified** | {list} |
   | **Tests** | ✅ Pass / ❌ Fail |

   ## Changes Made
   1. {What was changed in file 1}
   2. {What was changed in file 2}

   ## Next Steps
   - Review changes with `git diff`
   - Optional: run `/speckit-spex-gates-review-code` to validate spec compliance (triggers the 5-agent deep-review pipeline when `spex-deep-review` extension is enabled)
   - Suggested commit message: `{BACKLOG}: {short title}` (e.g. `PROJ-142: add logout button`). If Backlog is `N/A`, drop the prefix and use just `{short title}`.
   - Commit when satisfied
   ```

7. **Check for extension hooks**: After completion validation, check if `.specify/extensions.yml` exists in the project root.
   - If it exists, read it and look for entries under the `hooks.after_tiny_implement` key
   - If the YAML cannot be parsed or is invalid, skip hook checking silently and continue normally
   - Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
   - For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
     - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
     - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
   - For each executable hook, output the following based on its `optional` flag:
     - **Optional hook** (`optional: true`):
       ```
       ## Extension Hooks

       **Optional Hook**: {extension}
       Command: `/{command}`
       Description: {description}

       Prompt: {prompt}
       To execute: `/{command}`
       ```
     - **Mandatory hook** (`optional: false`):
       ```
       ## Extension Hooks

       **Automatic Hook**: {extension}
       Executing: `/{command}`
       EXECUTE_COMMAND: {command}
       ```
   - If no hooks are registered or `.specify/extensions.yml` does not exist, skip silently

## Rules

- **Follow the spec** — implement exactly what the tinyspec describes, no more
- **One task at a time** — complete each task before moving to the next
- **Update the tinyspec (batch)** — do NOT mark tasks during execution. Only mark all `[x]` and flip Status to `done` in step 5, after verification passes.
- **Respect existing patterns** — match the code style of context files
- **Stop on ambiguity** — if a task is unclear, ask the user rather than guessing
- **Never self-edit the spec** — if implementation reveals that a requirement is wrong, missing, or contradicts reality (true spec/code drift, not a scope question), STOP and recommend the user run `/speckit-spex-evolve` to reconcile drift through the proper workflow. Never silently rewrite requirements to match what you coded.
- **Respect Out of Scope** — if a task would require touching items listed in the `## Out of Scope` section, **STOP** and ask the user to choose one of:
  - (a) **Relax boundary**: update the tinyspec to remove the item from Out of Scope, then continue.
  - (b) **Split ticket**: abort, create a separate ticket/tinyspec for the side-quest, then resume.
  - (c) **Upgrade workflow**: if multiple Out of Scope items get hit, the task was under-classified — abort and run `/speckit-specify` for full SDD.

  This is a spec-driven principle: the spec (including explicit boundaries) is the source of truth. Silent scope expansion violates SDD.
- **No scope creep (quantitative guard)** — if implementation reveals the task is larger than expected, stop and suggest upgrading to full SDD. Concrete thresholds (match `/speckit-tiny-specify` guardrails):
  - Files actually modified exceeds **5**.
  - Task count expands beyond **10**.
  - Out of Scope stops triggered more than **2** times.

  Hitting any threshold → emit a scope warning and recommend aborting to run `/speckit-specify`.