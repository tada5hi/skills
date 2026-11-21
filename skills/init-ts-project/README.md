# init-ts-project

> **Scaffold a new TypeScript library from `tada5hi/typescript-template`, renamed, installed and built.**
> Stop cloning the template and hunting down every `typescript-template` reference by hand.

[All skills](../../README.md#skills) · [`SKILL.md`](./SKILL.md)

## Why init-ts-project?

Starting a library from [tada5hi/typescript-template](https://github.com/tada5hi/typescript-template) means cloning it, dropping its history and lockfile, and renaming the template in `package.json`, the README badges, the issue template and every other file. Miss one and the badges point at the template or `repository.url` names the wrong repo. Then you install, lint and build to find out whether it worked.

| Concern | Without it | With init-ts-project |
|---|---|---|
| **History** | Clone and remember to delete `.git` and the tags | Shallow clone, removes `.git`, `package-lock.json`, `node_modules` and `dist`, then `git init -b master` |
| **Renaming** | Search and replace, and break the namespaced paths | Replaces `Tada5hi/typescript-template`, `tada5hi/typescript-template`, then `typescript-template`, in that order |
| **Metadata** | Edit `package.json` and the README by hand | Sets name, description, keywords, `repository.url` and license; updates the README heading, description, install line and badges, and the discussions URL |
| **Verification** | Find a broken build later | Runs `npm install`, `npm run lint` and `npm run build` and stops on the first failure |
| **First commit** | A series of rename commits | One `chore: initial commit from typescript-template` |

## Installation

```bash
# this skill only, any Agent Skills agent
npx skills add tada5hi/skills --skill='init-ts-project'

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

**Invoke it directly.** Type `/init-ts-project` (installed with the skills CLI) or `/skills:init-ts-project` (Claude Code plugin). The agent asks once for any missing input:

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
3. Rewrites template references in every text file, then updates `package.json`, `README.MD` and `.github/ISSUE_TEMPLATE/config.yml`.
4. Runs `npm install`, `npm run lint` and `npm run build`.
5. Creates one initial commit.
6. Reports the target path, package name, repository URL, build status and next steps.

## Requirements

- git, Node.js 22 or later and npm.
- Network access to fetch the template and install dependencies.

## Output

A new directory with a committed, building library. The summary in the chat suggests next steps: create the GitHub repository with `gh repo create <org>/<name> --source=<target> --push`, run [init-agent-docs](../init-agent-docs/), write `src/index.ts` and replace the README's `## Usage` placeholder.

## Notes

- **It does not push or create the GitHub repository.** `gh repo create` is only suggested.
- **It writes no source code.** `src/index.ts` and `test/` stay as the template has them.
- **The template's tooling stays intact.** It does not bump `devDependencies` or change `tsconfig.json`, `eslint.config.js` or `tsdown.config.ts`; `version`, `author`, `engines`, `scripts` and `publishConfig` keep the template's values.
- **It stops on the first error** of install, lint or build and shows it to you, without retrying or skipping.
- **A non-empty target stops it.** It asks you before going further.
- **No AI attribution.** The initial commit has no `Co-Authored-By` trailer.

## License

Apache-2.0, see [LICENSE](../../LICENSE).
