# Project Structure

<!-- Describe the overall project layout. Adapt sections below based on whether this is a monorepo or single-package project. -->

<!-- === FOR MONOREPOS: Use the Applications and Packages sections === -->

## Applications

<!-- List runnable applications in the monorepo. -->

| Name                          | Type        | Description                                  |
|-------------------------------|-------------|----------------------------------------------|
| [{{app_name}}]({{app_path}})  | {{app_type}}| {{app_description}}                          |

## Packages & Libraries

<!-- List reusable packages/libraries in the monorepo. -->

| Name                          | Type        | Description                                  |
|-------------------------------|-------------|----------------------------------------------|
| [{{pkg_name}}]({{pkg_path}})  | Library     | {{pkg_description}}                          |

## Package Dependency Layers

<!-- Show which packages depend on which. Changes to a lower-layer package affect all packages above it. Build order follows these layers. Internal dependencies are declared in each package's package.json — always consult those for the authoritative dependency graph. -->

```
Foundation (no internal deps):
  {{foundation_packages}}

Layer 1:
  {{layer1_packages}}

Apps:
  {{app_packages}}
```

<!-- === FOR SINGLE PACKAGES: Use the Directory Layout and Module sections === -->

## Directory Layout

```
{{project_name}}/
├── src/                        # Source code
│   ├── {{main_entry}}          # Main entry point
│   └── ...
├── test/                       # Tests
│   └── ...
├── package.json
└── ...
```

<!-- Replace the tree above with the actual project structure. Include all meaningful directories and files, with comments explaining their purpose. -->

## Module Responsibilities

<!-- List each major source module and its purpose. -->

| Module                 | Purpose                                              |
|------------------------|------------------------------------------------------|
| `{{module_file}}`      | {{module_description}}                               |

## Key Dependencies

<!-- List production dependencies and their roles. -->

| Dependency       | Role                                         |
|------------------|----------------------------------------------|
| `{{dep_name}}`   | {{dep_description}}                          |

## Package Exports

<!-- For libraries/packages: document the package.json exports field so agents understand what is public API vs internal. Remove this section for applications that aren't consumed as packages. -->

```json
{{package_exports}}
```

<!-- If the public API is controlled via a barrel index file, note which types/functions are re-exported vs internal. -->

## Per-Application Directory Layout

<!-- For monorepos: show the internal directory structure of each application, especially services with notable architectural patterns (e.g. hexagonal layout). This helps agents navigate individual apps. Repeat this section per app. -->

```
apps/{{app_name}}/src/
├── core/                          # Domain logic
│   ├── entities/                  # Entity ports, services, validators
│   │   └── <entity>/
│   │       ├── types.ts           # Port interfaces
│   │       ├── service.ts         # Business logic
│   │       └── validator.ts       # Input validation
│   └── services/                  # Cross-entity business services
├── adapters/                      # External system implementations
│   ├── database/                  # TypeORM entities, subscribers, migrations
│   └── http/                      # Controllers, request helpers
└── app/                           # Orchestration & DI wiring
    ├── builder.ts                 # Application builder
    ├── factory.ts                 # createApplication()
    └── modules/                   # DI modules
```

<!-- Customize the tree above per application. Remove layers that don't apply (e.g. a CLI app may not have adapters/http/). Include comments explaining the purpose of each directory. -->

## Separation of Concerns

<!-- Summarize which packages/modules own which responsibilities. -->

- **{{concern_area}}** → {{owning_module}}
