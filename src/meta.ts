export interface VendorSkillMeta {
    /**
     * Whether this is an official/first-party skill from the upstream project.
     */
    official?: boolean
    /**
     * Git repository URL to clone as a submodule.
     */
    source: string
    /**
     * Subdirectory within the vendor repo that contains skill directories.
     * Defaults to `'skills'`. Use `'.'` for repos where skills are at the root.
     */
    skillsPath?: string
    /**
     * Map of source skill name → output skill name.
     * Source skills are read from `vendor/<key>/<skillsPath>/<sourceSkillName>/`.
     * Output skills are written to `skills/<outputSkillName>/`.
     */
    skills: Record<string, string>
}

/**
 * Hand-maintained skills authored in this repository.
 * Each entry must match a directory under `skills/`.
 *
 * prd-to-issues, prd-to-plan, request-refactor-plan, triage-issue and write-a-prd are
 * frozen copies of mattpocock/skills@fb3629d (MIT, see their LICENSE.md). Upstream removed
 * them; its successors need an issue tracker set up through /setup-matt-pocock-skills.
 */
export const manual: string[] = [
    'audit-type-boundaries',
    'create-pull-request',
    'generate-commit-message',
    'impact-analysis',
    'init-agent-docs',
    'init-ts-project',
    'investigate-pr-comments',
    'link-skills',
    'plan-status',
    'prd-to-issues',
    'prd-to-plan',
    'query-api',
    'query-package-list',
    'redesign-vitepress-site',
    'refresh-package-list',
    'release-please-version-bump',
    'request-refactor-plan',
    'triage-issue',
    'update-agent-docs',
    'write-a-prd',
    'write-readme',
    'write-release-notes',
]

/**
 * External repositories that already maintain their own skills.
 * Cloned as submodules under `vendor/<key>/` and synced into `skills/`.
 */
export const vendors: Record<string, VendorSkillMeta> = {
    'mattpocock-skills': {
        source: 'https://github.com/mattpocock/skills',
        skills: {
            'engineering/tdd': 'tdd',
            'engineering/improve-codebase-architecture': 'improve-codebase-architecture',
            // shared vocabulary that tdd and improve-codebase-architecture invoke
            'engineering/codebase-design': 'codebase-design',
            'productivity/grill-me': 'grill-me',
            // grill-me delegates to grilling
            'productivity/grilling': 'grilling',
        },
    },
    'dietrichgebert-ponytail': {
        source: 'https://github.com/DietrichGebert/ponytail',
        skills: {
            ponytail: 'ponytail',
        },
    },
}
