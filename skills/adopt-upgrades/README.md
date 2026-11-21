# adopt-upgrades

> **Find what new dependency versions let your project delete, and track it in one issue per package group.**
> Stop merging bumps without checking whether the new release replaces a local helper or workaround.

[All skills](../../README.md#skills) · [`SKILL.md`](./SKILL.md)

## Why adopt-upgrades?

A dependency bump gets checked for whether it is safe, then merged and forgotten. A minor or major release often ships the API a local helper, a workaround or a hand-written check was written to stand in for. Finding those matches by hand means diffing published type declarations, reading release notes and searching your code for each new export.

| Concern | Without it | With adopt-upgrades |
|---|---|---|
| **Which bumps to check** | Scroll through merged Dependabot or Renovate PRs | Lists direct npm dependencies that moved since the latest release tag, per workspace, majors first, patches dropped |
| **What changed** | Read the changelog and hope it is complete | Downloads both versions with `npm pack`, diffs exported names and changed declaration files, then reads the release notes |
| **What it replaces** | Remember which helper was a workaround | Searches the code for the API's purpose and names up to five local places plus a `git grep` for the rest |
| **Keeping track** | Notes in your head or a stray TODO | One `chore: adopt <name> features` issue per group, append only, with a `checked` marker so the next check starts where this one stopped |
| **Adopting** | Rewrite callers whenever you remember | On request, switches the callers, deletes the local code, runs the checks and ticks the box |

## Installation

```bash
# this skill only, any Agent Skills agent
npx skills add tada5hi/skills --skill='adopt-upgrades'

# Claude Code: the plugin bundles every skill
/plugin marketplace add tada5hi/skills
/plugin install skills@tada5hi
```

## Triggering

**Ask for it.** The agent loads the skill when your request matches its description, for example:

- "what can we use from the new zod"
- "anything to adopt from the bumps?"
- "check upgrades"
- "adopt the routup entry"

The agent may also use it after you merge dependency bumps (Dependabot, Renovate), after you upgrade a package by hand, or at the start of a session on a project with an open `chore: adopt <name> features` issue.

**Invoke it directly.** Type `/adopt-upgrades` (installed with the skills CLI) or `/skills:adopt-upgrades` (Claude Code plugin). Name a package or version range in your request to check only that range.

## What it does

1. **Check.** Finds the bumps: the range you name, the packages you just upgraded, or every direct dependency that moved since the latest release tag, starting each package at the version its issue already checked.
2. Diffs each bump's published API with the bundled `scripts/upgrades.mjs`, reads changed declaration files and the release notes between the two versions.
3. Matches each new API against your code and keeps only the ones with local code it can name.
4. Shows you the new issue sections and `checked` marker, then creates or appends to the group's issue once you agree. A group with no entries gets no issue; when one is open it offers to update just the `checked` marker, otherwise the next check repeats those bumps.
5. **Adopt.** When you ask for an entry, installs the version if needed, applies the proposal, deletes the local code, runs lint, build, tests and typecheck, ticks the box, and commits as `refactor: adopt <API> from <package> <version>` (or per the project's conventions).

## Requirements

- A git repository with a GitHub remote and the `gh` CLI authenticated.
- Node.js 22 or later, npm and access to the npm registry.
- A `package-lock.json` (v2 or later) for the automatic bump list; the API diff works for any npm package. Other ecosystems get the bump without a diff.

## Output

One open issue per package group, titled `chore: adopt <name> features` and labelled `upstream-features`. A scope and its root package share one issue (`routup` and `@routup/basic` are `routup`). Each bump is a section with entries like:

```markdown
### [`@chamvi/app` 0.8.0 → 0.9.0](https://npmdiff.dev/%40chamvi%2Fapp/0.8.0/0.9.0/)

- [ ] **`ValidationError.cause`**: carries the failing value
  - Proposal: pass the cause to ValidationError and delete the local wrappers that attach it
  - Local (2 of 7): ...
  - Source: member of ValidationError, ValidationError.cause in dist/errors.d.mts
```

Removed or newly deprecated names your code uses are reported in the chat as upgrade debt, not added to the issue.

## Notes

- **It asks before writing to GitHub.** It shows the sections first and creates the `upstream-features` label, the issue or the edit only after you say go.
- **A check never adopts.** Adopting deletes code, so it happens only when you ask for a specific entry.
- **No local code, no entry.** An opportunity it cannot point at in your code is left out.
- **Issues are append only.** It never rewrites, reorders or deletes an entry, and never reopens a closed issue; a later version opens a new one.
- **Declining is recorded.** A declined entry is ticked with `declined: <reason>` so later checks skip it.
- **Patches are skipped** unless you ask; bumps are checked in batches of ten, most severe first.

## License

Apache-2.0, see [LICENSE](../../LICENSE).
