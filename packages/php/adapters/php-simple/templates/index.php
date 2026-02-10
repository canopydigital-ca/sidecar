<?php
// build/index.php
//
// PHP front controller that maps "pretty" URLs to prerendered SvelteKit output.
// This is designed for Apache + mod_rewrite (.htaccess routes non-files here).
//
// Notes:
// - This does NOT run SvelteKit SSR. It serves prerendered HTML/JSON only.
// - If you want SPA-style fallback, set FALLBACK in the adapter options
//   or export SK_FALLBACK='index.html' and read it here.

declare(strict_types=1);

// For older PHP versions.
if (!function_exists('str_ends_with')) {
  function str_ends_with(string $haystack, string $needle): bool {
    if ($needle === '') return true;
    $len = strlen($needle);
    return substr($haystack, -$len) === $needle;
  }
}

$ROOT = __DIR__;
$ASSETS_DIR = '{{ASSETS_DIR}}';

// Adapter will replace this with null or a quoted filename like "index.html".
$FALLBACK = {{FALLBACK}};
// Optional override via env var (useful on hosts where you can't rebuild easily).
$envFallback = getenv('SK_FALLBACK');
if ($envFallback !== false && $envFallback !== '') $FALLBACK = $envFallback;

function send_file(string $file, int $status, string $contentType): void {
  http_response_code($status);
  header('Content-Type: ' . $contentType);
  header('X-Content-Type-Options: nosniff');
  // Avoid PHP session locking surprises.
  if (function_exists('session_write_close')) @session_write_close();
  readfile($file);
  exit;
}

function normalize_path(string $p): string {
  $p = rawurldecode($p);
  if ($p === '') return '/';
  // Collapse duplicate slashes.
  $p = preg_replace('#/+#', '/', $p);
  if ($p === null) return '/';
  return $p;
}

$uri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($uri, PHP_URL_PATH);
if (!is_string($path)) $path = '/';
$path = normalize_path($path);

// Defend against traversal.
if (strpos($path, "\0") !== false || strpos($path, '..') !== false) {
  http_response_code(400);
  echo "Bad Request";
  exit;
}

// Let Apache serve assets directly whenever possible.
// This file should only see non-files, but keep this guard anyway.
if (strpos($path, '/' . $ASSETS_DIR . '/') === 0) {
  $candidate = $ROOT . $path;
  if (is_file($candidate)) {
    // Content type is usually handled by Apache, but just in case:
    $ext = strtolower(pathinfo($candidate, PATHINFO_EXTENSION));
    $type = ($ext === 'css') ? 'text/css; charset=utf-8' : 'application/octet-stream';
    send_file($candidate, 200, $type);
  }
  http_response_code(404);
  echo "Not Found";
  exit;
}

// Candidate resolution for "pretty URLs".
$candidates = [];

// If it already looks like a file (has an extension), try it as-is.
$looksLikeFile = (bool)preg_match('/\.[a-zA-Z0-9]{1,8}$/', $path);

if ($looksLikeFile) {
  $candidates[] = $ROOT . $path;
} else {
  // / -> /index.html
  if ($path === '/' || $path === '') {
    $candidates[] = $ROOT . '/index.html';
  } else {
    // Try direct directory index first (common for prerendered routes).
    $candidates[] = $ROOT . $path . '/index.html';
    // Also allow /about -> /about.html if you prerender that way.
    $candidates[] = $ROOT . $path . '.html';
    // And in case someone requests with trailing slash already removed.
    $candidates[] = $ROOT . $path;
  }
}

// Also support /route/__data.json style explicitly.
// (Normally Apache will serve the real file, but some hosts can be weird.)
if (str_ends_with($path, '/__data.json')) {
  $candidates = array_merge([$ROOT . $path], $candidates);
}

foreach ($candidates as $file) {
  if (is_file($file)) {
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    if ($ext === 'json') send_file($file, 200, 'application/json; charset=utf-8');
    if ($ext === 'html') send_file($file, 200, 'text/html; charset=utf-8');
    // Fallback type
    send_file($file, 200, 'application/octet-stream');
  }
}

// 404 page if present
$notFound = $ROOT . '/404.html';
if (is_file($notFound)) {
  send_file($notFound, 404, 'text/html; charset=utf-8');
}

// Optional SPA-like fallback (serve index/200 for unknown routes).
if (is_string($FALLBACK) && $FALLBACK !== '') {
  $fb = $ROOT . '/' . ltrim($FALLBACK, '/');
  if (is_file($fb)) {
    send_file($fb, 200, 'text/html; charset=utf-8');
  }
}

http_response_code(404);
header('Content-Type: text/plain; charset=utf-8');
echo "Not Found";
