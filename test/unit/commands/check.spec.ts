import { describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/meta.ts', () => ({
    manual: ['init-agent-docs', 'update-agent-docs', 'link-skills'],
    vendors: {},
}))

import { cmdCheck } from '../../../src/commands/check.ts'

describe('commands/check', () => {
    it('should not throw when no vendors are configured', () => {
        expect(() => cmdCheck()).not.toThrow()
    })
})
