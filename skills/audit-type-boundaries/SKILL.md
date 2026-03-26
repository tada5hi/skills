---
name: audit-type-boundaries
description: Audit type boundary mismatches in TypeScript monorepos — detect cases where `as` casts or utility calls like pickRecord() silently hide property name mismatches. Use when asked to "audit types", "check type casts", "find type mismatches", or during naming convention migrations.
license: Apache-2.0
compatibility: Requires a TypeScript codebase.
metadata:
  author: tada5hi
  version: "2026.03.26"
allowed-tools: Bash(npx:*) Bash(npm:*) Bash(git:*) Read Edit Glob Grep Agent AskUserQuestion
---

# audit-type-boundaries

> Audit type boundary mismatches in TypeScript monorepos — detect cases where `as` casts or utility calls silently hide property name mismatches.

## Step 1: Parse arguments

Determine the scope of the audit from `$ARGUMENTS`:

- If a path is provided, scope the audit to that directory or file.
- If no path is provided, default to the current working directory.
- Look for optional flags: `--strict` (report all casts, not just mismatches), `--fix` (suggest fixes inline).

## Step 2: Find type casts

Search for type assertion patterns across the scoped codebase:

### 2a. `as` casts

```bash
# Find all `as SomeType` patterns in TypeScript files
```

Use Grep to search for `\bas\s+[A-Z]\w+` across `*.ts` and `*.tsx` files. Collect file paths and line numbers.

### 2b. Utility function calls

Search for common utility patterns that perform implicit type conversions:

- `pickRecord(` — picks properties from an object into a typed result
- `pick(` — similar property-picking utilities
- `omit(` — inverse of pick, may also introduce mismatches
- Spread-into-typed-variable patterns: `{ ...source } as TargetType`

### 2c. Filter noise

Skip casts that are unlikely to hide mismatches:

- `as unknown`, `as any`, `as never` — intentional escape hatches
- `as const` — literal narrowing, not a boundary crossing
- Casts inside `.d.ts` files — type declarations, not runtime boundaries
- Test files (`*.spec.ts`, `*.test.ts`) — unless `--strict` is passed

## Step 3: Resolve types for each cast

For each found cast, read the surrounding code context (at least 10 lines above and below):

1. **Identify the source expression** — the value being cast (left side of `as`).
2. **Identify the target type** — the type after `as`.
3. **Locate the type definitions** for both source and target:
   - Use Grep to find `interface TargetType` or `type TargetType =` declarations.
   - Follow imports to find definitions in other files if needed.
   - For inline object literals, extract the property names directly from the source code.

**Important:**
- If a type extends another type, resolve the full property set including inherited properties.
- For generic types like `Partial<T>` or `Pick<T, K>`, resolve the concrete properties.

## Step 4: Compare properties

For each cast where both source and target types were resolved:

1. **Extract property names** from both source and target types.
2. **Flag mismatches** in these categories:
   - **Naming convention mismatch**: source has `realmId` (camelCase) but target expects `realm_id` (snake_case), or vice versa.
   - **Missing properties**: target expects properties that do not exist on the source.
   - **Extra properties**: source has properties that the target does not declare (may indicate stale casts after refactoring).
   - **Similar but different names**: properties that look related but differ subtly (e.g., `userId` vs `user_id`, `createdAt` vs `created_at`).

3. **Heuristic matching**: for each unmatched property, check if a camelCase-to-snake_case (or reverse) conversion produces a match. If so, flag it as a naming convention mismatch.

## Step 5: Check utility function calls

For utility patterns found in Step 2b:

### 5a. `pickRecord(obj, ['prop1', 'prop2'])` and `pick(obj, ['prop1', 'prop2'])`

- Extract the property name list from the second argument.
- Determine the expected output type (from the variable assignment or return type).
- Verify that every picked property name exists on the output type.
- Flag cases where picked property names use a different naming convention than the output type expects.

### 5b. Spread patterns

For `{ ...source, extra: value } as TargetType`:

- Resolve all properties contributed by the spread and any additional properties.
- Compare the combined property set against the target type.
- Flag mismatches using the same rules as Step 4.

## Step 6: Report

Output a structured report grouped by file:

```
## Type Boundary Issues Found

### <file-path>:<line>
- Cast: `... as <TargetType>`
- Source properties: prop1, prop2 (camelCase)
- Target properties: prop_1, prop_2 (snake_case)
- Mismatch: prop1 ≠ prop_1, prop2 ≠ prop_2

### <file-path>:<line>
- Utility: `pickRecord(obj, ['realm_id', ...])`
- Picked properties: realm_id, user_id (snake_case)
- Expected type properties: realmId, userId (camelCase)
- Mismatch: realm_id ≠ realmId, user_id ≠ userId

### Summary
- N casts analyzed
- M potential mismatches found
- K files affected
```

If no issues are found, report that the audit passed cleanly:

```
## Type Boundary Audit: Clean

Analyzed N type casts across K files. No property name mismatches detected.
```

If `--fix` was passed, suggest concrete code changes for each mismatch using Edit, but ask the user for confirmation before applying them.
