---
name: ts-project-init
description: Scaffold a new TypeScript project from tada5hi/typescript-template. Use when the user asks to "init ts project", "create a new typescript library", "scaffold typescript package", or wants to bootstrap a new repository based on the template.
license: Apache-2.0
compatibility: Requires git, Node.js >= 22, npm, and network access to fetch the template.
metadata:
  author: tada5hi
  version: "2026.11.21"
allowed-tools: Read Write Edit Bash(git:*) Bash(npm:*) Bash(rm:*) Bash(ls:*) Glob Grep
---

# ts-project-init

> Scaffold a new TypeScript library from [tada5hi/typescript-template](https://github.com/tada5hi/typescript-template): copy it without history, rename every template reference, install, lint, build and commit once.

## Inputs

| Input | Required | Default | Notes |
|-------|----------|---------|-------|
| `name` | Yes | none | npm and repository name, lowercase kebab-case. |
| `description` | Yes | none | One line for `package.json` and `README.MD`. |
| `keywords` | No | `[]` | Comma-separated, written to `package.json#keywords`. |
| `target` | No | `./<name>` | Must not exist, or be empty. |
| `template` | No | `https://github.com/tada5hi/typescript-template` | Source repository. |
| `org` | No | `tada5hi` | GitHub owner for URLs and badges, any case (e.g. `Tada5hi`). |
| `license` | No | `MIT` | SPDX identifier. |

If `name` or `description` is missing, ask for both in one question before starting. Do not ask about optional inputs; use the defaults unless the user gave a value.

`<org-lowercase>` is `org` lowercased, used where GitHub paths must be lowercase (`repository.url`). `<org>` keeps the user's casing.

## Process

### 1. Validate

- `name` matches `^[a-z][a-z0-9-]*$`.
- `target` does not exist or is empty (`ls -A "$TARGET"` prints nothing; Glob misses dotfiles). Otherwise stop and ask the user.
- `git` and `npm` are available.

### 2. Fetch the template

```bash
git clone --depth=1 "$TEMPLATE" "$TARGET"
rm -rf "$TARGET/.git" "$TARGET/node_modules" "$TARGET/dist"
rm -f  "$TARGET/package-lock.json"
git -C "$TARGET" init -b master
```

### 3. Rewrite template references

First delete the `## Using This Template` section from `.agents/conventions.md` (it describes bootstrapping from the template, which this skill does), and make sure `.release-please-manifest.json` is `{ ".": "0.0.0" }`.

Then, across all text files in the target (skip `node_modules`, `dist`, `.git`), replace in this order, so the namespaced forms match before the bare name does:

| Find | Replace with |
|------|--------------|
| `Tada5hi/typescript-template` | `<org>/<name>` |
| `tada5hi/typescript-template` | `<org-lowercase>/<name>` |
| `typescript-template` | `<name>` |

Find occurrences with Grep and change them with Edit; `sed` and `find` are not in `allowed-tools`. This covers the README heading, badges and install line, `package.json#name`, `repository.url` and the discussions URL in `.github/ISSUE_TEMPLATE/config.yml`.

The new repository has no commit yet, so `git diff` shows nothing. Verify instead: a case-insensitive Grep for `typescript-template` in the target returns no matches.

### 4. Update `package.json`

- `description`: `<description>`
- `keywords`: array form of `keywords`
- `license`: `<license>`, only when the user gave one

Leave `version`, `author`, `engines`, `scripts`, `devDependencies` and `publishConfig` as the template has them.

### 5. Update `README.MD`

- Replace the `This is a package to ...` placeholder with `<description>`.
- Remove the `?token=...` query from the Codecov badge URL; the token belongs to the template's Codecov project.

### 6. Install and verify

From the target directory, in order:

```bash
npm install
npm run lint
npm run build
```

If one fails, stop: do not retry, skip or commit. Report the target path, the failing command and its output.

### 7. Initial commit

```bash
git -C "$TARGET" add -A
git -C "$TARGET" commit -m "chore: initial commit from typescript-template"
```

No `Co-Authored-By` trailer or other AI attribution.

### 8. Report

- Target directory (absolute path)
- Package name and repository URL
- Next steps: create the GitHub repository (`gh repo create <org>/<name> --source=<target> --push`); rewrite `AGENTS.md` and `.agents/*.md`, which still describe the template (for example with `agent-docs-init`); write `src/index.ts`; replace the README's `## Usage` placeholder.

## Guidelines

- Never modify the template repository; all edits happen in the target.
- Keep the template's tooling: do not bump `devDependencies` or change `tsconfig.json`, `eslint.config.js` or `tsdown.config.ts`.
- Do not write source code. `src/` and `test/` stay as the template has them.
- One commit only, not a series of rename commits.
