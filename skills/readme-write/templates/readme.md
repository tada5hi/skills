<!--
Template: replace every {{placeholder}} and drop sections that do not apply.
For an existing README, preserve its capability explanations and examples while adding the presentation. Do not replace useful reference sections with this shorter scaffold.
Package READMEs on npm: image paths resolve against the default branch, so pin them (see references/rendering.md).
-->
<!--
Only the logo block is centered. The pitch, badges and nav row stay left-aligned unless the
project's existing README centers them; keep its alignment.
When the logo pictogram repeats the name (a letter mark above an <h1> of the same name), use a
wordmark SVG with alt="{{project}}" in place of logo + <h1>.
-->
<div align="center">

<img src="./.github/assets/logo.svg" alt="{{project}}" width="128" height="128" />

<h1>{{project}}</h1>

</div>

<!-- Three or four badges that measure something: version, CI, coverage. No decorative badges. -->
[![npm version](https://img.shields.io/npm/v/{{package}})](https://www.npmjs.com/package/{{package}})
[![CI](https://github.com/{{owner}}/{{repo}}/actions/workflows/{{ci-workflow}}.yml/badge.svg)](https://github.com/{{owner}}/{{repo}}/actions/workflows/{{ci-workflow}}.yml)
[![Coverage](https://codecov.io/gh/{{owner}}/{{repo}}/branch/{{default-branch}}/graph/badge.svg)](https://codecov.io/gh/{{owner}}/{{repo}})

<!-- Under 120 characters, the same sentence as the package.json description and the GitHub "About" text. -->
**{{One sentence: what it does, in the reader's terms.}}**

{{One or two lines: what the reader no longer has to write, and the one thing that makes it different.}}

[Installation](#installation) · [Usage](#usage) · [Options](#options) · [API](#api) · [Notes](#notes)

<!-- Optional: only when one short program (about ten lines) expresses the library. Drop it for a service, platform or monorepo landing page. -->
```typescript
{{sample}}
```

---

## Why {{project}}?

{{The problem: what every project ends up writing by hand, and where that goes wrong.}}

{{project}} is that layer, written once:

<!-- Compare capabilities, not adjectives. Describe the alternative fairly; it is often the right choice for someone. -->
| Concern | {{Without it}} | {{project}} |
|---|---|---|
| **{{Concern}}** | {{What you do today, and its failure mode}} | {{What the project does instead}} |

<p align="center">
    <!-- The alt text is all a screen reader gets: state the whole flow, like the SVG's <desc>. -->
    <img src="./.github/assets/{{diagram}}.svg" alt="{{The whole flow the diagram shows, in one or two sentences}}" width="100%" />
</p>

<!-- Only for a long README: GitHub has its own outline button, npm has none. -->
**Table of Contents**
- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
- [API](#api)
- [Notes](#notes)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
npm install {{package}} --save
```

{{Module format, Node.js range, notable peer dependencies.}}

## Usage

{{One ### per concept: sample first, rules after.}}

## Options

| Option | Type | Default | Description |
|---|---|---|---|

## API

<!-- Keep capability explanations and examples alongside this index. Move detail only to verified dedicated docs with a capability explanation and direct link here; without such a site, keep the full reference in this README. -->
| Export | Kind | Purpose |
|---|---|---|

## Notes

- **{{Behaviour readers get wrong.}}** {{What happens, and what to do about it.}}

## Contributing

Before starting to work on a pull request, it is important to review the guidelines for
[contributing](./CONTRIBUTING.md) and the [code of conduct](./CODE_OF_CONDUCT.md).
These guidelines will help to ensure that contributions are made effectively and are accepted.

## License

<!-- Keep the project's existing sign-off line, if it has one. -->
Published under [{{license}} License](./LICENSE).
