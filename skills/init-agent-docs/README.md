# init-agent-docs

> **Write `CLAUDE.md`, `AGENTS.md` and `.agents/*.md` guides tailored to your project, with size limits enforced.**
> Stop explaining your build commands, layout and conventions to every coding agent in every session.

[All skills](../../README.md#skills) · [`SKILL.md`](./SKILL.md)

## Why init-agent-docs?

A coding agent starts each session without knowing how your project builds, where things live or which conventions it follows. A single hand-written instructions file either stays too thin to help or grows with every finished task until it costs more to load than it saves. The structure the skill uses keeps a small always-loaded core, moves detail into on-demand topic files and puts a lint check on the size.

| Concern | Without it | With init-agent-docs |
|---|---|---|
| **Getting started** | Write an instructions file from a blank page | Analyzes the manifest, layout, tech stack, build, tests and architecture, and fills templates with what it finds |
| **What to include** | One file with everything | `structure.md` always; `architecture.md`, `testing.md` and `conventions.md` only when the project has them |
| **Monorepos** | List packages by hand | Applications and packages tables, dependency layers and per-application layouts |
| **Docs growing back** | Every task appends a paragraph | Size and history-phrase checks through `@tada5hi/eslint-config` 3.3.1+, or a bundled ratchet script with budgets and CI steps |
| **Rules nobody follows** | Copy conventions from another project | Keeps each default rule only when the code follows it, and copies the file header from an existing source file |

## Installation

```bash
# this skill only, any Agent Skills agent
npx skills add tada5hi/skills --skill='init-agent-docs'

# Claude Code: the plugin bundles every skill
/plugin marketplace add tada5hi/skills
/plugin install skills@tada5hi
```

## Triggering

**Ask for it.** The agent loads the skill when your request matches its description, for example:

- "init agent docs"
- "create Claude docs"
- "set up for AI coding"

The agent may also use it when you set up a new repository for AI-assisted development.

**Invoke it directly.** Type `/init-agent-docs` (installed with the skills CLI) or `/skills:init-agent-docs` (Claude Code plugin).

## What it does

1. Reads `package.json` (or the equivalent manifest) and explores the layout, tech stack, build system, tests and architecture; for monorepos, every app and package and their dependencies.
2. Picks the guides that apply and the monorepo or single-package sections of each template.
3. Fills the [templates](./templates/) with project-specific content, removing placeholders, HTML comments and unused sections.
4. Writes `CLAUDE.md`, `AGENTS.md` and the selected `.agents/*.md` files in the project root, plus `.agents/references/` or `.agents/plans/` when their sections stay.
5. Enforces the size rules: bumps `@tada5hi/eslint-config` to `^3.3.1` if older (its `agentDocs` checks are on by default) and makes sure the lint script reaches the docs, or installs `scripts/lint-agent-docs.mjs`, writes `.agents/budget.json` with `--init` and adds two CI steps.

## Requirements

- A git repository with a `package.json` or a similar project manifest.

## Output

Files in your project root:

```text
CLAUDE.md                  # imports AGENTS.md and the guides that were created
AGENTS.md                  # overview, Quick Reference commands, links to guides
.agents/structure.md       # always
.agents/architecture.md    # when the architecture is notable
.agents/testing.md         # when tests exist
.agents/conventions.md     # when conventions are defined
scripts/lint-agent-docs.mjs, .agents/budget.json   # only without @tada5hi/eslint-config 3.3.1+
```

It may also edit `package.json` (the eslint-config bump or a `lint:agent-docs` script), `eslint.config.js` (raised limits, only when existing docs exceed the defaults) and the CI workflow (two lint steps on the fallback path), and create `.agents/references/` and `.agents/plans/` when the guides keep those sections.

`AGENTS.md` names the command that runs the checks: `npm run lint` or `npm run lint:agent-docs`.

## Notes

- **No verbatim templates.** Every section is filled with project-specific content, or left out. A project without tests gets no `testing.md`.
- **`CLAUDE.md` imports only what exists.** Topic files under `.agents/topics/` are never imported; agents read them on demand.
- **Budgets for the always-loaded set.** `AGENTS.md` stays under 200 lines and everything `CLAUDE.md` imports under about 60 KB in total.
- **No "keep these docs updated" note.** `AGENTS.md` gets a "Writing agent docs" section that limits what goes in, instead of inviting every task to add a paragraph.
- **Limits are raised only for existing docs.** It raises the `agentDocs` limits only when current docs already exceed the defaults, just above their size.
- **Already have large docs?** Use [migrate-agent-docs](../migrate-agent-docs/) to split them into this layout.

## License

Apache-2.0, see [LICENSE](../../LICENSE).
