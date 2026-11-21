# prd-to-plan

> **Turn a PRD into a multi-phase implementation plan of tracer-bullet slices, saved in `./plans/`.**
> Stop ordering the work layer by layer and finding out at the end that nothing runs end to end.

[All skills](../../README.md#skills) · [`SKILL.md`](./SKILL.md)

Frozen copy from [mattpocock/skills](https://github.com/mattpocock/skills); no upstream updates.

## Why prd-to-plan?

A PRD says what to build, not in which order. Planned by layer (schema first, then API, then UI), nothing is demoable until the last phase, and plans full of file and function names go stale after the first phase. The skill cuts the PRD into thin vertical slices, each one verifiable on its own, and writes them to a local file.

| Concern | Without it | With prd-to-plan |
|---|---|---|
| **Slicing** | Phases by layer | Each phase is a narrow but complete path through schema, API, UI and tests |
| **Shared decisions** | Repeated or contradicted per phase | Routes, schema shape, key models and auth approach go once into the plan header |
| **Staleness** | File and function names that change | Only durable decisions; no file names, function names or likely-to-change details |
| **Granularity** | Fixed by whoever writes it | You review the breakdown and it iterates until you approve it |

## Installation

```bash
# this skill only, any Agent Skills agent
npx skills add tada5hi/skills --skill='prd-to-plan'

# Claude Code: the plugin bundles every skill
/plugin marketplace add tada5hi/skills
/plugin install skills@tada5hi
```

## Triggering

**Ask for it.** The agent loads the skill when your request matches its description, for example:

- "break down this PRD"
- "create an implementation plan"
- "plan phases from the PRD"
- "use tracer bullets for this"

**Invoke it directly.** Type `/prd-to-plan` (installed with the skills CLI) or `/skills:prd-to-plan` (Claude Code plugin).

## What it does

1. Confirms the PRD is in the conversation, or asks you to paste it or point to the file.
2. Explores the codebase for the current architecture, patterns and integration layers.
3. Identifies durable architectural decisions: routes, schema shape, key models, auth, third-party boundaries.
4. Drafts tracer-bullet phases, preferring many thin slices over a few thick ones.
5. Shows the phases with the user stories each covers, and asks about granularity and merging or splitting.
6. Writes the approved plan to `./plans/<feature>.md`, creating the directory if needed.

## Requirements

- A PRD, pasted into the conversation or in a file. [prd-write](../prd-write/) produces one with the numbered user stories this skill maps to phases.

## Output

A Markdown file such as `./plans/user-onboarding.md`: a source PRD reference, an "Architectural decisions" header, then one section per phase with its user stories, a "What to build" description and an acceptance criteria checklist.

## Notes

- **Local file only.** The output is the plan file in `./plans/`. To turn a PRD into GitHub issues instead, use [prd-to-issues](../prd-to-issues/).
- **You approve before it writes.** The plan file is written only after you accept the breakdown.

## License

Frozen copy of [mattpocock/skills](https://github.com/mattpocock/skills) at `fb3629d`, MIT, see [LICENSE.md](./LICENSE.md). It no longer receives upstream updates.
