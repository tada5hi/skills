---
name: generate-commit-message
description: Generate a Conventional Commits message for uncommitted changes in the working directory. Use when user wants to "generate commit message", "write commit message", "conventional commit", or before committing staged changes.
license: Apache-2.0
compatibility: Requires git repository with uncommitted changes.
metadata:
  author: tada5hi
  version: "2026.03.23"
allowed-tools: Bash(git:*) Read Glob Grep Agent
---

# generate-commit-message

> Analyze uncommitted changes in the working directory and generate a commit message following the [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) specification.

## Conventional Commits Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | A new feature (SemVer MINOR) |
| `fix` | A bug fix (SemVer PATCH) |
| `build` | Changes to the build system or external dependencies |
| `chore` | Maintenance tasks that don't modify src or test files |
| `ci` | Changes to CI configuration files and scripts |
| `docs` | Documentation-only changes |
| `style` | Formatting, whitespace, semicolons — no code logic change |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | A code change that improves performance |
| `test` | Adding or correcting tests |

### Breaking changes

Indicate breaking changes (SemVer MAJOR) by either:
- Adding `!` after the type/scope: `feat(api)!: remove deprecated endpoint`
- Adding a `BREAKING CHANGE:` footer (must be uppercase)

## Step 1: Gather changes

Run these commands to understand the current state:

```bash
# Check what's staged vs unstaged
git status --short

# Show staged changes (if any)
git diff --cached --stat
git diff --cached

# Show unstaged changes (if any)
git diff --stat
git diff

# Show untracked files that might be relevant
git ls-files --others --exclude-standard

# Get recent commit messages for style reference
git log --oneline -10
```

**Important:**
- If there are **no staged changes and no unstaged changes**, inform the user there is nothing to commit and stop.
- If there are both staged and unstaged changes, generate the message based on **staged changes only** (what `git commit` would include). Mention that unstaged changes exist but won't be included.
- If nothing is staged but there are unstaged changes, generate the message for **all unstaged changes** and note that the user will need to stage them first.

## Step 2: Analyze the changes

Read the diffs carefully and determine:

1. **What changed** — which files, functions, or modules were modified, added, or removed.
2. **Why it changed** — infer the purpose from the diff context, file names, and surrounding code. If the purpose is ambiguous, read the relevant source files for context.
3. **Scope** — identify if changes are confined to a single module/package/area. If so, use it as the scope. If changes span multiple areas, omit the scope or use the most prominent one.
4. **Breaking changes** — look for removed public APIs, changed function signatures, renamed exports, deleted files, or config format changes that would break consumers.
5. **Single or multiple commits** — if the changes clearly address multiple unrelated concerns (e.g., a bug fix AND a new feature), recommend splitting into separate commits and provide a message for each.

## Step 3: Compose the message

Follow these rules:

- **Description**: Use imperative mood ("add", "fix", "remove", not "added", "fixes", "removed"). Keep it under 72 characters. Do not end with a period. Start with lowercase.
- **Scope**: Use a noun describing the affected area (e.g., `parser`, `auth`, `cli`, `deps`). Omit if changes are broad.
- **Body**: Include only if the description alone doesn't convey the full picture. Separate from description with a blank line. Wrap at 72 characters. Explain *what* and *why*, not *how*.
- **Footer**: Use for breaking changes (`BREAKING CHANGE: ...`), issue references (`Closes #123`), or co-authors.
- Match the style and conventions of recent commits in the repository.

## Step 4: Present to the user

Present the generated commit message in a fenced code block:

```
<the generated message>
```

If you recommended splitting into multiple commits, present each message separately with a brief note on which changes belong to each commit.

Do NOT automatically run `git commit`. The user decides when and how to commit.
