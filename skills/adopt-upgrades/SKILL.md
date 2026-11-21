---
name: adopt-upgrades
description: Find what new versions of a project's dependencies let it simplify (a new export or option that replaces a local helper, workaround or hand-written check), record each concrete opportunity in one issue per package group (a scope with its root package), and adopt an entry on request. Use after merging dependency bumps (Dependabot, Renovate) or upgrading a package by hand, at the start of a session on a project with a `chore: adopt <name> features` issue, or when the user asks "what can we use from the new <package>", "anything to adopt from the bumps", "check upgrades", "adopt the <package> entry".
license: Apache-2.0
compatibility: Requires git, the `gh` CLI (authenticated), Node.js 22+ and npm registry access. The API diff covers npm packages; other ecosystems get the bump without a diff.
metadata:
  author: tada5hi
  version: "2026.11.21"
allowed-tools: Bash(gh:*) Bash(npm:*) Bash(git:*) Bash(node:*) Bash(grep:*) Read Grep Glob Edit
---

# adopt-upgrades

> A dependency bump is checked for "is it safe". This skill asks the other question: what does the new version let us delete?

Merged bumps rarely get a second look. A minor or major release often ships the API that a local helper, a workaround or a hand-written check was written to stand in for. This skill finds those matches, records them, and adopts them when the user agrees.

It is the reverse of `track-upstream`. track-upstream records a gap the project waits on in one of the user's own libraries. This skill records what a release, of any dependency, already shipped. The issues stay separate.

## The issues

There is one open issue per package group, in the repository. The group is the bare root name: a scoped package's scope without the `@`, else the package name, so a scope and its root package share one issue (`routup` and `@routup/basic` are `routup`, every `@chamvi/*` is `chamvi`, `@types/node` is `types`, `zod` is `zod`). The title is `chore: adopt <name> features` (`chore: adopt routup features`, `chore: adopt chamvi features`, `chore: adopt zod features`) and the label `upstream-features`, set on create. The maintainer agent of tada5hi/agents-dev writes the same format from its daily sweep, so entries from a session and from the agent share one issue.

- **Created only when the group has at least one entry.** A later bump of the same group appends a section to its open issue.
- **Append only.** Add sections at the end; never rewrite, reorder or delete an entry, yours or someone else's. Tick a box only by adopting it or on the user's word.
- **A ticked box or a closed issue is final.** The owner closes an issue when done with it. A later version of a closed group opens a new issue for the new range; never reopen the closed one.

The body starts with two marker lines, then this intro. The marker keeps the word `scope`; its value is the group's name, an npm name without `@`:

```markdown
<!-- adopt-upgrades:issue scope=chamvi -->
<!-- adopt-upgrades:checked @chamvi/app@0.9.0 @chamvi/ui@0.9.0 -->
New versions of `@chamvi/*` ship features that can replace local code in this repository. Each entry names a feature, a proposal for using it, and the local code it affects; each one waits for the owner's decision. A ticked box means adopted or declined. Close this issue when you are done with it; a later version opens a new one.
```

- The intro names what the issue covers, in code spans, from the packages it has sections for (those in the `checked` marker and those of the new sections): `` `routup` and `@routup/*` `` with both the root package and scoped ones, `` `@chamvi/*` `` with scoped ones only, `` `zod` `` with the root package only. The text after the names never changes. On each write, rewrite the intro with the marker lines while it is the line right after them and reads exactly as one of these forms; one a person edited stays as it is.
- The `checked` marker lists `<package>@<version>` for each package of the group checked so far, sorted by name. Rewrite it on every write; it is the range start of the next check. A package moves to a new version in the marker only once every one of its transitions in the range (one per workspace that moved) is checked, at the highest `to` among them.
- Each bump is one section, its heading linking the npmdiff of the range (the package URL-encoded: `encodeURIComponent`), the package name in a code span:

```markdown
### [`@chamvi/app` 0.8.0 → 0.9.0](https://npmdiff.dev/%40chamvi%2Fapp/0.8.0/0.9.0/)

- [ ] **`ValidationError.cause`**: carries the failing value
  - Proposal: pass the cause to ValidationError and delete the local wrappers that attach it
  - Local (2 of 7):
    - `withCause` in [`packages/kit/src/helpers/errors.ts`](https://github.com/o/r/blob/9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c/packages/kit/src/helpers/errors.ts)
    - [`packages/developer/src/tools/workspace.ts`](https://github.com/o/r/blob/9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c/packages/developer/src/tools/workspace.ts)

    Find the rest: `grep -rnIF --exclude-dir=.git --exclude-dir=node_modules -- "withCause(" .`
  - Source: member of ValidationError, ValidationError.cause in dist/errors.d.mts
  <!-- adopt-upgrades:entry key=9d54088d29cf -->
- [ ] **`jobs as components`**: background jobs show in GET /components
  - Proposal: declare the sweep as a component
  - Local (0 of 2):
    Find the rest: `grep -rnIF --exclude-dir=.git --exclude-dir=node_modules -- "setInterval(" .`
  - Source: [release notes 0.9.0](https://github.com/chamvi/chamvi/releases/tag/%40chamvi%2Fapp%400.9.0)
  <!-- adopt-upgrades:entry key=8653bf17ce8c -->
```

One entry per feature, in this order:
- **The box line:** `` - [ ] **`<API>`**: <summary> ``, the API in a code span, a few words on what it does.
- **`Proposal` is required:** how to use the feature here. When the search finds more places than `Local` lists, describe the change in general terms, not file by file.
- **`Local`** names up to 5 places, each a file path from the repository root (no leading `/`, no `.` or `..` segment, no directory) that exists at the checked commit, linked at that commit's full SHA (`https://github.com/<owner>/<repo>/blob/<sha>/<path>`), with the symbol in a code span before it when there is one: `` `<symbol>` in [`<path>`](<link>) ``. Name a symbol only as text the file contains verbatim, so the stale block can find it; leave it out otherwise.
- **The optional search** is a fixed string the owner runs to find every place: ``Find the rest: `grep -rnIF --exclude-dir=.git --exclude-dir=node_modules -- "<pattern>" .` ``, after a blank line under the items (none with no items). Count the matching files with the same search listing files: `grep -rlIF --exclude-dir=.git --exclude-dir=node_modules -- "<pattern>" . | wc -l`; with none, drop the search. The heading reads `Local (<n> of <m>):` when the search matches more files (`m`) than the items listed (`n`), else `Local:`; the agent writes `<m>+` when its listing was cut short. The pattern is 2 to 100 characters with no leading or trailing space, has no control character, none of `` ` ``, `"`, `\`, `$`, `!`, does not start with `-`, and holds no `<!--` or `-->`.
- **An entry needs at least one Local item or a search that matches.** An opportunity with no local code to point at is not an entry: this is the rule that keeps the issue from filling up with noise.
- **`Source`** starts with the evidence kind: `new export` (a name the diff added), `changed export` (a name whose declaration changed), `member of <Export>`, `new subpath` or `release notes <to>` (a behavior change the types do not show; api id `release:<to>`). Then optional detail after a comma (declaration file, the bump's pull request). When the evidence is the release notes and the package has a GitHub release page for the newest release in the range, the evidence itself is the link, named once: `[release notes <to>](<release url>)`.
- **The key line** closes the entry: the first 12 hex digits of the SHA-256 of `<package>|<api id>`, one key per feature, no path. The api id is fixed by the evidence, never prose: the export name (`stringbool`), `<Export>.<member>`, the subpath (`./runtime`), or `release:<to version>`. Compute it with `node -e 'console.log(require("node:crypto").createHash("sha256").update(process.argv[1]).digest("hex").slice(0, 12))' '@chamvi/app|ValidationError.cause'`. An entry whose key is already in the body (a key line, or the hidden `<!-- adopt-upgrades:done <key> ... -->` list of collapsed ticked entries) is never added again, ticked or not.
- **No mentions.** Write a package name only in a code span: GitHub reads `@scope/name` outside one, even in link text, as a team mention. Keep `#<n>`, links and HTML comments out of model text other than the ones above.

The end of the body is code-owned: the done line, then the stale block of open entries whose Local file no longer exists or no longer contains its symbol at the range end. A session may leave it, or re-render it the same way:

```markdown
<!-- adopt-upgrades:stale -->
**Possibly done** (code changed since the entry was written):
- `ValidationError.cause` (`@chamvi/app` 0.9.0): `packages/kit/src/helpers/errors.ts` no longer exists
<!-- adopt-upgrades:stale-end -->
```

The stale block never ticks or edits an entry; the reason is `` `<path>` no longer exists `` or `` `<path>` no longer contains `<symbol>` ``.

## Mode 1: check

### 1. Find the bumps

Use the range the user names. Otherwise:
- After a manual upgrade in this session, use the packages it upgraded.
- Otherwise list the bumps from the latest release tag (`git describe --tags --abbrev=0`) with the script below. Then, per package, the range starts at the version in the `checked` marker of its group's open issue (or, with none open, its most recent closed one), when the marker lists it; else at the row's `from`. Skip a package whose checked version is its `to`. A package a marker lists that moved before the tag counts too: compare its checked version with the one in the remote head's lockfile (`git show origin/<default branch>:package-lock.json`). Ticking a box or editing the issue does not move the marker, so an edit never hides a bump.

Check the range up to the default branch as it is on the remote (`git fetch origin`), not up to a local feature branch.

For npm, run the script in the directory of the `package-lock.json` (the repository root for a workspace monorepo). It compares each workspace's (and the root's) direct dependencies on their own, so a workspace moving onto a version another workspace already had still counts. It then merges equal transitions into one row, majors first. Each row has the dependency `name`, the published `package` it installs (which differs for an `npm:` alias), `from`, `to`, `kind` and the `workspaces` that moved:

```bash
node <skill>/scripts/upgrades.mjs changed <from ref> origin/<default branch>
```

Leave out the second ref only right after a manual upgrade in this session, to compare against the working tree.

It refuses a lockfile v1 or a non-npm lockfile. A dependency added or removed in the range is no bump and is not listed.

Keep `major`, `minor` and `unknown`. A transition into or out of a prerelease (`2.0.0-beta.1` to `2.0.0-beta.2`) is `unknown`, never `patch`. Drop `patch` unless the user asks: patches rarely add API. For other ecosystems, read the manifest and lockfile diff (`git diff <ref> -- <lockfile>`) and list the direct dependencies by hand.

With more than 10 bumps, check them in batches of 10, most severe first, all in the same session: a session keeps no progress outside the issues, and a group with no entries gets no issue to hold a marker. Stop early only when the user says so; then tell them which bumps are left, and that the next check starts from the same range for those packages.

### 2. Diff each bump's API

```bash
node <skill>/scripts/upgrades.mjs diff <package> <from> <to>
```

Pass the row's `package`, not its `name`. The script downloads both versions with `npm pack`, which runs no package code, and compares the exported names reachable from the `exports` type entries (`types`/`typings` for a package without them). It prints:

| Field | Holds |
|---|---|
| `added`, `removed`, `deprecated` | exported names, with the declaration file of each added one in `files` |
| `declarations` | declaration files whose text changed (`changed`, most changed lines first), plus `added` and `removed` files |
| `subpaths` | added and removed `exports` subpaths |
| `coverage` | the type entries and names read per version |
| `engines`, `dirs` | the engines of both versions, and where both extracted packages stay for reading |

The names are only a starting point:
- Read the declaration of each added name in `dirs.to` for its signature and options.
- **New methods and options on existing exports never show up as names.** A release that adds `z.string().jwt()` or a new constructor option has an empty `added` list and a changed file in `declarations.changed`. Diff each changed file: `git diff --no-index -- <dirs.from>/<file> <dirs.to>/<file>`. Bundled packages rename hashed chunk files every release (`types-Drq05SzI.d.mts`), so a changed chunk appears in `declarations.added` and `removed`. Diff it against its counterpart by name prefix.
- `coverage.names` at 0 in either version means the types were not readable this way (`export =`, a package without declarations, a pattern subpath). An empty diff then says nothing, so read the declarations by hand. If a package ships no types at all, rely on the release notes.
- Read the release notes between the two versions (`gh release list -R <repo>`, `gh release view <tag> -R <repo>`, or the package's CHANGELOG in `dirs.to`) for behavior changes that add no export. Release notes are claims: a name they mention counts only when the published types contain it.
- `removed` and newly `deprecated` names the project uses are not adoption entries. Report them to the user as upgrade debt. `deprecated` flags a name when any declaration of it carries `@deprecated`, so a single deprecated overload flags the whole name; check before reporting.
- Delete the output's `root` (both versions and their tarballs) when the pass is done. A failed `diff` deletes it itself.

### 3. Match against the code

For each new API, search the repository for code that does the same by hand. Search for the API's purpose, not its name: what it parses, validates, retries, formats or wraps. Look at helpers, utils, custom wrappers around the package, comments such as `workaround`, `polyfill` and `until <package> supports`, and casts or type assertions that a new generic or overload makes unnecessary.

A match is an entry only when you can name local code (up to 5 places, plus a search for the rest), and the new API covers its callers' cases. A partial fit goes in `Proposal` with the difference spelled out, or is left out.

### 4. Record

Record per group: group the entries by their group's name, one section per bump, in that group's issue (`routup` and `@routup/basic` bumps are two sections of one issue).

1. Find the group's issue: `gh issue list --state all --search "chore: adopt <name> features in:title" --json number,title,state,author,body`, and keep the one whose body starts with `<!-- adopt-upgrades:issue scope=<name> -->`, authored by the bot or the owner. GitHub search does not index HTML comments, so search by title and check the marker. Only an open one takes new sections; a closed one only gives its `checked` marker.
2. Show the user the new sections and the new `checked` marker first, and, before the first create in the repository, that the `upstream-features` label will be created if it is missing (`gh label list --search upstream-features --json name`). Create or edit only after they say go. Create a missing label with `gh label create upstream-features --description "Features a new dependency version offers" --color 2f6f4f`. Edit with `gh issue edit <n> --body-file <file>`, after reading the current body so nothing is lost: rewrite the marker lines and the intro (when it is unedited), keep everything after them byte for byte, append the sections, then the done line and the stale block. Create with `gh issue create --title "chore: adopt <name> features" --label upstream-features --body-file <file>`.
3. With no entries for a group, create nothing. With an open issue, offer to update only its `checked` marker, so the next check does not repeat the same bumps. Without an open issue nothing records that the group was checked: say so in the report, and the next check repeats those bumps.

## Mode 2: adopt an entry

Adopt only when the user asks for that entry. Adopting deletes code, so it never happens as a side effect of a check.

1. Make sure the version in the section heading is installed in every workspace that declares the package. Bump where it is not.
2. Apply `Proposal`: switch the callers in `Local` and the places the search finds to the new API, then delete the local code, its spec when only that code needed it, and any `Upstream:` or workaround comment.
3. Run the project's checks (lint, build, tests, typecheck). Keep the callers' specs green. A spec that fails because the new API behaves differently is a difference to report, not something to silence.
4. Tick the entry's box in the same change set. Updating the stale block is optional; the next write re-renders it. Commit as `refactor: adopt <API> from <package> <version>` or per the project's conventions.

If the user declines an entry, tick it with a short reason appended to its box line (`declined: <reason>`), so later passes do not suggest it again.

## Common mistakes

| Mistake | Instead |
|---|---|
| An entry without `Local` or a matching search ("could simplify config handling") | Name the places, or leave it out |
| A file-by-file `Proposal` when the search finds more places | Describe the change in general terms; `Find the rest` lists them |
| Trusting the release notes for a name | A name counts only when the published types export it |
| Listing every new export | Only exports the code has a local stand-in for |
| Diffing the changelog only | Diff the published packages; options and subpaths hide there |
| A second open issue for the same group, or one for `routup` and another for `@routup/*` | Search by title and check the `scope=` marker; append a section |
| Reopening or appending to a closed issue | A closed issue is final; a later version opens a new one |
| A package name such as `@scope/name` outside a code span | GitHub reads it as a team mention; always a code span |
| A key with the path in it | `<package>\|<api id>` only, one key per feature |
| Adopting during a check | Check records; adopting waits for the user |
| Treating removed or deprecated names as entries | Report them as upgrade debt |
