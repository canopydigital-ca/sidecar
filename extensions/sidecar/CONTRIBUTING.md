# Contributing to ChatGPT Dock

## Architecture

The codebase is modularized into features and core utilities.

### Directory Structure

- `src/core/`: Core utilities (DOM, events, logging, storage, context).
- `src/features/`: Feature-specific logic.
  - `composer/`: DOM finding and insertion for the chat input.
  - `dock/`: Dock UI and actions.
  - `popovers/`: Popover UI and wiring (Emoji, Help, Prompts, Fonts, Settings).
  - `sidebar/`: Sidebar toggling and resizing logic.
  - `code/`: Code block enhancement and preview.
  - `model/`: Model picker detection and relocation.
  - `status/`: Status bar and counters.
  - `input/`: Input resizing and collapsing.
  - `prompts/`: Prompt storage logic.
  - `fonts/`: Font management.
  - `settings/`: Settings storage logic.
- `src/legacy/monolith.ts`: Main entry point (bootstraps the application).
- `src/entrypoints/`: Extension entry points (content script).

### Adding a New Popover

1. Create a new module in `src/features/popovers/`.
2. Export `renderMyPopover(ctx)` and `wireMyPopover(pop, ctx)`.
3. Register the popover in `src/features/popovers/popover.ts` in the `openPopover` function.
4. Add an icon in `src/features/dock/icons.ts`.
5. Add a button in `src/features/dock/dock.ts` and handle the action in `src/features/dock/actions.ts`.

### State Management

- Global state is minimized.
- `DockContext` is passed to most functions to access shared state (`settings`, `uiState`, `statusState`).
- `scheduleWork(ctx)` is the main loop for reacting to DOM changes and updates.
