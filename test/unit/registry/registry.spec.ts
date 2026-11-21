import { describe, expect, it } from 'vitest';
import {
    getExistingSkillNames,
    getExpectedSkillNames,
    getVendorProjects,
} from '../../../src/registry.ts';

describe('registry', () => {
    describe('getExpectedSkillNames', () => {
        it('should include all manual skills', () => {
            const expected = getExpectedSkillNames();

            expect(expected.has('agent-docs-init')).toBe(true);
            expect(expected.has('agent-docs-update')).toBe(true);
            expect(expected.has('skills-link')).toBe(true);
        });

        it('should return a Set', () => {
            const expected = getExpectedSkillNames();

            expect(expected).toBeInstanceOf(Set);
        });
    });

    describe('getVendorProjects', () => {
        it('should return an array', () => {
            const projects = getVendorProjects();

            expect(Array.isArray(projects)).toBe(true);
        });

        it('should have correct shape for each project', () => {
            const projects = getVendorProjects();

            for (const p of projects) {
                expect(p).toHaveProperty('name');
                expect(p).toHaveProperty('url');
                expect(p).toHaveProperty('path');
                expect(p.path).toMatch(/^vendor\//);
            }
        });
    });

    describe('getExistingSkillNames', () => {
        it('should return existing skill directory names', () => {
            const names = getExistingSkillNames();

            expect(names).toContain('agent-docs-init');
            expect(names).toContain('agent-docs-update');
            expect(names).toContain('skills-link');
        });

        it('should return an array of strings', () => {
            const names = getExistingSkillNames();

            expect(Array.isArray(names)).toBe(true);

            for (const name of names) {
                expect(typeof name).toBe('string');
            }
        });
    });
});
