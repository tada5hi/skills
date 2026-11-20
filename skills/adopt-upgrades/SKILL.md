---
name: adopt-upgrades
description: Find what new versions of a project's dependencies let it simplify (a new export or option that replaces a local helper, workaround or hand-written check), record each concrete opportunity in one tracking issue per repository, and adopt an entry on request. Use after merging dependency bumps (Dependabot, Renovate) or upgrading a package by hand, at the start of a session on a project with a `chore: adopt upstream features` issue, or when the user asks "what can we use from the new <package>", "anything to adopt from the bumps", "check upgrades", "adopt the <package> entry".
license: Apache-2.0
compatibility: Requires git, the `gh` CLI (authenticated), Node.js 22+ and npm registry access. The API diff covers npm packages; other ecosystems get the bump without a diff.
metadata:
  author: tada5hi
  version: "2026.11.20"
allowed-tools: Bash(gh:*) Bash(npm:*) Bash(git:*) Bash(node:*) Bash(grep:*) Read Grep Glob Edit
---

# adopt-upgrades

> A dependency bump is checked for "is it safe". This skill asks the other question: what does the new version let us delete?

Merged bumps rarely get a second look. A minor or major release often ships the API that a local helper, a workaround or a hand-written check was written to stand in for. This skill finds those matches, records them, and adopts them when the user agrees.

It is the reverse of `track-upstream`. track-upstream records a gap the project waits on in one of the user's own libraries. This skill records what a release, of any dependency, already shipped. The two issues stay separate.

## The tracking issue

There is exactly one tracking issue per repository, in that repository, titled `chore: adopt upstream features`. The maintainer agent of tada5hi/agents-dev writes the same format from its daily sweep, so entries from a session and from the agent share one issue.

The body starts with the marker line and the checked marker, then this fixed intro:

```markdown
<!-- adopt-upgrades:issue -->
<!-- adopt-upgrades:checked 4e1d2c3b5a69f0e8d7c6b5a4f3e2d1c0b9a8f7e6 -->
New versions of this repository's dependencies ship APIs that can replace local code. Each entry names the local code and the step to adopt it; adopting deletes code, so each one waits for the owner's decision. A ticked box means adopted or declined.
```

One entry per opportunity:

```markdown
- [ ] zod 4.1.0 → 4.2.0: `z.stringbool()` parses "true"/"false" env strings
  - Local: `parseBool` in `packages/kit/src/helpers/env.ts` (callers: `packages/kit/src/config.ts`)
  - Adopt: use `z.stringbool()` in the env schemas, delete `parseBool` and its spec
  - Source: new export `stringbool` (`v4/classic/schemas.d.ts`), #123
  <!-- adopt-upgrades:entry key=1e7a2610a6c5 -->
```

- The heading line is `<package> <from> → <to>: <API>` plus a few words on what the API does.
- **`Local` is required.** It names every file and symbol the API replaces, as paths from the repository root that exist at the default branch head. An opportunity with no local code to point at is not an entry. This is the rule that keeps the issue from filling up with noise.
- `Adopt` names the change and every local thing to delete, plus known differences (signature, edge cases, a breaking change of the bump).
- `Source` names the evidence: `new export <name>` (with its declaration file), `new member <Export>.<member>` or `new option <Export>.<option>` from a declaration diff, `new subpath <path>`, or `release notes <version>` for a behavior change the types do not show. Add the bump's pull request when there is one.
- The key is the first 12 hex digits of the SHA-256 of `<package>|<api id>|<first Local path>`. The api id is fixed by the evidence, never prose: the export name (`stringbool`), `<Export>.<member>`, the subpath (`./runtime`), or `release:<to version>`. Compute it with `node -e 'console.log(require("node:crypto").createHash("sha256").update(process.argv[1]).digest("hex").slice(0, 12))' 'zod|stringbool|packages/kit/src/helpers/env.ts'`. An entry whose key is already in the body is never added again, ticked or not.
- The checked marker holds the default-branch commit up to which every bump was checked. It moves only when every bump up to that commit was checked, not when a pass stopped at the 10-bump cap.
- New entries go at the end. Never rewrite or reorder someone else's entry; tick a box only by adopting it or on the user's word.

## Mode 1: check

### 1. Find the bumps

Use the range the user names. Otherwise:
- After a manual upgrade in this session, use the packages it upgraded.
- With a tracking issue, start from the commit in its checked marker. Ticking a box or editing the issue does not move it, so an edit never hides a bump.
- Without one, start from the latest release tag (`git describe --tags --abbrev=0`).

Check the range up to the default branch as it is on the remote (`git fetch origin`), not up to a local feature branch.

For npm, run the script in the directory of the `package-lock.json` (the repository root for a workspace monorepo). It lists the direct dependencies of the root and every workspace whose resolved version changed, majors first. Each row has the dependency `name` and the published `package` it installs, which differ for an `npm:` alias:

```bash
node <skill>/scripts/upgrades.mjs changed <from ref> origin/<default branch>
```

Leave out the second ref only right after a manual upgrade in this session, to compare against the working tree.

It refuses a lockfile v1 or a non-npm lockfile. A dependency added or removed in the range is no bump and is not listed.

Keep `major`, `minor` and `unknown`. Drop `patch` unless the user asks: patches rarely add API. For other ecosystems, read the manifest and lockfile diff (`git diff <ref> -- <lockfile>`) and list the direct dependencies by hand.

With more than 10 bumps, check the 10 most severe, leave the checked marker where it is, and tell the user which ones are left for the next pass.

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
- Delete the temporary directory (the parent of `dirs.from`) when the pass is done.

### 3. Match against the code

For each new API, search the repository for code that does the same by hand. Search for the API's purpose, not its name: what it parses, validates, retries, formats or wraps. Look at helpers, utils, custom wrappers around the package, comments such as `workaround`, `polyfill` and `until <package> supports`, and casts or type assertions that a new generic or overload makes unnecessary.

A match is an entry only when you can name the local symbol and file, and the new API covers its callers' cases. A partial fit goes in `Adopt` with the difference spelled out, or is left out.

### 4. Record

1. Find the tracking issue: `gh issue list --state all --search "adopt upstream features in:title" --json number,title,state,body`, and keep the one whose body starts with the marker line. GitHub search does not index HTML comments, so search by title and check the marker.
2. Show the user the new entries and the new checked commit first. Create or edit only after they say go. Edit with `gh issue edit <n> --body-file <file>`, after reading the current body so nothing is lost. Create with `gh issue create --title "chore: adopt upstream features" --body-file <file>`.
3. If the issue was closed, ask before reopening it or opening a new one: closing it may have been the owner's decision.
4. With no entries, create nothing. With an existing issue, offer to move only its checked marker, so the next pass does not check the same bumps again.

## Mode 2: adopt an entry

Adopt only when the user asks for that entry. Adopting deletes code, so it never happens as a side effect of a check.

1. Make sure the version in `Adopt` is installed in every workspace that declares the package. Bump where it is not.
2. Apply `Adopt`: switch the callers to the new API, then delete the local code, its spec when only that code needed it, and any `Upstream:` or workaround comment.
3. Run the project's checks (lint, build, tests, typecheck). Keep the callers' specs green. A spec that fails because the new API behaves differently is a difference to report, not something to silence.
4. Tick the box in the same change set. Commit as `refactor: adopt <API> from <package> <version>` or per the project's conventions.

If the user declines an entry, tick it with a short reason appended to its heading line (`declined: <reason>`), so later passes do not suggest it again.

## Common mistakes

| Mistake | Instead |
|---|---|
| An entry without `Local` ("could simplify config handling") | Name the symbol and file, or leave it out |
| Trusting the release notes for a name | A name counts only when the published types export it |
| Listing every new export | Only exports the code has a local stand-in for |
| Diffing the changelog only | Diff the published packages; options and subpaths hide there |
| A second tracking issue | Search by the body marker; one issue per repository |
| Adopting during a check | Check records; adopting waits for the user |
| Treating removed or deprecated names as entries | Report them as upgrade debt |
