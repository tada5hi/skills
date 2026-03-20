<!-- NOTE: Keep this file and all corresponding files in the .agents directory updated as the project evolves. When adding new skills, changing templates, or updating conventions, update the relevant sections. -->

# tada5hi/skills — Agent Guide

A curated collection of reusable Agent Skills following the [Agent Skills](https://agentskills.io) open standard. Skills provide structured, template-driven documentation scaffolding for AI coding agents (Claude Code, Cursor, VS Code Copilot, Gemini CLI, Goose, Roo Code, etc.).

## Quick Reference

```bash
# Setup
npm install

# Lint
npm run lint

# Lint with auto-fix
npm run lint:fix

# Skills CLI
npm run skills            # Show available commands
npm run skills:init       # Add vendor submodules from meta.ts
npm run skills:sync       # Pull latest vendor changes
npm run skills:check      # Check for upstream updates
npm run skills:cleanup    # Remove stale submodules/skills
npm run skills:link       # Link skills for Claude Code discovery
```

- **Node.js**: >= 22.0.0
- **Package manager**: npm
- **Skill registry**: `src/meta.ts` (single source of truth for all skills)

## Skills

Each skill is a self-contained directory under `skills/` with a `SKILL.md` definition and optional `templates/` or `references/` directory. All skills must be registered in `src/meta.ts`.

| Skill | Type | Description |
|-------|------|-------------|
| [init-agent-docs](skills/init-agent-docs/) | Manual | Initialize a project with structured AI agent documentation |
| [investigate-pr-comments](skills/investigate-pr-comments/) | Manual | Fetch PR review comments, investigate against codebase, and fix real issues |
| [link-skills](skills/link-skills/) | Manual | Link skills into `.claude/skills/` for Claude Code discovery |
| [update-agent-docs](skills/update-agent-docs/) | Manual | Propose template improvements back to this repository via PR |
| [grill-me](skills/grill-me/) | Vendor | Relentlessly interview users about plans until decision trees are resolved |
| [improve-codebase-architecture](skills/improve-codebase-architecture/) | Vendor | Explore a codebase for architectural improvement opportunities |
| [prd-to-issues](skills/prd-to-issues/) | Vendor | Break PRDs into independently-grabbable GitHub issues |
| [prd-to-plan](skills/prd-to-plan/) | Vendor | Convert PRDs into multi-phase implementation plans |
| [request-refactor-plan](skills/request-refactor-plan/) | Vendor | Create detailed refactor plans with tiny commits via user interview |
| [tdd](skills/tdd/) | Vendor | Test-driven development with red-green-refactor loops |
| [triage-issue](skills/triage-issue/) | Vendor | Investigate bugs, identify root causes, and file issues with fix plans |
| [write-a-prd](skills/write-a-prd/) | Vendor | Create a PRD through interactive interview and codebase exploration |

## Detailed Guides

- **[Project Structure](.agents/structure.md)** — Directory layout, skill anatomy, module responsibilities, and skill types
- **[Conventions](.agents/conventions.md)** — Code style, tooling, commit conventions, and workflow rules
