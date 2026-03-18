# Conventions

## Tooling

<!-- List the key tools in the development workflow. -->

| Tool             | Purpose                                           |
|------------------|---------------------------------------------------|
| {{tool_name}}    | {{tool_purpose}}                                  |

## Validation & Error Handling

<!-- Describe the validation framework, where validation runs, and error handling patterns. Remove if the project has no notable validation setup. -->

- **Validation**: {{validation_framework}}
- **Errors**: {{error_handling_approach}}
- **Validation location**: {{where_validation_runs}}

## Workflow

<!-- Rules developers (and agents) should follow when making changes. -->

- After making changes, **always build** the affected package and **run the linter** on all changed files.
- {{additional_workflow_rules}}

## Code Style

<!-- Describe module format, indentation, line endings, linting config. -->

- **Module format**: {{module_format}}
- **Indentation**: {{indentation}}
- **Line endings**: {{line_endings}}
- **Linting**: {{linting_config}}

## File Organization

<!-- Describe where types, constants, utils, and barrel exports live. -->

- Exported **types** (interfaces, type aliases) live in a `types.ts` file in the same directory.
- Barrel `index.ts` files re-export from `types.ts` and implementation modules.
- {{additional_file_org_rules}}

## Configuration Naming

<!-- Describe naming conventions for config keys, environment variables, boolean flags, etc. Remove if not applicable. -->

- Boolean feature toggles: {{boolean_naming_convention}}
- Environment variables: {{env_var_naming_convention}}

## Commit Convention

<!-- Describe the commit message format and any enforcement tooling. -->

Commits follow **{{commit_convention}}**:

```
{{commit_format}}
```

## Build Output

<!-- Describe what the build produces and where it goes. -->

- {{build_output_description}}

## Release Process

<!-- Describe how releases are created: manual, semantic-release, release-please, etc. -->

{{release_process}}

## CI/CD

<!-- Describe CI/CD pipelines: what triggers them, what they do. -->

- {{ci_cd_description}}

## Best Practices

<!-- Project-specific best practices and guidelines. -->

- Use **ESM** and modern TypeScript/JavaScript.
- Before adding new code, always study surrounding patterns, naming conventions, and architectural decisions.
- Maintain consistency with existing conventions.
- {{additional_best_practices}}
