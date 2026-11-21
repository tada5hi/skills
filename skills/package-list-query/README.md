# package-list-query

> **Look up your own published packages before writing, porting or planning code that one of them already covers.**
> Stop rewriting a helper you published two years ago because you forgot it exists.

[All skills](../../README.md#skills) · [`SKILL.md`](./SKILL.md)

## Why package-list-query?

| Concern | Without it | With package-list-query |
|---|---|---|
| **Remembering** | Rely on memory of what you published | Reads your whole awesome-style list (default `tada5hi/awesome`) |
| **Matching** | Search by package name | Shortlists by what the code must do, up to three entries per need |
| **Trusting READMEs** | Recommend from a one-line summary | Checks what the published package exports: npm tarball declarations, PyPI module, `action.yml` or plugin skills |
| **Plans and subagents** | A brief says "write a lock helper" | Writes the chosen package and API into the plan or brief |
| **Review** | Reinvented helpers pass as normal code | Audits a diff and reports each helper a listed package covers |

## Installation

```bash
# this skill only, any Agent Skills agent
npx skills add tada5hi/skills --skill='package-list-query'

# Claude Code: the plugin bundles every skill
/plugin marketplace add tada5hi/skills
/plugin install skills@tada5hi
```

## Triggering

**Ask for it.** The agent loads the skill when your request matches its description, for example:

- "do I have a package for X"
- "is there one of my libs that parses env variables"
- "which of my packages handles database migrations"

The agent should also pick it up unasked when it is about to implement a generic helper, write a plan or subagent brief, port code, add a dependency, or review a diff.

**Invoke it directly.** Type `/package-list-query` (installed with the skills CLI) or `/skills:package-list-query` (Claude Code plugin).

## What it does

1. Fetches the whole list from the repository you name, else `$PACKAGE_LIST_REPO`, else `tada5hi/awesome`, and reads all of it.
2. Splits the request into separate needs and shortlists candidates by what the code must do.
3. Verifies each candidate against what the published package exposes, unpacked in a temporary directory that it removes afterwards.
4. Checks whether the current project already depends on the package or its plan chooses it.
5. Answers per fit with the package, why it fits, the install command and a minimal sample.

To audit a diff, it lists what the changed code does by need, runs steps 1 to 4, and reports a table of file and symbol, covering package and API, and full or partial fit.

## Requirements

- Network access to GitHub, and to npm or PyPI for the candidates it verifies.
- The `gh` CLI, or `curl` to fetch the list without it.
- npm and Node.js to inspect npm packages; `pip` and `unzip` for PyPI packages.

## Output

An answer in the chat, for example:

```text
smob – deep-merges objects; already used for config merging in another of your projects.
npm install smob

import { merge } from 'smob';
merge({ a: 1 }, { b: 2 }, { c: 3 });
```

When nothing fits, it says so in one line and carries on with the normal approach.

## Notes

- **It never adds a dependency on its own.** It suggests one and waits for your go-ahead, unless the project already has the package or its plan chooses it.
- **No recommendation from the list line alone.** Every candidate is checked against its published exports first.
- **Partial fits are named.** It says what is missing and suggests adding it to the package rather than copying the rest.
- **Your packages only.** The list does not replace well-known libraries the project already uses.
- **Stale entries are flagged.** When the exports show a capability the list line misses, it says so; [package-list-refresh](../package-list-refresh/) updates the list.

## License

Apache-2.0, see [LICENSE](../../LICENSE).
