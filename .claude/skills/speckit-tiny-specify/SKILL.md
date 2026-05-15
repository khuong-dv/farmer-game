---
name: speckit-tiny-specify
description: Generate a single lightweight spec file with context, plan, and tasks
  for small changes
compatibility: Requires spec-kit project structure with .specify/ directory
metadata:
  author: github-spec-kit
  source: tiny:commands/speckit.tiny.specify.md
---

# TinySpec

Generate a single lightweight specification file for small tasks that don't warrant the full SDD workflow. Combines context, requirements, implementation plan, and tasks into one concise document — minimal overhead, maximum clarity.

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty). The user describes the small change they want to make (e.g., "add a logout button to the navbar", "fix the date format in the invoice PDF", "add input validation to the signup form").

## Pre-Execution Checks

**Check for extension hooks (before tinyspec)**:
- Check if `.specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.before_tiny_specify` key
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
3. Verify the user has described the change (if not, ask what they want to build)
4. **Check description clarity** — if the description is too vague to produce a concrete tinyspec, soft-suggest brainstorming first. Heuristics for "vague":
   - Fewer than ~15 meaningful words, OR
   - Contains open-ended verbs (`improve`, `optimize`, `better`, `clean up`, `refactor`, `fix issues`) **without** a concrete target (no named file, feature, or behavior).

   When detected, emit this suggestion **before** proceeding:

   ```markdown
   ⚠ **Description looks vague** — tinyspec needs a concrete scope to produce a useful spec.

   Recommended: run `/speckit-spex-brainstorm` first to refine the idea, then re-run `/speckit-tiny-specify` with the brainstorm output.

   → Type `continue` to proceed anyway with the current description.
   ```

   The user can override by typing `continue` or rephrasing. Never hard-block.

## Outline

1. **Branch creation** (via hook):

   If a `before_tiny_specify` hook ran successfully in the Pre-Execution Checks above, it will have created/switched to a git branch and output JSON containing `BRANCH_NAME` and `FEATURE_NUM`. Note these values for reference, but the branch name does **not** dictate the tinyspec file name.

2. **Assess scope**: Quickly evaluate whether this task is appropriate for tinyspec:
   - **Good fit**: Single feature, bug fix, UI tweak, config change, small refactor — anything that touches 1-5 files and takes under ~1 hour
   - **Bad fit**: Multi-module features, architectural changes, new services, database schema redesigns — recommend full `/speckit-specify` instead
   - If estimated files >5 OR estimated tasks >10, emit this warning block **before generating the file** and ask the user whether to continue or abort:

     ```markdown
     ⚠ **Scope Warning**

     | Metric | Estimated | Tinyspec limit |
     |--------|-----------|----------------|
     | Files affected | {N} | 5 |
     | Task count | {M} | 10 |

     This task exceeds tinyspec guardrails. Recommended actions:
     - **Abort** and run `/speckit-specify` for the full SDD workflow.
     - **Continue anyway** (not recommended) if you believe the estimate is too pessimistic — the spec may need manual trimming.
     ```

3. **Identify affected files** (token-efficient approach — avoid reading entire files unnecessarily):
   - Use **file search** (glob patterns, e.g. `src/**/Navbar*`) to locate candidate files by name.
   - Use **code search** (grep/ripgrep or equivalent) to find symbol references, imports, and usages — read matching lines only, not full files.
   - Read a file fully **only when** its contents are required to reason about the change.
   - Output three distinct lists:
     - Files that will be **modified**.
     - Files providing **context only** (imports, types, related components — not modified).
     - **Test files** that need updates.

4. **Generate tinyspec file**: Create a single file at `specs/{pattern}.tiny.md` where `{pattern}` is resolved as follows:

   **Resolution order for `{pattern}`**:
   1. If user explicitly provided `SPECIFY_FEATURE_DIRECTORY`, use it as-is (rare for tiny)
   2. Otherwise, auto-generate it using `.specify/extensions/git/config.yml`:
      - **If git-config.yml exists**: read `folder_pattern` and resolve tokens:
        * `{seq}` - sequence number: scan `specs/` for existing directories (including `.tiny.md` files), extract max sequence number, use `max + 1`
        * `{kebab}` - kebab-case short name (2-4 keywords, action-noun format)
        * `{ticket}` - ticket ID: extract from user input using `ticket_pattern` regex, or prompt user if not found
        * `{date}` - current date/time using `date_format` (default: YYYYMMDD)
        * `{type}` - type inferred from keywords (add/implement → feat, fix/bug → fix, etc.)
        * Apply `lowercase` and `separator` constraints from config
        * Apply `max_length` truncation if needed
      - **If git-config.yml does NOT exist**: fallback to `{seq}-{kebab}` pattern (sequential numbering)
   3. Construct the file name: `{resolved-pattern}.tiny.md` (e.g., `003-logout.tiny.md`, `PROJ-142-logout.tiny.md`, `20260511-logout.tiny.md`)

   For metadata fields:
   - **Branch**: Use the current git branch name (or the new branch name if created via hook)
   - **Ticket (Backlog)**: Extract ticket ID based on git-config.yml preset:
     * `ticket`, `github`, `jira`, `linear` presets → extract ticket ID from branch name (e.g., `PROJ-142` from `feat/PROJ-142-logout`), or prompt user if not found
     * Other presets (`default`, `gitflow`, `date`, `custom`) → use `N/A`
   - **Date**: Current date in `YYYY-MM-DD` format
   - **Status**: Always `draft` when created
   - **Complexity**: Always `small` for tinyspec (by definition)

   The `.tiny.md` suffix distinguishes tinyspecs from full SDD `spec.md` files in the same `specs/` directory. Use this structure:

   ```markdown
   # TinySpec: {Title}

   **Branch**: {current-branch or new-branch-name}
   **Ticket**: {TICKET-KEY or N/A}
   **Date**: {YYYY-MM-DD}
   **Status**: draft
   **Complexity**: small

   ## What

   {1-3 sentence description of what this change does and why}

   ## Context

   | File | Role |
   |------|------|
   | `src/components/Navbar.tsx` | Will be modified — add logout button |
   | `src/hooks/useAuth.ts` | Context — provides logout function |
   | `src/components/Navbar.test.tsx` | Will be modified — add test for logout |

   ## Requirements

   1. {Requirement 1 — clear, testable}
   2. {Requirement 2}
   3. {Requirement 3}

   <!-- Optional section — include ONLY if there are concrete scope boundaries worth locking down.
        Omit entirely for truly small tasks to stay minimal. Do not emit "- None" placeholders. -->
   ## Out of Scope

   - {Thing we explicitly will NOT do in this task, to prevent scope creep}
   - {e.g. "Auth flow changes — separate ticket"}

   ## Plan

   1. {Step 1 — what to change and where}
   2. {Step 2}
   3. {Step 3}

   ## Tasks

   - [ ] {Task 1}
   - [ ] {Task 2}
   - [ ] {Task 3}
   - [ ] {Test task}

   ## Done When

   - [ ] All tasks checked off
   - [ ] Tests pass
   - [ ] No lint errors
   ```

5. **Report**:

   ```markdown
   # TinySpec Created

   | Field | Value |
   |-------|-------|
   | **File** | `specs/{pattern}.tiny.md` |
   | **Tasks** | {N} tasks |
   | **Files affected** | {N} files |

   ## Next Steps
   - Review the tinyspec at `specs/{pattern}.tiny.md`
   - Optional: run `/speckit-spex-gates-review-spec` to validate spec quality before implementation
   - Run `/speckit-tiny-implement` to build it
   - Or implement manually — the spec is your checklist
   ```

6. **Check for extension hooks**: After reporting completion, check if `.specify/extensions.yml` exists in the project root.
   - If it exists, read it and look for entries under the `hooks.after_tiny_specify` key
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

**NOTE:** Branch creation is handled by the `before_tiny_specify` hook (git extension). Tinyspec file creation is always handled by this core command.

## Rules

- **One file only** — never generate separate spec.md, plan.md, tasks.md for tinyspec
- **Keep it short** — the entire tinyspec should be under 80 lines
- **No boilerplate** — skip sections that add no value for this specific task
- **Concrete file references** — always list the actual files that will be changed
- **Testable requirements** — every requirement must be verifiable
- **Warn on scope creep** — if the task grows beyond 5 files or 10 tasks, recommend upgrading to full SDD
- **Respect constitution** — follow project conventions from `.specify/memory/constitution.md`