---
name: speckit-branch-convention-configure
description: Set up branch and folder naming rules for the current project
compatibility: Requires spec-kit project structure with .specify/ directory
metadata:
  author: github-spec-kit
  source: branch-convention:commands/speckit.branch-convention.configure.md
---

# Configure Branch Convention

Set up configurable naming rules for how `/specify` creates Git branches and spec folder names. Supports ticket IDs, GitFlow prefixes, date formats, and custom patterns.

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty). The user may specify a preset (e.g., "gitflow", "ticket", "date") or provide custom patterns directly.

## Prerequisites

1. Verify a spec-kit project exists by checking for `.specify/` directory
2. Check if a convention config already exists at `.specify/branch-convention.yml`

## Outline

1. **Determine convention type**: Resolve the preset based on user input, or enter an interactive wizard if no args are given.

   **Available presets:**

   | Preset | Branch Pattern | Folder Pattern | Example Branch | Example Folder |
   |--------|---------------|----------------|----------------|----------------|
   | `default` | `{seq}-{kebab}` | `{seq}-{kebab}` | `003-user-auth` | `003-user-auth` |
   | `gitflow` | `{type}/{seq}-{kebab}` | `{seq}-{kebab}` | `feat/003-user-auth` | `003-user-auth` |
   | `ticket` | `{ticket}-{kebab}` | `{ticket}-{kebab}` | `PROJ-142-user-auth` | `PROJ-142-user-auth` |
   | `date` | `{date}-{kebab}` | `{date}-{kebab}` | `20260408-user-auth` | `20260408-user-auth` |
   | `custom` | User-defined pattern | User-defined pattern | — | — |

   **Resolution logic:**

   1. **If user input matches a preset name** (e.g. `gitflow`, `ticket`, `date`, `default`) → use it directly, skip to step 2.
   2. **If user input is `custom`** → jump to the custom sub-flow below.
   3. **If user input is empty** → enter the **interactive wizard**:
      - Print the preset table above so the user sees all options side-by-side with concrete examples.
      - Use the `AskUserQuestion` tool with one question:
        - `question`: "Select a branch convention preset"
        - `header`: "Preset"
        - `options`: `default` (recommended for new projects), `gitflow`, `ticket`, `date`, `custom`
      - The user can also pick "Other" to type a free-form preset name; if it doesn't match any known preset, fall back to the `custom` sub-flow.

   **Custom sub-flow** (when preset = `custom`):

   Use the `AskUserQuestion` tool for every prompt below. Free-text values are entered via the "Other" option. After each answer, validate the value before moving on (legal git-name characters for patterns, integer for paddings, valid regex for `ticket_pattern`, etc.).

   - **`branch_pattern`** — `AskUserQuestion`:
     - `header`: "Branch pattern"
     - options: `{type}/{seq}-{kebab}` (Recommended), `{seq}-{kebab}`, `{ticket}-{kebab}`, `{type}/{ticket}-{kebab}`. User picks "Other" to type a custom pattern.
     - Validate: contains at least one token; only letters, digits, `-`, `_`, `/`.
   - **`folder_pattern`** — `AskUserQuestion`:
     - `header`: "Folder pattern"
     - options: same as branch_pattern minus the `{type}/` prefix as the recommended default; show 2-3 sensible defaults plus "Other" for custom.
   - For each token present in the chosen patterns, ask only the relevant follow-ups:
     - **`{seq}` present** — `AskUserQuestion` for `seq_padding` with options `2`, `3` (Recommended), `4`, "Other"; then `AskUserQuestion` for `seq_start` with options `1` (Recommended), `0`, "Other".
     - **`{type}` present** — `AskUserQuestion` for the `type_prefix` map. Offer 2-3 named presets as options, e.g. "GitFlow short (`feat`/`fix`/`hotfix`/`refactor`/`docs`)" (Recommended), "GitFlow long (`feature`/`bugfix`/`hotfix`/`refactor`/`docs`)", "Conventional commits (`feat`/`fix`/`chore`/`docs`/`refactor`)". User picks "Other" to provide a custom map.
     - **`{ticket}` present** — `AskUserQuestion` for `ticket_pattern` with options `[A-Z]+-[0-9]+` (Jira, Recommended), `#[0-9]+` (GitHub Issues), `[A-Z]{3,5}-[0-9]+` (Linear), `AB#[0-9]+` (Azure DevOps). "Other" → user enters their own regex; validate it compiles.
     - **`{date}` present** — `AskUserQuestion` for `date_format` with options `YYYYMMDD` (Recommended), `YYYY-MM-DD`, `YY-MM-DD`, `YYYYMMDD-HHMM`. "Other" → free-form strftime stored as `date_format_custom`.
   - Always ask the two global constraints:
     - **`max_length`** — `AskUserQuestion` with options `60` (Recommended), `40`, `80`, `0` (disable). "Other" for any positive integer.
     - **`lowercase`** — `AskUserQuestion` with options `true` (Recommended) and `false`. (Two-option binary; no "Other" needed.)
   - Skip the per-token prompts for tokens not used in the chosen patterns to avoid noise.

2. **Collect configuration**: Build the convention config. Only include fields relevant to the tokens actually used in your chosen patterns — unused fields can be omitted.

   **Full config example (gitflow + Jira)**:

   ```yaml
   # .specify/branch-convention.yml
   convention:
     branch_pattern: "{type}/{ticket}-{kebab}"
     folder_pattern: "{ticket}-{kebab}"
     type_prefix:
       feature: "feat"
       bugfix: "fix"
       hotfix: "hotfix"
       refactor: "refactor"
       docs: "docs"
     default_type: "feat"
     seq_padding: 3
     seq_start: 1
     date_format: "YYYYMMDD"
     ticket_pattern: "[A-Z]+-[0-9]+"
     max_length: 60
     separator: "-"
     lowercase: true
   ```

   **Field semantics** (each field only applies when the corresponding token is used in patterns):

   | Field | Semantics | Applies when |
   |-------|-----------|--------------|
   | `lowercase` | `true` → force `{kebab}` and `{summary}` to lowercase. `{ticket}`, `{type}`, `{date}` are **never** lowercased regardless. | Patterns contain `{kebab}` or `{summary}`. |
   | `separator` | Used when slugifying `{kebab}` (spaces → separator). Default `-`. Does not override literal characters inside the pattern itself. | Patterns contain `{kebab}`. |
   | `default_type` | Fallback for `{type}` when user's feature input doesn't match any keyword in `type_prefix`. | Patterns contain `{type}`. |
   | `type_prefix` | Map of type names → prefix strings. Keywords matched loosely against feature input (`"add"` → `feature`, `"fix"` → `bugfix`, etc.). | Patterns contain `{type}`. |
   | `max_length` | If rendered name exceeds this, truncate the `{kebab}` token (preserving `{ticket}`, `{seq}`, `{type}`) and emit a warning. Set to `0` or omit to disable. | Always (global constraint). |
   | `seq_padding` | Zero-pad `{seq}` to N digits. E.g., `3` → `003`. | Patterns contain `{seq}`. |
   | `seq_start` | Starting sequence number when no spec folders exist yet. If folders exist, `seq = max(existing) + 1` always overrides. | Patterns contain `{seq}`. |
   | `date_format` | Format for `{date}`. Presets: `YYYYMMDD` (default), `YYYY-MM-DD`, `YY-MM-DD`, `YYYYMMDD-HHMM`. For advanced use, add a `date_format_custom` field with a strftime string. | Patterns contain `{date}`. |
   | `ticket_pattern` | Regex for extracting and validating ticket IDs from `/specify` input. **Configure per project** — see examples below. | Patterns contain `{ticket}`. |

   **Ticket pattern is flexible — adapt per project**:

   | Project type | `ticket_pattern` | Example match |
   |--------------|------------------|----------------|
   | Jira | `[A-Z]+-[0-9]+` | `PROJ-142` |
   | GitHub Issues | `#[0-9]+` | `#142` |
   | Linear | `[A-Z]{3,5}-[0-9]+` | `ENG-142` |
   | Azure DevOps | `AB#[0-9]+` | `AB#142` |
   | Custom mix | `([A-Z]+-[0-9]+\|#[0-9]+)` | Either format |
   | No tickets | *(omit `{ticket}` from patterns; skip `ticket_pattern`)* | — |

   **Minimal configs by project variant**:

   ```yaml
   # Variant A — Simple, no tickets, no gitflow
   convention:
     branch_pattern: "{seq}-{kebab}"
     folder_pattern: "{seq}-{kebab}"
     seq_padding: 3
     lowercase: true
   ```

   ```yaml
   # Variant B — Gitflow, no tickets
   convention:
     branch_pattern: "{type}/{seq}-{kebab}"
     folder_pattern: "{seq}-{kebab}"
     type_prefix: { feature: "feat", bugfix: "fix", hotfix: "hotfix" }
     default_type: "feat"
     seq_padding: 3
     lowercase: true
   ```

   ```yaml
   # Variant C — GitHub Issues + gitflow
   convention:
     branch_pattern: "{type}/gh-{ticket}-{kebab}"
     folder_pattern: "gh-{ticket}-{kebab}"
     type_prefix: { feature: "feat", bugfix: "fix" }
     default_type: "feat"
     ticket_pattern: "[0-9]+"
     lowercase: true
   ```

   ```yaml
   # Variant D — Date-stamped, no tickets
   convention:
     branch_pattern: "{date}-{kebab}"
     folder_pattern: "{date}-{kebab}"
     date_format: "YYYY-MM-DD"
     lowercase: true
   ```

3. **Available tokens**: Document these template tokens for patterns:

   | Token | Description | Example | Resolved from |
   |-------|-------------|---------|---------------|
   | `{seq}` | Zero-padded sequence number | `003` | Auto-increment from highest existing spec folder + 1 |
   | `{kebab}` | Kebab-case feature summary (2-4 words) | `user-auth-flow` | Slugified from user's feature description |
   | `{ticket}` | Ticket/issue ID (JIRA, Linear, GitHub Issues) | `PROJ-142` | Regex-match `ticket_pattern` against the user's input to `/specify`. If no match found → prompt the user `Enter ticket ID:` and validate against `ticket_pattern` |
   | `{date}` | Date in configured format | `20260408` | Current date at `/specify` invocation time |
   | `{type}` | Branch type prefix from type_prefix map | `feat` | Inferred from keywords in user input (`fix` → bugfix, `hotfix` → hotfix, default → `default_type`) |
   | `{summary}` | Raw feature summary (spaces allowed) | `user auth flow` | User's feature description as-is (rarely used in git branches — usually only for folder names) |

   **Note**: token resolution happens at `/speckit-specify` and `/speckit-tiny-specify` invocation time (via the `before_specify` hook and direct config reads). The `configure` command only defines the pattern and meta config — it does not resolve tokens itself.

4. **Write configuration**: Save the convention to `.specify/branch-convention.yml`

5. **Validate existing branches** (optional, delegated): If any feature branches or spec folders already exist, ask the user via `AskUserQuestion`:
   - `question`: "Run a compliance check on existing branches and spec folders against the new convention?"
   - `header`: "Run validate"
   - options: `Yes — run validate now` (Recommended), `No — skip`.
   - On `Yes`, invoke `/speckit-branch-convention-validate` to produce the report. Do **not** re-implement validation logic here — always delegate to the validate skill so both skills stay consistent.

6. **Report**: Output a summary and integration overview:

   ```markdown
   # Branch Convention Configured

   | Field | Value |
   |-------|-------|
   | **Preset** | {preset name or "custom"} |
   | **Branch pattern** | {branch_pattern} |
   | **Folder pattern** | {folder_pattern} |
   | **Example branch** | {rendered example} |
   | **Existing compliant** | {X}/{Total} |

   ## What happens next

   The convention is now active and will be consumed by the following commands **automatically** — no additional steps required:

   - **`/speckit-specify`** — applies the pattern via the `before_specify` hook (spec-kit core fires it automatically; optional prompt to validate first).
   - **`/speckit-tiny-specify`** — fires the `before_tiny` hook (dispatched by the tinyspec extension itself) and reads `.specify/branch-convention.yml` directly when naming `specs/{pattern}.tiny.md`.
   - **`/speckit-tiny-implement`** — indirectly affected: it locates tinyspec files via the same pattern (match against current git branch name).

   ## Maintenance (run manually when needed)

   - `/speckit-branch-convention-validate` — audit all branches and folders for compliance. Read-only.
   - `/speckit-branch-convention-rename` — fix non-compliant branches and folders. Destructive, requires confirmation.
   ```

## Rules

- **Never overwrite without confirmation** — if `.specify/branch-convention.yml` already exists, show the current config and ask via `AskUserQuestion`:
  - `question`: "An existing branch-convention config was found. What do you want to do?"
  - `header`: "Existing config"
  - options: `Replace with new config`, `Keep existing — abort` (Recommended), `Show diff first`.
  - On `Show diff first`, render a unified diff of current vs proposed YAML, then re-ask the same question (without `Show diff first` this time).
- **Branch and folder patterns are independent** — branch may include type prefix (`feat/`) while folder stays flat.
- **Backward compatible** — if no convention is configured, spec-kit default behavior (`{seq}-{kebab}`) applies.
- **Validate patterns** — ensure configured patterns produce valid Git branch names (no spaces, no special chars except `/`, `-`, `_`).
- **Preserve existing numbering** — sequence numbers continue from the highest existing branch number; `seq_start` is only used when no folders exist yet.
- **Omit irrelevant fields** — only fields whose tokens appear in your patterns need to be set. Configure skill prompts only for relevant fields based on the chosen pattern (no noise).
- **Ticket handling is project-specific** — `ticket_pattern` is a regex the user customizes for their ticket system (Jira, GitHub Issues, Linear, Azure DevOps, mixed, or none). The skill does not hard-code any particular system.
- **Truncate gracefully** — when rendered names exceed `max_length`, truncate the `{kebab}` token (preserving identifiers like `{ticket}` and `{seq}`) and emit a warning. Never silently drop tokens.