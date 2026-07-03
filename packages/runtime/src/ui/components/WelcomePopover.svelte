<script lang="ts" module>
  // Svelte action: basic focus trap + initial focus.
  export function focusTrap(node: HTMLElement) {
    const getFocusable = () =>
      Array.from(
        node.querySelectorAll<HTMLElement>(
          'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
        )
      ).filter(
        (el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden')
      );

    const focusFirst = () => {
      const focusables = getFocusable();
      (focusables[0] ?? node).focus();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusables = getFocusable();
      if (focusables.length === 0) {
        e.preventDefault();
        node.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (!active || active === first || !node.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (!active || active === last || !node.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    // Run after mount tick without importing tick (good enough here)
    queueMicrotask(focusFirst);
    node.addEventListener('keydown', onKeyDown);

    return {
      destroy() {
        node.removeEventListener('keydown', onKeyDown);
      },
    };
  }
</script>

<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { ICONS } from '../../core/constants';

  let {
    onClose,
    mode = 'intro',
    version = '0.4.3',
  } = $props<{
    onClose: () => void;
    mode?: 'intro' | 'changelog' | 'welcome' | 'demo' | 'changelog-slim';
    version?: string;
  }>();

  let step = $state(0);

  const INTRO_STEPS = [
    {
      title: 'Welcome to ChatGPT Dock',
      body: 'A persistent, intelligent sidebar that keeps your workflow in motion.',
      icon:
        ICONS.sparkles ||
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
    },
    {
      title: 'Smart Sidebar',
      body: 'Keep ChatGPT beside your docs, tickets, and code. No tab juggling required.',
      icon:
        ICONS.sidebar ||
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>',
    },
    {
      title: 'Powerful Tools',
      body: 'Prompt manager, font controls, and token stats. Small upgrades, big sanity gains.',
      icon:
        ICONS.save ||
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
    },
  ];

  const CHANGELOG = [
    'New Svelte 5 architecture for better performance.',
    'Improved popover reliability and animations.',
    'Added Projects support (experimental).',
    'Enhanced status bar metrics and layout.',
    'Fixed sidebar toggle consistency.',
  ];

  // Demo mode is effectively 'intro' but maybe we can add a flag or just treat it same for now
  // Or we can alias it:
  let effectiveMode = $derived(
    mode === 'demo' ? 'intro' : mode === 'changelog-slim' ? 'changelog' : mode
  );

  const isChangelogOpen = () => effectiveMode === 'changelog';
  const isSlim = $derived(mode === 'changelog-slim');

  function next() {
    if (step < INTRO_STEPS.length - 1) step++;
    else close();
  }

  function close() {
    onClose?.();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();

    if (effectiveMode === 'intro') {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft' && step > 0) step--;
    }
  }
</script>

<div
  class="cgpt-modal-backdrop"
  transition:fade={{ duration: 160 }}
  role="presentation"
  onclick={close}
>
  <div
    class="cgpt-modal"
    transition:scale={{ start: 0.96, duration: 180 }}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
    onclick={(e) => e.stopPropagation()}
    onkeydown={handleKeydown}
    use:focusTrap
  >
    <button class="close-btn" type="button" onclick={close} aria-label="Close">
      {@html ICONS.close || '&times;'}
    </button>

    {#if effectiveMode === 'intro'}
      <div class="content intro-content">
        {#if mode === 'demo'}
          <div
            style="position:absolute; top:12px; left:12px; background:#f59e0b; color:#000; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold; pointer-events:none;"
          >
            DEMO
          </div>
        {/if}
        <div class="icon-wrapper" aria-hidden="true">
          {@html INTRO_STEPS[step].icon}
        </div>

        <div class="title-wrap">
          <h2 id="modal-title">{INTRO_STEPS[step].title}</h2>
          <div class="subline">
            <span class="pill">v{version}</span>
            <span class="hint">Esc to close · ←/→ to navigate</span>
          </div>
        </div>

        <p>{INTRO_STEPS[step].body}</p>

        <details class="cgpt-details" open={isChangelogOpen()}>
          <summary>
            <span>What’s new in v{version}</span>
          </summary>
          <ul class="changelog-list">
            {#each CHANGELOG as item}
              <li>{item}</li>
            {/each}
          </ul>
        </details>

        <div class="dots" aria-label="Progress">
          {#each INTRO_STEPS as _, i}
            <div class="dot" class:active={i === step} aria-hidden="true"></div>
          {/each}
        </div>

        <div class="actions">
          <button class="cgpt-btn" type="button" onclick={next}>
            {step === INTRO_STEPS.length - 1 ? 'Get started' : 'Next'}
          </button>
          {#if step < INTRO_STEPS.length - 1}
            <button class="cgpt-btn-ghost" type="button" onclick={close}
              >Skip</button
            >
          {/if}
        </div>
      </div>
    {:else if effectiveMode === 'changelog'}
      <div class="content changelog-content">
        <div class="title-wrap">
          <h2 id="modal-title">{isSlim ? 'Changelog' : 'What’s new'}</h2>
          <div class="subline">
            <span class="pill">v{version}</span>
            <span class="hint">Esc to close</span>
          </div>
        </div>

        {#if !isSlim}
          <p class="lead">
            A few upgrades landed. You get to enjoy them. I get to list them.
          </p>
        {/if}

        <details class="cgpt-details" open>
          <summary>
            <span>{isSlim ? `Changes in v${version}` : 'Changelog'}</span>
          </summary>
          <ul class="changelog-list">
            {#each CHANGELOG as item}
              <li>{item}</li>
            {/each}
          </ul>
        </details>

        <div class="actions">
          <button class="cgpt-btn" type="button" onclick={close}
            >{isSlim ? 'Close' : 'Got it'}</button
          >
        </div>
      </div>
    {:else}
      <div class="content welcome-content">
        <div class="icon-wrapper" aria-hidden="true">
          {@html ICONS.sparkles || INTRO_STEPS[0].icon}
        </div>

        <div class="title-wrap">
          <h2 id="modal-title">Welcome back</h2>
          <div class="subline">
            <span class="pill">v{version}</span>
            <span class="hint">Esc to close</span>
          </div>
        </div>

        <p class="lead">Dock is ready. Try not to start 17 side quests.</p>

        <details class="cgpt-details">
          <summary>
            <span>What’s new in v{version}</span>
          </summary>
          <ul class="changelog-list">
            {#each CHANGELOG as item}
              <li>{item}</li>
            {/each}
          </ul>
        </details>

        <div class="actions">
          <button class="cgpt-btn" type="button" onclick={close}>Start</button>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  /* Backdrop */
  .cgpt-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.52);
    backdrop-filter: blur(10px) saturate(120%);
    display: grid;
    place-items: center;
    z-index: 9999;
    padding: 20px;
  }

  /* Modal shell */
  .cgpt-modal {
    position: relative;
    width: min(520px, 100%);
    color: rgba(255, 255, 255, 0.92);
    border-radius: 16px;

    /* “2026 extension vibe”: glass + gradient border */
    border: 1px solid transparent;
    background:
      linear-gradient(rgba(18, 18, 20, 0.86), rgba(18, 18, 20, 0.86))
        padding-box,
      linear-gradient(
          135deg,
          rgba(16, 163, 127, 0.65),
          rgba(35, 199, 255, 0.28),
          rgba(255, 255, 255, 0.1)
        )
        border-box;

    box-shadow:
      0 30px 80px rgba(0, 0, 0, 0.55),
      0 2px 0 rgba(255, 255, 255, 0.06) inset;

    font-family:
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      sans-serif;

    outline: none;
  }

  .content {
    padding: 22px 22px 18px;
  }

  /* Close button */
  .close-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 34px;
    height: 34px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.78);
    cursor: pointer;
    display: grid;
    place-items: center;
    transition:
      transform 0.12s ease,
      background 0.12s ease,
      border-color 0.12s ease;
  }
  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.18);
    transform: translateY(-1px);
    color: rgba(255, 255, 255, 0.92);
  }
  .close-btn:focus-visible {
    outline: 2px solid rgba(35, 199, 255, 0.55);
    outline-offset: 2px;
  }

  /* Icon */
  .icon-wrapper {
    display: grid;
    place-items: center;
    margin: 2px 0 14px;
  }
  .icon-wrapper :global(svg) {
    width: 54px;
    height: 54px;
    color: #10a37f;
    filter: drop-shadow(0 10px 18px rgba(16, 163, 127, 0.18));
  }

  /* Titles */
  .title-wrap {
    display: grid;
    gap: 8px;
    margin-bottom: 10px;
  }

  h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 650;
    letter-spacing: -0.02em;
    text-align: center;
    color: rgba(255, 255, 255, 0.95);
  }

  .subline {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: center;
  }

  .pill {
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.78);
  }

  .hint {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.55);
  }

  p {
    margin: 0 0 14px;
    text-align: center;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.78);
  }

  p.lead {
    margin-bottom: 14px;
  }

  /* Details (accordion) */
  .cgpt-details {
    margin: 14px 0 16px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
    overflow: hidden;
  }

  .cgpt-details > summary {
    list-style: none;
    cursor: pointer;
    padding: 12px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    user-select: none;
  }

  .cgpt-details > summary::-webkit-details-marker {
    display: none;
  }

  .cgpt-details > summary span {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.88);
  }

  .cgpt-details > summary::after {
    content: '';
    width: 10px;
    height: 10px;
    border-right: 2px solid rgba(255, 255, 255, 0.55);
    border-bottom: 2px solid rgba(255, 255, 255, 0.55);
    transform: rotate(45deg);
    transition: transform 0.15s ease;
    margin-right: 2px;
  }

  .cgpt-details[open] > summary::after {
    transform: rotate(225deg);
  }

  /* Changelog list */
  .changelog-list {
    list-style: none;
    padding: 4px 12px 12px;
    margin: 0;
    color: rgba(255, 255, 255, 0.78);
  }
  .changelog-list li {
    position: relative;
    padding-left: 18px;
    margin-top: 8px;
    line-height: 1.35;
    font-size: 13px;
  }
  .changelog-list li::before {
    content: '';
    position: absolute;
    left: 4px;
    top: 8px;
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: rgba(16, 163, 127, 0.9);
    box-shadow: 0 0 0 3px rgba(16, 163, 127, 0.16);
  }

  /* Dots */
  .dots {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin: 10px 0 16px;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.18);
    transition:
      transform 0.12s ease,
      background 0.12s ease;
  }
  .dot.active {
    background: rgba(16, 163, 127, 1);
    transform: scale(1.2);
  }

  /* Actions */
  .actions {
    display: grid;
    gap: 10px;
    margin-top: 6px;
  }

  .cgpt-btn {
    width: 100%;
    border: 0;
    cursor: pointer;
    padding: 11px 14px;
    border-radius: 12px;
    font-weight: 650;
    letter-spacing: -0.01em;
    color: rgba(255, 255, 255, 0.95);
    background: linear-gradient(
      135deg,
      rgba(16, 163, 127, 0.95),
      rgba(35, 199, 255, 0.42)
    );
    box-shadow:
      0 14px 28px rgba(16, 163, 127, 0.2),
      0 1px 0 rgba(255, 255, 255, 0.12) inset;
    transition:
      transform 0.12s ease,
      filter 0.12s ease;
  }
  .cgpt-btn:hover {
    transform: translateY(-1px);
    filter: brightness(1.03);
  }
  .cgpt-btn:focus-visible {
    outline: 2px solid rgba(16, 163, 127, 0.55);
    outline-offset: 2px;
  }

  .cgpt-btn-ghost {
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.04);
    cursor: pointer;
    padding: 10px 14px;
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.78);
    font-weight: 600;
    transition:
      background 0.12s ease,
      border-color 0.12s ease,
      transform 0.12s ease;
  }
  .cgpt-btn-ghost:hover {
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(255, 255, 255, 0.18);
    transform: translateY(-1px);
    color: rgba(255, 255, 255, 0.9);
  }
  .cgpt-btn-ghost:focus-visible {
    outline: 2px solid rgba(35, 199, 255, 0.55);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .close-btn,
    .cgpt-btn,
    .cgpt-btn-ghost,
    .dot,
    .cgpt-details > summary::after {
      transition: none !important;
    }
  }
</style>
