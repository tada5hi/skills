---
name: plan-status
description: Read structured plan files (Markdown with checklists/phases) and report progress by cross-referencing the plan against the current codebase state. Use when asked to "check plan status", "plan progress", "where did I leave off", or "what's next".
license: Apache-2.0
compatibility: Requires a project with plan files in .agents/plans/ or a specified path.
metadata:
  author: tada5hi
  version: "2026.03.26"
allowed-tools: Bash(git:*) Read Edit Write Glob Grep Agent AskUserQuestion
---

# plan-status

> Read structured plan files, parse phases and checklists, and report progress by verifying tasks against the current codebase state.

## Step 1: Locate plan files

Find all plan files to analyze.

1. If `$ARGUMENTS` specifies a file path or glob pattern, use that directly.
2. Otherwise, scan the `.agents/plans/` directory for Markdown files:
   ```bash
   ls -1 .agents/plans/*.md 2>/dev/null
   ```
3. If no plan files are found in either location, inform the user and stop.
4. List all discovered plan files before proceeding.

## Step 2: Parse plan structure

Read each plan file and extract its structure.

1. **Read the file** in full using the Read tool.
2. **Parse phases** — identify sections that represent phases:
   - `##` or `###` headings containing "Phase" (e.g., `## Phase 1: Setup`, `### Phase 2 — Implementation`)
   - Numbered headings without the word "Phase" that group related tasks (e.g., `## 1. Database layer`)
   - If no phase headings exist, treat the entire file as a single phase.
3. **Parse checklist items** within each phase:
   - `- [ ]` — incomplete task
   - `- [x]` — complete task
   - Handle nested checklists (indented sub-tasks under a parent task).
4. **Record dependencies** — look for notes like "depends on Phase X", "after Phase 1", or "blocked by" within task descriptions.
5. Build an internal structure: for each phase, track its name, task list (with completion status), and any declared dependencies.

## Step 3: Verify completion against codebase

For each task marked as incomplete (`- [ ]`), attempt to verify whether the work has actually been done:

1. **Extract file paths** mentioned in the task description (e.g., `src/auth.ts`, `tests/auth.test.ts`).
2. **Check file existence** using Glob — do the referenced files exist?
3. **Check for expected patterns** using Grep:
   - If the task says "add function X", grep for `function X` or `const X`.
   - If the task says "rename X to Y", grep for `Y` and confirm `X` is absent.
   - If the task says "add test for X", look for test files containing `X`.
4. **Check build/lint status** if the task involves code changes:
   - Look at `package.json` for available scripts.
   - Run `npm run lint` or equivalent if applicable — but only once, not per-task.
5. **Mark verification result** for each task:
   - **Verified complete** — evidence found in codebase that work is done
   - **Incomplete** — no evidence found, task is genuinely pending
   - **Partially complete** — some evidence found but not all aspects done
   - **Unable to verify** — task is too abstract to check programmatically

For tasks already marked complete (`- [x]`), skip verification unless the user specifically requests re-verification.

## Step 4: Generate status report

Output a structured summary with the following format:

### Per-phase summary

For each phase, report:
- **Phase name and status**: one of `COMPLETE`, `IN PROGRESS`, `NOT STARTED`, or `BLOCKED`
  - `COMPLETE` — all tasks marked done (or verified done)
  - `IN PROGRESS` — at least one task done and at least one remaining
  - `NOT STARTED` — no tasks done
  - `BLOCKED` — depends on an incomplete phase
- **Task counts**: e.g., `4/7 tasks complete`
- **Completed tasks**: list with checkmarks
- **Remaining tasks**: list with empty checkboxes
- **Tasks verified as done but not yet checked off**: highlight these separately

### Overall progress

- Total tasks complete vs total tasks
- Percentage complete
- **Current phase**: the first phase that is `IN PROGRESS` or `NOT STARTED`
- **Next actionable task**: the first incomplete task in the current phase that is not blocked
- **Blocking dependencies**: list any phases that cannot start until others finish

### Example output

```
## Plan Status: implementation-plan.md

### Phase 1: Project Setup — COMPLETE (3/3 tasks)
- [x] Initialize project with TypeScript config
- [x] Set up ESLint and Prettier
- [x] Create directory structure

### Phase 2: Core Implementation — IN PROGRESS (2/5 tasks)
- [x] Create database schema
- [x] Implement base repository class
- [ ] Add authentication middleware ← **next task**
- [ ] Implement rate limiting
- [ ] Add request validation

### Phase 3: Testing — NOT STARTED (0/4 tasks)
- [ ] Unit tests for repositories
- [ ] Integration tests for API
- [ ] E2E test setup
- [ ] CI pipeline configuration

---
**Overall: 5/12 tasks complete (42%)**
**Current phase: Phase 2 — Core Implementation**
**Next task: Add authentication middleware**
```

## Step 5: Optionally update plan file

If any tasks were verified as complete in Step 3 but are still marked `- [ ]` in the plan file:

1. Present the list of tasks that appear to be done but are not checked off.
2. **Ask the user for confirmation** before making any changes:
   ```
   The following tasks appear complete based on codebase evidence but are not checked off:
   - [ ] Create database schema (found: src/db/schema.ts)
   - [ ] Implement base repository class (found: src/repositories/base.ts)

   Would you like me to update the plan file to mark these as complete?
   ```
3. Only after the user confirms, update the plan file by replacing `- [ ]` with `- [x]` for the confirmed tasks.
4. Do NOT update tasks the user declines or tasks you could not verify.
