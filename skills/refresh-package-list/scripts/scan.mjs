#!/usr/bin/env node
// Diff an awesome-style package list against GitHub and npm. Read-only; prints a Markdown report.
// Usage: node scan.mjs <README.md>      Self-check: node scan.mjs --test
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import assert from 'node:assert/strict';

const run = promisify(execFile);
const gh = async (...args) => (await run('gh', args, { maxBuffer: 64 * 1024 * 1024 })).stdout;
// Only "does not exist" counts as absent; rate limits and network errors abort the scan instead of becoming false findings.
const absent = (fallback) => (err) => {
    if (/HTTP 404|Could not resolve to a Repository/.test(`${err.stderr}${err.message}`)) return fallback;
    throw err;
};
const ghRaw = (repo, path) => gh('api', `repos/${repo}/contents/${path}`, '-H', 'Accept: application/vnd.github.raw').catch(absent(undefined));
const ghJson = async (repo, path) => {
    const raw = await ghRaw(repo, path);
    try { return raw && JSON.parse(raw); } catch { return undefined; }
};

async function mapLimit(items, limit, fn) {
    const out = new Array(items.length);
    let i = 0;
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (i < items.length) { const k = i++; out[k] = await fn(items[k]); }
    }));
    return out;
}

const ENTRY = /^- \[([^\]]+)\]\(https:\/\/github\.com\/([^/\s)]+\/[^/\s)]+)\)\s+`(\w+):\s*([^`]+)`\s+[–-]\s+(.+)$/;

export function parseList(source) {
    const markdown = source.replace(/\r\n?/g, '\n');
    const config = { owners: [], exclude: new Map() };
    const block = markdown.match(/<!--\s*package-list\b([\s\S]*?)-->/);
    let inExclude = false;
    for (const line of block ? block[1].split('\n') : []) {
        const owners = line.match(/^\s*owners:\s*(.+)$/);
        if (owners) config.owners = owners[1].split(',').map((s) => s.trim()).filter(Boolean);
        if (/^\s*exclude:\s*$/.test(line)) { inExclude = true; continue; }
        const ex = inExclude && line.match(/^\s*-\s+([@\w.*/-]+):\s*(.*)$/);
        if (ex) config.exclude.set(ex[1].toLowerCase(), ex[2].trim());
    }

    const entries = [];
    const unparsed = [];
    let section = '';
    for (const line of markdown.replace(/<!--[\s\S]*?-->/g, '').split('\n')) {
        const heading = line.match(/^## (.+)$/);
        if (heading) { section = heading[1].trim(); continue; }
        const m = line.match(ENTRY);
        if (m) {
            entries.push({
                section, name: m[1], repo: m[2], marker: m[3], packages: m[4].split(',').map((s) => s.trim()), description: m[5],
            });
        } else if (/^- \[[^\]]+\]\(https:\/\/github\.com\//.test(line)) {
            unparsed.push(line);
        }
    }
    return { config, entries, unparsed };
}

// Exclude keys are repositories or npm package names; `*` matches any run of characters.
export function isExcluded(config, name) {
    const key = name.toLowerCase();
    return [...config.exclude.keys()].some((pattern) => new RegExp(`^${pattern.replace(/[.+?^${}()|[\]\\/]/g, '\\$&').replace(/\*/g, '.*')}$`).test(key));
}

// The `packages:` list of a pnpm-workspace.yaml, quotes and trailing comments stripped.
export function pnpmGlobs(yaml) {
    const block = yaml.replace(/\r\n?/g, '\n').match(/^packages:\s*\n((?:[ \t]+.*\n?|\s*\n)*)/m);
    return block ? [...block[1].matchAll(/^\s*-\s*['"]?([^'"\n#]+?)['"]?\s*(?:#.*)?$/gm)].map((m) => m[1]) : [];
}

// Public package names a repo publishes: root package.json, npm/yarn workspaces or pnpm-workspace.yaml.
// ponytail: only `dir/*` and plain-dir globs; `**` or nested globs are skipped (none in use today).
async function publicPackages(repo) {
    const root = await ghJson(repo, 'package.json');
    if (!root) return [];
    let globs = root.workspaces?.packages ?? root.workspaces;
    if (!Array.isArray(globs) || !globs.length) {
        const pnpm = await ghRaw(repo, 'pnpm-workspace.yaml');
        globs = pnpm ? pnpmGlobs(pnpm) : [];
    }
    const dirs = [];
    for (const glob of globs) {
        if (glob.startsWith('!') || glob.includes('**')) continue;
        if (!glob.endsWith('/*')) { dirs.push(glob); continue; }
        const listing = await gh('api', `repos/${repo}/contents/${glob.slice(0, -2)}`, '--jq', '.[] | select(.type=="dir") | .path').catch(absent(''));
        dirs.push(...listing.split('\n').filter(Boolean));
    }
    const manifests = await mapLimit(dirs, 8, (dir) => ghJson(repo, `${dir}/package.json`));
    const names = [root, ...manifests].filter((m) => m?.name && !m.private).map((m) => m.name);
    return [...new Set(names)];
}

async function npmProblem(name) {
    const res = await fetch(`https://registry.npmjs.org/${name.replace('/', '%2F')}/latest`);
    if (res.status === 404) return 'not published';
    if (!res.ok) return `registry error ${res.status}`;
    const manifest = await res.json();
    return manifest.deprecated ? `deprecated: ${manifest.deprecated}` : undefined;
}

async function repoInfo(repo) {
    const json = await gh('repo', 'view', repo, '--json', 'nameWithOwner,isArchived,isFork,visibility').catch(absent(undefined));
    return json && JSON.parse(json);
}

async function scan(file) {
    const { config, entries, unparsed } = parseList(await readFile(file, 'utf8'));
    if (!config.owners.length) {
        console.error('No `owners:` line in a <!-- package-list --> block. Add the block first (see SKILL.md, "The list").');
        process.exit(1);
    }
    const listed = new Set(entries.map((e) => e.repo.toLowerCase()));
    const out = [`# Package list scan\n\n${entries.length} entries, owners: ${config.owners.join(', ')}, ${config.exclude.size} excluded.`];
    const section = (title, lines) => out.push(`\n## ${title} (${lines.length})\n\n${lines.join('\n') || '_none_'}`);
    section('Lines that break the entry format', unparsed.map((line) => `- \`${line}\``));

    const fields = 'nameWithOwner,description,isArchived,isFork,isTemplate,pushedAt';
    const owned = (await mapLimit(config.owners, 4, async (owner) => JSON.parse(
        await gh('repo', 'list', owner, '--limit', '1000', '--visibility', 'public', '--json', fields),
    ))).flat();
    const fresh = owned.filter((r) => {
        const key = r.nameWithOwner.toLowerCase();
        return !r.isArchived && !r.isFork && !r.isTemplate && !listed.has(key) && !isExcluded(config, key);
    });
    const freshPackages = await mapLimit(fresh, 4, (r) => publicPackages(r.nameWithOwner));
    section('New repositories', fresh.map((r, i) => `- ${r.nameWithOwner} (pushed ${r.pushedAt.slice(0, 10)}): ${r.description || '_no description_'}\n  packages: ${freshPackages[i].join(', ') || '_none_'}`));

    const infos = await mapLimit(entries, 8, (e) => repoInfo(e.repo));
    section('Gone, archived, private or renamed', entries.flatMap((e, i) => {
        const info = infos[i];
        if (!info) return [`- ${e.repo}: not found`];
        const problems = [
            info.isArchived && 'archived',
            info.isFork && 'fork',
            info.visibility !== 'PUBLIC' && info.visibility.toLowerCase(),
            info.nameWithOwner.toLowerCase() !== e.repo.toLowerCase() && `renamed to ${info.nameWithOwner}`,
        ].filter(Boolean);
        return problems.length ? [`- ${e.repo}: ${problems.join(', ')}`] : [];
    }));

    const npmEntries = entries.filter((e) => e.marker === 'npm' && !e.packages.some((p) => p.includes('*')));
    const actual = await mapLimit(npmEntries, 4, (e) => publicPackages(e.repo));
    section('Package drift', npmEntries.flatMap((e, i) => {
        const missing = e.packages.filter((p) => !actual[i].includes(p));
        const unlisted = actual[i].filter((p) => !e.packages.includes(p) && !isExcluded(config, p));
        if (!missing.length && !unlisted.length) return [];
        return [`- ${e.repo}${missing.length ? `\n  listed but not in the repo: ${missing.join(', ')}` : ''}${unlisted.length ? `\n  public but unlisted: ${unlisted.join(', ')}` : ''}`];
    }));

    const listedPackages = npmEntries.flatMap((e) => e.packages);
    const problems = await mapLimit(listedPackages, 16, npmProblem);
    section('npm problems', listedPackages.flatMap((p, i) => (problems[i] ? [`- ${p}: ${problems[i]}`] : [])));

    return out.join('\n');
}

function selfTest() {
    const { config, entries, unparsed } = parseList([
        '<!-- package-list',
        '- [name](https://github.com/owner/repo) `npm: a` – Format example, must not parse.',
        'owners: a, b',
        'exclude:',
        '- a/old: superseded by a/new',
        '- @a/*-console: app bundles',
        '-->',
        '## HTTP',
        '- [hapic](https://github.com/a/hapic) `npm: hapic, @hapic/oauth2` – Tiny HTTP client.',
        '- [hevi-action](https://github.com/a/hevi-action) `action: a/hevi-action` – Runs hevi.',
        '- [broken](https://github.com/a/broken) npm: broken - missing backticks.',
        '- not an entry',
    ].join('\r\n'));
    assert.deepEqual(unparsed, ['- [broken](https://github.com/a/broken) npm: broken - missing backticks.']);
    assert.deepEqual(pnpmGlobs("packages:\n  - 'packages/*' # libs\n  - apps/*\nonlyBuiltDependencies:\n  - esbuild\n"), ['packages/*', 'apps/*']);
    assert.deepEqual(config.owners, ['a', 'b']);
    assert.equal(config.exclude.get('a/old'), 'superseded by a/new');
    assert.equal(entries.length, 2);
    assert.deepEqual(entries[0], {
        section: 'HTTP', name: 'hapic', repo: 'a/hapic', marker: 'npm', packages: ['hapic', '@hapic/oauth2'], description: 'Tiny HTTP client.',
    });
    assert.equal(entries[1].marker, 'action');
    assert.ok(isExcluded(config, 'A/Old'));
    assert.ok(isExcluded(config, '@a/admin-console'));
    assert.ok(!isExcluded(config, '@a/console-kit'));
    assert.ok(!isExcluded(config, 'a/older'));
    console.log('ok');
}

const arg = process.argv[2];
if (arg === '--test') selfTest();
else if (arg) console.log(await scan(arg));
else { console.error('Usage: node scan.mjs <README.md> | --test'); process.exit(1); }
