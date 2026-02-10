<script lang="ts">
  let {
    value,
    decimals = 0,
    class: className = '',
    duration = 700,
  } = $props<{
    value: number;
    decimals?: number;
    class?: string;
    duration?: number;
  }>();

  // Format value to string ensuring correct decimals
  let displayString = $derived(value.toFixed(decimals));
  let chars = $derived(displayString.split(''));
</script>

<div
  class={`inline-grid grid-cols-1 items-baseline overflow-hidden ${className}`}
  aria-label={displayString}
>
  <!-- Invisible duplicate for baseline/sizing -->
  <span class="invisible col-start-1 row-start-1 font-mono">{displayString}</span>

  <!-- Actual animated numbers -->
  <div class="col-start-1 row-start-1 flex items-baseline pointer-events-none">
    {#each chars as char, i (i)}
      {#if /[0-9]/.test(char)}
        <div class="relative w-[0.6em]">
          <!-- Digit Strip -->
          <div
            class="absolute top-0 left-0 w-full flex flex-col transition-transform ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style="transform: translateY(-{parseInt(char) *
              10}%); transition-duration: {duration}ms;"
          >
            {#each Array(10) as _, digit}
              <div class="flex items-center justify-center">
                {digit}
              </div>
            {/each}
          </div>
          <!-- Spacer to hold height -->
          <div class="invisible">0</div>
        </div>
      {:else}
        <!-- Non-digit characters (., etc) -->
        <div class="flex items-center justify-center w-[0.4em]">
          {char}
        </div>
      {/if}
    {/each}
  </div>
</div>
