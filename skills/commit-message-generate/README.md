# commit-message-generate

> **Generate a Conventional Commits message for the uncommitted changes in your working directory.**
> Stop rereading your own diff to work out the type, the scope and whether anything breaks.

[All skills](../../README.md#skills) · [`SKILL.md`](./SKILL.md)

## Why commit-message-generate?

A good commit message needs the right type and scope, an imperative description under 72 characters, and a breaking-change marker when a public API changed. Writing it by hand means rereading the diff, checking recent commits for the house style, and noticing when one diff holds two unrelated changes.

| Concern | Without it | With commit-message-generate |
|---|---|---|
| **What goes in** | Remember whether you staged everything | Uses the staged changes when something is staged, otherwise all unstaged changes and new files, and says which |
| **Type and scope** | Guess between `fix`, `refactor` and `chore` | Picks a standard [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) type and the scope from the affected area |
| **Breaking changes** | Spotted only when a consumer breaks | Looks for removed exports, changed signatures and config format changes, and marks them with `!` or a `BREAKING CHANGE:` footer |
| **Mixed changes** | One commit with a fix and a feature | Recommends splitting and writes one message per commit |
| **House style** | Varies by author | Matches the style of the last ten commits |

## Installation

```bash
# this skill only, any Agent Skills agent
npx skills add tada5hi/skills --skill='commit-message-generate'

# Claude Code: the plugin bundles every skill
/plugin marketplace add tada5hi/skills
/plugin install skills@tada5hi
```

## Triggering

**Ask for it.** The agent loads the skill when your request matches its description, for example:

- "generate a commit message"
- "write a commit message for my changes"
- "give me a conventional commit for this"

The agent may also use it before committing staged changes.

**Invoke it directly.** Type `/commit-message-generate` (installed with the skills CLI) or `/skills:commit-message-generate` (Claude Code plugin).

## What it does

1. Reads `git status`, the staged and unstaged diffs, untracked files and the last ten commit subjects.
2. Works out what changed, why, the scope, any breaking changes, and whether the diff should be split.
3. Composes the message: imperative, lowercase description under 72 characters without a trailing period; a body wrapped at 72 characters only when the description is not enough; footers for breaking changes and issue references.
4. Shows the message in a code block, or one block per commit when it recommends a split.

## Requirements

- A git repository with uncommitted changes.

## Output

A message in the chat, ready to copy:

```text
feat(parser): support nested query parameters

BREAKING CHANGE: `parse()` now returns an object instead of a string
```

## Notes

- **It never commits.** The skill only presents the message; you decide when and how to run `git commit`.
- **Staged changes win.** With both staged and unstaged changes, the message covers only the staged ones, and the skill tells you the unstaged changes are left out.
- **Nothing to commit, nothing generated.** With no staged, unstaged or new files it tells you so and stops. New files alone get a message, with a reminder to `git add` them.
- **No AI attribution.** It never adds a `Co-Authored-By` trailer for the agent.

## License

Apache-2.0, see [LICENSE](../../LICENSE).
