---
name: init-agent-docs
description: Initialize a project with AI agent documentation (CLAUDE.md, AGENTS.md, .agents/*.md). Use when the user asks to "init agent docs", "create Claude docs", "set up for AI coding", or when setting up a new repository for AI-assisted development.
license: Apache-2.0
compatibility: Requires git repository with package.json or similar project manifest.
metadata:
  author: tada5hi
  version: "2026.03.18"
allowed-tools: Read Write Bash(ls:*) Bash(mkdir:*) Glob Grep
---

# init-agent-docs

> Initialize a project with structured documentation for AI coding agents (Claude Code, Cursor, Copilot, etc.).

## Overview

This skill scaffolds agent-friendly documentation for any project. It creates:

- **`CLAUDE.md`** — Manifest file that references all agent guides (loaded by Claude Code on startup)
- **`AGENTS.md`** — Main entry point with project overview, setup commands, and links to detailed guides
- **`.agents/*.md`** — Detailed guides covering structure, architecture, testing, and conventions

## When to Use

- Setting up a new repository for AI-assisted development
- Adding agent documentation to an existing project
- When the user asks to "init agent docs", "create Claude docs", "set up for AI coding", or similar

## Process

1. **Analyze the target project** — Read `package.json` (or equivalent), explore the directory structure, understand the tech stack, build system, test setup, and architecture. For monorepos, identify all apps and packages plus their dependency relationships.
2. **Determine which guides apply** — Not every project needs all guides. Select from the available templates based on what the project actually has:
   - `structure.md` — Always applicable (every project has a file layout)
   - `architecture.md` — Include when the project has meaningful design patterns, layered architecture, or notable data flow
   - `testing.md` — Include only if the project has tests
   - `conventions.md` — Include when there are linting, commit conventions, validation patterns, CI/CD, or build tooling
3. **Adapt templates for project type** — Templates contain sections for both monorepos and single packages. Use only the relevant sections:
   - **Monorepos**: Use Applications/Packages tables, Dependency Layers, workspace-specific test commands
   - **Single packages**: Use Directory Layout, Module Responsibilities, Key Dependencies
4. **Generate from templates** — Use the templates in [templates/](templates/) as starting points. Replace all `{{placeholders}}` with project-specific information. Remove HTML comments and unused sections. Add project-specific sections as needed (e.g., design patterns with code examples).
5. **Write the files** — Create `CLAUDE.md`, `AGENTS.md`, and the selected `.agents/*.md` files in the project root.

## Available Templates

| Template                                                    | Purpose                           | When to include              |
|-------------------------------------------------------------|-----------------------------------|------------------------------|
| [CLAUDE.md](templates/CLAUDE.md)                            | Manifest/index file               | Always                       |
| [AGENTS.md](templates/AGENTS.md)                            | Main agent guide                  | Always                       |
| [.agents/structure.md](templates/.agents/structure.md)      | Project structure & modules       | Always                       |
| [.agents/architecture.md](templates/.agents/architecture.md)| Design patterns & data flow       | When architecture is notable |
| [.agents/testing.md](templates/.agents/testing.md)          | Test setup & conventions          | When tests exist             |
| [.agents/conventions.md](templates/.agents/conventions.md)  | Code style, tooling, CI/CD        | When conventions are defined |

## Guidelines

- **Do not copy templates verbatim.** Every section must be filled with real, project-specific content. Empty or placeholder sections are worse than no documentation.
- **Be concise.** Agents work best with dense, factual content. Avoid filler text.
- **Use tables and code blocks** for structured information — they parse well for agents.
- **Keep AGENTS.md under 200 lines.** Move details into `.agents/*.md` files.
- **Omit guides that don't apply.** A project without tests should not have a testing.md.
- **Update CLAUDE.md** to only reference the guides that were actually created (uncomment the relevant `@` lines).
- **Include code examples in architecture.md** when documenting design patterns. Show actual interfaces and implementations so agents can follow the patterns when writing new code.
- **Document dependency layers for monorepos.** This is critical for agents to understand build order and impact of changes.
- **Add the NOTE comment** at the top of AGENTS.md reminding to keep docs updated as the project evolves.
