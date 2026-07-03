<script lang="ts">
  import '../../app.css';
  import './dock.css';
  import Icon from '$lib/components/Icon.svelte';
  import DemoDock from '$lib/components/DemoDock.svelte';

  let messages = $state([
    {
      role: 'assistant',
      content: 'Hello! I am ChatGPT. How can I help you today?',
    },
  ]);
  let inputValue = $state('');

  function sendMessage() {
    if (!inputValue.trim()) return;

    messages = [...messages, { role: 'user', content: inputValue }];
    const userMsg = inputValue;
    inputValue = '';

    setTimeout(() => {
      messages = [
        ...messages,
        {
          role: 'assistant',
          content: `I received your message: "${userMsg}". This is a demo of the Sidecar extension interface.`,
        },
      ];
    }, 1000);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }
</script>

<div
  id="__next"
  class="flex h-screen w-full bg-[#343541] text-gray-100 font-sans overflow-hidden"
>
  <!-- Mock Sidebar -->
  <div
    class="hidden md:flex flex-col w-[260px] bg-[#202123] p-2 border-r border-white/10"
  >
    <button
      class="flex items-center gap-3 px-3 py-3 rounded-md border border-white/20 hover:bg-gray-900 transition-colors text-sm text-white mb-4 text-left"
    >
      <span class="text-xl">+</span>
      New chat
    </button>

    <div class="flex-1 overflow-y-auto">
      <div class="text-xs font-medium text-gray-500 py-2 px-3">Today</div>
      <button
        class="w-full flex items-center gap-3 px-3 py-3 rounded-md hover:bg-[#2A2B32] transition-colors text-sm text-gray-100 text-left truncate"
      >
        <div class="w-4 h-4"><Icon name="MessageSquare" size={16} /></div>
        Sidecar Demo
      </button>
    </div>

    <div class="border-t border-white/20 pt-2">
      <button
        class="w-full flex items-center gap-3 px-3 py-3 rounded-md hover:bg-[#2A2B32] transition-colors text-sm text-gray-100 text-left"
      >
        <Icon name="User" class="w-4 h-4" />
        Upgrade to Plus
      </button>
      <button
        class="w-full flex items-center gap-3 px-3 py-3 rounded-md hover:bg-[#2A2B32] transition-colors text-sm text-gray-100 text-left"
      >
        <div class="w-4 h-4 bg-green-500 rounded-sm"></div>
        User
      </button>
    </div>
  </div>

  <!-- Main Chat Area -->
  <div class="flex-1 flex flex-col relative h-full">
    <!-- Top Bar (Mobile/Model selector) -->
    <div
      class="h-12 border-b border-white/10 flex items-center justify-between px-4 text-gray-300 md:hidden"
    >
      <button><Icon name="PanelLeft" class="w-6 h-6" /></button>
      <span class="font-medium">GPT-4</span>
      <button><div class="w-6 h-6">+</div></button>
    </div>

    <!-- Model Selector (Desktop) -->
    <div
      class="hidden md:flex h-14 border-b border-white/10 items-center justify-between px-4"
    >
      <div class="flex items-center gap-2 p-1 bg-[#202123] rounded-lg">
        <button
          class="px-3 py-1 bg-[#343541] rounded shadow text-sm font-medium"
          >GPT-4</button
        >
        <button
          class="px-3 py-1 text-gray-400 hover:text-gray-200 text-sm font-medium"
          >GPT-3.5</button
        >
      </div>
    </div>

    <!-- Messages -->
    <div class="flex-1 overflow-y-auto custom-scrollbar">
      {#each messages as msg}
        <div
          class="w-full border-b border-black/10 dark:border-gray-900/50 text-gray-800 dark:text-gray-100 group {msg.role ===
          'assistant'
            ? 'bg-[#444654]'
            : 'bg-[#343541]'}"
        >
          <div
            class="text-base gap-4 md:gap-6 md:max-w-2xl lg:max-w-xl xl:max-w-3xl p-4 md:py-6 flex lg:px-0 m-auto"
          >
            <div class="w-[30px] flex flex-col relative items-end">
              <div
                class="relative h-[30px] w-[30px] p-1 rounded-sm text-white flex items-center justify-center {msg.role ===
                'assistant'
                  ? 'bg-[#19c37d]'
                  : 'bg-[#5436DA]'}"
              >
                {#if msg.role === 'assistant'}
                  <Icon name="Bot" class="w-5 h-5" />
                {:else}
                  <Icon name="User" class="w-5 h-5" />
                {/if}
              </div>
            </div>
            <div class="relative flex-1 overflow-hidden">
              <div class="prose dark:prose-invert">
                {msg.content}
              </div>
            </div>
          </div>
        </div>
      {/each}
      <div class="h-32"></div>
      <!-- Spacer -->
    </div>

    <!-- Input Area -->
    <div
      class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#343541] via-[#343541] to-transparent pt-10 pb-6 px-4"
    >
      <div class="max-w-3xl mx-auto">
        <div
          class="relative flex h-full w-full flex-row rounded-xl border border-black/10 bg-white dark:bg-[#40414f] dark:border-gray-900/50 shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)] overflow-hidden"
        >
          <textarea
            bind:value={inputValue}
            onkeydown={handleKeydown}
            tabindex="0"
            rows="1"
            placeholder="Send a message..."
            class="m-0 w-full resize-none border-0 bg-transparent p-0 pl-4 pr-10 py-3 text-black dark:text-white focus:ring-0 focus-visible:ring-0 md:py-4 md:pl-4 md:pr-12 max-h-[200px] h-[52px] overflow-y-hidden"
          ></textarea>
          <button
            onclick={sendMessage}
            class="absolute p-1 rounded-md text-gray-500 bottom-1.5 right-1 md:bottom-2.5 md:right-2 hover:bg-gray-100 dark:hover:text-gray-400 dark:hover:bg-gray-900 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent transition-colors disabled:opacity-40"
            disabled={!inputValue}
          >
            <Icon name="Send" class="w-4 h-4" />
          </button>
        </div>
        <div class="text-center text-xs text-gray-400 mt-2">
          Sidecar Demo Environment. Not a real ChatGPT instance.
        </div>
      </div>
    </div>
  </div>

  <!-- Sidecar Dock Injection -->
  <!-- In the real extension, this is injected into the DOM. Here we mount it explicitly. -->
  <div class="fixed right-4 top-1/2 -translate-y-1/2 z-50">
    <DemoDock vertical />
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #343541;
  }

  /* Custom Scrollbar */
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(217, 217, 227, 0.3);
    border-radius: 4px;
  }
</style>
