# upstream-fixes-track

> **Track the upstream issues a project waits on in your own libraries, and adopt each fix once it is released.**
> Stop losing track of local workarounds that a release of your own library could already replace.

[All skills](../../README.md#skills) · [`SKILL.md`](./SKILL.md)

## Why upstream-fixes-track?

When one of your libraries lacks a feature, you write a local copy or workaround in the consuming project and move on. Weeks later the fix ships, and nobody remembers which files held the copy, which issue it waited on, or whether the published package actually contains the fix. The skill keeps one record per project and checks each entry against the published package before calling it adoptable.

| Concern | Without it | With upstream-fixes-track |
|---|---|---|
| **The upstream issue** | Filed from memory, or a duplicate of an existing one | Searches open and closed issues first, then drafts one with a proposed API and asks before creating it |
| **The record** | Scattered across TODO comments and several issues | One tracking issue per project, one entry per upstream issue with `Local`, `Adopt` and `Specs` |
| **The code** | A workaround nobody can trace back | An `Upstream: <owner>/<repo>#<n>` comment on the first line of each local copy |
| **"Is it fixed?"** | Closed issue taken as done | Follows the fix to a release tag, an npm version, and the export in the published package |
| **Adopting** | Bump and hope | Bumps every workspace, applies the `Adopt` step, deletes the local code, keeps the named specs green |

## Installation

```bash
# this skill only, any Agent Skills agent
npx skills add tada5hi/skills --skill='upstream-fixes-track'

# Claude Code: the plugin bundles every skill
/plugin marketplace add tada5hi/skills
/plugin install skills@tada5hi
```

## Triggering

**Ask for it.** The agent loads the skill when your request matches its description, for example:

- "track this upstream"
- "can we adopt the rapiq fix?"
- "is the fix released?"
- "which upstream issues are done?"

The agent may also use it when it writes a workaround for a gap in one of your libraries, when filing such an upstream issue, and at the start of a session on a project with a tracking issue or `Upstream:` comments.

**Invoke it directly.** Type `/upstream-fixes-track` (installed with the skills CLI) or `/skills:upstream-fixes-track` (Claude Code plugin).

## What it does

1. **File:** searches the library's issues, drafts an upstream issue when none exists, and creates it after you agree.
2. **File:** finds the project's one tracking issue by searching titles and bodies, or creates it, and adds an entry with `Local`, `Adopt` and `Specs`.
3. **File:** marks each local copy with an `Upstream:` comment, and adds the same entry to the project's plan file if it keeps one.
4. **Check:** reads the tracking issue and cross-checks it against every `Upstream:` comment in the code.
5. **Check:** classifies each open entry as open, closed without a fix, fixed but unreleased, released but unverified, or adoptable, with the evidence.
6. **Adopt:** on your go-ahead, bumps the package in every workspace that declares it, applies the entry's `Adopt` step, runs the project's checks, ticks the box (and the plan file's, if any) and commits as `refactor:` or `chore(deps):`.

## Requirements

- The `gh` CLI, authenticated.
- npm registry access.
- A package list naming your libraries (default `tada5hi/awesome`, see [package-list-query](../package-list-query/)).

## Output

An upstream issue, a tracking issue entry and `Upstream:` comments when filing; a per-entry report when checking:

```markdown
- [ ] tada5hi/rapiq#997 helpers to read and replace a filter value every match must satisfy
  - Local: `findRequiredEqualValue`, `replaceRequiredEqualValue` in `apps/server-core/src/core/entities/post-tag/helpers.ts` (callers: `post-tag/service.ts`, `post/service.ts`)
  - Adopt: bump `@rapiq/core`, import both, delete `helpers.ts`
  - Specs: `test/unit/core/entities/post/read.spec.ts` stays green
```

## Notes

- **It asks before filing.** An upstream issue is visible to others, so the draft is shown first.
- **Closed is not released.** An entry is adoptable only when a published version contains the export or behaviour.
- **Adopting needs your agreement.** It deletes code, so a check never adopts as a side effect.
- **Only your own libraries.** Third-party libraries stay out of the tracking issue; the reverse direction is [upstream-features-adopt](../upstream-features-adopt/).
- **Exactly one tracking issue per project.** An existing one is extended and its title widened instead of opening a second.

## License

Apache-2.0, see [LICENSE](../../LICENSE).
