<script lang="ts">
  import LottiePlayer from './LottiePlayer.svelte';

  let { lottieSrc = undefined } = $props<{ lottieSrc?: string | object }>();
</script>

<div 
  class="relative w-full h-full flex flex-col items-center justify-center p-6"
  role="group"
  aria-label="Progress Quest Animation"
>
  {#if lottieSrc}
    <LottiePlayer src={lottieSrc} class="w-full h-full" />
  {:else}
    <!-- Retro UI Fallback -->
    <div class="w-full max-w-[280px] bg-zinc-900 border-2 border-zinc-700 rounded shadow-xl font-mono text-xs overflow-hidden">
      <!-- Window Header -->
      <div class="bg-zinc-800 border-b border-zinc-700 px-2 py-1 flex justify-between items-center">
        <span class="text-zinc-400 font-bold">Character Sheet</span>
        <div class="flex gap-1">
          <div class="w-2 h-2 rounded-full bg-zinc-600"></div>
          <div class="w-2 h-2 rounded-full bg-zinc-600"></div>
        </div>
      </div>

      <!-- Content -->
      <div class="p-3 space-y-3">
        <!-- Stats Grid -->
        <div class="grid grid-cols-2 gap-2 text-[10px] text-zinc-500">
          <div class="flex justify-between">
            <span>STR</span> <span class="text-emerald-400 font-bold">18</span>
          </div>
          <div class="flex justify-between">
            <span>INT</span> <span class="text-blue-400 font-bold">22</span>
          </div>
          <div class="flex justify-between">
            <span>DEX</span> <span class="text-yellow-400 font-bold">14</span>
          </div>
          <div class="flex justify-between">
            <span>CHA</span> <span class="text-pink-400 font-bold">09</span>
          </div>
        </div>

        <!-- Progress Bars -->
        <div class="space-y-2">
          <!-- Quest Bar -->
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-zinc-400">Current Quest</span>
              <span class="text-zinc-500 typing-text">Slaying Bug...</span>
            </div>
            <div class="h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
              <div class="h-full bg-gradient-to-r from-purple-500 to-indigo-500 animate-progress w-full origin-left"></div>
            </div>
          </div>

          <!-- XP Bar -->
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-zinc-400">Experience</span>
              <span class="text-zinc-500">Level 60</span>
            </div>
            <div class="h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
              <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-500 animate-progress-slow w-full origin-left"></div>
            </div>
          </div>
        </div>

        <!-- Loot Log -->
        <div class="h-12 bg-zinc-950/50 border border-zinc-800 rounded p-2 overflow-hidden relative">
          <div class="absolute bottom-0 left-0 w-full p-2 space-y-1 animate-scroll-up">
            <div class="text-zinc-500">Executed &lt;Function&gt;</div>
            <div class="text-emerald-500/80">+100 XP</div>
            <div class="text-yellow-500/80">Looted: Golden Syntax</div>
            <div class="text-zinc-400">Saving...</div>
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent pointer-events-none"></div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  @keyframes progress {
    0% { transform: scaleX(0); }
    100% { transform: scaleX(1); }
  }

  @keyframes progress-slow {
    0% { transform: scaleX(0.4); }
    100% { transform: scaleX(0.8); }
  }

  @keyframes scroll-up {
    0% { transform: translateY(0); }
    25% { transform: translateY(-25%); }
    50% { transform: translateY(-50%); }
    75% { transform: translateY(-75%); }
    100% { transform: translateY(-100%); }
  }

  .animate-progress {
    animation: progress 3s linear infinite;
  }

  .animate-progress-slow {
    animation: progress-slow 10s linear infinite alternate;
  }

  .animate-scroll-up {
    animation: scroll-up 4s steps(4, end) infinite;
  }
</style>
