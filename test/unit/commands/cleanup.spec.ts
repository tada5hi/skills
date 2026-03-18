import { describe, expect, it } from 'vitest'
import { cmdCleanup } from '../../../src/commands/cleanup.ts'

describe('commands/cleanup', () => {
    it('should not throw when everything is clean', () => {
        expect(() => cmdCleanup()).not.toThrow()
    })
})
