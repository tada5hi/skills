---
name: plan-status-report
description: Read structured plan files (Markdown with checklists/phases) and report progress by cross-referencing the plan against the current codebase state. Use when asked to "check plan status", "plan progress", "where did I leave off", or "what's next".
license: Apache-2.0
compatibility: Requires a project with plan files in .agents/plans/ or a specified path.
metadata:
  author: tada5hi
  version: "2026.11.21"
allowed-tools: Bash(git:*) Bash(ls:*) Bash(npm:*) Read Edit Write Glob Grep Agent AskUserQuestion
---

# plan-status-report

> Read structured plan files, parse phases and checklists, and report progress by verifying tasks against the current codebase state.

## Step 1: Locate plan files

1. If `$ARGUMENTS` gives a file path or glob, use it.
2. Otherwise list the Markdown files in `.agents/plans/`:
   ```bash
   ls -1 .agents/plans/*.md 2>/dev/null
   ```
3. If no plan files are found, tell the user and stop.
4. List the plan files found before proceeding.

## Step 2: Parse plan structure

Read each plan file in full and extract:

1. **Phases**: `##` or `###` headings containing "Phase" (`## Phase 1: Setup`, `### Phase 2 — Implementation`), or numbered headings that group tasks (`## 1. Database layer`). Without such headings, the whole file is one phase.
2. **Checklist items** per phase: `- [ ]` incomplete, `- [x]` complete, including nested sub-tasks.
3. **Dependencies**: notes such as "depends on Phase X", "after Phase 1", "blocked by".

## Step 3: Verify open tasks against the codebase

For each `- [ ]` task, look for evidence that the work is done:

1. **Files** the task mentions (`src/auth.ts`, `tests/auth.test.ts`): check they exist with Glob.
2. **Patterns** with Grep: "add function X" → `function X` or `const X`; "rename X to Y" → `Y` present and `X` absent; "add test for X" → test files containing `X`.
3. **Lint**, when tasks involve code changes: find the script in `package.json` and run it (`npm run lint`) once, not per task.

Classify each task as **verified complete**, **incomplete**, **partially complete** (some aspects done) or **unable to verify** (too abstract to check).

Do not re-verify `- [x]` tasks unless the user asks.

## Step 4: Generate status report

Per phase:

- **Name and status**: `COMPLETE` (all tasks marked or verified done), `IN PROGRESS` (at least one done, one remaining), `NOT STARTED` (none done) or `BLOCKED` (depends on an incomplete phase).
- **Task count**, e.g. `4/7 tasks complete`.
- Completed tasks as `- [x]`, remaining tasks as `- [ ]`.
- Tasks verified as done but not yet checked off, listed separately.

Overall:

- Tasks complete vs total, and the percentage.
- **Current phase**: the first phase that is `IN PROGRESS` or `NOT STARTED`.
- **Next task**: the first incomplete, unblocked task in the current phase.
- **Blocking dependencies**: phases that cannot start until others finish.

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

## Step 5: Offer to update the plan file

If tasks were verified complete in Step 3 but are still `- [ ]`, list them with their evidence and ask before changing anything:

```
The following tasks appear complete based on codebase evidence but are not checked off:
- [ ] Implement rate limiting (found: src/middleware/rate-limit.ts)

Would you like me to update the plan file to mark these as complete?
```

Only after confirmation, replace `- [ ]` with `- [x]` for the confirmed tasks. Never tick tasks the user declined or that could not be verified.
