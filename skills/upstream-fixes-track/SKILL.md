---
name: upstream-fixes-track
description: Track the upstream issues a project waits on in the user's own libraries, in one tracking issue per project, and adopt each fix once it is released. Use when a library the user maintains (an owner in their package list, e.g. tada5hi, authup, routup) lacks a feature or has a bug and a local workaround or copy is written instead, when filing such an upstream issue, at the start of a session on a project with a tracking issue or `Upstream:` comments, or when the user asks "can we adopt …", "is the fix released", "which upstream issues are done", "track this upstream".
license: Apache-2.0
compatibility: Requires the `gh` CLI (authenticated) and npm registry access.
metadata:
  author: tada5hi
  version: "2026.11.23"
allowed-tools: Bash(gh:*) Bash(npm:*) Bash(git:*) Bash(grep:*) Bash(node:*) Bash(curl:*) Bash(tar:*) Bash(mktemp:*) Read Grep Edit Write
---

# upstream-fixes-track

> A local workaround for a gap in the user's own library is a debt due with the release that fixes it. Record it where it is found, in one place per project, and pay it when the release ships.

The record has three parts, each pointing at the others:

| Part | Where | Holds |
|---|---|---|
| Upstream issue | the library's repo | the gap, a proposed API, the consumer as context |
| Tracking issue | the project's repo, exactly one | one entry per upstream issue: `Local`, `Adopt`, specs to keep green |
| `Upstream:` comment | first line of each local copy or workaround | `Upstream: <owner>/<repo>#<n>` plus a few words |

The user's libraries are the owners and repos in their package list (default `tada5hi/awesome`, see `package-list-query`). Third-party libraries do not go into the tracking issue. The reverse direction, what a released version of any dependency already lets the project delete, is `upstream-features-adopt`, with its own issues.

## Mode 1: file (a workaround was just written)

Mode 1 is one pass with three outputs: the upstream issue, its entry in the project's tracking issue, and the `Upstream:` comment. It is not done while any of them is missing, also when the user only asked to "file the upstream issue": the tracking entry is created or extended in the same pass, never left for later.

1. **Search before filing:** `gh issue list -R <owner>/<repo> --state all --search "<keywords>"`. Reuse an existing issue, open or closed; a closed one whose fix is unreleased is tracked like an open one.
2. **Draft the upstream issue** when none exists: a Conventional Commit title (`feat(<pkg>): …` / `fix(<pkg>): …`), the gap, a proposed API (signature and a short example), the consumer file as context. Show the draft and create it only on the user's go-ahead: it is visible to others.
3. **Find the project's tracking issue.** Its title need not say "upstream" (`chore: adopt authup fixes`), so search titles and bodies: `gh issue list --state open --search "Upstream in:title,body"`, then `gh issue list --state open --search "<library or owner/repo> in:title,body"` per library involved, and read the candidates. With few open issues, read them all (`gh issue list --state open --limit 200 --json number,title,body`). There is exactly one per project: if one tracks only some libraries, or a single-fix adoption issue (`Adopt the locter fix for …`) is the only candidate, extend it into the tracker: keep its content as the first entry and widen its title (`chore: adopt upstream fixes`). Create one only when these searches find none, with the intro below.
4. **Add the entry** with `gh issue edit <n> --body-file <file>`, after reading the current body so nothing is lost:

   ```markdown
   - [ ] tada5hi/rapiq#997 helpers to read and replace a filter value every match must satisfy
     - Local: `findRequiredEqualValue`, `replaceRequiredEqualValue` in `apps/server-core/src/core/entities/post-tag/helpers.ts` (callers: `post-tag/service.ts`, `post/service.ts`)
     - Adopt: bump `@rapiq/core`, import both, delete `helpers.ts`; the local `find…` returns `string | undefined`, rapiq proposes `unknown`
     - Specs: `test/unit/core/entities/post/read.spec.ts` stays green
   ```

   `Local` names every file and caller. `Adopt` names the bump, every local thing to delete, and known signature differences.
5. **Mark the code.** First line of each local copy: `// Upstream: tada5hi/rapiq#997 (local copy until @rapiq/core ships it)`. If the project keeps a plan or adoption file, add the same entry there.
6. **Report all three.** The reply names the upstream issue's link, the tracking issue's link (and whether it was created, extended or retitled) and the file carrying the `Upstream:` comment. A reply with only the upstream link means steps 3 to 5 were skipped.

Intro of a new tracking issue:

```markdown
This project works around these upstream issues in the maintainer's libraries. When a release ships one, bump the package, apply its "Adopt" step, delete the local code and its `Upstream:` comment, and tick the box. An item is adoptable only when a published version contains the fix, not when the issue closes.
```

## Mode 2: check (session start, or "can we adopt …")

Read the tracking issue, then cross-check the code: `grep -rn "Upstream:" --include='*.ts' --include='*.vue' --include='*.md' --exclude-dir=node_modules --exclude-dir=dist .`. Report an `Upstream:` comment without an entry, and an entry whose `Local` file has no comment.

For each unticked entry, decide one state, in this order:

| State | Evidence required |
|---|---|
| open | `gh issue view <n> -R <repo> --json state,stateReason` is `OPEN` |
| closed without a fix | closed as `NOT_PLANNED`, or `DUPLICATE` (track the target instead), or closed with no fixing commit to be found: report it and ask whether the workaround stays for good (drop the entry, keep the code with a plain comment) or the issue is reopened |
| fixed, unreleased | closed with an identified fixing commit that is in no release tag, or npm's latest predates it |
| released, unverified | a tag contains the fix and npm has that version, but the API was not seen in the package |
| **adoptable** | all of the above, plus the export or behavior is present in the published package |

Evidence:

- **Fixing commit:** the closing PR (`gh issue view <n> -R <repo> --json closedByPullRequestsReferences` or the timeline), then its merge commit. When that is a release PR, find the fix commit in the release range (`gh api repos/<repo>/compare/<previous tag>...<tag> --jq '.commits[].commit.message'`).
- **Released:** `gh api repos/<repo>/compare/<tag>...<sha> --jq .status` is `behind` or `identical` for the first tag that contains it, and `npm view <pkg> versions --json` lists that version. In monorepos match the package's own tag (`core-v1.3.2`, `@scope/pkg@x`).
- **Present through the import the project will write:** download `npm view <pkg>@<version> dist.tarball` into a temporary directory and start from its `package.json`: the `exports` entry of the intended subpath (`.` or `./typeorm`), its `types`/`import` targets, then the declaration's re-exports to the name. A name declared in an internal file the entry does not re-export is not exported. For a function or class also check the runtime: `npm install --prefix <tmp dir> <pkg>@<version>`, then inside that directory `node --input-type=module -e "import('<pkg>/<subpath>').then((m) => console.log(typeof m.<name>))"` prints `function`. If the fix shipped under another name than proposed, report the shipped one. A behavior fix adds no export: the fix commit inside the release range is the evidence, and the entry's specs confirm it after the bump. Read the release notes for breaking changes (engines, ESM-only, renamed options).

Report per entry: state, evidence (issue state, commit, tag, npm version, export found), and for adoptable ones the exact bump (`npm install <pkg>@^<version> -w <workspace>` for every workspace that declares it). A breaking major is still adoptable; list what breaks.

## Mode 3: adopt an entry

Only when the user agrees, never as a side effect of a check: it deletes code. Bump in every workspace that declares the package, apply the `Adopt` step, delete the local code and its `Upstream:` comment, keep the named specs green, run the project's checks, then tick the box (and the plan file's, if any) in the same change set. Commit as `refactor:` or `chore(deps):` per the project's conventions.

## Common mistakes

| Mistake | Instead |
|---|---|
| Filing the upstream issue and stopping there | Every filed upstream issue gets its tracking entry and its `Upstream:` comment in the same pass, also when many are filed at once or another tracker (another project's) lists them |
| A second tracking issue for another library | Extend the one tracking issue; widen its title |
| "Closed, so adoptable" | Find the tag and the npm version |
| "Released, so adoptable" without opening the package | Follow the import from `exports` to the name, and import it at runtime |
| A tracker search by title only | Search titles and bodies for `Upstream` and the library names |
