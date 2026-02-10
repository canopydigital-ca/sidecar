<script lang="ts">
  import LottiePlayer from '$lib/components/animations/LottiePlayer.svelte';
  import { onMount } from 'svelte';

  // Lottie URL for particles/universe effect
  // Using a reliable abstract particles animation as default
  const PARTICLES_SRC = "https://assets5.lottiefiles.com/packages/lf20_tiviyc3p.json"; 

  let mouseX = 0;
  let mouseY = 0;
  let innerWidth = 0;
  let innerHeight = 0;
  let container: HTMLDivElement;

  function handleMouseMove(event: MouseEvent) {
    if (!container) return;
    
    // Calculate normalized mouse position (-1 to 1)
    const nx = (event.clientX / innerWidth) * 2 - 1;
    const ny = (event.clientY / innerHeight) * 2 - 1;
    
    mouseX = nx;
    mouseY = ny;
  }
</script>

<svelte:window bind:innerWidth bind:innerHeight on:mousemove={handleMouseMove} />

<div 
  bind:this={container}
  class="absolute inset-0 overflow-hidden pointer-events-none select-none"
  aria-hidden="true"
>
  <!-- Suspended Field Effect (Static Air) -->
  <div 
    class="absolute inset-0 opacity-30"
    style="
      background: radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 70%);
      transform: translate({mouseX * 20}px, {mouseY * 20}px);
      transition: transform 0.4s ease-out;
    "
  ></div>

  <!-- Rotating Universe / Particles System -->
  <!-- 1-2 RPM = 60s-30s per rotation -->
  <div 
    class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] origin-center"
    style="
      animation: spin-universe 45s linear infinite;
    "
  >
    <!-- Lottie Layer -->
    <div 
      class="w-full h-full opacity-40 mix-blend-screen filter hue-rotate-90 saturate-150"
      style="
        transform: scale(1.2) translate({mouseX * -15}px, {mouseY * -15}px);
        transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
      "
    >
      <LottiePlayer 
        src={PARTICLES_SRC}
        autoplay={true}
        loop={true}
        renderer="svg"
        class="w-full h-full"
      />
    </div>
  </div>

  <!-- Green Glow with Pulsing -->
  <div 
    class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[100px]"
    style="
      animation: pulse-glow 8s ease-in-out infinite;
    "
  ></div>
  
  <!-- Additional Ambient Glow Particles (CSS fallback) -->
  <div class="absolute inset-0 opacity-20">
    <div class="absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-500/20 blur-[60px] animate-float-slow"></div>
    <div class="absolute bottom-1/3 right-1/4 w-48 h-48 bg-teal-500/20 blur-[80px] animate-float-slower"></div>
  </div>
</div>

<style>
  @keyframes spin-universe {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }

  @keyframes pulse-glow {
    0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
    50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
  }

  @keyframes float-slow {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(20px, -20px); }
  }

  @keyframes float-slower {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(-30px, 30px); }
  }

  .animate-float-slow {
    animation: float-slow 10s ease-in-out infinite;
  }

  .animate-float-slower {
    animation: float-slower 15s ease-in-out infinite;
  }
</style>