<script lang="ts">
  import { siteConfig } from '../lib/config/site';

  interface Post {
    slug: string;
    title: string;
    description: string;
    published: string;
    pinned: boolean;
    dir: string;
    image: string;
  }

  interface Props {
    encodedPosts: string;
    wordCountMap: Record<string, number>;
    totalPosts: number;
    totalWords: number;
  }

  let { encodedPosts, wordCountMap, totalPosts, totalWords }: Props = $props();

  // Decode posts from base64 (UTF-8 safe)
  function decodePosts(): Post[] {
    try {
      const binary = atob(encodedPosts);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return JSON.parse(new TextDecoder('utf-8').decode(bytes));
    } catch { return []; }
  }

  let posts = $state<Post[]>(typeof window !== 'undefined' ? decodePosts() : []);

  $effect(() => {
    posts = decodePosts();
  });

  // Read ?dir= from URL synchronously BEFORE first render to avoid flash.
  // Must be done at init time, not in $effect (which runs after render).
  function readDirFilter(): string {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('dir') || '';
  }
  let dirFilter = $state(readDirFilter());

  let searchQuery = $state('');
  let currentPage = $state(1);
  const postsPerPage = 10;

  let searchFilters = $state({
    title: true,
    description: true,
    content: true,
    path: true,
  });

  let rssPosts = $state<Array<{ title: string; link: string; description: string; date: string; content: string }>>([]);
  let isLoadingRSS = $state(false);
  let hasLoadedRSS = $state(false);
  let expandedCards = $state<Record<string, boolean>>({});

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  function getReadTime(wordCount: number): number {
    return Math.ceil(wordCount / 300);
  }

  // Extract content:encoded from an RSS item (handles XML namespace)
  function getContentEncoded(item: Element): string {
    // Try namespace-aware API first
    const ns = item.getElementsByTagNameNS('http://purl.org/rss/1.0/modules/content/', 'encoded');
    if (ns.length > 0) return ns[0].textContent || '';
    // Fallback: iterate children and match localName
    for (const child of item.children) {
      if (child.localName === 'encoded') return child.textContent || '';
    }
    // Last resort: try querySelector with escaped colon
    const el = item.querySelector('content\\:encoded, encoded');
    return el?.textContent || '';
  }

  async function loadRSS() {
    if (hasLoadedRSS) return;
    isLoadingRSS = true;
    try {
      const response = await fetch('/rss.xml');
      const text = await response.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');
      const items = xml.querySelectorAll('item');
      rssPosts = Array.from(items).map(item => {
        const link = item.querySelector('link')?.textContent || '';
        return {
          title: item.querySelector('title')?.textContent || '',
          link,
          description: item.querySelector('description')?.textContent || '',
          date: item.querySelector('pubDate')?.textContent || '',
          content: getContentEncoded(item),
        };
      });
    } catch {}
    hasLoadedRSS = true;
    isLoadingRSS = false;
  }

  // Preload RSS content on mount
  $effect(() => { loadRSS(); });

  function parseQueryTerms(query: string): string[] {
    const terms: string[] = [];
    const re = /"([^"]+)"|(\S+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(query)) !== null) {
      const t = (m[1] ?? m[2] ?? '').trim().toLowerCase();
      if (t) terms.push(t);
    }
    return terms;
  }

  function highlightText(text: string, query: string): string {
    const terms = parseQueryTerms(query);
    if (terms.length === 0) return text;
    const escaped = terms
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .sort((a, b) => b.length - a.length);
    const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
  }

  function getMatchedContentLines(content: string, query: string): string[] {
    const terms = parseQueryTerms(query);
    if (terms.length === 0) return [];
    const lines = content.split('\n');
    const matched: string[] = [];
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (!terms.every((t) => lower.includes(t))) continue;
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.length > 10) {
        matched.push(trimmed);
      }
    }
    return matched;
  }

  // Apply directory filter first, then search
  let dirFilteredPosts = $derived.by(() => {
    if (!dirFilter) return posts;
    return posts.filter(p => p.dir === dirFilter);
  });

  let dirWordCount = $derived.by(() => {
    if (!dirFilter) return totalWords;
    let sum = 0;
    for (const p of dirFilteredPosts) {
      sum += wordCountMap[p.slug] || 0;
    }
    return sum;
  });

  let filteredResults = $derived.by(() => {
    const source = dirFilteredPosts;

    if (!searchQuery.trim()) {
      const sorted = [...source].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.published).getTime() - new Date(a.published).getTime();
      });
      return sorted.map(p => ({ post: p, matchedLines: [] as string[] }));
    }

    const hasAnyFilter = searchFilters.title || searchFilters.description || searchFilters.content || searchFilters.path;
    if (!hasAnyFilter) return [];

    const terms = parseQueryTerms(searchQuery);
    if (terms.length === 0) return source.map(p => ({ post: p, matchedLines: [] as string[] }));

    const results: Array<{ post: Post; matchedLines: string[] }> = [];

    for (const post of source) {
      const rssPost = rssPosts.find(r => r.link.includes(post.slug));
      const title = post.title.toLowerCase();
      const desc = post.description.toLowerCase();

      const allHit = terms.every((t) => {
        return (
          (searchFilters.title && title.includes(t)) ||
          (searchFilters.description && desc.includes(t)) ||
          (searchFilters.content && rssPost?.content.toLowerCase().includes(t)) ||
          (searchFilters.path && post.slug.toLowerCase().includes(t))
        );
      });
      if (!allHit) continue;

      const titleHasAll = searchFilters.title && terms.every((t) => title.includes(t));
      const descHasAll = searchFilters.description && terms.every((t) => desc.includes(t));
      const pathHasAll = searchFilters.path && terms.every((t) => post.slug.toLowerCase().includes(t));
      const contentHasAll = searchFilters.content && rssPost && terms.every((t) => rssPost.content.toLowerCase().includes(t));

      const matchedLines = contentHasAll && !titleHasAll && !descHasAll && !pathHasAll && rssPost
        ? getMatchedContentLines(rssPost.content, searchQuery)
        : [];
      results.push({ post, matchedLines });
    }
    return results;
  });

  let totalPages = $derived(Math.ceil(filteredResults.length / postsPerPage));

  let paginatedPosts = $derived.by(() => {
    const start = (currentPage - 1) * postsPerPage;
    return filteredResults.slice(start, start + postsPerPage);
  });

  // Reset page on search change
  $effect(() => {
    searchQuery;
    searchFilters.title;
    searchFilters.description;
    searchFilters.content;
    searchFilters.path;
    currentPage = 1;
    expandedCards = {};
  });
</script>

<div>
  <!-- Header -->
  <div class="mb-12 text-center">
    {#if dirFilter}
      <h1 class="mb-4 text-4xl font-bold">{dirFilter}</h1>
      <p class="text-muted-foreground">该目录下的所有文章</p>
      <p class="mt-2 text-sm text-muted-foreground">
        共 {dirFilteredPosts.length} 篇文章 &middot; 总计 {dirWordCount.toLocaleString()} 字
      </p>
      <div class="mt-4">
        <a href="/" class="inline-flex items-center justify-center rounded-md text-sm font-medium border px-4 py-2 hover:bg-accent transition-colors">&larr; 返回文章目录</a>
      </div>
    {:else}
      <h1 class="mb-4 text-4xl font-bold">博客文章</h1>
      <p class="text-muted-foreground">分享技术、想法和经验</p>
      {#if totalWords > 0}
        <p class="mt-2 text-sm text-muted-foreground">
          共 {totalPosts} 篇文章 &middot; 总计 {totalWords.toLocaleString()} 字
        </p>
      {/if}
      <div class="mt-4">
        <a href="/" class="inline-flex items-center justify-center rounded-md text-sm font-medium border px-4 py-2 hover:bg-accent transition-colors">&larr; 返回文章目录</a>
      </div>
    {/if}
  </div>

  <!-- Search input -->
  <div class="mb-8">
    <input
      type="text"
      bind:value={searchQuery}
      onfocus={loadRSS}
      placeholder="搜索文章标题、描述或内容..."
      class="w-full h-9 rounded-4xl border border-input bg-input/30 px-3 py-1 text-base md:text-sm placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
    />

    <div class="mt-3 flex flex-wrap gap-4">
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" bind:checked={searchFilters.title} class="size-4 rounded-[6px] border-input accent-primary" />
        <span class="text-sm">标题</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" bind:checked={searchFilters.description} class="size-4 rounded-[6px] border-input accent-primary" />
        <span class="text-sm">简介</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" bind:checked={searchFilters.content} class="size-4 rounded-[6px] border-input accent-primary" />
        <span class="text-sm">正文</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" bind:checked={searchFilters.path} class="size-4 rounded-[6px] border-input accent-primary" />
        <span class="text-sm">路径</span>
      </label>
    </div>

    {#if searchQuery}
      <div class="mt-2 min-h-[20px]">
        {#if !searchFilters.title && !searchFilters.description && !searchFilters.content && !searchFilters.path}
          <p class="text-sm text-red-500">你什么都不选怎么搜啊喂！</p>
        {:else if isLoadingRSS}
          <p class="text-sm text-muted-foreground">搜索中...</p>
        {:else if filteredResults.length === 0}
          <p class="text-sm text-muted-foreground">未找到匹配的文章</p>
        {:else}
          <p class="text-sm text-muted-foreground">找到 {filteredResults.length} 篇文章</p>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Post list -->
  <div class="space-y-6">
    {#each paginatedPosts as { post, matchedLines }}
      <a href="/posts/{post.slug}/" class="block">
        <div class="group transition-all hover:shadow-lg rounded-lg border">
          <div class="p-6">
            <div class="flex flex-col gap-4 md:flex-row">
              {#if post.image}
                <div class="md:w-48 md:flex-shrink-0">
                  <img
                    src={post.image}
                    alt={post.title}
                    class="h-48 w-full rounded-md object-cover md:h-32"
                  />
                </div>
              {/if}
              <div class="flex-1">
                <div class="mb-2 flex flex-wrap items-center gap-x-2 gap-y-0">
                  {#if post.pinned}
                    <span class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold shrink-0">置顶</span>
                  {/if}
                  <time class="shrink-0 text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(post.published)}
                  </time>
                  {#if wordCountMap[post.slug]}
                    <span class="shrink-0 text-sm text-muted-foreground whitespace-nowrap">
                      · {wordCountMap[post.slug].toLocaleString()} 字
                    </span>
                    <span class="shrink-0 text-sm text-muted-foreground whitespace-nowrap">
                      · 约 {getReadTime(wordCountMap[post.slug])} 分钟
                    </span>
                  {/if}
                </div>

                <h2 class="mb-2 text-2xl font-semibold group-hover:text-primary">
                  {@html highlightText(post.title, searchQuery)}
                </h2>

                <p class="text-muted-foreground">
                  {@html highlightText(post.description, searchQuery)}
                </p>

                {#if matchedLines.length > 0}
                  {@const isExpanded = expandedCards[post.slug] ?? false}
                  {@const displayLines = isExpanded ? matchedLines : matchedLines.slice(0, 3)}
                  {@const hasMore = matchedLines.length > 3}

                  <div class="mt-3 space-y-2">
                    <div class="space-y-1 border-l-2 border-primary/30 pl-3">
                      {#each displayLines as line}
                        <button
                          type="button"
                          onclick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(`/posts/${post.slug}/?highlight=${encodeURIComponent(searchQuery)}`, '_blank');
                          }}
                          class="block w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <span class="inline-flex items-start gap-1.5">
                            <span class="opacity-50 mt-0.5 flex-shrink-0">→</span>
                            <span>{@html highlightText(line, searchQuery)}</span>
                          </span>
                        </button>
                      {/each}
                    </div>

                    {#if hasMore}
                      <button
                        type="button"
                        onclick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          expandedCards[post.slug] = !isExpanded;
                        }}
                        class="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        {isExpanded ? '收起' : `展开 (还有 ${matchedLines.length - 3} 行)`}
                      </button>
                    {/if}
                  </div>
                {/if}
              </div>
            </div>
          </div>
        </div>
      </a>
    {/each}
  </div>

  {#if paginatedPosts.length === 0 && !searchQuery}
    <div class="py-12 text-center">
      <p class="text-muted-foreground">暂无文章</p>
    </div>
  {/if}

  <!-- Pagination -->
  {#if totalPages > 1}
    <div class="mt-8 flex flex-col items-center gap-4">
      <div class="flex items-center gap-1">
        <button
          disabled={currentPage === 1}
          onclick={() => currentPage = Math.max(1, currentPage - 1)}
          class="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm border hover:bg-accent disabled:opacity-50 disabled:pointer-events-none transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
          <span class="hidden sm:inline">上一页</span>
        </button>

        {#each Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
          const p = i + 1;
          return p;
        }) as page}
          <button
            onclick={() => currentPage = page}
            class="inline-flex items-center justify-center rounded-md w-9 h-9 text-sm border hover:bg-accent transition-colors {page === currentPage ? 'bg-primary text-primary-foreground border-primary' : ''}"
          >
            {page}
          </button>
        {/each}

        <button
          disabled={currentPage === totalPages}
          onclick={() => currentPage = Math.min(totalPages, currentPage + 1)}
          class="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm border hover:bg-accent disabled:opacity-50 disabled:pointer-events-none transition-colors"
        >
          <span class="hidden sm:inline">下一页</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      <div class="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>共 {totalPages} 页 / {filteredResults.length} 个，跳至</span>
        <input
          type="number"
          min="1"
          max={totalPages}
          class="h-7 w-14 rounded border bg-transparent px-1.5 text-center text-foreground outline-none focus:ring-1 focus:ring-primary"
          onkeydown={(e) => {
            if (e.key === 'Enter') {
              const v = Math.max(1, Math.min(totalPages, Number((e.target as HTMLInputElement).value)));
              if (!isNaN(v)) currentPage = v;
            }
          }}
        />
        <span>页</span>
      </div>
    </div>
  {/if}
</div>
