<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    containerId: string;
  }

  let { containerId }: Props = $props();

  const MERMAID_CDN = 'https://cdn.jsdelivr.net/npm/mermaid@11.14.0/dist/mermaid.min.js';

  // Store rendered blocks globally so re-render works across navigations
  const renderedBlocks = new Map<HTMLElement, string>();
  let mermaid: any = null;
  let currentTheme: 'dark' | 'default' = 'default';
  let initDone = false;

  function getTheme(): 'dark' | 'default' {
    if (typeof document === 'undefined') return 'default';
    return document.documentElement.classList.contains('dark') ? 'dark' : 'default';
  }

  async function loadMermaid(): Promise<any> {
    if (mermaid) return mermaid;
    if (typeof (window as any).mermaid !== 'undefined') {
      mermaid = (window as any).mermaid;
      return mermaid;
    }
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = MERMAID_CDN;
      s.onload = () => {
        mermaid = (window as any).mermaid;
        if (mermaid) resolve(mermaid);
        else reject(new Error('Mermaid not found'));
      };
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function initMermaid(theme: 'dark' | 'default') {
    if (!mermaid) return;
    mermaid.initialize({
      startOnLoad: false,
      theme,
      securityLevel: 'loose',
      fontFamily: 'inherit',
    });
    currentTheme = theme;
    initDone = true;
  }

  function decodeText(pre: HTMLElement): string {
    const lines = pre.querySelectorAll('span[data-line]');
    if (lines.length === 0) return (pre.textContent ?? '').trim();
    return Array.from(lines)
      .map((l) => (l.textContent ?? '').replace(/ /g, ' '))
      .join('\n')
      .trim();
  }

  function findMermaidBlocks(container: HTMLElement): Set<HTMLElement> {
    const candidates = new Set<HTMLElement>();
    container.querySelectorAll<HTMLElement>('pre[data-language="mermaid"]').forEach(el => candidates.add(el));
    container.querySelectorAll<HTMLElement>('code.language-mermaid, code[class*="language-mermaid"]').forEach(code => {
      const pre = code.closest('pre') as HTMLElement | null;
      if (pre) candidates.add(pre);
    });
    return candidates;
  }

  async function renderMermaidIn(container: HTMLElement) {
    const candidates = findMermaidBlocks(container);
    if (candidates.size === 0) return;

    await loadMermaid();
    const theme = getTheme();
    if (!initDone || theme !== currentTheme) initMermaid(theme);

    let i = 0;
    for (const pre of candidates) {
      const code = decodeText(pre);
      if (!code) continue;
      const id = `mermaid-${Date.now()}-${i++}`;
      try {
        const { svg } = await mermaid.render(id, code);
        const wrapper = document.createElement('div');
        wrapper.className = 'mermaid-rendered flex justify-center my-4 not-prose';
        wrapper.innerHTML = svg;
        // Store for re-render
        renderedBlocks.set(wrapper, code);
        pre.replaceWith(wrapper);
      } catch (err) {
        const errEl = document.createElement('pre');
        errEl.className = 'text-destructive text-xs';
        errEl.textContent = `Mermaid 渲染失败: ${(err as Error).message}\n\n${code}`;
        pre.replaceWith(errEl);
      }
    }
  }

  async function rerenderAll() {
    if (renderedBlocks.size === 0) return;
    await loadMermaid();
    const theme = getTheme();
    if (theme === currentTheme) return;

    initMermaid(theme);

    for (const [wrapper, code] of renderedBlocks) {
      // Skip wrappers that are no longer in the DOM
      if (!wrapper.isConnected) {
        renderedBlocks.delete(wrapper);
        continue;
      }
      const id = `mermaid-r-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      try {
        const { svg } = await mermaid.render(id, code);
        wrapper.innerHTML = svg;
      } catch {}
    }
  }

  onMount(async () => {
    const container = document.getElementById(containerId);
    if (container) {
      await renderMermaidIn(container);
    }

    // Listen for theme changes: watch for 'dark' class toggle on <html>
    const observer = new MutationObserver(() => {
      rerenderAll();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  });
</script>
