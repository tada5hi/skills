---
name: release-versions-align
description: Check an open release-please PR in a monorepo with linked versions and, when some packages fall behind the group version, give each of them a direct no-op `fix:` commit (a copyright year bump) so release-please releases them at the same version. Use when a release PR shows mixed versions (e.g. `1.0.1-beta.30` next to `1.0.0-beta.31`), when packages with only dependency bumps or only `refactor:`/`chore:` commits get no or the wrong version, or when asked to "bump all packages", "align release versions" or "release every package with the same version".
license: Apache-2.0
compatibility: Requires a git repository using release-please (manifest config) and the `gh` CLI authenticated for it.
metadata:
  author: tada5hi
  version: "2026.11.21"
allowed-tools: Bash(git:*) Bash(gh:*) Bash(awk:*) Bash(grep:*) Read Edit Glob Grep
---

# release-versions-align

> Make every package of a linked release-please group land at the same version, by touching only the packages that would not.

The `linked-versions` plugin aligns a group, but a package without its own bump-worthy commit can still miss it: with a `release-as` prerelease pin, the `node-workspace` plugin bumps a dependency-only package to the next patch prerelease (`1.0.1-beta.30`) instead of the pinned `1.0.0-beta.31`. A direct `fix:` commit inside the package fixes that.

Check first; touch nothing when the release PR is already consistent.

## Step 1: Read the release setup

Read `release-please-config.json` and `.release-please-manifest.json`. Note:

- The packages (`packages` keys, each a path) and their `component` names.
- The `linked-versions` plugin and its `components`. Without one, the packages are released independently by design: stop and tell the user this skill does not apply.
- A top-level or per-package `release-as`, and whether the manifest versions are prereleases (`-beta.N`).

## Step 2: Check the open release PR

```bash
gh pr list --state open --label "autorelease: pending" --json number,title,url
```

No open release PR: touch nothing. Under `linked-versions` packages without own commits usually get the group version anyway; wait until release-please opens the PR (any `fix:` or `feat:` on the default branch does).

Otherwise list the version every `package.json` and the manifest get in it:

```bash
gh pr diff <number> | awk '
    /^diff --git/ { file = $4; sub(/^b\//, "", file) }
    /^\+[[:space:]]*"version":/ && file ~ /package\.json$/ { print file, $NF }
    /^\+[[:space:]]*"[^"]+": "[^"]+",?$/ && file == ".release-please-manifest.json" { print "manifest", $0 }
'
```

The group version is the `release-as` version when one is set, else the highest version in the PR (the PR title names none). Never take the highest version while a `release-as` pin exists: the wrong `1.0.1-beta.30` sorts above the pinned `1.0.0-beta.31`. Collect every package of the linked group whose version differs from it or that is missing from the PR.

**All versions equal and every package present: stop.** Report the version. Do not touch packages "to be safe": each extra `fix:` commit is a changelog entry.

## Step 3: Find packages without a bump-worthy commit

release-please bumps a component only for `fix:`, `feat:` and breaking commits (`<type>!:` or a `BREAKING CHANGE:` footer) that touch its path.

The range starts at the last release tag: `v<version>` with `include-component-in-tag: false`, else `<component>-v<version>`, the version from the manifest. Do not locate the release by commit subject (configurable) or by the last manifest change (a hand edit moves it). Stop when the tag is missing: an empty base makes the range `HEAD..HEAD` and every package looks untouched.

Compare against the target branch as release-please sees it, not the checked-out branch (`git fetch origin` first):

```bash
base=$(git rev-parse -q --verify "refs/tags/<tag>^{commit}") || { echo "release tag <tag> not found"; exit 1; }
for pkg in <package paths from the config>; do
    git log "$base"..origin/<target branch> --format=%s -- "$pkg" | grep -qE '^((fix|feat)(\([^)]*\))?!?|[a-z]+(\([^)]*\))?!):' && continue
    git log "$base"..origin/<target branch> --format=%B -- "$pkg" | grep -qE '^BREAKING[ -]CHANGE:' && continue
    echo "$pkg"
done
```

Do not name the loop variable `path`: zsh ties it to `PATH`. For the root component (`.`), add `':(exclude)<path>'` for every other package path after `-- .`: release-please gives each commit to the most specific package path.

Touch the packages that Step 2 flagged and this loop prints. A flagged package that already has a `fix:` or `feat:` commit points at a configuration problem (a component missing from `linked-versions`, a per-package `release-as`): report it, do not touch it.

## Step 4: Touch each package

In each package, update the copyright year in its entry file (`src/index.ts`, else the first file under `src/` with a header) to the current year:

```diff
- * Copyright (c) 2022-2025.
+ * Copyright (c) 2022-2026.
```

A single year becomes a range (`2025.` to `2025-2026.`). When the header is current or missing, add a comment line to the entry file instead. Never change `version` fields, the changelog or the manifest: release-please owns them.

## Step 5: Commit, then verify

The commit must reach the branch release-please watches (its target branch, usually the default branch) as a `fix:` commit; `chore:` and `refactor:` do not count. Decide where it goes from the repository's own rules (agent docs, `CONTRIBUTING`, branch protection; no AI attribution in the commit or PR):

- **Direct commits to the default branch allowed**, and it is checked out: commit there.
- **Changes go through a pull request**, or another branch is checked out: before Step 4, with a clean working tree, branch off the target (`git switch -c <branch> origin/<target branch>`), then commit there and offer to open the PR (`pr-create`). Its title is the same `fix:` message, so a squash merge keeps it.

One commit for every touched package:

```bash
git commit --only -m "fix: ensure consistent version for release" -- <touched files>
```

`--only` keeps changes staged in other files out of the commit; anything already staged in the touched files goes in, so check `git diff --cached -- <touched files>` first.

Never push or open the PR without the user's go-ahead. Once the commit is on the target branch, wait for release-please to update its PR, run Step 2 again and report each package's version. A package still behind goes back to Step 3.

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Touching every package on every release | Touch only the packages behind in the release PR |
| Touching packages before the release PR exists | Wait for the PR |
| Running it on independently versioned packages | Without `linked-versions`, different versions are intended |
