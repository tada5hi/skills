import { describe, expect, it } from 'vitest'
import {
    getExistingSubmodulePaths,
    submoduleExists,
} from '../../../src/submodule.ts'

describe('submodule', () => {
    describe('submoduleExists', () => {
        it('should return false for a non-existent submodule', () => {
            expect(submoduleExists('vendor/does-not-exist')).toBe(false)
        })
    })

    describe('getExistingSubmodulePaths', () => {
        it('should return an array', () => {
            const paths = getExistingSubmodulePaths()
            expect(Array.isArray(paths)).toBe(true)
        })

        it('should return strings', () => {
            const paths = getExistingSubmodulePaths()
            for (const p of paths) {
                expect(typeof p).toBe('string')
            }
        })
    })
})
