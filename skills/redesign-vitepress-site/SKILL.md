---
name: redesign-vitepress-site
description: Turn a default-looking VitePress site into a hero-led site with design tokens, a landing page composed of frontmatter-driven sections, and restyled nav and footer chrome. Use when a VitePress site "looks like default VitePress", when a docs site needs a real landing page, when introducing Tailwind v4 into an existing VitePress theme, or when a marketing page and the docs pages drifted apart visually.
license: Apache-2.0
compatibility: VitePress 1.x with the default theme. Tailwind v4 optional — the skill covers both the Tailwind and the plain-CSS-variable route. Browser automation is needed for the verification phase.
metadata:
  author: tada5hi
  version: "2026.09.21"
allowed-tools: Bash(npm:*) Bash(git:*) Bash(node:*) Bash(grep:*) Read Write Edit Glob Grep
---

# redesign-vitepress-site

> A VitePress site looks like documentation because the default theme is a documentation theme. This skill replaces the parts that carry the "default" signal — the markdown start page, the flat nav, the one-line footer — without leaving the theme, and without taking editing away from the people who maintain the content.

## When to use

- The start page is a markdown document and should be a landing page.
- The site needs a visual identity (color, motif, rhythm) that the default theme does not give it.
- A docs site grew a hand-made marketing page whose style no longer matches the rest.
- Tailwind should be introduced into an existing VitePress theme.

Skip it for a pure API reference where the default theme is the right answer, and for a site whose content model is the real problem — fix the content first.

## Do not start with CSS

Agree the direction with the person first: visual direction, brand color, typography, hero copy, which sections the landing page gets, and how far beyond the start page the work goes. Show two or three rendered options per question rather than describing them; a mockup that uses the site's real logo, photos and texts settles in one round what prose argues about for three.

Write the decisions down (a plan file in the repo) before implementing. Everything below assumes those answers exist.

## The shape you are building

| Layer | What it is | Where it lives |
|-------|-----------|----------------|
| Tokens | Color, surface and motif variables; brand variables bridged to your scale | `theme/style.css` |
| Shared classes | Section rhythm, content column, eyebrow, heading, card, link, dark surface | `theme/style.css` |
| Chrome | Transparent nav over the hero, site-wide footer | unlayered CSS + `theme/Layout.vue` |
| Landing page | `layout: page` + one root component composing sections | `index.md`, `components/home/` |
| Content data | Frontmatter → data loaders → sections | `data/*.data.ts`, `domains/` |

Keep each landing section a separate component with one responsibility, and make the root a thin composition. Sections get added, reordered and removed; a single 800-line page component makes every one of those a merge conflict.

## Phase 1 — foundation

**If the site has no Tailwind and you are adding it:** install `tailwindcss` and `@tailwindcss/vite`, register the plugin in `config.mjs` under `vite.plugins`, and import your entry CSS from `theme/index.mjs`. Then add the isolation that makes Tailwind usable inside VitePress at all:

```js
// config.mjs
import { defineConfig, postcssIsolateStyles } from 'vitepress';

export default defineConfig({
    vite: {
        plugins: [tailwindcss()],
        css: {
            postcss: {
                // VitePress base + doc styles are unlayered and would beat every
                // Tailwind utility. Exclude them inside `.vp-raw` subtrees.
                plugins: [postcssIsolateStyles({ includeFiles: [/base\.css/, /vp-doc\.css/] })],
            },
        },
    },
});
```

Every component root you render into page content then carries `vp-raw`. Without it, `h-40` on an image or `text-2xl` on a heading silently does nothing.

**Tokens and shared classes:** copy `templates/design-tokens.css` from this skill directory and fill in the palette. It contains the three things that are easy to get wrong: the bridge from VitePress's brand variables to your own scale, the fixed-dark surface tokens (a hero and footer that stay dark in both color modes), and the shared layout classes the sections use.

**Without Tailwind:** the same file works as plain CSS — keep the `:root` variables and the shared classes, drop the `@layer`/`@apply` wrappers, and write the section styles as ordinary rules.

## Phase 2 — chrome

Two changes carry most of the "this is not a docs site" effect.

**The nav sits transparently on the hero while the page is at the top.** Mark the landing page with `pageClass` in its frontmatter, then override in the **unlayered** part of your CSS (VitePress's own component CSS is unlayered — an override inside a layer loses):

```md
---
layout: page
pageClass: k-home
---
```

`VPNavBar` carries `.top` while `scrollY === 0`, which is the hook. `references/chrome-overrides.md` in this skill directory has the complete rule set: which variables to re-scope, why they are scoped to the bar's own items rather than the bar (flyout menus inherit and become unreadable otherwise), the two 960px rules that let the hero slide under the fixed nav, and the logo-variant swap.

**The footer becomes a real footer.** VitePress's `themeConfig.footer` renders one line and hides itself on pages with a sidebar. Replace it with your own component mounted through the `layout-bottom` slot of a thin wrapper:

```vue
<!-- theme/Layout.vue -->
<script lang="ts">
import DefaultTheme from 'vitepress/theme';
import { defineComponent } from 'vue';
import KFooter from '../components/layout/KFooter.vue';

export default defineComponent({
    components: { DefaultLayout: DefaultTheme.Layout, KFooter },
});
</script>
<template>
    <DefaultLayout>
        <template #layout-bottom>
            <KFooter />
        </template>
    </DefaultLayout>
</template>
```

Register it as `Layout` in `theme/index.mjs` and delete `themeConfig.footer`. On pages with a sidebar the sidebar is `position: fixed`, so give the footer `position: relative; z-index: var(--vp-z-index-footer)` and let its background run the full width — a footer padded to dodge the sidebar stops short of the left edge and reads as a broken layout.

Note for a Tailwind setup: the wrapper lives in `theme/`, which your `@source` globs usually do not scan. Keep utility classes out of it and inside the footer component.

## Phase 3 — the landing page

```md
---
layout: page
pageClass: k-home
hero:
  eyebrow: ...
  title: ...
  highlight: ...        # rendered with the accent gradient
  description: ...
  actions:
    - { text: ..., link: /research }
---

<script setup>
import KHome from './.vitepress/components/home/KHome.vue';
</script>

<KHome />
```

Put the copy in frontmatter, not in the components. The people who maintain the site can then change the headline without touching Vue, which is usually the difference between a redesign that survives and one that rots.

Do **not** use VitePress's built-in `layout: home` hero config: that is exactly the look being replaced.

Each section is its own component reading either the page frontmatter (`useData()`) or a data loader. Keep the root thin:

```vue
<template>
    <div class="vp-raw">
        <KHomeHero />
        <KHomeGroups />
        <KHomeResearch />
        <KHomePublications />
    </div>
</template>
```

Two details that are cheap now and annoying later: mark decorative glyphs in link text (`→`, `↗`) as
`aria-hidden` so they stay out of the accessible name, and grep before deleting an asset the redesign made
obsolete rather than trusting your memory of where it was used.

**A motif beats a stock illustration.** Derive one element from something the project already owns — the shape in its logo, its data, its domain — and use it as the hero's signature. A CSS-only motif (bars, grid, glow, gradient text) costs nothing at runtime and never looks like a template. Animate it only if it means something, keep it `aria-hidden`, and disable it under `prefers-reduced-motion`.

## Phase 4 — content data model

Sections that list projects, packages, posts or people need their data as data, not as prose. Move the metadata into page frontmatter and read it with `createContentLoader`:

```ts
// data/projects.data.ts
import { createContentLoader } from 'vitepress';

declare const data: Project[];
export { data };

export default createContentLoader('projects/*.md', {
    transform: (raw) => raw
        .filter((page) => !page.url.endsWith('/'))     // skip the section index
        .map((page) => buildProject(page.url, page.frontmatter))
        .sort(compareByStart),
});
```

Keep the mapping (`buildProject`) in a plain module with unit tests, not inside the loader: frontmatter is user input, and a validator that names the page and the offending key turns a broken build into a one-line fix. Where a page previously rendered that metadata as prose, render it from the frontmatter instead through a small component so the data exists once.

Prove the migration changed nothing visible: extract the rendered text from the built HTML before and after, and diff it.

**Anything time-dependent belongs to the build, not to `setup()`.** A section that shows "current" items
(running projects, upcoming events, recent posts) must not call `new Date()` in a component: `setup()` runs at
build time to produce the HTML *and* again when a visitor hydrates it, possibly weeks later, and the two answers
differ the moment an item crosses a boundary — a hydration mismatch and a visible flash. Stamp the reference
time in the loader and filter against it:

```ts
transform: (raw) => ({
    generatedAt: new Date().toISOString(),
    items: raw.map(...),
}),
```

The trade is that a finished item stays listed until the next build. On a statically built site that is the same
staleness as every other word on the page, and it buys deterministic rendering.

## Phase 5 — verification

Build, typecheck and lint are necessary and not sufficient — every defect this phase catches is a visual one.
`references/verification.md` in this skill directory has the copy-paste checks: iframe widths, codepoint
inspection, rendered-class-attribute scan, hydration console check, before/after diff for content migrations,
and the chrome assertions.

- **Both color modes, every page you touched.** `document.querySelector('.VPSwitchAppearance').click()` toggles.
- **The nav in both states:** at `scrollY === 0` (transparent, light text, light logo) and after scrolling (opaque, normal text).
- **Narrow viewports.** Resizing the browser window often does not change the viewport in automation; render the page into same-origin iframes of fixed width instead and assert no horizontal overflow:
  ```js
  const f = document.createElement('iframe'); f.width = '390'; f.height = '900'; f.src = path;
  document.body.append(f); await new Promise((r) => { f.onload = r; });
  f.contentDocument.documentElement.scrollWidth > f.contentWindow.innerWidth; // must be false
  ```
- **Pages with a sidebar:** footer padding matches `VPContent`'s at ≥1440px.
- **Anchors:** if cards link to headings, grep the built HTML for each generated `id`.

## Gotchas

| Symptom | Cause |
|---------|-------|
| Tailwind utility does nothing | Component root lacks `vp-raw`, or the file is outside the `@source` globs (`components/` is scanned; `theme/` and markdown usually are not) |
| **No** utilities at all are generated | An `@source` path that matches nothing fails silently — and it is relative to the CSS file, so `../components` and `./components` are both right depending on whether components sit beside or inside the theme directory. After wiring it up, grep the built CSS for a class you used |
| An override of VitePress's own styles loses | VitePress ships base, doc and component CSS **unlayered**; anything overriding it must also be unlayered, at the end of the entry CSS |
| Layout breaks in odd places | The Tailwind `container` utility also matches VitePress's own `.container` elements — never use it |
| `min-[960px]:` behaves inconsistently | Arbitrary min-width variants can be emitted before `md:`, so `md:` wins; use the standard breakpoints, define a named one, or put VitePress-breakpoint rules in plain CSS |
| Radii look wrong | A design-system plugin may redefine Tailwind's radius scale (`rounded-xl` = 12px, not 0.75rem); use arbitrary values when the exact radius matters |
| Flyout/dropdown text unreadable on the transparent nav | Variables were re-scoped on the whole nav bar; scope them to the bar's own items instead |
| Footer band stops short of the left edge on docs pages | It was padded to clear the fixed sidebar; give it `z-index: var(--vp-z-index-footer)` and let it run full width instead |
| A link 404s or a selector matches nothing | `VPLink` normalizes internal links to `.html` when `cleanUrls` is off: `/projects` renders as `/projects.html` |
| `node:fs` ends up in the browser bundle | A client component imported a runtime value from a domain barrel that also re-exports server-only code; import from the concrete file |
| Non-ASCII or `\uXXXX` escapes mangled in a regex or string | Editors silently flatten escape text into characters, and a diff cannot show the difference — verify codepoints (`[...line].filter((c) => c.codePointAt(0) > 127)`), never appearance |
| `no-undef` on `window` in a `.vue` file | Many shared ESLint configs seed only Node globals; add the browser globals scoped to `**/*.vue` |
| A rendered `class` attribute contains a newline and indentation | A long static `class="..."` was wrapped across two source lines to satisfy `max-len`. Hoist it to a module-level constant bound with `:class` instead — and write the snippets in your own plan that way, or every task that copies them reproduces it |
| A "current items" list flashes or warns about hydration | Time-dependent filtering ran in `setup()`; stamp the reference time in the loader (see Phase 4) |
| Destructured array element is `T | undefined` | Strict configs set `noUncheckedIndexedAccess`; guard, or type the fixture as a tuple. Tuples like `[string, Person]` are unaffected |
| Two components drift apart on the same rule | A shared selector (e.g. "active members of a team") was reimplemented inline instead of imported from the domain module that already exports it |

## Definition of done

- Start page is hero-led, its copy lives in frontmatter, and its sections are separate components.
- Nav and footer are part of the design on every page, not just the landing page.
- Light and dark both verified, at phone width and desktop, on every page touched.
- Metadata that sections render exists once, validated, with the rendered output proven unchanged where it was migrated.
- The design decisions are written down in the repo, so the next change argues from them.
