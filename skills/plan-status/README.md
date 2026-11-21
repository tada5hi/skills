# plan-status

> **Report how far a Markdown plan has come by checking its checklists against the code.**
> Stop rereading a plan and grepping the codebase to work out where you left off.

[All skills](../../README.md#skills) · [`SKILL.md`](./SKILL.md)

## Why plan-status?

A plan with phases and checklists drifts from the code: tasks get done without being ticked off, and after a break it is unclear which phase you are in or what comes next. Finding out by hand means reading the whole plan and searching the codebase for every open task.

| Concern | Without it | With plan-status |
|---|---|---|
| **Finding plans** | Remember where the plan file lives | Reads the path you pass, or every Markdown file in `.agents/plans/` |
| **Open tasks** | Trust the checkboxes | Checks each unticked task for evidence: referenced files, expected symbols, tests |
| **Where you are** | Count checkboxes per phase | Marks each phase `COMPLETE`, `IN PROGRESS`, `NOT STARTED` or `BLOCKED`, with task counts |
| **What's next** | Scan for the first open item | Names the current phase, the next unblocked task and blocking dependencies |
| **Stale checkboxes** | Tick them off by hand | Lists tasks that look done and ticks them off after you confirm |

## Installation

```bash
# this skill only, any Agent Skills agent
npx skills add tada5hi/skills --skill='plan-status'

# Claude Code: the plugin bundles every skill
/plugin marketplace add tada5hi/skills
/plugin install skills@tada5hi
```

## Triggering

**Ask for it.** The agent loads the skill when your request matches its description, for example:

- "check plan status"
- "plan progress"
- "where did I leave off"
- "what's next"

**Invoke it directly.** Type `/plan-status` (installed with the skills CLI) or `/skills:plan-status` (Claude Code plugin). Pass a file path or glob to read specific plans instead of `.agents/plans/`: `/plan-status docs/plans/*.md`.

## What it does

1. Finds the plan files from your argument, or in `.agents/plans/`, and lists them; with none found, it tells you and stops.
2. Parses phases (headings with "Phase" or numbered headings), checklist items including nested ones, and declared dependencies such as "depends on Phase 1".
3. Looks for evidence of each unticked task: files it mentions, functions it names, renames, tests, and one lint run when tasks involve code changes.
4. Marks each open task as verified complete, incomplete, partially complete or unable to verify.
5. Reports per-phase status and overall progress.
6. Lists tasks that look done but are not ticked off and asks whether to update the plan file.

## Requirements

- Plan files in `.agents/plans/`, or a path you pass, written as Markdown with `- [ ]` and `- [x]` checklists.
- A git repository with the code the plan describes.

## Output

A report in the chat, one block per plan:

```text
## Plan Status: implementation-plan.md

### Phase 2: Core Implementation — IN PROGRESS (2/5 tasks)
- [x] Create database schema
- [x] Implement base repository class
- [ ] Add authentication middleware ← **next task**

---
**Overall: 5/12 tasks complete (42%)**
**Current phase: Phase 2 — Core Implementation**
**Next task: Add authentication middleware**
```

When you confirm, the plan file changes `- [ ]` to `- [x]` for the tasks you approved.

## Notes

- **It asks before editing.** The plan file changes only after you confirm, and only for the tasks you approve.
- **Ticked tasks are trusted.** Tasks already marked `- [x]` are not re-checked unless you ask for it.
- **Abstract tasks stay open.** A task it cannot check in the code is reported as unable to verify, not as done.
- **No phases, one phase.** A plan without phase headings is treated as a single phase.

## License

Apache-2.0, see [LICENSE](../../LICENSE).
