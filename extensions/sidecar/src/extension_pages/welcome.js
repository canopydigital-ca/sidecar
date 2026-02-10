async function loadLinks() {
  try {
    const res = await fetch(chrome.runtime.getURL('extension_pages/links.json'));
    if (!res.ok) throw new Error(String(res.status));
    return await res.json();
  } catch (e) {
    console.warn('[Sidecar] Failed to load links.json', e);
    return null;
  }
}

function setHref(id, href) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!href || href.startsWith('__')) {
    el.setAttribute('aria-disabled', 'true');
    el.classList.add('warn');
    el.title = 'Set this URL in extension_pages/links.json';
    el.addEventListener('click', (e) => e.preventDefault());
    return;
  }
  el.href = href;
}

function renderMeta() {
  const mv = chrome.runtime.getManifest?.();
  const version = mv?.version ?? 'unknown';
  const name = mv?.name ?? 'Sidecar';
  const elVersion = document.getElementById('meta-version');
  const elName = document.getElementById('meta-name');
  if (elVersion) elVersion.textContent = version;
  if (elName) elName.textContent = name;
}

(async function main() {
  renderMeta();

  const links = await loadLinks();
  if (!links) return;

  setHref('site', links.site);
  setHref('github', links.github);

  setHref('chrome-core', links.chrome_store_core);
  setHref('chrome-fun', links.chrome_store_fun);

  setHref('edge-core', links.edge_store_core);
  setHref('edge-fun', links.edge_store_fun);

  const support = document.getElementById('support-email');
  if (support) support.textContent = links.support_email || 'support@canopydigital.ca';
})();
