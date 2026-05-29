<script lang="ts">
  interface PostInfo {
    slug: string;
    dir: string;
  }

  interface Props {
    posts: PostInfo[];
    onNew: () => void;
    onEdit: (slug: string) => void;
    onRefresh: () => void;
  }

  let { posts, onNew, onEdit, onRefresh }: Props = $props();

  let confirmDelete = $state<string | null>(null);
</script>

<div>
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold">文章管理</h1>
    <div class="flex gap-2">
      <button onclick={onRefresh} class="px-3 py-1.5 text-sm rounded-md border hover:bg-accent transition-colors">刷新</button>
      <button onclick={onNew} class="px-4 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity">+ 新建文章</button>
    </div>
  </div>

  {#if posts.length === 0}
    <div class="text-center py-16">
      <p class="text-muted-foreground mb-4">暂无文章</p>
      <button onclick={onNew} class="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity">创建第一篇文章</button>
    </div>
  {:else}
    <div class="bg-card border border-border rounded-lg overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-muted/50 border-b border-border">
          <tr>
            <th class="text-left px-4 py-3 font-medium text-muted-foreground">Slug</th>
            <th class="text-left px-4 py-3 font-medium text-muted-foreground">操作</th>
          </tr>
        </thead>
        <tbody>
          {#each posts as post (post.slug)}
            <tr class="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
              <td class="px-4 py-3">
                <span class="font-medium">{post.slug}</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-3">
                  <button onclick={() => onEdit(post.slug)} class="text-primary hover:underline text-xs">编辑</button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
