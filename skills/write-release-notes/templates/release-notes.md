<!--
    Skeleton for a GitHub release body. Fill in the placeholders, delete every
    section that does not apply, and keep the section order.

    Publish with: gh release edit {{tag}} --notes-file <this file>
-->

> {{tag}} is {{what this release is}}. {{If it closes a prerelease cycle: it contains everything from the N `{{tag}}-beta.*` tags, so this note covers the whole cycle since {{last stable}}.}}

<!--
    Optional. Context that is not a feature: the theme of the release, a new
    runtime or peer-dependency baseline, a submodule that moved to another
    package, an end-of-life date. Delete the section if there is none.
-->
## 📣 Some News

#### {{Headline of the context item}}

{{Two or three sentences. What changed at the level of the whole project, and what it means for a reader who is on the previous major.}}

## 👀 Highlights

<!--
    One section per user-visible change, ordered by how many readers it
    touches. Each one: what changed, why it matters, a code sample, an
    optional alert, a docs link. Delete the parts that do not apply.
-->
### {{emoji}} {{Highlight title}}

{{What changed, in one or two sentences.}}

{{Why it matters: the failure it prevents, or what it now makes possible.}}

```{{language}}
{{code sample, taken from the docs or tests at this tag}}
```

> [!{{NOTE|WARNING|TIP}}]
> {{The caveat, the required action, or the escape hatch.}}

📖 [{{Docs page title}}]({{https://docs.example.com/guide/page.html#anchor}})

### {{emoji}} {{Next highlight title}}

{{...}}

### ⚠️ Heads-Up Before Upgrading

| Change | What to do |
| --- | --- |
| {{breaking change}} | {{action, in the imperative}} |

### ⬆️ Upgrading

```sh
{{npm install package@^{{version}}}}
```

📖 [Migration guide {{previous major}} to {{this major}}]({{https://docs.example.com/guide/migration.html}})

{{Optional: one sentence thanking the people who filed issues, tested the prereleases and reviewed the changes.}}

## 👉 Changelog

[compare changes](https://github.com/{{owner}}/{{repo}}/compare/{{last stable tag}}...{{tag}})

<!--
    The generated entries, grouped. Keep every one of them: readers scan this
    list for their own issue number. Aggregate across the prerelease tags when
    this release closes a cycle.
-->
### 🚀 Features

* {{subject}} ([#{{pr}}]({{pr url}})) ([{{sha}}]({{commit url}}))

### 🩹 Fixes

* {{subject}} ([#{{pr}}]({{pr url}})) ([{{sha}}]({{commit url}}))

### 💅 Refactors

* {{subject}} ([#{{pr}}]({{pr url}})) ([{{sha}}]({{commit url}}))

### ⚠️ Breaking Changes

* {{what breaks, phrased so the reader can tell whether it affects them}}

<!--
    Optional, when the release closes a prerelease cycle.
-->
<details>
<summary>Per-release changelogs of the {{prerelease}} cycle</summary>

* [{{tag}}-beta.1](https://github.com/{{owner}}/{{repo}}/releases/tag/{{tag}}-beta.1)
* [{{tag}}-beta.0](https://github.com/{{owner}}/{{repo}}/releases/tag/{{tag}}-beta.0)

</details>
