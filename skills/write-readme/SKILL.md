---
name: write-readme
description: Write or overhaul a project README in a hero-led style — centered logo, one-line pitch, a few meaningful badges, a "Why <project>?" section with a comparison table, theme-aware SVG diagrams, and reference sections (usage, options, API, notes) verified against the source. Use when asked to write, rewrite, improve or "make beautiful" a README, when a README is just a heading, an install line and an API dump, when a rename, monorepo split or API overhaul left READMEs stale, when a package needs its first real README, or when asked for a project logo, diagrams or a "Why …?" section. Geared to npm packages and monorepos.
license: Apache-2.0
compatibility: Previews SVGs with headless Chrome or Chromium. Type-checking samples needs the project's TypeScript toolchain.
metadata:
  author: tada5hi
  version: "2026.10.16"
allowed-tools: Bash(bash:*) Bash(npx:*) Bash(npm:*) Bash(git:*) Bash(curl:*) Read Write Edit Glob Grep
---

# write-readme

> Turn a README that lists what a library has into one that says why someone should use it, shows how it works in a picture, and stays correct because every claim was checked against the code.

A reader decides in ten seconds whether to keep reading. The top of the page has to answer "what is this and why would I want it"; the rest is a reference they come back to.

Copy this checklist and track progress:

```
- [ ] Step 1: public surface and behaviour read from the code
- [ ] Step 2: "Why" table drafted from the reader's side
- [ ] Step 3: logo and diagrams drawn, previewed in all four renders
- [ ] Step 4: sections written
- [ ] Step 5: samples type-check, claims match the code, anchors resolve, lint passes
```

## Structure

Write the page in this order. Copy `templates/readme.md` and fill in its `{{placeholders}}`.

| Section | Content |
|---------|---------|
| Hero | Centered logo, `<h1>`, the pitch (bold, under 120 characters, same sentence as the `package.json` description) plus one or two lines on what the reader stops writing, a badge row, a nav row linking the main sections, then `---` |
| `## Why <project>?` | The problem in the reader's words, a **Concern / Without it / With it** table, and a short side-by-side or "same thing, three ways" sample |
| Diagram | One SVG that shows the mechanism (data flow, resolution order, retry loop), right where the text needs it |
| `**Table of Contents**` | Only for a long README. Bold label, nested list, not a `##` heading. GitHub has its own outline button; npm has none |
| `## Installation` | Install command, module format, Node range, notable peer dependencies |
| `## Usage` / topic sections | One `##` per concept, each with a sample first and the rules after it |
| `## Options` / `## Hooks` | Tables: name, type, default, description |
| `## API` | Table of every public export: export, kind, purpose. With a docs site, link to its reference instead: duplicates drift |
| `## Notes` | Bold-led bullets for behaviour readers get wrong: delivery guarantees, what is lost, what is never retried |
| `## Contributing` / `## License` | Links to `CONTRIBUTING.md` and `LICENSE`; keep the project's existing sign-off |

When the project already has a brand, badge set or README conventions, keep them and apply only the parts of this structure that are missing.

For a monorepo, the root README is a landing page: hero, Why, the diagram, a Packages table (name, version badge, one-line description), install, one quick start, development commands. Each package README must also stand on its own on npm, where it is read without the root: pitch, install, a minimal sample, then the full reference for that package.

## Step 1: Read the code, not the old README

List the public surface first — the barrel file (`src/index.ts`) is the source of truth — then read every module it exports. Note for each class: constructor options and defaults, hooks and when they fire, what resolves, what rejects, what is acked, what is dropped. Old READMEs and agent docs are hints, never sources.

When a dependency's behaviour shapes a claim (which queue is declared, what is retried), read that dependency's source or docs too. This is where READMEs most often go wrong.

## Step 2: Find the "why"

Most READMEs say what a project is and how to install it; few say why anyone would use it. Answer, in the reader's terms:

1. What do they write today without this project? That is the "Without it" column.
2. What does this project take off their hands? One row per concern: lifecycle, retries, testing, observability, shutdown, typing.
3. What is the shortest sample that shows the difference? Prefer the same thing done two or three ways over a feature tour.

Be concrete. "Re-published after an exponential backoff, dropped after `maxAttempts`" says something; "robust retry handling" does not. Compare capabilities, not adjectives, and describe the alternative fairly. Leave out numbers that go stale (benchmarks, bundle sizes, star counts) unless they link to a live source.

## Step 3: Draw the SVGs

Put them in `.github/assets/`. Start from `templates/logo.svg` and `templates/diagram.svg`. The values below are the default house style; when the project has its own colours or logo, use those.

**Logo** (256 × 256):

- A rounded tile filled with a two-stop gradient at low opacity and a thin gradient edge. Translucent, so one file works on light and dark backgrounds without a media query.
- A pictogram of the mechanism, not of the name: an exchange routing into queues, components around a bus.
- One or two SMIL animations (`animateMotion` along the paths, `animate` on `opacity`) with staggered negative `begin` offsets so the motion is already under way on load. Let them run one pass and settle (`repeatCount="1" fill="freeze"`): a README image cannot be paused, and motion longer than 5 seconds without a pause control fails WCAG 2.2.2. A perpetual loop is the project owner's call, not a default.
- A `<title>` for anyone opening the file on its own. Prefix every `id` (`ae-`, `sy-`): ids are global when several SVGs share a page.
- Sub-packages get a variant of the parent logo that swaps one element (the bus becomes the exchange), so they read as a family.

**Diagrams** (960 wide):

- Colours as CSS variables in a `<style>` block, redefined under `@media (prefers-color-scheme: dark)`. GitHub shows `<img>` SVGs on a transparent background and the media query follows the reader's theme there.
- npm's page is always light, while the SVG may still pick the dark palette from the reader's OS. Put every piece of text on a panel, card or chip, never directly on the transparent background, so it stays readable when scheme and page disagree.
- One accent colour per role (caller, bus, worker; ok, retry, drop) and keep it consistent across every diagram of the project.
- A `<desc>` that states the whole flow in prose, repeated in the `alt` of the `<img>`: screen readers get the `alt` only, never the SVG's `<title>` or `<desc>`. Keep the facts in the surrounding text too.
- SVG collapses leading whitespace in `<text>`: indent code lines with `x`, not spaces.

**Preview every SVG and look at the result** before referencing it. Run the bundled script from this skill's directory:

```bash
bash scripts/preview-svg.sh .github/assets/architecture.svg "${TMPDIR:-/tmp}/readme-preview"
```

It checks that the file is well-formed XML, then writes four PNGs: `light.png` and `dark.png` (GitHub's two themes), `mismatch.png` (dark scheme on a light page, as npm shows it on a dark OS) and `inverse.png`. It forces each colour scheme, because headless Chrome otherwise follows the OS. Set `CHROME=/path/to/binary` if it cannot find a browser.

Open all four PNGs and check: overlapping labels, text running out of its box, arrows that miss their target, contrast in every combination. Fix and re-run until all four read cleanly.

## Step 4: Write the sections

- Every sample imports from the package name, uses real option names, and is short enough to read without scrolling.
- Rules after the sample, as bullets or a table. Tables for anything with more than three entries of the same shape (options, hooks, routings, exports).
- Badges: three or four that measure something (version, CI, coverage), with alt text. Decorative and popularity badges add noise. Keep the badge set identical in style across the root and the packages, with a version badge per package in the Packages table.
- Images in package READMEs: npm resolves relative paths against the repository's default branch, never the tarball, so a published version shows whatever the branch holds today. Pin them to a tag or commit, or serve them from the published package via jsDelivr. The root README can use relative paths. Details, cache times and sources: `references/rendering.md`.

## Step 5: Verify

Run every check; fix and re-run until all pass.

1. **Type-check every sample.** Paste the samples into a uniquely named temporary file inside the project (for example `test/readme-samples.tmp.ts`, somewhere the `tsconfig` covers), add `declare const` stubs for the reader's own objects (`logger`, `repository`), run `npx tsc --noEmit`, then delete the file, also when the check fails. In a JavaScript-only project, run the samples instead. For checks that keep running in CI, suggest `typescript-docs-verifier` or `embedme --verify` to the user.
2. **Check every behavioural claim** against the code from Step 1: defaults, what resolves or rejects, what is acked, what is retried. Check that each sample shows what its table row promises. If the code contradicts what the README should promise, document what the code does and tell the user. Do not fix the code silently.
3. **Check links and anchors**: every `#anchor` in the nav row and the ToC matches a heading (`## Why foo?` → `#why-foo`).
4. Run the project's lint, and update agent docs (`.agents/structure.md`) that list `.github/assets/`.

## Writing rules

- Second person, present tense, plain sentences.
- Follow the repository's prose conventions (`AGENTS.md`, contributing guide): some ban the em dash, some want British spelling.
- No marketing adjectives, no emoji in headings or as bullets beyond the project's existing style, no AI attribution.
- Descriptive link text, never "here".
- Say what is lost, duplicated or never retried. Readers trust a README that states its limits.

## Common mistakes

| Mistake | Fix |
|---------|-----|
| A feature list as the "Why" | A Concern / Without / With table, from the reader's side |
| `<placeholder>` text left in an SVG | It breaks the XML and the image; the preview script rejects it |
| Diagram text invisible in dark mode, or on npm | CSS variables plus a dark block, and every label on a panel or chip |
| SVG never looked at | Run `scripts/preview-svg.sh` and inspect all four PNGs |
| Diagram meaning only inside the SVG | Full description in the `alt`, facts in the text |
| An endlessly looping animation | One pass with `fill="freeze"` |
| Package README images showing the wrong version on npm | Pin to a tag, a commit or the published package |
| Samples written from memory | Type-check them against the source |
| Claims copied from the old README | Re-derive them from the code and the dependency's behaviour |
| Clashing ids between SVGs | Prefix every id per file |

## Examples

- [`amqp-extension`](https://github.com/tada5hi/amqp-extension): hero, "Why amqp-extension?" with an amqplib comparison table and a side-by-side sample, animated logo, Options / API / Notes.
- [`hubwire`](https://github.com/tada5hi/synergos): monorepo landing page with a Packages table, a sub-package logo variant, and theme-aware architecture, resolution and retry diagrams.
