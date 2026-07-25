import { readFile, mkdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * One-time recovery tool: merges a recovered browser-storage dump (the kind
 * produced by exporting raw localStorage from an earlier Cherry Brain build)
 * into the current permanent data file, through the running app's own API —
 * so every write still goes through the same atomic-write and backup safety
 * as normal use. Safe to run more than once: every array is merged by id
 * (or the natural key for extraction records), so nothing is ever duplicated.
 *
 * Usage: node scripts/restore-recovered-entry.mjs <path-to-recovered-file.json>
 * Requires Cherry Brain to already be running (Open Cherry Brain.bat).
 */

const appDir = resolve(fileURLToPath(new URL('..', import.meta.url)));
const cherryBrainRoot = resolve(join(appDir, '..'));
const recoveryDir = join(cherryBrainRoot, 'Recovery');
const base = 'http://127.0.0.1:4173';

const KNOWN_KEYS = new Set([
  '@cherry-brain/entries',
  '@cherry-brain/patterns',
  '@cherry-brain/settings',
  '@cherry-brain/context-engine/journal-entries',
  '@cherry-brain/context-engine/events',
  '@cherry-brain/context-engine/clarifications',
  '@cherry-brain/context-engine/extraction-records',
  '@cherry-brain/context-engine/fact-corrections',
  '@cherry-brain/context-engine/event-timeline-visibility',
]);

function timestampForFilename(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
}

function naturalKey(key, record) {
  if (key === '@cherry-brain/context-engine/extraction-records') return `${record.journalEntryId}::${record.engineVersion}`;
  return record.id;
}

async function main() {
  const recoveryFilePath = process.argv[2];
  if (!recoveryFilePath || !existsSync(recoveryFilePath)) {
    console.error('Usage: node scripts/restore-recovered-entry.mjs <path-to-recovered-storage.json>');
    process.exit(1);
  }

  await mkdir(recoveryDir, { recursive: true });
  const preservedName = `Cherry-Brain-recovered-storage.${timestampForFilename()}.json`;
  const preservedPath = join(recoveryDir, preservedName);
  await copyFile(recoveryFilePath, preservedPath);
  console.log(`Untouched original preserved at: ${preservedPath}`);
  console.log('');

  const statusRes = await fetch(`${base}/api/status`).catch(() => null);
  if (!statusRes || !statusRes.ok) {
    console.error('Cherry Brain does not appear to be running.');
    console.error('Open it first (double-click the 🍒 Cherry Brain shortcut), then run this again.');
    process.exit(1);
  }

  const raw = await readFile(recoveryFilePath, 'utf8');
  const dump = JSON.parse(raw);

  let anyFailed = false;

  for (const [key, rawValue] of Object.entries(dump)) {
    if (!KNOWN_KEYS.has(key)) {
      console.log(`Skipping unrecognized entry: ${JSON.stringify(key).slice(0, 40)}...`);
      continue;
    }

    let recoveredValue;
    try {
      recoveredValue = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
    } catch {
      console.log(`Skipping ${key}: could not be read as valid data.`);
      continue;
    }

    const currentRes = await fetch(`${base}/api/data/${encodeURIComponent(key)}`);
    const currentBody = await currentRes.json();
    const current = currentBody.value ?? (Array.isArray(recoveredValue) ? [] : null);

    let merged;
    if (Array.isArray(recoveredValue) && Array.isArray(current)) {
      const existingKeys = new Set(current.map((record) => naturalKey(key, record)));
      const toAdd = recoveredValue.filter((record) => !existingKeys.has(naturalKey(key, record)));
      merged = [...current, ...toAdd];
      console.log(`${key}: ${toAdd.length} new record(s) added, ${recoveredValue.length - toAdd.length} already present (not duplicated).`);
    } else if (!Array.isArray(recoveredValue)) {
      merged = current ?? recoveredValue;
      console.log(current == null ? `${key}: restored (was empty).` : `${key}: kept your existing value (already present).`);
    } else {
      merged = recoveredValue;
    }

    const putRes = await fetch(`${base}/api/data/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: merged }),
    });
    if (!putRes.ok) {
      const body = await putRes.json().catch(() => null);
      console.error(`FAILED to save ${key}: ${body?.error || putRes.status}`);
      anyFailed = true;
    }
  }

  console.log('');
  if (anyFailed) {
    console.error('Recovery restore finished with errors. See above. Nothing already saved was lost.');
    process.exit(1);
  }
  console.log('Recovery restore complete. Reload Cherry Brain to see the restored entry.');
}

main().catch((error) => {
  console.error('Recovery restore failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
