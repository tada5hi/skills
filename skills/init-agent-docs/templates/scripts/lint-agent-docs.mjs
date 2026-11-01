/*
 * Ratchet for the agent docs (AGENTS.md, .agents/*.md, .agents/topics/*.md).
 *
 * Every file has a byte budget and a history-phrase budget in
 * .agents/budget.json. A file over either budget fails. Budgets only go down:
 * after shortening a file, run with --update to lower them. A new file needs
 * a budget entry.
 *
 * Usage (from the repository root):
 *   node scripts/lint-agent-docs.mjs           check
 *   node scripts/lint-agent-docs.mjs --update  lower budgets to the current values
 *   node scripts/lint-agent-docs.mjs --init    write .agents/budget.json from the current files
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BUDGET_FILE = path.join(ROOT, '.agents', 'budget.json');

// Phrases that narrate history or cite a local artifact instead of stating a rule.
const HISTORY_PATTERN = /plan [0-9]{3}|\bused to\b|\bbefore #[0-9]|\bno longer\b|\bpinned by\b/gi;

// Starting budget for a new topic file, and for core files on --init.
const NEW_TOPIC_BYTES = 20000;

function listFiles() {
    const files = fs.existsSync(path.join(ROOT, 'AGENTS.md')) ? ['AGENTS.md'] : [];
    for (const dir of ['.agents', '.agents/topics']) {
        const abs = path.join(ROOT, dir);
        if (!fs.existsSync(abs)) continue;
        for (const name of fs.readdirSync(abs)) {
            if (name.endsWith('.md')) files.push(`${dir}/${name}`);
        }
    }
    return files.sort();
}

function measure(file) {
    const text = fs.readFileSync(path.join(ROOT, file), 'utf8');
    return { bytes: Buffer.byteLength(text), history: (text.match(HISTORY_PATTERN) || []).length };
}

const args = new Set(process.argv.slice(2));

if (args.has('--init')) {
    const files = {};
    for (const file of listFiles()) files[file] = measure(file);
    fs.writeFileSync(BUDGET_FILE, `${JSON.stringify({ newTopicBytes: NEW_TOPIC_BYTES, files }, null, 4)}\n`);
    console.log(`wrote ${path.relative(ROOT, BUDGET_FILE)} for ${Object.keys(files).length} files`);
    process.exit(0);
}

const budget = JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf8'));
const errors = [];

for (const file of listFiles()) {
    const current = measure(file);
    const limit = budget.files[file];
    if (!limit) {
        errors.push(`${file}: no budget. Add it to .agents/budget.json (at most ${budget.newTopicBytes} bytes for a new topic file).`);
        continue;
    }
    if (current.bytes > limit.bytes) {
        errors.push(`${file}: ${current.bytes} bytes, budget ${limit.bytes}. Rewrite or move detail out; do not raise the budget.`);
    }
    if (current.history > limit.history) {
        errors.push(`${file}: ${current.history} history phrases, budget ${limit.history}. State the rule as it is now.`);
    }
    if (args.has('--update')) {
        limit.bytes = Math.min(limit.bytes, current.bytes);
        limit.history = Math.min(limit.history, current.history);
    }
}

for (const file of Object.keys(budget.files)) {
    if (!fs.existsSync(path.join(ROOT, file))) errors.push(`${file}: budget entry for a file that does not exist.`);
}

if (args.has('--update')) fs.writeFileSync(BUDGET_FILE, `${JSON.stringify(budget, null, 4)}\n`);

for (const error of errors) console.error(`error: ${error}`);
process.exit(errors.length ? 1 : 0);
