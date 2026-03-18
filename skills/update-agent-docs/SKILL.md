---
name: update-agent-docs
description: Propose template improvements to the init-agent-docs skill via pull request to tada5hi/skills. Use when the user asks to "update skill templates", "contribute back to skills", or when a project's agent docs have patterns worth upstreaming.
license: Apache-2.0
compatibility: Requires git and gh CLI authenticated with permissions to fork/push to tada5hi/skills.
metadata:
  author: tada5hi
  version: "2026.03.18"
allowed-tools: Read Write Bash(git:*) Bash(gh:*) Bash(ls:*) Bash(mkdir:*) Bash(cp:*) Glob Grep
---

# update-agent-docs

> Propose improvements to the `init-agent-docs` skill templates by opening a PR against `tada5hi/skills`.

## When to Use

- A project's agent docs have been refined and contain patterns not yet reflected in the templates
- A new section or convention was discovered during project initialization that would benefit other projects
- Template placeholders, comments, or structure need updating based on real-world usage
- The user asks to "update the skill templates", "contribute back to skills", "improve the agent docs templates", or similar

## Process

### 1. Gather context

Read the current project's agent documentation and the current skill templates side by side:

**Current project docs** (in the working directory):
- `CLAUDE.md`
- `AGENTS.md`
- `.agents/structure.md`
- `.agents/architecture.md`
- `.agents/testing.md`
- `.agents/conventions.md`

**Current skill templates** (in the skills repository):
- `{{skills_repo_path}}/skills/init-agent-docs/templates/CLAUDE.md`
- `{{skills_repo_path}}/skills/init-agent-docs/templates/AGENTS.md`
- `{{skills_repo_path}}/skills/init-agent-docs/templates/.agents/structure.md`
- `{{skills_repo_path}}/skills/init-agent-docs/templates/.agents/architecture.md`
- `{{skills_repo_path}}/skills/init-agent-docs/templates/.agents/testing.md`
- `{{skills_repo_path}}/skills/init-agent-docs/templates/.agents/conventions.md`

The skills repository is located at one of:
- Local path: ask the user, or check for a sibling `skills` directory (e.g., `../skills` relative to the current project)
- Remote: `https://github.com/tada5hi/skills`

### 2. Identify improvements

Compare the project's docs against the templates and categorize findings:

| Category | Description | Example |
|----------|-------------|---------|
| **New section** | A section in the project docs that has no corresponding template section | A "Migration Patterns" section in architecture.md |
| **Better structure** | A section that exists in both but the project's version is structured more usefully | Tables instead of bullet lists, better heading hierarchy |
| **New placeholder** | A placeholder that would be useful but doesn't exist in the template | `{{package_manager_setup}}` for corepack-based projects |
| **Improved guidance** | Better HTML comments or instructions for agents filling in the template | More specific instructions for monorepo dependency layers |
| **Stale content** | Template content that no longer reflects best practices | Outdated section ordering, deprecated patterns |

**Important distinctions:**
- **Project-specific content** (concrete values, real code, actual file paths) should NOT be merged into templates — templates must remain generic with `{{placeholders}}` and HTML comments.
- **Structural improvements** (new sections, better organization, improved guidance comments) SHOULD be proposed.
- **New patterns** that appear across multiple projects are strong candidates for template inclusion.

### 3. Prepare the changes

If the skills repo is available locally:

```bash
cd {{skills_repo_path}}
git checkout -b update-init-agent-docs-templates-{{date}}
```

If only available remotely:

```bash
gh repo clone tada5hi/skills /tmp/skills-update
cd /tmp/skills-update
git checkout -b update-init-agent-docs-templates-{{date}}
```

Edit the template files under `skills/init-agent-docs/templates/` to incorporate the improvements. For each change:
- Generalize project-specific content back to `{{placeholders}}`
- Add or improve HTML comment guidance for agents
- Keep existing placeholders and sections intact unless they are being explicitly improved
- Update the `metadata.version` in `skills/init-agent-docs/SKILL.md` to today's date

### 4. Create the pull request

```bash
git add skills/init-agent-docs/
git commit -m "feat(init-agent-docs): update templates

<description of what changed and why>"

git push -u origin update-init-agent-docs-templates-{{date}}

gh pr create \
  --repo tada5hi/skills \
  --title "feat(init-agent-docs): <short description>" \
  --body "$(cat <<'EOF'
## Summary

Template improvements based on real-world usage in `{{project_name}}`.

### Changes

- <bullet list of changes>

### Motivation

<why these changes improve the templates for future projects>

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

## Guidelines

- **Keep templates generic.** Never introduce project-specific content (real package names, URLs, file paths) into templates. Everything concrete must be a `{{placeholder}}` or wrapped in HTML comments as example guidance.
- **Preserve backward compatibility.** Don't remove existing placeholders or sections unless they are truly broken. Other projects may depend on the current template structure.
- **One concern per PR.** If you find multiple unrelated improvements, prefer separate PRs so they can be reviewed independently. Bundle related changes (e.g., adding a new section + its guidance comments) into one PR.
- **Explain the "why".** The PR description should explain which project surfaced the improvement and why it benefits other projects, not just what changed.
- **Bump the version.** Update `metadata.version` in `SKILL.md` to today's date (format: `"YYYY.MM.DD"`).
- **Check SKILL.md too.** If new templates, placeholders, or guidelines were added, update the SKILL.md's placeholder table, template table, and guidelines section accordingly.
