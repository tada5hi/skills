# query-package-list

> **Look up your own published packages before writing, porting or planning code that one of them already covers.**
> Stop rewriting a helper you published two years ago because you forgot it exists.

[All skills](../../README.md#skills) · [`SKILL.md`](./SKILL.md)

## Why query-package-list?

When you maintain many packages, it is easy to write a deep merge, an env parser or a migration lock again in a new project, or to let an agent do it. The decision to reuse happens early, while a plan or a subagent brief is written, and a package's README often lags behind what it actually exports.

| Concern | Without it | With query-package-list |
|---|---|---|
| **Remembering** | Rely on memory of what you published | Reads your whole awesome-style list (default `tada5hi/awesome`) |
| **Matching** | Search by package name | Shortlists by what the code must do, up to three entries per need |
| **Trusting READMEs** | Recommend from a one-line summary | Checks what the published package exports: npm tarball declarations, PyPI module, `action.yml` or plugin skills |
| **Plans and subagents** | A brief says "write a lock helper" | Writes the chosen package and API into the plan or brief |
| **Review** | Reinvented helpers pass as normal code | Audits a diff and reports each helper a listed package covers |

## Installation

```bash
# this skill only, any Agent Skills agent
npx skills add tada5hi/skills --skill='query-package-list'

# Claude Code: the plugin bundles every skill
/plugin marketplace add tada5hi/skills
/plugin install skills@tada5hi
```

## Triggering

**Ask for it.** The agent loads the skill when your request matches its description, for example:

- "do I have a package for X"
- "is there one of my libs that parses env variables"
- "which of my packages handles database migrations"

The agent should also pick it up without being asked when it is about to implement a generic helper (deep merge, nested path get/set, env parsing, config loading, DI container, HTTP client, validation, error classes, database locks or migrations, i18n, query parsing, Docker/Helm release tooling), when writing a plan or a subagent brief, when porting code from another repository, when adding a dependency, or when reviewing a diff for reinvented helpers.

**Invoke it directly.** Type `/query-package-list` (installed with the skills CLI) or `/skills:query-package-list` (Claude Code plugin).

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
- npm and Node.js to inspect npm packages; `pip` for PyPI packages.

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
- **Stale entries are flagged.** When the exports show a capability the list line misses, it says so; [refresh-package-list](../refresh-package-list/) updates the list.

## License

Apache-2.0, see [LICENSE](../../LICENSE).
