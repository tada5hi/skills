---
name: migrate-agent-docs
description: Migrate an existing project's oversized agent docs (CLAUDE.md, AGENTS.md, .agents/*.md) to the init-agent-docs layout - a small always-loaded core, on-demand topic files and lint-enforced size and history limits. Use when agent docs have grown large, when "CLAUDE.md loads too much", or when asked to "migrate agent docs", "split agent docs", "shrink architecture.md" or "adopt the agent docs budgets".
license: Apache-2.0
compatibility: Requires a git repository that already has CLAUDE.md/AGENTS.md and .agents/*.md, and Node.js for the split script.
metadata:
  author: tada5hi
  version: "2026.11.02"
allowed-tools: Read Write Edit Glob Grep Bash(node:*) Bash(npx eslint:*) Bash(npm:*) Bash(git:*) Bash(wc:*)
---

# migrate-agent-docs

> Shrink what `CLAUDE.md` loads into every session without losing a rule: move subsystem detail into topic files, then lock the size in with lint.

## Overview

Agent docs that grow by one paragraph per task end up loaded whole into every session (one project reached 715 KB in four months). [init-agent-docs](../init-agent-docs/SKILL.md) defines the target layout for new projects; this skill moves an existing project there:

- A small always-loaded core: `AGENTS.md` and the `.agents/*.md` guides `CLAUDE.md` imports.
- `.agents/topics/<name>.md`: per-subsystem detail and module maps, read on demand, never imported by `CLAUDE.md`.
- The "Writing agent docs" rule in `AGENTS.md`, and the `agentDocs` checks of `@tada5hi/eslint-config` (3.3.1 or later) or the fallback ratchet script that enforce it.

Moving and rewriting are separate steps, ideally separate pull requests. The move is mechanical and reviewable as "nothing lost"; condensing needs judgement and reading the code.

## Process

1. **Measure.** Bump `@tada5hi/eslint-config` to `^3.3.1` and run `npx eslint CLAUDE.md AGENTS.md .agents`. It reports every doc over 40000 bytes, every history phrase (`used to`, `no longer`, `before #N`, `pinned by`, `plan NNN`) outside code, and the total `CLAUDE.md` loads through its imports (60000 bytes by default). Without that config, use the init-agent-docs fallback: copy [lint-agent-docs.mjs](../init-agent-docs/templates/scripts/lint-agent-docs.mjs) and read the sizes from `wc -c`. When nothing is over a limit, skip to step 5.
2. **Plan the topics.** List the `##`/`###` headings and their sizes (`grep -n '^##' .agents/*.md`). One topic per subsystem or package, each under 40000 bytes (split a larger one by concern, e.g. `sandbox.md` and `sandbox-git.md`). A topic takes a subsystem's architecture section together with its module map from `structure.md` and its package-specific notes from `testing.md`, so one file holds everything about that area. What stays in the core: concepts, the main data flow or lifecycle, contracts every implementation keeps, error model, downstream contracts, and the rules a change outside a subsystem breaks silently.
3. **Split mechanically.** Write the plan as a map (format in the script header) and run [scripts/split-agent-docs.mjs](scripts/split-agent-docs.mjs) from the repository root: first without `--write` (sizes per topic, what stays, the headings left), then with it. It moves sections verbatim and refuses unmatched, ambiguous or doubly claimed headings, so no text is lost or duplicated. Move single paragraphs or bullets (not their own heading) by hand.
4. **Write the core by hand.**
   - In `architecture.md`, add a short "Cross-cutting Rules" section: one bullet per subsystem with only the invariants another area can break, each pointing to its topic file. End the file with a "Topic Files" table (file, what it covers).
   - Point each topic file's first line at when to read it (`Read before changing ...`).
   - In `AGENTS.md`, add the topic-files line to the guides list and the "Writing agent docs" section from the [init-agent-docs AGENTS.md template](../init-agent-docs/templates/AGENTS.md); remove any "keep these docs updated" note. In `CLAUDE.md`, add the comment that topic files are never imported.
   - Update the project's other rules that send content into the guides (for example "a finished plan's outcome moves into architecture.md"): only invariants go there, the rest goes to the PR.
5. **Fix what lint and the move broke.**
   - History phrases: delete `(plan NNN)` citations (or replace them with the issue or PR number) and state "no longer" facts in the present tense.
   - Links: an in-page anchor in moved text (`(#channels)`) now points into another file, and a relative link from `.agents/` needs `../` from `.agents/topics/`. Check every relative Markdown link resolves.
   - The lint script must reach the docs: `eslint .` does, a script listing directories needs `CLAUDE.md AGENTS.md .agents` added.
6. **Lock it in.** When the core still exceeds a default, set `agentDocs: { maxBytes, importMaxBytes }` in `eslint.config.js` just above the current size, with a comment to lower it as the docs shrink (fallback: run the ratchet once with `--init`). Run the project's full lint.
7. **Open the pull request** with a before/after size table (loaded every session, each core file, topic files) and the commands run. Say that text was moved, not condensed or re-checked.
8. **Condense and verify (follow-up).** Per file, keep invariants, silent traps and rejected alternatives (verdict plus one-line reason); cut history, before/after narration, spec lists, measurements and walkthroughs of what the code shows. Check each kept claim against the code: stale symbol names and misattributed checks are common. Lower the lint limits afterwards.

## Guidelines

- **Never lose a rule in the move.** Compare total bytes before and after the split (topics plus core should match within the added headings); the script's dry run shows it.
- **Keep headings when condensing**, so `architecture.md → *Section*` pointers keep resolving.
- **Do not raise a limit to fit new text.** Move the detail into a topic file instead; raising a limit is a policy change for the PR description.
- **Topic files are not imported**, not even one "important" one: the core's Cross-cutting Rules carry what every session needs.
- **One pull request per repository.** Several repositories can be moved in parallel (steps 1 to 7 per repository); review step 8 separately per repository.
- When the migration finds a template gap, propose it upstream with [update-agent-docs](../update-agent-docs/SKILL.md).
