---
name: init-ts-project
description: Scaffold a new TypeScript project from tada5hi/typescript-template. Use when the user asks to "init ts project", "create a new typescript library", "scaffold typescript package", or wants to bootstrap a new repository based on the template.
license: Apache-2.0
compatibility: Requires git, Node.js >= 22, npm, and network access to fetch the template.
metadata:
  author: tada5hi
  version: "2026.05.06"
allowed-tools: Read Write Edit Bash(git:*) Bash(npm:*) Bash(mkdir:*) Bash(ls:*) Bash(rm:*) Bash(mv:*) Glob Grep
---

# init-ts-project

> Scaffold a new TypeScript library by cloning [tada5hi/typescript-template](https://github.com/tada5hi/typescript-template), renaming all template references to the new package name, and verifying the build.

## Overview

Bootstraps a new TypeScript package by:

1. Fetching the template repository contents (without history).
2. Replacing every `typescript-template` / `Tada5hi/typescript-template` reference with the new package coordinates.
3. Updating `package.json` metadata (name, description, keywords, repository URL).
4. Updating `README.MD` badges and install instructions.
5. Updating `.github/ISSUE_TEMPLATE/config.yml` discussion URL.
6. Installing dependencies and verifying the build.

## When to Use

- Creating a new TypeScript library inside the `tada5hi` GitHub organization (e.g., `eldin`, `orkos`).
- Bootstrapping a one-off TypeScript package that follows the same tooling conventions (`tsdown`, `vitest`, `eslint`, `husky`, release-please).
- When the user says: "init ts project", "scaffold a new typescript library", "create a new package from the template", or similar.

## Inputs

Collect these from the user before starting. If any are missing, ask once and proceed.

| Input | Required | Default | Notes |
|-------|----------|---------|-------|
| `name` | Yes | — | Package name (npm name + repo name). Must be lowercase, kebab-case. |
| `description` | Yes | — | One-line description for `package.json` and `README.MD`. |
| `keywords` | No | `[]` | Comma-separated list inserted into `package.json#keywords`. |
| `target` | No | `./<name>` | Target directory. Must not exist or must be empty. |
| `template` | No | `https://github.com/tada5hi/typescript-template` | Source template repository. |
| `org` | No | `tada5hi` | GitHub organization for repository URL and badges. |
| `license` | No | `MIT` | SPDX identifier written to `package.json#license`. |

## Process

### 1. Validate inputs

- Confirm `name` matches `^[a-z][a-z0-9-]*$`.
- Confirm `target` does not exist, or is an empty directory. If it exists and is non-empty, stop and ask the user.
- Confirm `git` and `npm` are available.

### 2. Fetch the template

Clone the template into the target directory without carrying its history:

```bash
git clone --depth=1 "$TEMPLATE" "$TARGET"
rm -rf "$TARGET/.git"
rm -f  "$TARGET/package-lock.json"
rm -rf "$TARGET/node_modules" "$TARGET/dist"
```

Initialize a fresh git repository in the target directory:

```bash
git -C "$TARGET" init -b master
```

Do **not** copy the template's tags or remotes.

### 3. Rewrite template references

Apply these replacements across all text files in the target (skip `node_modules`, `dist`, `.git`):

| Find | Replace with |
|------|--------------|
| `typescript-template` | `<name>` |
| `Tada5hi/typescript-template` | `<org>/<name>` |
| `tada5hi/typescript-template` | `<org-lowercase>/<name>` |

Use `Edit` per file (preferred) or, if the surface is large, a `find … -exec sed -i …` invocation that excludes binary paths. Always verify the diff before continuing.

### 4. Update `package.json`

Edit `package.json` and set:

- `name` → `<name>`
- `description` → `<description>` (replace the empty string)
- `keywords` → array form of the user's `keywords` input (or `[]`)
- `repository.url` → `https://github.com/<org-lowercase>/<name>.git`
- `license` → `<license>` (only if the user changed the default)

Leave `version`, `author`, `engines`, `scripts`, `devDependencies`, and `publishConfig` untouched — they are template-wide defaults.

### 5. Update `README.MD`

In `README.MD`:

- Replace the H1 (`# typescript-template 🚀`) with `# <name> 🚀`.
- Replace the `This is a package to ...` placeholder with `<description>`.
- Replace `npm install typescript-template --save` with `npm install <name> --save`.
- Update every badge link reference at the bottom of the file (`badge.fury.io`, `codecov.io`, `github.com/Tada5hi/...`, `snyk.io/test/github/Tada5hi/...`) so the slug points at `<org>/<name>`.

### 6. Update `.github/ISSUE_TEMPLATE/config.yml`

Replace `https://github.com/Tada5hi/typescript-template/discussions` with `https://github.com/<org>/<name>/discussions`.

### 7. Install and verify

Run, in order, from the target directory:

```bash
npm install
npm run lint
npm run build
```

If any step fails, surface the failure to the user and stop — do not silently retry or skip.

### 8. Initial commit

Stage everything and create a single conventional commit on `master`:

```bash
git -C "$TARGET" add -A
git -C "$TARGET" commit -m "chore: initial commit from typescript-template"
```

Do **not** add a `Co-Authored-By` trailer.

### 9. Report

Print a short summary listing:

- Target directory (absolute path)
- Package name and resulting repository URL
- Build status (passed/failed)
- Suggested next steps: create the GitHub repo (`gh repo create <org>/<name> --source=<target> --push`), write `src/index.ts`, and replace the README's `## Usage` placeholder.

## Guidelines

- **Never modify the template repository itself.** All edits happen inside the target directory.
- **Keep the template's tooling intact.** Do not bump `devDependencies`, change `tsconfig.json`, or alter `eslint.config.js`/`tsdown.config.ts` as part of scaffolding — those are the template's contract.
- **Do not write source code.** Leave `src/index.ts` and `test/` as-is so the user controls the initial implementation.
- **Stop on first error.** A failing `npm install` or `npm run build` indicates a template-side issue or a missing prerequisite — do not paper over it.
- **One commit only.** The initial commit should be a clean snapshot, not a series of "rename", "update package.json", "fix readme" commits.
