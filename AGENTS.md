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
| [update-agent-docs](skills/update-agent-docs/) | Manual | Propose template improvements back to this repository via PR |
| [link-skills](skills/link-skills/) | Manual | Link skills into `.claude/skills/` for Claude Code discovery |

## Detailed Guides

- **[Project Structure](.agents/structure.md)** — Directory layout, skill anatomy, module responsibilities, and skill types
- **[Conventions](.agents/conventions.md)** — Code style, tooling, commit conventions, and workflow rules
