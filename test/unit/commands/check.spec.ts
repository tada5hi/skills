import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { VendorSkillMeta } from '../../../src/meta.ts'

const mockExec = vi.fn()
const mockExecSafe = vi.fn()
const mockExistsSync = vi.fn()

const mockVendors: Record<string, VendorSkillMeta> = {}

vi.mock('../../../src/meta.ts', () => ({
    manual: ['init-agent-docs', 'update-agent-docs', 'link-skills'],
    get vendors() { return mockVendors },
}))

vi.mock('../../../src/utils.ts', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../../src/utils.ts')>()
    return {
        ...actual,
        exec: (...args: unknown[]) => mockExec(...args),
        execSafe: (...args: unknown[]) => mockExecSafe(...args),
    }
})

vi.mock('node:fs', async (importOriginal) => {
    const actual = await importOriginal<typeof import('node:fs')>()
    return {
        ...actual,
        existsSync: (...args: unknown[]) => mockExistsSync(...args),
    }
})

import { cmdCheck } from '../../../src/commands/check.ts'

describe('commands/check', () => {
    it('should not throw when no vendors are configured', () => {
        expect(() => cmdCheck()).not.toThrow()
    })
})

describe('commands/check with vendors', () => {
    beforeEach(() => {
        vi.resetAllMocks()

        mockVendors['test-repo'] = {
            official: true,
            source: 'https://github.com/org/test-repo',
            skills: { 'source-skill': 'output-skill' },
        }
    })

    afterEach(() => {
        for (const key of Object.keys(mockVendors)) {
            delete mockVendors[key]
        }
    })

    it('should report when vendor has updates available', () => {
        mockExec.mockReturnValue('')
        mockExistsSync.mockReturnValue(true)
        mockExecSafe.mockReturnValue('3')

        expect(() => cmdCheck()).not.toThrow()
        expect(mockExec).toHaveBeenCalledWith('git submodule foreach git fetch')
        expect(mockExecSafe).toHaveBeenCalledWith(
            'git rev-list HEAD..origin/HEAD --count',
            expect.stringContaining('test-repo'),
        )
    })

    it('should report up to date when behind count is 0', () => {
        mockExec.mockReturnValue('')
        mockExistsSync.mockReturnValue(true)
        mockExecSafe.mockReturnValue('0')

        expect(() => cmdCheck()).not.toThrow()
    })

    it('should warn instead of comparing when the submodule is not initialized', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        mockExec.mockReturnValue('')
        mockExistsSync.mockReturnValue(false)

        expect(() => cmdCheck()).not.toThrow()
        expect(mockExistsSync).toHaveBeenCalledWith(expect.stringMatching(/test-repo[\\/]\.git$/))
        expect(mockExecSafe).not.toHaveBeenCalled()
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('not initialized'))
        warnSpy.mockRestore()
    })

    it('should warn and return early when fetch fails', () => {
        mockExec.mockImplementation(() => { throw new Error('fetch failed') })

        expect(() => cmdCheck()).not.toThrow()
        expect(mockExecSafe).not.toHaveBeenCalled()
    })

    it('should warn instead of reporting up to date when the comparison fails', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
        mockExec.mockReturnValue('')
        mockExistsSync.mockReturnValue(true)
        mockExecSafe.mockReturnValue(null)

        expect(() => cmdCheck()).not.toThrow()
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('could not compare'))
        expect(logSpy).not.toHaveBeenCalledWith(expect.stringContaining('up to date'))
        warnSpy.mockRestore()
        logSpy.mockRestore()
    })
})
