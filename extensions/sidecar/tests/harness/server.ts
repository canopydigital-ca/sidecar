import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.SIDECAR_HARNESS_PORT ?? 4175);

// Serve `extensions/sidecar/*` at `/...`
const LEGACY_ROOT = path.resolve(__dirname, '../..');

// Serve `extensions/wxt/.output/chrome/*` at `/wxt/...` (used by wxt-parity.spec)
const WXT_OUT_ROOT = path.resolve(__dirname, '../../../wxt/.output/chrome');

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function resolveSafe(root: string, urlPath: string): string | null {
  const rel = urlPath.replace(/^\/+/, '');
  const candidate = path.resolve(root, rel);
  const normalizedRoot = path.resolve(root) + path.sep;
  if (!candidate.startsWith(normalizedRoot)) return null;
  return candidate;
}

function send(res: http.ServerResponse, status: number, body: string) {
  res.statusCode = status;
  res.setHeader('content-type', 'text/plain; charset=utf-8');
  res.end(body);
}

function serveFile(res: http.ServerResponse, absPath: string) {
  let st: fs.Stats;
  try {
    st = fs.statSync(absPath);
  } catch {
    send(res, 404, 'Not found');
    return;
  }

  if (!st.isFile()) {
    send(res, 404, 'Not found');
    return;
  }

  const ext = path.extname(absPath).toLowerCase();
  res.statusCode = 200;
  res.setHeader('content-type', CONTENT_TYPES[ext] ?? 'application/octet-stream');
  res.setHeader('cache-control', 'no-store');
  fs.createReadStream(absPath).pipe(res);
}

const server = http.createServer((req, res) => {
  try {
    const rawUrl = req.url ?? '/';
    const url = new URL(rawUrl, 'http://localhost');
    const pathname = url.pathname;

    if (pathname === '/' || pathname === '') {
      res.statusCode = 302;
      res.setHeader('location', '/tests/harness/fixture.html');
      res.end();
      return;
    }

    if (pathname.startsWith('/wxt/')) {
      const abs = resolveSafe(WXT_OUT_ROOT, pathname.slice('/wxt/'.length));
      if (!abs) return send(res, 403, 'Forbidden');
      return serveFile(res, abs);
    }

    const abs = resolveSafe(LEGACY_ROOT, pathname);
    if (!abs) return send(res, 403, 'Forbidden');
    return serveFile(res, abs);
  } catch (err) {
    send(res, 500, `Server error: ${String(err)}`);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  // Keep output stable for Playwright webServer logs.
  console.log(`[harness] serving ${LEGACY_ROOT} at http://127.0.0.1:${PORT}/`);
  console.log(`[harness] serving ${WXT_OUT_ROOT} at http://127.0.0.1:${PORT}/wxt/`);
});

