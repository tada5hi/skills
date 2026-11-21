# skills-link

> **Link every skill under `skills/` into `.claude/skills/` so Claude Code discovers it.**

[All skills](../../README.md#skills) · [`SKILL.md`](./SKILL.md)

## Why skills-link?

Claude Code finds project skills only in `.claude/skills/<name>/SKILL.md`; this repository keeps them under `skills/`. A link makes a new skill visible in this checkout and, unlike a copy, never goes stale.

| Concern | Without it | With skills-link |
|---|---|---|
| **Discovery** | A new skill under `skills/` is invisible to Claude Code | Each skill directory is linked into `.claude/skills/` |
| **Platforms** | Symlinks need admin rights on Windows | NTFS junctions on Windows, relative symlinks elsewhere |

## Installation

In a clone of this repository nothing needs installing: run `npm run skills:link`. As a skill:

```bash
npx skills add tada5hi/skills --skill='skills-link'

# Claude Code: the plugin bundles every skill
/plugin marketplace add tada5hi/skills
/plugin install skills@tada5hi
```

## Triggering

"link skills", "register skills", or after adding a skill. Invoke directly with `/skills-link` (skills CLI) or `/skills:skills-link` (Claude Code plugin).

## What it does

Runs `npm run skills:link` (`src/commands/link.ts`): creates `.claude/skills/`, links each skill that has a `SKILL.md`, skips targets that already contain one, and prints `<n> linked, <m> skipped.`

## Requirements

A clone of this repository (or one with the same `skills:link` script) with `npm install` done.

## Notes

- **Local only.** `.claude/` is gitignored.
- **A copy counts as linked.** A copied `.claude/skills/<name>` with a `SKILL.md` is skipped; delete it to get a link.
- **A dangling symlink is not replaced.** The CLI reports `Failed to link <name>`; delete the link and run again.

## License

Apache-2.0, see [LICENSE](../../LICENSE).
