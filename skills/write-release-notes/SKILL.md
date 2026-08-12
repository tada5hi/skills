---
name: write-release-notes
description: Write GitHub release notes in a highlights-first style, with narrative sections and code samples above the generated changelog. Use when drafting or rewriting release notes, publishing a GitHub release, announcing a major or minor version, covering a beta cycle in a stable release, or when a release page shows nothing but a raw commit list.
license: Apache-2.0
compatibility: Requires a git repository with release tags and the `gh` CLI authenticated for the target repository.
metadata:
  author: tada5hi
  version: "2026.08.12"
allowed-tools: Bash(gh:*) Bash(git:*) Bash(curl:*) Read Write Edit Glob Grep
---

# write-release-notes

> Turn a machine-generated changelog into release notes a reader can act on: highlight sections that explain each user-visible change with a code sample, followed by the generated changelog.

A commit list answers "what landed". Release notes have to answer "what does this mean for my project, and what do I have to do". The generated changelog stays, it just moves to the bottom.

## When to use

- A major or minor release.
- A stable release that closes a prerelease cycle (the beta notes were read by almost nobody).
- A release page that is currently a raw commit list and deserves better.

Skip it for a patch release with one or two fixes. The generated changelog is enough there.

## Structure

Write the body in this order:

| Section | Content |
|---------|---------|
| Lead quote | One `>` line: what this release is and which range it covers |
| `## 📣 Some News` | Context that is not a feature: the theme of the release, a new baseline, a submodule that moved out, an end-of-life date. Optional |
| `## 👀 Highlights` | One `###` section per user-visible change |
| `### ⚠️ Heads-Up Before Upgrading` | Table: change → what to do |
| `### ⬆️ Upgrading` | Install command plus a link to the migration guide |
| `## 👉 Changelog` | Compare link plus the generated entries, grouped |

Use `templates/release-notes.md` in this skill directory as the starting skeleton.

## Step 1: Determine the range

Notes cover everything since the last **stable** release, not since the previous tag.

```bash
gh release list --limit 20
git tag --list --sort=-v:refname | head -20
```

If tags like `v4.0.0-beta.2` sit between the last stable release and this one, their features belong in these notes. Somebody upgrading from `v3` never saw them.

## Step 2: Gather the raw material

```bash
gh release view <tag> --json body --jq '.body'    # for every tag in the range
git log --oneline <last-stable>..<tag>
gh pr view <number> --json title,body --jq '.title + "\n\n" + .body'
```

A tag can exist without a release object, and `gh release view` answers `release not found` for it. Fall back to `git log <previous-tag>..<tag>` there.

Pull request descriptions are the best source for a highlight: they carry the motivation and the failure mode. Commit subjects only carry the what.

## Step 3: Read the code and docs at the tag, not in the working tree

```bash
git show <tag>:docs/guide/<page>.md      # samples that match the published version
git log --oneline <tag>..HEAD            # everything here is unreleased
```

Anything in `<tag>..HEAD` or in the working tree must not appear in the notes. Promoting a feature that is not on npm yet is the easiest way to lose a reader's trust, and it is easy to do by accident when the docs on `master` already describe it.

Take every code sample from the documentation or the tests at that tag, then adapt it. Samples invented from memory tend to name parameters that do not exist.

## Step 4: Group by user impact, not by commit

- One `###` highlight per user-visible change. Several commits can collapse into one highlight, and one large pull request can split into two.
- An internal refactor earns a highlight only when it changed something the reader can see or do. Lead with that part, then say what it enables.
- Order the highlights by how many readers they touch. Platform requirements first (runtime version, peer dependency), then new capabilities, then smaller changes.
- Every breaking change needs a highlight or a row in the heads-up table. Preferably both.

## Step 5: Write each highlight

An emoji plus a short title, then in this order:

1. What changed, in one or two sentences.
2. Why it matters: the failure it prevents, or what it now makes possible.
3. A code sample. Use a `diff` fence for a before and after migration, a normal language fence otherwise.
4. A caveat as a GitHub alert, when there is one.
5. A `📖 [Page title](https://…)` link to the documentation.

| Alert | Use for |
|-------|---------|
| `> [!NOTE]` | A behaviour detail readers get wrong |
| `> [!WARNING]` | Something that needs action or can break a build |
| `> [!TIP]` | Optional, nice to know, an escape hatch |

Be concrete instead of promotional. "Drops and re-adds the column, which silently discards every value in it" tells the reader something. "Improves reliability" does not.

## Step 6: Heads-up table and upgrading

The heads-up table is the section a maintainer under time pressure reads. Two columns, one row per breaking change, with the action in the imperative:

```markdown
| Change | What to do |
| --- | --- |
| ESM-only, Node >= 22 | Move off Node 20, keep `require()` if you are on Node 22+ |
| `applyQuery` removed | Move to `@rapiq/adapter-typeorm` |
```

Then the install command and a link to the migration guide.

## Step 7: Keep the generated changelog

Append the generated entries under `## 👉 Changelog` with a compare link, grouped as Features, Fixes, Refactors, Breaking Changes. Never drop them: they are the traceable record, and readers scan them for their own issue number.

When a release bot owns `CHANGELOG.md` (release-please, changesets, semantic-release), do not hand-edit that file. If a generated entry is factually wrong, for example it names a package that was never published, correct it in the release body and tell the user that the body now differs from `CHANGELOG.md` by that one line.

## Step 8: Verify, then publish

Every link in the body has to resolve, and a link with a fragment has to land on an anchor that exists. Check the links in the file, not one example URL:

```bash
page=$(mktemp)
grep -oE 'https?://[^)"[:space:]]+' notes.md | sort -u | while read -r url; do
    code=$(curl -sSL -o "$page" -w '%{http_code}' "${url%%#*}")
    case "$url" in
        *#*) grep -qF "id=\"${url##*#}\"" "$page" || code="$code anchor-missing" ;;
    esac
    printf '%s  %s\n' "$code" "$url"
done
```

Anything other than `200` on a line, or an `anchor-missing`, has to be fixed before publishing.

Then publish. `gh release edit` needs an existing release object, so pick the command from what the tag already has:

```bash
gh release view <tag> >/dev/null 2>&1 \
    && gh release edit <tag> --notes-file notes.md \
    || gh release create <tag> --notes-file notes.md --title <tag>
```

Release bots (release-please, semantic-release) create the release object themselves, so their tags take the `edit` branch, now and for every follow-up change. A tag pushed by hand takes the `create` branch once.

Write the body to a file first, keep it there, and edit that file for follow-up changes. A release page is public: show the draft and confirm before the first publish unless the user already asked for it to go out.

## Writing rules

- Second person, present tense, plain sentences.
- Every claim has to be checkable: read version ranges from `package.json` at the tag, behaviour from the docs or the tests.
- Do not restate the changelog in prose. If a highlight adds nothing to the commit subject, delete it.
- Follow the repository's own prose conventions. Some projects ban the em dash, some want British spelling. Check `AGENTS.md` or the contributing guide.
- No AI attribution lines anywhere in the body.

## Common mistakes

| Mistake | Fix |
|---------|-----|
| One highlight per commit | Group by user-visible change |
| Samples copied from `master` docs | Read the docs at the release tag |
| A feature that is only in the working tree | Diff `<tag>..HEAD` before writing |
| Prose that repeats the changelog | Cut it, keep the changelog entry |
| Broken or guessed documentation links | `curl` each one, check the anchor exists |
| Editing `CHANGELOG.md` by hand | Edit the release body, leave the bot's file alone |
| A stable release that only lists the delta since the last beta | Cover the whole cycle since the last stable |

## Example

[`typeorm-extension` v4.0.0](https://github.com/tada5hi/typeorm-extension/releases/tag/v4.0.0) is written in this style: a lead quote, a news section for the TypeORM baseline change, twelve highlights each with a sample and a documentation link, a heads-up table, and the aggregated changelog for the whole beta cycle at the bottom.
