export interface IVendorSkillMeta {
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

export interface IProject {
    name: string
    url: string
    path: string
}
