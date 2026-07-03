<script lang="ts">
  import { page } from '$app/stores';
  import { locales, defaultLocale } from '$lib/i18n/config';
  import Icon from '$lib/components/Icon.svelte';
  import { clickoutside } from '$lib/actions/clickoutside';

  let isOpen = $state(false);

  const toggle = () => (isOpen = !isOpen);
  const close = () => (isOpen = false);

  const flags: Record<string, string> = {
    'en-ca': '🇨🇦',
    es: '🇪🇸',
    da: '🇩🇰',
    fr: '🇫🇷',
    hi: '🇮🇳',
    id: '🇮🇩',
    it: '🇮🇹',
    ja: '🇯🇵',
    ko: '🇰🇷',
    ku: '',
    nl: '🇳🇱',
    pt: '🇵🇹',
    ro: '🇷🇴',
    ru: '🇷🇺',
    tr: '🇹🇷',
    uk: '🇺🇦',
  };

  const currentLang = $derived($page.params.lang || defaultLocale);

  function selectLanguage(code: string) {
    localStorage.setItem('sidecar-lang', code);
    close();
  }
</script>

<div class="relative" use:clickoutside={close}>
  <button
    type="button"
    class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
    onclick={toggle}
    aria-label="Select language"
    aria-expanded={isOpen}
  >
    <span class="leading-none">{currentLang}</span>
    <Icon
      name="ChevronDown"
      class="w-4 h-4 transition-transform {isOpen ? 'rotate-180' : ''}"
    />
  </button>

  {#if isOpen}
    <div
      class="absolute right-0 top-full mt-2 w-48 py-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 max-h-[60vh] overflow-y-auto"
    >
      {#each Object.entries(locales) as [code, name]}
        <a
          href="/{code === defaultLocale ? '' : code}"
          class="flex items-center gap-3 px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          onclick={() => selectLanguage(code)}
        >
          <span class="text-lg leading-none">{flags[code] || '🌐'}</span>
          <span>{name}</span>
          {#if currentLang === code}
            <div class="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          {/if}
        </a>
      {/each}
    </div>
  {/if}
</div>
