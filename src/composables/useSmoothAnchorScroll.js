import { onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollToPlugin)

const NAV_OFFSET = 76

/**
 * Intercepts clicks on same-page `#anchor` links and animates the scroll
 * with GSAP instead of an instant jump, offsetting for the fixed navbar.
 * Works alongside ScrollTrigger — it only tweens window scroll position,
 * which ScrollTrigger already listens to, so pinned/scrubbed sections
 * (e.g. the Hero video) stay in sync automatically.
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
    gsap.to(window, {
      duration: 1.1,
      ease: 'power2.inOut',
      scrollTo: { y: target, offsetY: NAV_OFFSET },
    })
  }

  onMounted(() => document.addEventListener('click', onClick))
  onBeforeUnmount(() => document.removeEventListener('click', onClick))
}
