---
name: release-notes-write
description: Write GitHub release notes in a highlights-first style, with narrative sections and code samples above the generated changelog. Use when drafting or rewriting release notes, publishing a GitHub release, announcing a major or minor version, covering a beta cycle in a stable release, or when a release page shows nothing but a raw commit list.
license: Apache-2.0
compatibility: Requires a git repository with release tags and the `gh` CLI authenticated for the target repository.
metadata:
  author: tada5hi
  version: "2026.11.21"
allowed-tools: Bash(gh:*) Bash(git:*) Bash(curl:*) Bash(mktemp:*) Bash(grep:*) Bash(sort:*) Read Write Edit Glob Grep
---

# release-notes-write

> Turn a machine-generated changelog into release notes a reader can act on: highlight sections that explain each user-visible change with a code sample, followed by the generated changelog.

Skip it for a patch release with one or two fixes: the generated changelog is enough there.

## Structure

Write the body in this order, starting from `templates/release-notes.md`:

| Section | Content |
|---------|---------|
| Lead quote | One `>` line: what this release is and which range it covers |
| `## 📣 Some News` | Context that is not a feature: the theme of the release, a new baseline, a submodule that moved out, an end-of-life date. Optional |
| `## 👀 Highlights` | One `###` section per user-visible change |
| `### ⚠️ Heads-Up Before Upgrading` | Table: change → what to do |
| `### ⬆️ Upgrading` | Install command plus a link to the migration guide |
| `## 👉 Changelog` | Compare link plus the generated entries, grouped |

## Step 1: Determine the range

Notes cover everything since the last **stable** release, not since the previous tag.

```bash
gh release list --limit 20
git tag --list --sort=-v:refname | head -20
```

Features from prerelease tags (`v4.0.0-beta.2`) between the last stable release and this one belong in these notes.

## Step 2: Gather the raw material

```bash
gh release view <tag> --json body --jq '.body'    # for every tag in the range
git log --oneline <last-stable>..<tag>
gh pr view <number> --json title,body --jq '.title + "\n\n" + .body'
```

A tag without a release object makes `gh release view` answer `release not found`; fall back to `git log <previous-tag>..<tag>` there.

Take each highlight's motivation and failure mode from the pull request description; commit subjects carry only the what.

## Step 3: Read the code and docs at the tag, not in the working tree

```bash
git show <tag>:docs/guide/<page>.md      # samples that match the published version
git log --oneline <tag>..HEAD            # everything here is unreleased
```

Nothing from `<tag>..HEAD` or the working tree may appear in the notes, even when the docs on the default branch already describe it.

Take every code sample from the documentation or the tests at that tag, then adapt it; never write one from memory.

## Step 4: Group by user impact, not by commit

- One `###` highlight per user-visible change. Several commits can collapse into one; one large pull request can split into two.
- An internal refactor earns a highlight only when it changed something the reader can see or do. Lead with that part, then say what it enables.
- Order by how many readers a change touches: platform requirements (runtime version, peer dependency), then new capabilities, then smaller changes.
- Every breaking change needs a highlight or a row in the heads-up table, preferably both.

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

Be concrete: "drops and re-adds the column, which silently discards every value in it", not "improves reliability".

## Step 6: Heads-up table and upgrading

Two columns, one row per breaking change, the action in the imperative:

```markdown
| Change | What to do |
| --- | --- |
| ESM-only, Node >= 22 | Move off Node 20, keep `require()` if you are on Node 22+ |
| `applyQuery` removed | Move to `@rapiq/adapter-typeorm` |
```

Then the install command and a link to the migration guide.

## Step 7: Keep the generated changelog

Append the generated entries under `## 👉 Changelog` with a compare link, grouped as Features, Fixes, Refactors, Breaking Changes. Never drop them: readers scan them for their own issue number.

When a release bot owns `CHANGELOG.md` (release-please, changesets, semantic-release), do not hand-edit that file. If a generated entry is factually wrong, for example it names a package that was never published, correct it in the release body and tell the user that the body now differs from `CHANGELOG.md` by that one line.

## Step 8: Verify, then publish

Write the body to `notes.md` outside the repository (the scratchpad or `$TMPDIR`), keep it, and edit that file for follow-up changes; the commands below use that path. Every link in it must resolve, and a link with a fragment must land on an existing anchor:

```bash
page=$(mktemp)
grep -oE 'https?://[^)"[:space:]]+' notes.md | sort -u | while read -r url; do
    code=$(curl -sSL -o "$page" -w '%{http_code}' "${url%%#*}")
    case "$url" in
        *#*) grep -qF "id=\"${url##*#}\"" "$page" || grep -qF "id=\"user-content-${url##*#}\"" "$page" || code="$code anchor-missing" ;;
    esac
    printf '%s  %s\n' "$code" "$url"
done
```

Fix anything other than `200`, and every `anchor-missing`, before publishing.

A release page is public: show the draft and confirm before the first publish unless the user already asked for it to go out. `gh release edit` needs an existing release object (release bots such as release-please create one; a tag pushed by hand has none until the first `create`):

```bash
if gh release view <tag> >/dev/null 2>&1; then
    gh release edit <tag> --notes-file notes.md
else
    gh release create <tag> --notes-file notes.md --title <tag>
fi
```

## Writing rules

- Second person, present tense, plain sentences.
- Every claim is checkable: version ranges from `package.json` at the tag, behaviour from the docs or the tests.
- Do not restate the changelog in prose. If a highlight adds nothing to the commit subject, delete it.
- Follow the repository's prose conventions (`AGENTS.md`, contributing guide), e.g. a ban on the em dash or British spelling.
- No AI attribution anywhere in the body.

## Example

[`typeorm-extension` v4.0.0](https://github.com/tada5hi/typeorm-extension/releases/tag/v4.0.0) is written in this style: a lead quote, a news section for the TypeORM baseline change, twelve highlights each with a sample and a documentation link, a heads-up table, and the aggregated changelog for the whole beta cycle at the bottom.
