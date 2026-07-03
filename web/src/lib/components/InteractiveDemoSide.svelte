<script lang="ts">
  import '../../app.css';
  import '../../routes/demo/dock.css';
  import Composer from '$lib/components/Composer.svelte';
  import BrowserFrame from '$lib/components/BrowserFrame.svelte';
  import { fly } from 'svelte/transition';
  import Icon from '$lib/components/Icon.svelte';
  import DemoDock from '$lib/components/DemoDock.svelte';

  let { t } = $props<{ t?: any }>(); // Accept t prop, optional for now
  let composerValue = $state('');

  // Interaction State
  let activeFeatureId = $state('dock');
  let isLocked = $state(false);

  const features = [
    {
      id: 'dock',
      title: 'Smart Dock',
      description: 'Your tools, always available. Hover any icon to explore.',
      icon: 'Layout',
      targetIds: ['dock-container'],
    },
    {
      id: 'settings',
      title: 'Global Settings',
      description: 'Configure API keys, UI preferences, and custom fonts.',
      icon: 'Settings',
      targetIds: ['settings'],
    },
    {
      id: 'prompts',
      title: 'Prompt Library',
      description:
        'Save and reuse your best prompts. Stop typing the same context twice.',
      icon: 'Library',
      targetIds: ['prompts'],
    },
    {
      id: 'wide',
      title: 'Wide Mode',
      description:
        'Reclaim your screen space. Toggle full-width chat with one click.',
      icon: 'Maximize2',
      targetIds: ['wide'],
    },
    {
      id: 'statusbar',
      title: 'Token Tracking',
      description: 'Real-time token usage and cost estimates as you type.',
      icon: 'Gauge',
      targetIds: ['statusbar'],
    },
    {
      id: 'model',
      title: 'Model Switcher',
      description: 'Quickly switch between GPT-4, Claude, and other models.',
      icon: 'Cpu',
      targetIds: ['model-selector'],
    },
  ];

  let activeFeature = $derived(
    features.find((f) => f.id === activeFeatureId) || features[0]
  );

  function handleInteraction(targetId: string, locked = false) {
    if (isLocked && !locked) return;

    // Map targetId to feature
    // This depends on how Dock renders IDs.
    // Assuming buttons have IDs or data-attributes matching features.
    // For now, simple mapping:
    let featureId = 'dock';
    if (targetId.includes('settings')) featureId = 'settings';
    else if (targetId.includes('prompts')) featureId = 'prompts';
    else if (targetId.includes('wide')) featureId = 'wide';
    else if (targetId.includes('status') || targetId.includes('token'))
      featureId = 'statusbar';
    else if (targetId.includes('model')) featureId = 'model';

    if (featureId) {
      activeFeatureId = featureId;
      if (locked) isLocked = true;
    }
  }

  function handleReset() {
    isLocked = false;
    activeFeatureId = 'dock';
  }

  // Event Delegation for Hover/Click
  function handleContainerClick(e: MouseEvent) {
    const target = (e.target as HTMLElement).closest('button, [role="button"]');
    if (target && target.id) {
      handleInteraction(target.id, true);
    } else {
      // Click outside unlocks?
      // isLocked = false;
    }
  }

  function handleContainerHover(e: MouseEvent | FocusEvent) {
    const target = (e.target as HTMLElement).closest('button, [role="button"]');
    if (target && target.id) {
      handleInteraction(target.id, false);
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleReset();
    }
  }
</script>

<section class="py-24 bg-zinc-950 border-t border-zinc-900/50" id="demo">
  <div class="container mx-auto px-6">
    <!-- Header -->
    <div class="text-center mb-16 max-w-2xl mx-auto">
      <h2 class="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
        {t?.title || 'Try it in 10 seconds.'}
      </h2>
      <p class="text-xl text-zinc-400">
        {t?.subtitle || 'Hover icons to preview. Click to see the feature.'}
      </p>
    </div>

    <div
      class="max-w-6xl mx-auto grid lg:grid-cols-[1fr_350px] gap-8 lg:gap-12 items-start"
    >
      <!-- Left: Interactive Browser Mockup -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <div
        class="relative group perspective-1000 outline-none"
        onmousemove={handleContainerHover}
        onfocusin={handleContainerHover}
        onclick={handleContainerClick}
        onkeydown={handleKeydown}
        role="region"
        aria-label="Interactive Demo"
      >
        <BrowserFrame
          class="h-[600px] shadow-2xl transition-all duration-500 hover:shadow-emerald-500/10 border-zinc-800"
        >
          <!-- Mock Chat Interface -->
          <div class="flex flex-col h-full bg-zinc-900 text-zinc-300 font-sans">
            <!-- Chat Header -->
            <div
              class="h-14 border-b border-white/5 flex items-center px-4 justify-between"
            >
              <div
                class="flex items-center gap-2 text-sm font-medium text-zinc-400"
              >
                <span>ChatGPT 4o</span>
              </div>
            </div>

            <!-- Chat Area -->
            <div class="flex-1 p-8 overflow-y-auto relative">
              <!-- User Message -->
              <div class="flex gap-4 mb-8 justify-end">
                <div
                  class="bg-zinc-800 rounded-2xl rounded-tr-sm px-5 py-3 max-w-[80%] text-sm leading-relaxed"
                >
                  How do I optimize this React component?
                </div>
                <div
                  class="w-8 h-8 rounded-full bg-zinc-700 flex-shrink-0"
                ></div>
              </div>

              <!-- Bot Message -->
              <div class="flex gap-4 max-w-[80%]">
                <div
                  class="w-8 h-8 rounded-full bg-emerald-500/20 flex-shrink-0 flex items-center justify-center text-emerald-500"
                >
                  <div class="w-4 h-4 rounded-sm bg-emerald-500"></div>
                </div>
                <div class="space-y-4">
                  <div class="bg-transparent text-sm leading-relaxed">
                    Here are a few ways to optimize your component:
                  </div>
                  <div
                    class="bg-black/50 rounded-md p-4 font-mono text-xs text-emerald-400 border border-white/5"
                  >
                    useMemo(() => expensiveCalculation(a, b), [a, b]);
                  </div>
                </div>
              </div>
            </div>

            <!-- Input Area (Composer) -->
            <div class="p-4 border-t border-white/5 bg-zinc-900 relative z-10">
              <div class="max-w-3xl mx-auto">
                <Composer bind:value={composerValue} />
              </div>
            </div>

            <!-- Sidecar Dock (Overlay) -->
            <div class="absolute bottom-6 left-6 z-50">
              <DemoDock onAction={(id) => handleInteraction(id, true)} />
            </div>
          </div>
        </BrowserFrame>
      </div>

      <!-- Right: Callout Panel -->
      <div class="hidden lg:block sticky top-32 relative">
        <!-- Connecting Line (Visual indication) -->
        <svg
          class="absolute top-1/2 -left-12 w-12 h-[2px] overflow-visible pointer-events-none hidden xl:block"
          style="top: 40%"
        >
          <line
            x1="0"
            y1="0"
            x2="100%"
            y2="0"
            stroke="rgba(255,255,255,0.1)"
            stroke-dasharray="4 4"
          />
          <circle cx="0" cy="0" r="3" fill="#34d399" />
        </svg>

        <div
          class="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative"
        >
          <!-- Dynamic Content -->
          {#key activeFeature.id}
            <div in:fly={{ y: 10, duration: 300 }} class="space-y-6">
              <div
                class="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-emerald-400 mb-6"
              >
                <!-- Icon placeholder, could dynamically render Lucide icon if I imported them all -->
                <Icon name={activeFeature.icon} class="w-6 h-6" />
              </div>

              <div>
                <h3 class="text-2xl font-bold text-white mb-3">
                  {activeFeature.title}
                </h3>
                <p class="text-lg text-zinc-400 leading-relaxed">
                  {activeFeature.description}
                </p>
              </div>

              <div class="pt-6 border-t border-white/5">
                <div
                  class="flex items-center gap-3 text-sm text-emerald-400 font-medium"
                >
                  <Icon name="Check" class="w-4 h-4" />
                  <span>Included in Free Plan</span>
                </div>
              </div>

              {#if isLocked}
                <button
                  onclick={handleReset}
                  class="mt-4 text-xs text-zinc-500 hover:text-white underline"
                >
                  Reset selection
                </button>
              {/if}
            </div>
          {/key}
        </div>
      </div>

      <!-- Mobile Info (visible only on small screens) -->
      <div class="lg:hidden bg-zinc-900 p-6 rounded-xl border border-zinc-800">
        <h3 class="text-xl font-bold text-white mb-2">{activeFeature.title}</h3>
        <p class="text-zinc-400">{activeFeature.description}</p>
      </div>
    </div>
  </div>
</section>
