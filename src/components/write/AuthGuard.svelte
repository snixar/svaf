<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    onAuth: (token: string) => void;
  }

  let { onAuth }: Props = $props();

  let token = $state('');
  let hasToken = $state(false);
  let show = $state(false);
  let error = $state('');
  let loading = $state(false);

  onMount(() => {
    const saved = sessionStorage.getItem('github-token');
    if (saved) {
      token = saved;
      hasToken = true;
      onAuth(saved);
    } else {
      show = true;
      // Check for ?token= in URL (for convenience)
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      if (urlToken) {
        token = urlToken;
        // Clean URL
        history.replaceState(null, '', window.location.pathname);
      }
    }
  });

  async function handleSubmit() {
    error = '';
    loading = true;
    try {
      // Verify token by calling GitHub API
      const res = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || 'Invalid token');
      }
      const user = await res.json();
      sessionStorage.setItem('github-token', token);
      hasToken = true;
      show = false;
      onAuth(token);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Authentication failed';
    } finally {
      loading = false;
    }
  }

  function handleClear() {
    sessionStorage.removeItem('github-token');
    hasToken = false;
    token = '';
    show = true;
    error = '';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit();
  }
</script>

{#if !hasToken && show}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
    <div class="w-full max-w-md mx-4 bg-card border border-border rounded-xl shadow-2xl p-6">
      <h2 class="text-xl font-bold mb-2">GitHub 认证</h2>
      <p class="text-sm text-muted-foreground mb-4">
        请输入你的 GitHub Personal Access Token 以使用在线编辑功能。
        Token 仅存储在浏览器 sessionStorage 中，关闭页面后自动清除。
      </p>
      <p class="text-xs text-muted-foreground mb-4">
        <a
          href="https://github.com/settings/tokens/new?scopes=repo&description=svaf-astro%20blog"
          target="_blank"
          class="text-primary underline underline-offset-2 hover:opacity-80"
        >
          点击这里创建新 Token（需要 repo 权限）
        </a>
      </p>
      <div class="space-y-3">
        <input
          type="password"
          bind:value={token}
          onkeydown={handleKeydown}
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          class="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        {#if error}
          <p class="text-sm text-red-500">{error}</p>
        {/if}
        <button
          onclick={handleSubmit}
          disabled={!token || loading}
          class="w-full h-10 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? '验证中...' : '验证并登录'}
        </button>
      </div>
    </div>
  </div>
{/if}

{#if hasToken}
  <div class="fixed top-16 right-4 z-50">
    <button
      onclick={handleClear}
      class="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 bg-card/80 px-2 py-1 rounded"
      title="清除 Token 并退出"
    >
      退出登录
    </button>
  </div>
{/if}
