# Project Structure

## Directory Layout

```
skills/
├── src/
│   ├── cli.ts                         # CLI entry point (command dispatch)
│   ├── meta.ts                        # Skill registry (manual + vendor declarations)
│   ├── registry.ts                    # Skill name resolution from meta.ts
│   ├── submodule.ts                   # Git submodule helpers
│   ├── utils.ts                       # Shared helpers (exec, logging, paths)
│   └── commands/
│       ├── index.ts                   # Barrel export
│       ├── init.ts                    # Add vendor submodules
│       ├── sync.ts                    # Pull + copy vendor skills
│       ├── check.ts                   # Check for upstream updates
│       ├── cleanup.ts                 # Remove stale entries
│       └── link.ts                    # Create .claude/skills/ links
├── skills/                            # Skill definitions (the core content)
│   ├── init-agent-docs/               # Skill: scaffold agent documentation
│   │   ├── SKILL.md                   # Skill definition & instructions
│   │   └── templates/                 # Template files for generation
│   │       ├── CLAUDE.md              # Root manifest template
│   │       ├── AGENTS.md              # Main agent guide template
│   │       └── .agents/
│   │           ├── structure.md       # Project structure template
│   │           ├── architecture.md    # Architecture patterns template
│   │           ├── testing.md         # Testing setup template
│   │           └── conventions.md     # Code conventions template
│   ├── update-agent-docs/             # Skill: propose template improvements via PR
│   │   └── SKILL.md                   # Skill definition & instructions
│   └── link-skills/                   # Skill: link skills/ into .claude/skills/ for discovery
│       └── SKILL.md                   # Skill definition & instructions
├── test/
│   ├── vitest.config.ts               # Vitest configuration
│   └── unit/                          # Unit tests (mirrors src/ structure)
├── vendor/                            # Vendored external repos (git submodules)
├── .github/
│   ├── dependabot.yml                 # Automated dependency updates
│   └── workflows/ci.yml              # CI pipeline (lint, test, validate)
├── .editorconfig                      # Editor settings (4-space indent, LF, UTF-8)
├── eslint.config.js                   # ESLint flat config
├── package.json                       # Root package metadata & scripts
├── tsconfig.json                      # TypeScript configuration
├── LICENSE                            # Apache 2.0
└── README.md                          # Project documentation
```

## Skill Anatomy

Every skill lives under `skills/<skill-id>/` and contains:

| File | Required | Purpose |
|------|----------|---------|
| `SKILL.md` | Yes | YAML frontmatter (name, description, version, allowed-tools) + markdown instructions |
| `templates/` | No | Template files with `{{placeholder}}` variables for generation |
| `references/` | No | Individual concept files for large skills (one `.md` per concept) |
| `SYNC.md` | No | Auto-generated tracking metadata for vendor-synced skills |

### SKILL.md Frontmatter Format

```yaml
---
name: <skill-id>              # Must match directory name. Use {verb}-{noun} pattern (e.g., init-agent-docs).
description: <description>    # What it does + when to use it. Front-load trigger phrases.
license: Apache-2.0
compatibility: <requirements>
metadata:
  author: tada5hi
  version: "YYYY.MM.DD"       # Bump to today's date on every change.
allowed-tools: <tool-list>    # Space-delimited list of pre-approved tools.
---

# <skill-id>                  <!-- H1 must exactly match the name field -->
```

## Skill Types

| Type | Location | Management |
|------|----------|------------|
| **Manual** | `skills/<name>/` | Hand-maintained, listed in `meta.ts` `manual` array |
| **Vendor** | Synced from `vendor/<repo>/skills/` | Managed via CLI, listed in `meta.ts` `vendors` object |

## Module Responsibilities

| Module | Purpose |
|--------|---------|
| `src/meta.ts` | Single source of truth declaring all skills (manual + vendor) |
| `src/cli.ts` | CLI entry point — dispatches to command modules |
| `src/commands/*.ts` | Individual command implementations (init, sync, check, cleanup, link) |
| `src/registry.ts` | Resolves expected skill names from meta.ts |
| `src/submodule.ts` | Git submodule operations (add, remove, query) |
| `src/utils.ts` | Shared helpers: shell exec, logging, path constants |
| `skills/init-agent-docs/SKILL.md` | Instructions for agents to analyze a project and generate tailored documentation |
| `skills/init-agent-docs/templates/` | Markdown templates with placeholders for CLAUDE.md, AGENTS.md, and .agents/ guides |
| `skills/update-agent-docs/SKILL.md` | Instructions for agents to compare project docs against templates and propose improvements via PR |
| `skills/link-skills/SKILL.md` | Instructions for agents to link `skills/` into `.claude/skills/` for Claude Code discovery |

## Separation of Concerns

- **Skill registry** (`meta.ts`) → Declares what skills exist and where they come from
- **CLI manager** (`src/cli.ts`) → Automates submodule and sync workflows
- **Skill definitions** (`SKILL.md`) → Instructions and metadata for agent consumption
- **Templates** (`templates/`) → Reusable scaffolding with `{{placeholders}}` that agents fill in per-project
- **References** (`references/`) → Individual concept files for large skills
- **Vendor sources** (`vendor/`) → Git submodules of external skill repositories
