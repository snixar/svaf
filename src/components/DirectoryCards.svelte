<script lang="ts">
  interface DirInfo {
    name: string;
    count: number;
  }

  interface Props {
    encodedDirs: string;
    totalPosts: number;
  }

  let { encodedDirs, totalPosts }: Props = $props();

  function decode(): DirInfo[] {
    try {
      const binary = atob(encodedDirs);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return JSON.parse(new TextDecoder('utf-8').decode(bytes));
    } catch { return []; }
  }

  let directories = $state<DirInfo[]>(decode());
</script>

<div class="container mx-auto max-w-4xl px-4 py-12">
  <div class="mb-12 text-center">
    <h1 class="mb-4 text-4xl font-bold">《snixar blog》</h1>
    {#if directories.length > 0}
      <p class="text-muted-foreground">共 {totalPosts} 篇文章，{directories.length} 个目录</p>
    {:else}
      <p class="text-muted-foreground">暂无文章</p>
    {/if}
  </div>

  {#if directories.length > 0}
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each directories as dir}
        <a
          href={`/posts/?dir=${encodeURIComponent(dir.name)}`}
          class="group flex items-center gap-4 rounded-lg border p-6 transition-all hover:border-primary hover:shadow-md"
        >
          <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="truncate text-lg font-semibold group-hover:text-primary">{dir.name}</h2>
            <p class="text-sm text-muted-foreground">{dir.count} 篇文章</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5 text-muted-foreground group-hover:text-primary">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </a>
      {/each}
    </div>
  {/if}
</div>
