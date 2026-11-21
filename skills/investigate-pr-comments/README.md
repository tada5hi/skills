# investigate-pr-comments

> **Check every unresolved review comment on your pull request against the code, then fix the real issues.**
> Stop working through review threads one by one to decide which ones are right.

[All skills](../../README.md#skills) · [`SKILL.md`](./SKILL.md)

## Why investigate-pr-comments?

After a review, a pull request can carry dozens of inline comments from people and from bots like Copilot or CodeRabbit. Some point at real bugs, some were fixed two commits ago, some misread the design. Going through them by hand means reading each file again, deciding what to do, and remembering which threads you already resolved.

| Concern | Without it | With investigate-pr-comments |
|---|---|---|
| **Finding comments** | Scroll the PR page; the API returns only the first 30 | Fetches all inline review comments with `--paginate`, full bodies, never truncated |
| **Repeat reviews** | Re-read threads you already handled | Drops comments whose thread is already resolved and investigates only the rest |
| **Judging a comment** | Trust or dismiss it on sight | Reads the referenced file and line, checks `CLAUDE.md` and `.agents/*.md`, and classifies the comment |
| **Old problems** | Fix them in the PR or forget them | Fixes small ones in the PR; files a GitHub issue for larger ones or adds a note to the related plan file |
| **Closing threads** | Resolve each thread by hand | Resolves only the threads where it applied a fix |

## Installation

```bash
# this skill only, any Agent Skills agent
npx skills add tada5hi/skills --skill='investigate-pr-comments'

# Claude Code: the plugin bundles every skill
/plugin marketplace add tada5hi/skills
/plugin install skills@tada5hi
```

## Triggering

**Ask for it.** The agent loads the skill when your request matches its description, for example:

- "check PR comments"
- "handle review feedback"
- "investigate PR"

The agent may also use it after a PR review to triage and act on reviewer feedback.

**Invoke it directly.** Type `/investigate-pr-comments` (installed with the skills CLI) or `/skills:investigate-pr-comments` (Claude Code plugin). Pass `--dry-run` to get the classification only, without fixes or resolved threads: `/investigate-pr-comments --dry-run`.

## What it does

1. Reads the PR for the current branch with `gh pr view` and fetches all inline review comments and review threads into temp files.
2. Filters out comments whose thread is already resolved.
3. Reads the code behind each remaining comment and classifies it: real issue, pre-existing issue, already fixed, invalid, stylistic or uncertain.
4. Asks you about each uncertain comment before it fixes or dismisses it.
5. Fixes real issues, then runs the linter on changed files and the relevant tests.
6. Handles pre-existing issues: a small fix in the PR, a new GitHub issue, or a note in the related plan file in `.agents/plans/`.
7. Resolves the review threads it fixed and reports a summary table.

## Requirements

- A git repository with an open pull request for the current branch.
- The `gh` CLI, authenticated for the repository.
- Node.js, used to parse the JSON from `gh api`; `jq` is not needed.

## Output

Code fixes in your working tree, possibly new GitHub issues, resolved threads on the PR, and a table in the chat:

```text
| Comment              | File             | Verdict            | Action            |
|----------------------|------------------|--------------------|-------------------|
| Missing null check   | `src/api.ts#42`  | Real issue         | Fixed + Resolved  |
| Unbounded retry loop | `src/http.ts#88` | Pre-existing issue | Issue #57 created |
| Rename to camelCase  | `src/db.ts#12`   | Stylistic          | None              |
```

## Notes

- **Inline comments only.** Issue-level PR comments, such as bot walkthroughs and general discussion, are not fetched.
- **It resolves only what it fixed.** Threads for invalid, stylistic or already fixed comments stay open, and so do threads for which it filed an issue.
- **Uncertain means it asks.** It does not guess on design trade-offs or ambiguous code.
- **Safe to run again.** Each run fetches the comments from scratch and skips resolved threads.
- **No AI attribution.** Issues it creates carry no AI-attribution line.

## License

Apache-2.0, see [LICENSE](../../LICENSE).
