import { createServer } from 'node:http';
import { readFile, writeFile, rename, copyFile, mkdir, readdir, stat, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';

const appDir = normalize(fileURLToPath(new URL('..', import.meta.url)));
const root = join(appDir, 'dist');
const port = Number(process.env.PORT || 4173);

/**
 * Cherry Brain's permanent data lives OUTSIDE the app folder, as a sibling of it —
 * "App" and "Data" are both children of the same Cherry Brain root. This means the
 * app's code can be rebuilt, replaced, or updated without ever touching this data,
 * and it never depends on which browser, browser profile, or local address opened it.
 *
 * If the app hasn't been moved into the canonical "Cherry Brain" folder yet, this
 * still resolves to a sensible sibling location next to wherever the app currently
 * lives, so nothing here breaks before that move happens.
 */
const cherryBrainRoot = normalize(join(appDir, '..'));
const dataDir = join(cherryBrainRoot, 'Data');
const backupsDir = join(cherryBrainRoot, 'Backups');
const exportsDir = join(cherryBrainRoot, 'Exports');
const recoveryDir = join(cherryBrainRoot, 'Recovery');
const archiveDir = join(cherryBrainRoot, 'Archive');

const dataFile = join(dataDir, 'cherry-brain-data.json');
const dataFileTmp = join(dataDir, 'cherry-brain-data.json.tmp');
const dataFileBak = join(dataDir, 'cherry-brain-data.json.bak');

let store = {};
let storeValid = true;
let storeProblem = null;
let lastSavedAt = null;
let lastBackupAt = null;

async function ensureDirs() {
  await Promise.all([dataDir, backupsDir, exportsDir, recoveryDir, archiveDir].map((d) => mkdir(d, { recursive: true })));
}

async function loadStoreFromDisk() {
  if (!existsSync(dataFile)) {
    store = {};
    storeValid = true;
    storeProblem = null;
    return;
  }
  try {
    const raw = await readFile(dataFile, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('The data file does not contain the expected structure.');
    }
    store = parsed;
    storeValid = true;
    storeProblem = null;
  } catch (error) {
    // Never silently replace a file we can't safely read with an empty structure.
    // Reads and writes are blocked until a human explicitly restores a backup.
    store = null;
    storeValid = false;
    storeProblem = error instanceof Error ? error.message : String(error);
    console.error('Cherry Brain could not safely read its data file:', storeProblem);
  }
}

/** Atomic, validated write: temp file + read-back verification + rename. Never touches the canonical file directly. */
async function atomicWriteStoreUnsafe(nextStore) {
  if (!nextStore || typeof nextStore !== 'object' || Array.isArray(nextStore)) {
    throw new Error('Refusing to save: the new data was not in the expected shape.');
  }
  const json = JSON.stringify(nextStore, null, 2);

  // Preserve the last known-good file before writing the new one.
  if (existsSync(dataFile)) {
    await copyFile(dataFile, dataFileBak);
  }

  await writeFile(dataFileTmp, json, 'utf8');
  // Read back and re-parse the temp file to confirm it's valid before it becomes canonical.
  const verify = await readFile(dataFileTmp, 'utf8');
  const reparsed = JSON.parse(verify);
  if (!reparsed || typeof reparsed !== 'object' || Array.isArray(reparsed)) {
    await unlink(dataFileTmp).catch(() => {});
    throw new Error('Refusing to save: the written file failed verification.');
  }

  await rename(dataFileTmp, dataFile);
  store = nextStore;
  storeValid = true;
  storeProblem = null;
  lastSavedAt = new Date().toISOString();
}

/**
 * All writes to the canonical file — including reading the *current* store to
 * merge a single key into it — go through this single queue, one at a time.
 * Without this, two nearly-simultaneous saves (e.g. an entry and its draft
 * clearing at once) can race on the same temp filename, and worse, can each
 * compute their next state from the same stale snapshot and silently drop
 * each other's change. `mutate` is only ever called once the previous write
 * in the queue has fully finished, so it always sees the latest state.
 */
let writeQueue = Promise.resolve();
function queuedWrite(mutate) {
  const run = async () => {
    const next = mutate(store);
    await atomicWriteStoreUnsafe(next);
  };
  const result = writeQueue.then(run, run);
  writeQueue = result.then(
    () => {},
    () => {},
  );
  return result;
}

function timestampForFilename(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
}

/** Creates a timestamped backup copy. Works even if the current file is unreadable — it copies the raw bytes so nothing is ever lost. */
async function createBackup(label) {
  if (!existsSync(dataFile)) return null;
  const stamp = timestampForFilename();
  const safeLabel = label ? `.${label.replace(/[^a-zA-Z0-9_-]/g, '-')}` : '';
  const problemTag = storeValid ? '' : '.PROBLEM';
  const filename = `cherry-brain-data.${stamp}${problemTag}${safeLabel}.json`;
  await copyFile(dataFile, join(backupsDir, filename));
  lastBackupAt = new Date().toISOString();
  return filename;
}

async function ensureDailyBackup() {
  if (!existsSync(dataFile)) return;
  const today = timestampForFilename().slice(0, 10);
  let files = [];
  try {
    files = await readdir(backupsDir);
  } catch {
    files = [];
  }
  const hasToday = files.some((f) => f.startsWith(`cherry-brain-data.${today}`));
  if (!hasToday) await createBackup('daily');
}

function openInSystem(target) {
  const command =
    process.platform === 'win32'
      ? `start "" "${target}"`
      : process.platform === 'darwin'
        ? `open "${target}"`
        : `xdg-open "${target}"`;
  exec(command);
}

const FOLDERS = {
  data: dataDir,
  backups: backupsDir,
  exports: exportsDir,
  recovery: recoveryDir,
  archive: archiveDir,
  app: appDir,
};

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

async function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]).replace(/^\/+/, '');
  const candidates = [
    join(root, clean || 'index.html'),
    join(root, clean, 'index.html'),
    join(root, `${clean}.html`),
    join(root, 'index.html'),
  ];
  for (const candidate of candidates) {
    if (!normalize(candidate).startsWith(root)) continue;
    try {
      const info = await stat(candidate);
      if (info.isFile()) return candidate;
    } catch {}
  }
  return null;
}

function sendJson(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(json);
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return {};
  }
}

function requireStoreReadable(res) {
  if (storeValid) return true;
  sendJson(res, 503, {
    error: 'Cherry Brain could not safely read its data file. Nothing has been changed or erased. Restore a backup from Settings to continue.',
    detail: storeProblem,
  });
  return false;
}

async function handleApi(req, res, url) {
  const parts = url.pathname.replace(/^\/api\//, '').split('/').filter(Boolean);
  const method = req.method || 'GET';

  if (parts[0] === 'status' && method === 'GET') {
    return sendJson(res, 200, {
      status: storeValid ? 'ok' : 'problem',
      problemMessage: storeProblem,
      dataPath: dataFile,
      backupsPath: backupsDir,
      exportsPath: exportsDir,
      recoveryPath: recoveryDir,
      archivePath: archiveDir,
      appPath: appDir,
      lastSavedAt,
      lastBackupAt,
      fixedAddress: `http://127.0.0.1:${port}`,
    });
  }

  if (parts[0] === 'data' && parts.length === 1 && method === 'GET') {
    if (!requireStoreReadable(res)) return;
    return sendJson(res, 200, { value: store });
  }

  if (parts[0] === 'data' && parts.length === 2 && method === 'GET') {
    if (!requireStoreReadable(res)) return;
    const key = decodeURIComponent(parts[1]);
    return sendJson(res, 200, { value: store[key] ?? null });
  }

  if (parts[0] === 'data' && parts.length === 2 && method === 'PUT') {
    if (!requireStoreReadable(res)) return;
    const key = decodeURIComponent(parts[1]);
    const body = await readJsonBody(req);
    try {
      await queuedWrite((current) => ({ ...current, [key]: body.value }));
      await ensureDailyBackup();
      return sendJson(res, 200, { ok: true, lastSavedAt });
    } catch (error) {
      return sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
    }
  }

  if (parts[0] === 'data' && parts.length === 2 && method === 'DELETE') {
    if (!requireStoreReadable(res)) return;
    const key = decodeURIComponent(parts[1]);
    try {
      await queuedWrite((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
      return sendJson(res, 200, { ok: true });
    } catch (error) {
      return sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
    }
  }

  if (parts[0] === 'backup' && method === 'POST') {
    const body = await readJsonBody(req);
    try {
      const filename = await createBackup(body.label || 'manual');
      return sendJson(res, 200, { ok: true, filename });
    } catch (error) {
      return sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
    }
  }

  if (parts[0] === 'backups' && method === 'GET') {
    try {
      const files = await readdir(backupsDir);
      const details = await Promise.all(
        files
          .filter((f) => f.endsWith('.json'))
          .map(async (f) => {
            const info = await stat(join(backupsDir, f));
            return { filename: f, modifiedAt: info.mtime.toISOString(), size: info.size };
          }),
      );
      details.sort((a, b) => (a.modifiedAt < b.modifiedAt ? 1 : -1));
      return sendJson(res, 200, { backups: details });
    } catch (error) {
      return sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
    }
  }

  if (parts[0] === 'restore' && method === 'POST') {
    const body = await readJsonBody(req);
    const filename = basename(String(body.filename || ''));
    const backupPath = join(backupsDir, filename);
    if (!filename || !existsSync(backupPath)) {
      return sendJson(res, 404, { error: 'That backup file could not be found.' });
    }
    try {
      const raw = await readFile(backupPath, 'utf8');
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('That backup file is not in the expected shape and was not restored.');
      }
      // Always back up current data first, even if it's currently unreadable.
      await createBackup('before-restore');
      await queuedWrite(() => parsed);
      return sendJson(res, 200, { ok: true, restoredFrom: filename, lastSavedAt });
    } catch (error) {
      return sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
    }
  }

  if (parts[0] === 'export' && method === 'POST') {
    if (!requireStoreReadable(res)) return;
    try {
      const stamp = timestampForFilename();
      const filename = `cherry-brain-export-${stamp}.json`;
      await writeFile(join(exportsDir, filename), JSON.stringify(store, null, 2), 'utf8');
      return sendJson(res, 200, { ok: true, filename, path: join(exportsDir, filename) });
    } catch (error) {
      return sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
    }
  }

  if (parts[0] === 'open-folder' && method === 'POST') {
    const body = await readJsonBody(req);
    const target = FOLDERS[body.which];
    if (!target) return sendJson(res, 400, { error: 'Unknown folder.' });
    try {
      await mkdir(target, { recursive: true });
      openInSystem(target);
      return sendJson(res, 200, { ok: true });
    } catch (error) {
      return sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
    }
  }

  return sendJson(res, 404, { error: 'Unknown API route.' });
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://127.0.0.1');
    if (url.pathname.startsWith('/api/')) {
      await handleApi(req, res, url);
      return;
    }

    const file = await resolveFile(req.url || '/');
    if (!file) {
      res.writeHead(404).end('Not found');
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, {
      'Content-Type': mime[extname(file)] || 'application/octet-stream',
      'Cache-Control': extname(file) === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    });
    res.end(body);
  } catch (error) {
    console.error(error);
    res.writeHead(500).end('Cherry Brain could not start.');
  }
});

server.on('error', (error) => {
  if (error && typeof error === 'object' && 'code' in error && error.code === 'EADDRINUSE') {
    const url = `http://127.0.0.1:${port}`;
    openInSystem(url);
    process.exit(0);
  }
  console.error(error);
  process.exit(1);
});

server.listen(port, '127.0.0.1', async () => {
  await ensureDirs();
  await loadStoreFromDisk();
  await ensureDailyBackup().catch(() => {});
  const url = `http://127.0.0.1:${port}`;
  console.log(`Cherry Brain is ready at ${url}`);
  console.log(`Data file: ${dataFile}`);
  if (!storeValid) {
    console.log(`WARNING: the data file could not be read safely (${storeProblem}). A backup is preserved; nothing was erased.`);
  }
  openInSystem(url);
});
