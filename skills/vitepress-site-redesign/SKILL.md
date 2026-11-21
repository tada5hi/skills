---
name: vitepress-site-redesign
description: Turn a default-looking VitePress site into a hero-led site with design tokens, a landing page composed of frontmatter-driven sections, and restyled nav and footer chrome. Use when a VitePress site "looks like default VitePress", when a docs site needs a real landing page, when introducing Tailwind v4 into an existing VitePress theme, or when a marketing page and the docs pages drifted apart visually.
license: Apache-2.0
compatibility: VitePress 1.x with the default theme. Tailwind v4 optional (the skill covers the Tailwind and the plain-CSS route). Phase 5 needs a browser automation tool (e.g. Claude in Chrome or a Playwright MCP); it is not pre-approved here.
metadata:
  author: tada5hi
  version: "2026.11.21"
allowed-tools: Bash(npm:*) Bash(npx vitepress:*) Bash(git:*) Bash(node:*) Bash(grep:*) Bash(diff:*) Bash(mkdir:*) Read Write Edit Glob Grep
---

# vitepress-site-redesign

> Replace the parts of the default theme that carry the "default" signal (markdown start page, flat nav, one-line footer) without leaving the theme, and keep the content editable by its maintainers.

## When to use

- The start page is a markdown document and should be a landing page.
- The site needs a visual identity (color, motif, rhythm) the default theme does not give it.
- A hand-made marketing page no longer matches the docs pages.
- Tailwind should be introduced into an existing VitePress theme.

Skip it for a pure API reference, and for a site whose content model is the real problem.

## Paths

`<root>` is the VitePress source root: the directory that holds `.vitepress/` (often `docs/`, `src/` or the repository root; find it with Glob `**/.vitepress/config.*`, excluding `node_modules`). All paths below are relative to `<root>`:

| Path | Content |
|------|---------|
| `.vitepress/config.{mjs,ts,mts}` | Site config |
| `.vitepress/theme/index.{mjs,ts,js}` | Theme entry: imports the entry CSS, registers `Layout` |
| `.vitepress/theme/style.css` | Entry CSS: tokens, shared classes, unlayered overrides |
| `.vitepress/theme/Layout.vue` | Wrapper around the default layout (footer) |
| `.vitepress/components/home/`, `.vitepress/components/layout/` | Landing sections, footer |
| `.vitepress/data/*.data.ts` | Data loaders |
| `index.md` | Landing page |
| `.vitepress/dist/` | Build output (unless `outDir` is set) |

When the project already uses other names or extensions, keep them and adapt the snippets. If `srcDir` is set in the config, markdown pages (`index.md`, loader globs) live under `<root>/<srcDir>`.

## Agree the direction first

Before any CSS, agree with the user: visual direction, brand color, typography, hero copy, the landing sections, and how far beyond the start page the work goes. Show two or three rendered options per question (mockups with the site's real logo, photos and texts), not descriptions. Write the decisions to a plan file in the repository before implementing.

## Target shape

| Layer | What it is | Where |
|-------|-----------|-------|
| Tokens | Color, surface and motif variables; brand variables bridged to your scale | `theme/style.css` |
| Shared classes | Section rhythm, content column, eyebrow, heading, card, link, dark surface | `theme/style.css` |
| Chrome | Transparent nav over the hero, site-wide footer | unlayered CSS + `theme/Layout.vue` |
| Landing page | `layout: page` + one root component composing sections | `index.md`, `components/home/` |
| Content data | Frontmatter → data loaders → sections | `data/*.data.ts` |

One component per landing section; the root only composes them.

## Phase 1 — foundation

**Adding Tailwind:** `npm install -D tailwindcss @tailwindcss/vite`, register the plugin in the config under `vite.plugins`, import the entry CSS from the theme entry, and isolate VitePress's unlayered base and doc styles:

```js
// .vitepress/config.mjs
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, postcssIsolateStyles } from 'vitepress';

export default defineConfig({
    vite: {
        plugins: [tailwindcss()],
        css: {
            postcss: {
                // VitePress base + doc styles are unlayered and beat every Tailwind
                // utility. Exclude them inside `.vp-raw` subtrees.
                plugins: [postcssIsolateStyles({ includeFiles: [/base\.css/, /vp-doc\.css/] })],
            },
        },
    },
});
```

Every component root rendered into page content carries `vp-raw`; without it utilities silently do nothing.

**Tokens and shared classes:** copy [templates/design-tokens.css](templates/design-tokens.css) to `.vitepress/theme/style.css` (or merge it into the existing entry CSS) and fill in the placeholders. It holds the brand-variable bridge, the fixed-dark surface tokens (hero and footer stay dark in both modes) and the shared layout classes. Set its `@source` path relative to the CSS file.

**Without Tailwind:** keep the `:root` variables and shared classes; delete `@import "tailwindcss"`, `@custom-variant`, `@source` and `@theme`; flatten the `@layer` blocks; write each `@apply` out longhand (`sm:`/`md:`/`lg:` as `min-width` media queries, `hover:` as `:hover`).

## Phase 2 — chrome

**Transparent nav over the hero.** Mark the landing page with `pageClass` and override in the **unlayered** part of the entry CSS (VitePress component CSS is unlayered; an override inside a layer loses):

```md
---
layout: page
pageClass: k-home
---
```

`VPNavBar` carries `.top` while `scrollY === 0`. The complete rule set is in [references/chrome-overrides.md](references/chrome-overrides.md): variables re-scoped to the bar's own items (not the bar, or flyout menus become unreadable), the `.VPFlyout:hover` literal-colour leak, the two 960px rules that slide the hero under the fixed nav, and the logo-variant swap.

**Site-wide footer.** `themeConfig.footer` renders one line and hides on pages with a sidebar. Replace it through the `layout-bottom` slot:

```vue
<!-- .vitepress/theme/Layout.vue -->
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

Register it as `Layout` in the theme entry and delete `themeConfig.footer`. Give the footer `position: relative`, a full-width background, and a `z-index` above the desktop sidebar but below the mobile drawer; do not pad it to clear the sidebar. Read the thresholds from the installed VitePress (`--vp-z-index-sidebar`, typically 60, 25 from 960px up); `--vp-z-index-footer` (10) is not enough.

With Tailwind, `theme/` is usually outside the `@source` globs: keep utility classes out of `Layout.vue`.

## Phase 3 — landing page

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

- Copy lives in frontmatter, not in components, so maintainers edit it without touching Vue.
- Do **not** use `layout: home` and its hero config: that is the look being replaced.
- Each section reads the frontmatter (`useData()`) or a data loader; the root stays thin:

```vue
<template>
    <div class="vp-raw">
        <KHomeHero />
        <KHomeGroups />
        <KHomeResearch />
    </div>
</template>
```

- Mark decorative glyphs in link text (`→`, `↗`) `aria-hidden`.
- Grep before deleting an asset the redesign made obsolete.
- **Motif:** derive the hero's signature element from something the project owns (logo shape, data, domain), CSS-only where possible. Keep it `aria-hidden`, animate it only if the motion means something, and disable animation under `prefers-reduced-motion`.

## Phase 4 — content data

Sections that list projects, packages, posts or people read their data from page frontmatter through `createContentLoader`:

```ts
// .vitepress/data/projects.data.ts
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

- Keep the mapping (`buildProject`) in a plain, unit-tested module; its validator names the page and the offending key.
- Where a page rendered that metadata as prose, render it from frontmatter through a small component so the data exists once.
- Prove the migration changed nothing visible: diff the text extracted from the built HTML before and after.
- **Time-dependent lists** ("current" projects, upcoming events) never call `new Date()` in `setup()`: it runs at build and again at hydration, and the answers differ. Stamp the time in the loader and filter against it; a finished item stays listed until the next build.

```ts
transform: (raw) => ({
    generatedAt: new Date().toISOString(),
    items: raw.map(...),
}),
```

## Phase 5 — verification

Build, typecheck and lint are not enough; the defects here are visual. Run the checks in [references/verification.md](references/verification.md) in a browser against the dev server or the built site:

- Both color modes, every page touched (`document.querySelector('.VPSwitchAppearance').click()` toggles).
- The nav at `scrollY === 0` (transparent, light text, light logo) and scrolled (opaque, normal text); flyout menus with a real pointer hover.
- Narrow widths through same-origin iframes (window resizing often does not change the viewport); no horizontal overflow.
- A page with a sidebar: footer reaches `x = 0` at ≥1440px.
- Anchors: grep the built HTML for every `id` a card links to.

## Gotchas

| Symptom | Cause |
|---------|-------|
| Tailwind utility does nothing | Component root lacks `vp-raw`, or the file is outside the `@source` globs (`theme/` and markdown usually are) |
| **No** utilities generated | `@source` path matches nothing and fails silently; it is relative to the CSS file (`../components` vs `./components`). Grep the built CSS for a utility only a component uses |
| Override of VitePress styles loses | It sits inside a `@layer`; VitePress CSS is unlayered, so overrides go unlayered at the end of the entry CSS |
| Layout breaks in odd places | Tailwind's `container` utility also matches VitePress's `.container`; never use it |
| `min-[960px]:` behaves inconsistently | Arbitrary min-width variants can be emitted before `md:`; use standard breakpoints, a named one, or plain CSS |
| Radii look wrong | A design-system plugin redefined the radius scale; use arbitrary values where exact radius matters |
| A link 404s or a selector matches nothing | `VPLink` rewrites internal links to `.html` when `cleanUrls` is off |
| `node:fs` in the browser bundle | A client component imported from a barrel that re-exports server-only code; import the concrete file |
| `\uXXXX` escapes or typographic characters mangled | Editors flatten them and diffs hide it; check codepoints, not appearance |
| `no-undef` on `window` in `.vue` | The ESLint config seeds only Node globals; add browser globals for `**/*.vue` |
| Missing static asset (`/hero.png`) | Nothing fails; confirm the file exists in `public/` |
| Rendered `class` contains a newline | A static `class="..."` was wrapped across lines for `max-len`; hoist it to a constant bound with `:class`, and write plan snippets that way too |
| Destructured array element is `T \| undefined` | `noUncheckedIndexedAccess`; guard, or type the fixture as a tuple |
| Two components disagree on one rule | A shared selector was reimplemented inline; import it from the module that already exports it |

## Definition of done

- Start page is hero-led, its copy lives in frontmatter, its sections are separate components.
- Nav and footer are part of the design on every page.
- Light and dark verified at phone and desktop width on every page touched.
- Rendered metadata exists once, validated, proven unchanged where migrated.
- Design decisions are written down in the repository.

The skill does not commit, push or deploy. It leaves the changes and the plan file in the working tree for the user to review and commit.
