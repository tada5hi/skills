import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { getVendorProjects } from '../registry.ts'
import { getExistingSubmodulePaths, submoduleExists } from '../submodule.ts'
import { exec, info, log, root, success, warn } from '../utils.ts'

export function cmdInit(): void {
    log('Skills Manager — init\n')

    const projects = getVendorProjects()

    if (projects.length === 0) {
        info('No vendor skills configured in meta.ts.')
        return
    }

    const existingSubmodulePaths = getExistingSubmodulePaths()
    const expectedPaths = new Set(projects.map(p => p.path))
    const extras = existingSubmodulePaths.filter(p => !expectedPaths.has(p))

    if (extras.length > 0) {
        warn(`Found ${extras.length} submodule(s) not in meta.ts — run cleanup to remove them.`)
        for (const p of extras) info(`  - ${p}`)
    }

    let added = 0
    for (const project of projects) {
        if (submoduleExists(project.path)) {
            info(`Already exists: ${project.name}`)
            continue
        }

        const parentDir = join(root, dirname(project.path))
        if (!existsSync(parentDir)) mkdirSync(parentDir, { recursive: true })

        try {
            exec(`git submodule add ${project.url} ${project.path}`)
            success(`Added: ${project.name}`)
            added++
        }
        catch (e) {
            warn(`Failed to add ${project.name}: ${e}`)
        }
    }

    log(`\n${added} submodule(s) added.`)
}
