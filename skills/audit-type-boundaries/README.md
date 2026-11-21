# audit-type-boundaries

> **Find `as` casts and pick-style calls that hide property name mismatches in TypeScript code.**
> Stop trusting a cast to tell you that `realmId` and `realm_id` are the same property.

[All skills](../../README.md#skills) · [`SKILL.md`](./SKILL.md)

## Why audit-type-boundaries?

An `as` cast tells the compiler to stop checking. When one side of the cast uses `realmId` and the other `realm_id`, the code compiles and the value is `undefined` at runtime. The same happens with `pickRecord()` or `pick()` called with names from the wrong convention. During a naming convention migration these casts multiply, and finding them by hand means opening every type on both sides.

| Concern | Without it | With audit-type-boundaries |
|---|---|---|
| **Finding casts** | Search for `as` and wade through `as const` | Greps `as <Type>` and `pickRecord(`, `pick(`, `omit(` and spread-into-cast patterns, skipping `as unknown`, `as any`, `as never`, `as const` and `.d.ts` files |
| **Comparing types** | Open both definitions and compare by eye | Resolves source and target types, including inherited properties and `Partial`/`Pick`, and compares property names |
| **Naming drift** | Notice `userId` vs `user_id` when a value is missing | Flags camelCase/snake_case pairs, missing, extra and similar-but-different names |
| **Fixes** | Patch each cast by hand | With `--fix`, suggests a concrete change per mismatch and applies it after you confirm |

## Installation

```bash
# this skill only, any Agent Skills agent
npx skills add tada5hi/skills --skill='audit-type-boundaries'

# Claude Code: the plugin bundles every skill
/plugin marketplace add tada5hi/skills
/plugin install skills@tada5hi
```

## Triggering

**Ask for it.** The agent loads the skill when your request matches its description, for example:

- "audit types"
- "check type casts"
- "find type mismatches"

The agent may also use it during a naming convention migration.

**Invoke it directly.** Type `/audit-type-boundaries` (installed with the skills CLI) or `/skills:audit-type-boundaries` (Claude Code plugin). Pass a path to scope the audit, plus optional flags:

- `--strict` reports all casts, not just mismatches, and includes test files.
- `--fix` proposes a fix per mismatch and applies it after you confirm.

Example: `/audit-type-boundaries packages/core/src --fix`. Without a path it audits the current working directory.

## What it does

1. Reads the scope and flags from your arguments.
2. Finds `as` casts and pick, omit and spread patterns in `*.ts` and `*.tsx` files, and filters out escape hatches, declaration files and tests.
3. Reads the code around each cast and resolves the source and target types, following imports and inherited properties.
4. Compares property names and flags convention mismatches, missing, extra and similar-but-different names.
5. Checks that the names passed to `pickRecord()` and `pick()` exist on the output type.
6. Reports the findings grouped by file, with a summary.

## Requirements

- A TypeScript codebase.

## Output

A report in the chat, grouped by file:

```text
## Type Boundary Issues Found

### src/realm/service.ts:42
- Utility: `pickRecord(obj, ['realm_id', ...])`
- Picked properties: realm_id, user_id (snake_case)
- Expected type properties: realmId, userId (camelCase)
- Mismatch: realm_id ≠ realmId, user_id ≠ userId

### Summary
- 37 casts analyzed
- 2 potential mismatches found
- 2 files affected
```

With no findings it reports `Type Boundary Audit: Clean` with the number of casts and files analyzed.

## Notes

- **It reports, it does not edit.** Without `--fix` it changes nothing. With `--fix` it asks you before applying each suggested change.
- **Test files are skipped** unless you pass `--strict`.
- **Escape hatches are left alone.** `as unknown`, `as any`, `as never` and `as const` are treated as intentional and not analyzed.
- **Unresolved types are not compared.** Only casts where both source and target types could be resolved get a property comparison.

## License

Apache-2.0, see [LICENSE](../../LICENSE).
