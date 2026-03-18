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
```

- **Node.js**: >= 22.0.0
- **Package manager**: npm

## Skills

Each skill is a self-contained directory under `skills/` with a `SKILL.md` definition and optional `templates/` directory.

| Skill | Description |
|-------|-------------|
| [init-agent-docs](skills/init-agent-docs/) | Initialize a project with structured AI agent documentation |
| [update-agent-docs](skills/update-agent-docs/) | Propose template improvements back to this repository via PR |

## Detailed Guides

- **[Project Structure](.agents/structure.md)** — Directory layout, skill anatomy, and module responsibilities
- **[Conventions](.agents/conventions.md)** — Code style, tooling, commit conventions, and workflow rules
