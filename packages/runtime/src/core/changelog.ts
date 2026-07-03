export interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    type: 'added' | 'changed' | 'fixed' | 'removed';
    items: string[];
  }[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.5.52',
    date: '2026-02-07',
    changes: [
      {
        type: 'fixed',
        items: [
          'Dock UI: Prevented blank dock when stored dock order is missing or invalid.'
        ]
      }
    ]
  },
  {
    version: '0.5.50',
    date: '2026-02-05',
    changes: [
      {
        type: 'fixed',
        items: [
          'Dock UI: Restored popover styling reliability by injecting CSS via adoptedStyleSheets (CSP-resistant).',
          'ProgressQuest: Fixed postMessage origin mismatch handling and removed unsupported CSP directive.'
        ]
      }
    ]
  },
  {
    version: '0.5.49',
    date: '2026-02-05',
    changes: [
      {
        type: 'fixed',
        items: [
          'ProgressQuest: Hardened iframe sandboxing, tightened pq-host CSP, removed legacy json2 eval polyfill, paused PQ on background tabs when pause-when-hidden is enabled, and trimmed unused vendor assets.'
        ]
      }
    ]
  },
  {
    version: '0.5.48',
    date: '2026-02-05',
    changes: [
      {
        type: 'changed',
        items: [
          'ProgressQuest: Dock-native visual polish with theme token sync to iframe, improved compact styling, keyboard shortcuts (P/M/O) when PQ panel is focused, and reduced white seams on load.'
        ]
      }
    ]
  },
  {
    version: '0.5.47',
    date: '2026-02-05',
    changes: [
      {
        type: 'added',
        items: [
          'ProgressQuest: Added save import/export, rolling backups in chrome.storage.local, and auto-restore from latest snapshot on reload.'
        ]
      }
    ]
  },
  {
    version: '0.5.46',
    date: '2026-02-05',
    changes: [
      {
        type: 'added',
        items: [
          'ProgressQuest: Added Dock button, panel controls (pause/mute/pop-out), mini “Grinding” widget, and persistence for last-open state.'
        ]
      }
    ]
  },
  {
    version: '0.5.45',
    date: '2026-02-05',
    changes: [
      {
        type: 'added',
        items: [
          'ProgressQuest: Added iframe renderer + postMessage bridge (pause/resume/reset/export/import/summary) and a Dock popover panel to host the game.'
        ]
      }
    ]
  },
  {
    version: '0.5.44',
    date: '2026-02-05',
    changes: [
      {
        type: 'added',
        items: [
          'ProgressQuest: Vendored offline ProgressQuest Remix payload and added an extension-hosted pq-host.html wrapper for iframe loading.'
        ]
      }
    ]
  },
  {
    version: '0.5.43',
    date: '2026-02-04',
    changes: [
      {
        type: 'fixed',
        items: [
          'Pets Z-Index Stacking: Adjusted Z-indices so pets are visually above the Dock and Status Bar when overlapping.',
          'Pets Position Persistence: Fixed an issue where opening the Pets popover would reset the pet position/state by preventing unnecessary host re-attachment.'
        ]
      }
    ]
  },
  {
    version: '0.5.42',
    date: '2026-02-04',
    changes: [
      {
        type: 'fixed',
        items: [
          'Pets Resize Handling: Migrated window resize listeners to Svelte (<svelte:window>) for robust "stickiness" during browser resize.',
          'UI Initialization: PopoverRoot is now initialized immediately to ensure global event listeners are active.'
        ]
      }
    ]
  },
  {
    version: '0.5.41',
    date: '2026-02-04',
    changes: [
      {
        type: 'fixed',
        items: [
          'Pets Placement Constraint: Pets view is strictly constrained to the content viewport (minus sidebar and status bar) to prevent bleeding.',
          'Pets Interaction Override: Holding Ctrl temporarily enables interaction (click-through by default).'
        ]
      }
    ]
  },
  {
    version: '0.5.40',
    date: '2026-02-04',
    changes: [
      {
        type: 'fixed',
        items: [
          'Resize Responsiveness: Window resizing triggers layout resync so dock/status widths update immediately.',
          'Projects Width Matching: Composer width measurement uses the composer resize target for better dock width matching on Projects pages.'
        ]
      }
    ]
  },
  {
    version: '0.5.39',
    date: '2026-02-04',
    changes: [
      {
        type: 'fixed',
        items: [
          'Canvas Sizing With Sidebar: Pets background/strip sizing accounts for the ChatGPT sidebar and updates on open/close and resize.'
        ]
      }
    ]
  },
  {
    version: '0.5.38',
    date: '2026-02-04',
    changes: [
      {
        type: 'fixed',
        items: [
          'Pets Reset On Popover Open: Opening the Pets popover no longer resets/re-spawns pets.',
          'Placement Widths: Above Dock matches dock width; Near Composer matches composer width; Fixed Corner uses a full-width status-bar strip.'
        ]
      }
    ]
  },
  {
    version: '0.5.37',
    date: '2026-02-04',
    changes: [
      {
        type: 'changed',
        items: [
          'Status Bar Default: Status bar is enabled by default.',
          'Pets Interactivity: Above Dock clickability follows Click-through; Background/Near Composer are always click-through.'
        ]
      },
      {
        type: 'fixed',
        items: [
          'Fixed Corner Alignment: Fixed Corner sits flush on the status bar.',
          'Background Visibility: Background mode avoids hiding pets behind the status bar.'
        ]
      }
    ]
  },
  {
    version: '0.5.36',
    date: '2026-02-04',
    changes: [
      {
        type: 'fixed',
        items: [
          'Dock-Overlay Anchor Drift: Continuously re-anchors pets above the dock during resize/reflow and adds a small gap.'
        ]
      }
    ]
  },
  {
    version: '0.5.35',
    date: '2026-02-04',
    changes: [
      {
        type: 'fixed',
        items: [
          'Dock-Overlay Repositioning: Pets stay above the dock during window resize/layout shifts.',
          'Runtime Logger Crash: Added missing warn() method to logger.'
        ]
      }
    ]
  },
  {
    version: '0.5.34',
    date: '2026-02-04',
    changes: [
      {
        type: 'changed',
        items: [
          'Pets Interaction Model: Click-through by default; hold Ctrl to interact.',
          'VSCode-Pets Asset Management: Build downloads pinned VSIX payload into dist/vendor.'
        ]
      },
      {
        type: 'fixed',
        items: [
          'Pets Placement Accuracy: Clamped placement for dock-overlay/composer modes.',
          'Pets Post-Load Positioning: Clamped pet positions after boot/spawn/resize.'
        ]
      }
    ]
  },
  {
    version: '0.4.3',
    date: '2026-01-29',
    changes: [
      {
        type: 'added',
        items: [
          'Demo Mode: Always-on welcome tour via #demo URL hash.',
          'Svelte 5 Event Syntax: Modernized event handling.'
        ]
      },
      {
        type: 'fixed',
        items: [
          'Popover Initialization: Resolved "Portal not ready" warnings.',
          'Deprecation Warnings: Fixed Svelte 5 deprecation notices.'
        ]
      }
    ]
  },
  {
    version: '0.4.2',
    date: '2026-01-29',
    changes: [
      {
        type: 'added',
        items: [
          'Svelte 5 Architecture: Migrated UI components to Svelte 5 runes.',
          'Project Support: Experimental support for organizing chats.',
          'Enhanced Status Bar: New metrics and layout options.'
        ]
      },
      {
        type: 'changed',
        items: [
          'Popover System: Rewritten PopoverManager for reliability.',
          'Sidebar Toggle: Improved consistency.'
        ]
      },
      {
        type: 'fixed',
        items: [
          'Compilation Issues: Resolved Svelte compilation errors.',
          'Accessibility: Improved keyboard navigation.'
        ]
      }
    ]
  }
];
