<script lang="ts">
  import { onMount } from 'svelte';
  import PhotoSwipeLightbox from 'photoswipe/lightbox';
  import 'photoswipe/style.css';

  onMount(() => {
    const lightbox = new PhotoSwipeLightbox({
      gallery: '.prose',
      children: 'img',
      pswpModule: () => import('photoswipe'),
    });
    lightbox.init();

    return () => {
      lightbox.destroy();
    };
  });
</script>
