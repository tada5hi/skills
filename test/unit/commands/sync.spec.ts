import {
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import { cmdSync } from '../../../src/commands/sync.ts';

vi.mock('../../../src/meta.ts', () => ({
    manual: ['agent-docs-init', 'agent-docs-update', 'skills-link'],
    vendors: {},
}));

describe('commands/sync', () => {
    it('should not throw when no vendors are configured', () => {
        expect(() => cmdSync()).not.toThrow();
    });
});
