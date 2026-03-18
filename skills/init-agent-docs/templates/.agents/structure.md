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

## Separation of Concerns

<!-- Summarize which packages/modules own which responsibilities. -->

- **{{concern_area}}** → {{owning_module}}
