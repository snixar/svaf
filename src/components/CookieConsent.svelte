<script lang="ts">
  interface ConsentPreferences {
    necessary: boolean;
    functional: boolean;
    analytics: boolean;
  }

  let showConsent = $state(false);
  let savedPrefs = $state<ConsentPreferences>({ necessary: true, functional: false, analytics: false });

  function loadPrefs(): ConsentPreferences {
    try {
      const saved = localStorage.getItem('cookie-preferences');
      if (saved) return JSON.parse(saved) as ConsentPreferences;
    } catch {}
    return { necessary: true, functional: false, analytics: false };
  }

  function saveAndApply(prefs: ConsentPreferences) {
    localStorage.setItem('cookie-preferences', JSON.stringify(prefs));
    window.dispatchEvent(new CustomEvent('cookie-consent-updated', { detail: prefs }));
    savedPrefs = prefs;
    showConsent = false;
  }

  $effect(() => {
    const prefs = loadPrefs();
    savedPrefs = prefs;
    if (!localStorage.getItem('cookie-preferences')) {
      setTimeout(() => { showConsent = true; }, 1000);
    } else {
      window.dispatchEvent(new CustomEvent('cookie-consent-updated', { detail: prefs }));
    }
  });

  // Listen for footer "Cookie 设置" link clicks
  $effect(() => {
    const handler = (e: Event) => { e.preventDefault(); openWithPrefs(); };
    const link = document.getElementById('open_preferences_center');
    link?.addEventListener('click', handler);
    return () => link?.removeEventListener('click', handler);
  });

  let funcChecked = $state(false);
  let analChecked = $state(false);

  function openWithPrefs() {
    const p = loadPrefs();
    funcChecked = p.functional;
    analChecked = p.analytics;
    showConsent = true;
  }

  function acceptAll() {
    saveAndApply({ necessary: true, functional: true, analytics: true });
  }

  function acceptNecessary() {
    saveAndApply({ necessary: true, functional: false, analytics: false });
  }

  function acceptCustom() {
    saveAndApply({ necessary: true, functional: funcChecked, analytics: analChecked });
  }
</script>

{#if showConsent}
  <div class="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto bg-card border border-border rounded-xl shadow-2xl p-6">
    <h3 class="text-lg font-semibold mb-2">Cookie 设置</h3>
    <p class="text-sm text-muted-foreground mb-4">
      本站使用 Cookie 来提升您的浏览体验并分析网站流量。您可以选择接受哪些类型的 Cookie。
    </p>
    <div class="space-y-2 mb-4">
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" checked disabled class="rounded" />
        <span>必要 Cookie（始终启用）</span>
      </label>
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" bind:checked={funcChecked} class="rounded" />
        <span>功能性 Cookie</span>
      </label>
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" bind:checked={analChecked} class="rounded" />
        <span>分析 Cookie</span>
      </label>
    </div>
    <div class="flex gap-2 justify-end">
      <button onclick={acceptNecessary} class="px-3 py-1.5 text-sm rounded-md border hover:bg-accent transition-colors">仅必要</button>
      <button onclick={acceptCustom} class="px-3 py-1.5 text-sm rounded-md border hover:bg-accent transition-colors">自定义</button>
      <button onclick={acceptAll} class="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity">全部接受</button>
    </div>
  </div>
{/if}
