import { describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/meta.ts', () => ({
    manual: ['init-agent-docs', 'update-agent-docs', 'link-skills'],
    vendors: {},
}))

import { cmdSync } from '../../../src/commands/sync.ts'

describe('commands/sync', () => {
    it('should not throw when no vendors are configured', () => {
        expect(() => cmdSync()).not.toThrow()
    })
})
