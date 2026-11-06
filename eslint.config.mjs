import config from '@tada5hi/eslint-config';

export default config(
    {},
    // Authored skills run on the documented Node 22 baseline.
    { files: ['skills/**/*.mjs'], rules: { 'unicorn/prefer-iterator-to-array': 'off', 'unicorn/prefer-regexp-escape': 'off' } },
    // Security audit scripts are maintained by their upstream vendor.
    { ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**', '**/writable/**', '**/.nuxt/**', '**/.output/**', 'vendor/**', 'skills/security-audit/**'] },
);
