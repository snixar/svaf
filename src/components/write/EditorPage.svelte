<script lang="ts">
  import { onMount } from 'svelte';
  import AuthGuard from './AuthGuard.svelte';
  import EditorForm from './EditorForm.svelte';
  import ArticleList from './ArticleList.svelte';
  import type { PostData } from './EditorForm.svelte';
  import {
    findPostBySlug,
    listPostSlugs,
    decodeContent,
    createOrUpdateFile,
    deleteFile,
  } from '../../lib/github-api.ts';

  let authedToken = $state('');
  let loading = $state(true);
  let error = $state('');

  // Routing state
  let view = $state<'list' | 'editor'>('list');
  let editMode = $state<'new' | 'edit'>('new');
  let editSlug = $state('');
  let editData = $state<PostData | null>(null);
  let postsList = $state<Array<{ slug: string; dir: string }>>([]);

  function onAuth(token: string) {
    authedToken = token;
    loadPostsList();
    checkRoute();
  }

  function checkRoute() {
    const params = new URLSearchParams(window.location.search);
    const edit = params.get('edit');
    const isNew = params.has('new');

    if (edit) {
      view = 'editor';
      editMode = 'edit';
      editSlug = edit;
      loadPostForEdit(edit);
    } else if (isNew) {
      view = 'editor';
      editMode = 'new';
      editSlug = '';
      editData = null;
    } else {
      view = 'list';
    }
  }

  async function loadPostsList() {
    try {
      postsList = await listPostSlugs();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load posts';
    } finally {
      loading = false;
    }
  }

  async function loadPostForEdit(slug: string) {
    loading = true;
    try {
      const file = await findPostBySlug(slug);
      if (!file) {
        error = `文章 "${slug}" 未找到`;
        view = 'list';
        return;
      }
      const raw = decodeContent(file);
      // Parse frontmatter
      const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
      let metaFields: Record<string, unknown> = {};
      let bodyContent = raw;
      if (match) {
        const yaml = match[1];
        bodyContent = match[2]?.trim() || '';
        for (const line of yaml.split('\n')) {
          const m = line.match(/^(\w+):\s*["']?(.*)["']?\s*$/);
          if (m) {
            const key = m[1];
            let val: unknown = m[2].replace(/['"]$/, '');
            if (key === 'pinned' || key === 'draft') val = val === 'true';
            metaFields[key] = val;
          }
        }
      }
      editData = {
        meta: {
          title: (metaFields.title as string) || '',
          slug,
          description: (metaFields.description as string) || '',
          published: (metaFields.published as string) || new Date().toISOString().split('T')[0],
          dir: (metaFields.dir as string) || '未分类',
          image: (metaFields.image as string) || '',
          pinned: (metaFields.pinned as boolean) || false,
          draft: (metaFields.draft as boolean) || false,
        },
        body: bodyContent,
        fileSha: file.sha,
      };
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load post';
    } finally {
      loading = false;
    }
  }

  function navigateToList() {
    view = 'list';
    history.replaceState(null, '', '/write');
    loadPostsList();
  }

  function navigateToNew() {
    view = 'editor';
    editMode = 'new';
    editSlug = '';
    editData = null;
    history.replaceState(null, '', '/write?new');
  }

  function navigateToEdit(slug: string) {
    history.replaceState(null, '', `/write?edit=${slug}`);
    editMode = 'edit';
    editSlug = slug;
    editData = null;
    view = 'editor';
    loadPostForEdit(slug);
  }

  async function handlePublish(data: PostData) {
    const slug = data.meta.slug;
    const path = `src/content/posts/${slug}/index.md`;
    const isEdit = editMode === 'edit' && data.fileSha;

    // Parse frontmatter from the combined markdown to separate meta from body
    // Actually data.body already has frontmatter + body combined from buildMarkdown()
    await createOrUpdateFile(
      path,
      data.body,
      `${isEdit ? 'Update' : 'Add'} post: ${data.meta.title}`,
      isEdit ? data.fileSha : null,
    );
  }

  async function handleDelete() {
    const slug = editSlug;
    const file = await findPostBySlug(slug);
    if (!file) throw new Error('Article not found');
    await deleteFile(
      file.path,
      file.sha,
      `Delete post: ${slug}`,
    );
    navigateToList();
  }
</script>

<AuthGuard {onAuth} />

<div class="container mx-auto max-w-6xl px-4 py-8 mt-4">
  {#if !authedToken}
    <div class="text-center py-12 text-muted-foreground">请先输入 GitHub Token</div>
  {:else if loading && view === 'editor'}
    <div class="text-center py-12 text-muted-foreground">加载中...</div>
  {:else if error}
    <div class="text-center py-12">
      <p class="text-red-500">{error}</p>
      <button onclick={() => { error = ''; navigateToList(); }} class="mt-4 text-sm text-primary underline">返回列表</button>
    </div>
  {:else if view === 'list'}
    <ArticleList
      posts={postsList}
      onNew={navigateToNew}
      onEdit={navigateToEdit}
      onRefresh={loadPostsList}
    />
  {:else if view === 'editor'}
    <div class="mb-4">
      <button onclick={navigateToList} class="text-sm text-muted-foreground hover:text-foreground transition-colors">&larr; 返回文章列表</button>
    </div>
    <EditorForm
      mode={editMode}
      initialData={editData}
      onPublish={handlePublish}
      onDelete={handleDelete}
    />
  {/if}
</div>
