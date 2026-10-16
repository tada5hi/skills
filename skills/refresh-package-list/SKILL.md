---
name: refresh-package-list
description: Refresh the user's awesome-style package list (default tada5hi/awesome) against GitHub and npm, then open a pull request. Finds new repositories, archived/renamed/removed ones, monorepo packages that appeared or vanished, and deprecated npm packages. Use when asked to "refresh/update/sync my package list", "add my new repo to the awesome list", after publishing a new package, or when query-package-list found the list stale.
license: Apache-2.0
compatibility: Requires Node.js >= 18, git and the `gh` CLI authenticated with push access to the list repository.
metadata:
  author: tada5hi
  version: "2026.10.16"
allowed-tools: Bash(node:*) Bash(gh:*) Bash(git:*) Read Edit Write AskUserQuestion
---

# refresh-package-list

> Keep the list true: every public, maintained repository listed once, nothing dead listed, and every exclusion written down so it is not proposed again.

## The list

An awesome-style `README.md`, one line per repository (see [query-package-list](../query-package-list/SKILL.md) for the line format), plus one config comment the scan reads:

```md
<!-- package-list
owners: tada5hi, authup, routup
exclude:
- tada5hi/typescript-template: template
- tada5hi/docker-scan: superseded by tada5hi/docken
- @authup/*-console: app bundles
-->
```

- `owners`: accounts and orgs whose public repositories belong on the list. Repositories listed from other owners (an "Also maintaining" section) are checked but never proposed.
- `exclude`: repositories or npm packages deliberately left out, each with a reason; `*` matches any characters. Forks, archived repositories and GitHub template repositories are skipped without an entry.

Which repository (`<list-repo>` below): the one the user names, else `$PACKAGE_LIST_REPO`, else `tada5hi/awesome`.

A list without the block: add it first, with `owners:` set to the list's owner plus every org already linked from its entries, and an empty `exclude:`. That is the first change in the pull request.

## Steps

1. **Clone the list** into a fresh temporary directory (`mktemp -d`, referred to as `<dir>` below) and branch off the default branch:
   ```bash
   gh repo clone <list-repo> <dir>
   git -C <dir> checkout -b refresh/<YYYY-MM-DD>
   ```
2. **Scan.** Run the bundled script by its absolute path (`<skill>` is the folder that holds this SKILL.md). It is read-only and prints a Markdown report:
   ```bash
   node <skill>/scripts/scan.mjs <dir>/README.md
   ```
   Sections: lines that break the entry format, new repositories (with their public packages), gone/archived/private/renamed, package drift per monorepo, npm problems (deprecated, not published). The scan aborts on a rate limit or network error rather than reporting false findings; re-run it.
3. **Decide each finding:**
   | Finding | Action |
   |---------|--------|
   | Line that breaks the entry format | Fix the line; a repository it links then stops showing up as new |
   | New repo that ships something reusable | Add an entry in the fitting section; description from its README, not only the GitHub description |
   | New repo that is a profile, docs site, deployment, Helm chart, experiment or superseded | Add to `exclude:` with the reason |
   | Unclear (experiment or real library?) | Ask the user, batching all unclear repos into one question |
   | Archived, deleted, private | Remove the entry |
   | Renamed | Update the link and name |
   | Listed package no longer in the repo | Remove it from the marker |
   | Public but unlisted package | Add it if a consumer installs it directly; otherwise add it (or a pattern) to `exclude:` so it is not reported again |
   | Deprecated npm package | Remove it, or the whole entry when everything is deprecated; name the successor in `exclude:` |
4. **Keep the format strict**: one line per repository, the backtick marker, an en dash, a description ending in a period. Keep `## Contents` in sync when a section is added or emptied, and remove empty sections.
5. **Re-run the scan.** Every section should now be empty.
6. **Open a pull request.** Show the user the diff summary first, then write a PR body file listing added, removed and excluded repositories and packages (no AI attribution), and run:
   ```bash
   git -C <dir> commit -am "chore: refresh package list"
   git -C <dir> push -u origin HEAD
   gh pr create --repo <list-repo> --head refresh/<YYYY-MM-DD> --title "chore: refresh package list" --body-file <body-file>
   ```
   Remove `<dir>` afterwards.

## Rules

- The scan reports; you decide. Never add every new repository blindly.
- Descriptions say what the package does for the reader, in one sentence, no marketing adjectives.
- When nothing changed, say so and do not open an empty pull request.
