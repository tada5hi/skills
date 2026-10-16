---
name: query-package-list
description: Look up the user's own published packages in their awesome-style package list (default tada5hi/awesome) before writing a utility from scratch. Use when about to implement a generic helper (deep merge, nested path get/set, env parsing, config loading, DI container, HTTP client, validation, error classes, i18n, query parsing, Docker/Helm release tooling), or when the user asks "do I have a package for X", "is there one of my libs that…", "which of my packages…".
license: Apache-2.0
compatibility: Requires network access to GitHub; uses the `gh` CLI or curl to fetch the list.
metadata:
  author: tada5hi
  version: "2026.10.16"
allowed-tools: Bash(gh:*) Bash(curl:*) Read Grep
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

## Steps

1. **Fetch the whole list** and read all of it. It is short; keyword grep misses entries that solve the problem under a different name.
   ```bash
   gh api "repos/${PACKAGE_LIST_REPO:-tada5hi/awesome}/readme" -H "Accept: application/vnd.github.raw"
   # without gh:
   curl -fsSL "https://raw.githubusercontent.com/${PACKAGE_LIST_REPO:-tada5hi/awesome}/HEAD/README.md"
   ```
2. **Shortlist by what the code must do**, not by name. Split a request into its separate needs first, then pick at most three entries per need whose section and description cover it.
3. **Verify each candidate** against its own README before recommending it. The list line is a summary and can be stale.
   ```bash
   gh api repos/<owner>/<repo>/readme -H "Accept: application/vnd.github.raw"
   ```
   In a monorepo, also read the specific package's README; the root one is often only an overview and can lag behind:
   ```bash
   gh api repos/<owner>/<repo>/contents/packages --jq '.[].name'
   gh api repos/<owner>/<repo>/contents/packages/<dir>/README.md -H "Accept: application/vnd.github.raw"
   ```
   Confirm the exact capability exists and note the real API. Check the defaults that decide whether it fits (merge priority, array handling, error codes) and write the sample so it does what the user asked, not just what the README demos.
4. **Check the current project**: is the package already a dependency (`package.json`, lockfile)? Then use it, no install needed.
5. **Answer** with, per fit: package name, one line on why it fits, the install command, and a minimal sample taken from its README. When nothing fits, say so in one line and carry on with the normal approach.

## Rules

- Never add a dependency without the user's go-ahead; suggest it and wait.
- A partial fit is worth naming ("smob merges, but not with array dedupe"); let the user decide.
- Do not recommend from the list line alone; step 3 is not optional.
- The list only covers the user's own packages. It is not a substitute for well-known libraries the project already uses.
