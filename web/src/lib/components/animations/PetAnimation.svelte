<script lang="ts">
  import LottiePlayer from './LottiePlayer.svelte';

  let { lottieSrc = undefined } = $props<{ lottieSrc?: string | object }>();

  // Fallback State
  let isInteracting = $state(false);
</script>

<div 
  class="relative w-full h-full flex items-center justify-center overflow-hidden"
  role="group"
  aria-label="VS Code Pet Animation"
  onmouseenter={() => isInteracting = true}
  onmouseleave={() => isInteracting = false}
>
  {#if lottieSrc}
    <LottiePlayer src={lottieSrc} class="w-full h-full" />
  {:else}
    <!-- Pixel Art Cat Fallback -->
    <!-- Simple SVG constructed to look like a pixel art cat -->
    <svg 
      viewBox="0 0 32 32" 
      class="w-32 h-32 transition-transform duration-300 {isInteracting ? 'scale-110' : ''}"
      style="image-rendering: pixelated; shape-rendering: crisp-edges;"
    >
      <!-- Cat Body (Orange/Brown Tabby) -->
      <g class="cat-body">
        <!-- Main Body -->
        <rect x="8" y="16" width="16" height="10" fill="#d97706" />
        <!-- Head -->
        <rect x="10" y="8" width="12" height="10" fill="#d97706" />
        <!-- Ears -->
        <path d="M10 8 L10 4 L13 8 Z" fill="#d97706" />
        <path d="M22 8 L22 4 L19 8 Z" fill="#d97706" />
        
        <!-- Eyes (Blinking Animation) -->
        <g class="cat-eyes">
          <rect x="12" y="11" width="2" height="2" fill="#1f2937" />
          <rect x="18" y="11" width="2" height="2" fill="#1f2937" />
        </g>

        <!-- Tail (Wagging Animation) -->
        <g class="cat-tail origin-bottom-left" style="transform-origin: 24px 22px;">
          <rect x="24" y="20" width="4" height="2" fill="#d97706" />
          <rect x="26" y="18" width="2" height="4" fill="#d97706" />
        </g>

        <!-- Paws -->
        <rect x="9" y="26" width="3" height="2" fill="#fff" />
        <rect x="20" y="26" width="3" height="2" fill="#fff" />
      </g>
      
      <!-- Zzz (Sleeping/Idle particles) -->
      {#if !isInteracting}
        <g class="zzz opacity-0">
          <text x="24" y="8" font-family="monospace" font-size="6" fill="#9ca3af">z</text>
        </g>
      {/if}
      
      <!-- Heart (Interaction) -->
      {#if isInteracting}
        <g class="heart">
          <path d="M24 6 C24 6, 26 4, 28 6 C30 8, 24 12, 24 12 C24 12, 18 8, 20 6 C22 4, 24 6, 24 6 Z" fill="#ec4899" />
        </g>
      {/if}
    </svg>
  {/if}
</div>

<style>
  /* Pixel Art Animations */
  @keyframes blink {
    0%, 90%, 100% { transform: scaleY(1); }
    95% { transform: scaleY(0.1); }
  }
  
  @keyframes tail-wag {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(-15deg); }
  }

  @keyframes float-up {
    0% { transform: translateY(0) scale(0.5); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translateY(-10px) scale(1); opacity: 0; }
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-2px); }
  }

  /* Apply animations */
  :global(.cat-eyes) {
    transform-origin: center;
    animation: blink 4s infinite;
  }

  :global(.cat-tail) {
    animation: tail-wag 2s ease-in-out infinite;
  }

  :global(.zzz) {
    animation: float-up 3s ease-in-out infinite;
  }

  :global(.heart) {
    animation: bounce 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28) infinite;
  }
  
  /* Breathe effect on body */
  :global(.cat-body) {
    animation: bounce 4s ease-in-out infinite reverse; /* Subtle breathing */
  }
</style>
