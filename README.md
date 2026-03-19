# @tada5hi/skills 🧩

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)

A collection of [Agent Skills](https://agentskills.io) for AI coding agents.

**Table of Contents**

- [Skills](#skills)
- [Usage](#usage)
- [CLI Manager](#cli-manager)
- [Vendor Skills](#vendor-skills)
- [Structure](#structure)
- [Adding New Skills](#adding-new-skills)
- [License](#license)

## Skills

| Skill | Type | Description |
|-------|------|-------------|
| [init-agent-docs](skills/init-agent-docs/) | Manual | Initialize a project with AI agent documentation (CLAUDE.md, AGENTS.md, .agents/*.md) |
| [investigate-pr-comments](skills/investigate-pr-comments/) | Manual | Fetch PR review comments, investigate against codebase, and fix real issues |
| [link-skills](skills/link-skills/) | Manual | Link skills into `.claude/skills/` for Claude Code discovery |
| [update-agent-docs](skills/update-agent-docs/) | Manual | Propose template improvements back to this repository via pull request |
| [grill-me](skills/grill-me/) | Vendor | Relentlessly interview users about plans until decision trees are resolved |
| [improve-codebase-architecture](skills/improve-codebase-architecture/) | Vendor | Explore a codebase for architectural improvement opportunities |
| [prd-to-issues](skills/prd-to-issues/) | Vendor | Break PRDs into independently-grabbable GitHub issues |
| [prd-to-plan](skills/prd-to-plan/) | Vendor | Convert PRDs into multi-phase implementation plans |
| [tdd](skills/tdd/) | Vendor | Test-driven development with red-green-refactor loops |
| [triage-issue](skills/triage-issue/) | Vendor | Investigate bugs, identify root causes, and file issues with fix plans |
| [write-a-prd](skills/write-a-prd/) | Vendor | Create a PRD through interactive interview and codebase exploration |

## Usage

These skills follow the [Agent Skills](https://agentskills.io) open standard and are compatible with Claude Code, Cursor, VS Code Copilot, Gemini CLI, Goose, Roo Code, and other supporting tools.

### Skills CLI

The easiest way to install skills is via the [skills CLI](https://github.com/vercel-labs/skills):

```bash
# Install all skills
npx skills add tada5hi/skills --skill='*'

# Install a specific skill
npx skills add tada5hi/skills --skill='init-agent-docs'

# Install globally (available across all projects)
npx skills add tada5hi/skills --skill='*' -g
```

Learn more about the CLI usage at [vercel-labs/skills](https://github.com/vercel-labs/skills).

## CLI Manager

The project includes a CLI tool (`src/cli.ts`) for managing vendor skills and local development. To get started:

```bash
npm install
```

All commands are available as npm scripts:

| Command | Description |
|---------|-------------|
| `npm run skills` | Show available commands |
| `npm run skills:init` | Add vendor git submodules defined in `src/meta.ts` |
| `npm run skills:sync` | Pull latest vendor changes and copy into `skills/` |
| `npm run skills:check` | Check for available upstream updates |
| `npm run skills:cleanup` | Remove submodules and skills not listed in `src/meta.ts` |
| `npm run skills:link` | Create `.claude/skills/` links for Claude Code discovery |

### How It Works

The CLI reads `src/meta.ts` as its single source of truth. This file declares:

- **`manual`** — hand-maintained skills authored in this repository
- **`vendors`** — external repositories that maintain their own skills

Every skill directory under `skills/` must be listed in one of these two registries. Running `skills:cleanup` will flag and remove any that aren't.

## Vendor Skills

Vendor skills are sourced from external repositories via git submodules. They are cloned into `vendor/` and synced into `skills/` by the CLI.

### Adding a Vendor Skill

1. Add an entry to `vendors` in `src/meta.ts`:

    ```ts
    export const vendors: Record<string, VendorSkillMeta> = {
        'some-project': {
            official: true,
            source: 'https://github.com/org/some-project',
            skills: {
                'source-skill-name': 'output-skill-name',
            },
        },
    }
    ```

2. Initialize the submodule and sync:

    ```bash
    npm run skills:init
    npm run skills:sync
    ```

3. Register the new skill for local discovery:

    ```bash
    npm run skills:link
    ```

Each synced skill gets a `SYNC.md` with the source git SHA and sync date for tracking freshness.

### Updating Vendor Skills

```bash
npm run skills:check   # See what's outdated
npm run skills:sync    # Pull latest and re-sync
```

## Structure

```text
skills/
├── src/
│   ├── cli.ts                     # CLI entry point
│   ├── meta.ts                    # Skill registry (single source of truth)
│   ├── registry.ts                # Skill name resolution
│   ├── submodule.ts               # Git submodule helpers
│   ├── utils.ts                   # Shared utilities
│   └── commands/                  # Individual command modules
│       ├── init.ts
│       ├── sync.ts
│       ├── check.ts
│       ├── cleanup.ts
│       └── link.ts
├── skills/
│   ├── init-agent-docs/           # Project initialization skill
│   │   ├── SKILL.md
│   │   └── templates/
│   │       ├── CLAUDE.md
│   │       ├── AGENTS.md
│   │       └── .agents/
│   │           ├── structure.md
│   │           ├── architecture.md
│   │           ├── testing.md
│   │           └── conventions.md
│   ├── investigate-pr-comments/   # PR review comment handler
│   │   └── SKILL.md
│   ├── update-agent-docs/         # Template feedback loop skill
│   │   └── SKILL.md
│   └── link-skills/               # Skill discovery linker
│       └── SKILL.md
├── test/
│   ├── vitest.config.ts           # Vitest configuration
│   └── unit/                      # Unit tests (mirrors src/ structure)
├── vendor/                        # Vendored external repos (git submodules)
├── .github/
│   ├── dependabot.yml             # Automated dependency updates
│   └── workflows/ci.yml           # CI pipeline (lint, test, validate)
├── package.json
├── tsconfig.json
├── eslint.config.js
└── README.md
```

## Adding New Skills

### Manual Skills

1. Create a directory under `skills/` matching the skill name
2. Add a `SKILL.md` with YAML frontmatter (`name`, `description`) and instructions
3. Add the skill name to the `manual` array in `src/meta.ts`
4. Run `npm run skills:link` to register with Claude Code
5. Update this README's skill table

### Vendored Skills

See [Vendor Skills](#vendor-skills) above.

### References Pattern

For skills that grow large, use a `references/` subdirectory with one markdown file per concept:

```text
skills/my-skill/
├── SKILL.md                # Index listing all references
└── references/
    ├── core-syntax.md      # One concept per file
    ├── core-config.md
    └── features-auth.md
```

Prefix reference files with their category (`core-`, `features-`, `best-practices-`, `advanced-`) to keep things organized.

## License

Made with 💚

Published under [Apache 2.0 License](./LICENSE).
