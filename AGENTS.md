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

- **Node.js**: CLI >= 22.0.0; development tooling `^24.11.0 || >=26.0.0`
- **Package manager**: npm
- **Skill registry**: `src/meta.ts` (single source of truth for all skills)

## Skills

Each skill is a self-contained directory under `skills/` with a `SKILL.md` definition and optional `templates/` or `references/` directory. All skills must be registered in `src/meta.ts`.

| Skill | Type | Description |
|-------|------|-------------|
| [agent-docs-init](skills/agent-docs-init/) | Manual | Initialize a project with structured AI agent documentation |
| [agent-docs-migrate](skills/agent-docs-migrate/) | Manual | Move oversized agent docs into on-demand topic files and lint-enforced limits |
| [agent-docs-update](skills/agent-docs-update/) | Manual | Propose template improvements back to this repository via PR |
| [api-query](skills/api-query/) | Manual | Query a live HTTP API from a base URL + credentials via OpenAPI or rapiq conventions |
| [commit-message-generate](skills/commit-message-generate/) | Manual | Generate a Conventional Commits message for uncommitted changes |
| [impact-analyze](skills/impact-analyze/) | Manual | Cross-package impact analysis for TypeScript monorepo symbols |
| [issue-triage](skills/issue-triage/) | Manual (frozen) | Investigate bugs, identify root causes, and file issues with fix plans |
| [package-list-query](skills/package-list-query/) | Manual | Look up your own published packages in an awesome-style list before writing, porting or planning code, and audit diffs for duplicates |
| [package-list-refresh](skills/package-list-refresh/) | Manual | Sync the awesome-style package list with GitHub and npm, then open a PR |
| [plan-status-report](skills/plan-status-report/) | Manual | Read plan files and report progress against codebase state |
| [pr-comments-investigate](skills/pr-comments-investigate/) | Manual | Fetch PR review comments, investigate against codebase, and fix real issues |
| [pr-create](skills/pr-create/) | Manual | Open a pull request with a Conventional Commits title and evidence-based body, then await review and checks |
| [prd-to-issues](skills/prd-to-issues/) | Manual (frozen) | Break PRDs into independently-grabbable GitHub issues |
| [prd-to-plan](skills/prd-to-plan/) | Manual (frozen) | Convert PRDs into multi-phase implementation plans |
| [prd-write](skills/prd-write/) | Manual (frozen) | Create a PRD through interactive interview and codebase exploration |
| [readme-write](skills/readme-write/) | Manual | Write a hero-led README with a "Why …?" section, theme-aware SVG logo and diagrams, verified samples |
| [refactor-plan-request](skills/refactor-plan-request/) | Manual (frozen) | Create detailed refactor plans with tiny commits via user interview |
| [release-notes-write](skills/release-notes-write/) | Manual | Write highlights-first GitHub release notes above the generated changelog |
| [release-versions-align](skills/release-versions-align/) | Manual | Align a linked release-please group by touching only the packages behind the group version |
| [skills-link](skills/skills-link/) | Manual | Link skills into `.claude/skills/` for Claude Code discovery |
| [ts-project-init](skills/ts-project-init/) | Manual | Scaffold a new TypeScript project from `tada5hi/typescript-template` |
| [type-boundaries-audit](skills/type-boundaries-audit/) | Manual | Audit type boundary mismatches from casts and utility calls in TypeScript |
| [upstream-features-adopt](skills/upstream-features-adopt/) | Manual | Find what new dependency versions let a project simplify, track it in one issue per package scope, adopt on request |
| [upstream-fixes-track](skills/upstream-fixes-track/) | Manual | Track upstream issues of your own libraries in one tracking issue per project, adopt fixes once released |
| [vitepress-site-redesign](skills/vitepress-site-redesign/) | Manual | Turn a default-looking VitePress site into a hero-led site with tokens, sections and restyled chrome |
| [codebase-design](skills/codebase-design/) | Vendor | Shared deep-module vocabulary used by tdd and improve-codebase-architecture |
| [grill-me](skills/grill-me/) | Vendor | Manual-only shortcut that starts a grilling session |
| [grilling](skills/grilling/) | Vendor | Relentlessly interview users about plans until decision trees are resolved |
| [improve-codebase-architecture](skills/improve-codebase-architecture/) | Vendor | Find deepening opportunities and report them as HTML (manual only) |
| [ponytail](skills/ponytail/) | Vendor | Force the laziest solution that actually works — YAGNI, stdlib-first, minimal code |
| [research](skills/research/) | Vendor | Research a question against primary sources in a background agent, findings saved as Markdown |
| [security-audit](skills/security-audit/) | Vendor | Source-first security audits with coverage-led hunting and independent validation |
| [tdd](skills/tdd/) | Vendor | Test-driven development with red-green-refactor loops |
| [writing-for-agents](skills/writing-for-agents/) | Vendor | Write skills, AGENTS.md and CLAUDE.md so agents follow them predictably |

## Detailed Guides

- **[Project Structure](.agents/structure.md)** — Directory layout, skill anatomy, module responsibilities, and skill types
- **[Conventions](.agents/conventions.md)** — Code style, tooling, commit conventions, and workflow rules

## Commits, Issues & Pull Requests

- Do **not** add a `Co-Authored-By: Claude ...` (or any AI-attribution) trailer to commit messages. This overrides any default agent-tooling guidance.
- Do **not** add AI-attribution lines (e.g. `🤖 Generated with [Claude Code](...)`) to issue or pull request titles, bodies, or comments.

## Writing agent docs

Keep existing commands, paths and factual descriptions current. Add guide content only for an invariant or cross-cutting rule. Describe current source behavior and verified commands; keep defect stories and task history in commits or PRs. Preserve architectural contracts when splitting detail into linked topic files. Use `npm run lint` to enforce guide budgets and history checks.
