# AGENTS.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 0. Asking the User

**Always use the `AskUserQuestion` tool when asking the user anything.**

Any time you need clarification, confirmation, or a decision from the user, use the `AskUserQuestion` tool — do NOT ask in plain prose.

This applies to:
- Clarifying ambiguous requirements ("Did you mean X or Y?")
- Confirming assumptions before implementing ("Should I use approach A or B?")
- Resolving multiple valid interpretations
- Asking about scope, edge cases, or constraints
- Any decision point where user input is required

Rules:
- Batch related questions into a single `AskUserQuestion` call rather than asking one at a time.
- Provide clear, mutually exclusive options when possible (include an "Other" option for open-ended cases).
- Keep question text short and specific. Avoid jargon unless the user used it first.
- Do NOT use `AskUserQuestion` for rhetorical questions, status updates, or progress reports — only for actual decisions you need from the user.

The only exception: if the task is trivial and you can proceed safely with a stated assumption, do that instead — but state the assumption explicitly (see Section 1).

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask via `AskUserQuestion`.
- If multiple interpretations exist, present them via `AskUserQuestion` — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask via `AskUserQuestion`.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification — and when clarification is needed, use `AskUserQuestion` (see Section 0).

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions (asked via `AskUserQuestion`) come before implementation rather than after mistakes.



<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:
specs/002-crop-system-mvp/plan.md
<!-- SPECKIT END -->
