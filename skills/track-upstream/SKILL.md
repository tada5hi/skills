---
name: track-upstream
description: Track the upstream issues a project waits on in the user's own libraries, in one tracking issue per project, and adopt each fix once it is released. Use when a library the user maintains (an owner in their package list, e.g. tada5hi, authup, routup) lacks a feature or has a bug and a local workaround or copy is written instead, when filing such an upstream issue, at the start of a session on a project with a tracking issue or `Upstream:` comments, or when the user asks "can we adopt …", "is the fix released", "which upstream issues are done", "track this upstream".
license: Apache-2.0
compatibility: Requires the `gh` CLI (authenticated) and npm registry access.
metadata:
  author: tada5hi
  version: "2026.11.20"
allowed-tools: Bash(gh:*) Bash(npm:*) Bash(git:*) Bash(grep:*) Read Grep Edit
---

# track-upstream

> A local workaround for a gap in the user's own library is a debt with a due date: the release that fixes it. Record it where it is found, in one place per project, and pay it the session the release ships.

Three parts make the record, and each points at the others:

| Part | Where | Holds |
|---|---|---|
| Upstream issue | the library's repo | the gap, a proposed API, the consumer as context |
| Tracking issue | the project's repo, exactly one | one entry per upstream issue: `Local`, `Adopt`, specs to keep green |
| `Upstream:` comment | first line of each local copy or workaround | `Upstream: <owner>/<repo>#<n>` plus a few words |

The user's libraries are the owners and repos in their package list (default `tada5hi/awesome`, see the `query-package-list` skill). Third-party libraries do not go into the tracking issue.

## Mode 1: file (a workaround was just written)

1. **Search before filing.** `gh search issues --repo <owner>/<repo> "<keywords>"` (both states; its `--state` takes only `open` or `closed`) and `gh issue list -R <owner>/<repo> --state all --search "<keywords>"`. An existing issue (open or closed) is reused; a closed one with the fix unreleased is tracked like an open one.
2. **Draft the upstream issue** when none exists: title as a Conventional Commit (`feat(<pkg>): …` / `fix(<pkg>): …`), body with the gap, a proposed API (signature and a short example), and the consumer file as context. Show the draft and ask before creating it: an issue is visible to others.
3. **Find the project's tracking issue.** A title alone does not find it (`chore: adopt authup fixes` has no "upstream"), so search titles and bodies for the marker and the library names: `gh issue list --state open --search "Upstream in:title,body"`, then `gh issue list --state open --search "<library or owner/repo> in:title,body"` for each library involved, and read the candidates. On a project with few open issues, read them all (`gh issue list --state open --limit 200 --json number,title,body`). Exactly one exists per project: if one tracks only some libraries (e.g. titled after one library), extend it and widen its title (`chore: adopt upstream fixes`) instead of opening a second. Create it only after these searches find none, with the intro below.
4. **Add the entry** to the tracking issue (`gh issue edit <n> --body-file …`, after reading the current body so nothing is lost):

   ```markdown
   - [ ] tada5hi/rapiq#997 helpers to read and replace a filter value every match must satisfy
     - Local: `findRequiredEqualValue`, `replaceRequiredEqualValue` in `apps/server-core/src/core/entities/post-tag/helpers.ts` (callers: `post-tag/service.ts`, `post/service.ts`)
     - Adopt: bump `@rapiq/core`, import both, delete `helpers.ts`; the local `find…` returns `string | undefined`, rapiq proposes `unknown`
     - Specs: `test/unit/core/entities/post/read.spec.ts` stays green
   ```

   `Local` names every file, so the next session finds the code without guessing. `Adopt` names the bump and every local thing to delete, plus known signature differences.
5. **Mark the code.** First line of each local copy: `// Upstream: tada5hi/rapiq#997 (local copy until @rapiq/core ships it)`. If the project keeps a plan or adoption file, add the same entry there too.

Intro of a new tracking issue:

```markdown
This project works around these upstream issues in the maintainer's libraries. When a release ships one, bump the package, apply its "Adopt" step, delete the local code and its `Upstream:` comment, and tick the box. An item is adoptable only when a published version contains the fix, not when the issue closes.
```

## Mode 2: check (session start, or "can we adopt …")

Read the tracking issue, then cross-check the code: `grep -rn "Upstream:" --include='*.ts' --include='*.vue' --include='*.md' .` (skip `node_modules`, `dist`). An `Upstream:` comment without an entry, or an entry whose `Local` file has no comment, is a finding to report.

For each unticked entry, decide one state, in this order:

| State | Evidence required |
|---|---|
| open | `gh issue view <n> -R <repo> --json state,stateReason` is `OPEN` |
| closed without a fix | closed as `NOT_PLANNED` or `DUPLICATE` (follow a duplicate to its target and track that one instead), or closed with no fixing commit to be found: report it and ask whether the workaround stays for good (drop the entry, keep the code with a plain comment) or the issue is reopened |
| fixed, unreleased | closed, the fixing commit identified, but it is in no release tag, or npm's latest predates it |
| released, unverified | a tag contains the fix and npm has that version, but the API was not seen in the package |
| **adoptable** | all of the above, plus the export or behavior is present in the published package |

How to get the evidence:

- **Fixing commit:** the closing PR (`gh issue view <n> -R <repo> --json closedByPullRequestsReferences` or the timeline), then its merge commit. When the closing PR is a release PR, find the fix commit itself in the release range (`gh api repos/<repo>/compare/<previous tag>...<tag> --jq '.commits[].commit.message'`).
- **Released:** `gh api repos/<repo>/compare/<tag>...<sha> --jq .status` is `behind` or `identical` for the first tag that contains it; `npm view <pkg> versions --json` lists that version; for monorepos match the package's own tag (`core-v1.3.2`, `@scope/pkg@x`).
- **Present in the package, through the import the project will write:** `npm view <pkg>@<version> dist.tarball`, download into a temporary directory, and start from its `package.json`: the `exports` entry of the intended subpath (`.` or `./typeorm`), its `types`/`import` targets, then follow the declaration's re-exports to the name. A declaration in an internal file that the entry does not re-export is not an export. For a function or class also check the runtime entry: `npm install --prefix <tmp dir> <pkg>@<version>` and `node --input-type=module -e "import('<pkg>/<subpath>').then((m) => console.log(typeof m.<name>))"` (run inside that directory) prints `function`. A fix may ship under another name than the issue proposed: report the shipped one. A behavior fix adds no export: the fix commit inside the release range is the evidence, and the entry's specs, run after the bump, confirm it. Read the release notes for breaking changes (engines, ESM-only, renamed options).

Report per entry: state, the evidence (issue state, commit, tag, npm version, export found), and for adoptable ones the exact bump (`npm install <pkg>@^<version> -w <workspace>`, every workspace that declares it). A release with a breaking major is still adoptable but listed with what breaks.

## Adopting an entry

Adopt when the user agrees (it deletes code), never as a side effect of the check. Bump in every workspace that declares the package, apply the entry's `Adopt` step, delete the local code and its `Upstream:` comment, keep the named specs green, run the project's checks, then tick the box (and the plan file's box, if any) in the same change set. Commit as `refactor:` or `chore(deps):` per the project's conventions.

## Common mistakes

| Mistake | Instead |
|---|---|
| A second tracking issue for another library | Extend the one tracking issue; widen its title |
| "Closed, so adoptable" | Closed is not released: find the tag and the npm version |
| "Released, so adoptable" without opening the package | Follow the intended import from `package.json` `exports` to the name, and import it at runtime |
| A tracker search by title only | Search titles and bodies for `Upstream` and the library names before creating one |
| An entry without `Local` paths | Name every file and caller; the next session cannot guess |
| Creating the upstream issue without asking | Draft it, show it, create on the user's go-ahead |
| Tracking a third-party library | Only the user's own libraries go into the tracking issue |
