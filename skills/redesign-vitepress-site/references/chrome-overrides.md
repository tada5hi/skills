# Chrome overrides (VitePress default theme)

Exact rules for the two chrome changes in `redesign-vitepress-site`. Everything here goes in the
**unlayered** part of your entry CSS, after every `@layer` block: VitePress's own component styles are
unlayered, so a rule inside a layer loses no matter how specific it is.

Replace `k-home` with whatever `pageClass` the landing page sets, and `--k-dark-*` with your tokens.

## Hooks the default theme gives you

| Hook | Meaning |
|------|---------|
| `.Layout.<pageClass>` | `frontmatter.pageClass` lands on the layout root — your page-scoping selector |
| `.VPNavBar.top` | present while `scrollY === 0`; the whole transparent-nav effect keys off it |
| `.VPNavBar.screen-open` | mobile menu is open — exclude it, or the open menu inherits hero colors |
| `.VPNavBar.home` | only set for `layout: home`; a custom landing page does **not** get it |
| `--vp-nav-bg-color`, `--vp-c-gutter` | the bar's background and its divider line |
| `.VPContent` `padding-top: var(--vp-nav-height)` (≥960px) | why the hero starts below the nav by default |
| `layout-bottom` slot | where a site-wide footer mounts |
| `useSidebar()` from `vitepress/theme` | whether the current page has a sidebar |

## Transparent nav over the hero

```css
/* The hero extends under the fixed nav. 960px is VitePress's own breakpoint for
 * making the nav fixed — do not approximate it with a Tailwind variant. */
@media (min-width: 960px) {
    .Layout.k-home .VPContent {
        padding-top: 0;
    }

    .Layout.k-home .k-hero {
        padding-top: calc(var(--vp-nav-height) + 5rem);
    }
}

/* Below 960px the nav is not fixed: it sits above the hero and needs the same
 * background, or a light strip floats over a dark page. */
@media (max-width: 959px) {
    .Layout.k-home .VPNav {
        background-color: var(--k-dark-bg);
    }
}

.Layout.k-home .VPNavBar.top:not(.screen-open) {
    --vp-nav-bg-color: transparent;
    --vp-c-gutter: transparent;
}

/* Re-scope the text variables on the bar's OWN items only. Setting them on
 * `.VPNavBar` looks identical at the top of the page and then paints the
 * flyout dropdown's text light-on-white when someone opens it. */
.Layout.k-home .VPNavBar.top:not(.screen-open) :is(
    .VPNavBarTitle,
    .VPNavBarMenu,
    .VPNavBarSearch,
    .VPNavBarAppearance,
    .VPNavBarSocialLinks,
    .VPNavBarHamburger
),
.Layout.k-home .VPNavBar.top:not(.screen-open) .VPNavBarExtra > .button {
    --vp-c-text-1: var(--k-dark-fg);
    --vp-c-text-2: var(--k-dark-fg-muted);
    --vp-c-brand-1: var(--k-accent-1);
    --vp-c-divider: var(--k-dark-border);
    --vp-c-bg-alt: rgb(255 255 255 / 0.06);
    --vp-input-border-color: var(--k-dark-border);
    --vp-input-switch-bg-color: rgb(255 255 255 / 0.08);
}

/* `themeConfig.logo` as `{ light, dark }` renders both images and hides one by
 * color mode; on the dark hero the dark-mode variant must win in light mode too. */
.Layout.k-home .VPNavBar.top:not(.screen-open) .VPNavBarTitle .VPImage.light {
    display: none;
}

html:not(.dark) .Layout.k-home .VPNavBar.top:not(.screen-open) .VPNavBarTitle .VPImage.dark {
    display: inline;
}
```

Expected behavior, and what to assert in the browser:

| State | `.VPNavBar` background | Nav link color |
|-------|------------------------|----------------|
| Landing page, `scrollY === 0` | `rgba(0, 0, 0, 0)` | your dark-surface foreground |
| Landing page, scrolled | opaque `--vp-nav-bg-color` | normal theme text |
| Any other page | opaque | normal theme text |
| Mobile menu open | opaque | normal theme text |

The current-page link stays `--vp-c-brand-1` (VitePress's active-link styling). That is correct — just
check it is legible against the hero.

## Site-wide footer

`themeConfig.footer` renders one line and sets `display: none` on pages with a sidebar. Replace it:

1. Delete `themeConfig.footer` from `config.mjs`.
2. Wrap the default layout and mount your footer in `layout-bottom` (see SKILL.md).
3. The sidebar is `position: fixed`, so decide how the footer relates to it. **Let the footer span the
   full width and paint above the sidebar**, rather than padding it out of the way:

```css
.k-footer {
    position: relative;
    /* Above the desktop sidebar, below the mobile drawer. Check the real values
     * in the installed VitePress: `--vp-z-index-sidebar` is 60 by default and 25
     * from 960px up, and `--vp-z-index-footer` (10) is NOT enough. */
    z-index: 26;
}
```

That is all it takes. The footer's inner content still sits in the normal centered column, so text stays
aligned with the page while the background reaches both edges, and the open mobile drawer still covers it.

> Read the sidebar's z-index out of the installed package rather than trusting a number in any document —
> including this one. `VPSidebar.vue` also contains a `z-index: 1` inside a `min-width: 960px` block that
> belongs to `.curtain`, an inner element, and it is easy to attribute to the sidebar itself.

> Padding the footer to clear the sidebar (mirroring `VPContent.has-sidebar`) looks correct in isolation and
> wrong on the page: the dark band stops short of the left edge and reads as a broken layout. It also needs two
> media queries and a `useSidebar()` class binding to do something a z-index does for free. Don't.

Assert afterwards that `.VPFooter` no longer exists anywhere, that your footer renders on a docs page
with a sidebar, and that on such a page its background reaches `x = 0` at a viewport ≥1440px.

## Why not `layout: home`

`layout: home` gives the transparent nav for free, but it also renders `VPHomeHero` and `VPHomeFeatures`
from frontmatter — the exact default look being replaced — and wraps markdown content in `.vp-doc`.
`layout: page` plus `pageClass` costs the CSS above and leaves the page yours.
