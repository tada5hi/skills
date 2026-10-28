---
name: release-please-version-bump
description: Use when an open release-please PR shows mixed versions or missing members of a linked release group, or when asked to align release versions or bump all packages in that group.
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

If no linked group exists, stop: independent versions may be intentional. If no open release PR exists, report that there is nothing to align and stop without edits or commits. A separately requested manifest-history investigation may continue read-only, but does not authorize a recovery release. If every linked member is present and versions agree with the intended target, report that no changes are needed.

Record existing top-level and per-package `release-as` pins before selecting a target. An unshipped pin is the intended target to verify, not permission to replace it with the highest candidate. A wrongly bumped patch prerelease can sort above the pinned prerelease. Without a pin, compare all group candidates with the configured linked-version policy; do not infer the target from the PR title. If a pin conflicts with published history, explain the conflict and obtain approval for a new forward target.

## 2. Classify the discrepancy

- **Split manifest:** members already record different released versions. Explain that adding source touches does not repair the recorded history. Recommend an explicitly approved, one-time top-level `release-as` at a forward version suitable for every member. Never choose a lower or already-published conflicting version.
- **Aligned manifest, split candidates:** inspect plugin ordering, merge settings, pinned release-please version and dependency-only paths. Do not prescribe a reorder without exercising the real pipeline.
- **Temporary release-as:** inspect whether the requested version has shipped using remote tags, GitHub releases and the relevant package registry. If evidence disagrees or is unavailable, report uncertainty and leave the pin unchanged. Remove the pin only after that release is confirmed and with authorization; leaving it permanently can pin future releases.

Never hand-edit package versions or the manifest, and never fabricate copyright changes or no-op fix commits to trigger releases.

## 3. Establish release-history evidence

When diagnosing commit attribution, start each component's range at its manifest version's release tag, following the repository's tag configuration (`v<version>` without a component, commonly `<component>-v<version>` otherwise). Verify the tag resolves to a commit; check remote tags if it is absent locally. If a required tag is missing remotely too, stop the history-based diagnosis and report the missing baseline. Never substitute a commit subject, the last manifest edit, an empty range or `HEAD` as the release baseline.

Inspect commits from that tag to the target branch, including full bodies for `BREAKING CHANGE:` or `BREAKING-CHANGE:` footers. Distinguish direct `fix:`, `feat:` and breaking commits from dependency-only changes, but do not turn missing direct commits into instructions to touch source. release-please attributes files to the most specific configured package path: for root `.` exclude every other package path, and for nested packages exclude more-specific descendants. A child package's commits must not be counted as root-only changes.

## 4. Verify the mechanism safely

Use a read-only release-pr dry run or the installed release-please build APIs with an in-memory GitHub fixture. A remote dry run reads remote configuration, so it does not validate an uncommitted local config change. Never call createPullRequests, createReleases or github-release for diagnosis.

Pin the upstream version when making source claims. In release-please 17.6.0, `linked-versions.preconfigure` replaces strategies and supplies synchronization commits; `node-workspace` also builds dependency-only updates. With linkage first, the default linked merge can produce a versionless candidate that workspace drops. The tested configuration in chamvi/chamvi is linked-versions first with `merge: false`, followed by node-workspace doing the final merge. This is a version-specific example, not a universal fix.

Regression coverage must exercise both preconfigure and run phases and inspect final package updates, manifest versions and dependency ranges. Include an aligned manifest, a split manifest and a dependency-only member. A config-order assertion or a call to an internal bump method is insufficient evidence.

## 5. Propose and deliver the smallest repair

Show the cause, exact proposed configuration or temporary pin, affected group, and before/after evidence. Ask before commits, pushes, PRs, releases or merges unless that action is already authorized.

Follow the repository's branch, Conventional Commit, PR and attribution rules. Before an authorized commit, inspect both staged and unstaged changes. Stage only repair files or hunks; preserve unrelated user changes and do not include pre-existing staged files in the repair commit. Verify the exact commit scope before committing; never use blanket staging or reset the user's index to simplify delivery. With unrelated staged paths, use an explicit path-scoped commit only when those repair paths contain no unrelated hunks. If repair paths contain mixed changes, isolate the intended hunks with a temporary index while preserving the real index, or stop delivery and report the conflict. A plain `git commit` includes all staged paths.

Let release-please generate package and manifest changes. For a one-time release-as recovery, arrange a follow-up removal after the aligned release ships.

## 6. Recheck the regenerated release PR

After the repair lands, verify the release-please workflow ran successfully against the repaired target-branch revision and refreshed the release PR. If it has not, report that alignment is pending; do not treat an old title or stale diff as confirmation. Rerunning a workflow requires authorization when not already granted.

Inspect the refreshed package patches, dependency ranges and manifest entries for every linked member, including previously missing and dependency-only packages. Report each package path and version against the intended target. If a discrepancy remains, return to diagnosis rather than adding synthetic commits. Report checks not run and upstream behavior still uncertain. Do not merge or publish the release without authorization.
