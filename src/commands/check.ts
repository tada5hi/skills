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
        // fetch does not move origin/HEAD, so refresh it in case upstream changed its default branch
        exec('git submodule foreach "git fetch && git remote set-head origin --auto"')
    }
    catch (e) {
        warn(`Failed to fetch: ${e}`)
        return
    }

    let anyUpdates = false
    let anyUnchecked = false
    for (const [name, config] of Object.entries(vendors)) {
        const path = join(root, 'vendor', name)
        const skillNames = Object.values(config.skills).join(', ')

        // `git submodule foreach` skips uninitialized submodules, leaving an empty directory
        if (!existsSync(join(path, '.git'))) {
            warn(`${name} (${skillNames}): submodule not initialized. Run init first.`)
            anyUnchecked = true
            continue
        }

        // origin/HEAD, not @{u}: submodules are usually on a detached HEAD
        const behind = execSafe('git rev-list HEAD..origin/HEAD --count', path)
        if (behind === null) {
            warn(`${name} (${skillNames}): could not compare with upstream`)
            anyUnchecked = true
            continue
        }

        const count = Number.parseInt(behind, 10)
        if (count > 0) {
            info(`${name} (${skillNames}): ${count} commit(s) behind`)
            anyUpdates = true
        }
    }

    if (!anyUpdates && !anyUnchecked) success('All vendor skills are up to date.')
}
