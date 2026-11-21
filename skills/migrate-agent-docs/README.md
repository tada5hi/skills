# migrate-agent-docs

> **Move oversized agent docs into on-demand topic files and lock their size in with lint.**
> Stop loading every subsystem's detail into every session through `CLAUDE.md`.

[All skills](../../README.md#skills) · [`SKILL.md`](./SKILL.md)

## Why migrate-agent-docs?

Agent docs that grow by one paragraph per task end up loaded whole into every session. [init-agent-docs](../init-agent-docs/) sets up the target layout for new projects; an existing project needs its docs moved there without losing a rule. Doing it by hand means cutting sections across files, fixing links and hoping nothing was dropped or duplicated.

| Concern | Without it | With migrate-agent-docs |
|---|---|---|
| **Size** | Guess which file is too big | Runs the `agentDocs` lint checks of `@tada5hi/eslint-config` (or a fallback script) for per-file and loaded-total limits |
| **Moving text** | Cut and paste sections by hand | Moves whole sections verbatim with a script that refuses unmatched, ambiguous or doubly claimed headings |
| **What stays loaded** | Everything `CLAUDE.md` imports | A small core plus a "Cross-cutting Rules" section; detail goes to `.agents/topics/<name>.md`, read on demand |
| **History in docs** | "used to", "no longer", plan numbers pile up | Lint flags history phrases; it removes plan citations and restates the facts in the present tense |
| **Regrowth** | Docs creep back up | Sets lint limits just above the current size, to lower as the docs shrink |

## Installation

```bash
# this skill only, any Agent Skills agent
npx skills add tada5hi/skills --skill='migrate-agent-docs'

# Claude Code: the plugin bundles every skill
/plugin marketplace add tada5hi/skills
/plugin install skills@tada5hi
```

## Triggering

**Ask for it.** The agent loads the skill when your request matches its description, for example:

- "migrate agent docs"
- "split agent docs"
- "shrink architecture.md"
- "adopt the agent docs budgets"
- "CLAUDE.md loads too much"

The agent may also use it when your agent docs have grown large.

**Invoke it directly.** Type `/migrate-agent-docs` (installed with the skills CLI) or `/skills:migrate-agent-docs` (Claude Code plugin).

## What it does

1. Measures: bumps `@tada5hi/eslint-config` to `^3.3.1` and lints `CLAUDE.md AGENTS.md .agents` for sizes, history phrases and the total `CLAUDE.md` loads. When nothing is over a limit, it skips to step 5.
2. Plans one topic per subsystem or package, each under 40000 bytes, and writes the plan as a JSON map.
3. Runs [`scripts/split-agent-docs.mjs`](./scripts/split-agent-docs.mjs) as a dry run, then with `--write`, to move the sections into `.agents/topics/`.
4. Writes the core by hand: "Cross-cutting Rules" and a "Topic Files" table in `architecture.md`, a "Read before changing ..." first line per topic, and the "Writing agent docs" section in `AGENTS.md`.
5. Fixes what lint and the move broke: history phrases, in-page anchors and relative links from `.agents/topics/`.
6. Sets `agentDocs` limits in `eslint.config.js` where the core still exceeds a default, and runs the project's full lint.
7. Opens the pull request with a before/after size table and the commands run; condensing the moved text is a separate follow-up.

## Requirements

- A git repository that already has `CLAUDE.md` or `AGENTS.md` and `.agents/*.md`.
- Node.js, for the split script and ESLint.
- npm, to bump `@tada5hi/eslint-config` to 3.3.1 or later. Without that config, the skill uses the [fallback lint script](../init-agent-docs/templates/scripts/lint-agent-docs.mjs) from init-agent-docs.

## Output

A pull request with new `.agents/topics/*.md`, trimmed `.agents/*.md`, updated `AGENTS.md`, `CLAUDE.md` and `eslint.config.js`, and a bumped `@tada5hi/eslint-config`. The pull request description carries a size table:

```text
| Docs                     | Before    | After    |
|--------------------------|-----------|----------|
| Loaded every session     | 182000 B  | 41000 B  |
| .agents/architecture.md  | 96000 B   | 18000 B  |
| Topic files (7)          | -         | 139000 B |
```

## Notes

- **Moving, not rewriting.** The script moves text verbatim; the pull request says so. Condensing and checking claims against the code is step 8, in a separate pull request.
- **Topic files are never imported.** Not even one; the core's Cross-cutting Rules carry what every session needs.
- **Limits do not go up to fit text.** New detail goes into a topic file instead.
- **Headings stay.** Condensing keeps headings so `architecture.md → Section` pointers still resolve.
- **One pull request per repository.** Several repositories can be migrated in parallel.

## License

Apache-2.0, see [LICENSE](../../LICENSE).
