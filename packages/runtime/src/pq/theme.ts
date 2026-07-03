export const PQ_THEME_CSS = `
:root {
  --pq-bg: #1e1e1e;
  --pq-text: #ececec;
  --pq-accent: #10a37f;
  --pq-border: #444;
  --pq-surface: #2a2a2a;
  --pq-surface-hover: #3a3a3a;
  --pq-font: 'Söhne', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --pq-radius: 6px;
}

[data-theme="chatgpt"] body {
  background: var(--pq-bg) !important;
  color: var(--pq-text) !important;
  font-family: var(--pq-font) !important;
}

/* Window & Layout */
[data-theme="chatgpt"] .window {
  border: 1px solid var(--pq-border) !important;
  background: var(--pq-bg) !important;
  border-radius: var(--pq-radius);
  box-shadow: none !important;
}

[data-theme="chatgpt"] #titlebar {
  background: var(--pq-surface) !important;
  border-bottom: 1px solid var(--pq-border);
  color: var(--pq-text);
  font-weight: 600;
  display: flex;
  align-items: center;
  padding: 4px 8px;
}

[data-theme="chatgpt"] #titlebar img {
  filter: grayscale(1) invert(1);
  opacity: 0.8;
}

/* Tables & Lists */
[data-theme="chatgpt"] .listbox {
  border: 1px solid var(--pq-border) !important;
  background: var(--pq-bg) !important;
  border-radius: var(--pq-radius);
}

[data-theme="chatgpt"] table {
  width: 100%;
  border-collapse: collapse;
}

[data-theme="chatgpt"] th {
  background: var(--pq-surface);
  color: var(--pq-text);
  font-weight: 600;
  text-align: left;
  padding: 4px 8px;
  border-bottom: 1px solid var(--pq-border);
}

[data-theme="chatgpt"] td {
  padding: 2px 8px;
  border-bottom: 1px solid var(--pq-border);
}

[data-theme="chatgpt"] tr:last-child td {
  border-bottom: none;
}

/* Progress Bars */
[data-theme="chatgpt"] .progress-container {
  border: 1px solid var(--pq-border) !important;
  background: var(--pq-surface) !important;
  border-radius: var(--pq-radius);
  height: 16px;
  overflow: hidden;
}

[data-theme="chatgpt"] .bar {
  background: var(--pq-accent) !important;
  background-image: none !important;
}

[data-theme="chatgpt"] .hint {
  color: var(--pq-text);
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
  font-size: 11px;
  line-height: 16px;
}

/* Typography */
[data-theme="chatgpt"] .label {
  color: var(--pq-text);
  font-weight: 600;
  margin-bottom: 4px;
  margin-top: 8px;
}

[data-theme="chatgpt"] a {
  color: var(--pq-accent) !important;
  text-decoration: none;
}

[data-theme="chatgpt"] a:hover {
  text-decoration: underline;
}

/* Roster Specifics */
[data-theme="chatgpt"] .brag {
  background: var(--pq-surface) !important;
  border: 1px solid var(--pq-border) !important;
  color: var(--pq-text);
  border-radius: var(--pq-radius);
}

[data-theme="chatgpt"] .online {
  background: rgba(16, 163, 127, 0.1) !important;
  border-color: var(--pq-accent) !important;
}

/* Form Elements */
[data-theme="chatgpt"] button {
  background: var(--pq-accent);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-family: var(--pq-font);
}

[data-theme="chatgpt"] button:hover {
  background: #1a7f64;
}

[data-theme="chatgpt"] input {
  background: var(--pq-surface);
  border: 1px solid var(--pq-border);
  color: var(--pq-text);
  padding: 4px;
  border-radius: 4px;
}
`;
