# ChatGPT Dock

ChatGPT Dock is a browser extension that enhances the ChatGPT interface by adding a persistent dock, improving layout, and adding useful utilities.

## Features

- **Dock**: A sidebar dock for quick access to tools.
- **Sidebar Toggle**: Easily toggle the main conversation sidebar.
- **Wide Mode**: Expand the conversation width.
- **Input Management**: Resize and collapse the input area.
- **Code Enhancements**: Collapsible code blocks and HTML previews.
- **Prompts**: Save and insert frequently used prompts. Recent prompts history.
- **Status Bar**: Track token usage, word count, and estimated cost.
- **Model Picker**: Relocates the model picker to the dock for better accessibility.
- **Fonts**: Customize the font family (System or Google Fonts).
- **Settings**: Configure extension behavior and export/import settings.

## Privacy

This extension operates entirely locally within your browser.
- All data (settings, prompts, stats) is stored in your browser's local storage (`chrome.storage.local`).
- No data is sent to any external server.
- Google Fonts are loaded directly from Google servers if enabled.

## Installation

1. Clone the repository.
2. Run `npm install` (or `bun install`).
3. Run `npm run build` (or `bun run build`).
4. Load the extension in Chrome/Edge/Brave:
   - Go to `chrome://extensions`.
   - Enable "Developer mode".
   - Click "Load unpacked".
   - Select the `dist` directory (or the project root if manifest points there, usually `dist` for built files but this project uses a build script).
   - *Note*: The build script outputs `content.js` to `dist`. The `manifest.json` should point to `dist/content.js`.

## Development

- Run `npm run dev` to watch for changes and rebuild automatically.

## License

MIT
