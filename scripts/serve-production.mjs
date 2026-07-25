import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';

const root = normalize(join(fileURLToPath(new URL('..', import.meta.url)), 'dist'));
const port = Number(process.env.PORT || 4173);
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

const server = createServer(async (req, res) => {
  try {
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
    const command = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
    exec(command);
    process.exit(0);
  }
  console.error(error);
  process.exit(1);
});

server.listen(port, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${port}`;
  console.log(`Cherry Brain is ready at ${url}`);
  const command = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
  exec(command);
});
