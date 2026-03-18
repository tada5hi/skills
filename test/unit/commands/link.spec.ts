import { existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import { cmdLink } from '../../../src/commands/link.ts'
import { root } from '../../../src/utils.ts'

describe('commands/link', () => {
    const targetDir = join(root, '.claude', 'skills')

    it('should create .claude/skills/ directory', () => {
        cmdLink()
        expect(existsSync(targetDir)).toBe(true)
    })

    it('should link all skills that have SKILL.md', () => {
        cmdLink()

        const expected = ['init-agent-docs', 'update-agent-docs', 'link-skills']
        for (const name of expected) {
            const skillMd = join(targetDir, name, 'SKILL.md')
            expect(existsSync(skillMd), `${name}/SKILL.md should exist`).toBe(true)
        }
    })

    it('should be idempotent (safe to run twice)', () => {
        cmdLink()
        // Running again should not throw
        expect(() => cmdLink()).not.toThrow()
    })

    describe('with a removed link', () => {
        const testSkill = 'link-skills'
        const testTarget = join(targetDir, testSkill)

        beforeEach(() => {
            // Ensure links exist first
            cmdLink()
            // Remove one link
            if (existsSync(testTarget)) {
                rmSync(testTarget, { recursive: true, force: true })
            }
        })

        it('should recreate a missing link', () => {
            expect(existsSync(testTarget)).toBe(false)
            cmdLink()
            expect(existsSync(join(testTarget, 'SKILL.md'))).toBe(true)
        })
    })
})
