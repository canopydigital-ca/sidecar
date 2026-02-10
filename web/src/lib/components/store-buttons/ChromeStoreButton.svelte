<script lang="ts">
  export let variant: 'hero' | 'cta' = 'hero';
  export let href = '#';

  const compactClass = variant === 'hero' ? '' : 'scale-95';
</script>

<a
  {href}
  class="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:border-gray-600 {compactClass}"
  aria-label="Available in the Chrome Web Store"
  style="min-width: 206px; height: 58px;"
>
  <svg
    width="32"
    height="32"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    class="flex-shrink-0"
    aria-hidden="true"
    ><defs
      ><linearGradient
        id="a"
        x1="3.2173"
        y1="15"
        x2="44.7812"
        y2="15"
        gradientUnits="userSpaceOnUse"
        ><stop offset="0" stop-color="#d93025" /><stop
          offset="1"
          stop-color="#ea4335"
        /></linearGradient
      ><linearGradient
        id="b"
        x1="20.7219"
        y1="47.6791"
        x2="41.5039"
        y2="11.6837"
        gradientUnits="userSpaceOnUse"
        ><stop offset="0" stop-color="#fcc934" /><stop
          offset="1"
          stop-color="#fbbc04"
        /></linearGradient
      ><linearGradient
        id="c"
        x1="26.5981"
        y1="46.5015"
        x2="5.8161"
        y2="10.506"
        gradientUnits="userSpaceOnUse"
        ><stop offset="0" stop-color="#1e8e3e" /><stop
          offset="1"
          stop-color="#34a853"
        /></linearGradient
      ></defs
    ><circle cx="24" cy="23.9947" r="12" style="fill:#fff" /><path
      d="M3.2154,36A24,24,0,1,0,12,3.2154,24,24,0,0,0,3.2154,36ZM34.3923,18A12,12,0,1,1,18,13.6077,12,12,0,0,1,34.3923,18Z"
      style="fill:none"
    /><path
      d="M24,12H44.7812a23.9939,23.9939,0,0,0-41.5639.0029L13.6079,30l.0093-.0024A11.9852,11.9852,0,0,1,24,12Z"
      style="fill:url(#a)"
    /><circle cx="24" cy="24" r="9.5" style="fill:#1a73e8" /><path
      d="M34.3913,30.0029,24.0007,48A23.994,23.994,0,0,0,44.78,12.0031H23.9989l-.0025.0093A11.985,11.985,0,0,1,34.3913,30.0029Z"
      style="fill:url(#b)"
    /><path
      d="M13.6086,30.0031,3.218,12.006A23.994,23.994,0,0,0,24.0025,48L34.3931,30.0029l-.0067-.0068a11.9852,11.9852,0,0,1-20.7778.007Z"
      style="fill:url(#c)"
    /></svg
  >
  <div class="flex flex-col items-start leading-tight ml-3">
    <span
      class="text-[11px] uppercase font-medium text-gray-500 tracking-wide dark:text-gray-400"
      >Available in the</span
    >
    <span
      class="text-[15px] font-bold text-gray-900 tracking-tight dark:text-white"
      >Chrome Web Store</span
    >
  </div>
</a>
