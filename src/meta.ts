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
 */
export const manual: string[] = [
    'init-agent-docs',
    'investigate-pr-comments',
    'link-skills',
    'update-agent-docs',
]

/**
 * External repositories that already maintain their own skills.
 * Cloned as submodules under `vendor/<key>/` and synced into `skills/`.
 */
export const vendors: Record<string, VendorSkillMeta> = {
    'mattpocock-skills': {
        source: 'https://github.com/mattpocock/skills',
        skillsPath: '.',
        skills: {
            'tdd': 'tdd',
            'triage-issue': 'triage-issue',
            'write-a-prd': 'write-a-prd',
            'prd-to-plan': 'prd-to-plan',
            'prd-to-issues': 'prd-to-issues',
            'grill-me': 'grill-me',
            'improve-codebase-architecture': 'improve-codebase-architecture',
            'request-refactor-plan': 'request-refactor-plan',
        },
    },
}
