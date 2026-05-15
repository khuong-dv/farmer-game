# Git Branching Workflow Extension

Git repository initialization, feature branch creation with configurable presets, validation, remote detection, and auto-commit for Spec Kit.

## Overview

This extension provides Git operations as an optional, self-contained module. It manages:

- **Repository initialization** with configurable commit messages
- **Feature branch creation** with 8 presets (default, gitflow, ticket, date, github, jira, linear, custom)
- **Branch validation** to ensure branches follow naming conventions
- **Git remote detection** for GitHub integration (e.g., issue creation)
- **Auto-commit** after core commands (configurable per-command with custom messages)

## Commands

| Command | Description |
|---------|-------------|
| `speckit.git.configure` | Configure branch naming preset or custom pattern |
| `speckit.git.initialize` | Initialize a Git repository with a configurable commit message |
| `speckit.git.feature` | Create a feature branch with configured naming pattern |
| `speckit.git.validate` | Validate current branch follows feature branch naming conventions |
| `speckit.git.remote` | Detect Git remote URL for GitHub integration |
| `speckit.git.commit` | Auto-commit changes (configurable per-command enable/disable and messages) |

## Branch Naming Presets

Run `/speckit-git-configure` to select a preset:

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

## Pattern Tokens

| Token | Description | Example | Resolved from |
|-------|-------------|---------|---------------|
| `{seq}` | Zero-padded sequence number | `003` | Auto-increment from highest existing spec folder + 1 |
| `{kebab}` | Kebab-case feature summary (2-4 words) | `user-auth-flow` | Slugified from user's feature description |
| `{ticket}` | Ticket/issue ID | `PROJ-142` | Regex-match `ticket_pattern` against user input; prompts if no match |
| `{date}` | Date in configured format | `20260510` | Current date at invocation time |
| `{type}` | Branch type prefix | `feat` | Inferred from keywords in user input |
| `{summary}` | Raw feature summary | `user auth flow` | User's feature description as-is |

## Type Inference

The `{type}` token is inferred from keywords in the feature description:

| Keywords | Type | Default Prefix |
|----------|------|----------------|
| add, implement, create, build | `feature` | `feat` |
| fix, bug, repair, patch | `bugfix` | `fix` |
| hotfix, urgent, critical | `hotfix` | `hotfix` |
| refactor, cleanup, restructure | `refactor` | `refactor` |
| doc, document, readme | `docs` | `docs` |
| test, spec, check | `test` | `test` |
| chore, update, maintenance | `chore` | `chore` |

## Ticket Patterns

| System | `ticket_pattern` | Example Match |
|--------|------------------|---------------|
| Jira | `[A-Z]+-[0-9]+` | `PROJ-142` |
| GitHub Issues | `#[0-9]+` | `#142` |
| Linear | `[A-Z]{3,5}-[0-9]+` | `ENG-142` |
| Azure DevOps | `AB#[0-9]+` | `AB#142` |

Customize via `/speckit-git-configure` → `custom` → provide regex.

## Hooks

| Event | Command | Optional | Description |
|-------|---------|----------|-------------|
| `before_tiny` | `speckit.git.feature` | No | Create feature branch before tinyspec creation |
| `before_constitution` | `speckit.git.initialize` | No | Init git repo before constitution |
| `before_specify` | `speckit.git.feature` | No | Create feature branch before specification |
| `before_clarify` | `speckit.git.commit` | Yes | Commit outstanding changes before clarification |
| `before_plan` | `speckit.git.commit` | Yes | Commit outstanding changes before planning |
| `before_tasks` | `speckit.git.commit` | Yes | Commit outstanding changes before task generation |
| `before_implement` | `speckit.git.commit` | Yes | Commit outstanding changes before implementation |
| `before_checklist` | `speckit.git.commit` | Yes | Commit outstanding changes before checklist |
| `before_analyze` | `speckit.git.commit` | Yes | Commit outstanding changes before analysis |
| `before_taskstoissues` | `speckit.git.commit` | Yes | Commit outstanding changes before issue sync |
| `after_constitution` | `speckit.git.commit` | Yes | Auto-commit after constitution update |
| `after_tiny` | `speckit.git.commit` | Yes | Auto-commit after tinyspec creation |
| `after_specify` | `speckit.git.commit` | Yes | Auto-commit after specification |
| `after_clarify` | `speckit.git.commit` | Yes | Auto-commit after clarification |
| `after_plan` | `speckit.git.commit` | Yes | Auto-commit after planning |
| `after_tasks` | `speckit.git.commit` | Yes | Auto-commit after task generation |
| `after_implement` | `speckit.git.commit` | Yes | Auto-commit after implementation |
| `after_checklist` | `speckit.git.commit` | Yes | Auto-commit after checklist |
| `after_analyze` | `speckit.git.commit` | Yes | Auto-commit after analysis |
| `after_taskstoissues` | `speckit.git.commit` | Yes | Auto-commit after issue sync |

## Configuration

Configuration is stored in `.specify/extensions/git/git-config.yml`:

```yaml
# Preset or "custom"
branch_preset: gitflow

# Patterns (only used when preset = "custom")
branch_pattern: "{type}/{seq}-{kebab}"
folder_pattern: "{seq}-{kebab}"

# Sequence config
seq_padding: 3
seq_start: 1

# Type mapping
type_prefix:
  feature: "feat"
  bugfix: "fix"
  hotfix: "hotfix"
  refactor: "refactor"
  docs: "docs"
  chore: "chore"
  test: "test"
default_type: "feat"

# Ticket config (for {ticket} token)
ticket_pattern: "[A-Z]+-[0-9]+"

# Date config (for {date} token)
date_format: "YYYYMMDD"

# Global constraints
max_length: 60
lowercase: true
separator: "-"

# Auto-commit per command (all disabled by default)
auto_commit:
  default: false
  after_specify:
    enabled: true
    message: "[Spec Kit] Add specification"
```

## Installation

```bash
# Install the bundled git extension (no network required)
specify extension add git
```

## Disabling

```bash
# Disable the git extension (spec creation continues without branching)
specify extension disable git

# Re-enable it
specify extension enable git
```

## Graceful Degradation

When Git is not installed or the directory is not a Git repository:
- Spec directories are still created under `specs/`
- Branch creation is skipped with a warning
- Branch validation is skipped with a warning
- Remote detection returns empty results

## Scripts

The extension bundles cross-platform scripts:

- `scripts/bash/create-new-feature.sh` — Bash implementation
- `scripts/bash/git-common.sh` — Shared Git utilities (Bash)
- `scripts/powershell/create-new-feature.ps1` — PowerShell implementation
- `scripts/powershell/git-common.ps1` — Shared Git utilities (PowerShell)
