import { rmSync } from 'node:fs'
import { join } from 'node:path'
import { getExistingSkillNames, getExpectedSkillNames, getVendorProjects } from '../registry.ts'
import { getExistingSubmodulePaths, removeSubmodule } from '../submodule.ts'
import { log, root, success, warn } from '../utils.ts'

export function cmdCleanup(): void {
    log('Skills Manager — cleanup\n')

    let cleaned = 0

    // Remove submodules not in meta.ts
    const expectedPaths = new Set(getVendorProjects().map(p => p.path))
    const extras = getExistingSubmodulePaths().filter(p => !expectedPaths.has(p))

    for (const submodulePath of extras) {
        try {
            removeSubmodule(submodulePath)
            success(`Removed submodule: ${submodulePath}`)
            cleaned++
        }
        catch (e) {
            warn(`Failed to remove ${submodulePath}: ${e}`)
        }
    }

    // Remove skill directories not in meta.ts
    const expectedSkills = getExpectedSkillNames()
    const extraSkills = getExistingSkillNames().filter(n => !expectedSkills.has(n))

    for (const skillName of extraSkills) {
        try {
            rmSync(join(root, 'skills', skillName), { recursive: true })
            success(`Removed skill: ${skillName}`)
            cleaned++
        }
        catch (e) {
            warn(`Failed to remove skills/${skillName}: ${e}`)
        }
    }

    if (cleaned === 0 && extras.length === 0 && extraSkills.length === 0) {
        success('Everything clean — no stale submodules or skills.')
    }
    else {
        log(`\n${cleaned} item(s) removed.`)
    }
}
