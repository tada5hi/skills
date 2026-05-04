<!-- NOTE: Keep this file and all corresponding files in the .agents directory updated as the project evolves. When making architectural changes, adding new patterns, or discovering important conventions, update the relevant sections. -->

# {{project_name}} — Agent Guide

{{project_description_paragraph}}

## Quick Reference

```bash
# Setup
{{setup_command}}

# Development
{{build_command}}
{{test_command}}
{{lint_command}}
```

- **Node.js**: {{node_version}}
- **Package manager**: {{package_manager}}
- **Build orchestration**: {{build_orchestrator}}

<!-- For monorepos, add a workspace layout note like: "Apps are runnable applications in apps/, packages are shared libraries in packages/." -->

### CLI Entry Points

<!-- Remove this section if the project does not have a CLI. For monorepos with multiple binaries, list them all. -->

| Binary           | Source              |
|------------------|---------------------|
| `{{cli_binary}}` | {{cli_source_path}} |

## Documentation

<!-- Remove this section if the project has no documentation site. Include the dev command, build command, and a note about keeping docs in sync with code changes. -->

The `{{docs_directory}}` directory contains the project documentation site. When making changes that affect user-facing behavior, configuration, APIs, or service architecture, **update the corresponding docs pages**.

## Detailed Guides

<!-- Customize each description below to reflect the project's actual content. Specific descriptions (e.g. "Orchestrator pattern, topological sort, and DI integration") are more useful to agents than generic ones (e.g. "Design patterns"). -->

- **[Project Structure](.agents/structure.md)** — Source layout, modules, and dependency layers
<!-- Include only guides that were created: -->
<!-- - **[Architecture](.agents/architecture.md)** — Design patterns, data flow, and key abstractions -->
<!-- - **[Testing](.agents/testing.md)** — Test runner, conventions, and infrastructure -->
<!-- - **[Conventions](.agents/conventions.md)** — Best practices, tooling, validation, and error handling -->

## Plans

<!-- Remove this section if not tracking ongoing work. Use it to document modernization efforts, migration plans, or phased refactoring work with status. Link to detailed plan files in .agents/plans/ if needed. -->

<!-- Example: -->
<!-- 1. ~~Tooling Modernization~~ — Complete (#123) -->
<!-- 2. [Hexagonal Migration](.agents/plans/002-hexagonal.md) — In progress -->

## Commits

<!-- Remove this section if there are no project-specific commit rules beyond the convention in conventions.md. Use this for rules that override default agent/tooling behavior. -->

<!-- Example: -->
<!-- - Do **not** add a `Co-Authored-By: Claude ...` trailer to commit messages. -->
