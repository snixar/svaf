<script lang="ts">
  import { onMount } from 'svelte';

  const STORAGE_KEY = 'theme';

  let isDark = $state(false);

  function getStoredDark(): boolean {
    if (typeof window === 'undefined') return false;
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'dark') return true;
    if (v === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function applyTheme(dark: boolean) {
    if (typeof document === 'undefined') return;
    const el = document.documentElement;
    if (dark) {
      el.classList.add('dark');
    } else {
      el.classList.remove('dark');
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0a0a0a' : '#ffffff');
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
    }
  }

  function toggle() {
    isDark = !isDark;
    applyTheme(isDark);
  }

  const label = $derived(isDark ? '深色模式' : '浅色模式');

  onMount(() => {
    isDark = getStoredDark();
    applyTheme(isDark);
  });
</script>

<button
  onclick={toggle}
  class="inline-flex items-center justify-center rounded-md w-9 h-9 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
  aria-label={`切换到${isDark ? '浅色' : '深色'}模式`}
  title={label}
>
  {#if isDark}
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  {:else}
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  {/if}
</button>
