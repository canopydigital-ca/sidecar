<script>
  import { onMount, onDestroy } from 'svelte';
  import Button from './common/Button.svelte';
  import Section from './common/Section.svelte';
  import Tabs from './common/Tabs.svelte';

  // State management
  let isOpen = $state(false);
  let activeTab = $state('components');
  let demoEnabled = $state(true); // Default to enabled

  // Import storage service for settings persistence
  import { storageService } from '../../core/storage/index';

  // Load initial demo mode setting
  onMount(async () => {
    await storageService.settings.init();
    demoEnabled = storageService.settings.value?.demoModeEnabled ?? true;
  });

  // Non-Svelte components that need documentation/conversion
  const nonSvelteComponents = [
    {
      name: 'Dock Items',
      location: 'src/features/dock/dock.ts',
      status: 'needs-documentation',
      description:
        'Dock buttons and custom-rendered items using direct DOM manipulation',
    },
    {
      name: 'Overlay System',
      location: 'src/ui/manager.ts',
      status: 'needs-documentation',
      description: 'Shadow root container and overlay app elements',
    },
    {
      name: 'Progress Quest Chip',
      location: 'src/features/dock/dock.ts',
      status: 'needs-conversion',
      description: 'Progress quest status chip using replaceChildren()',
    },
    {
      name: 'Pets Webview Renderer',
      location: 'src/pets/renderers/webview/PetsWebviewRenderer.ts',
      status: 'needs-documentation',
      description: 'Webview iframe for pets with dynamic mounting',
    },
    {
      name: 'Vendor UI Controls',
      location: 'src/pets/renderers/webview/pets-host.js',
      status: 'needs-conversion',
      description: 'UI visibility toggle styles using dynamic style injection',
    },
    {
      name: 'Progress Quest Bridge',
      location: 'src/pq/bridge.ts',
      status: 'needs-documentation',
      description: 'Game UI elements and templates using script injection',
    },
  ];

  // Available Svelte components for showcase
  const svelteComponents = [
    {
      name: 'Button',
      component: Button,
      props: {
        variant: 'primary',
        size: 'md',
        children: 'Click me',
      },
      description:
        'A versatile button component with multiple variants and sizes',
    },
    {
      name: 'Section',
      component: Section,
      props: {
        title: 'Demo Section',
        borderTop: true,
      },
      description: 'Container component for grouping related content',
    },
    {
      name: 'Tabs',
      component: Tabs,
      props: {
        items: [
          { id: 'tab1', label: 'Tab 1' },
          { id: 'tab2', label: 'Tab 2' },
          { id: 'tab3', label: 'Tab 3' },
        ],
        activeId: 'tab1',
      },
      description: 'Tab navigation component with accessibility support',
    },
  ];

  // Keyboard event handler
  function handleKeydown(event) {
    if (event.key === '`' && !event.repeat && demoEnabled) {
      event.preventDefault();
      isOpen = !isOpen;
    }

    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      isOpen = false;
    }
  }

  // Demo mode toggle handler
  async function handleDemoToggle(event) {
    demoEnabled = !demoEnabled;

    // Persist the setting using storage service
    await storageService.settings.update((current) => ({
      ...current,
      demoModeEnabled: demoEnabled,
    }));

    if (!demoEnabled && isOpen) {
      isOpen = false;
    }
  }

  // Setup and cleanup
  onMount(() => {
    window.addEventListener('keydown', handleKeydown);

    // Listen for demo mode toggle events from status bar
    const statusBar = document.getElementById('cgpt-statusbar');
    if (statusBar) {
      statusBar.addEventListener('toggle-demo-mode', handleDemoToggle);
    }
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown);

    // Remove demo mode toggle event listener
    const statusBar = document.getElementById('cgpt-statusbar');
    if (statusBar) {
      statusBar.removeEventListener('toggle-demo-mode', handleDemoToggle);
    }
  });

  function closeDemo() {
    isOpen = false;
  }
</script>

{#if isOpen}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm transition-opacity duration-300"
    onclick={closeDemo}
    aria-hidden="true"
  ></div>

  <!-- Demo Panel -->
  <div
    class="fixed inset-4 z-[10001] bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 scale-95 opacity-0"
    class:scale-100={isOpen}
    class:opacity-100={isOpen}
    onclick={(e) => e.stopPropagation()}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between p-6 border-b border-white/10 bg-[#222] sticky top-0"
    >
      <h1 class="text-2xl font-bold text-white">Component Demo</h1>
      <Button
        onclick={closeDemo}
        variant="ghost"
        size="sm"
        ariaLabel="Close demo"
      >
        ✕
      </Button>
    </div>

    <!-- Navigation Tabs -->
    <div
      class="px-6 py-4 border-b border-white/10 bg-[#1e1e1e] sticky top-[76px]"
    >
      <Tabs
        items={[
          { id: 'components', label: 'Svelte Components' },
          { id: 'todo', label: 'Todo List' },
        ]}
        {activeTab}
        onchange={(id) => (activeTab = id)}
        label="Demo sections"
      />
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-auto p-6">
      {#if activeTab === 'components'}
        <!-- Svelte Components Showcase -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each svelteComponents as comp}
            {@const Comp = comp.component}
            <Section title={comp.name} borderTop={false}>
              <div class="p-4 bg-white/5 rounded-lg border border-white/10">
                <Comp {...comp.props} />
              </div>
              <p class="text-sm text-white/70 mt-3">{comp.description}</p>
              <div
                class="mt-3 p-3 bg-black/20 rounded text-xs font-mono overflow-x-auto"
              >
                <pre>&lt;{comp.name} {Object.entries(comp.props)
                    .map(([k, v]) => `${k}={"${v}"}`)
                    .join(' ')} /&gt;</pre>
              </div>
            </Section>
          {/each}
        </div>
      {:else if activeTab === 'todo'}
        <!-- Todo List Section -->
        <Section title="Non-Svelte Components" borderTop={false}>
          <p class="text-white/70 mb-4">
            These components use vanilla JavaScript DOM APIs and need
            documentation or conversion to Svelte components.
          </p>

          <div class="space-y-3">
            {#each nonSvelteComponents as item}
              <div class="p-4 bg-white/5 rounded-lg border border-white/10">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="font-semibold text-white">{item.name}</h3>
                  <span
                    class="px-2 py-1 text-xs rounded-full {item.status ===
                    'needs-conversion'
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : 'bg-blue-500/20 text-blue-300'}"
                  >
                    {item.status === 'needs-conversion'
                      ? 'Needs Conversion'
                      : 'Needs Documentation'}
                  </span>
                </div>
                <p class="text-sm text-white/70 mb-2">{item.description}</p>
                <div class="text-xs text-white/50 font-mono">
                  {item.location}
                </div>
              </div>
            {/each}
          </div>
        </Section>
      {/if}
    </div>

    <!-- Footer -->
    <div
      class="p-4 border-t border-white/10 bg-[#222] text-center text-sm text-white/50"
    >
      Press ` to toggle • ESC to close
    </div>
  </div>
{/if}

<style>
  /* Smooth transitions */
  .transition-all {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .transition-opacity {
    transition: opacity 0.3s ease-in-out;
  }

  /* Custom scrollbar */
  .overflow-auto::-webkit-scrollbar {
    width: 8px;
  }

  .overflow-auto::-webkit-scrollbar-track {
    background: #2a2a2a;
    border-radius: 4px;
  }

  .overflow-auto::-webkit-scrollbar-thumb {
    background: #555;
    border-radius: 4px;
  }

  .overflow-auto::-webkit-scrollbar-thumb:hover {
    background: #777;
  }
</style>
