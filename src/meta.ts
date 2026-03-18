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
     * Map of source skill name → output skill name.
     * Source skills are read from `vendor/<key>/skills/<sourceSkillName>/`.
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
    'update-agent-docs',
    'link-skills',
]

/**
 * External repositories that already maintain their own skills.
 * Cloned as submodules under `vendor/<key>/` and synced into `skills/`.
 */
export const vendors: Record<string, VendorSkillMeta> = {
    // Example:
    // 'some-project': {
    //     official: true,
    //     source: 'https://github.com/org/some-project',
    //     skills: {
    //         'source-skill-name': 'output-skill-name',
    //     },
    // },
}
