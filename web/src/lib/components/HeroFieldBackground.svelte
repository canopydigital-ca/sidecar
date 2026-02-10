<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import lottie, { type AnimationItem } from 'lottie-web';
  import { ParticleSystem } from '$lib/utils/particleField';
  import { FallingSystem } from '$lib/utils/fallingSystem';

  let {
    intensity = 1.0,
    rotateRpm = 1.5,
    enableInteraction = true,
    quality = 'high',
    class: className = '',
    children,
  } = $props<{
    intensity?: number;
    rotateRpm?: number;
    enableInteraction?: boolean;
    quality?: 'high' | 'low';
    class?: string;
    children?: import('svelte').Snippet;
  }>();

  let container: HTMLDivElement;
  let lottieContainer: HTMLDivElement;
  let canvas = $state<HTMLCanvasElement>();
  let fallingCanvas = $state<HTMLCanvasElement>();
  let particleSystem: ParticleSystem | undefined;
  let fallingSystem: FallingSystem | undefined;
  let animation: AnimationItem | undefined;
  let observer: IntersectionObserver;

  // Using the particles/universe Lottie
  const LOTTIE_SRC =
    'https://assets5.lottiefiles.com/packages/lf20_tiviyc3p.json';

  onMount(() => {
    // Reduced Motion Check
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) return;

    // Init Lottie
    try {
      animation = lottie.loadAnimation({
        container: lottieContainer,
        renderer: 'svg',
        loop: false, // Changed to false to handle sequence
        autoplay: false, // Controlled by observer
        path: LOTTIE_SRC,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice',
        },
      });
      // Adjust speed based on intensity
      animation.setSpeed(0.5 * intensity);

      // When animation completes, start the falling sequence
      animation.addEventListener('complete', () => {
        fallingSystem?.startSequence();
        // We can restart Lottie loop if desired, or just let it sit
        // The user said "transition into a new looping cycle where... it drops elements"
        // So we stop Lottie loop and start FallingSystem loop.
        // But maybe we want the Lottie background to persist?
        // "instead of repeating the original 'shooting out' animation"
        // This implies the Lottie shouldn't repeat its main action.
        // We'll keep the Lottie on the last frame (it stays visible) or hide it?
        // Usually Lottie freezes on last frame.
      });
    } catch (e) {
      console.error('Lottie failed to load', e);
    }

    // Init Particles (only if quality is high)
    if (quality === 'high') {
      if (canvas) {
        // Background Particles (Sticky)
        particleSystem = new ParticleSystem(canvas, {
          count: Math.floor(120 * intensity), // Doubled density
          speed: 0.3 * intensity,
          color: '#34d399', // Tailwind emerald-400
        });
      }

      // Initialize falling system if canvas is available
      if (fallingCanvas) {
        fallingSystem = new FallingSystem(fallingCanvas);
      }
    }

    // Intersection Observer for Performance
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!fallingSystem?.isRunning) {
              animation?.play();
            }
            // Always start particles if they are fixed
            particleSystem?.start();
            if (fallingSystem?.isRunning) fallingSystem.loop();
          } else {
            // If sticky behavior is requested, we shouldn't pause the particles when the hero scrolls out
            // BUT if we navigate to another page, we should pause.
            // For now, let's keep them running if they are fixed, assuming single page or hero is always present?
            // Actually, if we scroll far down, it's fine to keep them running if they are "fixed background".
            // But if we want to save battery when way down, maybe we should stop?
            // User said "always go". So we DON'T stop.

            // Only stop Lottie if it's offscreen? Lottie is in the container, so it should stop.
            animation?.pause();
          }
        });
      },
      { threshold: 0 }
    );

    // If we want particles to "always go", we should just start them and never stop them via observer
    // unless the component is destroyed.
    particleSystem?.start();

    // For falling system, it starts on Lottie complete.
    // If Lottie is complete, falling system runs.

    if (container) observer.observe(container);

    // Resize handling
    const handleResize = () => {
      if (particleSystem) particleSystem.resize();
      if (fallingSystem) fallingSystem.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  onDestroy(() => {
    observer?.disconnect();
    animation?.destroy();
    particleSystem?.destroy();
    fallingSystem?.stop();
  });

  function handleMouseMove(e: MouseEvent) {
    if (!enableInteraction || !particleSystem) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    particleSystem.setMouse(x, y);
  }

  function handleMouseLeave() {
    particleSystem?.setMouse(-1, -1);
  }
</script>

<div
  bind:this={container}
  class="relative overflow-hidden {className}"
  onmousemove={handleMouseMove}
  onmouseleave={handleMouseLeave}
  role="presentation"
>
  <!-- Background Layer (Absolute) -->
  <div class="absolute inset-0 pointer-events-none z-0 select-none">
    <!-- 1. Deep Gradient Base -->
    <div
      class="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950"
    ></div>

    <!-- 2. Lottie Animation (Rotating Field) -->
    <div
      class="absolute top-1/2 left-1/2 w-[150%] h-[150%] -translate-x-1/2 -translate-y-1/2 will-change-transform"
      style="animation: spin {60 / rotateRpm}s linear infinite;"
    >
      <div
        bind:this={lottieContainer}
        class="w-full h-full opacity-30 mix-blend-screen filter hue-rotate-90 saturate-150 scale-125"
      ></div>
    </div>

    <!-- 3. Glow Pulse -->
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-emerald-500/5 blur-[100px] rounded-full animate-pulse-slow"
    ></div>

    <!-- 4. Interactive Canvas Particles (Sticky Background) -->
    {#if quality === 'high'}
      <canvas
        bind:this={canvas}
        class="absolute inset-0 opacity-70 fixed-particles"
      ></canvas>

      <!-- 5. Falling Elements Overlay (Scrolls with content or fixed? Usually falling elements are global) -->
      <!-- User said "drops... elements". If it's part of the background, fixed makes sense. -->
      <canvas
        bind:this={fallingCanvas}
        class="absolute inset-0 z-0 pointer-events-none"
      ></canvas>
    {/if}

    <!-- 6. Vignette / Overlay to ensure text readability -->
    <div
      class="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-zinc-950/80"
    ></div>
  </div>

  <!-- Content Slot (Relative z-10) -->
  <div class="relative z-10 w-full h-full">
    {@render children?.()}
  </div>
</div>

<style>
  /* Ensure particles stay fixed relative to viewport if desired */
  /* "maintain their exact position relative to the viewport when the page scrolls" */
  /* This means position: fixed. But we are inside a relative container. */
  /* The transform on parent might break fixed. */
  /* If we want TRUE fixed, we need to break out or use a different strategy. */
  /* However, if the container covers the screen (hero), fixed works. */
  /* If the container scrolls away, fixed elements might overflow. */
  /* Given the request "preventing them from moving with the page content", fixed is the way. */

  :global(.fixed-particles) {
    /* We can't easily make just the canvas fixed if parent has transforms. */
    /* HeroFieldBackground root has relative. */
    /* Let's try making the canvas fixed but careful about z-index. */
    /* If we make it fixed, it will cover other sections unless clipped. */
    /* But standard "sticky background" usually implies it stays behind the hero until hero is gone? */
    /* OR it implies a full-page background. */
    /* Let's assume full-page background behavior for the particles. */
    position: fixed !important;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none; /* Let clicks pass through */
    z-index: 0; /* Behind content */
  }

  @keyframes spin {
    from {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }

  .animate-pulse-slow {
    animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.3;
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      opacity: 0.6;
      transform: translate(-50%, -50%) scale(1.1);
    }
  }

  /* Reduced Motion Override */
  @media (prefers-reduced-motion: reduce) {
    div[style*='animation: spin'] {
      animation: none !important;
    }
    .animate-pulse-slow {
      animation: none !important;
      opacity: 0.4;
    }
  }
</style>
