---
name: commit-message-generate
description: Generate a Conventional Commits message for uncommitted changes in the working directory. Use when user wants to "generate commit message", "write commit message", "conventional commit", or before committing staged changes.
license: Apache-2.0
compatibility: Requires git repository with uncommitted changes.
metadata:
  author: tada5hi
  version: "2026.11.21"
allowed-tools: Bash(git:*) Read Glob Grep
---

# commit-message-generate

> Analyze uncommitted changes in the working directory and generate a commit message following [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

## Step 1: Gather changes

```bash
git status --short
git diff --cached --stat && git diff --cached      # staged
git diff --stat && git diff                        # unstaged
git ls-files --others --exclude-standard           # untracked (new files)
git log --oneline -10                              # house style
```

- Nothing staged, unstaged or untracked: tell the user there is nothing to commit and stop.
- Something staged: base the message on the staged changes only (what `git commit` would include) and mention that unstaged and untracked changes are left out.
- Nothing staged: base the message on all unstaged changes and untracked files (read the new files) and note that the user has to stage them first (`git add`).

## Step 2: Analyze the changes

Determine from the diffs (read the surrounding source when the purpose is unclear):

1. **What changed and why.**
2. **Scope**: the module, package or area the changes are confined to. Omit it, or use the most prominent area, when they span several.
3. **Breaking changes**: removed public APIs, changed signatures, renamed exports, deleted files, config format changes that break consumers.
4. **Split**: if the changes address unrelated concerns (e.g. a fix and a feature), recommend separate commits and write a message for each.

## Step 3: Compose the message

- **Type**: `feat` (new feature, SemVer minor), `fix` (bug fix, patch), `refactor` (neither fixes nor adds), `perf`, `test`, `docs`, `ci`, `build` (build system or external dependencies), `style` (formatting only, no logic change), `chore` (maintenance outside src and test files). Mark a breaking change with `!` after the type/scope, a `BREAKING CHANGE:` footer, or both.
- **Description**: imperative mood, lowercase start, under 72 characters, no trailing period.
- **Scope**: a noun for the affected area (`parser`, `auth`, `cli`, `deps`).
- **Body**: only when the description is not enough. Blank line after the description, wrapped at 72 characters, explains what and why, not how.
- **Footer**: `BREAKING CHANGE: ...` (uppercase), issue references (`Closes #123`), co-authors.
- Never add a `Co-Authored-By: Claude ...` or any other AI-attribution trailer.
- Match the style of the recent commits.

## Step 4: Present to the user

Show the message in a fenced code block. For a recommended split, show one block per commit with a note on which changes belong to it.

Never run `git commit`; the user decides when and how to commit.
