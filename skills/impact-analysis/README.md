# impact-analysis

> **Trace every consumer of a type, function or constant across the packages of a TypeScript monorepo.**
> Stop grepping package by package before you rename a shared symbol.

[All skills](../../README.md#skills) · [`SKILL.md`](./SKILL.md)

## Why impact-analysis?

Renaming a shared interface or one of its properties touches every package that imports it, and some of them import it through a barrel file or another package's re-export. A plain text search misses those chains, and tells you nothing about which properties each consumer actually reads. You find the gaps when the build of a downstream package breaks.

| Concern | Without it | With impact-analysis |
|---|---|---|
| **Definition** | Guess which of several declarations is the real one | Finds the primary definition, its package and its shape, and asks you when several packages define the symbol |
| **Consumers** | Search each package separately | Finds direct imports, re-exports and barrel imports, and follows the re-export chain to the final consumers |
| **Usage** | Open each file to see how it is used | Records property accesses, method calls, construction, destructuring, type annotations and generic parameters per file |
| **Renaming a property** | Count call sites by hand | With `--property`, lists every affected file and line and outlines a migration |

## Installation

```bash
# this skill only, any Agent Skills agent
npx skills add tada5hi/skills --skill='impact-analysis'

# Claude Code: the plugin bundles every skill
/plugin marketplace add tada5hi/skills
/plugin install skills@tada5hi
```

## Triggering

**Ask for it.** The agent loads the skill when your request matches its description, for example:

- "impact analysis for `MyInterface`"
- "find all consumers of this type"
- "who uses this type?"
- "trace imports of `createClient`"

The agent may also use it before renaming a shared symbol.

**Invoke it directly.** Type `/impact-analysis` (installed with the skills CLI) or `/skills:impact-analysis` (Claude Code plugin), followed by the symbol name. Add `--property <prop>` to highlight accesses to one property and get a breaking change analysis:

```text
/impact-analysis MyInterface
/impact-analysis MyInterface --property oldName
```

Without a symbol name, it asks you which symbol to analyze.

## What it does

1. Reads the symbol name and the optional `--property` flag.
2. Finds the definition, its package (the nearest `package.json`) and its shape.
3. Traces direct imports, re-exports and barrel imports across the monorepo, following each re-export chain.
4. Reads each consumer and records how it uses the symbol.
5. Reports the consumers grouped by package, sorted alphabetically, with the re-export chain.
6. With `--property`, adds a table of every affected location and a migration approach.

## Requirements

- A TypeScript monorepo with `package.json` files.

## Output

A report in the chat:

```markdown
## Impact Analysis: MyInterface

### Definition
- **Package:** @scope/core
- **File:** packages/core/src/types.ts:12
- **Kind:** interface

### Consumers (3 files across 2 packages)

#### @scope/server (2 files)
- `src/handler.ts` — accesses: `.id`, `.name`
- `src/routes.ts` — type annotation only

### Re-export Chain
@scope/core -> @scope/client -> @scope/server
```

## Notes

- **It reports, it does not edit.** The migration approach lists the steps, including `npx tsc --noEmit` to verify; you run them.
- **Ambiguous definitions are your call.** When several packages define the symbol, it asks which one to trace.
- **No consumers is a result.** When nothing imports the symbol, the report says so.
- **Large renames get a different plan.** With 20 or more affected locations it suggests a codemod or find-and-replace instead of manual updates.

## License

Apache-2.0, see [LICENSE](../../LICENSE).
