# pr-create

> **Open a pull request with a Conventional Commits title and a short body backed by evidence.**
> Stop writing PR descriptions from memory and then forgetting to come back for the review bots.

[All skills](../../README.md#skills) · [`SKILL.md`](./SKILL.md)

## Why pr-create?

A reviewer should understand a pull request from its body alone: what changed, why, and how it was verified. Written by hand, the title rarely matches the commits, the body claims things nobody checked, and the PR sometimes goes out from the default branch or duplicates an open one. Once it is open, CI and automated reviewers need a few minutes, and their findings get read the next day.

| Concern | Without it | With pr-create |
|---|---|---|
| **Branch and base** | Push from `master` or target the wrong base | Creates a branch when you are on the default branch, targets the base repo's default branch or the branch it is stacked on |
| **Existing PR** | Open a duplicate | Pushes and updates the open PR instead |
| **Title** | Free text | The commit subject, or the dominant type and shared scope across commits |
| **Body** | "This PR aims to..." | A short summary plus a verification list of the exact commands run and their results; anything not run is marked as not verified |
| **Repo rules** | Skim the PR template | Reads `AGENTS.md`, `CONTRIBUTING.md` and the PR template, and fills the template's headings |
| **After opening** | Check back later | Waits up to 30 minutes for checks, then investigates review comments and failed checks |

## Installation

```bash
# this skill only, any Agent Skills agent
npx skills add tada5hi/skills --skill='pr-create'

# Claude Code: the plugin bundles every skill
/plugin marketplace add tada5hi/skills
/plugin install skills@tada5hi
```

## Triggering

**Ask for it.** The agent loads the skill when your request matches its description, for example:

- "create a PR"
- "open a pull request"
- "publish this branch"
- "submit for review"

The agent may also use it after finishing work on a feature branch.

**Invoke it directly.** Type `/pr-create` (installed with the skills CLI) or `/skills:pr-create` (Claude Code plugin).

## What it does

1. Checks `gh` authentication, the current branch and uncommitted changes; commits them with [commit-message-generate](../commit-message-generate/) as atomic Conventional Commits.
2. Fetches the base, lists the commit range, looks for an open PR on the branch and reads the full diff.
3. Runs the checks that match the changed surfaces (lint, typecheck, focused tests) and records each command and result.
4. Writes the title and the body, with a before/after screenshot table for UI changes.
5. Shows you the title, base and body, then pushes to `origin` and runs `gh pr create`, or `gh pr edit` for an existing PR.
6. Waits until no check is pending, then runs [pr-comments-investigate](../pr-comments-investigate/) on review comments fixes failed checks caused by the PR and pushes the fix, and reports failures the PR did not cause.

## Requirements

- A git repository with a GitHub remote.
- The `gh` CLI, authenticated (`gh auth login`).

## Output

A pushed branch and an open pull request, with its URL in the chat. The body looks like:

```markdown
## Summary

Nested query parameters were dropped by the parser. It now recurses into bracketed keys.

Closes #12

## Verification

- `npm run lint`: passes
- `npm test`: 42 passed
- Not verified: browser build
```

After the checks finish, you get a report of the review comments handled and the checks that passed, failed or are still pending.

## Notes

- **It confirms before pushing.** Pushing and opening a PR are visible to others, so it shows you the title, base and body first unless you already asked it to open the PR. It also asks before committing uncommitted changes you did not ask it to commit.
- **Never from the default branch.** It creates a `<type>/<short-topic>` branch first.
- **Draft when unfinished.** It adds `--draft` when you ask or when checks fail or TODOs are open.
- **Screenshots are never committed.** It uploads them with `gh pr create --attach` when your `gh` supports it, otherwise asks you to drag them into the description.
- **Plain body.** No AI attribution, no `Co-Authored-By` trailer, no em or en dashes, no secrets, no claims the diff and commands do not prove.
- **It stops at 30 minutes.** Checks still pending after that are reported, not waited on. Failures not caused by the PR are reported, not fixed.

## License

Apache-2.0, see [LICENSE](../../LICENSE). Adapted from [antfu/skills `antfu-create-pr`](https://github.com/antfu/skills/tree/main/skills/antfu-create-pr).
