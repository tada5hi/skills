---
name: agent-docs-migrate
description: Migrate an existing project's oversized agent docs (CLAUDE.md, AGENTS.md, .agents/*.md) to the agent-docs-init layout - a small always-loaded core, on-demand topic files and lint-enforced size and history limits. Use when agent docs have grown large, when "CLAUDE.md loads too much", when the docs name tada5hi/skills skills by their old verb-first names (init-agent-docs, create-pull-request, query-package-list, …), when they lack rules that newer agent-docs-init templates carry (e.g. the testing "Test Scope" section), or when asked to "migrate agent docs", "sync agent docs with the templates", "split agent docs", "shrink architecture.md" or "adopt the agent docs budgets".
license: Apache-2.0
compatibility: Requires a git repository that already has CLAUDE.md/AGENTS.md and .agents/*.md, and Node.js for the split script.
metadata:
  author: tada5hi
  version: "2026.11.21"
allowed-tools: Read Write Edit Glob Grep Bash(node:*) Bash(npx eslint:*) Bash(npm:*) Bash(git:*) Bash(gh:*) Bash(wc:*) Bash(cp:*) Bash(grep:*) Bash(sed:*) Bash(paste:*) Bash(ls:*) Skill
---

# agent-docs-migrate

> Shrink what `CLAUDE.md` loads into every session without losing a rule: move subsystem detail into topic files, then lock the size in with lint.

## Overview

[agent-docs-init](../agent-docs-init/SKILL.md) defines the target layout; this skill moves an existing project there:

- A small always-loaded core: `AGENTS.md` and the `.agents/*.md` guides `CLAUDE.md` imports.
- `.agents/topics/<name>.md`: per-subsystem detail and module maps, read on demand, never imported by `CLAUDE.md`.
- The rule sections of the current agent-docs-init templates, such as the "Test Scope" section in `testing.md`.
- The "Writing agent docs" rule in `AGENTS.md`, enforced by the `agentDocs` checks of `@tada5hi/eslint-config` 3.3.1+ or the fallback ratchet script.

Moving (mechanical, reviewable as "nothing lost") and condensing (judgement, reading the code) are separate steps, ideally separate pull requests.

## Process

1. **Measure.** Bump `@tada5hi/eslint-config` to `^3.3.1` and run `npx eslint CLAUDE.md AGENTS.md .agents`. It reports every doc over 40000 bytes, every history phrase (`used to`, `no longer`, `before #N`, `pinned by`, `plan NNN`) outside code, and the total `CLAUDE.md` loads through its imports (60000 bytes by default). Without that config, use the agent-docs-init fallback: copy [lint-agent-docs.mjs](../agent-docs-init/templates/scripts/lint-agent-docs.mjs) and read the sizes from `wc -c`. When nothing is over a limit, skip to step 5.
2. **Plan the topics.** List the `##`/`###` headings and their sizes (`grep -n '^##' .agents/*.md`). One topic per subsystem or package, each under 40000 bytes (split a larger one by concern, e.g. `sandbox.md` and `sandbox-git.md`). A topic takes a subsystem's architecture section together with its module map from `structure.md` and its package-specific notes from `testing.md`, so one file holds everything about that area. What stays in the core: concepts, the main data flow or lifecycle, contracts every implementation keeps, error model, downstream contracts, and the rules a change outside a subsystem breaks silently.
3. **Split mechanically.** Write the plan as a map (format in the script header) and run [scripts/split-agent-docs.mjs](scripts/split-agent-docs.mjs) from the repository root by its path in this skill (`node <skill-dir>/scripts/split-agent-docs.mjs <map.json>`): first without `--write` (sizes per topic, what stays, the headings left), then with it. It moves sections verbatim and refuses unmatched, ambiguous or doubly claimed headings, so no text is lost or duplicated. Move single paragraphs or bullets (not their own heading) by hand.
4. **Write the core by hand.**
   - In `architecture.md`, add a short "Cross-cutting Rules" section: one bullet per subsystem with only the invariants another area can break, each pointing to its topic file. End the file with a "Topic Files" table (file, what it covers).
   - Point each topic file's first line at when to read it (`Read before changing ...`).
   - In `AGENTS.md`, add the topic-files line to the guides list and the "Writing agent docs" section from the [agent-docs-init AGENTS.md template](../agent-docs-init/templates/AGENTS.md); remove any "keep these docs updated" note. In `CLAUDE.md`, add the comment that topic files are never imported.
   - Update the project's other rules that send content into the guides (for example "a finished plan's outcome moves into architecture.md"): only invariants go there, the rest goes to the PR.
5. **Fix what lint and the move broke.**
   - History phrases: delete `(plan NNN)` citations (or replace them with the issue or PR number) and state "no longer" facts in the present tense.
   - Links: an in-page anchor in moved text (`(#channels)`) now points into another file, and a relative link from `.agents/` needs `../` from `.agents/topics/`. Check every relative Markdown link resolves.
   - Skill names: the docs may name skills by their old verb-first names (`query-package-list`, `create-pull-request`). Find them with the command in [references/renamed-skills.md](references/renamed-skills.md) (replace `<skill-dir>` with this skill's directory) and replace each with its new name.
   - The lint script must reach the docs: `eslint .` does, a script listing directories needs `CLAUDE.md AGENTS.md .agents` added.
6. **Add missing template rules.** Compare each guide with its [agent-docs-init template](../agent-docs-init/templates/) (`AGENTS.md` and each `.agents/*.md`) and list the rule sections the project lacks, such as "Test Scope" in `testing.md`. A rule section states how agents must work; sections that record project facts (setup, commands, layout tables) stay as the project has them. Add each missing rule whose HTML comment condition holds for the project, with its placeholders filled from the code and the comment left out. Done when every rule section of every matching template is in the docs or listed in the pull request description with the reason it does not apply.
7. **Lock it in.** When the core still exceeds a default, set `agentDocs: { maxBytes, importMaxBytes }` in `eslint.config.js` just above the current size, with a comment to lower it as the docs shrink (fallback: run the ratchet once with `--init`). Run the project's full lint.
8. **Open the pull request** with [pr-create](../pr-create/SKILL.md) (it branches, commits and asks first), with a before/after size table (loaded every session, each core file, topic files) and the commands run. Say that text was moved, not condensed or re-checked.
9. **Condense and verify (follow-up).** Per file, keep invariants, silent traps and rejected alternatives (verdict plus one-line reason); cut history, before/after narration, spec lists, measurements and walkthroughs of what the code shows. Check each kept claim against the code: stale symbol names and misattributed checks are common. Lower the lint limits afterwards.

## Guidelines

- **Never lose a rule in the move.** Topics plus core must match the bytes before the split, give or take the added headings; the dry run shows both.
- **Keep headings when condensing**, so `architecture.md → *Section*` pointers keep resolving.
- **Do not raise a limit to fit new text.** Move the detail into a topic file instead; raising a limit is a policy change for the PR description.
- **Topic files are not imported**, not even one "important" one: the core's Cross-cutting Rules carry what every session needs.
- **One pull request per repository.** Several repositories can be moved in parallel (steps 1 to 8 per repository); review step 9 separately per repository.
- When the migration finds a template gap, propose it upstream with [agent-docs-update](../agent-docs-update/SKILL.md).
