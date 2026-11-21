# Conventions

## Tooling

| Tool | Purpose |
|------|---------|
| ESLint 10 | Linting for JS/TS files |
| lint-staged | Pre-commit linting via `eslint --fix` on staged `.js`, `.ts`, `.mjs`, `.mts` files |
| EditorConfig | Consistent editor settings across contributors |

## Workflow

- After making changes, run `npm run lint` to check for issues.
- When adding a new manual skill: create `skills/<skill-id>/SKILL.md` and a `README.md` modelled on `skills/commit-message-generate/README.md`, add the name to the `manual` array in `src/meta.ts`, then run `/skills-link` to register it with Claude Code.
- When adding a vendor skill: add the entry to `vendors` in `src/meta.ts`, then run `npm run skills:init` and `npm run skills:sync`.
- Templates must use `{{placeholder}}` syntax for project-specific values — never hardcode project details.
- Keep templates generic: project-specific content should always be expressed as placeholders with guiding HTML comments.

## Code Style

- **Module format**: ESM (`"type": "module"` in package.json)
- **Indentation**: 4 spaces
- **Line endings**: LF
- **Charset**: UTF-8
- **Trailing whitespace**: Trimmed (except in `.md` files)
- **Final newline**: Always inserted
- **Linting**: ESLint 10 (flat config)

## Skill Naming

Skill names follow a **`{noun}(-{subnoun}…)-{verb}`** pattern using lowercase letters and hyphens only, so related skills sort next to each other:

- `agent-docs-init` — noun: agent-docs, verb: init
- `upstream-fixes-track` — noun: upstream, subnoun: fixes, verb: track
- `prd-to-plan` — a conversion is named `{source}-to-{target}`

Rules:
- **No `-skill` suffix.** The directory is already under `skills/` — adding `-skill` is redundant.
- **Directory name = `name` field.** The `name` in SKILL.md frontmatter must exactly match the directory name.
- **H1 title = `name` field.** The `# heading` in SKILL.md must match the `name` field exactly (e.g., `# agent-docs-init`), not Title Case.
- **Vendor skills keep their upstream names.** Their content calls other vendor skills by those names, and a sync overwrites local edits.
- **No leading/trailing/consecutive hyphens.** Only `a-z`, `0-9`, and single `-` separators.
- **Max 64 characters** (agentskills.io spec constraint).

When skills share a noun (e.g., `agent-docs`, `package-list`, `upstream`, `pr`, `prd`), they form a logical group distinguished by their verb (`-init`, `-update`, `-migrate`, etc.).

## File Organization

- Each skill is a directory under `skills/` named by its skill ID.
- `SKILL.md` is the entry point for every skill — it must always exist.
- Template files live in `templates/` subdirectories, mirroring the output file structure.

## Commit Convention

Commits follow **Conventional Commits**:

```
<type>: <description>

Examples:
feat: add new skill for API documentation
fix: correct placeholder in architecture template
chore: update dependencies
```

## Skill Versioning

- Skill versions use date format: `YYYY.MM.DD`
- When modifying a skill, bump the `metadata.version` field in its `SKILL.md` frontmatter to the current date, and update its `README.md` when triggers, steps or output change.

## Best Practices

- Use **ESM** and modern JavaScript/TypeScript conventions.
- Before adding new code or templates, study existing skills for patterns and naming conventions.
- When writing or editing a `SKILL.md`, `AGENTS.md` or `CLAUDE.md`, follow the `writing-for-agents` skill: descriptions are triggers, and every always-loaded line costs context.
- Keep `AGENTS.md` under 200 lines — move details into `.agents/*.md` files.
- Templates should include HTML comments explaining what to fill in for each placeholder.
- Every template section must serve a purpose — omit sections that don't apply rather than leaving them empty.
