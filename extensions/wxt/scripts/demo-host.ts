import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const port = Math.max(1, Number(process.env.SIDECAR_DEMO_PORT ?? "4173") || 4173);
const hostname = process.env.SIDECAR_DEMO_HOST ?? "127.0.0.1";
const startUrl = `http://localhost:${port}/c/demo-thread`;
const demoPageUrl = new URL("../demo/index.html", import.meta.url);
const demoPage = await readFile(demoPageUrl, "utf8");

// Serve the built chrome output at `/wxt/*` so tests (and manual runs) can
// point a mocked chrome.runtime.getURL at this host and exercise the real
// runtime CSS fetch/split path (content-scripts/chatgpt-dock.css, vendor/*).
const WXT_OUT_ROOT = resolve(fileURLToPath(new URL("../.output/chrome", import.meta.url)));

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".map": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

function resolveSafe(root: string, urlPath: string): string | null {
  const rel = urlPath.replace(/^\/+/, "");
  const candidate = resolve(root, rel);
  const normalizedRoot = resolve(root) + sep;
  if (!candidate.startsWith(normalizedRoot)) return null;
  return candidate;
}

async function serveFile(response: import("node:http").ServerResponse, absPath: string): Promise<void> {
  try {
    const stats = await stat(absPath);
    if (!stats.isFile()) throw new Error("not a file");
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const ext = extname(absPath).toLowerCase();
  response.writeHead(200, {
    "content-type": CONTENT_TYPES[ext] ?? "application/octet-stream",
    "cache-control": "no-store",
  });
  createReadStream(absPath).pipe(response);
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${hostname}:${port}`);

  if (url.pathname === "/healthz") {
    response.writeHead(200, {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    });
    response.end("ok");
    return;
  }

  if (url.pathname === "/favicon.ico") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (url.pathname.startsWith("/wxt/")) {
    const abs = resolveSafe(WXT_OUT_ROOT, url.pathname.slice("/wxt/".length));
    if (!abs) {
      response.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
      response.end("Forbidden");
      return;
    }
    void serveFile(response, abs);
    return;
  }

  response.writeHead(200, {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(demoPage);
});

await new Promise<void>((resolve, reject) => {
  server.once("error", reject);
  server.listen(port, hostname, () => {
    server.off("error", reject);
    console.log(`[sidecar-demo] Demo host ready at ${startUrl}`);
    console.log("[sidecar-demo] Routes served from one HTML shell: /, /c/<thread>, /project/<project>/c/<thread>");
    console.log(`[sidecar-demo] Serving ${WXT_OUT_ROOT} at /wxt/`);
    resolve();
  });
});

await new Promise(() => undefined);
