---
name: agent-docs-update
description: Propose template improvements to the agent-docs-init skill via pull request to tada5hi/skills. Use when the user asks to "update skill templates", "contribute back to skills", or when a project's agent docs have patterns worth upstreaming.
license: Apache-2.0
compatibility: Requires git and gh CLI authenticated, with push access to tada5hi/skills or a fork of it.
metadata:
  author: tada5hi
  version: "2026.11.21"
allowed-tools: Read Write Edit Bash(git:*) Bash(gh:*) Bash(ls:*) Bash(mkdir:*) Bash(cp:*) Glob Grep
---

# agent-docs-update

> Propose improvements to the `agent-docs-init` templates by opening a PR against `tada5hi/skills`.

## When to Use

- A project's agent docs contain refined patterns, sections or placeholders the templates lack.
- The user asks to "update the skill templates", "contribute back to skills", "improve the agent docs templates", or similar.

## Process

### 1. Gather context

Read side by side:

- **Project docs** (working directory): `CLAUDE.md`, `AGENTS.md`, `.agents/{structure,architecture,testing,conventions}.md`.
- **Templates**: `{{skills_repo_path}}/skills/agent-docs-init/templates/` — `CLAUDE.md`, `AGENTS.md`, `.agents/{structure,architecture,testing,conventions}.md`, `scripts/lint-agent-docs.mjs`.

Locate the skills repository: ask the user or check for a sibling `skills` directory (e.g. `../skills`); otherwise clone `https://github.com/tada5hi/skills` in step 3.

### 2. Identify improvements

| Category | Description | Example |
|----------|-------------|---------|
| **New section** | Project section with no template counterpart | A "Migration Patterns" section in architecture.md |
| **Better structure** | Both have it, the project's version is structured better | Tables instead of bullet lists, better heading hierarchy |
| **New placeholder** | A useful placeholder the template lacks | `{{package_manager_setup}}` for corepack-based projects |
| **Improved guidance** | Better HTML comments for agents filling in the template | More specific instructions for monorepo dependency layers |
| **Stale content** | Template content that no longer reflects best practice | Outdated section ordering, deprecated patterns |

Propose structural changes (sections, organization, guidance comments) only. Concrete values, real code and file paths stay in the project. Patterns seen across several projects are the strongest candidates.

### 3. Prepare the changes

```bash
# local repo
cd {{skills_repo_path}}
git checkout -b agent-docs-init-templates-update-{{date}}

# remote only
gh repo clone tada5hi/skills /tmp/skills-update
cd /tmp/skills-update
git checkout -b agent-docs-init-templates-update-{{date}}
```

Edit the files under `skills/agent-docs-init/templates/`:

- Generalize project-specific content to `{{placeholders}}` and HTML comment guidance.
- Keep existing placeholders and sections unless they are being explicitly improved; other projects depend on the current structure.
- Set `metadata.version` in `skills/agent-docs-init/SKILL.md` to today's date (`"YYYY.MM.DD"`).
- When templates or guidelines were added, update that `SKILL.md`'s Available Templates table and Guidelines section.

### 4. Create the pull request

```bash
git add skills/agent-docs-init/
git commit -m "feat(agent-docs-init): update templates

<what changed and why>"

git push -u origin agent-docs-init-templates-update-{{date}}

gh pr create \
  --repo tada5hi/skills \
  --title "feat(agent-docs-init): <short description>" \
  --body "$(cat <<'EOF'
## Summary

Template improvements based on real-world usage in `{{project_name}}`.

### Changes

- <bullet list of changes>

### Motivation

<why these changes improve the templates for future projects>
EOF
)"
```

Without push access to `tada5hi/skills`, push to a fork instead:

```bash
gh repo fork --remote --remote-name fork   # adds the fork as remote `fork`, keeps `origin`
git push -u fork agent-docs-init-templates-update-{{date}}
# then the gh pr create above, plus:
#   --head "$(gh api user --jq .login):agent-docs-init-templates-update-{{date}}"
```

## Guidelines

- **Keep templates generic.** No real package names, URLs or file paths; everything concrete is a `{{placeholder}}` or an example inside an HTML comment.
- **One concern per PR.** Split unrelated improvements; bundle related ones (a new section plus its guidance comments).
- **Explain the "why"** in the PR body: which project surfaced the improvement and why it helps other projects.
- **No AI attribution.** No `Co-Authored-By: Claude ...` (or any AI-attribution) trailer in commits, and no AI-attribution lines (e.g. `🤖 Generated with ...`) in PR titles, bodies or comments.
