---
name: create-pull-request
description: Open a GitHub pull request from the current branch with a Conventional Commits title and a short, evidence-based body. Use when asked to "create a PR", "open a pull request", "publish this branch", "submit for review", or after finishing work on a feature branch.
license: Apache-2.0
compatibility: Requires a git repository with a GitHub remote and the `gh` CLI authenticated.
metadata:
  author: tada5hi
  version: "2026.10.16"
allowed-tools: Bash(git:*) Bash(gh:*) Read Write Glob Grep
---

# create-pull-request

> Open a pull request a reviewer can understand from the body alone: what changed, why, and how it was verified.

Adapted from [antfu/skills `antfu-create-pr`](https://github.com/antfu/skills/tree/main/skills/antfu-create-pr), itself based on [moeru-ai/airi `create-pr`](https://github.com/moeru-ai/airi/blob/main/.agents/skills/create-pr/SKILL.md).

## Step 1: Preconditions

```bash
gh auth status
git status --short
git branch --show-current
gh repo view --json nameWithOwner,defaultBranchRef --jq '.nameWithOwner + " " + .defaultBranchRef.name'
```

- **Not authenticated**: tell the user to run `gh auth login` and stop.
- **On the default branch**: create a branch first (`git switch -c <type>/<short-topic>`), never open a PR from the default branch.
- **Uncommitted changes**: run `/generate-commit-message` and commit them as atomic Conventional Commits, one logical change per commit. Do not lump unrelated changes into one commit. Ask the user before committing if they have not asked for it.
- Read `AGENTS.md`, `CONTRIBUTING.md` and `.github/PULL_REQUEST_TEMPLATE*` if present. Their rules win over this skill.

## Step 2: Base, range and existing PR

```bash
git remote -v
git fetch <remote> <base>
git log --oneline <remote>/<base>..HEAD
gh pr view --json number,url,state,title 2>/dev/null
```

- `<remote>` is the remote of the base repo: `upstream` if it exists (fork clone, `gh` targets it too), otherwise `origin`. Push still goes to `origin`.
- `<base>` is the default branch unless the branch is stacked on another unmerged branch; then target that branch and describe only this branch's commits.
- No commits in the range: nothing to open, stop.
- An **open PR already exists** for the branch: push and update it (`gh pr edit <number> --title ... --body-file ...`) instead of creating a duplicate.

Read the full diff (`git diff <remote>/<base>...HEAD`) before writing anything. Tell runtime code apart from lockfiles, generated files and snapshots.

## Step 3: Verify

Run the checks that match the changed surfaces (lint, typecheck, focused tests). Record each exact command and its result. Anything not run goes into the body as not verified.

## Step 4: Title

Conventional Commits, same rules as `/generate-commit-message` (imperative, lowercase, no trailing period, under 72 characters):

- **One commit**: use its subject.
- **Several commits**: use the dominant type (`feat` > `fix` > the rest) and the shared scope; omit the scope when commits span areas.
- Squash-merge repos turn the title into the commit on the base branch, so write the commit you want in history.

## Step 5: Body

Write the body to a temp file, e.g. `"${TMPDIR:-/tmp}/pr-body.md"`. Keep it proportional: a one-line fix gets two sentences and a verification line.

```markdown
## Summary

<Problem or capability first, then what changed and why this approach. 1-4 sentences.>

Closes #<issue>

## Verification

- `npm run lint`: passes
- `npm test`: 42 passed
- Not verified: <anything not run>
```

- Add a `## Visual changes` section only for user-visible UI changes (see below). Add other sections (change map, risks, migration notes) only when the reviewer needs them; never fill a heading for its own sake.
- If the repo has a PR template, keep its headings and fill them instead.
- State only what the diff and the commands prove. No "robust", "comprehensive", "safe" or "backward compatible" without evidence. No "This PR aims to...".
- No AI attribution of any kind (no `Generated with ...` line, no `Co-Authored-By` trailer).
- No em dashes (`—`) or en dashes (`–`) in the title or body. Use a comma, colon, parentheses or a new sentence.
- No tokens, secrets or user data.

### Visual changes

For UI changes, include a before/after pair per affected state, captured with the same viewport, theme and data from the base and the head:

```markdown
## Visual changes

| Before | After |
| --- | --- |
| ![](before.png) | ![](after.png) |
| Settings / Connection, 1440x900, dark | Settings / Connection, 1440x900, dark |
```

Never commit screenshots to the repository. Check whether the installed `gh` can upload them:

```bash
gh pr create --help | grep -- --attach
```

- **`--attach` exists** (newer `gh`): reference the local paths in the body and pass `--attach <path>` once per image; `gh` uploads them and rewrites the paths.
- **No `--attach`**: leave the image table out of the body, create the PR, then ask the user to drag them into the PR description in the GitHub web UI. Report the local image paths.

## Step 6: Push and create

Pushing and opening a PR are visible to others. Show the user the title, base and body and confirm first, unless they already asked you to open the PR.

```bash
git push -u origin HEAD
gh pr create --base <base> --title "<title>" --body-file "${TMPDIR:-/tmp}/pr-body.md"
```

- Add `--draft` when the user asks for it or the work is incomplete (failing checks, open TODOs).
- `gh pr create` prints the PR URL. Give it to the user.
- Once reviewers comment, `/investigate-pr-comments` triages and fixes the feedback.
