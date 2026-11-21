# prd-to-issues

> **Break a PRD issue into independently grabbable GitHub issues, one per tracer-bullet slice.**
> Stop writing tickets by hand and working out which one blocks which.

[All skills](../../README.md#skills) · [`SKILL.md`](./SKILL.md)

Frozen copy from [mattpocock/skills](https://github.com/mattpocock/skills); no upstream updates.

## Why prd-to-issues?

A PRD in a GitHub issue is too large for anyone to pick up. Split by layer, the tickets depend on each other and none can be verified alone; split by hand, the blockers and the link back to the user stories get lost. The skill drafts thin vertical slices, lets you correct them, and files them in dependency order.

| Concern | Without it | With prd-to-issues |
|---|---|---|
| **Slicing** | One ticket per layer | Each issue is a narrow but complete path through schema, API, UI and tests |
| **Who can take it** | Unclear which tickets need you | Marks each slice HITL (needs a human decision or review) or AFK (can be built and merged alone), preferring AFK |
| **Dependencies** | Written in prose, or not at all | Creates blockers first so "Blocked by" references real issue numbers |
| **Traceability** | Tickets drift from the PRD | Every issue links the parent PRD and lists the user stories it covers |

## Installation

```bash
# this skill only, any Agent Skills agent
npx skills add tada5hi/skills --skill='prd-to-issues'

# Claude Code: the plugin bundles every skill
/plugin marketplace add tada5hi/skills
/plugin install skills@tada5hi
```

## Triggering

**Ask for it.** The agent loads the skill when your request matches its description, for example:

- "convert this PRD to issues"
- "create implementation tickets"
- "break down the PRD into work items"

**Invoke it directly.** Type `/prd-to-issues` (installed with the skills CLI) or `/skills:prd-to-issues` (Claude Code plugin). It asks for the PRD issue number or URL.

## What it does

1. Asks for the PRD issue number or URL, and fetches it with its comments via `gh issue view` if needed.
2. Explores the codebase, if it has not already.
3. Drafts vertical slices and marks each as HITL or AFK.
4. Shows each slice's title, type, blockers and user stories, and asks about granularity, dependencies and the HITL/AFK split until you approve.
5. Creates one issue per slice with `gh issue create`, blockers first.

## Requirements

- An authenticated `gh` CLI with permission to create issues in the repository.
- A PRD filed as a GitHub issue, for example by [prd-write](../prd-write/).

## Output

One GitHub issue per approved slice, each with the sections Parent PRD (`#<number>`), What to build, Acceptance criteria, Blocked by ("None - can start immediately" when there are none) and User stories addressed.

## Notes

- **The PRD issue stays as it is.** The skill never closes or edits the parent PRD.
- **Nothing is filed before you approve.** Issues are created only after you accept the breakdown.
- **Want a local plan instead?** [prd-to-plan](../prd-to-plan/) writes the same kind of slices as phases in `./plans/`.

## License

Frozen copy of [mattpocock/skills](https://github.com/mattpocock/skills) at `fb3629d`, MIT, see [LICENSE.md](./LICENSE.md). It no longer receives upstream updates.
