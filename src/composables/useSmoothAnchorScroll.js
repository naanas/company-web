import { onMounted, onBeforeUnmount } from 'vue'
import { lenisScrollTo } from './useLenis'

const NAV_OFFSET = 76

/**
 * Intercepts clicks on same-page `#anchor` links and animates the scroll
 * through the shared Lenis instance instead of an instant jump, offsetting
 * for the fixed navbar. Deliberately does NOT use GSAP's ScrollToPlugin —
 * Lenis owns the scroll position once it's active, so a second tween
 * driving `window.scrollTo` underneath it would fight Lenis's own easing
 * and produce a stutter instead of a single smooth motion.
 */
export function useSmoothAnchorScroll() {
  function onClick(event) {
    const link = event.target.closest('a[href^="#"]')
    if (!link) return

    const id = link.getAttribute('href')
    if (!id || id.length < 2) return

    const target = document.querySelector(id)
    if (!target) return

    event.preventDefault()
    lenisScrollTo(target, { offset: -NAV_OFFSET, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 3) })
  }

  onMounted(() => document.addEventListener('click', onClick))
  onBeforeUnmount(() => document.removeEventListener('click', onClick))
}
