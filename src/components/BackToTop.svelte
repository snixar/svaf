<script lang="ts">
  let scrollY = $state(0);
  let showButton = $derived(scrollY > 100);
  let isPostPage = $state(false);

  $effect(() => {
    isPostPage = /^\/posts\/[^/]+\/$/.test(window.location.pathname);
  });

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function scrollToComments() {
    const el = document.getElementById('comments');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  $effect(() => {
    function handleScroll() {
      scrollY = window.scrollY;
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  });
</script>

<div class="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
  {#if isPostPage}
    <div class="transition-all {showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}">
      <button
        onclick={scrollToComments}
        aria-label="跳转到评论区"
        class="size-12 shadow-lg hover:shadow-xl bg-white text-black dark:bg-black dark:text-white border-2 border-border rounded-lg inline-flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </button>
    </div>
  {/if}
  {#if showButton}
    <div>
      <button
        onclick={scrollToTop}
        aria-label="回到顶部"
        class="size-12 shadow-lg hover:shadow-xl bg-white text-black dark:bg-black dark:text-white border-2 border-border rounded-lg inline-flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
      </button>
    </div>
  {/if}
</div>
