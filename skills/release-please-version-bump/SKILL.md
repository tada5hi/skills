---
name: release-please-version-bump
description: Check an open release-please PR in a monorepo with linked versions and, when some packages fall behind the group version, give each of them a direct no-op `fix:` commit (a copyright year bump) so release-please releases them at the same version. Use when a release PR shows mixed versions (e.g. `1.0.1-beta.30` next to `1.0.0-beta.31`), when packages with only dependency bumps or only `refactor:`/`chore:` commits get no or the wrong version, or when asked to "bump all packages", "align release versions" or "release every package with the same version".
license: Apache-2.0
compatibility: Requires a git repository using release-please (manifest config) and the `gh` CLI authenticated for it.
metadata:
  author: tada5hi
  version: "2026.10.25"
allowed-tools: Bash(git:*) Bash(gh:*) Bash(node:*) Read Edit Glob Grep
---

# release-please-version-bump

> Make every package of a linked release-please group land at the same version, by touching only the packages that would not.

release-please computes a version per component from that component's own commits. The `linked-versions` plugin then aligns the group, but a package without a direct bump-worthy commit can still miss it: with a `release-as` prerelease pin, the `node-workspace` plugin bumps a dependency-only package to the next patch prerelease (`1.0.1-beta.30`) instead of the pinned `1.0.0-beta.31`. A direct `fix:` commit inside the package makes release-please treat it like the rest.

The skill checks first and touches nothing when the release PR is already consistent.

## Step 1: Read the release setup

```bash
cat release-please-config.json .release-please-manifest.json
```

Note:

- The packages (`packages` keys, each a path) and their `component` names.
- The `linked-versions` plugin and its `components`. Without one, the packages are released independently by design: stop and tell the user that this skill does not apply.
- A top-level or per-package `release-as`, and whether the manifest versions are prereleases (`-beta.N`). That is the setup in which packages fall behind.

## Step 2: Check the open release PR

```bash
gh pr list --state open --label "autorelease: pending" --json number,title,url
```

No open release PR: there is nothing to compare yet. Go to Step 3 only if the user asked to prepare the next release anyway, and say that the result is unverified until release-please opens the PR.

Otherwise list the version every `package.json` and the manifest get in that PR:

```bash
gh pr diff <number> | awk '
    /^diff --git/ { file = $4; sub(/^b\//, "", file) }
    /^\+[[:space:]]*"version":/ && file ~ /package\.json$/ { print file, $NF }
    /^\+[[:space:]]*"[^"]+": "[^"]+",?$/ && file == ".release-please-manifest.json" { print "manifest", $0 }
'
```

The group version is the one the release PR's title or changelog names (`release-as` when set). Collect every package of the linked group whose version differs from it, and every package of the group that is missing from the PR entirely.

**All versions equal and every package present: stop.** Report the version and that no bump is needed. Do not touch packages "to be safe": every extra `fix:` commit is a changelog entry the user has to explain.

## Step 3: Find packages without a bump-worthy commit

Only when Step 2 found a gap, or the user asked to prepare a release without a PR. release-please bumps a component only for `fix:`, `feat:` and breaking commits that touch its path.

```bash
last=$(git log --format=%H --grep='^chore: release' -1)
for path in <package paths from the config>; do
    git log "$last"..HEAD --format=%s -- "$path" | grep -qE '^(fix|feat)(\(.+\))?!?:' || echo "$path"
done
```

The packages to touch are the ones Step 2 flagged, plus, when there is no release PR, the ones this loop prints. A package that already has a `fix:` or `feat:` commit and still shows another version points at a configuration problem (a component missing from `linked-versions`, a per-package `release-as`): report it instead of touching it.

## Step 4: Touch each package

In each package, update the year of the copyright header in its entry file (`src/index.ts`, else the first file under `src/` that has one) to the current year:

```diff
- * Copyright (c) 2022-2025.
+ * Copyright (c) 2022-2026.
```

A single year becomes a range (`2025.` to `2025-2026.`). When the header is already current, or the package has no header, pick another change that ships nothing: a comment line in the entry file. Never change the `version` field, the changelog or the manifest: release-please owns them.

## Step 5: Commit, then verify

One commit for every touched package:

```bash
git add <touched files>
git commit -m "fix: ensure consistent version for release"
```

It has to be `fix:`: release-please ignores `chore:` and `refactor:` for the version. Follow the repository's own rules (branch protection, a pull request per change, no AI attribution).

Pushing is the user's call. Once the commit is on the default branch, wait for release-please to update the PR, then run Step 2 again and report each package's version. A package still behind goes back to Step 3.

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Touching every package on every release | Check the release PR first; touch only the packages behind |
| A `chore:` or `refactor:` commit for the touch | release-please only counts `fix:`/`feat:`; use `fix:` |
| Editing `package.json` versions or the manifest by hand | Leave them to release-please; touch source files only |
| Running it on independently versioned packages | Without `linked-versions`, different versions are intended |
