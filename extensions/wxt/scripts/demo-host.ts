import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const port = Math.max(1, Number(process.env.SIDECAR_DEMO_PORT ?? "4173") || 4173);
const hostname = process.env.SIDECAR_DEMO_HOST ?? "127.0.0.1";
const startUrl = `http://localhost:${port}/c/demo-thread`;
const demoPageUrl = new URL("../demo/index.html", import.meta.url);
const demoPage = await readFile(demoPageUrl, "utf8");

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
    resolve();
  });
});

await new Promise(() => undefined);
