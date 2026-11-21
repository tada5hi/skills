---
name: agent-docs-init
description: Initialize a project with AI agent documentation (CLAUDE.md, AGENTS.md, .agents/*.md). Use when the user asks to "init agent docs", "create Claude docs", "set up for AI coding", or when setting up a new repository for AI-assisted development.
license: Apache-2.0
compatibility: Requires git repository with package.json or similar project manifest.
metadata:
  author: tada5hi
  version: "2026.11.21"
allowed-tools: Read Write Edit Bash(ls:*) Bash(mkdir:*) Bash(cp:*) Bash(node:*) Bash(npm:*) Glob Grep
---

# agent-docs-init

> Scaffold structured documentation for AI coding agents (Claude Code, Cursor, Copilot, etc.).

## Output

- **`CLAUDE.md`**: manifest that imports the guides (loaded by Claude Code on startup).
- **`AGENTS.md`**: project overview, setup commands, links to the guides.
- **`.agents/*.md`**: structure, architecture, testing and conventions guides.
- **`.agents/topics/`** *(optional)*: per-subsystem detail read on demand, never imported by `CLAUDE.md`; create only when a subsystem outgrows a few paragraphs.
- **`.agents/references/`** *(optional)*: one file per external project the codebase cross-references; only when `conventions.md` keeps its References section.
- **`.agents/plans/`** *(optional)*: phased plan files; only when `AGENTS.md` keeps its Plans section.
- **Size and history checks**: the `agentDocs` checks of `@tada5hi/eslint-config` 3.3.1+, or the fallback ratchet `scripts/lint-agent-docs.mjs` + `.agents/budget.json`.

## Process

1. **Analyze the project.** Read `package.json` (or equivalent) and explore the layout, tech stack, build system, tests and architecture. For monorepos, list every app and package and their dependencies.
2. **Pick the guides** (see the table below): `structure.md` always; `architecture.md` for notable design patterns, layering or data flow; `testing.md` only when tests exist; `conventions.md` for linting, commit conventions, validation patterns, CI/CD or build tooling.
3. **Pick the sections.** Monorepos: Applications/Packages tables, Dependency Layers, workspace test commands. Single packages: Directory Layout, Module Responsibilities, Key Dependencies.
4. **Fill the [templates](templates/).** Replace every `{{placeholder}}`, remove HTML comments and unused sections, add project-specific sections where needed.
5. **Write the files** in the project root: `CLAUDE.md` (uncomment only the `@` imports of guides that exist), `AGENTS.md` and the selected `.agents/*.md`. Create `.agents/references/` (one file per external project) and `.agents/plans/` (the plan files it links) only when their sections stay.
6. **Enforce the size rules** once every guide is written. Choose one path:
   - **Project lints with `@tada5hi/eslint-config`**: bump it to `^3.3.1` if older; its `agentDocs` checks are on by default. They lint `CLAUDE.md`, `AGENTS.md`, `.agents/*.md` and `.agents/topics/**/*.md` for size (40000 bytes per file), history phrases outside code, and the total `CLAUDE.md` loads through its imports (60000 bytes); `.agents/plans/` is ignored (`agentDocs.ignores` replaces that list). The lint script must reach the files: `eslint .` does, a script listing directories needs `CLAUDE.md AGENTS.md .agents` added. Set `agentDocs: { maxBytes, importMaxBytes }` in `eslint.config.js` only when existing docs exceed the defaults, just above their current size.
   - **Otherwise, the ratchet**: copy [templates/scripts/lint-agent-docs.mjs](templates/scripts/lint-agent-docs.mjs) to `scripts/`, add the script `"lint:agent-docs": "node scripts/lint-agent-docs.mjs"`, and run `node scripts/lint-agent-docs.mjs --init` once to write `.agents/budget.json` (current sizes plus about 5% headroom). Add two steps to the CI lint job: `npm run lint:agent-docs` on every run, and on pull requests only `git fetch --no-tags --depth=1 origin "$BASE_REF"` then `npm run lint:agent-docs -- --base FETCH_HEAD`. The second step fails when a budget rose against the base branch; without it a change can raise a budget together with the file.
   - Either way, fill `{{lint_agent_docs_command}}` in `AGENTS.md` (`npm run lint` or `npm run lint:agent-docs`) and keep only the matching "enforces it" bullet.

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

- **Never copy templates verbatim.** Every section holds real, project-specific content; an empty or placeholder section is worse than none.
- **Be dense.** Tables and code blocks over prose; no filler. Keep `AGENTS.md` under 200 lines.
- **Keep the "Writing agent docs" section in `AGENTS.md`.** It stops the guides from growing back: keep commands, paths and facts accurate; add content only for an invariant or cross-cutting rule; route defect stories, spec lists, mechanism walkthroughs and release notes elsewhere. Never add a generic "keep these docs updated as the project evolves" note: it turns every finished task into a new paragraph.
- **Budget the always-loaded set.** Everything `CLAUDE.md` imports loads every session; keep it under about 60 KB. Keep cross-cutting invariants and extension/error contracts in the core; split detailed subsystem contracts and examples into `.agents/topics/<name>.md` with descriptive links, checking moved facts against the source. Do not shrink a substantial guide to a tiny summary, or move it whole into unchecked references, just to pass a size check. Keep core imports aligned with the stated loading policy.
- **architecture.md shows code.** Document design patterns with the actual interfaces and implementations so agents can follow them.
- **Monorepos:** document dependency layers (build order, impact of changes) and, in structure.md, each app's internal directory tree, especially when it follows a pattern (hexagonal, MVC, etc.).
- **Generated data:** when the project has generated files or datasets, name in structure.md the upstream input, the generator, the regeneration command and which source to edit instead of the output.
- **Prefer fakes over mocks** in testing.md when the project uses hexagonal architecture or dependency inversion: fake implementations of port interfaces rather than `vi.fn()`/`vi.mock()`.
- **Check default rules against the code.** The conventions and testing templates ship rules with a "keep only when…" comment (module-folder layout, interface/type naming, file header, house libraries, test-kit package). Keep each only when its condition holds, replace it with the rule the code follows, or remove it. Never introduce a convention the project doesn't follow, except the module layout in a new project.
- **Copy the file header verbatim** from an existing source file; never write one from memory.
- **Separate runtime and contributor requirements.** Fill `{{node_version}}` from application/public-package `engines.node`; a private root does not establish every workspace's consumer support. Check `devEngines.runtime`, CI, `.nvmrc` and tool engine requirements, and add `{{development_node_version}}` when tooling needs a different range. Do not raise published runtime engines just to install development tools. State each fact once in the Quick Reference; other guides and CI descriptions refer there.
- **Document every dependency pin with its exit condition** in conventions.md's Dependency Pins table: `overrides`/`resolutions` entries and packages held below their latest major.
- **References section** in conventions.md when agents may need to cross-reference external projects; build cumulative code mappings in `.agents/references/`.
- **Plans and Commits sections** in AGENTS.md when the project has ongoing modernization work or commit rules that override default agent behavior.
