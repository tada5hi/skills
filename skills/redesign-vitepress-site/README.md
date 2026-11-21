# redesign-vitepress-site

> **Turn a default-looking VitePress site into a hero-led site with tokens, landing sections and restyled chrome.**
> Stop fighting the default theme's start page, flat nav and one-line footer without a plan for what replaces them.

[All skills](../../README.md#skills) · [`SKILL.md`](./SKILL.md)

## Why redesign-vitepress-site?

A VitePress site looks like documentation because the default theme is a documentation theme. Replacing that look by hand means learning where VitePress's unlayered CSS beats your overrides, why Tailwind utilities silently do nothing inside page content, and why a transparent nav makes flyout menus unreadable. The skill keeps the default theme and replaces only the parts that carry the "default" signal.

| Concern | Without it | With redesign-vitepress-site |
|---|---|---|
| **Direction** | Start writing CSS and argue about it afterwards | Agrees direction, brand colour, typography, hero copy and sections with you first, using rendered options, and writes the decisions to a plan file |
| **Tokens** | Colours scattered across components | Fills in `templates/design-tokens.css`: brand variables bridged to your scale, fixed-dark surfaces, shared layout classes |
| **Landing page** | A Markdown start page or one large component | `layout: page` with copy in frontmatter and one component per section |
| **Chrome** | Default nav bar and one-line footer | A transparent nav over the hero and a site-wide footer mounted through the `layout-bottom` slot |
| **Verification** | Build passes, visual defects ship | Checks both colour modes, both nav states, narrow widths in iframes, hydration and anchors |

## Installation

```bash
# this skill only, any Agent Skills agent
npx skills add tada5hi/skills --skill='redesign-vitepress-site'

# Claude Code: the plugin bundles every skill
/plugin marketplace add tada5hi/skills
/plugin install skills@tada5hi
```

## Triggering

**Ask for it.** The agent loads the skill when your request matches its description, for example:

- "this site looks like default VitePress"
- "give the docs site a real landing page"
- "add Tailwind v4 to our VitePress theme"
- "the marketing page and the docs pages no longer match"

**Invoke it directly.** Type `/redesign-vitepress-site` (installed with the skills CLI) or `/skills:redesign-vitepress-site` (Claude Code plugin).

## What it does

1. Agrees the visual direction, brand colour, typography, hero copy and landing sections with you, and writes the decisions to a plan file in the repository.
2. Lays the foundation: optionally installs Tailwind v4 with `postcssIsolateStyles`, then sets up design tokens and shared classes in `theme/style.css`, or the plain-CSS equivalent.
3. Restyles the chrome: a transparent nav while the landing page is at the top, and a footer component that replaces `themeConfig.footer`.
4. Builds the landing page from frontmatter copy and one component per section, with a motif derived from something the project already owns.
5. Moves listed metadata (projects, posts, people) into frontmatter read by data loaders, and proves the rendered text did not change.
6. Verifies the result in a browser with the checks in `references/verification.md`.

## Requirements

- A VitePress 1.x site on the default theme.
- npm and Node.js to install packages and build the site.
- Tailwind v4 is optional; the skill covers the Tailwind and the plain-CSS route.
- Browser automation for the verification phase.

## Output

Changes to your VitePress site, typically:

- `theme/style.css` with tokens, shared classes and unlayered chrome overrides
- `theme/Layout.vue` wrapping the default layout with your footer
- `index.md` with `layout: page`, a `pageClass` and the hero copy in frontmatter
- `components/home/` with one component per landing section
- `data/*.data.ts` loaders for listed content
- a plan file with the agreed design decisions

## Notes

- **It asks before it styles.** Direction, colour, typography and sections are agreed with you before any CSS is written.
- **It does not use the built-in home hero.** `layout: home` is the look being replaced.
- **Not every site needs it.** The skill says to skip a pure API reference and a site whose real problem is its content model.
- **Copy stays editable.** Headlines and section text live in frontmatter, so maintainers change them without touching Vue.
- **Time-dependent lists are stamped at build.** "Current" items are filtered in the data loader, not in `setup()`, to avoid hydration mismatches.

## License

Apache-2.0, see [LICENSE](../../LICENSE).
