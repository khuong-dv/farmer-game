---
name: speckit-branch-convention-rename
description: Rename non-compliant branches and spec folders to match the configured
  convention
compatibility: Requires spec-kit project structure with .specify/ directory
metadata:
  author: github-spec-kit
  source: branch-convention:commands/speckit.branch-convention.rename.md
---

# Rename to Convention

Rename non-compliant Git branches and spec folders to match the configured naming convention. Handles both branch renaming and folder moving with full safety checks.

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty). The user may specify a specific branch to rename (e.g., "004-chat-system") or "all" to rename everything non-compliant.

## Prerequisites

1. Verify a spec-kit project exists by checking for `.specify/` directory
2. Load convention config from `.specify/branch-convention.yml`
3. If no convention is configured, inform the user and suggest running `/speckit-branch-convention-configure` first
4. Verify the working tree is clean (no uncommitted changes) — renaming with dirty state risks data loss

## Outline

1. **Run validation first**: Execute the same checks as `/speckit-branch-convention-validate` to identify all non-compliant branches and folders.

2. **Build rename plan**: For each non-compliant item, compute the correct name. Handle three artifact types:

   | Current Name | Artifact Type | Convention | New Name | Action |
   |-------------|---------------|------------|----------|--------|
   | `004-chat-system` | Branch | `{type}/{seq}-{kebab}` | `feat/004-chat-system` | Rename branch, keep folder |
   | `5-api` | Branch + folder | `{seq}-{kebab}` (pad 3) | `005-api` | Rename branch + `git mv` folder |
   | `PROJ142-auth` | Branch + folder | `{ticket}-{kebab}` | `PROJ-142-auth` | Rename branch + `git mv` folder |
   | `specs/logout.tiny.md` | TinySpec file | `{ticket}-{kebab}.tiny.md` | `specs/PROJ-142-logout.tiny.md` | `git mv` file (flat, no folder) |

3. **Present the rename plan**: Show a preview table before making any changes:

   ```markdown
   # Rename Plan

   | # | Current Branch | New Branch | Current Folder | New Folder |
   |---|---------------|------------|----------------|------------|
   | 1 | 004-chat-system | feat/004-chat-system | 004-chat-system | 004-chat-system (unchanged) |
   | 2 | 5-api | feat/005-api | 5-api | 005-api |

   **Actions**: {N} branches to rename, {M} folders to move
   ```

4. **Confirm with user**: Ask for explicit confirmation via `AskUserQuestion` before proceeding. This is a destructive operation.
   - `question`: "Proceed with the rename plan above?"
   - `header`: "Confirm rename"
   - options: `Confirm — execute all renames`, `Abort` (Recommended), `Show file-level details first`.
   - On `Show file-level details first`, list every `git mv` and `git branch -m` command that would run, then re-ask without the `Show file-level details first` option.

5. **Execute renames** (after confirmation): For each item in the plan, handle the artifact type correctly:
   - **Full SDD folder** (`specs/{old}/`): `git mv specs/{old} specs/{new}` (preserves git history).
   - **TinySpec file** (`specs/{old}.tiny.md`): `git mv specs/{old}.tiny.md specs/{new}.tiny.md` — flat file move, no folder involved.
   - **Update internal references inside artifacts**: Search `spec.md`, `plan.md`, `tasks.md`, and `*.tiny.md` for references to the old folder/branch name and update them (see step 6 for detail).
   - **Rename git branch**: `git branch -m {old} {new}`.
   - **Worktree check**: If the branch is currently checked out in a worktree (detect via `git worktree list`), rename must be run from that worktree. If the user is elsewhere, ask via `AskUserQuestion`:
     - `question`: "Branch `{name}` lives in worktree `{path}`. Rename must run from there. What do you want to do?"
     - `header`: "Worktree mismatch"
     - options: `Abort and switch to that worktree manually` (Recommended), `Skip this branch and continue with the rest`.
     - Never rename a branch that isn't HEAD of the current worktree.
   - **Update tracking**: If branch tracks a remote, inform user to update remote separately.

6. **Update references in artifacts**: After renaming, scan all spec artifacts for stale references:
   - `spec.md` header metadata (branch name field).
   - `plan.md` header metadata.
   - `tasks.md` header metadata.
   - **`*.tiny.md` header metadata**: update the `**Branch**` field to the new branch name. Tinyspec stores the branch in metadata (Backlog, Branch, Date, Status, Complexity) — stale metadata causes `/speckit-tiny-implement` to fail its branch-match heuristic.
   - Any cross-references between features.

7. **Report**: Output a summary:
   - How many branches were renamed
   - How many folders were moved
   - How many artifact references were updated
   - Any items that could not be renamed (e.g., currently checked-out branch conflicts)
   - Suggest next step: `/speckit-branch-convention-validate` to confirm all items are now compliant

## Rules

- **Never rename without confirmation** — always show the plan first and wait for explicit approval.
- **Clean working tree required** — refuse to rename if there are uncommitted changes.
- **Use git mv** — for both folders (full SDD) and files (`*.tiny.md`). Preserves git history and tracking.
- **Update all references** — scan `spec.md`, `plan.md`, `tasks.md`, and `*.tiny.md` metadata for old names and update to new names.
- **Never rename main/master/develop** — only rename spec-kit feature branches.
- **Handle checked-out branch** — if the current branch needs renaming, rename it last using `git branch -m`.
- **Worktree-aware** — if the branch lives in a separate worktree (detected via `git worktree list`), require the user to run from that worktree (or abort with clear instructions). Never cross-worktree branch rename.
- **Remote branches are informational only** — report that remote branches need manual update (`git push origin :{old} {new}`) but do not push automatically.