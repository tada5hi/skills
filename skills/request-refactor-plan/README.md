# request-refactor-plan

> **Plan a refactor as a series of tiny commits through an interview, then file it as a GitHub issue.**
> Stop starting a refactor without a fixed scope and ending with one commit that breaks everything.

[All skills](../../README.md#skills) · [`SKILL.md`](./SKILL.md)

Frozen copy from [mattpocock/skills](https://github.com/mattpocock/skills); no upstream updates.

## Why request-refactor-plan?

A refactor that starts from a vague complaint grows as it goes: the scope widens, the tests turn out to be missing, and the change lands as one large commit nobody can review. The skill checks your description against the code, questions the approach and the scope, and writes a plan in which every commit leaves the code working.

| Concern | Without it | With request-refactor-plan |
|---|---|---|
| **Problem** | Described from memory | Explores the repository to verify your assertions |
| **Alternatives** | The first idea wins | Asks whether you considered other options and presents some |
| **Scope** | Grows while you work | Settles what changes and what explicitly does not |
| **Safety net** | Discovered missing mid-refactor | Checks test coverage of the area and asks for your testing plan if it is thin |
| **Steps** | One large commit | A long list of the smallest possible commits, each leaving the code working |

## Installation

```bash
# this skill only, any Agent Skills agent
npx skills add tada5hi/skills --skill='request-refactor-plan'

# Claude Code: the plugin bundles every skill
/plugin marketplace add tada5hi/skills
/plugin install skills@tada5hi
```

## Triggering

**Ask for it.** The agent loads the skill when your request matches its description, for example:

- "plan a refactor"
- "create a refactoring RFC"
- "break this refactor into safe incremental steps"

**Invoke it directly.** Type `/request-refactor-plan` (installed with the skills CLI) or `/skills:request-refactor-plan` (Claude Code plugin).

## What it does

1. Asks you for a long, detailed description of the problem and any solution ideas.
2. Explores the repository to verify your assertions, then presents other options.
3. Interviews you in detail about the implementation and fixes the exact scope.
4. Checks test coverage of the affected area and asks how you plan to test if it is insufficient.
5. Breaks the work into tiny commits and files the plan as a GitHub issue.

## Requirements

- A repository with a GitHub remote where the agent can create issues, for example through an authenticated `gh` CLI.

## Output

One GitHub issue with the sections Problem Statement, Solution, Commits (a long plain-English list of the smallest possible commits), Decision Document, Testing Decisions, Out of Scope and optional Further Notes.

## Notes

- **Steps can be skipped.** The agent may leave out steps it does not consider necessary.
- **No file paths or code.** The decision document names modules, interfaces and contracts, not file paths or snippets, so the plan does not go stale.
- **It ends with the issue.** The workflow stops once the plan is filed; carrying out the commits is up to you.

## License

Frozen copy of [mattpocock/skills](https://github.com/mattpocock/skills) at `fb3629d`, MIT, see [LICENSE.md](./LICENSE.md). It no longer receives upstream updates.
