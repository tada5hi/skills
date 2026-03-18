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

<!-- For monorepos, add a note like: "Apps are runnable applications, packages are libraries or utility modules." -->

### CLI Entry Points

<!-- Remove this section if the project does not have a CLI. For monorepos with multiple binaries, list them all. -->

| Binary           | Source              |
|------------------|---------------------|
| `{{cli_binary}}` | {{cli_source_path}} |

## Detailed Guides

- **[Project Structure](.agents/structure.md)** — Source layout, modules, and dependency layers
<!-- Include only guides that were created: -->
<!-- - **[Architecture](.agents/architecture.md)** — Design patterns, data flow, and key abstractions -->
<!-- - **[Testing](.agents/testing.md)** — Test runner, conventions, and infrastructure -->
<!-- - **[Conventions](.agents/conventions.md)** — Best practices, tooling, validation, and error handling -->
