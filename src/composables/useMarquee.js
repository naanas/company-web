import { onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'

/**
 * Infinite horizontal marquee. Expects `trackRef` to contain the marquee
 * content duplicated twice as siblings (see MarqueeSection.vue) — the tween
 * simply slides the whole track left by one copy's width, then snaps back
 * to 0, which reads as a seamless loop.
 */
export function useMarquee(trackRef, { speed = 40, direction = -1 } = {}) {
  let tween = null
  let ctx = null

  onMounted(() => {
    if (!trackRef.value) return

    ctx = gsap.context(() => {
      const track = trackRef.value
      const distance = track.scrollWidth / 2

      tween = gsap.fromTo(
        track,
        { x: direction > 0 ? -distance : 0 },
        {
          x: direction > 0 ? 0 : -distance,
          duration: distance / speed,
          ease: 'none',
          repeat: -1,
        }
      )

      track.addEventListener('mouseenter', () => tween.timeScale(0.25))
      track.addEventListener('mouseleave', () => tween.timeScale(1))
    })
  })

  onBeforeUnmount(() => {
    ctx?.revert()
    tween?.kill()
  })
}
