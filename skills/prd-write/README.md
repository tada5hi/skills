# prd-write

> **Write a PRD through an interview and codebase exploration, then file it as a GitHub issue.**
> Stop drafting requirements alone and discovering the open decisions halfway through the build.

[All skills](../../README.md#skills) · [`SKILL.md`](./SKILL.md)

Frozen copy from [mattpocock/skills](https://github.com/mattpocock/skills); no upstream updates.

## Why prd-write?

A feature idea usually lives in your head as a problem and a rough solution. Written down without pushback, it leaves decisions open, rests on assumptions about the code that are not true, and turns into a document nobody can split into work. The skill questions you until the design is settled and writes the result in a fixed structure.

| Concern | Without it | With prd-write |
|---|---|---|
| **Assumptions** | You describe the code from memory | Explores the repository to verify what you say about it |
| **Open decisions** | Found during implementation | Interviews you branch by branch through the design tree until each decision is resolved |
| **Module design** | Decided while coding | Sketches the modules to build or change, looks for deep modules testable in isolation, and checks them with you |
| **Structure** | A free-form document | Problem, solution, numbered user stories, implementation and testing decisions, out of scope |

## Installation

```bash
# this skill only, any Agent Skills agent
npx skills add tada5hi/skills --skill='prd-write'

# Claude Code: the plugin bundles every skill
/plugin marketplace add tada5hi/skills
/plugin install skills@tada5hi
```

## Triggering

**Ask for it.** The agent loads the skill when your request matches its description, for example:

- "write a PRD"
- "create a product requirements document"
- "plan a new feature"

**Invoke it directly.** Type `/prd-write` (installed with the skills CLI) or `/skills:prd-write` (Claude Code plugin).

## What it does

1. Asks you for a long, detailed description of the problem and any ideas for solutions.
2. Explores the repository to verify your assertions and understand the current code.
3. Interviews you about every aspect of the plan until you share an understanding.
4. Sketches the major modules to build or modify, and asks which of them you want tests for.
5. Writes the PRD from its template and submits it as a GitHub issue.

## Requirements

- A repository with a GitHub remote where the agent can create issues, for example through an authenticated `gh` CLI.

## Output

One GitHub issue holding the PRD, with these sections: Problem Statement, Solution, User Stories (a long numbered list in the form "As an <actor>, I want a <feature>, so that <benefit>"), Implementation Decisions, Testing Decisions, Out of Scope and Further Notes.

The numbered user stories are what the next skills in the chain refer to: [prd-to-plan](../prd-to-plan/) turns the PRD into a phased plan in `./plans/`, and [prd-to-issues](../prd-to-issues/) breaks it into GitHub issues that link back to this one.

## Notes

- **Expect many questions.** The interview is meant to be relentless; the PRD is written only once the problem and solution are fully understood.
- **Steps can be skipped.** The agent may leave out steps it does not consider necessary.
- **No file paths or code.** Implementation decisions name modules, interfaces and contracts, not file paths or snippets, so the PRD does not go stale as the code moves.

## License

Frozen copy of [mattpocock/skills](https://github.com/mattpocock/skills) at `fb3629d`, MIT, see [LICENSE.md](./LICENSE.md). It no longer receives upstream updates.
