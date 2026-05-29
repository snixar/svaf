<script lang="ts">
  import { onMount, tick } from 'svelte';

  export interface PostMeta {
    title: string;
    slug: string;
    description: string;
    published: string;
    dir: string;
    image: string;
    pinned: boolean;
    draft: boolean;
  }

  export interface PostData {
    meta: PostMeta;
    body: string;
    fileSha?: string;
  }

  interface Props {
    mode: 'new' | 'edit';
    initialData: PostData | null;
    onPublish: (data: PostData) => Promise<void>;
    onDelete: () => Promise<void>;
  }

  let { mode, initialData, onPublish, onDelete }: Props = $props();

  let meta = $state<PostMeta>({
    title: '',
    slug: '',
    description: '',
    published: new Date().toISOString().split('T')[0],
    dir: '未分类',
    image: '',
    pinned: false,
    draft: false,
  });
  let body = $state('');
  let fileSha = $state<string | undefined>();
  let showPreview = $state(false);
  let saving = $state(false);
  let deleting = $state(false);
  let statusMessage = $state('');
  let statusError = $state('');
  let textareaEl = $state<HTMLTextAreaElement>();

  onMount(() => {
    if (initialData) {
      meta = { ...initialData.meta };
      body = initialData.body;
      fileSha = initialData.fileSha;
    }
  });

  function generateSlug() {
    if (mode === 'edit') return;
    meta.slug = meta.title
      .toLowerCase()
      .replace(/[\s　]+/g, '-')
      .replace(/[^\w\-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function buildFrontmatter(fields: Record<string, unknown>): string {
    let out = '---\n';
    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined || value === null || value === '' || value === false) continue;
      if (key === 'pinned') { out += 'pinned: true\n'; continue; }
      if (key === 'draft') { out += 'draft: true\n'; continue; }
      out += `${key}: "${value}"\n`;
    }
    out += '---\n\n';
    return out;
  }

  function buildMarkdown(): string {
    return buildFrontmatter({
      title: meta.title,
      description: meta.description,
      published: meta.published,
      dir: meta.dir,
      image: meta.image,
      pinned: meta.pinned || undefined,
      draft: meta.draft || undefined,
    }) + body;
  }

  async function handlePublish(draft: boolean) {
    statusError = '';
    statusMessage = '';
    saving = true;
    try {
      meta.draft = draft;
      if (!meta.slug) generateSlug();
      await onPublish({ meta: { ...meta }, body: buildMarkdown(), fileSha });
      statusMessage = draft ? '草稿已保存' : '文章已发布！GitHub 正在部署...';
    } catch (e) {
      statusError = e instanceof Error ? e.message : '发布失败';
    } finally {
      saving = false;
    }
  }

  async function handleDelete() {
    if (!confirm('确定要删除这篇文章吗？此操作不可撤销。')) return;
    statusError = '';
    deleting = true;
    try {
      await onDelete();
      statusMessage = '文章已删除';
    } catch (e) {
      statusError = e instanceof Error ? e.message : '删除失败';
    } finally {
      deleting = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!textareaEl) return;
    const ta = textareaEl;
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = ta.selectionStart, end = ta.selectionEnd;
      body = body.substring(0, s) + '  ' + body.substring(end);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 2; });
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      insertAround('**');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      insertAround('*');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const s = ta.selectionStart, end = ta.selectionEnd;
      const sel = body.substring(s, end);
      body = body.substring(0, s) + `[${sel}](${sel ? 'url' : ''})` + body.substring(end);
      requestAnimationFrame(() => {
        if (sel) ta.selectionStart = ta.selectionEnd = s + sel.length + 3;
        else ta.selectionStart = ta.selectionEnd = s + 3;
      });
    }
  }

  function insertAround(wrap: string) {
    if (!textareaEl) return;
    const ta = textareaEl;
    const s = ta.selectionStart, end = ta.selectionEnd;
    const sel = body.substring(s, end);
    body = body.substring(0, s) + wrap + sel + wrap + body.substring(end);
    requestAnimationFrame(() => {
      ta.selectionStart = s + wrap.length;
      ta.selectionEnd = end + wrap.length;
    });
  }

  // Simple inline markdown → HTML renderer
  function renderMarkdown(md: string): string {
    let html = md
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-muted rounded px-1 py-0.5 text-sm">$1</code>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg max-w-full my-2" />')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline">$1</a>')
      .replace(/^---$/gm, '<hr class="border-border my-4" />')
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-primary pl-4 italic text-muted-foreground">$1</blockquote>')
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-muted rounded-lg p-4 overflow-x-auto"><code>$2</code></pre>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      .replace(/\n\n+/g, '</p><p>');

    html = html.replace(/((?:<li>.*?<\/li>\s*)+)/g, '<ul class="list-disc pl-5 space-y-1 my-2">$1</ul>');
    if (!html.startsWith('<')) html = '<p>' + html;
    if (!html.endsWith('>')) html += '</p>';
    return html;
  }
</script>

<div class="flex flex-col lg:flex-row gap-6">
  <!-- Sidebar: Meta fields -->
  <div class="lg:w-80 flex-shrink-0 space-y-4">
    <div class="bg-card border border-border rounded-lg p-4 space-y-3">
      <h3 class="font-semibold text-sm">文章元数据</h3>
      <div>
        <label class="text-xs text-muted-foreground">标题 *</label>
        <input type="text" bind:value={meta.title} onblur={generateSlug} placeholder="文章标题"
          class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-ring mt-1" />
      </div>
      <div>
        <label class="text-xs text-muted-foreground">Slug *</label>
        <input type="text" bind:value={meta.slug} placeholder="article-slug" disabled={mode === 'edit'}
          class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-ring mt-1 disabled:opacity-50" />
      </div>
      <div>
        <label class="text-xs text-muted-foreground">描述</label>
        <textarea bind:value={meta.description} rows={2} placeholder="文章摘要..."
          class="w-full rounded-md border border-input bg-background px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-ring mt-1 resize-none"></textarea>
      </div>
      <div>
        <label class="text-xs text-muted-foreground">发布日期</label>
        <input type="date" bind:value={meta.published}
          class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-ring mt-1" />
      </div>
      <div>
        <label class="text-xs text-muted-foreground">目录</label>
        <input type="text" bind:value={meta.dir} placeholder="技术 / 生活 / 未分类"
          class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-ring mt-1" />
      </div>
      <div>
        <label class="text-xs text-muted-foreground">封面图 URL</label>
        <input type="text" bind:value={meta.image} placeholder="https://..."
          class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-ring mt-1" />
      </div>
      <div class="flex items-center gap-6">
        <label class="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" bind:checked={meta.pinned} class="rounded" /> 置顶
        </label>
        <label class="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" bind:checked={meta.draft} class="rounded" /> 草稿
        </label>
      </div>
    </div>

    <div class="bg-card border border-border rounded-lg p-4 space-y-2">
      <button onclick={() => handlePublish(true)} disabled={saving || !meta.title}
        class="w-full h-10 rounded-md border text-sm font-medium hover:bg-accent disabled:opacity-50 transition-colors">
        {saving ? '保存中...' : '保存草稿'}
      </button>
      <button onclick={() => handlePublish(false)} disabled={saving || !meta.title}
        class="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
        {saving ? '发布中...' : '发布文章'}
      </button>
      {#if mode === 'edit'}
        <button onclick={handleDelete} disabled={deleting}
          class="w-full h-10 rounded-md border border-red-500/30 text-red-500 text-sm font-medium hover:bg-red-500/10 disabled:opacity-50 transition-colors">
          {deleting ? '删除中...' : '删除文章'}
        </button>
      {/if}
    </div>

    {#if statusMessage}
      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-sm text-green-600 dark:text-green-400">{statusMessage}</div>
    {/if}
    {#if statusError}
      <div class="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-500">{statusError}</div>
    {/if}
  </div>

  <!-- Main: Editor + Preview -->
  <div class="flex-1 space-y-4">
    <div class="flex items-center gap-2">
      <button onclick={() => showPreview = false}
        class="px-3 py-1.5 text-sm rounded-md {!showPreview ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent'} transition-colors">编辑</button>
      <button onclick={() => showPreview = true}
        class="px-3 py-1.5 text-sm rounded-md {showPreview ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent'} transition-colors">预览</button>
    </div>

    {#if showPreview}
      <div class="prose prose-neutral dark:prose-invert max-w-none bg-card border border-border rounded-lg p-6 min-h-[400px]">
        {#if body}
          {@html renderMarkdown(body)}
        {:else}
          <p class="text-muted-foreground italic">输入 Markdown 内容后此处显示预览</p>
        {/if}
      </div>
    {:else}
      <textarea
        bind:value={body}
        bind:this={textareaEl}
        placeholder="## 开始写文章...&#10;&#10;支持 Markdown 语法"
        onkeydown={handleKeydown}
        class="w-full h-[500px] rounded-lg border border-input bg-background p-4 text-sm font-mono resize-none outline-none focus:ring-1 focus:ring-ring"
      ></textarea>
    {/if}
  </div>
</div>
