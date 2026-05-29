<script lang="ts">
  import { onMount } from 'svelte';
  import MarkdownIt from 'markdown-it';

  interface Props {
    encodedContent: string;
    containerId?: string;
  }

  let { encodedContent, containerId = 'article-content' }: Props = $props();
  let rendered = $state(false);
  let error = $state('');

  // ── KaTeX ──
  // View Transitions keep window.katex alive but swap page DOM, so the
  // CSS <link> must be re-injected even if the JS global already exists.
  async function loadKaTeX(): Promise<any> {
    // Always ensure CSS is present (critical after View Transition navigation)
    if (!document.querySelector('link[data-katex]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css';
      link.setAttribute('data-katex', '1');
      document.head.appendChild(link);
      // Wait for CSS before proceeding
      await new Promise<void>(r => {
        link.onload = () => r();
        link.onerror = () => r();
        setTimeout(() => r(), 5000);
      });
    }

    if ((window as any).katex) return (window as any).katex;

    // Load JS
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js';
      s.onload = () => resolve((window as any).katex);
      document.head.appendChild(s);
    });
  }

  function renderKaTeXIn(container: HTMLElement) {
    const katex = (window as any).katex;
    if (!katex) return Promise.resolve();

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const p = node.parentElement;
        if (!p || p.closest('.katex, .katex-display, pre, code, script, style')) return NodeFilter.FILTER_REJECT;
        return node.textContent?.includes('$') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });

    const textNodes: Text[] = [];
    let n: Node | null;
    while ((n = walker.nextNode())) textNodes.push(n as Text);

    for (const textNode of textNodes) {
      const text = textNode.textContent || '';
      if (!text.includes('$$') && !/\$(.+?)\$/.test(text)) continue;

      const frag = document.createDocumentFragment();
      let remaining = text;

      while (remaining.length > 0) {
        const dd = remaining.indexOf('$$');
        const im = remaining.match(/\$(.+?)\$/);

        let matchType: 'none' | 'display' | 'inline' = 'none';
        let idx = -1;
        let len = 0;

        if (dd >= 0) {
          const end = remaining.indexOf('$$', dd + 2);
          if (end > dd) { matchType = 'display'; idx = dd; len = end - dd + 2; }
        }
        if (im && im.index !== undefined && (matchType === 'none' || im.index < idx)) {
          if (!(dd >= 0 && im.index > dd && im.index < remaining.indexOf('$$', dd + 2))) {
            matchType = 'inline'; idx = im.index; len = im[0].length;
          }
        }

        if (matchType === 'none') { frag.appendChild(document.createTextNode(remaining)); break; }

        if (idx > 0) frag.appendChild(document.createTextNode(remaining.slice(0, idx)));

        const formula = matchType === 'display' ? remaining.slice(idx + 2, idx + len - 2).trim() : remaining.slice(idx + 1, idx + len - 1).trim();
        try {
          if (formula) {
            const span = document.createElement('span');
            katex.render(formula, span, { displayMode: matchType === 'display', throwOnError: false });
            frag.appendChild(span);
          }
        } catch { frag.appendChild(document.createTextNode(remaining.slice(idx, idx + len))); }

        remaining = remaining.slice(idx + len);
      }

      if (frag.childNodes.length > 0) textNode.replaceWith(frag);
    }
  }

  // ── Mermaid ──
  async function loadMermaid(): Promise<any> {
    if ((window as any).mermaid) return (window as any).mermaid;
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/mermaid@11.14.0/dist/mermaid.min.js';
      s.onload = () => resolve((window as any).mermaid);
      document.head.appendChild(s);
    });
  }

  async function renderMermaidIn(container: HTMLElement) {
    const candidates: HTMLElement[] = [];
    container.querySelectorAll<HTMLElement>('pre code.language-mermaid, pre code[class*="language-mermaid"]').forEach(code => {
      const pre = code.closest('pre') as HTMLElement | null;
      if (pre) candidates.push(pre);
    });
    if (candidates.length === 0) return;

    const mermaid = await loadMermaid();
    const isDark = document.documentElement.classList.contains('dark');
    mermaid.initialize({ startOnLoad: false, theme: isDark ? 'dark' : 'default', securityLevel: 'loose', fontFamily: 'inherit' });

    for (let i = 0; i < candidates.length; i++) {
      const pre = candidates[i];
      const code = (pre.textContent ?? '').trim();
      if (!code) continue;
      try {
        const { svg } = await mermaid.render(`mermaid-${Date.now()}-${i}`, code);
        const wrapper = document.createElement('div');
        wrapper.className = 'mermaid-rendered flex justify-center my-4 not-prose';
        wrapper.innerHTML = svg;
        pre.replaceWith(wrapper);
      } catch {
        pre.textContent = `Mermaid render failed: ${code}`;
      }
    }
  }

  // ── Main ──
  onMount(async () => {
    try {
      const binary = atob(encodedContent);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const markdown = new TextDecoder('utf-8').decode(bytes);

      // Protect $$...$$ math blocks from markdown-it (which eats \\ and escapes &)
      const mathBlocks: string[] = [];
      const safeMd = markdown.replace(/\$\$([\s\S]*?)\$\$/g, (_: string, f: string) => {
        mathBlocks.push(f);
        return `\n\n%%MATH${mathBlocks.length - 1}%%\n\n`;
      });

      const md = new MarkdownIt({ html: true, linkify: true, breaks: true });
      let html = md.render(safeMd);

      // Restore math blocks untouched
      html = html.replace(/%%MATH(\d+)%%/g, (_: string, idx: string) => {
        return `$$${mathBlocks[parseInt(idx)]}$$`;
      });

      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = html;

      // Wait for browser to complete layout + font loading before KaTeX.
      // Stretchy symbols (sqrt, overline, arrows) render as inline SVG that
      // needs the container's final width. rAF + setTimeout covers font
      // loading, CSS application, and layout calculation.
      container.offsetHeight;
      await new Promise(r => requestAnimationFrame(r));
      await new Promise(r => requestAnimationFrame(r));
      await new Promise(r => setTimeout(r, 0));

      await loadKaTeX();
      renderKaTeXIn(container);
      await renderMermaidIn(container);

      rendered = true;
    } catch (e) {
      error = '内容加载失败';
      console.error(e);
    }
  });
</script>

{#if error}
  <div class="text-center py-12 text-muted-foreground">{error}</div>
{:else if !rendered}
  <div class="animate-pulse space-y-4 py-8">
    <div class="h-4 bg-muted rounded w-3/4"></div>
    <div class="h-4 bg-muted rounded w-1/2"></div>
    <div class="h-4 bg-muted rounded w-5/6"></div>
    <div class="h-4 bg-muted rounded w-2/3"></div>
    <div class="h-4 bg-muted rounded w-4/5"></div>
  </div>
{/if}
