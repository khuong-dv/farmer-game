---
description: "Classify task complexity and recommend tinyspec or full SDD workflow"
---

# Classify Task Complexity

Analyze a task description to determine whether it should use the lightweight tinyspec workflow or the full SDD workflow (specify → plan → tasks → implement). Acts as an intelligent router that saves time on small tasks and ensures proper process for complex ones.

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty). The user describes what they want to build or fix.

## Prerequisites

1. Verify a spec-kit project exists by checking for `.specify/` directory
2. Verify the user has described the task (if not, ask what they want to build)

## Outline

1. **Analyze the task**: Evaluate the task description against complexity signals:

   **Small task signals** (→ tinyspec):
   | Signal | Example |
   |--------|---------|
   | Single UI component change | "Add a logout button" |
   | Bug fix with known location | "Fix date format in invoices" |
   | Config or environment change | "Add new env variable for API key" |
   | Simple validation addition | "Add email validation to signup" |
   | Copy/text update | "Update error messages" |
   | Single endpoint addition | "Add GET /health endpoint" |
   | Styling change | "Make the sidebar responsive" |

   **Medium task signals** (→ full SDD, no brainstorm needed):
   | Signal | Example |
   |--------|---------|
   | Single feature, multiple files bounded to one module | "Add profile edit page with avatar upload" |
   | CRUD on an existing entity | "Add comments CRUD to posts" |
   | New API resource with 3–5 related endpoints | "Add /orders API (list, get, create, update, cancel)" |
   | Bounded refactor within one module | "Refactor auth middleware to support API tokens" |
   | UI feature with state + API integration | "Add filtering + sorting to product list" |
   | Single external integration (not cross-cutting) | "Add SendGrid for transactional emails" |
   | Adding 1–2 non-trivial screens/views | "Add settings page with 3 tabs" |
   | Data model change affecting 2–3 related tables | "Add tagging to posts (tags + post_tags)" |

   **Large task signals** (→ full SDD with brainstorm):
   | Signal | Example |
   |--------|---------|
   | Multiple modules affected | "Add user authentication system" |
   | New database tables/schema (schema-wide) | "Add a comments feature with threading" |
   | Architectural change | "Migrate from REST to GraphQL" |
   | New service or integration (cross-cutting) | "Add Stripe payment processing" |
   | Cross-cutting concern | "Add audit logging to all endpoints" |
   | Multiple user stories | "Build the admin dashboard" |
   | Unknown scope | "Improve performance" (needs investigation first) |

   **Key differentiators:**
   - **Small → Medium**: exceeds 5 files OR cannot fit into a single tinyspec file (<80 lines) — needs separate `plan.md` + `tasks.md`.
   - **Medium → Large**: scope spans multiple modules, multiple user stories, or approach is unclear and needs discovery.

2. **Estimate scope**: Quick estimation based on available information:
   - **Files affected**: How many files will likely change
   - **Task count**: How many distinct implementation steps
   - **Risk level**: How likely is this to break existing functionality
   - **Dependencies**: Does this require coordination across modules

3. **Classify and recommend**:

   | Complexity | Files | Tasks | Risk | Recommendation |
   |-----------|-------|-------|------|----------------|
   | **Small** | 1-5 | 1-8 | Low | `/speckit-tiny-specify` |
   | **Medium** | 5-15 | 8-20 | Medium | Full SDD (`/speckit-specify`) |
   | **Large** | 15+ | 20+ | High | Full SDD with clarify (`/speckit-spex-brainstorm` → `/speckit-specify`) |

4. **Output recommendation**:

   ```markdown
   # Task Classification

   | Factor | Assessment |
   |--------|-----------|
   | **Task** | {task description} |
   | **Complexity** | 🟢 Small / 🟡 Medium / 🔴 Large |
   | **Estimated files** | ~{N} files |
   | **Estimated tasks** | ~{N} tasks |
   | **Risk** | Low / Medium / High |

   ## Classification Result

   **Complexity**: small | medium | large

   ## Recommendation

   → Use **`/speckit-tiny-specify`** — this is a small, well-scoped change.

   OR

   → Use **`/speckit-specify`** — moderate complexity, full SDD without brainstorm.

   OR

   → Use **`/speckit-spex-brainstorm`** → **`/speckit-specify`** — complex or unclear scope, start with brainstorming.
   ```

   Note: The `**Complexity**` field in the Classification Result section is machine-readable for downstream commands like `/speckit-specify` to auto-detect the classification when available.

## Rules

- **Read-only** — this command never modifies any files
- **Default to tinyspec** — when in doubt between small and medium, recommend tinyspec (users can always upgrade)
- **Explain the reasoning** — always tell the user why you classified the task as small/medium/large
- **No blocking** — this is a recommendation, not a gate. Users can choose either workflow regardless
- **Context-aware** — consider the project's codebase size and architecture when estimating scope
