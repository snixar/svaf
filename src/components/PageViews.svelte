<script lang="ts">
  import { siteConfig } from '../lib/config/site';

  interface Props {
    pathname: string;
    cacheKey: string;
    class?: string;
    prefix?: string;
  }

  let { pathname, cacheKey, class: className = '', prefix = '' }: Props = $props();

  let views = $state<number | null>(null);
  let loaded = $state(false);

  $effect(() => {
    async function fetchViews() {
      if (loaded) return;
      if (!siteConfig.services.pageViews) return;
      loaded = true;
      try {
        const response = await fetch(siteConfig.services.pageViews, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify([pathname]),
        });
        if (response.ok) {
          const data = await response.json() as number[];
          if (data.length > 0) views = data[0] || 0;
        }
      } catch {}
    }
    fetchViews();
  });
</script>

{#if views !== null}
  <span class={className}>{prefix}{views.toLocaleString()} 次浏览</span>
{/if}
