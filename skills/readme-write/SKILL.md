---
name: readme-write
description: Write or overhaul a project README in a hero-led style — centered logo or wordmark, one-line pitch, a few meaningful badges, a "Why <project>?" section with a comparison table, theme-aware SVG diagrams, and reference sections (usage, options, API, notes) verified against the source. Use when asked to write, rewrite, improve or "make beautiful" a README, when a README is just a heading, an install line and an API dump, when a rename, monorepo split or API overhaul left READMEs stale, when a package needs its first real README, or when asked for a project logo, diagrams or a "Why …?" section. Geared to npm packages and monorepos.
license: Apache-2.0
compatibility: Previews SVGs with headless Chrome or Chromium (perl for the settled renders of animated SVGs, xmllint for the well-formedness check). Type-checking samples needs the project's TypeScript toolchain.
metadata:
  author: tada5hi
  version: "2026.11.22"
allowed-tools: Bash(bash:*) Bash(npx:*) Bash(npm:*) Bash(node:*) Bash(git:*) Bash(curl:*) Read Write Edit Glob Grep
---

# readme-write

> Turn a README that lists what a library has into one that says why someone should use it, shows how it works in a picture, and stays correct because every claim was checked against the code.

The top of the page answers "what is this and why would I want it"; the rest is reference.

**Preserve capability explanations when improving an existing README.** Add the presentation around its useful reference material. Keep the explanations and examples for capabilities, configuration, safe operations, error handling, limits and testing; an export table or a shorter quick start does not replace them. Without a dedicated documentation site, keep the full user reference in the README. With one (e.g. VitePress), move detail only after verifying that the specific material is covered there; keep the capability explanation and link to that coverage. Correct obsolete claims against the code rather than dropping the capability.

Copy this checklist and track progress:

```
- [ ] Step 1: existing capability documentation inventoried; public surface and behaviour read from the code
- [ ] Step 2: "Why" table drafted from the reader's side
- [ ] Step 3: visual identity derived from the project, logo concepts chosen by the user, diagrams drawn, all previewed
- [ ] Step 4: sections written
- [ ] Step 5: samples type-check, claims match the code, capability coverage preserved, anchors resolve, lint passes
```

## Structure

Copy `templates/readme.md` and fill in its `{{placeholders}}`, in this order:

| Section | Content |
|---------|---------|
| Hero | Centered logo and `<h1>` (or one wordmark SVG when the logo repeats the name), then left-aligned: a badge row, the pitch (bold, under 120 characters, same sentence as the `package.json` description) plus one or two lines on what the reader stops writing, a nav row linking the main sections, a short sample (the smallest working program, about ten lines), then `---`. Keep the existing README's alignment and order when it has one |
| `## Why <project>?` | The problem in the reader's words and a **Concern / Without it / With it** table; the hero sample already shows the code |
| Diagram | One SVG that shows the mechanism (data flow, resolution order, retry loop), where the text needs it |
| `**Table of Contents**` | Only for a long README. Bold label, nested list, not a `##` heading (GitHub has an outline button; npm has none) |
| `## Installation` | Install command, module format, Node range, notable peer dependencies |
| `## Usage` / topic sections | One `##` per concept, sample first, rules after |
| `## Options` / `## Hooks` | Tables: name, type, default, description |
| `## API` | Public export index alongside the capability explanations and examples; with verified dedicated docs, link to the specific coverage |
| `## Notes` | Bold-led bullets for behaviour readers get wrong: delivery guarantees, what is lost, what is never retried |
| `## Contributing` / `## License` | Links to `CONTRIBUTING.md` and `LICENSE`; keep the project's existing sign-off |

When the project already has a brand, badge set or README conventions, keep them and add only the missing parts.

For a monorepo, the root README is a landing page: hero, Why, the diagram, a Packages table (name, version badge, one-line description), install, one quick start, development commands. Each package README must stand on its own on npm: pitch, install, a minimal sample, then the full reference for that package.

## Step 1: Inventory the README, verify against the code

Before replacing any section, record the existing README's capabilities, usage examples, options, error handling and non-obvious behaviour. This inventory is a coverage checklist, not evidence that the old claims are correct.

List the public surface from the barrel file (`src/index.ts`), then read every module it exports. Per class, note: constructor options and defaults, hooks and when they fire, what resolves, rejects, is acked, is dropped. Verify the existing explanations against this.

When a dependency's behaviour shapes a claim (which queue is declared, what is retried), read that dependency's source or docs too.

## Step 2: Find the "why"

Answer in the reader's terms:

1. What do they write today without this project? That is the "Without it" column.
2. What does the project take off their hands? One row per concern: lifecycle, retries, testing, observability, shutdown, typing.
3. What is the smallest working program? It closes the hero, above the `Why` heading: import from the package, the one call that matters, no feature tour.

Be concrete: "re-published after an exponential backoff, dropped after `maxAttempts`", not "robust retry handling". Compare capabilities, not adjectives, and describe the alternative fairly. Leave out numbers that go stale (benchmarks, bundle sizes, star counts) unless they link to a live source.

## Step 3: Draw the SVGs

Put them in `.github/assets/`. `templates/logo.svg` and `templates/diagram.svg` supply technique (structure, theme handling, animation, accessibility), not identity: never ship their colours or pictogram.

**Design from the project.** Before drawing, write down in a sentence or two:

1. **Existing brand cues.** A logo, docs-site theme colours, an emoji in the old title, badge colours, the organisation's other projects. Keep what exists; derive the rest from it.
2. **The project's own objects**, in its vocabulary: a queue and an exchange, a `SKILL.md` with frontmatter, a schema and a migration. The pictogram is drawn from these, never from a generic hub, node graph or gear.
3. **The one mechanism the "Why" section promises.** The diagram draws that claim (resolution order, retry loop, what loads on demand), not a generic "sources → core → consumers" row of boxes.
4. **What it must not look like.** Open the logos and diagrams of the author's sibling projects and choose a palette, form and silhouette that differ. Compare them at 32 px side by side: logos sharing an outline (e.g. the same rounded tile with a centred pictogram) read as one family even in different colours. Logos made in the same session for different projects must differ in form, not only in palette.

Unless the project already has a logo, draw two or three concepts, preview them, and show them to the user side by side (an HTML page or the preview PNGs) to choose from. Concepts differ in composition (form, pictogram, layout), not only in colour. Drop a concept that reads as something else at a glance (a branch line ending in a hexagon can look like a stethoscope).

**Logo** (256 × 256):

- Choose the form from the project, not the template: a translucent rounded tile with a two-stop gradient and thin gradient edge, a free-standing pictogram, a background that belongs to the motif (a nebula around a cluster, a page behind a document), or a badge or seal. It must read on GitHub's light (`#ffffff`) and dark (`#0d1117`) pages: mid-tone colours, translucent fills, or CSS variables redefined under `@media (prefers-color-scheme: dark)`.
- A pictogram of the mechanism, built from the project's own objects, not of the name.
- One or two SMIL animations (`animateMotion` along paths, `animate` on `opacity`, `animateTransform` to slide or fan elements in), with staggered negative `begin` offsets so motion is under way on load. Run one pass and settle (`repeatCount="1" fill="freeze"`): a README image cannot be paused, and motion over 5 seconds without a pause control fails WCAG 2.2.2. A perpetual loop is the owner's call, not a default.
- Write the settled state into the static attributes (e.g. `transform="rotate(16 128 204)"` beside the `animateTransform` that ends there), so renderers without SMIL show the finished picture, not the first frame.
- A `<title>`. Prefix every `id` per file (`ae-`, `sy-`): ids are global when several SVGs share a page.
- Sub-packages get a variant of the parent logo that swaps one element (the bus becomes the exchange).

**Diagrams** (960 wide):

- Colours as CSS variables in a `<style>` block, redefined under `@media (prefers-color-scheme: dark)`. GitHub shows `<img>` SVGs on a transparent background and the media query follows the reader's theme.
- npm's page is always light, while the SVG may pick the dark palette from the reader's OS. Put every piece of text on a panel, card or chip, never directly on the transparent background.
- One accent colour per role (caller, bus, worker; ok, retry, drop), from the logo's palette, consistent across every diagram of the project. Tint the neutrals towards that palette instead of reusing the template's greys.
- Real names from the project in the cards (skill names, option names, queue names), not `foo` and `bar`.
- A `<desc>` stating the whole flow in prose, repeated in the `alt` of the `<img>` (screen readers get only the `alt`). Keep the facts in the surrounding text too.
- SVG collapses leading whitespace in `<text>`: indent code lines with `x`, not spaces.
- No `<placeholder>`-style text or bare `&`: it breaks the XML and the image.

**Preview every SVG and look at the result** before referencing it. From the project root, run the script bundled in this skill's directory:

```bash
bash <skill-dir>/scripts/preview-svg.sh .github/assets/architecture.svg "${TMPDIR:-/tmp}/readme-preview"
```

When `xmllint` is installed, it first rejects SVGs that are not well-formed XML. It writes `light.png` and `dark.png` (GitHub's themes), `mismatch.png` (dark scheme on a light page, as npm on a dark OS) and `inverse.png`, forcing each colour scheme. Set `CHROME=/path/to/binary` if it cannot find a browser. Optional third and fourth arguments set width and height when the SVG has no `width`/`height` attributes.

Headless Chrome captures an animated SVG at its first frame. For an SVG with SMIL animations the script also writes `settled-light.png` and `settled-dark.png` with every animation element removed (needs perl): what a renderer without SMIL shows and, with the settled state in the static attributes, the picture after the animation ends. Judge the design on the settled renders, the motion on the first-frame ones.

Open every PNG the script wrote and check: overlapping labels, text running out of its box, arrows that miss their target, contrast in every combination. Fix and re-run until all read cleanly.

## Step 4: Write the sections

- Every sample imports from the package name, uses real option names, and fits without scrolling.
- Rules after the sample, as bullets or a table. Use a table for more than three entries of the same shape (options, hooks, routings, exports).
- Badges: three or four that measure something (version, CI, coverage), with alt text; no decorative or popularity badges. Same badge style across root and packages, with a version badge per package in the Packages table.
- Images in package READMEs: npm resolves relative paths against the repository's default branch, never the tarball, so a published version shows whatever the branch holds today. Pin them to a tag or commit, or serve them from the published package via jsDelivr. The root README can use relative paths. Details and cache times: `references/rendering.md`.

## Step 5: Verify

Run every check; fix and re-run until all pass.

1. **Type-check every sample.** Paste the samples into a uniquely named temporary file the `tsconfig` covers (e.g. `test/readme-samples.tmp.ts`), add `declare const` stubs for the reader's own objects (`logger`, `repository`), run `npx tsc --noEmit`, then delete the file, also when the check fails. In a JavaScript-only project, run the samples with `node` instead. For checks that keep running in CI, suggest `typescript-docs-verifier` or `embedme --verify` to the user.
2. **Check every behavioural claim** against the code from Step 1: defaults, what resolves or rejects, what is acked, what is retried, and that each sample shows what its table row promises. If the code contradicts what the README should promise, document what the code does and tell the user; never change the code silently.
3. **Check links and anchors**: every `#anchor` in the nav row and the ToC matches a heading (`## Why foo?` → `#why-foo`).
4. Run the project's lint, and update agent docs (`.agents/structure.md`) that list `.github/assets/`.
5. **Review the README diff for lost capability documentation.** Map every removed explanation and example to its retained or corrected location, or to verified dedicated documentation with a README explanation and direct link. A list of exported names is not coverage. Restore unexplained omissions before finishing.

## Writing rules

- Second person, present tense, plain sentences.
- Follow the repository's prose conventions (`AGENTS.md`, contributing guide), e.g. a ban on the em dash or British spelling.
- No marketing adjectives, no emoji in headings or as bullets beyond the project's existing style, no AI attribution.
- Descriptive link text, never "here".
- State what is lost, duplicated or never retried.

## Examples

- [`amqp-extension`](https://github.com/tada5hi/amqp-extension): hero, "Why amqp-extension?" with an amqplib comparison table and a side-by-side sample, animated logo, Options / API / Notes.
- [`hubwire`](https://github.com/tada5hi/synergos): monorepo landing page with a Packages table, a sub-package logo variant, and theme-aware architecture, resolution and retry diagrams.
