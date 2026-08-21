import { onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { whenIdle } from './useIdle'

gsap.registerPlugin(ScrollTrigger)

/**
 * Animates a number from 0 up to `value` once the element scrolls into
 * view. Renders through `el.textContent` directly (not reactive state)
 * since this only ever runs once per page view and avoids re-render churn
 * on every tick.
 */
export function useCountUp(elRef, { value = 0, duration = 1.6, decimals = 0, prefix = '', suffix = '' } = {}) {
  let trigger = null
  let alive = true

  onMounted(() => {
    // Deferred to idle time along with the rest of this (below-the-fold)
    // section's setup — see useIdle.js.
    whenIdle(() => {
      if (!alive || !elRef.value) return

      const counter = { n: 0 }
      const tween = gsap.to(counter, {
        n: value,
        duration,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: elRef.value,
          start: 'top 85%',
          once: true,
        },
        onUpdate: () => {
          elRef.value.textContent = `${prefix}${counter.n.toFixed(decimals)}${suffix}`
        },
      })

      trigger = tween.scrollTrigger
    })
  })

  onBeforeUnmount(() => {
    alive = false
    trigger?.kill()
  })
}
