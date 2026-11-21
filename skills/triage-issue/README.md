# triage-issue

> **Find the root cause of a bug in your codebase and file a GitHub issue with a TDD fix plan.**
> Stop filing bug reports that only describe the symptom and leave the investigation to whoever picks them up.

[All skills](../../README.md#skills) · [`SKILL.md`](./SKILL.md)

Frozen copy from [mattpocock/skills](https://github.com/mattpocock/skills); no upstream updates.

## Why triage-issue?

A bug report usually says what went wrong, not why. Whoever fixes it traces the code path again, guesses which tests are missing, and may patch the symptom. The skill does the investigation once, mostly without asking you anything, and writes down the cause and a test-first fix.

| Concern | Without it | With triage-issue |
|---|---|---|
| **Questions** | A back-and-forth before anyone looks at code | Asks at most one question, "What's the problem you're seeing?", then starts investigating |
| **Diagnosis** | The symptom is reported | Traces where it manifests, the code path, the root cause, related tests and recent `git log` changes |
| **Fix plan** | "Fix the bug" | An ordered list of RED-GREEN cycles, each a test of observable behavior plus the minimal change to pass it |
| **Durability** | Line numbers that move | Describes modules, behaviors and contracts, so the issue stays useful after refactors |

## Installation

```bash
# this skill only, any Agent Skills agent
npx skills add tada5hi/skills --skill='triage-issue'

# Claude Code: the plugin bundles every skill
/plugin marketplace add tada5hi/skills
/plugin install skills@tada5hi
```

## Triggering

**Ask for it.** The agent loads the skill when your request matches its description, for example:

- "triage this bug"
- "file an issue for this problem"
- "investigate and plan a fix for this"

The agent may also use it when you report a bug.

**Invoke it directly.** Type `/triage-issue` (installed with the skills CLI) or `/skills:triage-issue` (Claude Code plugin).

## What it does

1. Takes your description of the problem, or asks one question if you gave none.
2. Investigates the codebase with an Explore subagent: entry points, code path, root cause, tests, recent changes.
3. Decides the minimal fix, the affected modules, and whether it is a regression, missing feature or design flaw.
4. Designs a TDD fix plan of RED-GREEN cycles, with a final refactor step if needed.
5. Creates the issue with `gh issue create` and prints its URL with a one-line root-cause summary.

## Requirements

- An authenticated `gh` CLI with permission to create issues in the repository.
- An agent with subagent support; the investigation step uses Claude Code's Agent tool with the `Explore` subagent type.

## Output

One GitHub issue with the sections Problem (actual and expected behavior, reproduction), Root Cause Analysis, TDD Fix Plan and Acceptance Criteria, plus the issue URL and a one-line root-cause summary in the chat.

## Notes

- **No review before filing.** The skill creates the issue without showing it to you first; read it at the URL it prints.
- **It ends with the issue.** The workflow stops once the issue is filed; implementing the fix plan is a separate step.

## License

Frozen copy of [mattpocock/skills](https://github.com/mattpocock/skills) at `fb3629d`, MIT, see [LICENSE.md](./LICENSE.md). It no longer receives upstream updates.
