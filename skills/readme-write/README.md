# readme-write

> **Write a hero-led README with a "Why …?" section, theme-aware SVG logo and diagrams, and verified samples.**
> Stop shipping a heading, an install line and an API dump, or samples nobody type-checked.

[All skills](../../README.md#skills) · [`SKILL.md`](./SKILL.md)

## Why readme-write?

Most READMEs say what a project is, not why anyone would use it. A better one needs SVGs that stay readable on GitHub's light and dark themes and on npm, samples and claims checked against the code, and a rewrite that keeps the reference material readers came back for.

| Concern | Without it | With readme-write |
|---|---|---|
| **The pitch** | A feature list | A "Why …?" section with a Concern / Without it / With it table from the reader's side |
| **Visuals** | No logo, or a diagram unreadable in dark mode | Logo concepts for you to choose from, and diagrams with CSS variables, a dark-mode block and every label on a panel |
| **Previews** | SVG never looked at | `scripts/preview-svg.sh` renders light, dark, mismatch and inverse PNGs, plus settled renders for animated SVGs |
| **Samples** | Written from memory | Type-checked with `npx tsc --noEmit` in a temporary file that is deleted afterwards |
| **Existing content** | Lost in the rewrite | The old README's capabilities are inventoried first, and every removed explanation is mapped to where it went |

## Installation

```bash
# this skill only, any Agent Skills agent
npx skills add tada5hi/skills --skill='readme-write'

# Claude Code: the plugin bundles every skill
/plugin marketplace add tada5hi/skills
/plugin install skills@tada5hi
```

## Triggering

**Ask for it.** The agent loads the skill when your request matches its description, for example:

- "write a README for this package"
- "rewrite the README"
- "make the README beautiful"
- "draw a logo and a diagram for the README"
- "add a Why section"

The agent may also use it when a README is just a heading, an install line and an API dump, when a rename, monorepo split or API overhaul left READMEs stale, or when a package needs its first real README.

**Invoke it directly.** Type `/readme-write` (installed with the skills CLI) or `/skills:readme-write` (Claude Code plugin).

## What it does

1. Inventories the existing README and reads the public surface from the barrel file and every module it exports.
2. Drafts the "Why" table: what you write today, what the project takes off your hands, the shortest sample that shows it.
3. Derives a visual identity from the project, draws two or three logo concepts for you to choose from, and draws diagrams of the mechanism, previewing each in four renders.
4. Writes the sections from `templates/readme.md`: hero, Why, diagram, installation, usage, options, API, notes.
5. Verifies: type-checks samples, checks behavioural claims and anchors, runs the project's lint, updates agent docs that list `.github/assets/`, and reviews the diff for lost capability documentation.

## Requirements

- Headless Chrome or Chromium for SVG previews (set `CHROME=/path/to/binary` if it is not found).
- perl for the settled renders of animated SVGs; xmllint (optional) for the well-formedness check.
- The project's TypeScript toolchain to type-check samples.

## Output

A rewritten `README.md` (and package READMEs in a monorepo), SVGs in `.github/assets/`, and updates to agent docs such as `.agents/structure.md` that list them. For examples of the result, see [`amqp-extension`](https://github.com/tada5hi/amqp-extension) and the [`hubwire`](https://github.com/tada5hi/synergos) monorepo landing page.

## Notes

- **You choose the logo.** Unless the project already has one, it shows two or three concepts that differ in form, not only in colour.
- **Existing brands are kept.** A logo, badge set or README conventions already in place stay; only missing parts are added.
- **The code wins.** When the code contradicts what the README should promise, it documents what the code does and tells you; it does not change the code.
- **Animations run once.** SMIL animations settle after one pass, with the settled state in the static attributes.
- **Package images are pinned.** npm resolves relative paths against the default branch, so package README images point at a tag, a commit or the published package.
- **No marketing adjectives and no AI attribution.**

## License

Apache-2.0, see [LICENSE](../../LICENSE).
