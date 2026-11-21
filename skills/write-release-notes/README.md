# write-release-notes

> **Write highlights-first GitHub release notes above the generated changelog.**
> Stop publishing a raw commit list and leaving readers to work out what a release means for their project.

[All skills](../../README.md#skills) · [`SKILL.md`](./SKILL.md)

## Why write-release-notes?

A commit list answers "what landed". A reader upgrading needs to know what a release means for their project and what they have to do. Writing that by hand means collecting every prerelease since the last stable version, reading pull requests for the motivation, and making sure no sample or link describes something that is not published yet.

| Concern | Without it | With write-release-notes |
|---|---|---|
| **Range** | Only the delta since the previous tag | Everything since the last stable release, including every beta in between |
| **Structure** | One line per commit | One highlight per user-visible change, each with a code sample and a docs link |
| **Accuracy** | Samples copied from docs on `master` | Code and docs read at the release tag; anything in `<tag>..HEAD` stays out |
| **Breaking changes** | Buried in the list | A heads-up table of change and what to do, plus an upgrading section |
| **Changelog** | Replaced or dropped | Kept at the bottom under a compare link, grouped as features, fixes, refactors and breaking changes |
| **Links** | Guessed | Each URL fetched with `curl`, fragments checked against the page's anchors |

## Installation

```bash
# this skill only, any Agent Skills agent
npx skills add tada5hi/skills --skill='write-release-notes'

# Claude Code: the plugin bundles every skill
/plugin marketplace add tada5hi/skills
/plugin install skills@tada5hi
```

## Triggering

**Ask for it.** The agent loads the skill when your request matches its description, for example:

- "draft release notes for v4.0.0"
- "rewrite the release notes for the last release"
- "publish the GitHub release"

The agent may also use it when announcing a major or minor version, when a stable release closes a beta cycle, or when a release page shows nothing but a raw commit list.

**Invoke it directly.** Type `/write-release-notes` (installed with the skills CLI) or `/skills:write-release-notes` (Claude Code plugin).

## What it does

1. Determines the range since the last stable release from `gh release list` and the tags.
2. Gathers release bodies, the commit log and pull request descriptions for that range.
3. Reads code and docs at the tag and checks `<tag>..HEAD` for unreleased work to leave out.
4. Groups changes by user impact and writes each highlight: what changed, why it matters, a sample, an optional alert, a docs link.
5. Adds the heads-up table, the upgrading section and the generated changelog, starting from `templates/release-notes.md`.
6. Checks every link and anchor, then publishes with `gh release edit`, or `gh release create` when the tag has no release yet.

## Requirements

- A git repository with release tags.
- The `gh` CLI, authenticated for the target repository.
- `curl` and network access for the link check.

## Output

A `notes.md` file with the release body, and, once you confirm, a published GitHub release. The body follows this order: lead quote, `📣 Some News`, `👀 Highlights`, `⚠️ Heads-Up Before Upgrading`, `⬆️ Upgrading`, `👉 Changelog`. For an example, see the [`typeorm-extension` v4.0.0 release](https://github.com/tada5hi/typeorm-extension/releases/tag/v4.0.0).

## Notes

- **It asks before the first publish.** A release page is public, so it shows the draft first unless you already asked for it to go out.
- **It never edits a bot-owned `CHANGELOG.md`.** A wrong generated entry is corrected in the release body, and it tells you the body now differs from the file.
- **Patch releases can skip it.** For one or two fixes, the generated changelog is enough.
- **The changelog is never dropped.** Readers scan it for their own issue number.
- **No AI attribution** anywhere in the body.

## License

Apache-2.0, see [LICENSE](../../LICENSE).
