---
name: release-please-version-bump
description: Diagnose and align a release-please linked version group when a release PR or manifest shows mixed versions. Check manifest history and plugin interaction before proposing a temporary release-as recovery; never repair split history with synthetic fix commits or hand-edited versions.
license: Apache-2.0
compatibility: Requires a git repository using release-please manifest config and an authenticated gh CLI.
metadata:
  author: tada5hi
  version: "2026.10.28"
allowed-tools: Bash(git:*) Bash(gh:*) Read Edit Glob Grep
---

# release-please-version-bump

Diagnose first. An inconsistent release PR can come from split manifest history, plugin interaction, or intentionally independent release groups. A direct no-op `fix:` commit is not a general repair and must not be recommended as one.

## 1. Establish the current state

Read `release-please-config.json`, `.release-please-manifest.json`, the release workflow and every group's component list. Compare the checkout with the remote target branch; a local temporary pin may already have been removed remotely.

Use `gh pr list` and `gh pr view` to inspect the current release PR, including its actual manifest and package.json patches. Record versions by package path, not merely the PR title. Check all linked members, including dependency-only packages.

If no linked group exists, stop: independent versions may be intentional. If everything agrees, report that no changes are needed.

## 2. Classify the discrepancy

- **Split manifest:** members already record different released versions. Explain that adding source touches does not repair the recorded history. Recommend an explicitly approved, one-time top-level `release-as` at a forward version suitable for every member. Never choose a lower or already-published conflicting version.
- **Aligned manifest, split candidates:** inspect plugin ordering, merge settings, pinned release-please version and dependency-only paths. Do not prescribe a reorder without exercising the real pipeline.
- **Temporary release-as:** inspect whether the requested version has shipped. Remove the pin only after that release is confirmed and with authorization; leaving it permanently can pin future releases.

Never hand-edit package versions or the manifest, and never fabricate copyright changes or no-op fix commits to trigger releases.

## 3. Verify the mechanism safely

Use a read-only release-pr dry run or the installed release-please build APIs with an in-memory GitHub fixture. A remote dry run reads remote configuration, so it does not validate an uncommitted local config change. Never call createPullRequests, createReleases or github-release for diagnosis.

Pin the upstream version when making source claims. In release-please 17.6.0, `linked-versions.preconfigure` replaces strategies and supplies synchronization commits; `node-workspace` also builds dependency-only updates. With linkage first, the default linked merge can produce a versionless candidate that workspace drops. The tested configuration in chamvi/chamvi is linked-versions first with `merge: false`, followed by node-workspace doing the final merge. This is a version-specific example, not a universal fix.

Regression coverage must exercise both preconfigure and run phases and inspect final package updates, manifest versions and dependency ranges. Include an aligned manifest, a split manifest and a dependency-only member. A config-order assertion or a call to an internal bump method is insufficient evidence.

## 4. Propose and deliver the smallest repair

Show the cause, exact proposed configuration or temporary pin, affected group, and before/after evidence. Ask before commits, pushes, PRs, releases or merges unless that action is already authorized.

Let release-please generate package and manifest changes. For a one-time release-as recovery, arrange a follow-up removal after the aligned release ships. Report checks that were not run and upstream behavior that remains uncertain.
