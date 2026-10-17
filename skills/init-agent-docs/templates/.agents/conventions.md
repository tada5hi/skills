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

## Naming Conventions

<!-- Document naming patterns that agents should follow when writing new code. Remove sections that don't apply. Common patterns to document: -->
<!-- - Type suffix conventions (Options vs Context vs Config) -->
<!-- - Function naming: verb prefixes (get, set, create, resolve, handle) -->
<!-- - File naming: kebab-case, PascalCase, matching export names -->
<!-- - Variable naming: boolean prefixes (is, has, should), collections (plural), constants (UPPER_SNAKE_CASE) -->

<!-- Example pattern: -->
<!-- | Suffix | When to use | Examples | -->
<!-- |--------|-------------|----------| -->
<!-- | `*Options` | Plain scalars, simple config | `SetupOptions { resolveCache?: boolean }` | -->
<!-- | `*Context` | Class instances, Maps, functions | `ApplicationContext { container?: IContainer }` | -->
<!-- | `*Config` | Static configuration loaded from files/env | `DatabaseConfig { host: string; port: number }` | -->

<!-- Interface vs type: keep the two bullets below only when the code already follows them (grep `export interface` and `export type`), and fill the examples with 2-4 real exported names each. The first bullet is the common rule; drop the second when the project keeps records as plain interfaces (e.g. domain entities). Never introduce the convention into a project that lacks it, and remove both bullets if an ESLint `naming-convention` rule forbids the prefix. -->
<!-- Optional companion rule: declare the contract explicitly and let the class `implements` it; never derive a public contract from a class (`typeof Client`, mapped-over-class types), except at a third-party boundary. -->

- **Every `interface` carries the `I` prefix; `type` aliases never do**: {{contract_interface_examples}}.
- **`interface` is for behavior contracts**: a class implements it, or a factory returns it. Data shapes (records, options, payloads) are `type` aliases: {{data_type_examples}}.
- {{naming_conventions}}

## File Organization

<!-- Describe where types, constants, utils, and barrel exports live. -->
<!-- The module rules below are the default layout; keep them for new projects and for projects that already follow them, and adapt the file names to what the code uses. -->
<!-- Base error class file: use the name the code already uses (`base.ts` in most libraries, `module.ts` in some monorepos); for a new project, use `base.ts`. -->

- **A module is a folder.** Once a concept has more than one kind of content it gets `src/<concept>/` with, as needed:
  - `module.ts`: the implementation (the class or the main functions).
  - `types.ts`: every exported type. No exported type lives in an implementation file.
  - `helpers.ts`: functions the implementation uses; a `helpers/` folder with one file per helper once it grows.
  - `constants.ts`: every exported constant.
  - `index.ts`: the barrel.
- **One class per file.** Never disable `max-classes-per-file` in source. Sibling classes share a folder: `errors/{{base_error_file}}` holds the base class, every other error has its own file named after its concept without an `-error` suffix (`not-found.ts` holds `NotFoundError`), and error codes live in `errors/constants.ts`.
- **Barrels only re-export their own folder.** No file whose only job is to pull symbols out of other modules. A `./testing` subpath is a `src/testing/` folder that holds the helpers itself.
- **The package entry composes folder barrels.** `src/index.ts` re-exports each folder's `index.ts`; inside the package, import the file you need, not `src/index.ts`.
- {{additional_file_org_rules}}

<!-- File header: keep this bullet only when most existing source files start with the same header (read the first lines of a few files under each source and test root, and of the config files). Copy the block verbatim from a real file; never write one from memory. Keep each file's existing year, whether a single year or a range (`2021-2024.`). Note the form used in other file types (e.g. `.vue` files use an HTML comment) and any exemptions: build/config files such as `tsdown.config.ts` often lack it, generated files (e.g. ORM migrations) and snippets embedded verbatim in docs may omit it. Remove the bullet if there is no consistent header. -->

- **Every file under {{header_paths}} starts with this header**{{header_exemptions}}:

  ```ts
  {{file_header}}
  ```

## House Libraries

<!-- Keep this section only when the project already depends on packages published by its own author or organisation; remove it otherwise, including the paragraph below. List only packages the project actually uses, each with the hand-written pattern it replaces, and don't repeat rules already stated under Validation & Error Handling. Example entries from tada5hi projects (copy one only if that package is a dependency): -->
<!-- - Object checks use `isObject` from `smob`, never `typeof x === 'object' && x !== null` (`isObject` also rejects arrays). -->
<!-- - Errors extend `BaseError` from `@ebec/core`; structured failures are passed as ebec `issues`, never a custom issue field. -->
<!-- - Standard Schema validation goes through validup (`buildIssuesForStandardSchemaIssues` from `@validup/standard-schema`). -->

Before writing a generic helper, check {{package_list_reference}} (the `query-package-list` skill reads it) and prefer an existing package over a local implementation.

- {{house_library_rules}}

## Configuration Naming

<!-- Describe naming conventions for config keys, environment variables, boolean flags, etc. Remove if not applicable. -->

- Boolean feature toggles: {{boolean_naming_convention}}
- Environment variables: {{env_var_naming_convention}}

## Pre-commit Hooks

<!-- Remove if no hooks are configured. Describe what runs on commit: linting, formatting, commit message validation. -->

<!-- Example: -->
<!-- Husky runs on every commit: -->
<!-- 1. **lint-staged**: ESLint with fix on `*.{vue,js,ts}` -->
<!-- 2. **commitlint**: Validates commit message format -->

{{pre_commit_hooks_description}}

## Commit Convention

<!-- Describe the commit message format and any enforcement tooling. -->

Commits follow **{{commit_convention}}**:

```
{{commit_format}}
```

## TypeScript

<!-- Remove if not using TypeScript or if config is standard. Document notable TS config decisions: strict mode, decorator support, module resolution, target. -->

<!-- Example: -->
<!-- - Target: ES2022, Module: ESNext, ModuleResolution: bundler -->
<!-- - `strict: false` (migration planned) -->
<!-- - Decorators enabled (required for TypeORM) -->
<!-- - All packages use `"type": "module"` (ESM-only) -->

{{typescript_config_description}}

## Build Output

<!-- Describe what the build produces and where it goes. -->

- {{build_output_description}}

## Release Process

<!-- Describe how releases are created: manual, semantic-release, release-please, etc. -->

{{release_process}}

## CI/CD

<!-- Describe CI/CD pipelines: what triggers them, what they do. -->

- {{ci_cd_description}}

## Docker

<!-- Remove if the project doesn't use Docker. Describe the Docker setup: Dockerfile, docker-compose for local dev, entrypoints. -->

<!-- Example: -->
<!-- Multi-service Dockerfile builds the entire monorepo. docker-compose.yml provides local dev services (MySQL, Postgres, Redis). -->

{{docker_description}}

## Documentation Site

<!-- Remove if no docs site exists. Describe what changes require docs updates and where to find the docs structure. See also the Documentation section in AGENTS.md. -->

<!-- Example table: -->
<!-- | Change | Docs to update | -->
<!-- |--------|---------------| -->
<!-- | Service env vars | `docs/src/reference/<service>/index.md` | -->
<!-- | New API endpoints | `docs/src/reference/<service>/index.md` | -->

{{docs_sync_description}}

## Architecture Conventions

<!-- Remove if no specific architecture conventions apply. Document conventions for the architectural pattern used (hexagonal, MVC, etc.): dependency rules, layer conventions, module patterns. -->

<!-- Example for hexagonal: -->
<!-- - core/ → no imports from adapters/ or app/ -->
<!-- - adapters/ → may import core/ and app/ -->
<!-- - app/ → wires core/ and adapters/ together -->
<!-- - Controllers are thin: extract request → delegate to service → send response -->
<!-- - Subscribers are pre-instantiated in modules, not auto-discovered -->

{{architecture_conventions_description}}

## DI Modules

<!-- Remove if no dependency injection is used. Document the DI module structure, injection keys, and module inventory. -->

<!-- Example: -->
<!-- Each DI module lives in `app/modules/<name>/` with: constants.ts (injection keys), types.ts, module.ts, index.ts -->

<!-- Include a module inventory table per service: -->
<!-- | Module | Dependencies | Registers | -->
<!-- |--------|-------------|----------| -->

{{di_modules_description}}

## References

<!-- Remove if the project doesn't depend on external projects that agents may need to cross-reference. Use `.agents/references/` to build a cumulative mapping between external project code and this project's code. -->

External project references live in `.agents/references/`. **If you keep this section, create the `.agents/references/` directory** and add one Markdown file per external project (e.g. `.agents/references/{{referenced_project_slug}}.md`). When looking up source code in a referenced project (e.g., {{referenced_project_names}}), update the corresponding reference file with:

- The source file path / function name in the external project
- The corresponding file path / function name in this project
- Any behavioral differences between the implementations

<!-- This builds a cumulative mapping over time so future work can quickly find corresponding code without re-searching. -->

## Best Practices

<!-- Project-specific best practices and guidelines. -->

- Use **ESM** and modern TypeScript/JavaScript.
- Before adding new code, always study surrounding patterns, naming conventions, and architectural decisions.
- Maintain consistency with existing conventions.
- {{additional_best_practices}}
