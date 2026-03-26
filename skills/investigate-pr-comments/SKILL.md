---
name: investigate-pr-comments
description: Fetch PR review comments from GitHub, investigate each one against the actual codebase, and fix real issues. Use after a PR review to triage and act on reviewer feedback, or when asked to "check PR comments", "handle review feedback", or "investigate PR".
license: Apache-2.0
compatibility: Requires git repository with gh CLI authenticated and a PR on the current branch.
metadata:
  author: tada5hi
  version: "2026.03.26"
allowed-tools: Bash(gh:*) Bash(npx:*) Bash(npm:*) Read Edit Write Glob Grep Agent AskUserQuestion
---

# investigate-pr-comments

> Fetch all review comments on the current PR, investigate each one against the actual code, and fix real issues.

## Step 1: Fetch PR comments

Fetch comments using `gh api` and write full output to temp files for processing.

**Important:**
- `jq` may not be available. Use `node -e` for JSON parsing.
- On Windows (MINGW), `gh api` paths must NOT start with `/` (MINGW rewrites them to filesystem paths).
- **Never truncate comment bodies** (e.g. `.substring(0, 200)`). Reviewers embed suggested diffs, reasoning, and fixes in the body — truncation destroys actionable content.
- On Windows, `/dev/stdin` does not work with `node -e`. Use `process.stdin` piping or read from a temp file instead.

### 1a. Get PR metadata

```bash
gh pr view --json number,headRepository
```

### 1b. Fetch and save full comments to temp files

Save raw JSON to temp files first, then parse. This avoids terminal overflow on PRs with many or long comments.

```bash
# Save PR-level comments (issue comments)
gh api repos/{owner}/{repo}/issues/{number}/comments > /tmp/pr-issue-comments.json

# Save review comments (inline comments with file/line context)
gh api repos/{owner}/{repo}/pulls/{number}/comments > /tmp/pr-review-comments.json
```

### 1c. Parse comments with full bodies

Process the saved JSON files with `node -e`, reading from the file path (not stdin):

```bash
node -e "
const fs = require('fs');
const comments = JSON.parse(fs.readFileSync('/tmp/pr-review-comments.json', 'utf8'));
const parsed = comments
  .filter(c => c.user.type !== 'Bot' || c.body.includes('suggestion'))
  .map(c => ({
    id: c.id,
    user: c.user.login,
    path: c.path || null,
    line: c.line || c.original_line || null,
    body: c.body
  }));
console.log(JSON.stringify(parsed, null, 2));
"
```

### 1d. Extract structured fields (optional)

For AI reviewer comments (e.g. CodeRabbit) that use severity labels, extract structured sections:

```bash
node -e "
const fs = require('fs');
const comments = JSON.parse(fs.readFileSync('/tmp/pr-review-comments.json', 'utf8'));
const parsed = comments.map(c => {
  const severityMatch = c.body.match(/\[([Cc]ritical|[Mm]ajor|[Mm]inor|[Nn]it)\]/);
  const suggestionMatch = c.body.match(/\`\`\`suggestion\n([\s\S]*?)\`\`\`/);
  return {
    id: c.id,
    path: c.path || null,
    line: c.line || c.original_line || null,
    severity: severityMatch ? severityMatch[1].toLowerCase() : null,
    hasSuggestion: !!suggestionMatch,
    suggestion: suggestionMatch ? suggestionMatch[1] : null,
    body: c.body
  };
});
console.log(JSON.stringify(parsed, null, 2));
"
```

### Batch processing for large PRs

For PRs with many comments (20+), process in batches to keep context manageable:
1. Parse all comments and save structured output to `/tmp/pr-comments-parsed.json`.
2. Sort by severity (critical > major > minor > nit) and by file path.
3. Investigate one file at a time in Step 2, reading the parsed comments for that file.

## Step 2: Investigate each comment

For each review comment (skip bot summaries, walkthrough comments, and pure markdown-lint suggestions on non-code files):

1. **Read the referenced file and line** to understand the current state of the code.
2. **Evaluate the comment** against the actual code:
   - Is the issue still present, or was it already fixed in a later commit?
   - Is the concern valid given the project's architecture and constraints?
   - Does the suggested fix make sense, or does it misunderstand the design?
3. **Classify** the comment:
   - **Real issue** — the code has a bug, security flaw, or correctness problem
   - **Pre-existing issue** — a valid concern (bug, flaw, or pattern) that existed before this PR and was not introduced by it
   - **Already fixed** — the issue was addressed in a subsequent commit
   - **Invalid** — the reviewer misunderstood the design, constraints, or context
   - **Stylistic** — a genuine style preference or formatting choice, not a correctness concern. Never classify a valid bug or design flaw as Stylistic solely because it is pre-existing — use **Pre-existing issue** instead
   - **Uncertain** — you cannot confidently classify the comment

4. **If uncertain, ask the user.** When the code context is ambiguous, the reviewer's concern involves a design trade-off, or you lack domain knowledge to judge correctness — do NOT guess. Present the comment, the relevant code, your analysis so far, and ask the user to decide. Only proceed with a fix or dismissal after the user confirms.

### Context to consider when evaluating

- Check `.agents/*.md` and `CLAUDE.md` for architectural decisions and constraints that may explain the code.
- Plan files in `.agents/plans/` are working documents, not shipped code.

## Step 3: Fix real issues and handle pre-existing issues

For each comment classified as a **real issue**:

1. Apply the fix.
2. Run the project linter on changed files.
3. Run relevant tests to verify the fix.

For each comment classified as a **pre-existing issue**, choose one of the following based on scope:

1. **Small, scoped fix** — if the fix is small (a few lines), localized to files already touched by this PR, and unlikely to cause regressions, fix it directly in the current PR. Apply the fix, lint, and test as with real issues.
2. **Larger or out-of-scope fix** — if the fix is non-trivial, touches files outside the PR's scope, or carries regression risk, create a GitHub issue instead:
   ```bash
   gh issue create --title "<concise description of the pre-existing issue>" --body "$(cat <<'EOF'
   ## Pre-existing issue found during PR review

   **Reported in:** PR #<number>, review comment by @<user>
   **File:** `<path>#<line>`

   ## Description
   <explain the issue and why it matters>

   ## Suggested fix
   <outline the fix approach>
   EOF
   )"
   ```
3. **Related to an ongoing plan** — if the issue relates to a plan file in `.agents/plans/`, append a note to the relevant plan file linking to the review comment and describing the concern. This ensures the issue is tracked in context.

## Step 4: Resolve fixed threads on GitHub

For each comment classified as **Real issue** that was successfully fixed, resolve the review thread on GitHub:

1. Fetch all review thread IDs via GraphQL:
   ```bash
   gh api graphql -f query='{
     repository(owner: "<owner>", name: "<repo>") {
       pullRequest(number: <number>) {
         reviewThreads(first: 50) {
           nodes {
             id
             isResolved
             comments(first: 1) {
               nodes { body path }
             }
           }
         }
       }
     }
   }'
   ```

2. Match each fixed comment to its thread by `path` and body content.

3. Resolve only the threads corresponding to fixed issues:
   ```bash
   gh api graphql -f query='mutation { resolveReviewThread(input: { threadId: "<thread_id>" }) { thread { isResolved } } }'
   ```

Do NOT resolve threads for comments classified as Invalid, Stylistic, or Already fixed — only resolve threads where a code fix was applied. For pre-existing issues fixed in the current PR, resolve the thread. For pre-existing issues where a GitHub issue was created, do NOT resolve the thread.

## Step 5: Report

Present a summary table of all comments:

| Comment | File | Verdict | Action |
|---------|------|---------|--------|
| Short description | `path#line` | Real issue / Pre-existing issue / Already fixed / Invalid / Stylistic | Fixed + Resolved / Fixed / Issue #N created / Note added to plan / None |

If `--dry-run` was passed as `$ARGUMENTS`, skip Steps 3–4 and only report the classification without making changes or resolving threads.
