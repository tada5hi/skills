# link-skills

> **Link every skill under `skills/` into `.claude/skills/` so Claude Code discovers it.**
> Stop copying skill directories by hand when you add or rename one in this repository.

[All skills](../../README.md#skills) · [`SKILL.md`](./SKILL.md)

## Why link-skills?

This skill is mostly for people developing this repository. Claude Code finds project skills only in `.claude/skills/<name>/SKILL.md`, while this repository keeps the definitions under `skills/`. Without a link, a skill you just wrote is invisible to Claude Code in this checkout, and a copied directory goes stale with the next edit.

| Concern | Without it | With link-skills |
|---|---|---|
| **Discovery** | A new skill under `skills/` does not show up in Claude Code | Links each skill directory into `.claude/skills/` |
| **Staying current** | Copies drift from the source after every edit | Links point at the source, so edits show up at once |
| **Platforms** | Symlinks need admin rights on Windows | Uses NTFS junctions on Windows and relative symlinks on Unix and macOS |
| **Repeat runs** | Unsure which skills are already set up | Skips skills whose target already has a `SKILL.md` and reports the counts |

## Installation

```bash
# this skill only, any Agent Skills agent
npx skills add tada5hi/skills --skill='link-skills'

# Claude Code: the plugin bundles every skill
/plugin marketplace add tada5hi/skills
/plugin install skills@tada5hi
```

When you work in a clone of this repository, you do not need to install it: `npm run skills:link` does the same thing.

## Triggering

**Ask for it.** The agent loads the skill when your request matches its description, for example:

- "link skills"
- "register skills"

The agent may also use it when a new skill is added.

**Invoke it directly.** Type `/link-skills` (installed with the skills CLI) or `/skills:link-skills` (Claude Code plugin).

## What it does

1. Runs `npm run skills:link`, the `link` command of this repository's CLI.
2. Scans `skills/` for every directory that contains a `SKILL.md`.
3. Creates `.claude/skills/` if it does not exist.
4. Links each skill, skipping any whose target in `.claude/skills/` already contains a `SKILL.md`.
5. Reports how many skills it linked and skipped.

## Requirements

- A clone of this repository, or one with the same `skills:link` script, with skills under `skills/<skill-id>/SKILL.md`.
- Dependencies installed with `npm install`, since the script runs the CLI in `src/`.

## Output

Links in `.claude/skills/`, one per skill, and a summary from the CLI:

```text
Skills Manager — link

  INFO  Skipped (exists): adopt-upgrades
  DONE  Linked: track-upstream
  ...

1 linked, 31 skipped.
```

## Notes

- **Local only.** `.claude/` is in `.gitignore`, so the links are never committed.
- **Safe to run again.** Running it several times changes nothing for skills that are already linked.
- **A copy counts as linked.** A `.claude/skills/<name>` directory that holds a copied `SKILL.md` is skipped, not replaced by a link; delete it to get a link.
- **Broken entries are replaced.** A `.claude/skills/<name>` without a `SKILL.md`, such as a dangling link, is deleted and replaced by a link.
- **Not the vendor sync.** Pulling upstream changes into vendor skills is `npm run skills:sync`, a different command.
- **Same as the npm script.** The skill only runs `npm run skills:link`; the implementation is in `src/commands/link.ts`.

## License

Apache-2.0, see [LICENSE](../../LICENSE).
