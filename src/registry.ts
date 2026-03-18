import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { manual, vendors } from './meta.ts'
import { root } from './utils.ts'

export interface Project {
    name: string
    url: string
    path: string
}

export function getVendorProjects(): Project[] {
    return Object.entries(vendors).map(([name, config]) => ({
        name,
        url: config.source,
        path: `vendor/${name}`,
    }))
}

export function getExpectedSkillNames(): Set<string> {
    const expected = new Set<string>()
    for (const name of manual) expected.add(name)
    for (const config of Object.values(vendors)) {
        for (const outputName of Object.values(config.skills)) {
            expected.add(outputName)
        }
    }
    return expected
}

export function getExistingSkillNames(): string[] {
    const skillsDir = join(root, 'skills')
    if (!existsSync(skillsDir)) return []
    return readdirSync(skillsDir, { withFileTypes: true })
        .filter(e => e.isDirectory())
        .map(e => e.name)
}
