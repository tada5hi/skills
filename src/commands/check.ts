import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { vendors } from '../meta.ts'
import { exec, execSafe, info, log, root, success, warn } from '../utils.ts'

export function cmdCheck(): void {
    log('Skills Manager — check\n')

    if (Object.keys(vendors).length === 0) {
        info('No vendor skills configured in meta.ts.')
        return
    }

    try {
        exec('git submodule foreach git fetch')
    }
    catch (e) {
        warn(`Failed to fetch: ${e}`)
        return
    }

    let anyUpdates = false
    for (const [name, config] of Object.entries(vendors)) {
        const path = join(root, 'vendor', name)
        if (!existsSync(path)) continue
        const behind = execSafe('git rev-list HEAD..@{u} --count', path)
        const count = behind ? Number.parseInt(behind, 10) : 0
        if (count > 0) {
            const skillNames = Object.values(config.skills).join(', ')
            info(`${name} (${skillNames}): ${count} commit(s) behind`)
            anyUpdates = true
        }
    }

    if (!anyUpdates) success('All vendor skills are up to date.')
}
