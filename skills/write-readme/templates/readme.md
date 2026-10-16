<!--
Template: replace every {{placeholder}} and drop sections that do not apply.
Package READMEs on npm: image paths resolve against the default branch, so pin them (see references/rendering.md).
-->
<p align="center">
    <img src="./.github/assets/logo.svg" alt="{{project}}" width="128" height="128" />
</p>

<h1 align="center">{{project}}</h1>

<p align="center">
    <!-- Under 120 characters, the same sentence as the package.json description and the GitHub "About" text. -->
    <b>{{One sentence: what it does, in the reader's terms.}}</b><br>
    {{One or two lines: what the reader no longer has to write,}}<br>
    {{and the one thing that makes it different.}}
</p>

<p align="center">
    <!-- Three or four badges that measure something: version, CI, coverage. No decorative badges. -->
    <a href="https://www.npmjs.com/package/{{package}}"><img src="https://img.shields.io/npm/v/{{package}}" alt="npm version" /></a>
    <a href="https://github.com/{{owner}}/{{repo}}/actions/workflows/{{ci-workflow}}.yml"><img src="https://github.com/{{owner}}/{{repo}}/actions/workflows/{{ci-workflow}}.yml/badge.svg" alt="CI" /></a>
    <a href="https://codecov.io/gh/{{owner}}/{{repo}}"><img src="https://codecov.io/gh/{{owner}}/{{repo}}/branch/{{default-branch}}/graph/badge.svg" alt="Coverage" /></a>
</p>

<p align="center">
    <a href="#installation"><b>Installation</b></a>
    ·
    <a href="#usage">Usage</a>
    ·
    <a href="#options">Options</a>
    ·
    <a href="#api">API</a>
    ·
    <a href="#notes">Notes</a>
</p>

---

## Why {{project}}?

{{The problem: what every project ends up writing by hand, and where that goes wrong.}}

{{project}} is that layer, written once:

<!-- Compare capabilities, not adjectives. Describe the alternative fairly; it is often the right choice for someone. -->
| Concern | {{Without it}} | {{project}} |
|---|---|---|
| **{{Concern}}** | {{What you do today, and its failure mode}} | {{What the project does instead}} |

{{A short sample: the same thing before and after, or done two or three ways.}}

```typescript
```

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

<!-- With a docs site, link to its reference here instead of duplicating it. -->
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
