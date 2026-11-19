---
name: query-package-list
description: Look up the user's own published packages in their awesome-style package list (default tada5hi/awesome) before writing, porting or planning code, and audit a diff for code that duplicates one of them. Use when about to implement a generic helper (deep merge, nested path get/set, env parsing, config loading, DI container, HTTP client, validation, error classes, database locks or migrations, i18n, query parsing, Docker/Helm release tooling), when writing a plan or a subagent brief, when porting code from another repository, when adding a dependency, when reviewing a diff for reinvented helpers, or when the user asks "do I have a package for X", "is there one of my libs that…", "which of my packages…".
license: Apache-2.0
compatibility: Requires network access to GitHub; uses the `gh` CLI or curl to fetch the list.
metadata:
  author: tada5hi
  version: "2026.11.19"
allowed-tools: Bash(gh:*) Bash(curl:*) Bash(npm:*) Read Grep
---

# query-package-list

> Reuse before you rewrite: check the user's own package list for something that already solves the problem, and verify it does before suggesting it.

## The list

An awesome-style `README.md` in a GitHub repository, one line per repository:

```md
- [rapiq](https://github.com/tada5hi/rapiq) `npm: @rapiq/core, @rapiq/codec-url` – Typed REST queries: builders, parsers, URL codec and adapters.
```

The backtick marker says how to install it: `npm:`, `pypi:`, `action:` (GitHub Action) or `plugin:` (agent plugin). `##` headings group entries by topic.

Which repository: the one the user names, else `$PACKAGE_LIST_REPO`, else `tada5hi/awesome`.

## When to run it

The decision to reuse is made before the code is written, so run the lookup at the first of these moments, not only when a helper is about to be typed:

- **Planning**: while writing a plan, spec or task list, check every need the plan names (locking, migrations, env reading, error mapping, ...) and write the chosen package and API into the plan.
- **Porting**: before copying code from another repository. The source may itself carry a hand-written copy of a listed package; port the usage of the package, not the copy.
- **Delegating**: a subagent does not inherit this skill. Put the rule ("use the user's packages; never re-implement one") and the shortlisted packages with their APIs into every brief, and ask the subagent to report any helper it wrote that a listed package might cover.
- **Reviewing**: run the audit below on the diff before approving it.
- **Writing a helper**: the original trigger; still applies.

## Steps

1. **Fetch the whole list** and read all of it. It is short; keyword grep misses entries that solve the problem under a different name.
   ```bash
   gh api "repos/${PACKAGE_LIST_REPO:-tada5hi/awesome}/readme" -H "Accept: application/vnd.github.raw"
   # without gh:
   curl -fsSL "https://raw.githubusercontent.com/${PACKAGE_LIST_REPO:-tada5hi/awesome}/HEAD/README.md"
   ```
2. **Shortlist by what the code must do**, not by name. Split a request into its separate needs first, then pick at most three entries per need whose section and description cover it. A package whose list line is about a neighbouring topic (an ORM extension, an error library) is a candidate for every need in that area, even if the line does not mention the need.
3. **Verify each candidate** against what it actually exports, not only its README. The list line is a summary, and READMEs lag behind: a package can ship helpers neither of them mentions.
   ```bash
   gh api repos/<owner>/<repo>/readme -H "Accept: application/vnd.github.raw"
   # what the published package exports (names and documented declarations):
   tar -xzf "$(npm pack <package> --silent)" package/dist
   grep -nE "^(export )?declare (function|class|const)|^export \{" package/dist/*.d.*ts
   ```
   If the package is already installed, read `node_modules/<package>/dist/*.d.*ts` instead. In a monorepo, also read the specific package's README; the root one is often only an overview:
   ```bash
   gh api repos/<owner>/<repo>/contents/packages --jq '.[].name'
   gh api repos/<owner>/<repo>/contents/packages/<dir>/README.md -H "Accept: application/vnd.github.raw"
   ```
   Confirm the exact capability exists and note the real API. Check the defaults that decide whether it fits (merge priority, array handling, error codes) and write the sample so it does what the user asked, not just what the README demos. When one of the user's other projects already uses the package for the same need, follow that usage (`grep -rn "from '<package>'"` there).
4. **Check the current project**: is the package already a dependency (`package.json`, lockfile), or named in the project's plan or docs? Then it is decided: use it, no install question needed.
5. **Answer** with, per fit: package name, one line on why it fits, the install command, and a minimal sample taken from its README or declarations. When nothing fits, say so in one line and carry on with the normal approach.

## Audit a diff

To find reinvented helpers in a branch, a package or a review:

1. List what the changed code does by need (one line per helper or module: "advisory lock around migrations", "map driver error codes", "read PORT from env").
2. Run steps 1 to 4 for those needs.
3. Report a table: file and symbol, the package and API that covers it, and whether it is a full or partial fit. Code that a listed package covers is a finding of its own, not a style note.

## Rules

- Never add a dependency without the user's go-ahead; suggest it and wait. A dependency the project already has, or that its plan names, needs no go-ahead.
- A partial fit is worth naming ("smob merges, but not with array dedupe"); let the user decide. If the package lacks a small piece, propose adding it to the package instead of copying the rest.
- Do not recommend from the list line alone; step 3 is not optional.
- When the list line or README misses a capability you found in the exports, mention it so the list can be refreshed (refresh-package-list).
- The list only covers the user's own packages. It is not a substitute for well-known libraries the project already uses.
