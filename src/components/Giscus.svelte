<script lang="ts">
  import { siteConfig } from '../lib/config/site';
  import { onMount } from 'svelte';

  let scriptInjected = $state(false);

  onMount(() => {
    if (!siteConfig.giscus.repo) return;
    if (scriptInjected) return;
    scriptInjected = true;

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', siteConfig.giscus.repo);
    script.setAttribute('data-repo-id', siteConfig.giscus.repoId);
    script.setAttribute('data-category', siteConfig.giscus.category);
    script.setAttribute('data-category-id', siteConfig.giscus.categoryId);
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    script.setAttribute('data-lang', 'zh-CN');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;
    document.getElementById('giscus-container')?.appendChild(script);
  });
</script>

<div id="giscus-container" class="mt-12"></div>
