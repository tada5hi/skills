---
name: impact-analysis
description: Perform cross-package impact analysis for a type, function, or constant in a TypeScript monorepo. Use when asked to "impact analysis", "find all consumers", "who uses this type", "trace imports", or before renaming shared symbols.
license: Apache-2.0
compatibility: Requires a TypeScript monorepo with package.json files.
metadata:
  author: tada5hi
  version: "2026.03.26"
allowed-tools: Bash(npx:*) Bash(npm:*) Bash(git:*) Read Edit Glob Grep Agent AskUserQuestion
---

# impact-analysis

> Perform cross-package impact analysis for a type, function, or constant in a TypeScript monorepo, tracing all consumers and property accesses.

## Step 1: Parse arguments

Extract the symbol name from `$ARGUMENTS`.

**Supported flags:**
- `--property <prop>` — highlight accesses to a specific property and include breaking change analysis

**Examples:**
- `MyInterface` — analyze all consumers of `MyInterface`
- `MyInterface --property oldName` — analyze consumers and highlight accesses to `.oldName`

If no symbol name is provided, ask the user which symbol to analyze.

## Step 2: Find the definition

Search for the symbol definition across the monorepo:

```bash
# Search for type/interface/class/function/const declarations
grep -rn "export\s\+\(type\|interface\|class\|function\|const\|enum\)\s\+<symbol>" --include="*.ts" --include="*.tsx"
```

Use Grep to locate all matching declarations. For each candidate:

1. **Read the file** to confirm it is the primary definition (not a re-export).
2. **Identify the package** by finding the nearest `package.json` ancestor.
3. **Record the definition shape** — list its properties, methods, parameters, or members so you can match them against consumer usage in later steps.

**Important:**
- If the symbol is defined in multiple packages, ask the user which definition to trace.
- If no definition is found, broaden the search to include non-exported declarations and type aliases.

## Step 3: Trace imports

Search for all imports of the symbol across the entire monorepo:

```bash
# Direct named imports
grep -rn "import.*{[^}]*<symbol>[^}]*}" --include="*.ts" --include="*.tsx"

# Re-exports
grep -rn "export.*{[^}]*<symbol>[^}]*}" --include="*.ts" --include="*.tsx"
grep -rn "export.*from" --include="*.ts" --include="*.tsx" | grep "<symbol>"
```

Use Grep to find all import and re-export statements. For each match:

1. **Classify the import type:**
   - **Direct import** — imports the symbol from the defining package
   - **Re-export** — re-exports the symbol through a barrel file (`index.ts`) or intermediate package
   - **Barrel import** — imports the symbol from a barrel file that re-exports it

2. **Track the import chain** — if the symbol is re-exported through intermediate packages, trace the full chain from definition to final consumer. This ensures you do not miss indirect consumers who import from a barrel or wrapper package.

3. **Record each consumer file** with its package name and import path.

## Step 4: Analyze property accesses

For each consumer file identified in Step 3:

1. **Read the relevant code** around each import and usage site.
2. **Identify how the symbol is used:**
   - Property accesses (e.g., `obj.prop`, `Type['prop']`)
   - Method calls (e.g., `obj.method()`)
   - Construction (e.g., `new ClassName()`)
   - Type annotations (e.g., `param: MyInterface`)
   - Spread or destructuring (e.g., `{ prop1, prop2 } = obj`)
   - Generic type parameters (e.g., `SomeType<MyInterface>`)

3. **If `--property` flag was provided**, specifically search for accesses to that property:
   ```bash
   # Property access patterns
   grep -n "\.<property>" <file>
   grep -n "\['<property>'\]" <file>
   grep -n "<property>:" <file>
   ```

4. **Record the accessed properties/methods** for each consumer file.

## Step 5: Group and report

Present results grouped by package using the following format:

```markdown
## Impact Analysis: <symbol-name>

### Definition
- **Package:** <package-name>
- **File:** <file-path>:<line-number>
- **Kind:** type | interface | class | function | const | enum
- **Shape:** <brief description of properties/methods>

### Consumers (N files across M packages)

#### <package-name> (N files)
- `<file-path>` — accesses: `.prop1`, `.prop2`
- `<file-path>` — constructs `<symbol-name>`
- `<file-path>` — type annotation only

#### <package-name> (N files)
- `<file-path>` — accesses: `.prop1`, `.method()`
- `<file-path>` — destructures: `{ prop1, prop2 }`

### Re-export Chain
<package-a> -> <package-b> -> <package-c>
```

**Important:**
- Sort packages alphabetically.
- Within each package, sort files alphabetically.
- If a consumer only uses the symbol as a type annotation (no property access), note "type annotation only".
- If no consumers are found, report that explicitly.

## Step 6: Breaking change analysis

**Only perform this step if `--property` was specified.**

Compile a focused report on the impact of renaming or removing the specified property:

```markdown
### Breaking Change Analysis: `<symbol-name>.<property>`

**Affected locations (N files across M packages):**

| Package | File | Line | Usage |
|---------|------|------|-------|
| <pkg> | `<file>` | <line> | `obj.<property>` |
| <pkg> | `<file>` | <line> | `{ <property> } = obj` |

**Migration approach:**
1. Update the definition in `<defining-file>`
2. Update re-exports if the property is part of a mapped type
3. Update each consumer file listed above
4. Run `npx tsc --noEmit` to verify no remaining type errors
```

If the number of affected locations is large (20+), suggest using a codemod or find-and-replace strategy instead of manual updates.
