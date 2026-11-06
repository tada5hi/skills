import {
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import { cmdInit } from '../../../src/commands/init.ts';

// Mock meta.ts to test with fake vendor config
vi.mock('../../../src/meta.ts', () => ({
    manual: ['init-agent-docs', 'update-agent-docs', 'link-skills'],
    vendors: {},
}));

describe('commands/init', () => {
    it('should not throw when no vendors are configured', () => {
        expect(() => cmdInit()).not.toThrow();
    });
});
