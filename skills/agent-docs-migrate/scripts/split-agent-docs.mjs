/*
 * Move sections of the always-loaded agent docs into on-demand topic files.
 *
 * The map (JSON) names, per topic, the sections to move. A section is a
 * Markdown heading (`##` or `###`) matched by the start of its text, in a
 * source file; it moves with everything up to the next heading of the same or
 * a higher level. Nothing is rewritten: the text lands in the topic file as it
 * was, under the heading given in the map (default: its own text).
 *
 *   {
 *     "http": {
 *       "title": "HTTP",
 *       "purpose": "Read before changing @scope/http.",
 *       "sections": [
 *         { "file": ".agents/architecture.md", "heading": "HTTP" },
 *         { "file": ".agents/structure.md", "heading": "HTTP Module Map", "as": "Module map" }
 *       ]
 *     }
 *   }
 *
 * Usage (from the repository root; <skill-dir> is this skill's directory):
 *   node <skill-dir>/scripts/split-agent-docs.mjs <map.json>            dry run: sizes per topic, what stays, unmatched headings
 *   node <skill-dir>/scripts/split-agent-docs.mjs <map.json> --write    write .agents/topics/*.md and remove the moved sections
 *
 * It refuses a heading that matches no section or more than one, a section
 * claimed twice and a topic file that already exists, so a run never loses or
 * duplicates text. Review the diff: moved text keeps in-page anchors
 * (`(#section)`) that now point into another file.
 */
import fs from 'node:fs';
import path from 'node:path';

const [mapPath, flag] = process.argv.slice(2);

if (!mapPath) {
    console.error('usage: node split-agent-docs.mjs <map.json> [--write]');
    process.exit(1);
}

const write = flag === '--write';
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
const files = new Map();
const errors = [];

function parse(file) {
    if (files.has(file)) {
        return files.get(file);
    }

    const lines = fs.readFileSync(file, 'utf8').split('\n');
    const sections = [];
    // Line indexes inside fenced code blocks (fence lines included).
    const fenced = new Set();
    let fence = null;

    lines.forEach((line, index) => {
        const marker = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);

        if (fence) {
            fenced.add(index);

            // A closing fence uses the opening character, is at least as long and has nothing after it.
            if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && marker[2].trim() === '') {
                fence = null;
            }

            return;
        }

        if (marker && !(marker[1][0] === '`' && marker[2].includes('`'))) {
            fence = marker[1];
            fenced.add(index);

            return;
        }

        const match = /^(#{2,3}) (.+)$/.exec(line);

        if (match) {
            sections.push({
                level: match[1].length,
                text: match[2].trim(),
                start: index,
            });
        }
    });

    for (const [i, section] of sections.entries()) {
        const next = sections.slice(i + 1).find((s) => s.level <= section.level);

        section.end = next ? next.start : lines.length;
    }

    const parsed = {
        lines,
        sections,
        fenced,
        claimed: [],
    };

    files.set(file, parsed);

    return parsed;
}

const topics = {};

for (const [name, topic] of Object.entries(map)) {
    const target = path.join('.agents/topics', `${name}.md`);

    if (fs.existsSync(target)) {
        errors.push(`${target} exists already; merge by hand or pick another name.`);
    }

    let text = `# ${topic.title ?? name}\n\n${topic.purpose ?? 'Read before changing this area.'}\n`;

    for (const ref of topic.sections) {
        const doc = parse(ref.file);
        const found = doc.sections.filter((s) => s.text.startsWith(ref.heading));

        if (found.length !== 1) {
            errors.push(`${ref.file}: "${ref.heading}" matches ${found.length} headings.`);

            continue;
        }

        const [section] = found;
        const overlap = doc.claimed.find((c) => section.start < c.end && c.start < section.end);

        if (overlap) {
            errors.push(`${ref.file}: "${section.text}" overlaps "${overlap.text}", claimed already.`);

            continue;
        }

        doc.claimed.push(section);

        // Demote `###` headings under the new `##`; leave code blocks verbatim.
        const body = doc.lines.slice(section.start + 1, section.end)
            .map((line, i) => (doc.fenced.has(section.start + 1 + i) ? line : line.replace(/^### /, '#### ')))
            .join('\n')
            .trim();

        text += `\n## ${ref.as ?? section.text}\n\n${body}\n`;
    }

    topics[target] = text;
}

for (const [target, text] of Object.entries(topics)) {
    console.log(`${target}: ${Buffer.byteLength(text)} bytes`);
}

for (const [file, doc] of files) {
    const kept = doc.lines.filter((_, i) => doc.claimed.every((c) => !(i >= c.start && i < c.end))).join('\n');
    const left = doc.sections.filter((s) => doc.claimed.every((c) => !(s.start >= c.start && s.start < c.end)));

    console.log(`${file}: ${Buffer.byteLength(kept)} bytes stay; headings left: ${left.map((s) => s.text).join(' | ') || 'none'}`);
    doc.kept = kept;
}

for (const error of errors) {
    console.error(`error: ${error}`);
}

if (errors.length) {
    process.exit(1);
}

if (write) {
    fs.mkdirSync('.agents/topics', { recursive: true });

    for (const [target, text] of Object.entries(topics)) {
        fs.writeFileSync(target, text);
    }

    for (const [file, doc] of files) {
        fs.writeFileSync(file, `${doc.kept.replace(/\n{3,}/g, '\n\n').trimEnd()}\n`);
    }

    console.log('written. Next: write the core summary and topic index by hand, then fix links.');
}
