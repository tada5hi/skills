import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, rmSync, symlinkSync } from 'node:fs'
import { join, relative } from 'node:path'
import { info, isWindows, log, root, success, warn } from '../utils.ts'

export function cmdLink(): void {
    log('Skills Manager — link\n')

    const skillsSource = join(root, 'skills')
    const skillsTarget = join(root, '.claude', 'skills')

    if (!existsSync(skillsTarget)) mkdirSync(skillsTarget, { recursive: true })

    const skillDirs = readdirSync(skillsSource, { withFileTypes: true })
        .filter(e => e.isDirectory() && existsSync(join(skillsSource, e.name, 'SKILL.md')))

    let linked = 0
    let skipped = 0

    for (const entry of skillDirs) {
        const target = join(skillsTarget, entry.name)
        const source = join(skillsSource, entry.name)

        if (existsSync(target)) {
            try {
                const targetSkill = join(target, 'SKILL.md')
                if (existsSync(targetSkill)) {
                    info(`Skipped (exists): ${entry.name}`)
                    skipped++
                    continue
                }
            }
            catch {
                // stale — remove and recreate
            }
            rmSync(target, { recursive: true, force: true })
        }

        try {
            if (isWindows) {
                execSync(
                    `powershell.exe -Command "New-Item -ItemType Junction -Path '${target}' -Target '${source}'"`,
                    { stdio: 'pipe' },
                )
            }
            else {
                const rel = relative(skillsTarget, source)
                symlinkSync(rel, target)
            }
            success(`Linked: ${entry.name}`)
            linked++
        }
        catch (e) {
            warn(`Failed to link ${entry.name}: ${e}`)
        }
    }

    log(`\n${linked} linked, ${skipped} skipped.`)
}
