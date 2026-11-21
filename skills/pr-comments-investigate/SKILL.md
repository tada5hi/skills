---
name: pr-comments-investigate
description: Fetch PR review comments from GitHub, investigate each one against the actual codebase, and fix real issues. Use after a PR review to triage and act on reviewer feedback, or when asked to "check PR comments", "handle review feedback", or "investigate PR".
license: Apache-2.0
compatibility: Requires a git repository, the gh CLI authenticated, Node.js, and an open PR (the current branch's, or one given by number).
metadata:
  author: tada5hi
  version: "2026.11.21"
allowed-tools: Bash(gh:*) Bash(git:*) Bash(node:*) Bash(npx:*) Bash(npm:*) Read Edit Write Glob Grep AskUserQuestion
---

# pr-comments-investigate

> Fetch the unresolved inline review comments on a PR, investigate each against the code, fix the real issues and resolve their threads.

## Arguments

`$ARGUMENTS`: `[<number>] [--dry-run]`

- `<number>`: the PR to investigate. Default: the PR of the current branch. Fixes go to the checked-out branch, so when the PR's `headRefName` differs from `git branch --show-current`, ask before running `gh pr checkout <number>`, or continue as `--dry-run`.
- `--dry-run`: classify and report only. Skip Steps 3 and 4: no edits, issues, plan notes or resolved threads.

Every run starts from scratch: re-fetch everything and investigate only unresolved threads, so fixes resolved in an earlier run are not re-litigated.

## Step 1: Fetch unresolved comments

Only **inline review comments** (tied to a file and line) are fetched, from any author, bots included. Issue-level PR comments (bot walkthroughs, discussion) are not; fetch a specific one separately if needed.

```bash
TMP="${TMPDIR:-${TEMP:-/tmp}}"
gh pr view <number> --json number,headRefName       # omit <number> for the current branch; compare headRefName (Arguments)
N=$(gh pr view <number> --json number --jq .number)
gh api --paginate --slurp "repos/{owner}/{repo}/pulls/$N/comments" > "$TMP/pr-review-comments.json"
gh api graphql --paginate --slurp -F owner='{owner}' -F repo='{repo}' -F number="$N" -f query='
  query($owner: String!, $repo: String!, $number: Int!, $endCursor: String) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $number) {
        reviewThreads(first: 100, after: $endCursor) {
          pageInfo { hasNextPage endCursor }
          nodes { id isResolved comments(first: 100) { nodes { databaseId } } }
        }
      }
    }
  }' > "$TMP/pr-review-threads.json"
```

`gh` fills `{owner}` and `{repo}` from the current repository.

```bash
node -e "
const fs = require('fs'), path = require('path');
const tmp = process.env.TMPDIR || process.env.TEMP || '/tmp';
const read = f => JSON.parse(fs.readFileSync(path.join(tmp, f), 'utf8'));
const thread = {};
for (const page of read('pr-review-threads.json'))
  for (const t of page.data.repository.pullRequest.reviewThreads.nodes)
    for (const c of t.comments.nodes) thread[c.databaseId] = t;
const all = read('pr-review-comments.json').flat();
const open = all.filter(c => !(thread[c.id] && thread[c.id].isResolved)).map(c => {
  const sev = c.body.match(/\[(critical|major|minor|nit)\]/i);
  const sug = c.body.match(/\`\`\`suggestion\n([\s\S]*?)\`\`\`/);
  return { id: c.id, threadId: thread[c.id] ? thread[c.id].id : null, user: c.user.login,
    path: c.path, line: c.line || c.original_line || null, createdAt: c.created_at,
    severity: sev ? sev[1].toLowerCase() : null, suggestion: sug ? sug[1] : null, body: c.body };
});
fs.writeFileSync(path.join(tmp, 'pr-comments-unresolved.json'), JSON.stringify(open, null, 2));
console.log('Total: ' + all.length + ', resolved: ' + (all.length - open.length) + ', to investigate: ' + open.length);
"
```

Then read `pr-comments-unresolved.json`. Rules for these commands:

- Keep `--paginate --slurp`: without `--paginate` only the first 30 items arrive; without `--slurp` the pages are concatenated JSON documents that `JSON.parse` rejects.
- Use `node`, not `jq` (may be missing; `gh --jq` cannot be combined with `--slurp`).
- Never truncate comment bodies; they carry suggested diffs and reasoning.
- Windows: `gh api` paths must not start with `/` (MINGW rewrites them), `node -e` cannot read `/dev/stdin`, and `/tmp` does not exist, hence the `TMP` fallbacks.

With 20 or more comments, sort by severity (critical > major > minor > nit) and path, and investigate one file at a time.

## Step 2: Investigate each comment

Skip bot summaries, walkthroughs and markdown-lint suggestions on non-code files. For each other comment, read the referenced file and line, check `CLAUDE.md` and `.agents/*.md` for constraints that explain the code (plan files in `.agents/plans/` are working documents, not shipped code), and classify:

- **Real issue**: a bug, security flaw or correctness problem introduced by this PR.
- **Pre-existing issue**: a valid concern that existed before this PR.
- **Already fixed**: addressed by a later commit.
- **Invalid**: the reviewer misread the design, constraints or context.
- **Stylistic**: a style or formatting preference, not a correctness concern. A valid bug is never Stylistic because it is pre-existing; that is **Pre-existing issue**.
- **Uncertain**: you cannot classify it confidently (ambiguous code, a design trade-off, missing domain knowledge). Do not guess: show the user the comment, the code and your analysis, and fix or dismiss only after they decide.

## Step 3: Fix

**Real issue**: apply the fix, run the project linter on the changed files and the relevant tests.

**Pre-existing issue**, by scope:

1. **Small** (a few lines, in files this PR already touches, low regression risk): fix it like a real issue.
2. **Larger or out of scope**: create an issue instead, with no AI-attribution line:
   ```bash
   gh issue create --title "<concise description>" --body "$(cat <<'EOF'
   ## Pre-existing issue found during PR review

   **Reported in:** PR #<number>, review comment by @<user>
   **File:** `<path>#<line>`

   ## Description
   <the issue and why it matters>

   ## Suggested fix
   <the approach>
   EOF
   )"
   ```
3. **Related to a plan in `.agents/plans/`**: append a note to that plan file linking the review comment and describing the concern.

## Step 4: Resolve fixed threads

Resolve the thread (`threadId` from Step 1) of every real issue fixed and every pre-existing issue fixed in this PR. A comment with `threadId: null` has no thread to resolve; say so in the summary:

```bash
gh api graphql -f query='mutation { resolveReviewThread(input: { threadId: "<threadId>" }) { thread { isResolved } } }'
```

Leave threads open for Invalid, Stylistic and Already fixed comments, and for pre-existing issues that got a GitHub issue or plan note.

## Step 5: Report

| Comment | File | Verdict | Action |
|---------|------|---------|--------|
| Short description | `path#line` | Real issue / Pre-existing issue / Already fixed / Invalid / Stylistic | Fixed + Resolved / Fixed / Issue #N created / Note added to plan / None |
