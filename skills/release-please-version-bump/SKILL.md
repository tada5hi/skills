---
name: release-please-version-bump
description: Check an open release-please PR in a monorepo with linked versions and, when some packages fall behind the group version, give each of them a direct no-op `fix:` commit (a copyright year bump) so release-please releases them at the same version. Use when a release PR shows mixed versions (e.g. `1.0.1-beta.30` next to `1.0.0-beta.31`), when packages with only dependency bumps or only `refactor:`/`chore:` commits get no or the wrong version, or when asked to "bump all packages", "align release versions" or "release every package with the same version".
license: Apache-2.0
compatibility: Requires a git repository using release-please (manifest config) and the `gh` CLI authenticated for it.
metadata:
  author: tada5hi
  version: "2026.10.25"
allowed-tools: Bash(git:*) Bash(gh:*) Read Edit Glob Grep
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

No open release PR: there is nothing to compare yet, so touch nothing. Wait until release-please opens or updates it (any `fix:` or `feat:` on the default branch does). Packages without own commits usually get the group version anyway, so a list of untouched packages alone is no reason to touch them.

Otherwise list the version every `package.json` and the manifest get in that PR:

```bash
gh pr diff <number> | awk '
    /^diff --git/ { file = $4; sub(/^b\//, "", file) }
    /^\+[[:space:]]*"version":/ && file ~ /package\.json$/ { print file, $NF }
    /^\+[[:space:]]*"[^"]+": "[^"]+",?$/ && file == ".release-please-manifest.json" { print "manifest", $0 }
'
```

The group version is the `release-as` version when one is set, else the highest version in the PR (`linked-versions` aligns the group to its highest member). The PR title (`chore: release <branch>`) names no version. Never fall back to the highest version while a `release-as` pin exists: the wrongly bumped `1.0.1-beta.30` sorts above the pinned `1.0.0-beta.31`. Collect every package of the linked group whose version differs from it, and every package of the group that is missing from the PR entirely.

**All versions equal and every package present: stop.** Report the version and that no bump is needed. Do not touch packages "to be safe": every extra `fix:` commit is a changelog entry the user has to explain.

## Step 3: Find packages without a bump-worthy commit

Only when Step 2 found a gap. release-please bumps a component only for `fix:`, `feat:` and breaking commits (`<type>!:` or a `BREAKING CHANGE:` footer) that touch its path.

The range starts at the tag of the last release: `v<version>` with `include-component-in-tag: false`, else `<component>-v<version>`, with the version from the manifest. Do not search for the release commit by its subject (the title pattern is configurable, `chore(main): release ...` for single-package setups) or by the last change to the manifest (a hand edit moves it). Stop when the tag is missing: an empty base turns the range into `HEAD..HEAD`, and every package would look untouched.

```bash
base=$(git rev-parse -q --verify "refs/tags/<tag>^{commit}") || { echo "release tag <tag> not found"; exit 1; }
for pkg in <package paths from the config>; do
    git log "$base"..HEAD --format=%s -- "$pkg" | grep -qE '^((fix|feat)(\([^)]*\))?!?|[a-z]+(\([^)]*\))?!):' && continue
    git log "$base"..HEAD --format=%B -- "$pkg" | grep -qE '^BREAKING[ -]CHANGE:' && continue
    echo "$pkg"
done
```

For the root component (`.`), add `':(exclude)<path>'` for every other package path after `-- .`: release-please gives each commit to the most specific package path, so a commit inside a package does not count for the root.

The packages to touch are the ones Step 2 flagged that this loop also prints. A package that already has a `fix:` or `feat:` commit and still shows another version points at a configuration problem (a component missing from `linked-versions`, a per-package `release-as`): report it instead of touching it.

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
git commit --only -m "fix: ensure consistent version for release" -- <touched files>
```

`--only` with the paths commits exactly those files, so changes the user had staged elsewhere stay out of the commit. Check `git diff --cached -- <touched files>` first: anything staged in those files beyond the header change goes in too.

It has to be `fix:`: release-please ignores `chore:` and `refactor:` for the version. Follow the repository's own rules (branch protection, a pull request per change, no AI attribution).

Pushing is the user's call. Once the commit is on the default branch, wait for release-please to update the PR, then run Step 2 again and report each package's version. A package still behind goes back to Step 3.

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Touching every package on every release | Check the release PR first; touch only the packages behind |
| Touching packages before the release PR exists | Wait for the PR: under `linked-versions` most untouched packages get the group version anyway |
| Naming the loop variable `path` | zsh ties `path` to `PATH`; use another name |
| A `chore:` or `refactor:` commit for the touch | release-please only counts `fix:`/`feat:`; use `fix:` |
| Editing `package.json` versions or the manifest by hand | Leave them to release-please; touch source files only |
| Running it on independently versioned packages | Without `linked-versions`, different versions are intended |
| Finding the last release by commit subject or manifest change | Start the range at the release tag; stop when it is missing |
