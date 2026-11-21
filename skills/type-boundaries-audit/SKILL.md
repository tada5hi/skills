---
name: type-boundaries-audit
description: Audit type boundary mismatches in TypeScript monorepos — detect cases where `as` casts or utility calls like pickRecord() silently hide property name mismatches. Use when asked to "audit types", "check type casts", "find type mismatches", or during naming convention migrations.
license: Apache-2.0
compatibility: Requires a TypeScript codebase.
metadata:
  author: tada5hi
  version: "2026.11.21"
allowed-tools: Read Edit Glob Grep AskUserQuestion
---

# type-boundaries-audit

> Audit type boundary mismatches in TypeScript monorepos — detect cases where `as` casts or utility calls silently hide property name mismatches.

## Step 1: Parse arguments

From `$ARGUMENTS`:

- A path scopes the audit to that directory or file; without one, audit the current working directory.
- `--strict`: report every analyzed cast, not just mismatches, and include test files.
- `--fix`: propose a concrete fix per mismatch and apply each with Edit only after the user confirms it (Step 6).

## Step 2: Find type casts

### 2a. `as` casts

Grep `\bas\s+([A-Z]\w*|\{)` in `*.ts` and `*.tsx` files and collect file paths and line numbers. This matches casts to named types (`as Foo`, `as Partial<Foo>`, `as Foo[]`) and inline object types (`as { realm_id: string }`). It deliberately skips lowercase targets: primitives (`as string`), `as unknown`, `as any`, `as never`, `as const`, `as keyof …` and `as typeof …`, which cannot hide a property name mismatch. In a double cast `x as unknown as Foo`, the `as Foo` part matches and is analyzed. Discard matches in comments and strings.

### 2b. Utility calls

- `pickRecord(` and `pick(`: pick properties into a typed result.
- `omit(`: the inverse of pick.
- Spread into a cast: `{ ...source } as TargetType`.

### 2c. Filter noise

Skip:

- Casts to a type parameter of the enclosing generic (`as T`, `as K`): nothing to resolve.
- Casts inside `.d.ts` files.
- Test files (`*.spec.ts`, `*.test.ts`), unless `--strict` is passed.

## Step 3: Resolve types for each cast

Read at least 10 lines around each cast, then identify:

1. **Source**: the value being cast (left of `as`).
2. **Target**: the type after `as`.
3. **Definitions** of both: Grep for `interface X` or `type X =`, follow imports into other files, and take property names of inline object literals from the source.

Resolve the full property set, including inherited properties (`extends`) and generic helpers such as `Partial<T>` or `Pick<T, K>`.

## Step 4: Compare properties

For each cast where both sides were resolved, flag:

- **Naming convention mismatch**: `realmId` on the source, `realm_id` on the target, or the reverse. For each unmatched property, check whether a camelCase ↔ snake_case conversion produces a match; if so, it falls in this category.
- **Missing properties**: the target expects properties the source lacks.
- **Extra properties**: the source has properties the target does not declare (often a stale cast after a refactor).
- **Similar but different names**: subtly differing names that look related (`userId` vs `user_id`, `createdAt` vs `created_at`).

## Step 5: Check utility calls

- **`pickRecord(obj, ['a', 'b'])` and `pick(obj, ['a', 'b'])`**: take the name list from the second argument and the expected output type from the variable assignment or return type. Flag picked names that do not exist on the output type or use a different naming convention.
- **`omit(obj, ['a'])`**: flag omitted names that do not exist on the source type.
- **Spread patterns** (`{ ...source, extra: value } as TargetType`): combine the properties of the spread and the extra keys, then compare against the target type with the rules of Step 4.

## Step 6: Report

Group by file:

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

With `--strict`, also list every analyzed cast without a mismatch, and casts whose types could not be resolved.

With no findings:

```
## Type Boundary Audit: Clean

Analyzed N type casts across K files. No property name mismatches detected.
```

With `--fix`, propose a concrete code change for each mismatch and apply it with Edit only after the user confirms that change. Without `--fix`, edit nothing.
