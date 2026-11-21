# package-list-refresh

> **Sync your awesome-style package list with GitHub and npm, then open a pull request.**
> Stop checking by hand which repositories are new, archived, renamed or deprecated since you last edited the list.

[All skills](../../README.md#skills) · [`SKILL.md`](./SKILL.md)

## Why package-list-refresh?

| Concern | Without it | With package-list-refresh |
|---|---|---|
| **New repositories** | Remember to add each one after publishing | The scan lists every public repository of the configured owners that is not on the list |
| **Dead entries** | Spot archived, private or deleted repositories by chance | The scan reports gone, archived, private and renamed repositories; the entries are removed or updated |
| **Monorepo packages** | Compare package folders with the list by hand | Reports packages that appeared in or vanished from each monorepo |
| **npm** | Find deprecated packages when a user complains | Reports deprecated and unpublished packages |
| **Exclusions** | Reject the same repository again every time | Records each exclusion with a reason in the list's `package-list` config comment, so it is not proposed again |

## Installation

```bash
# this skill only, any Agent Skills agent
npx skills add tada5hi/skills --skill='package-list-refresh'

# Claude Code: the plugin bundles every skill
/plugin marketplace add tada5hi/skills
/plugin install skills@tada5hi
```

## Triggering

**Ask for it.** The agent loads the skill when your request matches its description, for example:

- "refresh my package list"
- "sync my package list with GitHub"
- "add my new repo to the awesome list"

The agent may also use it after you publish a new package, or when the [package-list-query](../package-list-query/) skill found the list stale.

**Invoke it directly.** Type `/package-list-refresh` (installed with the skills CLI) or `/skills:package-list-refresh` (Claude Code plugin). The list repository is the one you name, else `$PACKAGE_LIST_REPO`, else `tada5hi/awesome`.

## What it does

1. Clones the list repository into a temporary directory and creates a `refresh/<YYYY-MM-DD>` branch.
2. Runs the bundled `scripts/scan.mjs`, which reads the list and prints a Markdown report of every finding.
3. Decides each finding: adds, removes, renames or excludes entries, and asks you in one question about repositories it cannot classify.
4. Keeps the entry format strict and the `## Contents` section in sync.
5. Re-runs the scan until every section is empty.
6. Shows you the diff summary and waits for your go, then commits, pushes the branch and opens a pull request, then removes the temporary directory.

## Requirements

- Node.js 18 or later.
- git.
- The `gh` CLI, authenticated with push access to the list repository.
- Network access to GitHub and the npm registry.

## Output

A pull request against the list repository titled `chore: refresh package list`, with a body that lists the added, removed and excluded repositories and packages. A list without a `package-list` config comment gets one as the first change, with `owners:` set to the list's owner plus every org already linked from its entries and an empty `exclude:`.

## Notes

- **The scan reports, the agent decides.** New repositories are never added blindly; profiles, docs sites, deployments and experiments go to `exclude:` with a reason.
- **The scan is read-only.** It aborts on a rate limit or network error instead of reporting false findings; re-run it.
- **Forks, archived repositories and template repositories are skipped** without an exclusion entry.
- **Other owners are checked, never proposed.** Entries from accounts outside `owners:` are verified but no new repositories are suggested from them.
- **No empty pull requests.** When nothing changed, it says so and stops.
- **No AI attribution** in the pull request body.

## License

Apache-2.0, see [LICENSE](../../LICENSE).
