import { existsSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { exec, execSafe, root } from './utils.ts'

export function submoduleExists(path: string): boolean {
    const gitmodules = join(root, '.gitmodules')
    if (!existsSync(gitmodules)) return false
    return readFileSync(gitmodules, 'utf-8').includes(`path = ${path}`)
}

export function getExistingSubmodulePaths(): string[] {
    const gitmodules = join(root, '.gitmodules')
    if (!existsSync(gitmodules)) return []
    const content = readFileSync(gitmodules, 'utf-8')
    return Array.from(content.matchAll(/path\s*=\s*(.+)/g), m => m[1].trim())
}

export function removeSubmodule(submodulePath: string): void {
    execSafe(`git submodule deinit -f ${submodulePath}`)
    const gitModulesPath = join(root, '.git', 'modules', submodulePath)
    if (existsSync(gitModulesPath)) {
        rmSync(gitModulesPath, { recursive: true })
    }
    exec(`git rm -f ${submodulePath}`)
}
