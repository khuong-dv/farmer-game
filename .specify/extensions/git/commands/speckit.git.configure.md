---
description: "Configure branch naming presets and custom patterns"
---

# Configure Git Branch Naming

Set up branch and folder naming rules for Git branches created by Spec Kit. Supports presets for common workflows and custom pattern configuration.

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty). The user may specify a preset (e.g., "gitflow", "github", "jira") or provide custom settings directly.

## Prerequisites

1. Verify a spec-kit project exists by checking for `.specify/` directory
2. Check if a git config already exists at `.specify/extensions/git/git-config.yml`

## Presets

| Preset | Branch Pattern | Folder Pattern | Example Branch | Example Folder |
|--------|---------------|----------------|----------------|----------------|
| `default` | `{seq}-{kebab}` | `{seq}-{kebab}` | `003-user-auth` | `003-user-auth` |
| `gitflow` | `{type}/{seq}-{kebab}` | `{seq}-{kebab}` | `feat/003-user-auth` | `003-user-auth` |
| `ticket` | `{ticket}-{kebab}` | `{ticket}-{kebab}` | `PROJ-142-user-auth` | `PROJ-142-user-auth` |
| `date` | `{date}-{kebab}` | `{date}-{kebab}` | `20260510-user-auth` | `20260510-user-auth` |
| `github` | `{type}/gh-{ticket}-{kebab}` | `gh-{ticket}-{kebab}` | `feat/gh-142-user-auth` | `gh-142-user-auth` |
| `jira` | `{type}/{ticket}-{kebab}` | `{ticket}-{kebab}` | `feat/PROJ-142-user-auth` | `PROJ-142-user-auth` |
| `linear` | `{type}/lin-{ticket}-{kebab}` | `lin-{ticket}-{kebab}` | `feat/lin-142-user-auth` | `lin-142-user-auth` |
| `custom` | User-defined | User-defined | — | — |

## Outline

1. **Determine preset**: Resolve based on user input, or enter interactive wizard if no args.

   **Resolution logic:**
   1. **If user input matches a preset name** → use it directly, skip to step 2.
   2. **If user input is `custom`** → jump to the custom sub-flow.
   3. **If user input is empty** → enter the **interactive wizard**:
      - Print the preset table above.
      - Use the `AskUserQuestion` tool:
        - `question`: "Select a branch naming preset"
        - `header`: "Preset"
        - `options`: `default` (recommended), `gitflow`, `ticket`, `date`, `github`, `jira`, `linear`, `custom`
      - If user picks "Other" with a name that doesn't match, fall back to `custom`.

   **Custom sub-flow**:
   For each setting below, use `AskUserQuestion` with sensible defaults plus "Other" for free-form.

   - **`branch_pattern`** — options: `{type}/{seq}-{kebab}` (Recommended), `{seq}-{kebab}`, `{ticket}-{kebab}`, `{date}-{kebab}`, `{type}/{ticket}-{kebab}`.
     - Validate: contains at least one token; only letters, digits, `-`, `_`, `/`.
   - **`folder_pattern`** — options: same as branch_pattern minus `{type}/` prefix as recommended.
   - For each token in patterns, ask relevant follow-ups:
     - **`{seq}` present** → `seq_padding` (2, 3 recommended, 4) and `seq_start` (1 recommended, 0).
     - **`{type}` present** → `type_prefix` preset:
       - GitFlow short (`feat`/`fix`/`hotfix`/`refactor`/`docs`/`chore`/`test`) — Recommended
       - GitFlow long (`feature`/`bugfix`/`hotfix`/`refactor`/`docs`/`chore`/`test`)
       - Conventional commits (`feat`/`fix`/`chore`/`docs`/`refactor`/`test`)
       - Custom (user provides map)
     - **`{ticket}` present** → `ticket_pattern` regex:
       - `[A-Z]+-[0-9]+` (Jira, Recommended)
       - `#[0-9]+` (GitHub Issues)
       - `[A-Z]{3,5}-[0-9]+` (Linear)
       - `AB#[0-9]+` (Azure DevOps)
       - Custom (user provides regex)
     - **`{date}` present** → `date_format`:
       - `YYYYMMDD` (Recommended)
       - `YYYY-MM-DD`
       - `YY-MM-DD`
       - `YYYYMMDD-HHMM`
       - Custom (user provides strftime string → stored in `date_format_custom`)
   - Global constraints:
     - **`max_length`** — 60 (Recommended), 40, 80, 0 (disable)
     - **`lowercase`** — true (Recommended), false
   - Skip prompts for unused tokens.

2. **Build configuration**: Create the config structure. Only include fields relevant to used tokens.

   **Example config (gitflow + Jira):**
   ```yaml
   branch_preset: gitflow
   branch_pattern: "{type}/{ticket}-{kebab}"
   folder_pattern: "{ticket}-{kebab}"
   seq_padding: 3
   seq_start: 1
   type_prefix:
     feature: "feat"
     bugfix: "fix"
     hotfix: "hotfix"
     refactor: "refactor"
     docs: "docs"
   default_type: "feat"
   ticket_pattern: "[A-Z]+-[0-9]+"
   max_length: 60
   lowercase: true
   separator: "-"
   ```

   **Minimal configs:**
   ```yaml
   # Default preset (no tickets, no gitflow)
   branch_preset: default
   ```

   ```yaml
   # GitHub preset
   branch_preset: github
   ```

3. **Available tokens**:

| Token | Description | Example | Resolved from |
|-------|-------------|---------|---------------|
| `{seq}` | Zero-padded sequence number | `003` | Auto-increment from highest existing spec folder + 1 |
| `{kebab}` | Kebab-case feature summary (2-4 words) | `user-auth-flow` | Slugified from user's feature description |
| `{ticket}` | Ticket/issue ID | `PROJ-142` | Regex-match `ticket_pattern` against user input; if no match, prompt user |
| `{date}` | Date in configured format | `20260510` | Current date at invocation time |
| `{type}` | Branch type prefix | `feat` | Inferred from keywords in user input (`fix` → bugfix, `hotfix` → hotfix, etc.) |
| `{summary}` | Raw feature summary | `user auth flow` | User's feature description as-is |

4. **Write configuration**: Save to `.specify/extensions/git/git-config.yml`. Preserve existing `auto_commit` settings if file exists.

5. **Report**: Output a summary:

   ```markdown
   # Git Branch Naming Configured

   | Field | Value |
   |-------|-------|
   | **Preset** | {preset name} |
   | **Branch pattern** | {branch_pattern} |
   | **Folder pattern** | {folder_pattern} |
   | **Example branch** | {rendered example} |

   ## What happens next

   The convention is now active. Branches will be created using this pattern when:
   - `/speckit-specify` runs (via `before_specify` hook)
   - `/speckit.git.feature` is called directly

   To change settings later, run `/speckit-git-configure` again.
   ```

## Rules

- **Never overwrite without confirmation** — if git-config.yml exists, show current config and ask via `AskUserQuestion`:
  - `question`: "An existing git config was found. What do you want to do?"
  - `header`: "Existing config"
  - `options`: `Replace with new config`, `Keep existing — abort` (Recommended), `Show diff first`
- **Branch and folder patterns are independent** — branch may include `{type}/` prefix while folder stays flat.
- **Backward compatible** — if no config exists, default `{seq}-{kebab}` applies.
- **Validate patterns** — ensure patterns produce valid Git branch names (no spaces, no special chars except `/`, `-`, `_`).
- **Preserve existing numbering** — sequence continues from highest existing; `seq_start` only used when no folders exist.
- **Omit irrelevant fields** — only set fields whose tokens appear in patterns.
- **Ticket handling is project-specific** — `ticket_pattern` is customized per project.
