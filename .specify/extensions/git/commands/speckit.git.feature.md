---
description: "Create a feature branch with configured naming pattern"
---

# Create Feature Branch

Create and switch to a new git feature branch for the given specification. This command handles **branch creation only** — the spec directory and files are created by the core `/speckit.specify` workflow.

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Environment Variable Override

If the user explicitly provided `GIT_BRANCH_NAME` (e.g., via environment variable, argument, or in their request), pass it through to the script by setting the `GIT_BRANCH_NAME` environment variable before invoking the script. When `GIT_BRANCH_NAME` is set:
- The script uses the exact value as the branch name, bypassing all pattern generation
- The script still outputs `BRANCH_NAME` and `FEATURE_NUM` for compatibility

## Prerequisites

- Verify Git is available by running `git rev-parse --is-inside-work-tree 2>/dev/null`
- If Git is not available, warn the user and skip branch creation

## Configuration Loading

Load git configuration from `.specify/extensions/git/git-config.yml`:

1. **If config does not exist**: Use legacy defaults:
    - Pattern: `{seq}-{kebab}` (sequential numbering)
    - This is the backward-compatible default when no config file exists.

2. **If config exists**:
    - **Check for legacy format** (backward compatibility for existing projects):
        - If `branch_numbering` field exists (old format: "sequential" or "timestamp"):
            - For "sequential": use pattern `{seq}-{kebab}`
            - For "timestamp": use pattern `{date}-{kebab}` where date format is `YYYYMMDD-HHMM`
            - Skip token resolution for type/ticket (not supported in legacy format)
    - **Otherwise use new format**:
        - Read `branch_preset`, `branch_pattern`, `folder_pattern`, and all token-related fields
        - If `branch_preset` is not "custom", apply preset defaults:
            - `default`: `{seq}-{kebab}` for both branch and folder
            - `gitflow`: branch `{type}/{seq}-{kebab}`, folder `{seq}-{kebab}`
            - `ticket`: `{ticket}-{kebab}` for both
            - `date`: `{date}-{kebab}` for both
            - `github`: branch `{type}/gh-{ticket}-{kebab}`, folder `gh-{ticket}-{kebab}`
            - `jira`: branch `{type}/{ticket}-{kebab}`, folder `{ticket}-{kebab}`
            - `linear`: branch `{type}/lin-{ticket}-{kebab}`, folder `lin-{ticket}-{kebab}`

## Token Resolution

For each token in the branch pattern, resolve its value:

### `{seq}` — Sequence Number
- Read `seq_padding` from config (default: 3)
- Read `seq_start` from config (default: 1)
- Find all existing spec directories matching the folder pattern
- Extract sequence numbers, find the maximum
- If no existing specs: use `seq_start`
- Otherwise: use `max_existing + 1`
- Zero-pad to `seq_padding` digits

### `{kebab}` — Kebab-case Summary
- Analyze the feature description
- Extract 2-4 meaningful keywords
- Use action-noun format when possible (e.g., "add-user-auth", "fix-payment-bug")
- Preserve technical terms (OAuth2, API, JWT, etc.)
- Apply `separator` (default: "-") between words
- Apply `lowercase` if configured (default: true)
- Apply `max_length` truncation if needed (truncate the kebab part, preserve other tokens)

### `{type}` — Branch Type Prefix
- Read `type_prefix` map and `default_type` from config
- Analyze feature description for keywords:
    - "add", "implement", "create", "build" → `feature`
    - "fix", "bug", "repair", "patch" → `bugfix`
    - "hotfix", "urgent", "critical" → `hotfix`
    - "refactor", "cleanup", "restructure" → `refactor`
    - "doc", "document", "readme" → `docs`
    - "test", "spec", "check" → `test`
    - "chore", "update", "maintenance" → `chore`
- If keyword matches, use the corresponding prefix from `type_prefix`
- If no match, use `default_type` (default: "feat")

### `{ticket}` — Ticket ID
- Read `ticket_pattern` regex from config
- Scan user input for matches against `ticket_pattern`
- **If match found**: use the matched ticket ID
- **If no match**: prompt user via `AskUserQuestion`:
    - `question`: "Enter the ticket/issue ID for this feature"
    - `header`: "Ticket ID"
    - Validate the input against `ticket_pattern`
    - If invalid, re-prompt with error message

### `{date}` — Date
- Read `date_format` from config (default: "YYYYMMDD")
- If `date_format` is "custom", use `date_format_custom` (strftime format)
- Generate current date/time in the specified format:
    - `YYYYMMDD`: year month day, no separators
    - `YYYY-MM-DD`: year-month-day
    - `YY-MM-DD`: 2-digit year
    - `YYYYMMDD-HHMM`: year month day hour minute

## Pattern Rendering

Replace all tokens in `branch_pattern` with resolved values:

1. For each token in order: `{seq}`, `{ticket}`, `{date}`, `{type}`, `{kebab}`
2. Replace with the resolved value
3. If `lowercase` is true, lowercase the final result (except for `{ticket}` which should preserve case per most ticket systems)
4. Validate the final branch name against Git branch name rules:
    - No spaces, no `~`, `^`, `:`, `?`, `*`, `[`, `@`, `\\`
    - Cannot start or end with `.`
    - Cannot have consecutive `..`
    - Maximum length check (if `max_length` > 0)

## Branch Name Confirmation

**Before invoking the script**, always confirm the resolved branch name with the user via `AskUserQuestion`. This guards against bad inferences (wrong type, wrong kebab, etc.) and lets the user override without re-running the whole command.

- `question`: "Create branch `<resolved-branch-name>`?"
- `header`: "Confirm branch"
- `options`:
  1. `Yes, use this name` (Recommended) — proceed with the resolved name
  2. `No, let me enter a different one` — open a follow-up `AskUserQuestion` asking for a custom branch name; validate it against Git branch name rules (see Pattern Rendering step 4)
  3. `Cancel` — abort branch creation, do not invoke the script

**Decision → action mapping**:
- **Yes** → set `GIT_BRANCH_NAME=<resolved-branch-name>` and proceed to Script Execution
- **No** → set `GIT_BRANCH_NAME=<user-provided-name>` (after validation) and proceed to Script Execution
- **Cancel** → stop; do not run the script; report cancellation to the user

**Skip confirmation only when** the user already provided `GIT_BRANCH_NAME` explicitly (see Environment Variable Override) — in that case their value is treated as authoritative.

## Script Execution

Pass the confirmed branch name to the script via the `GIT_BRANCH_NAME` environment variable. The script uses this exact value and bypasses its built-in sequence-number generation.

- **Bash**: `GIT_BRANCH_NAME="<branch-name>" .specify/extensions/git/scripts/bash/create-new-feature.sh --json "<feature description>"`
- **PowerShell**: `$env:GIT_BRANCH_NAME="<branch-name>"; .specify/extensions/git/scripts/powershell/create-new-feature.ps1 -Json "<feature description>"`

**IMPORTANT**:
- Always include the JSON flag for reliable parsing
- Run the script only once per feature
- The JSON output contains `BRANCH_NAME` and `FEATURE_NUM`
- The script does **not** accept a `--branch-name` / `-BranchName` flag. `GIT_BRANCH_NAME` is the only supported mechanism for injecting a fully-resolved branch name.

## Graceful Degradation

If Git is not installed or the current directory is not a Git repository:
- Branch creation is skipped with a warning: `[specify] Warning: Git repository not detected; skipped branch creation`
- Still output `BRANCH_NAME` and `FEATURE_NUM` based on pattern resolution

## Output

The script outputs JSON with:
- `BRANCH_NAME`: The branch name (e.g., `feat/003-user-auth`, `PROJ-142-user-auth`, `20260510-user-auth`)
- `FEATURE_NUM`: The identifier used (seq number, ticket ID, or date)

## Examples

**Default preset:**
- Input: "Add user authentication with OAuth2"
- Pattern: `{seq}-{kebab}`
- Output: `003-add-oauth2-auth`

**Gitflow preset:**
- Input: "Fix payment gateway bug"
- Pattern: `{type}/{seq}-{kebab}`
- Type inferred: `fix` (bugfix)
- Output: `fix/004-payment-gateway-bug`

**GitHub preset:**
- Input: "gh-142 Add dark mode support"
- Pattern: `{type}/gh-{ticket}-{kebab}`
- Ticket extracted: `142`
- Output: `feat/gh-142-dark-mode`

**Jira preset:**
- Input: "PROJ-500 Implement user profile"
- Pattern: `{type}/{ticket}-{kebab}`
- Ticket extracted: `PROJ-500`
- Output: `feat/PROJ-500-user-profile`

**Date preset:**
- Input: "Quick fix for login issue"
- Pattern: `{date}-{kebab}`
- Date: `20260510`
- Output: `20260510-login-fix`
