---
name: init-agent-docs
description: Initialize a project with AI agent documentation (CLAUDE.md, AGENTS.md, .agents/*.md). Use when the user asks to "init agent docs", "create Claude docs", "set up for AI coding", or when setting up a new repository for AI-assisted development.
license: Apache-2.0
compatibility: Requires git repository with package.json or similar project manifest.
metadata:
  author: tada5hi
  version: "2026.11.07"
allowed-tools: Read Write Bash(ls:*) Bash(mkdir:*) Glob Grep
---

# init-agent-docs

> Initialize a project with structured documentation for AI coding agents (Claude Code, Cursor, Copilot, etc.).

## Overview

This skill scaffolds agent-friendly documentation for any project. It creates:

- **`CLAUDE.md`** — Manifest file that references all agent guides (loaded by Claude Code on startup)
- **`AGENTS.md`** — Main entry point with project overview, setup commands, and links to detailed guides
- **`.agents/*.md`** — Detailed guides covering structure, architecture, testing, and conventions
- **`.agents/topics/`** *(optional)*: Per-subsystem detail read on demand, never imported by `CLAUDE.md`; only create when a subsystem outgrows a few paragraphs
- **Size and history checks**: `@tada5hi/eslint-config` 3.3.1 or later runs them by default (`agentDocs`); a project without that config installs **`scripts/lint-agent-docs.mjs`** + **`.agents/budget.json`** *(fallback)*, a ratchet that keeps the always-loaded guides from growing back
- **`.agents/references/`** *(optional)* — One Markdown file per external project the codebase cross-references; only create when `conventions.md` keeps its References section
- **`.agents/plans/`** *(optional)* — Phased plan files for ongoing modernization or migration work; only create when `AGENTS.md` keeps its Plans section

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
5. **Write the files** — Create `CLAUDE.md`, `AGENTS.md`, and the selected `.agents/*.md` files in the project root. If `conventions.md` keeps its References section, create `.agents/references/` (and seed one file per external project). If `AGENTS.md` keeps its Plans section, create `.agents/plans/` (and add the phased plan files it links to).
6. **Enforce the size rules**, once every guide is written:
   - **The project lints with `@tada5hi/eslint-config`** (bump it to `^3.3.1` if older): the `agentDocs` checks are on by default. `CLAUDE.md`, `AGENTS.md`, `.agents/*.md` and `.agents/topics/**/*.md` are linted as Markdown for size (40000 bytes per file), history phrases outside code, and the total `CLAUDE.md` loads through its imports (60000 bytes). Plans (`.agents/plans/`) are ignored; `agentDocs.ignores` replaces that list. Make sure the lint script reaches those files: `eslint .` does, a script listing directories needs `CLAUDE.md AGENTS.md .agents` added. Raise `agentDocs: { maxBytes, importMaxBytes }` in `eslint.config.js` only when existing docs exceed the defaults, set just above their current size, and lower them as the docs shrink.
   - **Otherwise**, install the ratchet: copy [templates/scripts/lint-agent-docs.mjs](templates/scripts/lint-agent-docs.mjs) to `scripts/`, add a `lint:agent-docs` script (`node scripts/lint-agent-docs.mjs`), run it once with `--init` to write `.agents/budget.json` (current sizes plus about 5% headroom), and add two CI steps to the lint job: `npm run lint:agent-docs` on every run, and on pull requests only `git fetch --no-tags --depth=1 origin "$BASE_REF"` followed by `npm run lint:agent-docs -- --base FETCH_HEAD`, which fails when a budget rises against the base branch. Without that second step a change can raise a budget together with the file and still pass.
   - Fill `{{lint_agent_docs_command}}` in AGENTS.md with the command that runs the checks (`npm run lint` or `npm run lint:agent-docs`), and keep the matching bullet.

## Available Templates

| Template                                                    | Purpose                           | When to include              |
|-------------------------------------------------------------|-----------------------------------|------------------------------|
| [CLAUDE.md](templates/CLAUDE.md)                            | Manifest/index file               | Always                       |
| [AGENTS.md](templates/AGENTS.md)                            | Main agent guide                  | Always                       |
| [.agents/structure.md](templates/.agents/structure.md)      | Project structure & modules       | Always                       |
| [.agents/architecture.md](templates/.agents/architecture.md)| Design patterns & data flow       | When architecture is notable |
| [.agents/testing.md](templates/.agents/testing.md)          | Test setup & conventions          | When tests exist             |
| [.agents/conventions.md](templates/.agents/conventions.md)  | Code style, tooling, CI/CD        | When conventions are defined |
| [scripts/lint-agent-docs.mjs](templates/scripts/lint-agent-docs.mjs) | Size and history-phrase ratchet | Only without `@tada5hi/eslint-config` 3.3.1+ |

## Guidelines

- **Do not copy templates verbatim.** Every section must be filled with real, project-specific content. Empty or placeholder sections are worse than no documentation.
- **Be concise.** Agents work best with dense, factual content. Avoid filler text.
- **Use tables and code blocks** for structured information — they parse well for agents.
- **Keep AGENTS.md under 200 lines.** Move details into `.agents/*.md` files.
- **Omit guides that don't apply.** A project without tests should not have a testing.md.
- **Update CLAUDE.md** to only reference the guides that were actually created (uncomment the relevant `@` lines).
- **Include code examples in architecture.md** when documenting design patterns. Show actual interfaces and implementations so agents can follow the patterns when writing new code.
- **Document dependency layers for monorepos.** This is critical for agents to understand build order and impact of changes.
- **Identify generated-data sources of truth** in structure.md: the upstream input, generator and regeneration command, plus which source to edit instead of the generated output. Include this only when the project has generated files or datasets.
- **Keep the "Writing agent docs" section in AGENTS.md.** It is the rule that stops the guides from growing back: keep existing commands, paths and facts accurate; add content only for an invariant or cross-cutting rule, edit the existing line, and route everything else (defect stories, spec lists, mechanism walkthroughs, release notes) elsewhere. Never add a generic "keep these docs updated as the project evolves" note: it turns every finished task into a new paragraph, and append-only docs grow without bound (one project went from 86 KB to 715 KB in four months).
- **Budget the always-loaded set.** Everything `CLAUDE.md` imports is paid on every session. Keep it under about 60 KB in total. Preserve cross-cutting invariants and extension/error contracts in the core guide; split detailed subsystem contracts and examples into focused `.agents/topics/<name>.md` files with descriptive links. Check the moved facts against the source and reconcile contradictions. Do not replace a substantial guide with a tiny summary or move the whole file into unchecked references merely to pass a size check. Keep core imports aligned with the stated loading policy.
- **Document per-application layouts for monorepos** in structure.md. Show the internal directory tree of each service/app, especially when they follow a specific architecture pattern (hexagonal, MVC, etc.).
- **Prefer fakes over mocks** in testing.md when the project uses hexagonal architecture or dependency inversion. Guide agents toward fake implementations of port interfaces rather than `vi.fn()`/`vi.mock()`.
- **Check default rules against the code before keeping them.** The conventions and testing templates ship rules in plain text with a "keep only when…" comment: the module-folder layout, interface/type naming, the file header, house libraries and the test-kit package. Keep each one only when its condition holds, replace it with the rule the code actually follows, or remove it. Never introduce a convention the project doesn't follow, except the module layout in a new project.
- **Separate runtime and contributor requirements.** Fill `{{node_version}}` from application/public-package `engines.node`; a private root does not establish every workspace's consumer support. Check `devEngines.runtime`, CI, `.nvmrc` and tool engine requirements. Include optional `{{development_node_version}}` when tooling needs a different range, and do not raise published runtime engines just to install development tools. State each fact once in the Quick Reference; other guides and CI descriptions refer there.
- **Document every dependency pin with its exit condition** in the Dependency Pins table of conventions.md: `overrides` / `resolutions` entries and packages held below their latest major. Without the condition, a later update either keeps a dead workaround or breaks on the held package.
- **Copy the file header verbatim** from an existing source file; never write one from memory.
- **Include a References section** in conventions.md when the project depends on external projects that agents may need to cross-reference. Use `.agents/references/` to build cumulative code mappings.
- **Add Plans and Commits sections** to AGENTS.md when the project has ongoing modernization work or commit rules that override default agent behavior.
