# Renamed skills

tada5hi/skills renamed its skills noun-first on 2026-11-21 (`{noun}(-{subnoun})-{verb}`). Agent docs that name a skill by its old name point the agent at a skill that no longer exists. Replace each old name with the new one; `prd-to-plan`, `prd-to-issues` and the vendor skills (`tdd`, `grilling`, `grill-me`, `codebase-design`, `improve-codebase-architecture`, `ponytail`, `security-audit`) kept their names.

| Old name | New name |
|---|---|
| `adopt-upgrades` | `upstream-features-adopt` |
| `audit-type-boundaries` | `type-boundaries-audit` |
| `create-pull-request` | `pr-create` |
| `generate-commit-message` | `commit-message-generate` |
| `impact-analysis` | `impact-analyze` |
| `init-agent-docs` | `agent-docs-init` |
| `init-ts-project` | `ts-project-init` |
| `investigate-pr-comments` | `pr-comments-investigate` |
| `link-skills` | `skills-link` |
| `migrate-agent-docs` | `agent-docs-migrate` |
| `plan-status` | `plan-status-report` |
| `query-api` | `api-query` |
| `query-package-list` | `package-list-query` |
| `redesign-vitepress-site` | `vitepress-site-redesign` |
| `refresh-package-list` | `package-list-refresh` |
| `release-please-version-bump` | `release-versions-align` |
| `request-refactor-plan` | `refactor-plan-request` |
| `track-upstream` | `upstream-fixes-track` |
| `triage-issue` | `issue-triage` |
| `update-agent-docs` | `agent-docs-update` |
| `write-a-prd` | `prd-write` |
| `write-readme` | `readme-write` |
| `write-release-notes` | `release-notes-write` |

Search for every old name at once (a plain `grep -w` also matches `plan-status` inside `plan-status-report`):

```bash
names=$(sed -n 's/^| `\([a-z-]*\)` | `.*$/\1/p' <skill-dir>/references/renamed-skills.md | paste -sd'|' -)
grep -rnE "(^|[^a-z-])($names)([^a-z-]|$)" CLAUDE.md AGENTS.md .agents
```
