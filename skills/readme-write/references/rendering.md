# How GitHub and npm render a README

Checked in October 2026 against live pages, `gh api markdown` and response headers. Behaviour of hosted services changes; re-check a claim before building on it.

## GitHub

| Topic | Behaviour |
|---|---|
| Kept HTML | `align` on `p`, `h1`, `div`; `width`/`height` on `img`; `<picture>`/`<source>`; `<details>`/`<summary>` |
| Stripped HTML | `style`, `class`, inline `<svg>` (use `<img src="….svg">`). `id` becomes `user-content-<id>` |
| Anchors | Lowercase, spaces become `-`, other punctuation dropped, duplicates get `-1`, `-2`: `## Why foo?` → `#why-foo` |
| Outline | Any Markdown file with two or more headings gets an automatic outline (the "Outline" button) |
| Images | Third-party URLs go through the camo proxy, byte for byte; SMIL and inline `<style>` survive. Relative paths resolve against the branch being viewed |
| Themes | An `<img>` SVG with `@media (prefers-color-scheme: dark)` follows the `color-scheme` of the page embedding it, which github.com sets from the reader's theme (verified in Chrome). `<picture>` with `<source media="(prefers-color-scheme: dark)">` is the documented alternative. `#gh-dark-mode-only` fragments are deprecated |
| Size | Content past 500 KiB is truncated |

Sources: [About READMEs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes), [basic formatting syntax](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax), [anonymized URLs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-anonymized-urls), [CSSWG #7213](https://github.com/w3c/csswg-drafts/issues/7213).

## npm

npmjs.com renders with GitHub's pipeline, so the HTML rules above apply. Differences:

| Topic | Behaviour |
|---|---|
| Updates | The README on npmjs.com changes only when a new version is published |
| Relative image paths | Rewritten to `https://raw.githubusercontent.com/<owner>/<repo>/HEAD/<path>`, using `repository` (and `repository.directory` in a monorepo) from `package.json` |
| Tarball | Never used for images |
| `<picture>` | npm wraps the fallback `<img>` in a link, which makes browsers ignore the `<source>` elements: the fallback always shows. Relative `srcset` is not rewritten either |
| Theme | The page is always light. An `<img>` SVG with a dark media query is likely to follow the reader's OS there, so a dark-OS reader sees the dark palette on a white page |

## Images that stay correct per version

Relative paths and branch URLs both point at the default branch. A published version then shows today's images, or a 404 once a file is renamed or deleted. Pin package README images to something immutable:

- a tag or commit: `https://raw.githubusercontent.com/<owner>/<repo>/v1.2.0/.github/assets/<file>.svg`
- the published tarball via a CDN: `https://cdn.jsdelivr.net/npm/<package>@<version>/<file>.svg` (the file must be in `files`)

The root README of the repository can keep relative paths: GitHub resolves them against the branch being viewed.

| Host | Caching |
|---|---|
| `raw.githubusercontent.com` | `max-age=300`, `image/svg+xml`. 404s are cached for about 5 minutes too: right after a push, check the commit-pinned URL rather than changing the links |
| `cdn.jsdelivr.net/gh/…@<branch>` | 12 hours |
| `cdn.jsdelivr.net/npm/<pkg>@<exact version>` | Effectively permanent |
| Badges (`img.shields.io`) | `max-age=300`, re-cached by camo |

## Accessibility of SVG images

- An SVG in an `<img>` is announced by its `alt` only. The SVG's `<title>`, `<desc>`, `role` and `aria-*` are not exposed. Write the full description into `alt` and keep facts in the surrounding text too.
- WCAG 2.2.2 (level A): motion that starts by itself and lasts more than 5 seconds needs a pause control. A README image has none, and `prefers-reduced-motion` does not stop SMIL. Let animations run one pass and settle (`repeatCount="1" fill="freeze"`).

Sources: [WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html), [img with SVG source](https://scottohara.me/blog/2021/09/03/img-svg-source.html).
