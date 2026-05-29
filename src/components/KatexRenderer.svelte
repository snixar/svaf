<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    containerId?: string;
  }

  let { containerId = 'article-content' }: Props = $props();

  let katexLoaded = $state(false);

  // Load KaTeX from CDN
  async function loadKaTeX(): Promise<boolean> {
    if (katexLoaded) return true;
    if (typeof document === 'undefined') return false;

    // Load CSS
    if (!document.querySelector('link[data-katex]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css';
      link.setAttribute('data-katex', '1');
      document.head.appendChild(link);
    }

    // Load JS if not available
    if (typeof (window as any).katex !== 'undefined') {
      katexLoaded = true;
      return true;
    }

    if (document.querySelector('script[data-katex]')) {
      // Already loading
      return new Promise(resolve => {
        const check = setInterval(() => {
          if (typeof (window as any).katex !== 'undefined') {
            clearInterval(check);
            katexLoaded = true;
            resolve(true);
          }
        }, 100);
      });
    }

    return new Promise(resolve => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js';
      script.setAttribute('data-katex', '1');
      script.onload = () => {
        katexLoaded = true;
        resolve(true);
      };
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }

  // Fix LaTeX formulas mangled by Astro's markdown processor:
  // - Browser auto-decodes &#x26; → & (column separator), but belt-and-suspenders
  // - remark treats \\ at end of line as hard break, eating one backslash.
  //   Single \ before newline or end-of-string → double \\ (row separator).
  function fixMathText(tex: string): string {
    return tex
      .replace(/&#x26;/g, '&')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\\(?=\s*\n)/g, '\\\\')   // \ at end of line → \\
      .replace(/\\$/g, '\\\\');           // \ at end of string → \\
  }

  async function renderMathIn(container: HTMLElement) {
    const katex = (window as any).katex;
    if (!katex) return;

    // Walk text nodes
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        // Skip already-rendered math, code blocks
        if (parent.closest('.katex, .katex-display, pre, code, script, style')) {
          return NodeFilter.FILTER_REJECT;
        }
        // Skip text nodes without $ signs
        if (!node.textContent?.includes('$')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const textNodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
      textNodes.push(node as Text);
    }

    for (const textNode of textNodes) {
      const text = textNode.textContent || '';
      if (!text.includes('$$') && !text.match(/\$(.+?)\$/)) continue;

      const frag = document.createDocumentFragment();
      let remaining = text;

      while (remaining.length > 0) {
        const displayIdx = remaining.indexOf('$$');
        const inlineMatch = remaining.match(/\$(.+?)\$/);

        let nextMatchType: 'none' | 'display' | 'inline' = 'none';
        let matchIdx = -1;
        let matchLength = 0;

        if (displayIdx >= 0) {
          const end = remaining.indexOf('$$', displayIdx + 2);
          if (end > displayIdx) {
            nextMatchType = 'display';
            matchIdx = displayIdx;
            matchLength = end - displayIdx + 2;
          }
        }

        if (inlineMatch && inlineMatch.index !== undefined) {
          const inIdx = inlineMatch.index;
          if (nextMatchType === 'none' || inIdx < matchIdx) {
            // Make sure it's not inside a display block
            if (!(displayIdx >= 0 && inIdx > displayIdx && inIdx < remaining.indexOf('$$', displayIdx + 2))) {
              nextMatchType = 'inline';
              matchIdx = inIdx;
              matchLength = inlineMatch[0].length;
            }
          }
        }

        if (nextMatchType === 'none') {
          frag.appendChild(document.createTextNode(remaining));
          break;
        }

        // Add text before the math
        if (matchIdx > 0) {
          frag.appendChild(document.createTextNode(remaining.slice(0, matchIdx)));
        }

        const mathContent = remaining.slice(matchIdx, matchIdx + matchLength);
        try {
          if (nextMatchType === 'display') {
            const formula = fixMathText(mathContent.slice(2, -2).trim());
            if (formula) {
              const span = document.createElement('span');
              katex.render(formula, span, { displayMode: true, throwOnError: false });
              frag.appendChild(span);
            }
          } else {
            const formula = fixMathText(mathContent.slice(1, -1).trim());
            if (formula) {
              const span = document.createElement('span');
              katex.render(formula, span, { displayMode: false, throwOnError: false });
              frag.appendChild(span);
            }
          }
        } catch {
          frag.appendChild(document.createTextNode(mathContent));
        }

        remaining = remaining.slice(matchIdx + matchLength);
      }

      if (frag.childNodes.length > 0) {
        textNode.replaceWith(frag);
      }
    }
  }

  onMount(async () => {
    const ok = await loadKaTeX();
    if (!ok) return;

    // Small delay to let content render
    const container = document.getElementById(containerId);
    if (container) {
      setTimeout(() => renderMathIn(container), 100);
    }

    // Re-render on URL changes (SPA navigation)
    // Also listen for theme changes to NOT re-render (KaTeX is theme-independent)
  });
</script>
