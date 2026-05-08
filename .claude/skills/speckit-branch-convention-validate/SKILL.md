---
name: speckit-branch-convention-validate
description: Check all feature branches and spec folders against the configured naming
  convention
compatibility: Requires spec-kit project structure with .specify/ directory
metadata:
  author: github-spec-kit
  source: branch-convention:commands/speckit.branch-convention.validate.md
---

# Validate Branch Convention

Check all existing feature branches and spec folders against the configured naming convention. Reports compliance status and identifies violations.

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty). The user may specify a specific branch to validate (e.g., "003-user-auth") or "all" to check everything.

## Prerequisites

1. Verify a spec-kit project exists by checking for `.specify/` directory
2. Load convention config from `.specify/branch-convention.yml`
3. If no convention is configured, use the default pattern (`{seq}-{kebab}` for both branch and folder)

## Outline

1. **Load convention**: Read `.specify/branch-convention.yml` and extract:
   - `branch_pattern` — the expected branch naming pattern
   - `folder_pattern` — the expected spec folder naming pattern
   - Token definitions (seq_padding, separator, lowercase, etc.)

2. **Collect branches and specs**: Gather all feature-related items:
   - **Git branches**: List all local branches excluding `main`, `master`, `develop`.
   - **Full SDD specs**: List all directories under `specs/` (each has `spec.md` inside).
   - **Tinyspec files**: List all files matching `specs/*.tiny.md` (flat storage from `/speckit-tiny-specify`).
   - **Match pairs**: Associate each branch with its corresponding spec artifact:
     - Extract tokens from the branch name using `branch_pattern`.
     - Extract tokens from each folder name using `folder_pattern`, and from each `*.tiny.md` filename using the same folder pattern (minus the `.tiny.md` suffix).
     - Two items match when their shared tokens (`{seq}`, `{kebab}`, `{ticket}`) are equal — the `{type}` prefix is **stripped before comparison** so `feat/003-x` matches a plain `003-x` folder.

3. **Validate each item**: For every branch and folder, check:

   | Check | Rule | Example Violation |
   |-------|------|-------------------|
   | Pattern match | Branch matches `branch_pattern` structure | `user-auth` missing sequence number |
   | Type prefix | If pattern includes `{type}`, prefix must be in `type_prefix` map | `feature/003-auth` instead of `feat/003-auth` |
   | Sequence format | `{seq}` must be zero-padded to `seq_padding` digits | `3-auth` instead of `003-auth` |
   | Length limit | Branch name must not exceed `max_length` characters | `003-very-long-branch-name-that-exceeds-limit...` |
   | Case rule | If `lowercase: true`, no uppercase characters (except ticket IDs) | `003-User-Auth` |
   | Separator | Words must use configured `separator` | `003_user_auth` when separator is `-` |
   | Branch-folder sync | Branch name and folder name must be derivable from same source | Branch `feat/003-auth` but folder `004-auth` |
   | Ticket format | If pattern includes `{ticket}`, must match `ticket_pattern` regex | `proj-142` when pattern requires `[A-Z]+-[0-9]+` |

4. **Output compliance report**:

   ```markdown
   # Branch Convention Compliance Report

   **Convention**: {preset name or "custom"}
   **Branch pattern**: {branch_pattern}
   **Folder pattern**: {folder_pattern}

   ## Results — Full SDD

   | Branch | Folder | Status | Issues |
   |--------|--------|--------|--------|
   | feat/003-user-auth | 003-user-auth | ✅ Compliant | — |
   | 004-chat-system | 004-chat-system | ⚠️ Non-compliant | Missing type prefix |
   | feat/5-api | 5-api | ⚠️ Non-compliant | Sequence not zero-padded |

   ## Results — TinySpec

   | Branch | File | Status | Issues |
   |--------|------|--------|--------|
   | feat/PROJ-142-logout-button | specs/PROJ-142-logout-button.tiny.md | ✅ Compliant | — |
   | feat/logout | specs/logout.tiny.md | ⚠️ Non-compliant | Missing ticket prefix |

   ## Summary
   - **Total branches**: {N}
   - **Compliant**: {X} ✅
   - **Non-compliant**: {Y} ⚠️
   - **Orphaned folders/files** (spec artifact without a matching branch): {Z1}
   - **Orphaned branches** (branch without a spec folder or `.tiny.md` file): {Z2}

   ## Recommended Actions
   1. Run `/speckit-branch-convention-rename` to fix non-compliant items
   2. Review orphaned items manually — they may be stale, pre-convention, or experimental work
   ```

5. **Report**: Output the compliance report. Do not modify any files — this command is read-only.

## Rules

- **Read-only** — this command never modifies any files or branches
- **Always show all items** — include compliant and non-compliant for full visibility
- **Be specific about violations** — explain exactly which rule was violated and what the correct name should be
- **Handle missing config gracefully** — if no convention is configured, validate against the default pattern and note that no custom convention has been set