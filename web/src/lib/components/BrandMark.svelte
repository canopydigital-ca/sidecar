<script lang="ts">
  export let size: "sm" | "md" = "sm";
  const box = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const text = size === "sm" ? "text-sm" : "text-base";
</script>

<div class={`${box} rounded bg-emerald-500 flex items-center justify-center relative overflow-hidden select-none`} aria-hidden="true">
  <span class="absolute left-0 top-0 bottom-0 w-[6px] bg-black/20" />
  <span class="absolute left-[2px] top-1/2 -translate-y-1/2 w-[2px] h-3 rounded bg-white/50" />
  <span class={`font-black tracking-tight text-white ${text}`}>SC</span>
</div>
