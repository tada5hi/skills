---
name: skills-link
description: Link skills from skills/ into .claude/skills/ so Claude Code discovers them. Use when a new skill is added, or after "link skills" or "register skills".
license: Apache-2.0
compatibility: Requires a clone of tada5hi/skills (or a repository with the same `skills:link` script) with dependencies installed and skills under skills/<skill-id>/SKILL.md.
metadata:
  author: tada5hi
  version: "2026.11.21"
allowed-tools: Bash(npm:*) Glob Read
---

# skills-link

> Link every skill under `skills/` into `.claude/skills/`, where Claude Code discovers project skills.

Run:

```bash
npm run skills:link
```

The `link` command (`src/commands/link.ts`) works in the CLI's own repository root, not the current directory:

1. Creates `.claude/skills/` if missing.
2. For each directory under `skills/` that contains a `SKILL.md`:
   - **Skips** it when `.claude/skills/<name>/SKILL.md` already exists, whether through a link or a copied directory.
   - Otherwise deletes an existing `.claude/skills/<name>` (a directory without `SKILL.md`) and links it: an NTFS junction on Windows, a relative symlink elsewhere.
   - A link that cannot be created is reported as `WARN  Failed to link <name>`, for example a dangling symlink already at the target. Delete it and run again.
3. Prints `<n> linked, <m> skipped.`

Running it again is safe. `.claude/` is gitignored, so the links stay local.
