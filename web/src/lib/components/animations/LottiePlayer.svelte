<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import lottie, { type AnimationItem } from 'lottie-web';

  let { 
    src, 
    loop = true, 
    autoplay = true, 
    renderer = 'svg',
    class: className = '',
    speed = 1
  } = $props<{
    src: string | object;
    loop?: boolean;
    autoplay?: boolean;
    renderer?: 'svg' | 'canvas' | 'html';
    class?: string;
    speed?: number;
  }>();

  let container: HTMLDivElement;
  let animation: AnimationItem | undefined;

  onMount(() => {
    if (!container || !src) return;

    try {
      animation = lottie.loadAnimation({
        container,
        renderer,
        loop,
        autoplay,
        animationData: typeof src === 'object' ? src : undefined,
        path: typeof src === 'string' ? src : undefined
      });

      animation.setSpeed(speed);
    } catch (err) {
      console.error('Failed to load Lottie animation:', err);
    }
  });

  onDestroy(() => {
    if (animation) {
      animation.destroy();
    }
  });

  $effect(() => {
    if (animation) {
      animation.setSpeed(speed);
    }
  });
</script>

<div bind:this={container} class={className} role="img" aria-label="Animation"></div>
