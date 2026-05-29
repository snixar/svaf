<script lang="ts">
  import { onMount } from 'svelte';

  onMount(() => {
    // Defer loading Motion One until needed
    initAnimations();
  });

  async function initAnimations() {
    try {
      const { animate, inView, stagger, spring } = await import('@motionone/dom');

      // Fade in + slide up
      inView('[data-mo-fade-in-up]', (el) => {
        animate(el,
          { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0px)'] },
          { duration: 0.5, delay: 0, easing: spring() }
        );
      });

      // Fade in only
      inView('[data-mo-fade-in]', (el) => {
        animate(el,
          { opacity: [0, 1] },
          { duration: 0.5, delay: 0 }
        );
      });

      // Stagger children (list items appearing one by one)
      inView('.mo-stagger', (el) => {
        const children = Array.from(el.children) as HTMLElement[];
        animate(children,
          { opacity: [0, 1], transform: ['translateY(15px)', 'translateY(0px)'] },
          { duration: 0.4, delay: stagger(0.1), easing: spring() }
        );
      });

      // Slide in from left
      inView('[data-mo-slide-left]', (el) => {
        animate(el,
          { opacity: [0, 1], transform: ['translateX(-30px)', 'translateX(0px)'] },
          { duration: 0.5, delay: 0, easing: spring() }
        );
      });

      // Slide in from right
      inView('[data-mo-slide-right]', (el) => {
        animate(el,
          { opacity: [0, 1], transform: ['translateX(30px)', 'translateX(0px)'] },
          { duration: 0.5, delay: 0, easing: spring() }
        );
      });

      // Pop in (scale)
      inView('[data-mo-pop-in]', (el) => {
        animate(el,
          { opacity: [0, 1], transform: ['scale(0.8)', 'scale(1)'] },
          { duration: 0.5, delay: 0, easing: spring({ stiffness: 300, damping: 20 }) }
        );
      });
    } catch {}
  }
</script>
