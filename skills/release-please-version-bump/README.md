# release-please-version-bump

> **Align a linked release-please group by touching only the packages that fall behind the group version.**
> Stop guessing why one package in the release PR gets `1.0.1-beta.30` while the rest get `1.0.0-beta.31`.

[All skills](../../README.md#skills) · [`SKILL.md`](./SKILL.md)

## Why release-please-version-bump?

release-please computes a version per component from that component's own commits. With the `linked-versions` plugin and a `release-as` prerelease pin, a package that only has dependency bumps or `chore:` commits can still land on the wrong version. Fixing it by hand means reading the release PR diff, finding the last release tag, and checking each package's commits since then.

| Concern | Without it | With release-please-version-bump |
|---|---|---|
| **Is anything wrong?** | Read the release PR diff package by package | Lists the version every `package.json` and the manifest get in the open release PR and compares them with the group version |
| **Group version** | Take the highest version, which can be the wrong one | Uses the `release-as` pin when set, else the highest version in the PR |
| **Which packages** | Touch every package to be safe | Touches only packages that are behind and have no `fix:`, `feat:` or breaking commit since the last release tag |
| **The touch** | A `chore:` commit release-please ignores | A no-op copyright year bump in each package, committed as `fix:` |

## Installation

```bash
# this skill only, any Agent Skills agent
npx skills add tada5hi/skills --skill='release-please-version-bump'

# Claude Code: the plugin bundles every skill
/plugin marketplace add tada5hi/skills
/plugin install skills@tada5hi
```

## Triggering

**Ask for it.** The agent loads the skill when your request matches its description, for example:

- "bump all packages"
- "align release versions"
- "release every package with the same version"

The agent may also use it when a release PR shows mixed versions, or when packages with only dependency bumps or only `refactor:`/`chore:` commits get no version or the wrong one.

**Invoke it directly.** Type `/release-please-version-bump` (installed with the skills CLI) or `/skills:release-please-version-bump` (Claude Code plugin).

## What it does

1. Reads `release-please-config.json` and `.release-please-manifest.json` for packages, components, the `linked-versions` plugin and any `release-as` pin.
2. Finds the open release PR (label `autorelease: pending`) and lists the version each package gets in it.
3. Determines the group version and the packages that differ from it or are missing from the PR.
4. For those packages, checks the commits since the last release tag for a `fix:`, `feat:` or breaking commit.
5. Updates the copyright year in each remaining package's entry file, or adds a comment line when the header is current or missing.
6. Commits exactly those files with `git commit --only` as `fix: ensure consistent version for release`. Other staged work stays out, but anything already staged in those files goes in too.
7. After you push and release-please updates the PR, checks the versions again and reports each one.

## Requirements

- A git repository using release-please with a manifest config.
- The `gh` CLI, authenticated for the repository.
- An open release-please PR and the tag of the last release.

## Output

A report of the version each package gets, and, only when some packages are behind, one local commit:

```diff
- * Copyright (c) 2022-2025.
+ * Copyright (c) 2022-2026.
```

## Notes

- **It checks before it touches.** When every version in the release PR matches and every package is present, it reports the version and changes nothing.
- **No release PR, no changes.** It waits until release-please opens one.
- **Only linked groups.** Without `linked-versions`, different versions are intended and the skill stops.
- **It never pushes.** Pushing the commit is your call.
- **It never edits versions.** `version` fields, the changelog and the manifest are left to release-please.
- **Configuration problems are reported, not patched.** A package that already has a `fix:` or `feat:` commit and still shows another version points at the config.
- **It stops on a missing release tag** rather than treating every package as untouched.

## License

Apache-2.0, see [LICENSE](../../LICENSE).
