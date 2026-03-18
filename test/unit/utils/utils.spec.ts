import { describe, expect, it } from 'vitest'
import { exec, execSafe, root } from '../../../src/utils.ts'

describe('utils', () => {
    describe('root', () => {
        it('should be an absolute path', () => {
            expect(root).toBeTruthy()
            // root should end with the project directory name
            expect(root).toMatch(/skills[/\\]?$/)
        })
    })

    describe('exec', () => {
        it('should execute a command and return trimmed output', () => {
            const result = exec('echo hello')
            expect(result).toBe('hello')
        })

        it('should throw on invalid command', () => {
            expect(() => exec('nonexistent_command_xyz')).toThrow()
        })

        it('should accept a custom cwd', () => {
            const result = exec('pwd', root)
            expect(result).toBeTruthy()
        })
    })

    describe('execSafe', () => {
        it('should return output on success', () => {
            const result = execSafe('echo safe')
            expect(result).toBe('safe')
        })

        it('should return null on failure', () => {
            const result = execSafe('nonexistent_command_xyz')
            expect(result).toBeNull()
        })
    })
})
