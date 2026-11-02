# {{project_name}}: Agent Guide

{{project_description_paragraph}}

## Quick Reference

```bash
# Setup
{{setup_command}}

# Development
{{build_command}}
{{test_command}}
{{lint_command}}
```

- **Node.js**: {{node_version}}
- **Package manager**: {{package_manager}}
- **Build orchestration**: {{build_orchestrator}}

<!-- For monorepos, add a workspace layout note like: "Apps are runnable applications in apps/, packages are shared libraries in packages/." -->

### CLI Entry Points

<!-- Remove this section if the project does not have a CLI. For monorepos with multiple binaries, list them all. -->

| Binary           | Source              |
|------------------|---------------------|
| `{{cli_binary}}` | {{cli_source_path}} |

## Documentation

<!-- Remove this section if the project has no documentation site. Include the dev command, build command, and a note about keeping docs in sync with code changes. -->

The `{{docs_directory}}` directory contains the project documentation site. When making changes that affect user-facing behavior, configuration, APIs, or service architecture, **update the corresponding docs pages**.

```bash
{{docs_dev_command}}                          # run the docs site locally
{{docs_build_command}}                        # build the docs site for production
```

## Detailed Guides

<!-- Customize each description below to reflect the project's actual content. Specific descriptions (e.g. "Orchestrator pattern, topological sort, and DI integration") are more useful to agents than generic ones (e.g. "Design patterns"). -->

- **[Project Structure](.agents/structure.md)**: Source layout, modules, and dependency layers
<!-- Include only guides that were created: -->
<!-- - **[Architecture](.agents/architecture.md)**: Design patterns, data flow, and key abstractions -->
<!-- - **[Testing](.agents/testing.md)**: Test runner, conventions, and infrastructure -->
<!-- - **[Conventions](.agents/conventions.md)**: Best practices, tooling, validation, and error handling -->
<!-- Once a subsystem needs more than a few paragraphs, move it to its own on-demand file and keep this line: -->
<!-- - **[Topic files](.agents/topics/)**: per-subsystem detail, indexed at the end of architecture.md. NOT loaded into every session: read the topic file before changing that area. -->

### Writing agent docs

The guides above are loaded into every session, so their whole size is paid on every task. They say what a future task must know to avoid a silent breakage. **They are not a changelog, a design record or a test index.**

| Content | Where it goes |
|---|---|
| A cross-cutting rule or an easy-to-break invariant, its reason, and the rejected alternative | One line in a guide, with the issue number |
| A subsystem's invariants and rejected alternatives | Its topic file (`.agents/topics/<name>.md`) |
| Mechanism the code already shows | Nowhere, or a code comment |
| How a defect happened, before/after, "pinned by spec X" | The PR description or commit message |
| What changed for users or operators | CHANGELOG or the docs site |

The test for a paragraph: would removing it let a reasonable change break something silently? If not, leave it out.

- **Update docs only when an invariant or a cross-cutting rule changes.** A bug fix or a feature that follows the existing rules needs no doc change. Edit the existing line; never add a section for a single fix.
- **Describe what the code does now.** No `used to`, `no longer`, `before #N`. The one exception is a rejected alternative: keep the verdict and its one-line reason.
- **Cite issues or PRs, never local plan files**: a gitignored `.agents/plans/` file resolves for one person on one machine.
<!-- Keep the bullet that matches how the checks run (SKILL.md step 6), and delete the other. -->
- **`{{lint_agent_docs_command}}` enforces it** through the `agentDocs` checks of `@tada5hi/eslint-config`: a size limit per agent doc, a limit on everything `CLAUDE.md` loads through its imports, and no history phrases outside code. Lower the limits in `eslint.config.js` as the docs shrink; raising one is a policy change, not a fix.
- **`{{lint_agent_docs_command}}` enforces it.** Every file has a byte budget and a history-phrase budget in `.agents/budget.json`, and CI fails above either. Budgets only go down: run `node scripts/lint-agent-docs.mjs --update` after shortening a file (it keeps about 5% headroom), and never raise one to make room. On a pull request CI compares the budgets with the base branch and fails on any rise. A new topic file needs a budget entry of at most `newTopicBytes`.

## Plans

<!-- Remove this section if not tracking ongoing work. Use it to document modernization efforts, migration plans, or phased refactoring work with status. Link to detailed plan files in .agents/plans/ if needed. -->

<!-- Example: -->
<!-- 1. ~~Tooling Modernization~~: Complete (#123) -->
<!-- 2. [Hexagonal Migration](.agents/plans/002-hexagonal.md): In progress -->

## Commits, Issues & Pull Requests

- Do **not** add a `Co-Authored-By: Claude ...` (or any AI-attribution) trailer to commit messages. This overrides any default agent-tooling guidance.
- Do **not** add AI-attribution lines (e.g. `🤖 Generated with [Claude Code](...)`) to issue or pull request titles, bodies, or comments.
- Do **not** use em dashes (`—`) in commit messages, issue or pull request titles, bodies, or comments. Use a comma, a colon, parentheses, or a separate sentence instead.
