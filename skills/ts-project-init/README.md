# ts-project-init

> **Scaffold a new TypeScript library from `tada5hi/typescript-template`, renamed, installed and built.**
> Stop cloning the template and hunting down every `typescript-template` reference by hand.

[All skills](../../README.md#skills) · [`SKILL.md`](./SKILL.md)

## Why ts-project-init?

Starting a library from [tada5hi/typescript-template](https://github.com/tada5hi/typescript-template) means cloning it, dropping its history and lockfile, and renaming the template in `package.json`, the README badges, the issue template and every other file. Miss one and the badges point at the template or `repository.url` names the wrong repo. Then you install, lint and build to find out whether it worked.

| Concern | Without it | With ts-project-init |
|---|---|---|
| **History** | Clone and remember to delete `.git` and the tags | Shallow clone, removes `.git`, `package-lock.json`, `node_modules` and `dist`, then `git init -b master` |
| **Renaming** | Search and replace, and break the namespaced paths | Replaces `Tada5hi/typescript-template`, `tada5hi/typescript-template`, then `typescript-template`, in that order |
| **Metadata** | Edit `package.json` and the README by hand | Sets description, keywords and license; fills the README description and drops the template's Codecov token |
| **Verification** | Find a broken build later | Checks that no `typescript-template` reference is left, runs `npm install`, `npm run lint` and `npm run build`, and stops on the first failure |
| **First commit** | A series of rename commits | One `chore: initial commit from typescript-template` |

## Installation

```bash
# this skill only, any Agent Skills agent
npx skills add tada5hi/skills --skill='ts-project-init'

# Claude Code: the plugin bundles every skill
/plugin marketplace add tada5hi/skills
/plugin install skills@tada5hi
```

## Triggering

**Ask for it.** The agent loads the skill when your request matches its description, for example:

- "init ts project"
- "create a new typescript library"
- "scaffold typescript package"
- "bootstrap a new repository from the template"

**Invoke it directly.** Type `/ts-project-init` (installed with the skills CLI) or `/skills:ts-project-init` (Claude Code plugin). If `name` or `description` is missing, the agent asks for both in one question; the other inputs take their defaults unless you give them:

| Input | Required | Default or rule |
|---|---|---|
| `name` | Yes | lowercase kebab-case npm and repository name |
| `description` | Yes | one line for `package.json` and the README |
| `keywords` | No | `[]` |
| `target` | No | `./<name>`, must not exist or be empty |
| `template` | No | `https://github.com/tada5hi/typescript-template` |
| `org` | No | `tada5hi` |
| `license` | No | `MIT` |

## What it does

1. Validates the name and the target directory, and checks that `git` and `npm` are available.
2. Clones the template without history and initializes a fresh repository on `master`.
3. Removes the template's "Using This Template" doc section, resets the release-please manifest to `0.0.0`, rewrites template references in every text file and checks that none is left, then sets the `package.json` metadata and the README description.
4. Runs `npm install`, `npm run lint` and `npm run build`; on a failure it stops before committing and shows you the failing command.
5. Creates one initial commit.
6. Reports the target path, package name, repository URL and next steps.

## Requirements

- git, Node.js 22 or later and npm.
- Network access to fetch the template and install dependencies.

## Output

A new directory with a committed, building library. The summary in the chat suggests next steps: create the GitHub repository with `gh repo create <org>/<name> --source=<target> --push`, rewrite `AGENTS.md` and `.agents/*.md`, which still describe the template (for example with [agent-docs-init](../agent-docs-init/)), write `src/index.ts` and replace the README's `## Usage` placeholder.

## Notes

- **It does not push or create the GitHub repository.** `gh repo create` is only suggested.
- **It writes no source code.** `src/index.ts` and `test/` stay as the template has them.
- **The template's tooling stays intact.** It does not bump `devDependencies` or change `tsconfig.json`, `eslint.config.js` or `tsdown.config.ts`; `version`, `author`, `engines`, `scripts` and `publishConfig` keep the template's values.
- **It stops on the first error** of install, lint or build and shows it to you, without retrying, skipping or committing.
- **A non-empty target stops it.** It asks you before going further.
- **No AI attribution.** The initial commit has no `Co-Authored-By` trailer.

## License

Apache-2.0, see [LICENSE](../../LICENSE).
