# @tada5hi/skills

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)

A collection of [Agent Skills](https://agentskills.io) for AI coding agents.

**Table of Contents**

- [Skills](#skills)
- [Usage](#usage)
- [License](#license)

## Skills

| Skill | Description |
|-------|-------------|
| [init-agent-docs](skills/init-agent-docs/) | Initialize a project with AI agent documentation (CLAUDE.md, AGENTS.md, .agents/*.md) |
| [update-agent-docs](skills/update-agent-docs/) | Propose template improvements back to this repository via pull request |

## Usage

These skills follow the [Agent Skills](https://agentskills.io) open standard and are compatible with Claude Code, Cursor, VS Code Copilot, Gemini CLI, Goose, Roo Code, and other supporting tools.

### Claude Code

Add a skill to your project's `.claude/settings.json`:

```json
{
  "skills": [
    "/path/to/skills/skills/init-agent-docs"
  ]
}
```

Or reference it in your `CLAUDE.md`:

```markdown
@/path/to/skills/skills/init-agent-docs/SKILL.md
```

## Structure

```
skills/
├── skills/
│   ├── init-agent-docs/          # Project initialization skill
│   │   ├── SKILL.md              # Skill definition (metadata + instructions)
│   │   └── templates/            # Template files for generation
│   │       ├── CLAUDE.md
│   │       ├── AGENTS.md
│   │       └── .agents/
│   │           ├── structure.md
│   │           ├── architecture.md
│   │           ├── testing.md
│   │           └── conventions.md
│   └── update-agent-docs/  # Template feedback loop skill
│       └── SKILL.md
├── package.json
└── README.md
```

## Adding New Skills

1. Create a directory under `skills/` matching the skill name
2. Add a `SKILL.md` with YAML frontmatter (`name`, `description`) and instructions
3. Add any templates, scripts, or references the skill needs
4. Update this README's skill table

## License

Made with 💚

Published under [Apache 2.0 License](./LICENSE).
