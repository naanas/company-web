import { onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Lights up one word at a time as the page scrolls past `triggerRef` —
 * the "big paragraph that reveals word by word" effect. Each `[data-word]`
 * element inside `wordsRef` starts dim and brightens in sequence, scrubbed
 * directly to scroll position (not a fire-once reveal).
 */
export function useWordsScrub(triggerRef, wordsRef, { start = 'top 70%', end = 'bottom 60%' } = {}) {
  let trigger = null

  onMounted(() => {
    if (!triggerRef.value || !wordsRef.value) return

    const words = wordsRef.value.querySelectorAll('[data-word]')
    if (!words.length) return

    const tween = gsap.fromTo(
      words,
      { opacity: 0.15 },
      {
        opacity: 1,
        stagger: 0.5,
        ease: 'none',
        scrollTrigger: {
          trigger: triggerRef.value,
          start,
          end,
          scrub: 0.5,
        },
      }
    )

    trigger = tween.scrollTrigger
  })

  onBeforeUnmount(() => {
    trigger?.kill()
  })
}
