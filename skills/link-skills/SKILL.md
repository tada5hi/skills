---
name: link-skills
description: Link skills from skills/ into .claude/skills/ so Claude Code discovers them. Use when a new skill is added, after "link skills", "register skills", or "sync skills".
license: Apache-2.0
compatibility: Requires a git repository with skills defined under skills/<skill-id>/SKILL.md.
metadata:
  author: tada5hi
  version: "2026.03.18"
allowed-tools: Bash Glob Read
---

# link-skills

> Create platform-appropriate links in `.claude/skills/` for every skill defined under `skills/`, so Claude Code auto-discovers them.

## Why

Claude Code discovers project skills only from `.claude/skills/<name>/SKILL.md`. This repository keeps the source-of-truth definitions under `skills/`. Linking bridges the two without duplicating files.

## Instructions

Run the CLI command:

```bash
npm run skills:link
```

This will:

1. **Scan** `skills/` for every directory containing a `SKILL.md`.
2. **Create** `.claude/skills/` if it does not exist.
3. **Link** each skill using the appropriate method for the platform:
   - **Windows**: NTFS junctions (no admin rights needed)
   - **Unix/macOS**: relative symlinks
4. **Skip** skills that are already correctly linked.
5. **Report** a summary of what was linked or skipped.

## Notes

- `.claude/` is already in `.gitignore` — the links are local-only and will not be committed.
- This skill is idempotent: running it multiple times is safe.
- The underlying implementation is in `src/cli.ts` (the `link` command).
