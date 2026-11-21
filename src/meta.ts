import type { IVendorSkillMeta } from './types.ts';


/**
 * Hand-maintained skills authored in this repository.
 * Each entry must match a directory under `skills/`.
 *
 * prd-to-issues, prd-to-plan, refactor-plan-request, issue-triage and prd-write are
 * frozen copies of mattpocock/skills@fb3629d (MIT, see their LICENSE.md), the last three
 * renamed from request-refactor-plan, triage-issue and write-a-prd. Upstream removed
 * them; its successors need an issue tracker set up through /setup-matt-pocock-skills.
 */
export const manual: string[] = [
    'agent-docs-init',
    'agent-docs-migrate',
    'agent-docs-update',
    'api-query',
    'commit-message-generate',
    'impact-analyze',
    'issue-triage',
    'package-list-query',
    'package-list-refresh',
    'plan-status-report',
    'pr-comments-investigate',
    'pr-create',
    'prd-to-issues',
    'prd-to-plan',
    'prd-write',
    'readme-write',
    'refactor-plan-request',
    'release-notes-write',
    'release-versions-align',
    'skills-link',
    'ts-project-init',
    'type-boundaries-audit',
    'upstream-features-adopt',
    'upstream-fixes-track',
    'vitepress-site-redesign',
];

/**
 * External repositories that already maintain their own skills.
 * Cloned as submodules under `vendor/<key>/` and synced into `skills/`.
 */
export const vendors: Record<string, IVendorSkillMeta> = {
    'cloudflare-security-audit': {
        official: true,
        source: 'https://github.com/cloudflare/security-audit-skill',
        skills: { 'security-audit': 'security-audit' },
    },
    'mattpocock-skills': {
        source: 'https://github.com/mattpocock/skills',
        skills: {
            'engineering/tdd': 'tdd',
            'engineering/improve-codebase-architecture': 'improve-codebase-architecture',
            // shared vocabulary that tdd and improve-codebase-architecture invoke
            'engineering/codebase-design': 'codebase-design',
            'productivity/grill-me': 'grill-me',
            // grill-me delegates to grilling
            'productivity/grilling': 'grilling',
            'productivity/writing-for-agents': 'writing-for-agents',
            'engineering/research': 'research',
        },
    },
    'dietrichgebert-ponytail': {
        source: 'https://github.com/DietrichGebert/ponytail',
        skills: { ponytail: 'ponytail' },
    },
};
