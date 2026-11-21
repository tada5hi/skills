#!/usr/bin/env node
// Facts for upstream-features-adopt. Read-only; prints JSON.
// Usage:
//   node upgrades.mjs changed <from ref> [<to ref>]  direct npm dependencies whose resolved version changed (to: the working tree)
//   node upgrades.mjs diff <package> <from> <to>     exported names added, removed and newly deprecated between two published versions
//   node upgrades.mjs --test                         self-check
import { execFile } from 'node:child_process';
import {
    mkdir,
    mkdtemp,
    readFile,
    readdir,
    rm,
    writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { promisify } from 'node:util';
import assert from 'node:assert/strict';

const run = promisify(execFile);
const MAX_BUFFER = 256 * 1024 * 1024;
const DEPENDENCY_FIELDS = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];
const DECLARATION_FILE = /\.d\.(?:ts|mts|cts)$/;
const DECLARATION = /(\/\*\*(?:(?!\*\/)[\s\S])*\*\/\s*)?(export\s+)?(?:declare\s+)?(?:default\s+)?(?:abstract\s+)?(?:async\s+)?(?:function\*?|class|const|let|var|type|interface|enum|namespace)\s+([A-Za-z_$][\w$]*)/g;
const EXPORT_LIST = /export\s+(?:type\s+)?\{([^}]*)\}(?!\s*from)/g;
const EXPORT_FROM = /export\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g;
const EXPORT_STAR = /export\s+(?:type\s+)?\*\s*from\s*['"]([^'"]+)['"]/g;
const EXPORT_NAMESPACE = /export\s+(?:type\s+)?\*\s*as\s+([A-Za-z_$][\w$]*)\s+from/g;

// ---- versions ----

function parseVersion(version) {
    const match = /^(\d+)\.(\d+)\.(\d+)/.exec(version ?? '');

    return match ? match.slice(1, 4).map(Number) : null;
}

const isPrerelease = (version) => /^\d+\.\d+\.\d+-/.test(version ?? '');

/** `patch`, `minor`, `major` (a 0.x minor counts as major, as npm's caret does), or `unknown`. */
export function bumpKind(from, to) {
    const a = parseVersion(from);
    const b = parseVersion(to);

    if (!a || !b) {
        return 'unknown';
    }

    if (a[0] !== b[0] || (a[0] === 0 && a[1] !== b[1])) {
        return 'major';
    }

    if (a[1] !== b[1]) {
        return 'minor';
    }

    // 2.0.0-beta.1 -> 2.0.0-beta.2 or -> 2.0.0 can add any API: no stable patch
    return isPrerelease(from) || isPrerelease(to) ? 'unknown' : 'patch';
}

/** Ascending by major, minor, patch; an unparsable version sorts first. */
export function compareVersions(a, b) {
    const [x, y] = [parseVersion(a) ?? [-1, -1, -1], parseVersion(b) ?? [-1, -1, -1]];

    return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
}

// ---- changed ----

/**
 * The direct dependencies of the root (`.`) and every workspace in a package-lock v2/v3, one row per declaring
 * workspace: the published package it resolves to (an `npm:` alias names another one) and its version.
 */
export function directVersions(lock) {
    if (!lock || typeof lock.packages !== 'object' || lock.packages === null) {
        throw new Error('Not a package-lock v2/v3 (no "packages"); only npm lockfiles are supported.');
    }

    const { packages } = lock;
    const out = new Map();

    for (const [path, entry] of Object.entries(packages)) {
        if (path.includes('node_modules/')) {
            continue;
        }

        for (const field of DEPENDENCY_FIELDS) {
            for (const name of Object.keys(entry[field] ?? {})) {
                const nested = path === '' ? undefined : packages[`${path}/node_modules/${name}`];
                const resolved = nested ?? packages[`node_modules/${name}`];

                if (resolved?.version && !resolved.link) {
                    const workspace = path === '' ? '.' : path;

                    out.set(`${workspace}\0${name}`, {
                        workspace,
                        name,
                        package: resolved.name ?? name,
                        version: resolved.version,
                    });
                }
            }
        }
    }

    return out;
}

/**
 * The version transitions of direct dependencies, compared per declaring workspace (a workspace moving onto a
 * version another one already had is still a bump), then merged: one row per name, package, from and to.
 */
export function changedDependencies(before, after) {
    const old = directVersions(before);
    const rows = new Map();

    for (const [key, now] of directVersions(after)) {
        const previous = old.get(key);

        // a new dependency or a swapped alias target has no earlier version to diff against
        if (!previous || previous.package !== now.package || previous.version === now.version) {
            continue;
        }

        const id = [now.name, now.package, previous.version, now.version].join('\0');
        const row = rows.get(id) ?? {
            name: now.name,
            package: now.package,
            from: previous.version,
            to: now.version,
            kind: bumpKind(previous.version, now.version),
            workspaces: [],
        };

        row.workspaces.push(now.workspace);
        rows.set(id, row);
    }

    const rank = {
        major: 0,
        unknown: 1,
        minor: 2,
        patch: 3,
    };

    return [...rows.values()].sort((a, b) => rank[a.kind] - rank[b.kind] ||
        a.name.localeCompare(b.name) ||
        compareVersions(a.from, b.from));
}

async function lockfileAt(ref) {
    // `<ref>:./<path>` resolves the path against the working directory, so this works below the repository root
    const { stdout } = await run('git', ['show', `${ref}:./package-lock.json`], { maxBuffer: MAX_BUFFER });

    return JSON.parse(stdout);
}

/** Changed direct dependencies between two refs; without `to`, against the lockfile in the working tree. */
async function changed(from, to) {
    const before = await lockfileAt(from);
    const after = to ? await lockfileAt(to) : JSON.parse(await readFile('package-lock.json', 'utf8'));

    return changedDependencies(before, after);
}

// ---- diff ----

/** Exported names of one declaration file: name -> { deprecated, local }. */
export function exportsOf(source) {
    const declared = new Map();
    const exported = new Map();

    for (const match of source.matchAll(DECLARATION)) {
        const deprecated = /@deprecated\b/.test(match[1] ?? '');
        const name = match[3];

        declared.set(name, deprecated || declared.get(name) === true);

        if (match[2]) {
            exported.set(name, { deprecated, local: name });
        }
    }

    for (const [regex, fromModule] of [[EXPORT_LIST, false], [EXPORT_FROM, true]]) {
        for (const match of source.matchAll(regex)) {
            for (const part of match[1].split(',')) {
                const [local, alias] = part.replace(/^\s*type\s+/, '').split(/\s+as\s+/).map((s) => s.trim());

                if (!local || local === '*') {
                    continue;
                }

                exported.set(alias ?? local, {
                    deprecated: fromModule ? false : declared.get(local) === true,
                    local,
                });
            }
        }
    }

    for (const match of source.matchAll(EXPORT_NAMESPACE)) {
        exported.set(match[1], { deprecated: false, local: match[1] });
    }

    return exported;
}

export function compareExports(before, after) {
    const added = [];
    const removed = [];
    const deprecated = [];

    for (const [name, info] of after) {
        if (!before.has(name)) {
            added.push(name);
        } else if (info.deprecated && !before.get(name).deprecated) {
            deprecated.push(name);
        }
    }

    for (const name of before.keys()) {
        if (!after.has(name)) {
            removed.push(name);
        }
    }

    return {
        added: added.sort(),
        removed: removed.sort(),
        deprecated: deprecated.sort(),
    };
}

async function walk(dir) {
    const out = [];

    for (const entry of await readdir(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);

        if (entry.isDirectory() && entry.name !== 'node_modules') {
            out.push(...await walk(path));
        } else if (entry.isFile() && DECLARATION_FILE.test(entry.name)) {
            out.push(path);
        }
    }

    return out;
}

async function unpack(name, version, root) {
    const dir = join(root, version);

    await mkdir(dir, { recursive: true });
    await run('npm', ['pack', `${name}@${version}`, '--pack-destination', dir, '--ignore-scripts'], { maxBuffer: MAX_BUFFER });

    const tarball = (await readdir(dir)).find((file) => file.endsWith('.tgz'));

    // an npm tarball holds one `package/` folder; never keep the archive's owners
    await run('tar', ['-xzf', join(dir, tarball), '-C', dir, '--no-same-owner']);

    return join(dir, 'package');
}

/** The declaration files a consumer's import reaches: the `types` targets of `exports`, else `types`/`typings`. */
export function typeEntries(manifest) {
    const out = new Set();
    const visit = (value) => {
        if (typeof value === 'string') {
            if (DECLARATION_FILE.test(value)) {
                out.add(value);
            }
        } else if (value && typeof value === 'object') {
            Object.values(value).forEach(visit);
        }
    };

    visit(manifest.exports);

    for (const field of ['types', 'typings']) {
        if (typeof manifest[field] === 'string') {
            out.add(manifest[field]);
        }
    }

    return [...out].map((path) => path.replace(/^\.\//, ''));
}

const RUNTIME_FILE = /\.(?:[mc]?js)$/;

/**
 * The runtime entry files of a package without type entries (`exports` targets, else `main`, else `index.js`),
 * whose declaration counterparts (`index.js` -> `index.d.ts`) are its public types when it ships them side by side.
 */
export function runtimeEntries(manifest) {
    const out = new Set();
    const visit = (value) => {
        if (typeof value === 'string') {
            if (RUNTIME_FILE.test(value) && !value.includes('*')) {
                out.add(value);
            }
        } else if (value && typeof value === 'object') {
            Object.values(value).forEach(visit);
        }
    };

    visit(manifest.exports);

    if (out.size === 0 && manifest.exports === undefined) {
        out.add(typeof manifest.main === 'string' ? manifest.main : 'index.js');
    }

    return [...out].map((path) => path.replace(/^\.\//, ''));
}

async function readIfExists(path) {
    try {
        return await readFile(path, 'utf8');
    } catch {
        return undefined;
    }
}

/** The declaration file a relative specifier of `from` points at (`./x.js` -> `./x.d.ts`, `.d.mts`, ...). */
async function resolveDeclaration(from, specifier) {
    if (DECLARATION_FILE.test(specifier)) {
        return await readIfExists(join(dirname(from), specifier)) === undefined ? undefined : join(dirname(from), specifier);
    }

    const path = join(dirname(from), specifier);
    const extension = /\.([mc]?)(?:js|ts)$/.exec(path);
    const base = extension ? path.slice(0, -extension[0].length) : path;
    // TypeScript's own pairing: `.mjs` -> `.d.mts`, `.cjs` -> `.d.cts`, `.js` (or none) -> `.d.ts`
    const own = extension && extension[1] ? `${base}.d.${extension[1]}ts` : `${base}.d.ts`;
    const candidates = extension ? [own] : [own, `${base}.d.mts`, `${base}.d.cts`, join(base, 'index.d.ts')];

    for (const candidate of candidates) {
        if (await readIfExists(candidate) !== undefined) {
            return candidate;
        }
    }

    return undefined;
}

async function publicNames(file, seen = new Set()) {
    const out = new Map();
    const source = seen.has(file) ? undefined : await readIfExists(file);

    if (source === undefined) {
        return out;
    }

    seen.add(file);

    for (const [name, info] of exportsOf(source)) {
        out.set(name, info);
    }

    for (const match of source.matchAll(EXPORT_STAR)) {
        if (match[1].startsWith('.')) {
            const target = await resolveDeclaration(file, match[1]);

            if (target) {
                for (const [name, info] of await publicNames(target, seen)) {
                    if (!out.has(name)) {
                        out.set(name, info);
                    }
                }
            }
        }
    }

    return out;
}

async function packageExports(dir) {
    const manifest = JSON.parse(await readFile(join(dir, 'package.json'), 'utf8'));
    const files = await walk(dir);
    const declarations = new Map();

    for (const file of files) {
        for (const match of (await readFile(file, 'utf8')).matchAll(DECLARATION)) {
            const current = declarations.get(match[3]);

            declarations.set(match[3], {
                file: current?.file ?? relative(dir, file),
                deprecated: current?.deprecated === true || /@deprecated\b/.test(match[1] ?? ''),
            });
        }
    }

    let entries = typeEntries(manifest).filter((path) => !path.includes('*')).map((path) => join(dir, path));

    // no type entry: the declaration files next to the runtime entries; never every declaration file, which
    // would count tests and internals no consumer can import (no entry at all reads as zero coverage)
    if (entries.length === 0) {
        const resolved = await Promise.all(runtimeEntries(manifest).map((path) => resolveDeclaration(join(dir, 'package.json'), `./${path}`)));

        entries = [...new Set(resolved.filter(Boolean))];
    }

    const names = new Map();

    for (const file of entries) {
        for (const [name, info] of await publicNames(file)) {
            const declared = declarations.get(name) ?? declarations.get(info.local);

            names.set(name, {
                file: declared?.file ?? relative(dir, file),
                deprecated: info.deprecated || declared?.deprecated === true || names.get(name)?.deprecated === true,
            });
        }
    }

    return {
        names,
        files: new Map(await Promise.all(files.map(async (file) => [relative(dir, file), await readFile(file, 'utf8')]))),
        entries: entries.length,
        subpaths: Object.keys(typeof manifest.exports === 'object' && manifest.exports !== null ? manifest.exports : {}),
        manifest,
    };
}

async function diff(name, from, to) {
    const root = await mkdtemp(join(tmpdir(), 'adopt-upgrades-'));
    let oldDir;
    let newDir;
    let before;
    let after;

    try {
        [oldDir, newDir] = [await unpack(name, from, root), await unpack(name, to, root)];
        [before, after] = [await packageExports(oldDir), await packageExports(newDir)];
    } catch (err) {
        // on success the packages stay for reading (`root`); a failed diff leaves nothing behind
        await rm(root, { recursive: true, force: true });

        throw err;
    }

    const names = compareExports(before.names, after.names);

    return {
        package: name,
        from,
        to,
        kind: bumpKind(from, to),
        ...names,
        files: Object.fromEntries(names.added.map((n) => [n, after.names.get(n).file])),
        subpaths: {
            added: after.subpaths.filter((s) => !before.subpaths.includes(s)),
            removed: before.subpaths.filter((s) => !after.subpaths.includes(s)),
        },
        // new members and options of existing exports show up only here: read these files' diffs
        declarations: declarationChanges(before.files, after.files),
        // 0 names in either version: the types are not readable this way (`export =`, no declarations, a
        // pattern subpath), so an empty diff says nothing; read the declarations by hand
        coverage: {
            entries: { from: before.entries, to: after.entries },
            names: { from: before.names.size, to: after.names.size },
        },
        engines: { from: before.manifest.engines ?? null, to: after.manifest.engines ?? null },
        dirs: { from: oldDir, to: newDir },
        // delete when done: both versions and their tarballs
        root,
    };
}

/**
 * Declaration files whose text changed between two versions, by relative path, most changed lines first. A
 * bundler's hashed chunk names (`types-Drq05SzI.d.mts`) differ every release, so those files count as added and
 * removed instead.
 */
export function declarationChanges(before, after) {
    const lines = (text) => new Set(text.split('\n').map((line) => line.trim()).filter(Boolean));
    const changed = [];

    for (const [file, text] of after) {
        const old = before.get(file);

        if (old !== undefined && old !== text) {
            const [a, b] = [lines(old), lines(text)];
            const delta = [...b].filter((line) => !a.has(line)).length + [...a].filter((line) => !b.has(line)).length;

            changed.push({ file, lines: delta });
        }
    }

    changed.sort((x, y) => y.lines - x.lines || x.file.localeCompare(y.file));

    return {
        changed,
        added: [...after.keys()].filter((file) => !before.has(file)).sort(),
        removed: [...before.keys()].filter((file) => !after.has(file)).sort(),
    };
}

// ---- self-test ----

async function writeFiles(dir, files) {
    for (const [path, text] of Object.entries(files)) {
        await mkdir(dirname(join(dir, path)), { recursive: true });
        await writeFile(join(dir, path), text);
    }
}

/** Package-level cases: `export type *` is followed; without type entries, only declarations next to the runtime entries count. */
async function selfTestPackages() {
    const root = await mkdtemp(join(tmpdir(), 'adopt-upgrades-test-'));

    try {
        const star = join(root, 'star');

        await writeFiles(star, {
            'package.json': JSON.stringify({ exports: { '.': { types: './index.d.ts' } } }),
            'index.d.ts': "export type * from './models.js';\n",
            'models.d.ts': 'export interface Model {}\n',
        });
        assert.deepEqual([...(await packageExports(star)).names.keys()], ['Model']);

        const runtime = join(root, 'runtime');

        await writeFiles(runtime, {
            'package.json': JSON.stringify({ exports: { '.': './dist/index.js' } }),
            'dist/index.js': '',
            'dist/index.d.ts': 'export declare function a(): void;\n',
            'test/fixture.d.ts': 'export interface Fixture {}\n',
        });
        assert.deepEqual([...(await packageExports(runtime)).names.keys()], ['a']);

        // an import and a require entry each read their own declarations
        const dual = join(root, 'dual');

        await writeFiles(dual, {
            'package.json': JSON.stringify({ exports: { '.': { import: './dist/index.mjs', require: './dist/index.cjs' } } }),
            'dist/index.mjs': '',
            'dist/index.cjs': '',
            'dist/index.d.ts': 'export declare function shared(): void;\n',
            'dist/index.d.mts': 'export declare function esm(): void;\n',
            'dist/index.d.cts': 'export declare function cjs(): void;\n',
        });
        assert.deepEqual([...(await packageExports(dual)).names.keys()].sort(), ['cjs', 'esm']);

        const none = join(root, 'none');

        await writeFiles(none, {
            'package.json': JSON.stringify({ exports: { '.': './dist/index.js' } }),
            'dist/index.js': '',
            'test/fixture.d.ts': 'export interface Fixture {}\n',
        });

        const untyped = await packageExports(none);

        assert.equal(untyped.names.size, 0);
        assert.equal(untyped.entries, 0);
    } finally {
        await rm(root, { recursive: true, force: true });
    }
}

function selfTest() {
    assert.equal(bumpKind('1.2.3', '1.2.4'), 'patch');
    assert.equal(bumpKind('1.2.3', '1.3.0'), 'minor');
    assert.equal(bumpKind('1.2.3', '2.0.0'), 'major');
    assert.equal(bumpKind('0.8.1', '0.9.0'), 'major');
    assert.equal(bumpKind('latest', '1.0.0'), 'unknown');
    assert.equal(bumpKind('2.0.0-beta.1', '2.0.0-beta.2'), 'unknown');
    assert.equal(bumpKind('2.0.0-rc.1', '2.0.0'), 'unknown');
    assert.equal(bumpKind('1.9.0', '2.0.0-beta.1'), 'major');

    const lock = (zod, chamvi, nested) => ({
        packages: {
            '': { devDependencies: { zod: '^4' }, workspaces: ['packages/*'] },
            'packages/a': { dependencies: { '@chamvi/app': '^0', '@x/a': '*' } },
            'node_modules/zod': { version: zod },
            'node_modules/@chamvi/app': { version: chamvi },
            'node_modules/@x/a': { resolved: 'packages/a', link: true },
            'node_modules/transitive': { version: '9.9.9' },
            ...(nested ? { 'packages/a/node_modules/@chamvi/app': { version: nested } } : {}),
        },
    });

    assert.deepEqual(changedDependencies(lock('4.1.0', '0.8.0'), lock('4.2.0', '0.9.0')), [
        {
            name: '@chamvi/app',
            package: '@chamvi/app',
            from: '0.8.0',
            to: '0.9.0',
            kind: 'major',
            workspaces: ['packages/a'],
        },
        {
            name: 'zod',
            package: 'zod',
            from: '4.1.0',
            to: '4.2.0',
            kind: 'minor',
            workspaces: ['.'],
        },
    ]);
    assert.deepEqual(changedDependencies(lock('4.1.0', '0.9.0'), lock('4.1.0', '0.9.0', '0.9.1')), [
        {
            name: '@chamvi/app',
            package: '@chamvi/app',
            from: '0.9.0',
            to: '0.9.1',
            kind: 'patch',
            workspaces: ['packages/a'],
        },
    ]);

    // compared per workspace: b moving onto the version a already had is a bump; equal transitions merge
    const multi = (versions) => ({
        packages: {
            '': { dependencies: { x: '*' } },
            'packages/a': { dependencies: { x: '*' } },
            'packages/b': { dependencies: { x: '*' } },
            'node_modules/x': { version: versions[0] },
            'packages/a/node_modules/x': { version: versions[1] },
            'packages/b/node_modules/x': { version: versions[2] },
        },
    });

    assert.deepEqual(changedDependencies(multi(['9.0.0', '10.0.0', '9.0.0']), multi(['10.0.0', '11.0.0', '10.0.0'])), [
        {
            name: 'x',
            package: 'x',
            from: '9.0.0',
            to: '10.0.0',
            kind: 'major',
            workspaces: ['.', 'packages/b'],
        },
        {
            name: 'x',
            package: 'x',
            from: '10.0.0',
            to: '11.0.0',
            kind: 'major',
            workspaces: ['packages/a'],
        },
    ]);
    assert.deepEqual(changedDependencies(multi(['2.0.0', '2.0.0', '1.0.0']), multi(['2.0.0', '2.0.0', '2.0.0'])), [{
        name: 'x',
        package: 'x',
        from: '1.0.0',
        to: '2.0.0',
        kind: 'major',
        workspaces: ['packages/b'],
    }]);

    // an npm alias reports the package it installs; a v1 lockfile is refused

    const alias = (target, version) => ({
        packages: {
            '': { dependencies: { str: 'npm:string-width@^7' } },
            'node_modules/str': { name: target, version },
        },
    });

    assert.deepEqual(changedDependencies(alias('string-width', '7.0.0'), alias('string-width', '7.1.0')), [{
        name: 'str',
        package: 'string-width',
        from: '7.0.0',
        to: '7.1.0',
        kind: 'minor',
        workspaces: ['.'],
    }]);
    assert.deepEqual(changedDependencies(alias('string-width', '7.0.0'), alias('other', '7.1.0')), []);
    assert.throws(() => changedDependencies({ lockfileVersion: 1, dependencies: {} }, {}), /package-lock v2\/v3/);

    const v1 = [
        'export declare function a(): void;',
        'declare function b(x: string): void;',
        'interface Options { x: number }',
        'export { b, b as c };',
        'export type { Options };',
    ].join('\n');
    const v2 = [
        'export declare function a(): void;',
        '/** @deprecated use d */',
        'declare function b(x: string): void;',
        'declare function d(): void;',
        'interface Options { x: number }',
        'export { b, d };',
        'export type { Options };',
        "export { e } from './e.js';",
    ].join('\n');

    assert.deepEqual(compareExports(exportsOf(v1), exportsOf(v2)), {
        added: ['d', 'e'],
        removed: ['c'],
        deprecated: ['b'],
    });

    assert.deepEqual(typeEntries({
        types: './dist/index.d.ts',
        exports: { '.': { types: './dist/index.d.mts', default: './dist/index.mjs' }, './sub': { import: { types: './dist/sub.d.mts' } } },
    }), ['dist/index.d.mts', 'dist/sub.d.mts', 'dist/index.d.ts']);
    assert.ok(exportsOf("export * as ns from './ns.js';").has('ns'));
    assert.ok(exportsOf("export type * as models from './models.js';").has('models'));
    assert.deepEqual(runtimeEntries({ exports: { '.': './dist/index.js', './p/*': './dist/p/*.js' } }), ['dist/index.js']);
    assert.deepEqual(runtimeEntries({ main: 'lib/main.js' }), ['lib/main.js']);
    assert.deepEqual(runtimeEntries({}), ['index.js']);

    assert.deepEqual(declarationChanges(
        new Map([['a.d.ts', 'x\ny'], ['b.d.ts', 'same'], ['old-1.d.ts', 'z']]),
        new Map([['a.d.ts', 'x\ny\nw'], ['b.d.ts', 'same'], ['old-2.d.ts', 'z']]),
    ), {
        changed: [{ file: 'a.d.ts', lines: 1 }],
        added: ['old-2.d.ts'],
        removed: ['old-1.d.ts'],
    });

    console.log('ok');
}

const [command, ...args] = process.argv.slice(2);

// one line on stderr and exit 1, never a stack: a missing lockfile or ref, a package npm cannot fetch
process.on('uncaughtException', (err) => {
    const lines = (err.stderr || err.message).trim().split('\n');

    console.error(`upgrades.mjs: ${lines.find((line) => /error|fatal|ERR!/i.test(line)) ?? lines[0]}`);
    process.exit(1);
});

if (command === '--test') {
    selfTest();
    await selfTestPackages();
    console.log('packages ok');
} else if (command === 'changed' && args[0] && args.length <= 2) {
    console.log(JSON.stringify(await changed(args[0], args[1]), null, 2));
} else if (command === 'diff' && args.length === 3) {
    console.log(JSON.stringify(await diff(...args), null, 2));
} else {
    console.error('Usage: node upgrades.mjs changed <from ref> [<to ref>] | diff <package> <from> <to> | --test');
    process.exit(1);
}
