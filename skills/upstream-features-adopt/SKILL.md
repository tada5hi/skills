---
name: upstream-features-adopt
description: 'Find out whether new versions of a project''s dependencies can benefit it: features that simplify (replace a local helper, workaround or hand-written check), harden (make existing code more robust or safer) or improve (add a quality the code lacks) its code. Records each concrete opportunity in one issue per package group (a scope with its root package) and adopts an entry on request. Use after merging dependency bumps (Dependabot, Renovate) or upgrading a package by hand, at the start of a session on a project with a `chore: adopt <name> features` issue, or when the user asks "can we benefit from <package>", "what can we use from the new <package>", "anything to adopt from the bumps", "check upgrades", "adopt the <package> entry".'
license: Apache-2.0
compatibility: Requires git, the `gh` CLI (authenticated), Node.js 22+ and npm registry access. The API diff covers npm packages; other ecosystems get the bump without a diff.
metadata:
  author: tada5hi
  version: "2026.11.21"
allowed-tools: Bash(gh:*) Bash(npm:*) Bash(git:*) Bash(node:*) Bash(grep:*) Bash(wc:*) Read Grep Glob Edit Write
---

# upstream-features-adopt

> A dependency bump is checked for "is it safe". This skill reads the new versions so the owner does not have to, and asks of each new feature: can we benefit from it? A feature can simplify the code (replace a local helper, workaround or hand-written check), harden it (make it more robust or safer) or improve it (add a quality it lacks); each concrete case becomes a suggestion for the owner.

Its counterpart is `upstream-fixes-track`: that one records a gap the project still waits on in one of the user's own libraries; this one records what a release of any dependency already shipped. Their issues stay separate.

## The issues

One open issue per package group. The group is the bare root name: a scoped package's scope without the `@`, else the package name, so a scope and its root package share one issue (`routup` and `@routup/basic` are `routup`, every `@chamvi/*` is `chamvi`, `@types/node` is `types`, `zod` is `zod`). Title `chore: adopt <name> features`, label `upstream-features` set on create. The maintainer agent of tada5hi/agents-dev writes the same format from its daily sweep; both share one issue.

- **Created only when the group has at least one entry.** A later bump of the group appends a section to the open issue.
- **Append only.** Add sections at the end; never rewrite, reorder or delete an entry, yours or someone else's. Tick a box only by adopting it or on the user's word.
- **A ticked box or a closed issue is final.** The owner closes the issue. A later version of a closed group opens a new issue for the new range; never reopen or append to the closed one.

The body starts with two marker lines and the intro. The marker keeps the word `scope`; its value is the group name. An older issue may carry every marker with the earlier `adopt-upgrades:` prefix in place of `upstream-features-adopt:`: it is the same issue, read it the same way, and write its markers (the key lines too) with the current prefix on its next write.

```markdown
<!-- upstream-features-adopt:issue scope=chamvi -->
<!-- upstream-features-adopt:checked @chamvi/app@0.9.0 @chamvi/ui@0.9.0 -->
New versions of `@chamvi/*` ship features this repository can benefit from. Each entry names a feature, how the code would use it and where; each one waits for the owner's decision. A ticked box means adopted or declined. Close this issue when you are done with it; a later version opens a new one.
```

**The intro** names the covered packages in code spans, from those in the `checked` marker and the new sections: `` `routup` and `@routup/*` `` with both root and scoped packages, `` `@chamvi/*` `` with scoped ones only, `` `zod` `` with the root only. The rest of the text is fixed. On each write, rewrite the intro only while it is the line right after the markers and reads exactly as one of these forms (or with the earlier text after the names: `ship features that can replace local code in this repository. Each entry names a feature, a proposal for using it, and the local code it affects; each one waits for the owner's decision. A ticked box means adopted or declined. Close this issue when you are done with it; a later version opens a new one.`); leave one a person edited.

**The `checked` marker** lists `<package>@<version>` for each package of the group checked so far, sorted by package name. It is where the next check starts that package's range. It changes only when Mode 1 step 4 writes the issue (sections appended, or the marker-only update); ticking a box or any other edit never moves it. On that write, per package:

- **Every one of its transitions kept in step 1 went through steps 2 and 3 in this pass** (one row per distinct `from` → `to`; workspaces with the same transition share a row), with or without entries: set it to the highest `to` among them.
- **Some of its kept transitions were not checked** (a batch stopped early): keep its current version, or leave it out if it is not listed yet.
- **Not in this pass:** keep its current version.

Each bump is one section, its heading linking the npmdiff of the range (the package URL-encoded with `encodeURIComponent`), the package name in a code span:

```markdown
### [`@chamvi/app` 0.8.0 → 0.9.0](https://npmdiff.dev/%40chamvi%2Fapp/0.8.0/0.9.0/)

- [ ] **`ValidationError.cause`** (hardens): carries the failing value
  - Proposal: pass the cause, so a failed validation logs the value that failed; the local wrappers drop it today
  - Local (2 of 7):
    - `withCause` in [`packages/kit/src/helpers/errors.ts`](https://github.com/o/r/blob/9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c/packages/kit/src/helpers/errors.ts)
    - [`packages/developer/src/tools/workspace.ts`](https://github.com/o/r/blob/9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c/packages/developer/src/tools/workspace.ts)

    Find the rest: `git grep -nIF -e "withCause(" 9b8c7d6e5f4a`
  - Source: member of ValidationError, ValidationError.cause in dist/errors.d.mts
  <!-- upstream-features-adopt:entry key=9d54088d29cf -->
- [ ] **`jobs as components`** (improves): background jobs show in GET /components
  - Proposal: declare the sweep as a component, so GET /components shows whether it runs
  - Local (0 of 2):
    Find the rest: `git grep -nIF -e "setInterval(" 9b8c7d6e5f4a`
  - Source: [release notes 0.9.0](https://github.com/chamvi/chamvi/releases/tag/%40chamvi%2Fapp%400.9.0)
  <!-- upstream-features-adopt:entry key=380672b99d6e -->

### [`@chamvi/ui` 0.8.0 → 0.9.0](https://npmdiff.dev/%40chamvi%2Fui/0.8.0/0.9.0/)

- [ ] **`uiModule({ basePath })`** (simplifies): mounts the dashboard under a base path
  - Proposal: pass basePath instead of rewriting the routes
  - Local:
    - `uiRoutes` in [`apps/agents-dev/src/modules.ts`](https://github.com/o/r/blob/9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c/apps/agents-dev/src/modules.ts)
  - Source: new export, in dist/index.d.mts
  <!-- upstream-features-adopt:entry key=3369267292f4 -->
```

One entry per feature, its lines in this order:

- **Box line:** `` - [ ] **`<API>`** (<kind>): <summary> ``, the kind label (below), then a few words on what it does. A box line without a kind label (a person's entry) is still an entry.
- **`Proposal`** (required): how to use the feature here and the concrete gain: what fails or is missing today, or what becomes simpler, safer or clearer. When the search finds more places than `Local` lists, describe the change in general terms, not file by file.
- **`Local`:** for `simplifies` the code the feature replaces, for `hardens` and `improves` the code where it would apply. Up to 5 places, each a file path from the repository root (no leading `/`, no `.` or `..` segment, no directory) that exists at the checked commit, linked at that commit's full SHA (`https://github.com/<owner>/<repo>/blob/<sha>/<path>`), preceded by the symbol in a code span when there is one: `` `<symbol>` in [`<path>`](<link>) ``. Name a symbol only as text the file contains verbatim (the stale block looks for it).
- **Search** (optional): ``Find the rest: `git grep -nIF -e "<pattern>" <sha>` ``, `<sha>` the first 12 hex digits of the checked commit, after a blank line under the items (no blank line without items). Count its files with `git grep -lIF -e "<pattern>" <sha> | wc -l` (tracked files at that commit; if the clone lacks it, `git fetch --depth=1 origin <sha>` first); with no match, drop the search. The heading is `Local (<n> of <m>):` when the search matches more files (`m`) than items listed (`n`), else `Local:`; the agent writes `<m>+` when its listing was cut short. The pattern is 2 to 100 characters, no leading or trailing space, no control character, none of `` ` `` `"` `\` `$` `!`, does not start with `-`, and holds no `<!--` or `-->`.
- **An entry needs at least one Local item or a matching search.** An opportunity with no local code to point at is not an entry.
- **`Source`** starts with the evidence kind: `new export` (a name the diff added), `changed export` (a name whose declaration changed), `member of <Export>`, `new subpath`, or `release notes <to>` (a behavior change the types do not show). Optional detail follows after a comma (the declaration file, the bump's pull request as `pull request <n>`, never `#<n>`). For release notes, when the newest release in the range has a GitHub release page, the evidence is that link, once: `[release notes <to>](<release url>)`.
- **Key line** closes the entry: the first 12 hex digits of the SHA-256 of `<package>|<api id>`, no path. The api id comes from the evidence, never prose: the export name (`stringbool`), `<Export>.<member>`, the subpath (`./runtime`), or `release:<to>`. A `release:<to>` id covers every feature of the release, so its key appends the feature: `<package>|release:<to>|<feature>`, the feature being the box line's code span text, lowercased, whitespace runs collapsed to one space (`@chamvi/app|release:0.9.0|jobs as components`). Compute: `node -e 'console.log(require("node:crypto").createHash("sha256").update(process.argv[1]).digest("hex").slice(0, 12))' '@chamvi/app|ValidationError.cause'`. A key already in the body (a key line, or the hidden `<!-- upstream-features-adopt:done <key> ... -->` list of collapsed ticked entries) is never added again, ticked or not.
- **No mentions.** Write a package name only in a code span: GitHub reads `@scope/name` outside one, even in link text, as a team mention. No `#<n>`, links or HTML comments in model text other than those above.

The end of the body is code-owned: the done line, then the stale block of open `simplifies` entries whose Local file no longer exists or no longer contains its symbol at the range end. Only `simplifies` entries are checked: adopting one removes its local code, while a `hardens` or `improves` entry's local code stays when it is adopted (and an entry without a label is skipped), so the block cannot tell those apart from open ones. A session keeps it, or re-renders it the same way:

```markdown
<!-- upstream-features-adopt:stale -->
**Possibly done** (code changed since the entry was written):
- `uiModule({ basePath })` (`@chamvi/ui` 0.9.0): `apps/agents-dev/src/modules.ts` no longer contains `uiRoutes`
<!-- upstream-features-adopt:stale-end -->
```

The reason reads `` `<path>` no longer exists `` or `` `<path>` no longer contains `<symbol>` ``. The stale block never ticks or edits an entry.

## Mode 1: check

### 1. Find the bumps

`git fetch origin` and check up to the remote default branch, not a local feature branch. Use the range the user names. Otherwise:

- After a manual upgrade in this session: the packages it upgraded.
- Else the bumps since the latest release tag (`git describe --tags --abbrev=0`), from the script below. Per package, the range starts at its version in the `checked` marker of its group's open issue (with none open, the most recent closed one), else at the row's `from`. Skip a package whose checked version equals its `to`. A package the marker lists that moved before the tag counts too: compare its checked version with the remote head's lockfile (`git show origin/<default branch>:package-lock.json`).

For npm, run in the directory of the `package-lock.json` (the repository root for a workspace monorepo):

```bash
node <skill>/scripts/upgrades.mjs changed <from ref> origin/<default branch>
```

Leave out the second ref only right after a manual upgrade in this session, to compare against the working tree. The script compares each workspace's (and the root's) direct dependencies separately, so a workspace moving onto a version another already had still counts, then merges equal transitions, majors first. Each row has the dependency `name`, the published `package` it installs (differs for an `npm:` alias), `from`, `to`, `kind` and the `workspaces` that moved. Dependencies added or removed in the range are not listed. It refuses a lockfile v1 or a non-npm lockfile.

Keep `major`, `minor` and `unknown` (a transition into or out of a prerelease is `unknown`, never `patch`). Drop `patch` unless the user asks. For other ecosystems, list the direct dependencies by hand from `git diff <ref> -- <manifest> <lockfile>`.

With more than 10 bumps, check them in batches of 10, most severe first, all in this session: nothing outside the issues keeps progress. Stop early only when the user says so; then tell them which bumps are left and that the next check repeats them (their marker versions did not move).

### 2. Diff each bump's API

```bash
node <skill>/scripts/upgrades.mjs diff <package> <from> <to>
```

Pass the row's `package`, not its `name`. The script downloads both versions with `npm pack` (runs no package code) and compares the exported names reachable from the `exports` type entries (`types`/`typings` without them). Output:

| Field | Holds |
|---|---|
| `added`, `removed`, `deprecated` | exported names, with the declaration file of each added one in `files` |
| `declarations` | declaration files whose text changed (`changed`, most changed lines first), plus `added` and `removed` files |
| `subpaths` | added and removed `exports` subpaths |
| `coverage` | the type entries and names read per version |
| `engines`, `dirs` | the engines of both versions, and the extracted packages to read |
| `root` | the temporary directory holding both versions |

The names are a starting point:

- Read each added name's declaration in `dirs.to` for its signature and options.
- **New methods and options on existing exports are not new names.** They show as a file in `declarations.changed`: `git diff --no-index -- <dirs.from>/<file> <dirs.to>/<file>`. Bundled packages rename hashed chunks every release (`types-Drq05SzI.d.mts`), so a changed chunk appears in `declarations.added` and `removed`; diff it against its counterpart by name prefix.
- `coverage.names` at 0 in either version means the types were not readable this way (`export =`, no declarations, a pattern subpath): read the declarations by hand. With no types at all, rely on the release notes.
- Read the release notes in the range (`gh release list -R <repo>`, `gh release view <tag> -R <repo>`, or the CHANGELOG in `dirs.to`) for behavior changes that add no export. A name they mention counts only when the published types contain it.
- `removed` and newly `deprecated` names the project uses are not entries: report them to the user as upgrade debt. One `@deprecated` overload flags the whole name; check before reporting.
- When done, delete `root`: `node -e 'require("node:fs").rmSync(process.argv[1], { recursive: true, force: true })' <root>`. A failed `diff` deletes it itself.

### 3. Match against the code

For each new feature, ask one question: can this repository benefit from it? It can when the feature

| Kind | Label | The feature | `Local` names |
|---|---|---|---|
| simplify | `simplifies` | replaces code the repository writes by hand | the code it replaces |
| harden | `hardens` | makes existing code more robust or safer, for example with timeouts, cancellation, validation, error handling or stricter security | the code where it would apply |
| improve | `improves` | adds a quality the code lacks, for example stronger types, better performance, observability, or code that is hard to read because the package lacked a feature it now offers | the code where it would apply |

Pick one kind per feature: the first that applies in this order. A feature with several gains is still one entry (its key is per feature).

For `simplify`, search for the feature's purpose (what it parses, validates, retries, formats or wraps), not its name: helpers, utils, wrappers around the package, comments such as `workaround`, `polyfill` and `until <package> supports`, casts a new generic or overload makes unnecessary. For `harden`, search for the calls without the new timeout or signal, the unchecked input, the swallowed error. For `improve`, search for the loose types (casts, `any`), the hand-rolled formatting, the unlogged background work.

Propose a feature only with the places it applies to (`Local`, or a search) and the concrete gain there in `Proposal`: what fails or is missing today, or what becomes simpler, safer or clearer. A partial fit goes into `Proposal` with the difference spelled out, or is left out. If you cannot name the concrete gain at a named place (what fails or is missing, or what becomes simpler), write no entry. A feature that is new but gives this code nothing concrete is no entry.

### 4. Record

Group the entries by group name; each bump is a section in its group's issue (`routup` and `@routup/basic` bumps are two sections of one issue).

1. Find the group's issue: `gh issue list --state all --search "chore: adopt <name> features in:title" --json number,title,state,author,body`, and keep the one whose body starts with `<!-- upstream-features-adopt:issue scope=<name> -->` (or `<!-- adopt-upgrades:issue scope=<name> -->` on an older issue), authored by the bot or the owner (search does not index HTML comments). Only an open one takes new sections; a closed one only supplies its `checked` marker.
2. Show the user the new sections and the new `checked` marker, and, before the first create in the repository, that the `upstream-features` label will be created if missing (`gh label list --search upstream-features --json name`). Write only after they say go:
   - Missing label: `gh label create upstream-features --description "Features a new dependency version offers" --color 2f6f4f`.
   - Open issue: read the current body, rewrite the marker lines and the intro (when unedited), keep everything after them byte for byte (except that earlier `adopt-upgrades:` key lines move to the `upstream-features-adopt:` prefix, as the marker lines do), append the sections, then the done line and the stale block; `gh issue edit <n> --body-file <file>`.
   - No open issue: `gh issue create --title "chore: adopt <name> features" --label upstream-features --body-file <file>`.
3. A group with no entries gets no issue. With an open issue, offer to update only its `checked` marker so the next check does not repeat these bumps. Without one, report that nothing records the check and the next check repeats those bumps.

## Mode 2: adopt an entry

Only when the user asks for that entry; a check never adopts.

1. Install the version in the section heading in every workspace that declares the package.
2. Apply `Proposal` at the places in `Local` and those the search finds. For `simplifies`, switch the callers to the new API, then delete the local code, its spec when only that code needed it, and any `Upstream:` (see `upstream-fixes-track`) or workaround comment. For `hardens` and `improves`, use the feature there and add a spec for the gain when it is observable (a timeout, a refused input).
3. Run the project's checks (lint, build, tests, typecheck). Keep the callers' specs green; a spec failing because the new API behaves differently is a difference to report, not to silence.
4. Tick the entry's box in the same change set (the stale block may be left; the next write re-renders it). Commit as `refactor: adopt <API> from <package> <version>` (a `hardens` entry that fixes a failure as `fix:`) or per the project's conventions.

A declined entry is ticked with `declined: <reason>` appended to its box line, so later passes skip it.

## Common mistakes

| Mistake | Instead |
|---|---|
| A file-by-file `Proposal` when the search finds more places | Describe the change generally; `Find the rest` lists them |
| Listing every new export | Only features with a concrete gain for named local code |
| An entry without a concrete gain ("could use X") | `Proposal` says what fails or is missing today, or what becomes simpler, safer or clearer; otherwise no entry |
| Only asking what the version lets you delete | Ask whether the code can benefit: simplify, harden or improve |
| Diffing the changelog only | Diff the published packages; options and subpaths hide there |
| A second open issue for the group, or separate ones for `routup` and `@routup/*` | Search by title, check the `scope=` marker, append a section |
| A key with the path in it | `<package>\|<api id>` only (plus `\|<feature>` for a `release:` id) |
