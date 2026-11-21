---
name: impact-analyze
description: Perform cross-package impact analysis for a type, function, or constant in a TypeScript monorepo. Use when asked to "impact analysis", "find all consumers", "who uses this type", "trace imports", or before renaming shared symbols.
license: Apache-2.0
compatibility: Requires a TypeScript monorepo with package.json files.
metadata:
  author: tada5hi
  version: "2026.11.21"
allowed-tools: Read Glob Grep AskUserQuestion
---

# impact-analyze

> Trace every consumer of a type, function or constant across the packages of a TypeScript monorepo, and how each one uses it. Report only: this skill edits nothing and runs no commands.

## Arguments

`$ARGUMENTS`: `<symbol> [--property <prop>]`

- `<symbol>`: the symbol to trace. If missing, ask which symbol to analyze.
- `--property <prop>`: also list every access to `<prop>` and add the breaking change analysis (Step 5).

## Step 1: Find the definition

Search `*.ts`/`*.tsx` with Grep (exclude `node_modules` and `dist`):

```text
export\s+(declare\s+)?(abstract\s+)?(type|interface|class|function|const|let|enum)\s+<symbol>\b
```

For each match:

1. Read the file and confirm it is the primary definition, not a re-export.
2. Find its package: the nearest `package.json` ancestor.
3. Record the shape (properties, methods, parameters or members) to match against usage later.

- Defined in several packages: ask which definition to trace.
- Nothing found: search non-exported declarations as well.

## Step 2: Trace imports and re-exports

Search with Grep, `multiline: true` (imports often span several lines):

- named imports, including `as` aliases and a default import before the braces: `import\s+(type\s+)?([\w$]+\s*,\s*)?\{[^}]*\b<symbol>\b[^}]*\}\s*from`
- named re-exports: `export\s+(type\s+)?\{[^}]*\b<symbol>\b[^}]*\}`
- star re-exports of the defining module: `export\s+\*(\s+as\s+\w+)?\s+from\s+['"][^'"]*<module>(\.[cm]?[jt]s|/index(\.[cm]?[jt]s)?)?['"]`, where `<module>` is the defining file's path without its extension (a directory barrel `types/index.ts` matches as `types`)
- inline type imports: `import\(['"][^'"]+['"]\)\.<symbol>\b`

Then:

- Star re-exports (`export * from './types'`) do not name the symbol. Follow them from the defining file up to each package entry point, so the symbol counts as exported by every package on that chain.
- For each package that exports the symbol, also check namespace imports (`import * as ns from '<package>'`) and look for `ns.<symbol>` in those files.
- Classify each match as a **direct import** (from the defining package), a **re-export** (barrel or intermediate package) or a **barrel import** (from a barrel that re-exports it), and record the file, its package and the import path. If it is imported under an alias (`<symbol> as X`), record the alias; Step 3 searches for it.

## Step 3: Analyze usage

For each consumer file, read the code around each use of the symbol (or its alias) and record:

- property accesses (`obj.prop`, `Type['prop']`) and method calls
- construction (`new X()`)
- type annotations and generic arguments (`param: X`, `Foo<X>`)
- spread and destructuring (`const { a, b: renamed } = obj`)

With `--property`, search each consumer file for:

- `\.<prop>\b` and `\[['"]<prop>['"]\]`: accesses
- `\b<prop>\s*:`: object literal keys and `{ <prop>: alias }` destructuring
- `\{[^}]*\b<prop>\b[^}]*\}\s*=` (multiline): shorthand destructuring

**Limit:** these searches cover only the files found in Step 2. A file that receives a value of the type without importing the symbol (an inferred return value, a callback parameter) and reads `<prop>` from it is missed. Run the `\.<prop>\b` search across the whole monorepo too (excluding `node_modules` and `dist`) and list hits outside the consumer files as **unconfirmed** candidates. Only `tsc --noEmit` after the rename (Step 5) is complete.

## Step 4: Report

```markdown
## Impact Analysis: <symbol>

### Definition
- **Package:** <package-name>
- **File:** <file-path>:<line>
- **Kind:** type | interface | class | function | const | enum
- **Shape:** <properties/methods>

### Consumers (N files across M packages)

#### <package-name> (N files)
- `<file-path>`: accesses `.prop1`, `.method()`
- `<file-path>`: constructs `<symbol>`
- `<file-path>`: destructures `{ prop1, prop2 }`
- `<file-path>`: type annotation only

### Re-export Chain
<package-a> -> <package-b> -> <package-c>
```

- Sort packages, and files within each package, alphabetically.
- A consumer that only uses the symbol as a type gets "type annotation only".
- No consumers: say so explicitly.

## Step 5: Breaking change analysis (only with `--property`)

```markdown
### Breaking Change Analysis: `<symbol>.<prop>`

**Affected locations (N files across M packages):**

| Package | File | Line | Usage |
|---------|------|------|-------|
| <pkg> | `<file>` | <line> | `obj.<prop>` |
| <pkg> | `<file>` | <line> | `{ <prop> } = obj` |

**Unconfirmed candidates:** <hits outside the consumer files, or "none">

**Migration approach:**
1. Update the definition in `<defining-file>`.
2. Update re-exports if the property is part of a mapped type.
3. Update each consumer file listed above.
4. Run `npx tsc --noEmit` in each affected package to find remaining errors.
```

With 20 or more affected locations, suggest a codemod or find-and-replace instead of manual updates.
