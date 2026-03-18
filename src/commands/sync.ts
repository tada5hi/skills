import {
    cpSync,
    existsSync,
    mkdirSync,
    readdirSync,
    rmSync,
    writeFileSync,
} from 'node:fs'
import { dirname, join } from 'node:path'
import { vendors } from '../meta.ts'
import { exec, getGitSha, info, log, root, success, warn } from '../utils.ts'

export function cmdSync(): void {
    log('Skills Manager — sync\n')

    if (Object.keys(vendors).length === 0) {
        info('No vendor skills configured in meta.ts.')
        return
    }

    try {
        exec('git submodule update --remote --merge')
        success('Submodules updated')
    }
    catch (e) {
        warn(`Failed to update submodules: ${e}`)
        return
    }

    for (const [vendorName, config] of Object.entries(vendors)) {
        const vendorPath = join(root, 'vendor', vendorName)
        const vendorSkillsPath = join(vendorPath, 'skills')

        if (!existsSync(vendorPath)) {
            warn(`Vendor submodule not found: ${vendorName}. Run init first.`)
            continue
        }
        if (!existsSync(vendorSkillsPath)) {
            warn(`No skills/ directory in vendor/${vendorName}/`)
            continue
        }

        for (const [sourceSkillName, outputSkillName] of Object.entries(config.skills)) {
            const sourceSkillPath = join(vendorSkillsPath, sourceSkillName)
            const outputPath = join(root, 'skills', outputSkillName)

            if (!existsSync(sourceSkillPath)) {
                warn(`Skill not found: vendor/${vendorName}/skills/${sourceSkillName}`)
                continue
            }

            // Clean and copy
            if (existsSync(outputPath)) rmSync(outputPath, { recursive: true })
            mkdirSync(outputPath, { recursive: true })

            const files = readdirSync(sourceSkillPath, { recursive: true, withFileTypes: true })
            for (const file of files) {
                if (!file.isFile()) continue
                const fullPath = join(file.parentPath, file.name)
                const relativePath = fullPath.replace(sourceSkillPath, '')
                const destPath = join(outputPath, relativePath)
                const destDir = dirname(destPath)
                if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true })
                cpSync(fullPath, destPath)
            }

            // Copy LICENSE from vendor root
            const licenseNames = ['LICENSE', 'LICENSE.md', 'LICENSE.txt']
            for (const name of licenseNames) {
                const licensePath = join(vendorPath, name)
                if (existsSync(licensePath)) {
                    cpSync(licensePath, join(outputPath, 'LICENSE.md'))
                    break
                }
            }

            // Write SYNC.md
            const sha = getGitSha(vendorPath)
            const date = new Date().toISOString().split('T')[0]
            writeFileSync(
                join(outputPath, 'SYNC.md'),
                `# Sync Info\n\n- **Source:** \`vendor/${vendorName}/skills/${sourceSkillName}\`\n- **Git SHA:** \`${sha}\`\n- **Synced:** ${date}\n`,
            )

            success(`Synced: ${sourceSkillName} → ${outputSkillName}`)
        }
    }
}
